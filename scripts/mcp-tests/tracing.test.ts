/**
 * Langfuse tracing test.
 *
 * Calls search_corpus once, then queries Langfuse public API for traces
 * with tag "surface:mcp" and checks one with the expected userId.
 *
 * Note: Langfuse OTel batches before flush; the route uses
 * waitUntil(forceFlush()) but that's serverless-only — in dev/Node mode
 * the flush is best-effort. We allow up to 30s for the trace to appear.
 */

import {
  Reporter,
  check,
  createTestUser,
  deleteAllTestUsers,
  postRpc,
  initializeSession,
  TEST_EMAIL_PRIMARY,
  sleep,
} from './helpers'

const LF_BASE = process.env.LANGFUSE_BASEURL ?? 'https://us.cloud.langfuse.com'
const LF_PUBLIC = process.env.LANGFUSE_PUBLIC_KEY!
const LF_SECRET = process.env.LANGFUSE_SECRET_KEY!

interface LfTrace {
  id: string
  userId: string | null
  tags: string[] | null
  name: string | null
  timestamp?: string
}

async function fetchTraces(params: Record<string, string>): Promise<LfTrace[]> {
  const u = new URL(`${LF_BASE}/api/public/traces`)
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
  const auth = Buffer.from(`${LF_PUBLIC}:${LF_SECRET}`).toString('base64')
  const res = await fetch(u.toString(), {
    headers: { Authorization: `Basic ${auth}` },
  })
  if (!res.ok) throw new Error(`Langfuse API ${res.status}: ${await res.text()}`)
  const body: any = await res.json()
  return (body?.data ?? []) as LfTrace[]
}

export async function runTracingTests(): Promise<Reporter> {
  const r = new Reporter()
  console.log('\n=== Tracing tests ===')

  if (!LF_PUBLIC || !LF_SECRET) {
    r.skip('langfuse trace assertion', 'LANGFUSE_* env vars not set')
    r.summary('Tracing')
    return r
  }

  const user = await createTestUser(TEST_EMAIL_PRIMARY + '.trace')
  const sid = await initializeSession(user.accessToken)
  const startTime = new Date(Date.now() - 60_000).toISOString()

  // Trigger one tool call
  const res = await postRpc(
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'search_corpus',
        arguments: { query: 'mcp tracing smoke test ' + Date.now(), top_k: 3 },
      },
    },
    { token: user.accessToken, sessionId: sid },
  )
  if (res.status !== 200) {
    r.fail('trigger search_corpus', `status ${res.status}`)
    r.summary('Tracing')
    return r
  }
  r.pass('trigger search_corpus')

  // Poll Langfuse — allow up to ~30s for the OTel batch to flush.
  await check(r, 'trace appears with tag surface:mcp + userId', async () => {
    let found: LfTrace | null = null
    for (let attempt = 0; attempt < 10 && !found; attempt++) {
      await sleep(3000)
      try {
        const traces = await fetchTraces({
          tags: 'surface:mcp',
          userId: user.userId,
          fromTimestamp: startTime,
          limit: '20',
        })
        found = traces.find((t) => (t.tags ?? []).includes('surface:mcp')) ?? null
      } catch (e) {
        // network blip — keep trying
      }
    }
    if (!found)
      throw new Error(
        'no trace tagged surface:mcp surfaced in Langfuse within 30s — could be batch-flush latency in dev mode, or tag/userId not propagating',
      )
    if (found.userId !== user.userId)
      throw new Error(`trace.userId=${found.userId}, expected ${user.userId}`)
  })

  r.summary('Tracing')
  return r
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTracingTests()
    .then(() => deleteAllTestUsers())
    .catch((e) => {
      console.error(e)
      deleteAllTestUsers().finally(() => process.exit(1))
    })
}
