/**
 * OAuth 2.1 + PKCE authorization endpoint (wraps Supabase Auth).
 *
 * Flow:
 *  1. Validate client_id, redirect_uri, response_type=code, code_challenge,
 *     code_challenge_method=S256, state.
 *  2. Stash everything in a signed HTTP-only cookie keyed to a short-lived
 *     state nonce.
 *  3. Kick off Supabase's existing Google OAuth, telling Supabase to come
 *     back to /api/mcp/oauth/callback when the user has authenticated.
 *
 * We do NOT mint our own JWTs — the user signs in with their pmmsherpa.com
 * account, and we hand back the Supabase-issued access_token at /token time.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { signPayload } from '@/lib/mcp/pkce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STASH_COOKIE = 'mcp_oauth_pending'
const STASH_TTL_SECONDS = 600

interface PendingStash {
  clientId: string
  redirectUri: string
  codeChallenge: string
  codeChallengeMethod: 'S256'
  scope: string
  state: string | null
  // Tied to the OAuth round trip — used to detect stale cookies.
  nonce: string
}

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') ??
    'https://pmmsherpa.com'
  )
}

function badRequest(error: string, description?: string) {
  return NextResponse.json(
    description
      ? { error, error_description: description }
      : { error },
    { status: 400 },
  )
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const clientId = params.get('client_id')
  const redirectUri = params.get('redirect_uri')
  const responseType = params.get('response_type')
  const codeChallenge = params.get('code_challenge')
  const codeChallengeMethod = params.get('code_challenge_method') ?? 'S256'
  const state = params.get('state')
  const scope = params.get('scope') ?? 'mcp:read mcp:query'

  if (!clientId) return badRequest('invalid_request', 'client_id is required')
  if (!redirectUri) return badRequest('invalid_request', 'redirect_uri is required')
  if (responseType !== 'code') {
    return badRequest('unsupported_response_type', 'only response_type=code is supported')
  }
  if (!codeChallenge) {
    return badRequest('invalid_request', 'code_challenge is required (PKCE)')
  }
  if (codeChallengeMethod !== 'S256') {
    return badRequest('invalid_request', 'code_challenge_method must be S256')
  }

  // Validate the client + redirect_uri pair against mcp_clients.
  const service = await createServiceClient()
  const { data: client, error: clientErr } = await service
    .from('mcp_clients' as never)
    .select('client_id, redirect_uris')
    .eq('client_id', clientId)
    .maybeSingle()

  if (clientErr) {
    console.error('[mcp/authorize] client lookup failed', clientErr)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
  if (!client) return badRequest('unauthorized_client', 'unknown client_id')

  const allowed = Array.isArray((client as { redirect_uris?: unknown }).redirect_uris)
    ? ((client as { redirect_uris: string[] }).redirect_uris)
    : []
  if (allowed.length > 0 && !allowed.includes(redirectUri)) {
    return badRequest('invalid_request', 'redirect_uri not registered for this client')
  }

  // Build the stash + cookie.
  const nonce = crypto.randomUUID()
  const stash: PendingStash = {
    clientId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod: 'S256',
    scope,
    state,
    nonce,
  }
  const signed = await signPayload(stash)

  const cookieStore = await cookies()
  cookieStore.set(STASH_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: STASH_TTL_SECONDS,
  })

  // Hand off to Supabase's existing Google OAuth.
  const supabase = await createClient()
  const callbackUrl = `${appUrl()}/api/mcp/oauth/callback`
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl, skipBrowserRedirect: true },
  })

  if (error || !data?.url) {
    console.error('[mcp/authorize] supabase signInWithOAuth failed', error)
    return NextResponse.json(
      { error: 'server_error', error_description: 'failed to start OAuth' },
      { status: 500 },
    )
  }

  return NextResponse.redirect(data.url, { status: 302 })
}
