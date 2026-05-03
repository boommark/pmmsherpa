/**
 * Category 7: Live smoke against staging.
 *
 * SKIPPED BY DEFAULT. Run with:
 *
 *   PMM_LIVE=1 \
 *   STAGING_TOKEN="<a valid Supabase access token>" \
 *   STAGING_URL="https://staging.pmmsherpa.com" \
 *   npm test -- live-smoke
 *
 * Asserts:
 *   - tools/list returns 3 tools (ask_sherpa, draft_artifact, get_feedback)
 *   - tools/call against each tool with a minimal valid input completes < 30s
 *
 * No assertion on response quality — that's category 8/9. This is the
 * "did the wires move" test.
 */

import { describe, it, expect } from 'vitest'

const SHOULD_RUN = process.env.PMM_LIVE === '1'
const STAGING_URL = process.env.STAGING_URL ?? 'https://staging.pmmsherpa.com'
const STAGING_TOKEN = process.env.STAGING_TOKEN ?? ''

const d = SHOULD_RUN ? describe : describe.skip

interface JsonRpcResp {
  jsonrpc: '2.0'
  id: string | number | null
  result?: unknown
  error?: { code: number; message: string }
}

async function rpc(
  method: string,
  params: unknown,
  sessionId?: string,
): Promise<{ body: JsonRpcResp; sessionId: string | undefined }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${STAGING_TOKEN}`,
  }
  if (sessionId) headers['mcp-session-id'] = sessionId
  const res = await fetch(`${STAGING_URL}/api/mcp`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const newSession = res.headers.get('mcp-session-id') ?? sessionId
  const body = (await res.json()) as JsonRpcResp
  return { body, sessionId: newSession ?? undefined }
}

d('live-smoke: staging MCP server', () => {
  let session: string | undefined

  it('initialize → returns a session id', async () => {
    expect(STAGING_TOKEN).not.toBe('') // sanity: don't run without a token
    const { body, sessionId } = await rpc(
      'initialize',
      { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'live-smoke', version: '1' } },
    )
    expect(body.error).toBeUndefined()
    expect(sessionId).toBeTruthy()
    session = sessionId
  }, 30_000)

  it('tools/list returns exactly the 3 expected tools', async () => {
    const { body } = await rpc('tools/list', {}, session)
    expect(body.error).toBeUndefined()
    const result = body.result as { tools: Array<{ name: string }> }
    const names = result.tools.map((t) => t.name).sort()
    expect(names).toEqual(['ask_sherpa', 'draft_artifact', 'get_feedback'])
  }, 30_000)

  it('tools/call ask_sherpa completes within 30s', async () => {
    const { body } = await rpc(
      'tools/call',
      { name: 'ask_sherpa', arguments: { query: 'What is positioning?' } },
      session,
    )
    expect(body.error).toBeUndefined()
    const result = body.result as { content: unknown[] }
    expect(Array.isArray(result.content)).toBe(true)
  }, 30_000)

  it('tools/call draft_artifact completes within 30s', async () => {
    const { body } = await rpc(
      'tools/call',
      { name: 'draft_artifact', arguments: { artifact_type: 'positioning_statement' } },
      session,
    )
    expect(body.error).toBeUndefined()
  }, 30_000)

  it('tools/call get_feedback completes within 30s', async () => {
    const { body } = await rpc(
      'tools/call',
      {
        name: 'get_feedback',
        arguments: {
          content:
            'For RevOps leaders who hate manual reporting, our product is a workflow automation tool. Unlike Zapier, we offer native Snowflake integration.',
        },
      },
      session,
    )
    expect(body.error).toBeUndefined()
  }, 30_000)
})
