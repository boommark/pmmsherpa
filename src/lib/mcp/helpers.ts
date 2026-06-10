/**
 * Shared MCP tool helpers.
 *
 * `runSherpaChat` wraps the same RAG → system prompt → LLM pipeline used
 * by /api/chat, but in a non-streaming form suitable for MCP tool
 * invocations. Both ask_sherpa and get_feedback wrap this.
 *
 * Differences from /api/chat:
 *   - Uses `generateText` (not `streamText`)
 *   - No URL scraping, no Perplexity, no Brave Search, no attachments
 *   - Hardcoded to Claude Sonnet 4.6 for v1 (model param accepted but ignored
 *     by callers)
 *   - Optional intent override (get_feedback forces `review`)
 *   - Optional system prompt suffix appended to the dynamic part
 */

import { generateText, streamText } from 'ai'
import { multiQueryRetrieve, extractCitations, formatContextForPrompt } from '@/lib/rag/retrieval'
import { planQueries, type QueryPlan } from '@/lib/rag/query-planner'
import { getSystemPromptParts } from '@/lib/llm/system-prompt'
import { getModel, MODEL_CONFIG } from '@/lib/llm/provider-factory'
import type { Citation } from '@/types/database'
import type { RetrievedChunk } from '@/types/chat'

/**
 * Hardcoded for v1. Tool schemas accept `model` but the value is ignored.
 *
 * 2026-05-09: Switched from Sonnet 4.6 → Haiku 4.5 after a side-by-side
 * comparison (scripts/compare-models.ts) on a representative positioning
 * prompt: Haiku decoded ~2x faster (66 vs 37 tok/s on the same Anthropic
 * account, confirming the Sonnet ceiling is per-model not per-tier) and
 * produced an answer indistinguishable from Sonnet on voice + grounding.
 * Cost drops ~5x on input, ~3x on output. Easy to flip back if quality
 * regresses on longer-form synthesis (draft_artifact / get_feedback).
 */
const MCP_MODEL = 'claude-haiku' as const

export interface RunSherpaChatInput {
  message: string
  userId: string
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  /** Appended to the dynamic system prompt part — used by get_feedback. */
  customSystemPromptSuffix?: string
  /** Force a specific intent (skips planner intent for retrieval boosts). */
  intentOverride?: QueryPlan['intent']
  /**
   * If provided, the LLM call streams via `streamText` and `onChunk` is invoked
   * with each text delta as it arrives. The full text is still accumulated
   * and returned in the result. When omitted, behaves identically to the
   * non-streaming `generateText` path.
   */
  onChunk?: (delta: string) => void
}

export interface RunSherpaChatOutput {
  text: string
  citations: Citation[]
  chunks: RetrievedChunk[]
  usage: { inputTokens: number; outputTokens: number }
  intent: QueryPlan['intent']
}

/**
 * How long Phase 1 waits for the LLM query planner before proceeding with
 * baseline retrieval on the raw message. The planner (Gemini Flash Lite)
 * typically takes 1-2s — longer than the entire baseline hybrid search — so
 * on most calls it only wins when its in-memory cache hits (instant). The
 * deadline keeps cache hits and drops cold planner calls out of the
 * critical path, cutting ~1.5-2s off typical MCP latency.
 */
const PLANNER_DEADLINE_MS = Number(process.env.MCP_PLANNER_DEADLINE_MS ?? 900)

/** Loose normalization for "is this planner query just the raw message?" */
function normalizeQuery(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
}

export async function runSherpaChat(input: RunSherpaChatInput): Promise<RunSherpaChatOutput> {
  const { message, userId, conversationHistory = [], customSystemPromptSuffix, intentOverride, onChunk } = input

  // Phases 1+2 run CONCURRENTLY: baseline retrieval on the raw message
  // starts immediately while the planner races a short deadline. If the
  // planner returns in time (in practice: its cache hit), we additionally
  // retrieve its refined queries and merge; if not, the baseline result
  // ships alone and the planner call is abandoned (its promise settles
  // harmlessly in the background and seeds the cache for the next turn).
  const plannerPromise = planQueries({ message, conversationHistory }, userId)
  plannerPromise.catch(() => {}) // never let an abandoned planner reject unhandled

  const baselinePromise = multiQueryRetrieve([message], 10, userId, intentOverride)

  const queryPlan = await Promise.race<QueryPlan | null>([
    plannerPromise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), PLANNER_DEADLINE_MS)),
  ]).catch(() => null)

  const intent: QueryPlan['intent'] = intentOverride ?? queryPlan?.intent ?? 'general'

  // Kick off the planner's refined queries (if any) BEFORE awaiting the
  // baseline so the two retrievals overlap instead of running serially.
  const rawNorm = normalizeQuery(message)
  const extraQueries = queryPlan
    ? queryPlan.ragQueries.filter((q) => normalizeQuery(q) !== rawNorm)
    : []
  const extraPromise = extraQueries.length > 0
    ? multiQueryRetrieve(extraQueries, 10, userId, intent)
    : null

  const baseline = await baselinePromise
  let chunks: RetrievedChunk[]
  if (extraPromise) {
    const extra = await extraPromise
    // Merge + dedup by chunk id, keep highest score, re-rank, cap at 10.
    const merged = new Map<string, RetrievedChunk>()
    for (const c of [...baseline.chunks, ...extra.chunks]) {
      const existing = merged.get(c.id)
      if (!existing || c.similarity > existing.similarity) merged.set(c.id, c)
    }
    chunks = Array.from(merged.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
  } else {
    chunks = baseline.chunks
  }

  // Empty-result short-circuit: caller decides what to do.
  if (chunks.length === 0) {
    return {
      text: '',
      citations: [],
      chunks: [],
      usage: { inputTokens: 0, outputTokens: 0 },
      intent,
    }
  }

  // Phase 3: Assemble context + system prompt
  const retrievedContext = formatContextForPrompt(chunks)
  const citations = extractCitations(chunks)

  const systemParts = getSystemPromptParts(retrievedContext, MCP_MODEL)
  const dynamicPart = customSystemPromptSuffix
    ? systemParts.dynamicPart + '\n\n' + customSystemPromptSuffix
    : systemParts.dynamicPart

  // Build messages — Anthropic supports prompt caching with two system parts.
  const isAnthropic = MODEL_CONFIG[MCP_MODEL].provider === 'anthropic'
  const systemMessages = isAnthropic
    ? [
        {
          role: 'system' as const,
          content: systemParts.staticPart,
          providerOptions: {
            // 1-hour TTL: MCP traffic is sparse enough that the default 5-min
            // ephemeral cache expires between calls (every "warm" trace shows
            // input_cache_creation_5m=5538, input_cached_tokens=0 — paying
            // the 1.25× write surcharge every call without ever hitting the
            // 0.1× read discount). 1h covers normal session bursts.
            anthropic: { cacheControl: { type: 'ephemeral' as const, ttl: '1h' as const } },
          },
        },
        {
          role: 'system' as const,
          content: dynamicPart,
        },
      ]
    : [
        {
          role: 'system' as const,
          content: systemParts.staticPart + dynamicPart,
        },
      ]

  const allMessages = [
    ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: message },
  ]

  // Phase 4: LLM call.
  //
  // Latency note (verified 2026-05-03 via Langfuse trace
  // 000000000000000080c730265da04009): output rate was ~39 tok/s, well below
  // Sonnet's normal 70-80 tok/s. Diff was extended-thinking time hidden under
  // `effort: 'medium'` — invisible reasoning tokens added ~10s with marginal
  // quality lift on corpus-grounded synthesis. Dropped here.
  //
  // Streams via `streamText` when `onChunk` is provided so the route can
  // emit MCP `notifications/progress` to the host (perceived TTFB ~3s vs
  // ~14s warm). Without onChunk we still use generateText so tests and
  // non-MCP callers get a single awaitable.
  const llmModel = getModel(MCP_MODEL)
  const llmCallOpts = {
    model: llmModel,
    messages: [...systemMessages, ...allMessages],
    maxOutputTokens: 2048,
    temperature: 0.7,
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'mcp.runSherpaChat',
      metadata: {
        userId,
        model: MCP_MODEL,
        intent,
        streaming: !!onChunk,
      },
    },
  }

  let text: string
  let inputTokens = 0
  let outputTokens = 0

  if (onChunk) {
    const stream = streamText(llmCallOpts)
    let acc = ''
    for await (const delta of stream.textStream) {
      acc += delta
      onChunk(delta)
    }
    text = acc
    const usage = await stream.usage
    inputTokens = usage?.inputTokens ?? 0
    outputTokens = usage?.outputTokens ?? 0
  } else {
    const result = await generateText(llmCallOpts)
    text = result.text
    inputTokens = result.usage?.inputTokens ?? 0
    outputTokens = result.usage?.outputTokens ?? 0
  }

  return {
    text,
    citations,
    chunks,
    usage: { inputTokens, outputTokens },
    intent,
  }
}

/**
 * Warm the Anthropic prompt cache for the MCP static system prompt.
 *
 * Fired (fire-and-forget via `after()`) when an MCP session initializes, so
 * the user's FIRST real tool call hits the 1h prompt cache instead of paying
 * the cache-write penalty (~2-3s slower TTFB plus the 1.25× write surcharge).
 * The warm request reproduces the exact cached prefix: the static system part
 * with the same cacheControl options, identical to what runSherpaChat sends.
 * Costs ~1 output token + one cache write that the first real call would have
 * paid anyway.
 */
export async function warmMcpPromptCache(): Promise<void> {
  if (MODEL_CONFIG[MCP_MODEL].provider !== 'anthropic') return
  try {
    const systemParts = getSystemPromptParts('', MCP_MODEL)
    await generateText({
      model: getModel(MCP_MODEL),
      messages: [
        {
          role: 'system' as const,
          content: systemParts.staticPart,
          providerOptions: {
            anthropic: { cacheControl: { type: 'ephemeral' as const, ttl: '1h' as const } },
          },
        },
        { role: 'user' as const, content: 'ping' },
      ],
      maxOutputTokens: 1,
      temperature: 0,
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'mcp.warmPromptCache',
      },
    })
  } catch (err) {
    // Warm-up is best-effort; never let it surface to the caller.
    console.warn('[MCP] prompt cache warm failed', err)
  }
}

/**
 * Parse a markdown critique into structured gaps and recommendations.
 * Looks for "## Key Gaps" and "## Recommendations" sections and splits
 * each list item by leading "- ". Tolerant of variations in heading
 * casing/spacing.
 */
export function parseCritiqueMarkdown(text: string): {
  gaps: string[]
  recommendations: string[]
} {
  const extractSection = (heading: RegExp): string => {
    const lines = text.split('\n')
    let inSection = false
    const collected: string[] = []
    for (const line of lines) {
      if (heading.test(line.trim())) {
        inSection = true
        continue
      }
      // Any new "## " heading ends the current section.
      if (inSection && /^##\s+/.test(line.trim())) {
        break
      }
      if (inSection) collected.push(line)
    }
    return collected.join('\n')
  }

  const splitItems = (block: string): string[] => {
    return block
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^[-*]\s+/.test(l))
      .map((l) => l.replace(/^[-*]\s+/, '').trim())
      .filter((l) => l.length > 0)
  }

  const gapsBlock = extractSection(/^##\s+key\s+gaps\b/i)
  const recsBlock = extractSection(/^##\s+recommendations\b/i)

  return {
    gaps: splitItems(gapsBlock),
    recommendations: splitItems(recsBlock),
  }
}

/**
 * Extract unique principle "sources" from citations — used to populate
 * `principles_cited` for get_feedback. Falls back to author when
 * present, else the document title.
 */
export function uniquePrinciplesFromCitations(citations: Citation[]): string[] {
  const set = new Set<string>()
  for (const c of citations) {
    const key = c.author?.trim() || c.source?.trim()
    if (key) set.add(key)
  }
  return Array.from(set)
}
