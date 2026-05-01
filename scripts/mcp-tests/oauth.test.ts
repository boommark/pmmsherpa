/**
 * OAuth 2.1 + PKCE tests.
 *
 * The full /authorize flow requires interactive Google sign-in, which we
 * skip. We exercise the /token + /register endpoints directly by inserting
 * realistic mcp_auth_codes rows via the service-role client and verifying
 * the token endpoint's PKCE / single-use / expiry checks.
 */

import {
  BASE_URL,
  Reporter,
  check,
  getServiceClient,
  base64url,
  genPkcePair,
  createTestUser,
  TEST_EMAIL_PRIMARY,
  deleteAllTestUsers,
} from './helpers'
import crypto from 'node:crypto'

interface InsertedAuthCode {
  code: string
  clientId: string
  verifier: string
  redirectUri: string
}

async function insertAuthCode(
  userId: string,
  opts: {
    expiresInSec?: number
    used?: boolean
    challengeOverride?: string
  } = {},
): Promise<InsertedAuthCode> {
  const sb = getServiceClient()
  const clientId = 'mcp_test_client_' + crypto.randomBytes(8).toString('hex')
  const redirectUri = 'http://localhost:9999/cb'

  // Register a client row so client_id check passes.
  await sb.from('mcp_clients' as never).insert({
    client_id: clientId,
    client_name: 'oauth test client',
    redirect_uris: [redirectUri],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    scope: 'mcp:read mcp:query',
    token_endpoint_auth_method: 'none',
  } as never)

  const { verifier, challenge } = genPkcePair()
  const code = base64url(crypto.randomBytes(32))
  const expSec = opts.expiresInSec ?? 600
  const expiresAt = new Date(Date.now() + expSec * 1000).toISOString()

  // Stash a fake supabase_session — token endpoint just echoes it back.
  // We don't need it to be a real Supabase session for these tests; the
  // PKCE/expiry/single-use checks all run before the response is built.
  const fakeSession = {
    access_token: 'fake-access-' + crypto.randomBytes(8).toString('hex'),
    refresh_token: 'fake-refresh-' + crypto.randomBytes(8).toString('hex'),
    expires_in: 3600,
  }

  const row = {
    code,
    client_id: clientId,
    supabase_user_id: userId,
    supabase_session: fakeSession,
    code_challenge: opts.challengeOverride ?? challenge,
    code_challenge_method: 'S256',
    redirect_uri: redirectUri,
    scope: 'mcp:read mcp:query',
    state: null,
    expires_at: expiresAt,
    used_at: opts.used ? new Date().toISOString() : null,
  }
  const { error } = await sb.from('mcp_auth_codes' as never).insert(row as never)
  if (error) throw new Error(`failed to insert auth code: ${error.message}`)
  return { code, clientId, verifier, redirectUri }
}

async function postToken(
  body: Record<string, string>,
): Promise<{ status: number; json: any }> {
  const params = new URLSearchParams(body)
  const res = await fetch(`${BASE_URL}/api/mcp/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  let json: any = null
  try {
    json = await res.json()
  } catch {
    /* */
  }
  return { status: res.status, json }
}

export async function runOAuthTests(): Promise<Reporter> {
  const r = new Reporter()
  console.log('\n=== OAuth / PKCE tests ===')

  const user = await createTestUser(TEST_EMAIL_PRIMARY + '.oauth')

  // 1. PKCE verifier mismatch → invalid_grant
  await check(r, 'PKCE verifier mismatch → 400 invalid_grant', async () => {
    const ins = await insertAuthCode(user.userId)
    const { verifier: wrongVerifier } = genPkcePair() // unrelated verifier
    const res = await postToken({
      grant_type: 'authorization_code',
      code: ins.code,
      code_verifier: wrongVerifier,
      client_id: ins.clientId,
      redirect_uri: ins.redirectUri,
    })
    if (res.status !== 400)
      throw new Error(`expected 400, got ${res.status} ${JSON.stringify(res.json)}`)
    if (res.json?.error !== 'invalid_grant')
      throw new Error(`expected invalid_grant, got ${JSON.stringify(res.json)}`)
  })

  // 2. Re-use of consumed auth code → invalid_grant on second call
  await check(r, 'auth code re-use → second call invalid_grant', async () => {
    const ins = await insertAuthCode(user.userId)
    // First call: use the correct verifier — should succeed.
    const first = await postToken({
      grant_type: 'authorization_code',
      code: ins.code,
      code_verifier: ins.verifier,
      client_id: ins.clientId,
      redirect_uri: ins.redirectUri,
    })
    if (first.status !== 200) {
      throw new Error(`first call expected 200, got ${first.status} ${JSON.stringify(first.json)}`)
    }
    // Second call: same code → 400 invalid_grant (code consumed).
    const second = await postToken({
      grant_type: 'authorization_code',
      code: ins.code,
      code_verifier: ins.verifier,
      client_id: ins.clientId,
      redirect_uri: ins.redirectUri,
    })
    if (second.status !== 400 || second.json?.error !== 'invalid_grant')
      throw new Error(
        `expected invalid_grant on replay, got ${second.status} ${JSON.stringify(second.json)}`,
      )
  })

  // 3. Expired code → invalid_grant
  await check(r, 'expired auth code → invalid_grant', async () => {
    // Insert with expires_at in the past.
    const ins = await insertAuthCode(user.userId, { expiresInSec: -60 })
    const res = await postToken({
      grant_type: 'authorization_code',
      code: ins.code,
      code_verifier: ins.verifier,
      client_id: ins.clientId,
      redirect_uri: ins.redirectUri,
    })
    if (res.status !== 400 || res.json?.error !== 'invalid_grant')
      throw new Error(
        `expected invalid_grant for expired code, got ${res.status} ${JSON.stringify(res.json)}`,
      )
    if (!/expired/i.test(res.json?.error_description ?? ''))
      throw new Error(`expected description to mention expiry: ${JSON.stringify(res.json)}`)
  })

  // 4. /register returns client_id, no client_secret
  await check(r, 'register endpoint returns public client (no secret)', async () => {
    const res = await fetch(`${BASE_URL}/api/mcp/oauth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'mcp-test-public-client',
        redirect_uris: ['http://localhost:9999/cb'],
        token_endpoint_auth_method: 'none',
      }),
    })
    if (res.status !== 201) throw new Error(`expected 201, got ${res.status}`)
    const body = await res.json()
    if (typeof body.client_id !== 'string' || body.client_id.length === 0)
      throw new Error('client_id missing or empty')
    if ('client_secret' in body)
      throw new Error('client_secret should NOT be returned for public clients')
    if (body.token_endpoint_auth_method !== 'none')
      throw new Error(`expected none, got ${body.token_endpoint_auth_method}`)
  })

  // 5 (added). /register with malformed redirect_uris → invalid_client_metadata
  await check(r, 'register with bad redirect_uris → 400 invalid_client_metadata', async () => {
    const res = await fetch(`${BASE_URL}/api/mcp/oauth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'bad-client',
        redirect_uris: 'not-an-array', // wrong type
      }),
    })
    if (res.status !== 400) throw new Error(`expected 400, got ${res.status}`)
    const body = await res.json()
    if (body.error !== 'invalid_client_metadata')
      throw new Error(`expected invalid_client_metadata, got ${JSON.stringify(body)}`)
  })

  // 6 (added). /register rejects token_endpoint_auth_method != none
  await check(r, 'register with confidential auth method → 400', async () => {
    const res = await fetch(`${BASE_URL}/api/mcp/oauth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'confidential-client',
        redirect_uris: ['http://localhost:9999/cb'],
        token_endpoint_auth_method: 'client_secret_basic',
      }),
    })
    if (res.status !== 400) throw new Error(`expected 400, got ${res.status}`)
  })

  r.summary('OAuth / PKCE')
  return r
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runOAuthTests()
    .then(() => deleteAllTestUsers())
    .catch((e) => {
      console.error(e)
      deleteAllTestUsers().finally(() => process.exit(1))
    })
}
