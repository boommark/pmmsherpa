/**
 * Category 4: Usage gate.
 *
 * Mocks `checkUsageGate` to deny. Asserts that EVERY revenue-relevant
 * tool returns the structured limit-exceeded envelope without calling
 * incrementUsage and without making any LLM call.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeAuth, makeSession, DENIED_USAGE_GATE } from './fixtures/mocks'

// vitest 4 hoists `vi.mock` factories above top-level statements; mocks
// referenced from those factories must live inside `vi.hoisted`.
const { checkUsageGateMock, incrementUsageMock, runSherpaChatMock } = vi.hoisted(() => ({
  checkUsageGateMock: vi.fn(),
  incrementUsageMock: vi.fn(),
  runSherpaChatMock: vi.fn(async () => ({
    text: 'stub',
    citations: [],
    chunks: [],
    usage: { inputTokens: 0, outputTokens: 0 },
    intent: 'explain',
  })),
}))

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

vi.mock('../credits', () => ({
  checkMcpCredits: async () => ({
    allowed: true,
    balance: { plan: 'starter', monthly_remaining: 100, purchased_remaining: 0, total_remaining: 100 },
  }),
  deductMcpCredits: async () => ({ monthly_remaining: 98, purchased_remaining: 0 }),
  getCreditBalance: async () => ({
    plan: 'starter',
    monthly_remaining: 100,
    purchased_remaining: 0,
    total_remaining: 100,
  }),
  InsufficientCreditsError: class extends Error {
    code = -32000
    data = { balance: 0, required: 2, purchase_url: '' }
  },
  MCP_CREDIT_COST_PER_CALL: 2,
  MCP_FREE_MONTHLY_LIMIT: 10,
  MCP_STARTER_MONTHLY_LIMIT: 200,
  MCP_INSUFFICIENT_CREDITS_CODE: -32000,
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
