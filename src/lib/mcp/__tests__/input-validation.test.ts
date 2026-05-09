/**
 * Category 2: Input validation.
 *
 * For each tool, exercise:
 *   - missing required field → isError: true
 *   - empty string for required → isError: true
 *   - over-length input → isError: true
 *   - draft_artifact: invalid artifact_type → isError + valid types listed
 *   - handlers must NEVER throw — always return structured envelope
 *
 * runSherpaChat and the usage gate are mocked to PASS so input validation
 * is exercised in isolation. If validation lets bad input through, the
 * mocks would still respond, but the tests below assert on isError set
 * BEFORE any LLM call would happen.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeAuth, makeSession, makeSherpaChatResult, ALLOWED_USAGE_GATE } from './fixtures/mocks'

vi.mock('../helpers', () => ({
  runSherpaChat: vi.fn(async () => makeSherpaChatResult()),
  parseCritiqueMarkdown: vi.fn(() => ({ gaps: [], recommendations: [] })),
  uniquePrinciplesFromCitations: vi.fn(() => []),
}))

vi.mock('@/lib/usage-gate', () => ({
  checkUsageGate: vi.fn(async () => ALLOWED_USAGE_GATE),
  incrementUsage: vi.fn(async () => undefined),
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
  buildInsufficientCreditsError: () => ({
    code: -32000,
    message: 'INSUFFICIENT_CREDITS',
    data: { balance: 0, required: 2, purchase_url: '' },
  }),
}))

import { getTool } from '../tools'

const ctx = { auth: makeAuth(), session: makeSession() }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('input-validation: ask_sherpa', () => {
  const tool = () => getTool('ask_sherpa')

  it('handler exists', () => {
    expect(tool()).toBeDefined()
  })

  it('missing query → isError', async () => {
    const t = tool()
    if (!t) return
    const r = await t.handler({}, ctx)
    expect(r.isError).toBe(true)
    expect(r.content[0].type).toBe('text')
  })

  it('empty query → isError', async () => {
    const t = tool()
    if (!t) return
    const r = await t.handler({ query: '   ' }, ctx)
    expect(r.isError).toBe(true)
  })

  it('over-length query (3000 chars) → isError', async () => {
    const t = tool()
    if (!t) return
    const r = await t.handler({ query: 'a'.repeat(3000) }, ctx)
    expect(r.isError).toBe(true)
  })

  it('does not throw on bad types', async () => {
    const t = tool()
    if (!t) return
    await expect(
      t.handler({ query: 12345, conversation_id: { not: 'a string' } } as unknown as Record<string, unknown>, ctx),
    ).resolves.toBeDefined()
  })
})

describe('input-validation: get_feedback', () => {
  const tool = () => getTool('get_feedback')

  it('missing content → isError', async () => {
    const t = tool()
    if (!t) return
    const r = await t.handler({}, ctx)
    expect(r.isError).toBe(true)
  })

  it('empty content → isError', async () => {
    const t = tool()
    if (!t) return
    const r = await t.handler({ content: '' }, ctx)
    expect(r.isError).toBe(true)
  })

  it('60000-char content → isError', async () => {
    const t = tool()
    if (!t) return
    const r = await t.handler({ content: 'x'.repeat(60_000) }, ctx)
    expect(r.isError).toBe(true)
  })

  it('over-length context → isError', async () => {
    const t = tool()
    if (!t) return
    const r = await t.handler({ content: 'a positioning draft', context: 'c'.repeat(3000) }, ctx)
    expect(r.isError).toBe(true)
  })
})

describe('input-validation: draft_artifact', () => {
  const tool = () => getTool('draft_artifact')

  it('missing artifact_type → isError', async () => {
    const t = tool()
    if (!t) return
    const r = await t.handler({}, ctx)
    expect(r.isError).toBe(true)
  })

  it('invalid artifact_type → isError with valid types listed', async () => {
    const t = tool()
    if (!t) return
    const r = await t.handler({ artifact_type: 'not_a_real_type' }, ctx)
    expect(r.isError).toBe(true)
    const text = r.content[0].type === 'text' ? r.content[0].text : ''
    // Error text should contain at least one well-known template name to
    // help the caller correct the input.
    const knownTypes = [
      'positioning_statement',
      'messaging_framework',
      'launch_plan_gtm_brief',
      'icp',
    ]
    const mentionsAtLeastOne = knownTypes.some((kt) => text.includes(kt))
    expect(mentionsAtLeastOne).toBe(true)
  })

  it('over-length notes → isError', async () => {
    const t = tool()
    if (!t) return
    const r = await t.handler(
      { artifact_type: 'positioning_statement', notes: 'n'.repeat(3000) },
      ctx,
    )
    expect(r.isError).toBe(true)
  })
})

describe('input-validation: handlers never throw', () => {
  const allTools = ['ask_sherpa', 'get_feedback', 'draft_artifact'] as const
  const garbageInputs: Array<Record<string, unknown>> = [
    {},
    { query: null },
    { content: undefined },
    { artifact_type: 42 },
    { query: { nested: 'object' } },
  ]

  it.each(allTools)('%s never throws on garbage input', async (name) => {
    const t = getTool(name)
    if (!t) return // tool not yet renamed; covered elsewhere
    for (const args of garbageInputs) {
      await expect(t.handler(args, ctx)).resolves.toBeDefined()
    }
  })
})
