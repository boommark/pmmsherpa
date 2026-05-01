/**
 * MCP tool registry.
 *
 * Each tool declares a JSON Schema (used by tools/list) and an async
 * handler invoked by tools/call. Handlers receive the parsed arguments,
 * an auth context, and the active MCP session — they return an MCP
 * tool result envelope: { content: [...], isError?, structuredContent? }.
 */

import type { McpAuthContext } from './auth-context'
import type { McpSession } from './sessions'
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval'
import type { RetrievedChunk } from '@/types/chat'
import type { SourceType } from '@/types/database'
import { startMcpObservation } from './tracing'
import { runSherpaChat, parseCritiqueMarkdown, uniquePrinciplesFromCitations } from './helpers'
import { checkUsageGate, incrementUsage } from '@/lib/usage-gate'
import { createServiceClient } from '@/lib/supabase/server'

/* ------------------------------------------------------------------ */
/*  Tool result types                                                  */
/* ------------------------------------------------------------------ */

export interface ToolTextContent {
  type: 'text'
  text: string
}

export interface ToolImageContent {
  type: 'image'
  data: string
  mimeType: string
}

export type ToolContent = ToolTextContent | ToolImageContent

export interface ToolResult {
  content: ToolContent[]
  /** Structured payload for programmatic clients. */
  structuredContent?: Record<string, unknown>
  /** True if this is an error envelope (per MCP spec). */
  isError?: boolean
}

/* ------------------------------------------------------------------ */
/*  Tool definition + registry                                         */
/* ------------------------------------------------------------------ */

export interface ToolHandlerContext {
  auth: McpAuthContext
  session: McpSession
}

export interface Tool {
  name: string
  description: string
  /** JSON Schema (draft 2020-12) — surfaced via tools/list. */
  inputSchema: Record<string, unknown>
  handler: (
    args: Record<string, unknown>,
    ctx: ToolHandlerContext,
  ) => Promise<ToolResult>
}

/** RFC4122 v4 UUID validator (case-insensitive). */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/* ------------------------------------------------------------------ */
/*  Tool: search_corpus  (Build Agent C — left unchanged here)         */
/* ------------------------------------------------------------------ */

export const searchCorpusTool: Tool = {
  name: 'search_corpus',
  description:
    'Search the PMM Sherpa knowledge base (38K+ chunks across 34 books, 583 podcasts, 532 AMAs, 827 PMA blogs, etc.) and return the most relevant excerpts. Lookup-only, no LLM synthesis.',
  inputSchema: {
    type: 'object',
    required: ['query'],
    properties: {
      query: {
        type: 'string',
        minLength: 3,
        maxLength: 1000,
        description: 'Natural-language question or topic.',
      },
      top_k: {
        type: 'integer',
        minimum: 1,
        maximum: 20,
        default: 8,
      },
      source_types: {
        type: 'array',
        items: {
          type: 'string',
          enum: [
            'book',
            'book_pm',
            'book_sales',
            'book_presentations',
            'book_communication',
            'podcast_pm',
            'podcast_pmm',
            'podcast_ai',
            'ama',
            'blog',
            'blog_external',
          ],
        },
        description: 'Optional filter by source type.',
      },
    },
  },
  handler: async (args, ctx) => {
    // ---- Validate input ----
    const query = typeof args.query === 'string' ? args.query : ''
    if (query.trim().length < 3) {
      return {
        content: [{ type: 'text', text: 'Query must be at least 3 characters.' }],
        isError: true,
      }
    }
    if (query.length > 2000) {
      return {
        content: [{ type: 'text', text: 'Query too long (max 2000 chars)' }],
        isError: true,
      }
    }
    const rawTopK = typeof args.top_k === 'number' ? args.top_k : 8
    const topK = Math.min(Math.max(Math.floor(rawTopK), 1), 20)
    const sourceTypes = Array.isArray(args.source_types)
      ? (args.source_types.filter((s): s is string => typeof s === 'string') as SourceType[])
      : undefined

    // ---- Run hybrid retrieval ----
    // Use a tighter threshold (0.55) for MCP than chat (0.4): MCP returns raw
    // chunks to the client, so off-topic noise is more visible. Also drop any
    // combined-score keyword-only leaks below 0.25 post-retrieval.
    const { chunks: rawChunks } = await retrieveContext(
      {
        query,
        topK: sourceTypes ? Math.min(topK * 3, 20) : topK,
        matchThreshold: 0.55,
      },
      ctx.auth.userId,
    )

    const filteredBySource: RetrievedChunk[] = sourceTypes
      ? rawChunks.filter((c) => sourceTypes.includes(c.sourceType))
      : rawChunks
    const chunks: RetrievedChunk[] = filteredBySource
      .filter((c) => c.similarity >= 0.25)
      .slice(0, topK)

    if (chunks.length === 0) {
      return {
        content: [{ type: 'text', text: 'No matching documents found.' }],
        structuredContent: { chunks: [] },
      }
    }

    return {
      content: [{ type: 'text', text: formatContextForPrompt(chunks) }],
      structuredContent: {
        chunks: chunks.map((c) => ({
          id: c.id,
          content: c.content,
          similarity: c.similarity,
          source: {
            type: c.sourceType,
            title: c.documentTitle,
            author: c.author,
            url: c.url,
            page_number: c.pageNumber,
            section_title: c.sectionTitle,
            speaker_role: c.speakerRole,
            question: c.question,
          },
        })),
      },
    }
  },
}

/* ------------------------------------------------------------------ */
/*  Tool: query_pmm_sherpa                                             */
/* ------------------------------------------------------------------ */

export const queryPmmSherpaTool: Tool = {
  name: 'query_pmm_sherpa',
  description:
    'Ask PMM Sherpa a strategic product-marketing question. Returns a synthesized answer with citations from the knowledge base and the full Layer-4 voice system prompt.',
  inputSchema: {
    type: 'object',
    required: ['query'],
    properties: {
      query: { type: 'string', minLength: 1, maxLength: 2000 },
      conversation_id: { type: 'string', description: 'Optional UUID of a prior conversation to load history from.' },
      model: {
        type: 'string',
        enum: ['opus', 'sonnet', 'gemini-pro'],
        description: 'Model preference. v1 hardcodes Sonnet 4.6 — this hint is recorded but not honored yet.',
      },
    },
  },
  handler: async (args, ctx) => {
    return startMcpObservation(
      'mcp.tool.query_pmm_sherpa',
      {
        userId: ctx.auth.userId,
        sessionId: ctx.session.id,
        toolName: 'query_pmm_sherpa',
        input: args,
      },
      async (span) => {
        // ---- Validate input ----
        const query = typeof args.query === 'string' ? args.query : ''
        if (query.trim().length < 1) {
          return {
            content: [{ type: 'text', text: 'Query is required.' }],
            isError: true,
          }
        }
        if (query.length > 2000) {
          return {
            content: [{ type: 'text', text: 'Query too long (max 2000 chars).' }],
            isError: true,
          }
        }
        const conversationIdRaw =
          typeof args.conversation_id === 'string' ? args.conversation_id : undefined
        const conversationId =
          conversationIdRaw && UUID_RE.test(conversationIdRaw) ? conversationIdRaw : undefined

        const modelHint = typeof args.model === 'string' ? args.model : undefined

        // ---- Usage gate ----
        const gate = await checkUsageGate(ctx.auth.userId)
        if (!gate.allowed) {
          return {
            content: [
              {
                type: 'text',
                text: gate.errorMessage ?? 'Monthly message limit reached. Try again next month.',
              },
            ],
            isError: true,
            structuredContent: {
              error: 'message_limit_exceeded',
              tier: gate.tier,
              used: gate.used,
              limit: gate.limit,
              reset_at: gate.resetAt,
            },
          }
        }

        // ---- Load conversation history (last 10 messages) ----
        let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
        if (conversationId) {
          try {
            const supabase = await createServiceClient()
            // Verify ownership and fetch messages in one query: filter on
            // conversations.user_id via a join. With service-role we have
            // to do this in two steps to keep types sane.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: convRow } = await (supabase.from('conversations') as any)
              .select('id, user_id')
              .eq('id', conversationId)
              .eq('user_id', ctx.auth.userId)
              .maybeSingle()

            if (convRow) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { data: msgRows } = await (supabase.from('messages') as any)
                .select('role, content, created_at')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .limit(10)
              if (Array.isArray(msgRows)) {
                conversationHistory = msgRows
                  .reverse()
                  .map((m: { role: string; content: string }) => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                  }))
              }
            }
          } catch (err) {
            console.warn('[query_pmm_sherpa] Failed to load conversation history:', err)
            // Non-fatal — proceed with empty history.
          }
        }

        // ---- Run RAG + LLM ----
        let result
        try {
          result = await runSherpaChat({
            message: query,
            userId: ctx.auth.userId,
            conversationHistory,
          })
        } catch (err) {
          console.error('[query_pmm_sherpa] runSherpaChat threw:', err)
          return {
            content: [
              {
                type: 'text',
                text: 'I hit an unexpected error generating that response. Try again in a moment.',
              },
            ],
            isError: true,
          }
        }

        // ---- Empty-knowledge path: skip increment, return friendly text ----
        if (result.chunks.length === 0) {
          const emptyText =
            "I couldn't find relevant knowledge in my corpus for that question. Try rephrasing or being more specific."
          span.update({
            output: emptyText,
            metadata: {
              empty_corpus: true,
              intent: result.intent,
              model_hint: modelHint,
            },
          })
          return {
            content: [{ type: 'text', text: emptyText }],
            isError: false,
            structuredContent: {
              response: emptyText,
              citations: [],
              chunks: [],
              usage: result.usage,
              empty_corpus: true,
            },
          }
        }

        // ---- Increment usage (fire-and-forget — do not block on failure) ----
        incrementUsage(ctx.auth.userId).catch((err) =>
          console.error('[query_pmm_sherpa] incrementUsage failed:', err),
        )

        span.update({
          output: result.text,
          metadata: {
            intent: result.intent,
            chunk_count: result.chunks.length,
            citation_count: result.citations.length,
            input_tokens: result.usage.inputTokens,
            output_tokens: result.usage.outputTokens,
            model_hint: modelHint,
          },
        })

        return {
          content: [{ type: 'text', text: result.text }],
          structuredContent: {
            response: result.text,
            citations: result.citations,
            chunks: result.chunks.slice(0, 10).map((c) => ({
              id: c.id,
              content: c.content,
              similarity: c.similarity,
              source: {
                type: c.sourceType,
                title: c.documentTitle,
                author: c.author,
                url: c.url,
                page_number: c.pageNumber,
                section_title: c.sectionTitle,
                speaker_role: c.speakerRole,
                question: c.question,
              },
            })),
            usage: result.usage,
          },
        }
      },
    )
  },
}

/* ------------------------------------------------------------------ */
/*  Tool: validate_artifact                                            */
/* ------------------------------------------------------------------ */

export const validateArtifactTool: Tool = {
  name: 'validate_artifact',
  description:
    'Review a PMM artifact (positioning, messaging, launch plan, or other) and surface gaps, inconsistencies, and missed PMM principles. Returns narrative critique + structured gaps + recommendations.',
  inputSchema: {
    type: 'object',
    required: ['artifact_text', 'artifact_type'],
    properties: {
      artifact_text: { type: 'string', minLength: 1, maxLength: 20000 },
      artifact_type: {
        type: 'string',
        enum: ['positioning', 'messaging', 'launch_plan', 'other'],
      },
      context: { type: 'string', maxLength: 2000 },
    },
  },
  handler: async (args, ctx) => {
    return startMcpObservation(
      'mcp.tool.validate_artifact',
      {
        userId: ctx.auth.userId,
        sessionId: ctx.session.id,
        toolName: 'validate_artifact',
        input: args,
      },
      async (span) => {
        // ---- Validate input ----
        const artifactText = typeof args.artifact_text === 'string' ? args.artifact_text : ''
        if (artifactText.trim().length < 1) {
          return {
            content: [{ type: 'text', text: 'artifact_text is required.' }],
            isError: true,
          }
        }
        if (artifactText.length > 20000) {
          return {
            content: [{ type: 'text', text: 'artifact_text too long (max 20000 chars).' }],
            isError: true,
          }
        }
        const allowedTypes = ['positioning', 'messaging', 'launch_plan', 'other'] as const
        type ArtifactType = (typeof allowedTypes)[number]
        const rawType = typeof args.artifact_type === 'string' ? args.artifact_type : 'other'
        const artifactType: ArtifactType = (allowedTypes as readonly string[]).includes(rawType)
          ? (rawType as ArtifactType)
          : 'other'

        const context = typeof args.context === 'string' ? args.context : undefined
        if (context && context.length > 2000) {
          return {
            content: [{ type: 'text', text: 'context too long (max 2000 chars).' }],
            isError: true,
          }
        }

        // ---- Usage gate ----
        const gate = await checkUsageGate(ctx.auth.userId)
        if (!gate.allowed) {
          return {
            content: [
              {
                type: 'text',
                text: gate.errorMessage ?? 'Monthly message limit reached. Try again next month.',
              },
            ],
            isError: true,
            structuredContent: {
              error: 'message_limit_exceeded',
              tier: gate.tier,
              used: gate.used,
              limit: gate.limit,
              reset_at: gate.resetAt,
            },
          }
        }

        // ---- Build critique prompt ----
        const critiquePrompt =
          `Review the following ${artifactType} artifact against PMM principles. Focus on: gaps, weaknesses, opportunities to strengthen. Use grounded references from the corpus when relevant.\n\n` +
          `Artifact:\n"""\n${artifactText}\n"""\n` +
          (context ? `\nUser-supplied context:\n${context}\n` : '') +
          `\nReturn your review in this exact format:\n\n` +
          `## Overall Assessment\n[2-3 sentences]\n\n` +
          `## Key Gaps\n- gap 1\n- gap 2\n...\n\n` +
          `## Recommendations\n- rec 1\n- rec 2\n...`

        // ---- Run RAG + LLM with review intent + custom suffix ----
        let result
        try {
          result = await runSherpaChat({
            message: critiquePrompt,
            userId: ctx.auth.userId,
            intentOverride: 'review',
            customSystemPromptSuffix:
              'You are reviewing a PMM artifact. Be specific, grounded, and constructive.',
          })
        } catch (err) {
          console.error('[validate_artifact] runSherpaChat threw:', err)
          return {
            content: [
              {
                type: 'text',
                text: 'I hit an unexpected error reviewing that artifact. Try again in a moment.',
              },
            ],
            isError: true,
          }
        }

        // Empty-corpus path — still produce a friendly message.
        if (result.chunks.length === 0) {
          const emptyText =
            "I couldn't find PMM principles in my corpus to ground a critique. Try giving more context about what you're optimizing for."
          span.update({
            output: emptyText,
            metadata: {
              empty_corpus: true,
              artifact_type: artifactType,
            },
          })
          return {
            content: [{ type: 'text', text: emptyText }],
            isError: false,
            structuredContent: {
              critique: emptyText,
              gaps: [],
              recommendations: [],
              principles_cited: [],
              empty_corpus: true,
            },
          }
        }

        // ---- Parse the markdown critique ----
        const { gaps, recommendations } = parseCritiqueMarkdown(result.text)
        const principlesCited = uniquePrinciplesFromCitations(result.citations)

        // ---- Increment usage (fire-and-forget) ----
        incrementUsage(ctx.auth.userId).catch((err) =>
          console.error('[validate_artifact] incrementUsage failed:', err),
        )

        span.update({
          output: result.text,
          metadata: {
            artifact_type: artifactType,
            gap_count: gaps.length,
            recommendation_count: recommendations.length,
            principle_count: principlesCited.length,
            chunk_count: result.chunks.length,
            input_tokens: result.usage.inputTokens,
            output_tokens: result.usage.outputTokens,
          },
        })

        return {
          content: [{ type: 'text', text: result.text }],
          structuredContent: {
            critique: result.text,
            gaps,
            recommendations,
            principles_cited: principlesCited,
            usage: result.usage,
          },
        }
      },
    )
  },
}

/* ------------------------------------------------------------------ */
/*  Registry                                                           */
/* ------------------------------------------------------------------ */

export const tools: Record<string, Tool> = {
  [searchCorpusTool.name]: searchCorpusTool,
  [queryPmmSherpaTool.name]: queryPmmSherpaTool,
  [validateArtifactTool.name]: validateArtifactTool,
}

/** tools/list response format expected by MCP clients. */
export function listToolsForRpc(): Array<{
  name: string
  description: string
  inputSchema: Record<string, unknown>
}> {
  return Object.values(tools).map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  }))
}

export function getTool(name: string): Tool | undefined {
  return tools[name]
}
