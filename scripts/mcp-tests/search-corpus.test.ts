/**
 * search_corpus tool tests.
 *
 * Covers: input validation, top_k clamping, empty-result path,
 * source_types filter, structuredContent shape.
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
  structuredContent?: { chunks?: any[] }
  isError?: boolean
}

async function callSearch(
  token: string,
  sessionId: string,
  args: Record<string, unknown>,
  rpcId = 1,
): Promise<{ status: number; envelope: ToolEnvelope | null; rawBody: any }> {
  const res = await postRpc(
    { jsonrpc: '2.0', id: rpcId, method: 'tools/call', params: { name: 'search_corpus', arguments: args } },
    { token, sessionId },
  )
  return {
    status: res.status,
    envelope: (res.body?.result as ToolEnvelope) ?? null,
    rawBody: res.body,
  }
}

export async function runSearchCorpusTests(): Promise<Reporter> {
  const r = new Reporter()
  console.log('\n=== search_corpus tests ===')

  const user = await createTestUser(TEST_EMAIL_PRIMARY + '.search')
  const sid = await initializeSession(user.accessToken)

  // 1. Empty query → isError
  await check(r, 'empty query → isError true', async () => {
    const res = await callSearch(user.accessToken, sid, { query: '' }, 10)
    if (!res.envelope?.isError)
      throw new Error(`expected isError, got ${JSON.stringify(res.envelope)}`)
    const text = res.envelope.content?.[0]?.text ?? ''
    if (!/at least 3 characters/i.test(text))
      throw new Error(`expected validation message, got: ${text}`)
  })

  // 2. Over 2000 chars → "Query too long"
  await check(r, 'query >2000 chars → Query too long', async () => {
    const long = 'x'.repeat(2001)
    const res = await callSearch(user.accessToken, sid, { query: long }, 11)
    if (!res.envelope?.isError) throw new Error('expected isError')
    const text = res.envelope.content?.[0]?.text ?? ''
    if (!/too long/i.test(text)) throw new Error(`unexpected text: ${text}`)
  })

  // 3. top_k clamping — 999 should clamp to 20
  await check(r, 'top_k=999 clamps to ≤20', async () => {
    const res = await callSearch(
      user.accessToken,
      sid,
      { query: 'product marketing positioning', top_k: 999 },
      12,
    )
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    if (res.envelope?.isError) throw new Error(`unexpected error: ${JSON.stringify(res.envelope)}`)
    const chunks = (res.envelope?.structuredContent?.chunks as any[]) ?? []
    if (chunks.length > 20) throw new Error(`expected ≤20 chunks, got ${chunks.length}`)
  })

  // 4. Valid query returns chunks with required shape
  await check(r, 'valid query → non-empty chunks with required fields', async () => {
    const res = await callSearch(
      user.accessToken,
      sid,
      { query: 'product marketing positioning frameworks', top_k: 5 },
      13,
    )
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    if (res.envelope?.isError) throw new Error(`unexpected error: ${JSON.stringify(res.envelope)}`)
    const chunks = (res.envelope?.structuredContent?.chunks as any[]) ?? []
    if (chunks.length === 0) throw new Error('expected at least 1 chunk')
    const c = chunks[0]
    for (const f of ['id', 'content', 'similarity', 'source']) {
      if (!(f in c)) throw new Error(`chunk missing field: ${f}`)
    }
    if (typeof c.similarity !== 'number') throw new Error('similarity not number')
    if (typeof c.source?.type !== 'string') throw new Error('source.type missing')
  })

  // 5. No-match path: combine random query with a narrow source_types filter
  //    so the post-filter empties the result set. This reliably triggers the
  //    empty-result branch in search-corpus.ts (gibberish alone is not
  //    sufficient — hybrid keyword scoring still returns low-confidence rows).
  await check(r, 'no-match → empty chunks, "No matching documents found."', async () => {
    const res = await callSearch(
      user.accessToken,
      sid,
      {
        query: 'asdkjfhasldkjfh nonsense xqzwzwzpz qqqqqq',
        // book_presentations is a real source_type but rare; combined with
        // a random query, post-filter typically empties.
        source_types: ['book_presentations'],
        top_k: 3,
      },
      14,
    )
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    if (res.envelope?.isError) throw new Error('expected isError=false on empty result')
    const chunks = (res.envelope?.structuredContent?.chunks as any[]) ?? []
    if (chunks.length !== 0) {
      // Not a hard failure — just record what came back. The empty-result
      // code path needs verification but the search index can still hit.
      throw new Error(
        `empty-result path not triggered (got ${chunks.length} chunks). ` +
          'This may indicate hybrid_search match_threshold is too lenient — ' +
          'consider raising threshold for the empty-result UX, but it is not a regression.',
      )
    }
    const text = res.envelope?.content?.[0]?.text ?? ''
    if (!/no matching documents found/i.test(text))
      throw new Error(`expected friendly empty text, got: ${text}`)
  })

  // 6. source_types filter applied
  await check(r, 'source_types filter narrows result set', async () => {
    const allow = ['book', 'blog']
    const res = await callSearch(
      user.accessToken,
      sid,
      { query: 'go to market launch', source_types: allow, top_k: 8 },
      15,
    )
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    if (res.envelope?.isError)
      throw new Error(`unexpected error: ${JSON.stringify(res.envelope)}`)
    const chunks = (res.envelope?.structuredContent?.chunks as any[]) ?? []
    // Filter is enforced post-retrieval; if non-empty, all must be in allow set.
    for (const c of chunks) {
      if (!allow.includes(c.source.type))
        throw new Error(`unexpected source.type ${c.source.type}, allow=${allow.join(',')}`)
    }
  })

  // 7 (added). SQL injection in query string is treated as text, not SQL.
  await check(r, 'SQL injection text in query is not executed', async () => {
    const evil = "x'; DROP TABLE chunks; --"
    const res = await callSearch(user.accessToken, sid, { query: evil }, 16)
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    // Whatever happens, it should not 500. Either chunks or empty-result path.
    const ok =
      !res.envelope?.isError &&
      Array.isArray(res.envelope?.structuredContent?.chunks)
    if (!ok) throw new Error(`unsafe handling: ${JSON.stringify(res.envelope)}`)
  })

  r.summary('search_corpus')
  return r
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSearchCorpusTests()
    .then(() => deleteAllTestUsers())
    .catch((e) => {
      console.error(e)
      deleteAllTestUsers().finally(() => process.exit(1))
    })
}
