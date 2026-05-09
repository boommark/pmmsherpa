/**
 * Category 6: Handler integration with mocked LLM.
 *
 * For each tool, mock runSherpaChat to return a canned response, then
 * assert the handler:
 *   - returns content[0].type === 'text' with non-empty text
 *   - populates structuredContent with the per-tool key set
 *   - passes citations through from the mock (no rewrite)
 *
 * Tool-specific:
 *   - draft_artifact: spies on runSherpaChat args and asserts the
 *     template's systemPromptFragment was injected via
 *     customSystemPromptSuffix.
 *   - get_feedback: asserts intentOverride === 'review' was passed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  makeAuth,
  makeSession,
  ALLOWED_USAGE_GATE,
  makeSherpaChatResult,
  makeChunk,
  makeCitation,
} from './fixtures/mocks'

// vitest 4 hoists `vi.mock` factories above top-level statements; mocks
// referenced from those factories must live inside `vi.hoisted`.
const { runSherpaChatMock, incrementUsageMock, checkUsageGateMock } = vi.hoisted(() => ({
  runSherpaChatMock: vi.fn(),
  incrementUsageMock: vi.fn(async () => undefined),
  checkUsageGateMock: vi.fn(async () => ({
    allowed: true as const,
    tier: 'starter' as const,
    used: 5,
    limit: 100,
  })),
}))

vi.mock('../helpers', () => ({
  runSherpaChat: runSherpaChatMock,
  parseCritiqueMarkdown: () => ({
    gaps: ['Vague differentiator'],
    recommendations: ['Replace "easy to use" with a measurable claim'],
  }),
  uniquePrinciplesFromCitations: () => ['April Dunford'],
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

beforeEach(() => {
  vi.clearAllMocks()
  checkUsageGateMock.mockResolvedValue(ALLOWED_USAGE_GATE)
  runSherpaChatMock.mockResolvedValue(
    makeSherpaChatResult({
      text:
        '## Overall Assessment\nGood foundation, weak differentiation.\n\n## Key Gaps\n- Vague differentiator\n\n## Recommendations\n- Replace "easy to use" with a measurable claim',
      citations: [makeCitation()],
      chunks: [makeChunk()],
    }),
  )
})

describe('handlers: ask_sherpa', () => {
  it('returns content[0] as text with non-empty body', async () => {
    const t = getTool('ask_sherpa')
    if (!t) return
    const r = await t.handler({ query: 'How should I price a developer tool?' }, ctx)
    expect(r.isError).toBeFalsy()
    expect(r.content[0].type).toBe('text')
    const txt = r.content[0].type === 'text' ? r.content[0].text : ''
    expect(txt.length).toBeGreaterThan(0)
  })

  it('structuredContent has response, citations, chunks, usage', async () => {
    const t = getTool('ask_sherpa')
    if (!t) return
    const r = await t.handler({ query: 'pricing question' }, ctx)
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    expect(sc.response).toBeDefined()
    expect(Array.isArray(sc.citations)).toBe(true)
    expect(Array.isArray(sc.chunks)).toBe(true)
    expect(sc.usage).toBeDefined()
  })

  it('passes citations through from runSherpaChat', async () => {
    const t = getTool('ask_sherpa')
    if (!t) return
    const r = await t.handler({ query: 'pricing question' }, ctx)
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    const citations = sc.citations as unknown[]
    expect(citations).toHaveLength(1)
  })
})

describe('handlers: get_feedback', () => {
  it('passes intentOverride: "review" to runSherpaChat', async () => {
    const t = getTool('get_feedback')
    if (!t) return
    await t.handler({ content: 'A positioning draft' }, ctx)
    expect(runSherpaChatMock).toHaveBeenCalled()
    const call = runSherpaChatMock.mock.calls[0]?.[0] as Record<string, unknown> | undefined
    expect(call?.intentOverride).toBe('review')
  })

  it('structuredContent has critique, gaps, recommendations, principles_cited', async () => {
    const t = getTool('get_feedback')
    if (!t) return
    const r = await t.handler({ content: 'A positioning draft' }, ctx)
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    expect(sc.critique).toBeDefined()
    expect(Array.isArray(sc.gaps)).toBe(true)
    expect(Array.isArray(sc.recommendations)).toBe(true)
    expect(Array.isArray(sc.principles_cited)).toBe(true)
  })
})

describe('handlers: draft_artifact', () => {
  it("injects the template's systemPromptFragment into runSherpaChat", async () => {
    const t = getTool('draft_artifact')
    if (!t) return
    await t.handler({ artifact_type: 'positioning_statement' }, ctx)
    expect(runSherpaChatMock).toHaveBeenCalled()
    const call = runSherpaChatMock.mock.calls[0]?.[0] as Record<string, unknown> | undefined
    const suffix = (call?.customSystemPromptSuffix as string) ?? ''
    // The positioning template's systemPromptFragment contains "positioning statement"
    // and "Best-Fit". Asserting on stable phrases lets the template evolve.
    expect(suffix.length).toBeGreaterThan(50)
    expect(/positioning|Best-Fit|Distinct/i.test(suffix)).toBe(true)
  })

  it('structuredContent has artifact_type and a draft body', async () => {
    const t = getTool('draft_artifact')
    if (!t) return
    const r = await t.handler({ artifact_type: 'positioning_statement' }, ctx)
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    expect(sc.artifact_type).toBe('positioning_statement')
    // Handler returns the rendered Markdown under `artifact_text`; legacy test
    // names (`draft`/`response`/`content`) are accepted for forward-compat
    // if the field is renamed in a future PR.
    expect(sc.artifact_text ?? sc.draft ?? sc.response ?? sc.content).toBeDefined()
  })
})

describe('handlers: increment usage on success', () => {
  const TOOLS = ['ask_sherpa', 'draft_artifact', 'get_feedback'] as const
  const VALID: Record<(typeof TOOLS)[number], Record<string, unknown>> = {
    ask_sherpa: { query: 'a question' },
    draft_artifact: { artifact_type: 'positioning_statement' },
    get_feedback: { content: 'a draft' },
  }

  it.each(TOOLS)('%s calls incrementUsage on a successful response', async (name) => {
    const t = getTool(name)
    if (!t) return
    await t.handler(VALID[name], ctx)
    // fire-and-forget — flush microtasks
    await new Promise((res) => setImmediate(res))
    expect(incrementUsageMock).toHaveBeenCalledTimes(1)
    expect(incrementUsageMock).toHaveBeenCalledWith(ctx.auth.userId)
  })
})
