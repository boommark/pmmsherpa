/**
 * query_pmm_sherpa tool tests.
 *
 * Covers: input validation, happy path with citations, empty-corpus
 * friendly message, oversized query rejection, invalid conversation_id
 * graceful handling.
 *
 * Note: Some tests issue real LLM calls (Claude Sonnet) and burn a
 * monthly-usage slot for the test user. We rely on createTestUser →
 * deleteAllTestUsers cleanup; if you run this against a long-lived user
 * the gate may eventually trip.
 */

import {
  Reporter,
  check,
  createTestUser,
  deleteAllTestUsers,
  postRpc,
  initializeSession,
  TEST_EMAIL_PRIMARY,
} from './helpers'

interface ToolEnvelope {
  content?: Array<{ type: string; text?: string }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  structuredContent?: Record<string, any>
  isError?: boolean
}

async function callQuery(
  token: string,
  sessionId: string,
  args: Record<string, unknown>,
  rpcId = 1,
): Promise<{ status: number; envelope: ToolEnvelope | null; rawBody: unknown }> {
  const res = await postRpc(
    {
      jsonrpc: '2.0',
      id: rpcId,
      method: 'tools/call',
      params: { name: 'query_pmm_sherpa', arguments: args },
    },
    { token, sessionId },
  )
  return {
    status: res.status,
    envelope: (res.body?.result as ToolEnvelope) ?? null,
    rawBody: res.body,
  }
}

export async function runQuerySherpaTests(): Promise<Reporter> {
  const r = new Reporter()
  console.log('\n=== query_pmm_sherpa tests ===')

  const user = await createTestUser(TEST_EMAIL_PRIMARY + '.querysherpa')
  const sid = await initializeSession(user.accessToken)

  // 1. Missing/empty query → validation error
  await check(r, 'empty query → isError true', async () => {
    const res = await callQuery(user.accessToken, sid, { query: '' }, 100)
    if (!res.envelope?.isError)
      throw new Error(`expected isError, got ${JSON.stringify(res.envelope)}`)
    const text = res.envelope.content?.[0]?.text ?? ''
    if (!/required/i.test(text))
      throw new Error(`expected validation message, got: ${text}`)
  })

  // 2. Oversized query (>2000 chars) → validation error
  await check(r, 'query >2000 chars → too long', async () => {
    const long = 'x'.repeat(2001)
    const res = await callQuery(user.accessToken, sid, { query: long }, 101)
    if (!res.envelope?.isError) throw new Error('expected isError')
    const text = res.envelope.content?.[0]?.text ?? ''
    if (!/too long/i.test(text)) throw new Error(`unexpected text: ${text}`)
  })

  // 3. Happy path — substantive PMM question returns text + citations
  await check(r, 'happy path → text + citations', async () => {
    const res = await callQuery(
      user.accessToken,
      sid,
      { query: "What's the most important thing in PMM positioning?" },
      102,
    )
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    if (res.envelope?.isError)
      throw new Error(`unexpected error: ${JSON.stringify(res.envelope)}`)
    const text = res.envelope?.content?.[0]?.text ?? ''
    if (text.length < 50) throw new Error(`response text too short: "${text}"`)
    const sc = res.envelope?.structuredContent as
      | { response?: string; citations?: unknown[]; chunks?: unknown[] }
      | undefined
    if (!sc) throw new Error('missing structuredContent')
    if (typeof sc.response !== 'string' || sc.response.length < 50)
      throw new Error('structuredContent.response missing or too short')
    if (!Array.isArray(sc.citations) || sc.citations.length < 1)
      throw new Error(`expected ≥1 citation, got ${sc.citations?.length ?? 0}`)
    if (!Array.isArray(sc.chunks))
      throw new Error('structuredContent.chunks not array')
  })

  // 4. Empty-knowledge path — gibberish question gets the friendly message
  await check(r, 'off-corpus query → friendly empty message', async () => {
    const res = await callQuery(
      user.accessToken,
      sid,
      { query: "What's the airspeed velocity of an unladen swallow?" },
      103,
    )
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    // Both branches OK: either truly empty (preferred) OR LLM still answered
    // with corpus chunks (RAG threshold may be lenient enough to surface
    // tangential content). Both should be isError=false.
    if (res.envelope?.isError)
      throw new Error(`expected isError=false, got ${JSON.stringify(res.envelope)}`)
    const sc = res.envelope?.structuredContent as
      | { empty_corpus?: boolean; response?: string }
      | undefined
    const text = res.envelope?.content?.[0]?.text ?? ''
    if (sc?.empty_corpus === true) {
      if (!/couldn't find/i.test(text))
        throw new Error(`expected friendly empty text, got: ${text}`)
    } else {
      // Tangential RAG hit — just verify shape.
      if (!text || text.length < 10) throw new Error('empty response on non-empty path')
    }
  })

  // 5. Invalid conversation_id is silently ignored — request still succeeds
  await check(r, 'invalid conversation_id → silently ignored', async () => {
    const res = await callQuery(
      user.accessToken,
      sid,
      {
        query: 'What is positioning?',
        conversation_id: 'not-a-valid-uuid',
      },
      104,
    )
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    if (res.envelope?.isError)
      throw new Error(`unexpected error: ${JSON.stringify(res.envelope)}`)
    const text = res.envelope?.content?.[0]?.text ?? ''
    if (text.length < 30) throw new Error(`response too short: "${text}"`)
  })

  r.summary('query_pmm_sherpa')
  return r
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runQuerySherpaTests()
    .then(() => deleteAllTestUsers())
    .catch((e) => {
      console.error(e)
      deleteAllTestUsers().finally(() => process.exit(1))
    })
}
