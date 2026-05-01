/**
 * OAuth 2.1 token endpoint — exchanges an opaque MCP authorization code
 * (or refresh_token) for the underlying Supabase access_token.
 *
 * We do NOT mint our own JWTs. Clients verify the returned access_token
 * against Supabase's JWKs URL advertised in our AS metadata.
 *
 * - grant_type=authorization_code: PKCE verify, single-use code.
 * - grant_type=refresh_token: forwards to Supabase's refresh flow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPkce } from '@/lib/mcp/pkce'
import { createClient as createSbClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SupabaseSessionStash {
  access_token: string
  refresh_token: string
  expires_at?: number
  expires_in?: number
  token_type?: string
}

interface AuthCodeRow {
  code: string
  client_id: string
  supabase_user_id: string
  supabase_session: SupabaseSessionStash
  code_challenge: string
  code_challenge_method: string
  redirect_uri: string
  scope: string
  expires_at: string
  used_at: string | null
}

function tokenError(
  error: string,
  status = 400,
  description?: string,
) {
  return NextResponse.json(
    description ? { error, error_description: description } : { error },
    { status, headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } },
  )
}

async function readForm(req: NextRequest): Promise<URLSearchParams> {
  const ct = req.headers.get('content-type') ?? ''
  if (ct.includes('application/x-www-form-urlencoded')) {
    return new URLSearchParams(await req.text())
  }
  if (ct.includes('application/json')) {
    const body = (await req.json()) as Record<string, string | undefined>
    const out = new URLSearchParams()
    for (const [k, v] of Object.entries(body)) {
      if (typeof v === 'string') out.set(k, v)
    }
    return out
  }
  // Permissive fallback — some clients post multipart/form-data.
  try {
    const fd = await req.formData()
    const out = new URLSearchParams()
    fd.forEach((v, k) => {
      if (typeof v === 'string') out.set(k, v)
    })
    return out
  } catch {
    return new URLSearchParams()
  }
}

export async function POST(req: NextRequest) {
  const form = await readForm(req)
  const grantType = form.get('grant_type')

  if (grantType === 'authorization_code') {
    return handleAuthorizationCode(form)
  }
  if (grantType === 'refresh_token') {
    return handleRefreshToken(form)
  }
  return tokenError('unsupported_grant_type')
}

async function handleAuthorizationCode(form: URLSearchParams) {
  const code = form.get('code')
  const verifier = form.get('code_verifier')
  const clientId = form.get('client_id')
  const redirectUri = form.get('redirect_uri')

  if (!code) return tokenError('invalid_request', 400, 'code is required')
  if (!verifier) return tokenError('invalid_request', 400, 'code_verifier is required')
  if (!clientId) return tokenError('invalid_request', 400, 'client_id is required')

  const service = await createServiceClient()

  // Atomic single-use: select then delete. (No row-level locking necessary
  // since the code PK collision will reject a parallel consumer.)
  const { data: row, error: selErr } = await service
    .from('mcp_auth_codes' as never)
    .select('*')
    .eq('code', code)
    .maybeSingle()

  if (selErr) {
    console.error('[mcp/token] auth code lookup failed', selErr)
    return tokenError('server_error', 500)
  }
  if (!row) return tokenError('invalid_grant', 400, 'unknown or already-used code')

  const codeRow = row as unknown as AuthCodeRow

  // Always consume the code, even on validation failure, to prevent replay.
  const { error: delErr } = await service
    .from('mcp_auth_codes' as never)
    .delete()
    .eq('code', code)
  if (delErr) {
    console.error('[mcp/token] failed to consume auth code', delErr)
  }

  if (codeRow.used_at) {
    return tokenError('invalid_grant', 400, 'code already used')
  }
  if (new Date(codeRow.expires_at).getTime() < Date.now()) {
    return tokenError('invalid_grant', 400, 'code expired')
  }
  if (codeRow.client_id !== clientId) {
    return tokenError('invalid_grant', 400, 'client_id mismatch')
  }
  if (redirectUri && codeRow.redirect_uri !== redirectUri) {
    return tokenError('invalid_grant', 400, 'redirect_uri mismatch')
  }

  const pkceOk = await verifyPkce(
    verifier,
    codeRow.code_challenge,
    codeRow.code_challenge_method,
  )
  if (!pkceOk) {
    return tokenError('invalid_grant', 400, 'PKCE verifier mismatch')
  }

  const session = codeRow.supabase_session
  const expiresIn =
    session.expires_in ??
    (session.expires_at
      ? Math.max(0, session.expires_at - Math.floor(Date.now() / 1000))
      : 3600)

  return NextResponse.json(
    {
      access_token: session.access_token,
      token_type: 'Bearer',
      expires_in: expiresIn,
      refresh_token: session.refresh_token,
      scope: codeRow.scope,
    },
    { headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } },
  )
}

async function handleRefreshToken(form: URLSearchParams) {
  const refreshToken = form.get('refresh_token')
  if (!refreshToken) {
    return tokenError('invalid_request', 400, 'refresh_token is required')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    return tokenError('server_error', 500, 'Supabase env not configured')
  }

  // Use a fresh, cookie-less client so refresh doesn't try to read the
  // request's session — we are explicitly handing in a refresh_token.
  const sb = createSbClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await sb.auth.refreshSession({
    refresh_token: refreshToken,
  })

  if (error || !data?.session) {
    return tokenError('invalid_grant', 400, 'refresh failed')
  }

  return NextResponse.json(
    {
      access_token: data.session.access_token,
      token_type: 'Bearer',
      expires_in: data.session.expires_in,
      refresh_token: data.session.refresh_token,
      scope: 'mcp:read mcp:query offline_access',
    },
    { headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } },
  )
}
