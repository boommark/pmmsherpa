/**
 * Transport-level tests for /api/mcp.
 *
 * Covers: missing/invalid bearer auth, JSON-RPC dispatch, session
 * lifecycle, malformed body handling, cross-user session isolation,
 * concurrent same-session requests.
 */

import {
  BASE_URL,
  Reporter,
  check,
  createTestUser,
  deleteAllTestUsers,
  postRpc,
  initializeSession,
  TEST_EMAIL_PRIMARY,
  TEST_EMAIL_SECOND,
  getServiceClient,
} from './helpers'

export async function runTransportTests(): Promise<Reporter> {
  const r = new Reporter()
  console.log('\n=== Transport tests ===')

  // 1. Missing Authorization header → 401
  await check(r, 'no-auth-header → 401', async () => {
    const res = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'x', version: '1' } },
      }),
    })
    if (res.status !== 401) throw new Error(`expected 401, got ${res.status}`)
    const wwwAuth = res.headers.get('www-authenticate') ?? ''
    if (!/Bearer/i.test(wwwAuth)) throw new Error(`expected WWW-Authenticate Bearer, got ${wwwAuth}`)
    if (!/resource_metadata=/i.test(wwwAuth))
      throw new Error(`expected resource_metadata in WWW-Authenticate, got ${wwwAuth}`)
  })

  // 2. Invalid bearer token → 401
  await check(r, 'invalid-bearer → 401', async () => {
    const res = await postRpc(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'x', version: '1' } },
      },
      { token: 'invalid.jwt.token' },
    )
    if (res.status !== 401) throw new Error(`expected 401, got ${res.status}`)
    const wwwAuth = res.headers.get('www-authenticate') ?? ''
    if (!/error="invalid_token"/i.test(wwwAuth))
      throw new Error(`expected error="invalid_token" in WWW-Authenticate, got ${wwwAuth}`)
  })

  // Mint a real Supabase JWT for the rest of the suite
  const userA = await createTestUser(TEST_EMAIL_PRIMARY)

  // 3. tools/call before initialize → -32002
  await check(r, 'tools/call before initialize → -32002', async () => {
    // No mcp-session-id header → server should reject any non-initialize method
    const res = await postRpc(
      { jsonrpc: '2.0', id: 99, method: 'tools/call', params: { name: 'search_corpus', arguments: { query: 'x' } } },
      { token: userA.accessToken },
    )
    // Spec says JSON-RPC error -32002. Status can be 200 (JSON-RPC envelope carries the error).
    if (!res.body?.error) throw new Error(`expected JSON-RPC error envelope; got ${JSON.stringify(res.body)}`)
    if (res.body.error.code !== -32002)
      throw new Error(`expected -32002 (SERVER_NOT_INITIALIZED), got ${res.body.error.code}`)
  })

  // Initialize a real session for the next tests
  const sessionId = await initializeSession(userA.accessToken)

  // 4. Unknown tool name → -32601
  await check(r, 'unknown tool → -32601', async () => {
    const res = await postRpc(
      {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: { name: 'definitely_not_a_real_tool', arguments: {} },
      },
      { token: userA.accessToken, sessionId },
    )
    if (!res.body?.error) throw new Error(`expected error envelope; got ${JSON.stringify(res.body)}`)
    if (res.body.error.code !== -32601) throw new Error(`expected -32601, got ${res.body.error.code}`)
  })

  // 5. tools/list without initialize first — currently route requires session for non-initialize
  // Lock in actual behavior so regressions are caught.
  await check(r, 'tools/list without session — locks in current behavior', async () => {
    const res = await postRpc(
      { jsonrpc: '2.0', id: 7, method: 'tools/list' },
      { token: userA.accessToken /* no sessionId */ },
    )
    // Per route.ts dispatch(): non-initialize methods without a session return -32002.
    if (res.body?.error?.code !== -32002)
      throw new Error(
        `route currently rejects tools/list without session with -32002; got code=${res.body?.error?.code}, status=${res.status}`,
      )
  })

  // 6. Malformed JSON body → -32700 parse error
  await check(r, 'malformed JSON → -32700', async () => {
    const res = await postRpc(undefined, {
      token: userA.accessToken,
      rawBody: '{this is not: valid json',
    })
    // Per route.ts: parseError envelope with status 400.
    if (res.body?.error?.code !== -32700)
      throw new Error(`expected -32700 parse error, got ${JSON.stringify(res.body)}`)
  })

  // 7. Two requests with same session interleaved → both succeed, last_seen_at advances
  await check(r, 'concurrent requests on same session → both succeed', async () => {
    const before = await getServiceClient()
      .from('mcp_sessions' as never)
      .select('last_seen_at')
      .eq('id', sessionId)
      .maybeSingle()
    const beforeTs = (before.data as any)?.last_seen_at as string
    await new Promise((r) => setTimeout(r, 1100)) // ensure clock granularity

    const [r1, r2] = await Promise.all([
      postRpc({ jsonrpc: '2.0', id: 100, method: 'tools/list' }, { token: userA.accessToken, sessionId }),
      postRpc({ jsonrpc: '2.0', id: 101, method: 'tools/list' }, { token: userA.accessToken, sessionId }),
    ])
    if (r1.status !== 200 || r2.status !== 200)
      throw new Error(`statuses: ${r1.status}, ${r2.status}`)
    if (!r1.body?.result?.tools || !r2.body?.result?.tools)
      throw new Error('missing tools in results')

    const after = await getServiceClient()
      .from('mcp_sessions' as never)
      .select('last_seen_at')
      .eq('id', sessionId)
      .maybeSingle()
    const afterTs = (after.data as any)?.last_seen_at as string
    if (!afterTs || afterTs <= beforeTs)
      throw new Error(`last_seen_at did not advance: before=${beforeTs} after=${afterTs}`)
  })

  // 8. Cross-user session takeover → JSON-RPC INVALID_REQUEST
  await check(r, 'cross-user session attempt → blocked', async () => {
    const userB = await createTestUser(TEST_EMAIL_SECOND)
    const res = await postRpc(
      { jsonrpc: '2.0', id: 200, method: 'tools/list' },
      { token: userB.accessToken, sessionId /* userA's session */ },
    )
    // Per route.ts: returns JSON-RPC error INVALID_REQUEST (-32600) "Session does not belong..."
    if (res.body?.error?.code !== -32600)
      throw new Error(`expected -32600 INVALID_REQUEST, got ${JSON.stringify(res.body)}`)
    if (!/does not belong/i.test(res.body.error.message))
      throw new Error(`expected "does not belong" message, got: ${res.body.error.message}`)
  })

  // 9 (added). Unknown session id → 404
  await check(r, 'unknown mcp-session-id → 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    const res = await postRpc(
      { jsonrpc: '2.0', id: 300, method: 'tools/list' },
      { token: userA.accessToken, sessionId: fakeId },
    )
    if (res.status !== 404) throw new Error(`expected 404, got ${res.status}`)
  })

  // 10 (added). DELETE /api/mcp terminates session
  await check(r, 'DELETE /api/mcp terminates session', async () => {
    const tempSession = await initializeSession(userA.accessToken)
    const del = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userA.accessToken}`,
        'mcp-session-id': tempSession,
      },
    })
    if (del.status !== 204) throw new Error(`expected 204, got ${del.status}`)
    // Subsequent call → 404
    const after = await postRpc(
      { jsonrpc: '2.0', id: 1, method: 'tools/list' },
      { token: userA.accessToken, sessionId: tempSession },
    )
    if (after.status !== 404)
      throw new Error(`expected 404 after DELETE, got ${after.status}`)
  })

  r.summary('Transport')
  return r
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTransportTests()
    .then(() => deleteAllTestUsers())
    .catch((e) => {
      console.error(e)
      deleteAllTestUsers().finally(() => process.exit(1))
    })
}
