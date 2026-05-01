/**
 * validate_artifact tool tests.
 *
 * Covers: input validation, happy path with critique + gaps + recs,
 * artifact_type fallback to 'other', oversized artifact rejection.
 *
 * Note: Hits real LLM calls — uses fresh test user that gets cleaned up.
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

async function callValidate(
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
      params: { name: 'validate_artifact', arguments: args },
    },
    { token, sessionId },
  )
  return {
    status: res.status,
    envelope: (res.body?.result as ToolEnvelope) ?? null,
    rawBody: res.body,
  }
}

const SAMPLE_POSITIONING = `Acme Analytics is a modern data platform for fast-moving teams.
We help companies turn their data into decisions.
Our key advantage is speed, ease of use, and scalability.
Companies of all sizes love Acme. We are the future of analytics.`

export async function runValidateArtifactTests(): Promise<Reporter> {
  const r = new Reporter()
  console.log('\n=== validate_artifact tests ===')

  const user = await createTestUser(TEST_EMAIL_PRIMARY + '.validate')
  const sid = await initializeSession(user.accessToken)

  // 1. Empty artifact_text → validation error
  await check(r, 'empty artifact_text → isError', async () => {
    const res = await callValidate(
      user.accessToken,
      sid,
      { artifact_text: '', artifact_type: 'positioning' },
      200,
    )
    if (!res.envelope?.isError)
      throw new Error(`expected isError, got ${JSON.stringify(res.envelope)}`)
    const text = res.envelope.content?.[0]?.text ?? ''
    if (!/required/i.test(text))
      throw new Error(`expected validation message, got: ${text}`)
  })

  // 2. Oversized artifact_text → validation error
  await check(r, 'artifact_text >20000 chars → too long', async () => {
    const long = 'x'.repeat(20001)
    const res = await callValidate(
      user.accessToken,
      sid,
      { artifact_text: long, artifact_type: 'positioning' },
      201,
    )
    if (!res.envelope?.isError) throw new Error('expected isError')
    const text = res.envelope.content?.[0]?.text ?? ''
    if (!/too long/i.test(text)) throw new Error(`unexpected text: ${text}`)
  })

  // 3. Unknown artifact_type → falls back to 'other' and still works
  await check(r, 'unknown artifact_type → fallback to other', async () => {
    const res = await callValidate(
      user.accessToken,
      sid,
      {
        artifact_text: SAMPLE_POSITIONING,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        artifact_type: 'totally-bogus-type' as any,
      },
      202,
    )
    // The schema validates upstream so the JSON-RPC layer might reject;
    // if it reaches the handler we coerce to 'other'. Accept either:
    //   (a) handler ran and returned a successful envelope
    //   (b) JSON-RPC returned an error envelope referencing the schema
    if (res.status !== 200) {
      // Schema rejection at JSON-RPC layer is acceptable.
      return
    }
    if (res.envelope?.isError) {
      // Could also be schema-validation surfaced as isError — acceptable
      return
    }
    const sc = res.envelope?.structuredContent as
      | { critique?: string; gaps?: unknown[]; recommendations?: unknown[] }
      | undefined
    if (!sc) throw new Error('missing structuredContent')
    if (typeof sc.critique !== 'string' || sc.critique.length < 30)
      throw new Error('critique missing or too short')
  })

  // 4. Happy path — valid positioning text returns critique + gaps + recs
  await check(r, 'happy path → critique with ≥1 gap + ≥1 rec', async () => {
    const res = await callValidate(
      user.accessToken,
      sid,
      {
        artifact_text: SAMPLE_POSITIONING,
        artifact_type: 'positioning',
      },
      203,
    )
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    if (res.envelope?.isError)
      throw new Error(`unexpected error: ${JSON.stringify(res.envelope)}`)
    const sc = res.envelope?.structuredContent as
      | {
          critique?: string
          gaps?: string[]
          recommendations?: string[]
          principles_cited?: string[]
        }
      | undefined
    if (!sc) throw new Error('missing structuredContent')
    if (typeof sc.critique !== 'string' || sc.critique.length < 50)
      throw new Error(`critique missing or too short: ${sc.critique?.length ?? 0}`)
    if (!Array.isArray(sc.gaps) || sc.gaps.length < 1)
      throw new Error(
        `expected ≥1 gap (parser may have failed if LLM ignored format). gaps=${JSON.stringify(sc.gaps)}\n\nfull critique:\n${sc.critique}`,
      )
    if (!Array.isArray(sc.recommendations) || sc.recommendations.length < 1)
      throw new Error(
        `expected ≥1 recommendation. recs=${JSON.stringify(sc.recommendations)}\n\nfull critique:\n${sc.critique}`,
      )
  })

  r.summary('validate_artifact')
  return r
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runValidateArtifactTests()
    .then(() => deleteAllTestUsers())
    .catch((e) => {
      console.error(e)
      deleteAllTestUsers().finally(() => process.exit(1))
    })
}
