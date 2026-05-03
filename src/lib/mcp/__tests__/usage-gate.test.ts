/**
 * Category 4: Usage gate.
 *
 * Mocks `checkUsageGate` to deny. Asserts that EVERY revenue-relevant
 * tool returns the structured limit-exceeded envelope without calling
 * incrementUsage and without making any LLM call.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeAuth, makeSession, DENIED_USAGE_GATE, makeSherpaChatResult } from './fixtures/mocks'

const checkUsageGateMock = vi.fn()
const incrementUsageMock = vi.fn()
const runSherpaChatMock = vi.fn(async () => makeSherpaChatResult())

vi.mock('@/lib/usage-gate', () => ({
  checkUsageGate: checkUsageGateMock,
  incrementUsage: incrementUsageMock,
}))

vi.mock('../helpers', () => ({
  runSherpaChat: runSherpaChatMock,
  parseCritiqueMarkdown: () => ({ gaps: [], recommendations: [] }),
  uniquePrinciplesFromCitations: () => [],
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(async () => ({
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
    }),
  })),
}))

vi.mock('../tracing', () => ({
  startMcpObservation: async (_n: string, _c: unknown, fn: (s: unknown) => unknown) =>
    fn({ update: () => undefined }),
}))

import { getTool } from '../tools'

const ctx = { auth: makeAuth(), session: makeSession() }
const TOOLS = ['ask_sherpa', 'draft_artifact', 'get_feedback'] as const

const VALID_INPUTS: Record<(typeof TOOLS)[number], Record<string, unknown>> = {
  ask_sherpa: { query: 'How do I position a developer tool?' },
  draft_artifact: { artifact_type: 'positioning_statement' },
  get_feedback: { content: 'Our positioning statement: For developers who...' },
}

beforeEach(() => {
  vi.clearAllMocks()
  checkUsageGateMock.mockResolvedValue(DENIED_USAGE_GATE)
})

describe.each(TOOLS)('usage-gate: %s', (toolName) => {
  it('returns isError when gate denies', async () => {
    const t = getTool(toolName)
    if (!t) return
    const r = await t.handler(VALID_INPUTS[toolName], ctx)
    expect(r.isError).toBe(true)
  })

  it('returns structured limit-exceeded envelope', async () => {
    const t = getTool(toolName)
    if (!t) return
    const r = await t.handler(VALID_INPUTS[toolName], ctx)
    expect(r.structuredContent).toBeDefined()
    const sc = r.structuredContent as Record<string, unknown>
    expect(sc.error).toBe('message_limit_exceeded')
    expect(sc.tier).toBe('free')
    expect(sc.used).toBe(10)
    expect(sc.limit).toBe(10)
    expect(sc.reset_at).toBe(DENIED_USAGE_GATE.resetAt)
  })

  it('does NOT call incrementUsage when denied', async () => {
    const t = getTool(toolName)
    if (!t) return
    await t.handler(VALID_INPUTS[toolName], ctx)
    expect(incrementUsageMock).not.toHaveBeenCalled()
  })

  it('does NOT call runSherpaChat when denied', async () => {
    const t = getTool(toolName)
    if (!t) return
    await t.handler(VALID_INPUTS[toolName], ctx)
    expect(runSherpaChatMock).not.toHaveBeenCalled()
  })
})
