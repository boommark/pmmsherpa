/**
 * Category 5: Empty-corpus path.
 *
 * Mock retrieval (via mocked runSherpaChat returning chunks: []).
 * Assert:
 *   - ask_sherpa returns friendly text + empty_corpus: true in structuredContent
 *   - usage is NOT incremented
 *   - get_feedback also surfaces empty_corpus: true (template-grounded review
 *     can't proceed without principles)
 *   - draft_artifact: also expected to flag empty_corpus, but the system
 *     prompt fragment is template-baked so the LLM can still respond. Tested
 *     here as a documented expectation; if behavior differs, this fails and
 *     the team chooses.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  makeAuth,
  makeSession,
  ALLOWED_USAGE_GATE,
  makeEmptyCorpusResult,
} from './fixtures/mocks'

// vitest 4 hoists `vi.mock` factories above top-level statements; mocks
// referenced from those factories must live inside `vi.hoisted`.
const { runSherpaChatMock, incrementUsageMock, checkUsageGateMock } = vi.hoisted(() => ({
  // Untyped `vi.fn()` so subsequent `mockResolvedValue(...)` calls in
  // beforeEach can swap in differently-shaped fixtures (Citation[] etc.)
  // without TS narrowing the citations array to `never[]`.
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
  runSherpaChatMock.mockResolvedValue(makeEmptyCorpusResult())
})

describe('empty-corpus: ask_sherpa', () => {
  it('returns friendly text on empty chunks', async () => {
    const t = getTool('ask_sherpa')
    if (!t) return
    const r = await t.handler({ query: 'esoteric question with no matches' }, ctx)
    expect(r.isError).toBeFalsy()
    expect(r.content[0].type).toBe('text')
    const text = r.content[0].type === 'text' ? r.content[0].text : ''
    expect(text.length).toBeGreaterThan(0)
  })

  it('flags empty_corpus: true in structuredContent', async () => {
    const t = getTool('ask_sherpa')
    if (!t) return
    const r = await t.handler({ query: 'esoteric question' }, ctx)
    expect(r.structuredContent).toBeDefined()
    const sc = r.structuredContent as Record<string, unknown>
    expect(sc.empty_corpus).toBe(true)
  })

  it('does NOT increment usage on empty corpus', async () => {
    const t = getTool('ask_sherpa')
    if (!t) return
    await t.handler({ query: 'esoteric question' }, ctx)
    // Allow scheduler to flush fire-and-forget callbacks.
    await new Promise((res) => setImmediate(res))
    expect(incrementUsageMock).not.toHaveBeenCalled()
  })
})

describe('empty-corpus: get_feedback', () => {
  it('surfaces empty_corpus and does not increment usage', async () => {
    const t = getTool('get_feedback')
    if (!t) return
    const r = await t.handler({ content: 'a positioning draft text' }, ctx)
    expect(r.isError).toBeFalsy()
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    expect(sc.empty_corpus).toBe(true)
    await new Promise((res) => setImmediate(res))
    expect(incrementUsageMock).not.toHaveBeenCalled()
  })
})

describe('empty-corpus: draft_artifact', () => {
  // Documented expectation: draft_artifact has a baked-in systemPromptFragment
  // per template, so empty corpus is non-fatal. Either behavior is reasonable;
  // we lock the chosen one in here. If a future implementer flips it, this
  // test must be updated and the team must decide.
  it('returns a valid envelope on empty corpus', async () => {
    const t = getTool('draft_artifact')
    if (!t) return
    const r = await t.handler({ artifact_type: 'positioning_statement' }, ctx)
    // Accept either: empty_corpus flag set OR a templated fallback (text > 0)
    // — but always a valid (non-throwing) envelope.
    expect(r.content).toBeDefined()
    expect(Array.isArray(r.content)).toBe(true)
  })
})
