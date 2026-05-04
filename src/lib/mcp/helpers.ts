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

import { generateText } from 'ai'
import { multiQueryRetrieve, extractCitations, formatContextForPrompt } from '@/lib/rag/retrieval'
import { planQueries, type QueryPlan } from '@/lib/rag/query-planner'
import { getSystemPromptParts } from '@/lib/llm/system-prompt'
import { getModel, MODEL_CONFIG } from '@/lib/llm/provider-factory'
import type { Citation } from '@/types/database'
import type { RetrievedChunk } from '@/types/chat'

/** Hardcoded for v1. Tool schemas accept `model` but the value is ignored. */
const MCP_MODEL = 'claude-sonnet' as const

export interface RunSherpaChatInput {
  message: string
  userId: string
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  /** Appended to the dynamic system prompt part — used by get_feedback. */
  customSystemPromptSuffix?: string
  /** Force a specific intent (skips planner intent for retrieval boosts). */
  intentOverride?: QueryPlan['intent']
}

export interface RunSherpaChatOutput {
  text: string
  citations: Citation[]
  chunks: RetrievedChunk[]
  usage: { inputTokens: number; outputTokens: number }
  intent: QueryPlan['intent']
}

export async function runSherpaChat(input: RunSherpaChatInput): Promise<RunSherpaChatOutput> {
  const { message, userId, conversationHistory = [], customSystemPromptSuffix, intentOverride } = input

  // Phase 1: Plan retrieval queries
  const queryPlan = await planQueries(
    {
      message,
      conversationHistory,
    },
    userId,
  )

  const intent: QueryPlan['intent'] = intentOverride ?? queryPlan.intent

  // Phase 2: Multi-query RAG retrieval
  const ragResult = await multiQueryRetrieve(queryPlan.ragQueries, 10, userId, intent)
  const chunks = ragResult.chunks

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
            anthropic: { cacheControl: { type: 'ephemeral' as const } },
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

  // Phase 4: Non-streaming LLM call.
  //
  // Latency note (verified 2026-05-03 via Langfuse trace
  // 000000000000000080c730265da04009): output rate was ~39 tok/s, well below
  // Sonnet's normal 70-80 tok/s. Diff was extended-thinking time hidden under
  // `effort: 'medium'` — invisible reasoning tokens added ~10s with marginal
  // quality lift on corpus-grounded synthesis. Dropped here.
  const llmModel = getModel(MCP_MODEL)
  const result = await generateText({
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
      },
    },
  })

  return {
    text: result.text,
    citations,
    chunks,
    usage: {
      inputTokens: result.usage?.inputTokens ?? 0,
      outputTokens: result.usage?.outputTokens ?? 0,
    },
    intent,
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
