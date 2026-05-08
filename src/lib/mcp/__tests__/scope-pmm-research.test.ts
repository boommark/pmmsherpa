/**
 * Handler tests for `scope_pmm_research`.
 *
 * Covers:
 *   - Tool listed in tools/list response (4 tools total)
 *   - Handler returns parseable JSON matching the Zod schema (happy path)
 *   - Markdown-fence stripping works (```json ... ``` and bare ``` ... ```)
 *   - Invalid JSON from LLM returns structured error, not throw
 *   - JSON that parses but fails Zod shape returns structured error
 *   - Empty corpus returns graceful empty shape, no usage increment
 *   - intentOverride: 'review' is passed to runSherpaChat
 *   - customSystemPromptSuffix is passed (and constrains to JSON output)
 *   - sub_questions defensive cap (≤ 7) is applied
 *   - onChunk is NOT passed (no streaming for this tool)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  makeAuth,
  makeSession,
  ALLOWED_USAGE_GATE,
  makeSherpaChatResult,
  makeChunk,
  makeCitation,
  makeEmptyCorpusResult,
} from './fixtures/mocks'

// vitest 4 hoists `vi.mock` factories above top-level statements, so any
// mock state shared between the factory and the test body must be wrapped
// in `vi.hoisted` to survive that hoist.
const { runSherpaChatMock, incrementUsageMock, checkUsageGateMock } = vi.hoisted(() => ({
  runSherpaChatMock: vi.fn(),
  incrementUsageMock: vi.fn(async () => undefined),
  checkUsageGateMock: vi.fn(async () => ALLOWED_USAGE_GATE_HOIST),
}))

// `vi.hoisted` runs before imports, so we can't use the imported
// ALLOWED_USAGE_GATE inside it. Re-declare a local equivalent here.
const ALLOWED_USAGE_GATE_HOIST = {
  allowed: true as const,
  tier: 'starter' as const,
  used: 5,
  limit: 100,
}

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

import { getTool, listToolsForRpc, stripJsonFences, scopeResultSchema } from '../tools'

const ctx = { auth: makeAuth(), session: makeSession() }

const VALID_SCOPE_JSON = {
  angle: 'Position against the Datadog hegemony by leading with developer-experience and cost-per-host.',
  sub_questions: [
    'Who is the most underserved buyer segment in observability today?',
    'What use cases does Datadog handle poorly?',
    'What pricing models would create switching pressure?',
  ],
  sources_to_weight: [
    'April Dunford on positioning vs alternatives',
    'PMA blog on developer-tool GTM',
  ],
  anti_patterns: ['feature-list framing vs Datadog', 'audience = everyone with logs'],
  success_criteria: [
    'A buyer segment + use case where Datadog loses',
    'A pricing wedge that does not invite a price war',
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  checkUsageGateMock.mockResolvedValue(ALLOWED_USAGE_GATE)
  runSherpaChatMock.mockResolvedValue(
    makeSherpaChatResult({
      text: JSON.stringify(VALID_SCOPE_JSON),
      citations: [makeCitation()],
      chunks: [makeChunk()],
    }),
  )
})

describe('scope_pmm_research: registry', () => {
  it('appears in tools/list', () => {
    const names = listToolsForRpc().map((t) => t.name)
    expect(names).toContain('scope_pmm_research')
  })

  it('total tool count is 4', () => {
    expect(listToolsForRpc()).toHaveLength(4)
  })
})

describe('scope_pmm_research: happy path', () => {
  it('returns parseable JSON matching the Zod schema', async () => {
    const t = getTool('scope_pmm_research')
    expect(t).toBeDefined()
    if (!t) return
    const r = await t.handler(
      { question: 'how should a Series B observability startup position against Datadog' },
      ctx,
    )
    expect(r.isError).toBeFalsy()
    expect(r.content[0].type).toBe('text')
    const txt = r.content[0].type === 'text' ? r.content[0].text : ''
    const parsed = JSON.parse(txt)
    const validated = scopeResultSchema.safeParse(parsed)
    expect(validated.success).toBe(true)
  })

  it('structuredContent has the agreed shape + citations + usage', async () => {
    const t = getTool('scope_pmm_research')
    if (!t) return
    const r = await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    expect(sc.angle).toBeDefined()
    expect(Array.isArray(sc.sub_questions)).toBe(true)
    expect(Array.isArray(sc.sources_to_weight)).toBe(true)
    expect(Array.isArray(sc.anti_patterns)).toBe(true)
    expect(Array.isArray(sc.success_criteria)).toBe(true)
    expect(Array.isArray(sc.citations)).toBe(true)
    expect(sc.usage).toBeDefined()
  })

  it('passes intentOverride: "review" to runSherpaChat (per spec)', async () => {
    const t = getTool('scope_pmm_research')
    if (!t) return
    await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    expect(runSherpaChatMock).toHaveBeenCalled()
    const call = runSherpaChatMock.mock.calls[0]?.[0] as Record<string, unknown> | undefined
    expect(call?.intentOverride).toBe('review')
  })

  it('passes a non-empty customSystemPromptSuffix that constrains to JSON', async () => {
    const t = getTool('scope_pmm_research')
    if (!t) return
    await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    const call = runSherpaChatMock.mock.calls[0]?.[0] as Record<string, unknown> | undefined
    const suffix = (call?.customSystemPromptSuffix as string) ?? ''
    expect(suffix.length).toBeGreaterThan(50)
    expect(/JSON/i.test(suffix)).toBe(true)
    expect(/sub_questions/.test(suffix)).toBe(true)
  })

  it('does NOT pass onChunk (non-streaming tool)', async () => {
    const t = getTool('scope_pmm_research')
    if (!t) return
    await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    const call = runSherpaChatMock.mock.calls[0]?.[0] as Record<string, unknown> | undefined
    expect(call?.onChunk).toBeUndefined()
  })

  it('increments usage on success', async () => {
    const t = getTool('scope_pmm_research')
    if (!t) return
    await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    await new Promise((res) => setImmediate(res))
    expect(incrementUsageMock).toHaveBeenCalledTimes(1)
    expect(incrementUsageMock).toHaveBeenCalledWith(ctx.auth.userId)
  })
})

describe('scope_pmm_research: markdown fence stripping', () => {
  it('strips ```json ... ``` fenced JSON', async () => {
    runSherpaChatMock.mockResolvedValue(
      makeSherpaChatResult({
        text: '```json\n' + JSON.stringify(VALID_SCOPE_JSON) + '\n```',
        chunks: [makeChunk()],
        citations: [makeCitation()],
      }),
    )
    const t = getTool('scope_pmm_research')
    if (!t) return
    const r = await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    expect(r.isError).toBeFalsy()
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    expect(sc.angle).toBe(VALID_SCOPE_JSON.angle)
  })

  it('strips bare ``` ... ``` fenced JSON', async () => {
    runSherpaChatMock.mockResolvedValue(
      makeSherpaChatResult({
        text: '```\n' + JSON.stringify(VALID_SCOPE_JSON) + '\n```',
        chunks: [makeChunk()],
        citations: [makeCitation()],
      }),
    )
    const t = getTool('scope_pmm_research')
    if (!t) return
    const r = await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    expect(r.isError).toBeFalsy()
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    expect(sc.angle).toBe(VALID_SCOPE_JSON.angle)
  })

  it('stripJsonFences unit: handles all fence variants', () => {
    expect(stripJsonFences('```json\n{"a":1}\n```')).toBe('{"a":1}')
    expect(stripJsonFences('```\n{"a":1}\n```')).toBe('{"a":1}')
    expect(stripJsonFences('{"a":1}')).toBe('{"a":1}')
    expect(stripJsonFences('  {"a":1}  ')).toBe('{"a":1}')
  })
})

describe('scope_pmm_research: error paths', () => {
  it('returns structured error (no throw) for invalid JSON from LLM', async () => {
    runSherpaChatMock.mockResolvedValue(
      makeSherpaChatResult({
        text: 'this is prose, not JSON at all',
        chunks: [makeChunk()],
        citations: [makeCitation()],
      }),
    )
    const t = getTool('scope_pmm_research')
    if (!t) return
    let threw = false
    let r
    try {
      r = await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    } catch {
      threw = true
    }
    expect(threw).toBe(false)
    expect(r?.isError).toBe(true)
    const sc = (r?.structuredContent ?? {}) as Record<string, unknown>
    expect(sc.error).toBe('invalid_json')
    expect(sc.raw).toBe('this is prose, not JSON at all')
  })

  it('returns structured error when JSON parses but fails Zod shape', async () => {
    runSherpaChatMock.mockResolvedValue(
      makeSherpaChatResult({
        text: JSON.stringify({ angle: 'ok', sub_questions: 'should be array' }),
        chunks: [makeChunk()],
        citations: [makeCitation()],
      }),
    )
    const t = getTool('scope_pmm_research')
    if (!t) return
    const r = await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    expect(r.isError).toBe(true)
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    expect(sc.error).toBe('invalid_shape')
    expect(sc.issues).toBeDefined()
    expect(sc.raw).toBeDefined()
  })

  it('rejects question shorter than 10 chars', async () => {
    const t = getTool('scope_pmm_research')
    if (!t) return
    const r = await t.handler({ question: 'short' }, ctx)
    expect(r.isError).toBe(true)
  })

  it('rejects question longer than 2000 chars', async () => {
    const t = getTool('scope_pmm_research')
    if (!t) return
    const r = await t.handler({ question: 'x'.repeat(2001) }, ctx)
    expect(r.isError).toBe(true)
  })
})

describe('scope_pmm_research: empty corpus', () => {
  it('returns graceful empty shape, does not increment usage', async () => {
    runSherpaChatMock.mockResolvedValue(makeEmptyCorpusResult())
    const t = getTool('scope_pmm_research')
    if (!t) return
    const r = await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    expect(r.isError).toBeFalsy()
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    expect(sc.empty_corpus).toBe(true)
    expect(sc.sub_questions).toEqual([])
    expect(sc.angle).toBe('')
    await new Promise((res) => setImmediate(res))
    expect(incrementUsageMock).not.toHaveBeenCalled()
  })
})

describe('scope_pmm_research: defensive caps', () => {
  it('caps sub_questions to 7 max', async () => {
    const tooMany = {
      ...VALID_SCOPE_JSON,
      sub_questions: Array.from({ length: 12 }, (_, i) => `question ${i + 1}`),
    }
    runSherpaChatMock.mockResolvedValue(
      makeSherpaChatResult({
        text: JSON.stringify(tooMany),
        chunks: [makeChunk()],
        citations: [makeCitation()],
      }),
    )
    const t = getTool('scope_pmm_research')
    if (!t) return
    const r = await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    const subQs = sc.sub_questions as string[]
    expect(subQs.length).toBeLessThanOrEqual(7)
  })

  it('caps anti_patterns and success_criteria to 5 max', async () => {
    const tooMany = {
      ...VALID_SCOPE_JSON,
      anti_patterns: Array.from({ length: 9 }, (_, i) => `ap ${i + 1}`),
      success_criteria: Array.from({ length: 9 }, (_, i) => `sc ${i + 1}`),
    }
    runSherpaChatMock.mockResolvedValue(
      makeSherpaChatResult({
        text: JSON.stringify(tooMany),
        chunks: [makeChunk()],
        citations: [makeCitation()],
      }),
    )
    const t = getTool('scope_pmm_research')
    if (!t) return
    const r = await t.handler({ question: 'a real PMM research question that is long enough' }, ctx)
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    expect((sc.anti_patterns as string[]).length).toBeLessThanOrEqual(5)
    expect((sc.success_criteria as string[]).length).toBeLessThanOrEqual(5)
  })
})
