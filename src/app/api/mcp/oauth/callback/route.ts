/**
 * Post-Supabase OAuth callback.
 *
 * Supabase finishes its own OAuth dance (Google → Supabase → here) and
 * leaves a session cookie on the request. We:
 *   1. Read the signed PKCE stash from the cookie set during /authorize.
 *   2. Mint an opaque MCP authorization code, store it bound to the
 *      Supabase user/session and the original code_challenge.
 *   3. Redirect back to the MCP client's redirect_uri with ?code=...&state=...
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateOpaqueCode, verifySignedPayload } from '@/lib/mcp/pkce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STASH_COOKIE = 'mcp_oauth_pending'
const AUTH_CODE_TTL_MS = 10 * 60 * 1000 // 10 minutes

interface PendingStash {
  clientId: string
  redirectUri: string
  codeChallenge: string
  codeChallengeMethod: 'S256'
  scope: string
  state: string | null
  nonce: string
}

function appendQuery(url: string, params: Record<string, string>): string {
  const u = new URL(url)
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
  return u.toString()
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const stashCookie = cookieStore.get(STASH_COOKIE)?.value
  if (!stashCookie) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'missing OAuth stash cookie' },
      { status: 400 },
    )
  }

  const stash = await verifySignedPayload<PendingStash>(stashCookie)
  if (!stash) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'OAuth stash failed signature check' },
      { status: 400 },
    )
  }

  // Supabase may surface OAuth-provider errors via query params.
  const errorParam = req.nextUrl.searchParams.get('error')
  if (errorParam) {
    cookieStore.delete(STASH_COOKIE)
    return NextResponse.redirect(
      appendQuery(stash.redirectUri, {
        error: errorParam,
        ...(stash.state ? { state: stash.state } : {}),
      }),
      { status: 302 },
    )
  }

  // Exchange Supabase's `?code=...` for a session cookie, then read user.
  //
  // Supabase's PKCE flow lands here with a `code` query param after the
  // Google → Supabase round trip. The session cookie is NOT set until we
  // call exchangeCodeForSession. Without this, fresh logins (no prior
  // staging session) hit getUser()→null and bounce to /login mid-flow.
  // The original Phase 1 test worked only because the tester already had
  // a staging session cookie from another tab.
  const supabase = await createClient()
  const supabaseCode = req.nextUrl.searchParams.get('code')
  if (supabaseCode) {
    const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(supabaseCode)
    if (exchangeErr) {
      console.error('[mcp/callback] supabase exchangeCodeForSession failed', exchangeErr)
      cookieStore.delete(STASH_COOKIE)
      return NextResponse.redirect(
        appendQuery(stash.redirectUri, {
          error: 'access_denied',
          error_description: 'failed to exchange supabase code',
          ...(stash.state ? { state: stash.state } : {}),
        }),
        { status: 302 },
      )
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    // Supabase didn't actually authenticate the user — bounce to /login.
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return NextResponse.redirect(url, { status: 302 })
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json(
      { error: 'server_error', error_description: 'Supabase session missing' },
      { status: 500 },
    )
  }

  // Mint the opaque MCP code and persist.
  const code = generateOpaqueCode()
  const expiresAt = new Date(Date.now() + AUTH_CODE_TTL_MS)
  const service = await createServiceClient()
  const { error: insertErr } = await service
    .from('mcp_auth_codes' as never)
    .insert({
      code,
      client_id: stash.clientId,
      supabase_user_id: user.id,
      supabase_session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
      },
      code_challenge: stash.codeChallenge,
      code_challenge_method: stash.codeChallengeMethod,
      redirect_uri: stash.redirectUri,
      scope: stash.scope,
      state: stash.state,
      expires_at: expiresAt.toISOString(),
    } as never)

  if (insertErr) {
    console.error('[mcp/callback] failed to persist auth code', insertErr)
    return NextResponse.json(
      { error: 'server_error', error_description: 'failed to persist authorization code' },
      { status: 500 },
    )
  }

  cookieStore.delete(STASH_COOKIE)

  return NextResponse.redirect(
    appendQuery(stash.redirectUri, {
      code,
      ...(stash.state ? { state: stash.state } : {}),
    }),
    { status: 302 },
  )
}
