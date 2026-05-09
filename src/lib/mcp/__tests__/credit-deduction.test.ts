/**
 * End-to-end credit-flow tests for the four revenue tools.
 *
 *  - 2 credits subtracted from monthly first (zero purchased), then purchased
 *    once monthly is exhausted (deduction order is enforced by SQL CASE in
 *    migration 20260507; here we assert the helper *calls* the RPC with the
 *    right amount and *throws* InsufficientCreditsError when over budget).
 *  - Insufficient balance pre-call → JSON-RPC -32000 error data.
 *  - Tool name lands as `mcp.tool.<name>` in trace metadata.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeAuth, makeSession, ALLOWED_USAGE_GATE, makeSherpaChatResult } from './fixtures/mocks'

const {
  runSherpaChatMock,
  incrementUsageMock,
  checkUsageGateMock,
  checkMcpCreditsMock,
  deductMcpCreditsMock,
  startMcpObservationMock,
} = vi.hoisted(() => ({
  runSherpaChatMock: vi.fn(),
  incrementUsageMock: vi.fn(async () => undefined),
  checkUsageGateMock: vi.fn(),
  checkMcpCreditsMock: vi.fn(),
  deductMcpCreditsMock: vi.fn(async () => ({ monthly_remaining: 8, purchased_remaining: 0 })),
  startMcpObservationMock: vi.fn(),
}))

vi.mock('../helpers', () => ({
  runSherpaChat: runSherpaChatMock,
  parseCritiqueMarkdown: () => ({ gaps: [], recommendations: [] }),
  uniquePrinciplesFromCitations: () => [],
}))

vi.mock('@/lib/usage-gate', () => ({
  checkUsageGate: checkUsageGateMock,
  incrementUsage: incrementUsageMock,
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(async () => ({
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
    }),
  })),
}))

vi.mock('../tracing', () => ({
  startMcpObservation: startMcpObservationMock,
}))

vi.mock('../credits', async () => {
  // Real InsufficientCreditsError class — needed so the route-level catch
  // can `instanceof` it. Mock the helpers, keep the class.
  const actual = await vi.importActual<typeof import('../credits')>('../credits')
  return {
    ...actual,
    checkMcpCredits: checkMcpCreditsMock,
    deductMcpCredits: deductMcpCreditsMock,
    getCreditBalance: vi.fn(async () => ({
      plan: 'starter',
      monthly_remaining: 100,
      purchased_remaining: 0,
      total_remaining: 100,
    })),
  }
})

import { getTool } from '../tools'
import { InsufficientCreditsError, MCP_CREDIT_COST_PER_CALL } from '../credits'

const ctx = { auth: makeAuth(), session: makeSession() }

const TOOLS = ['ask_sherpa', 'draft_artifact', 'get_feedback', 'scope_pmm_research'] as const

const VALID_INPUTS: Record<(typeof TOOLS)[number], Record<string, unknown>> = {
  ask_sherpa: { query: 'How should I price a developer tool?' },
  draft_artifact: { artifact_type: 'positioning_statement' },
  get_feedback: { content: 'Our positioning statement: For developers who...' },
  scope_pmm_research: {
    question: 'How should a Series B observability startup position against Datadog?',
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  // Bypass startMcpObservation so the tool handler runs directly with a
  // stub span. Required because the real tracing helper opens an OTel
  // observation that doesn't exist in unit-test env.
  startMcpObservationMock.mockImplementation(
    async (_n: string, _c: unknown, fn: (s: unknown) => unknown) =>
      fn({ update: () => undefined, otelSpan: { setAttribute: () => undefined } }),
  )
  checkUsageGateMock.mockResolvedValue(ALLOWED_USAGE_GATE)
  // Sufficient balance by default — individual tests override.
  checkMcpCreditsMock.mockResolvedValue({
    allowed: true,
    balance: { plan: 'starter', monthly_remaining: 100, purchased_remaining: 0, total_remaining: 100 },
  })
  // scope_pmm_research expects valid JSON in the response.
  runSherpaChatMock.mockResolvedValue(
    makeSherpaChatResult({
      text: JSON.stringify({
        angle: 'Position by buyer urgency, not feature parity.',
        sub_questions: ['Who actually buys observability?'],
        sources_to_weight: ['analyst reports'],
        anti_patterns: ['feature-list comparisons'],
        success_criteria: ['clear ICP narrowing'],
      }),
    }),
  )
})

describe.each(TOOLS)('credit deduction: %s', (toolName) => {
  it('deducts 2 credits via deductMcpCredits on success', async () => {
    const t = getTool(toolName)
    if (!t) return
    await t.handler(VALID_INPUTS[toolName], ctx)
    // fire-and-forget — flush microtasks
    await new Promise((res) => setImmediate(res))
    expect(deductMcpCreditsMock).toHaveBeenCalledTimes(1)
    expect(deductMcpCreditsMock).toHaveBeenCalledWith(ctx.auth.userId, MCP_CREDIT_COST_PER_CALL)
  })

  it('throws InsufficientCreditsError before any LLM call when balance < 2', async () => {
    checkMcpCreditsMock.mockResolvedValueOnce({
      allowed: false,
      balance: { plan: 'free', monthly_remaining: 0, purchased_remaining: 0, total_remaining: 0 },
      errorData: { balance: 0, required: 2, purchase_url: 'https://pmmsherpa.com/chat?buy_credits=true' },
    })
    const t = getTool(toolName)
    if (!t) return
    await expect(t.handler(VALID_INPUTS[toolName], ctx)).rejects.toBeInstanceOf(
      InsufficientCreditsError,
    )
    expect(runSherpaChatMock).not.toHaveBeenCalled()
    expect(deductMcpCreditsMock).not.toHaveBeenCalled()
  })

  it('founder plan skips deduction (bypass)', async () => {
    checkMcpCreditsMock.mockResolvedValueOnce({
      allowed: true,
      balance: { plan: 'founder', monthly_remaining: 0, purchased_remaining: 0, total_remaining: 0 },
    })
    const t = getTool(toolName)
    if (!t) return
    await t.handler(VALID_INPUTS[toolName], ctx)
    await new Promise((res) => setImmediate(res))
    expect(deductMcpCreditsMock).not.toHaveBeenCalled()
  })
})

describe('InsufficientCreditsError payload shape', () => {
  it('carries balance + required + purchase_url in data', async () => {
    checkMcpCreditsMock.mockResolvedValueOnce({
      allowed: false,
      balance: { plan: 'free', monthly_remaining: 0, purchased_remaining: 0, total_remaining: 0 },
      errorData: {
        balance: 1,
        required: 2,
        purchase_url: 'https://pmmsherpa.com/chat?buy_credits=true',
      },
    })
    const t = getTool('ask_sherpa')
    if (!t) return
    let caught: unknown
    try {
      await t.handler({ query: 'a question' }, ctx)
    } catch (err) {
      caught = err
    }
    expect(caught).toBeInstanceOf(InsufficientCreditsError)
    const e = caught as InsufficientCreditsError
    expect(e.code).toBe(-32000)
    expect(e.message).toBe('INSUFFICIENT_CREDITS')
    expect(e.data.balance).toBe(1)
    expect(e.data.required).toBe(2)
    expect(e.data.purchase_url).toContain('buy_credits=true')
  })
})

describe.each(TOOLS)('trace name for %s', (toolName) => {
  it(`startMcpObservation receives "mcp.tool.${toolName}" as name`, async () => {
    const t = getTool(toolName)
    if (!t) return
    await t.handler(VALID_INPUTS[toolName], ctx)
    // The tool handler wraps itself in startMcpObservation('mcp.tool.<x>', ...).
    // Assert the first arg of any call matches.
    const calls = startMcpObservationMock.mock.calls
    expect(calls.length).toBeGreaterThan(0)
    const names = calls.map((c) => c[0])
    expect(names).toContain(`mcp.tool.${toolName}`)
  })
})
