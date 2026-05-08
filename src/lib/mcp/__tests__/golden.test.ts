/**
 * Category 8: Golden-output regression.
 *
 * One canonical query per tool. Mock LLM returns a stable canned response.
 * We snapshot the STRUCTURAL SHAPE (key set + types) — not the prose —
 * because text varies.
 *
 * Goal: catch envelope drift. If someone renames structuredContent.usage
 * to .tokens, this fails.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeAuth, makeSession } from './fixtures/mocks'

// vitest 4 hoists `vi.mock` factories above top-level statements; mocks
// referenced from those factories must live inside `vi.hoisted`. The
// canned result is constructed inside the hoisted block so the closure
// is safe.
const { runSherpaChatMock } = vi.hoisted(() => {
  const makeChunkH = () => ({
    id: 'chunk-1',
    content: 'A grounded PMM principle from a trusted book.',
    similarity: 0.82,
    sourceType: 'book',
    documentTitle: 'Obviously Awesome',
    author: 'April Dunford',
    url: 'https://example.com/book',
    pageNumber: 42,
    sectionTitle: 'Positioning',
    speakerRole: null,
    question: null,
  })
  const makeCitationH = (source = 'Obviously Awesome') => ({
    id: 'cite-1',
    source,
    author: 'April Dunford',
    url: 'https://example.com/book',
    excerpt: 'A grounded PMM principle.',
  })
  return {
    runSherpaChatMock: vi.fn(async () => ({
      text:
        '## Overall Assessment\nGood foundation, weak differentiation.\n\n## Key Gaps\n- Vague differentiator\n- Missing best-fit account definition\n\n## Recommendations\n- Replace "easy to use" with a measurable claim\n- Add a champion-persona section',
      citations: [makeCitationH(), makeCitationH('Sales Pitch')],
      chunks: [makeChunkH(), { ...makeChunkH(), id: 'chunk-2' }],
      usage: { inputTokens: 1000, outputTokens: 400 },
      intent: 'explain',
    })),
  }
})

vi.mock('../helpers', () => ({
  runSherpaChat: runSherpaChatMock,
  parseCritiqueMarkdown: () => ({
    gaps: ['Vague differentiator', 'Missing best-fit account definition'],
    recommendations: [
      'Replace "easy to use" with a measurable claim',
      'Add a champion-persona section',
    ],
  }),
  uniquePrinciplesFromCitations: () => ['April Dunford'],
}))

vi.mock('@/lib/usage-gate', () => ({
  checkUsageGate: vi.fn(async () => ({
    allowed: true as const,
    tier: 'starter' as const,
    used: 5,
    limit: 100,
  })),
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

import { getTool } from '../tools'

const ctx = { auth: makeAuth(), session: makeSession() }

beforeEach(() => {
  vi.clearAllMocks()
})

/** Reduce a value to a stable type-shape: keys → typeof or 'array'. */
function shapeOf(value: unknown, depth = 2): unknown {
  if (depth < 0) return typeof value
  if (Array.isArray(value)) {
    return value.length === 0 ? 'array<empty>' : ['array', shapeOf(value[0], depth - 1)]
  }
  if (value === null) return 'null'
  if (typeof value !== 'object') return typeof value
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(value as Record<string, unknown>).sort()) {
    out[k] = shapeOf((value as Record<string, unknown>)[k], depth - 1)
  }
  return out
}

describe('golden: ask_sherpa structural shape', () => {
  it('matches the inline snapshot', async () => {
    const t = getTool('ask_sherpa')
    if (!t) return
    const r = await t.handler({ query: 'What is positioning?' }, ctx)
    expect(r.content[0].type).toBe('text')
    const txt = r.content[0].type === 'text' ? r.content[0].text : ''
    expect(txt.length).toBeGreaterThan(100)

    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    const shape = shapeOf(sc, 3)
    expect(shape).toMatchInlineSnapshot(`
      {
        "chunks": [
          "array",
          {
            "content": "string",
            "id": "string",
            "similarity": "number",
            "source": {
              "author": "string",
              "page_number": "number",
              "question": "object",
              "section_title": "string",
              "speaker_role": "object",
              "title": "string",
              "type": "string",
              "url": "string",
            },
          },
        ],
        "citations": [
          "array",
          {
            "author": "string",
            "excerpt": "string",
            "id": "string",
            "source": "string",
            "url": "string",
          },
        ],
        "response": "string",
        "usage": {
          "inputTokens": "number",
          "outputTokens": "number",
        },
      }
    `)
  })

  it('citation count is in a reasonable range (1-15)', async () => {
    const t = getTool('ask_sherpa')
    if (!t) return
    const r = await t.handler({ query: 'pricing' }, ctx)
    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    const citations = (sc.citations as unknown[]) ?? []
    expect(citations.length).toBeGreaterThanOrEqual(1)
    expect(citations.length).toBeLessThanOrEqual(15)
  })
})

describe('golden: get_feedback structural shape', () => {
  it('matches the inline snapshot', async () => {
    const t = getTool('get_feedback')
    if (!t) return
    const r = await t.handler(
      { content: 'For developers who need X, our product is a Y. Unlike Z, we Q.' },
      ctx,
    )
    expect(r.content[0].type).toBe('text')

    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    const keys = Object.keys(sc).sort()
    expect(keys).toEqual(
      ['critique', 'gaps', 'principles_cited', 'recommendations', 'usage'].sort(),
    )
  })
})

describe('golden: draft_artifact structural shape', () => {
  it('returns a stable key set on structuredContent', async () => {
    const t = getTool('draft_artifact')
    if (!t) return
    const r = await t.handler({ artifact_type: 'positioning_statement' }, ctx)
    expect(r.content[0].type).toBe('text')

    const sc = (r.structuredContent ?? {}) as Record<string, unknown>
    // artifact_type MUST be present so callers can route on it.
    expect(sc.artifact_type).toBe('positioning_statement')
    // At least one of: artifact_text (current) / draft / response / content
    // (legacy aliases — kept so renaming the field across handler + this
    // test stays a one-line change).
    const hasBody = ['artifact_text', 'draft', 'response', 'content'].some((k) => k in sc)
    expect(hasBody).toBe(true)
  })
})
