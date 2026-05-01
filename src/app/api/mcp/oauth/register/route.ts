/**
 * RFC 7591 — OAuth 2.0 Dynamic Client Registration (DCR).
 *
 * Minimal stub for Phase 1: accepts a JSON registration request, generates
 * a public `client_id` (no secret — public clients use PKCE), and stores it
 * in `mcp_clients`. CIMD (Client ID Metadata Documents) is deferred to
 * Phase 2 per spec section §7 open question 1.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateOpaqueCode } from '@/lib/mcp/pkce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RegistrationRequest {
  client_name?: unknown
  redirect_uris?: unknown
  grant_types?: unknown
  response_types?: unknown
  scope?: unknown
  token_endpoint_auth_method?: unknown
}

function badMetadata(description: string) {
  return NextResponse.json(
    { error: 'invalid_client_metadata', error_description: description },
    { status: 400 },
  )
}

export async function POST(req: NextRequest) {
  let body: RegistrationRequest
  try {
    body = (await req.json()) as RegistrationRequest
  } catch {
    return badMetadata('request body must be valid JSON')
  }

  const clientName =
    typeof body.client_name === 'string' && body.client_name.trim().length > 0
      ? body.client_name.trim().slice(0, 200)
      : 'Unnamed MCP Client'

  if (!Array.isArray(body.redirect_uris) || body.redirect_uris.length === 0) {
    return badMetadata('redirect_uris must be a non-empty array')
  }
  const redirectUris: string[] = []
  for (const uri of body.redirect_uris) {
    if (typeof uri !== 'string' || uri.length === 0) {
      return badMetadata('redirect_uris entries must be non-empty strings')
    }
    try {
      const u = new URL(uri)
      // Accept http(s) and custom schemes (e.g., claude://, cursor://).
      if (!u.protocol) return badMetadata('redirect_uri missing protocol')
    } catch {
      return badMetadata(`redirect_uri is not a valid URI: ${uri}`)
    }
    redirectUris.push(uri)
  }

  const grantTypes =
    Array.isArray(body.grant_types) && body.grant_types.length > 0
      ? body.grant_types.filter((g): g is string => typeof g === 'string')
      : ['authorization_code', 'refresh_token']

  const responseTypes =
    Array.isArray(body.response_types) && body.response_types.length > 0
      ? body.response_types.filter((r): r is string => typeof r === 'string')
      : ['code']

  const scope =
    typeof body.scope === 'string' && body.scope.trim().length > 0
      ? body.scope.trim()
      : 'mcp:read mcp:query offline_access'

  const tokenEndpointAuthMethod =
    typeof body.token_endpoint_auth_method === 'string'
      ? body.token_endpoint_auth_method
      : 'none'

  if (tokenEndpointAuthMethod !== 'none') {
    return badMetadata(
      'only token_endpoint_auth_method=none (public clients with PKCE) is supported',
    )
  }

  const clientId = `mcp_${generateOpaqueCode()}`
  const issuedAt = Math.floor(Date.now() / 1000)

  const service = await createServiceClient()
  const { error } = await service
    .from('mcp_clients' as never)
    .insert({
      client_id: clientId,
      client_name: clientName,
      redirect_uris: redirectUris,
      grant_types: grantTypes,
      response_types: responseTypes,
      scope,
      token_endpoint_auth_method: tokenEndpointAuthMethod,
    } as never)

  if (error) {
    console.error('[mcp/register] insert failed', error)
    return NextResponse.json(
      { error: 'server_error', error_description: 'failed to persist client' },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      client_id: clientId,
      client_id_issued_at: issuedAt,
      client_name: clientName,
      redirect_uris: redirectUris,
      grant_types: grantTypes,
      response_types: responseTypes,
      scope,
      token_endpoint_auth_method: tokenEndpointAuthMethod,
    },
    {
      status: 201,
      headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' },
    },
  )
}
