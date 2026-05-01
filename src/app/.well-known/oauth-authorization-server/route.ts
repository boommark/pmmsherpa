/**
 * RFC 8414 — OAuth 2.0 Authorization Server Metadata.
 *
 * Discovery doc that points MCP clients at /api/mcp/oauth/{authorize,token,register}.
 * `jwks_uri` points at Supabase's own JWKs because we hand the client a
 * Supabase-signed access_token directly (no separate signing identity).
 */

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') ??
    'https://pmmsherpa.com'
  )
}

export async function GET() {
  const base = appUrl()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '')

  return NextResponse.json(
    {
      issuer: base,
      authorization_endpoint: `${base}/api/mcp/oauth/authorize`,
      token_endpoint: `${base}/api/mcp/oauth/token`,
      registration_endpoint: `${base}/api/mcp/oauth/register`,
      jwks_uri: supabaseUrl
        ? `${supabaseUrl}/auth/v1/.well-known/jwks.json`
        : undefined,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
      scopes_supported: ['mcp:read', 'mcp:query', 'offline_access'],
      service_documentation: `${base}/docs/mcp`,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}
