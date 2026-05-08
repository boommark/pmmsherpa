/**
 * MCP tool registry.
 *
 * Each tool declares a JSON Schema (used by tools/list) and an async
 * handler invoked by tools/call. Handlers receive the parsed arguments,
 * an auth context, and the active MCP session — they return an MCP
 * tool result envelope: { content: [...], isError?, structuredContent? }.
 */

import { z } from 'zod'
import type { McpAuthContext } from './auth-context'
import type { McpSession } from './sessions'
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval'
import type { RetrievedChunk } from '@/types/chat'
import type { SourceType } from '@/types/database'
import { startMcpObservation } from './tracing'
import { runSherpaChat, parseCritiqueMarkdown, uniquePrinciplesFromCitations } from './helpers'
import { checkUsageGate, incrementUsage } from '@/lib/usage-gate'
import { createServiceClient } from '@/lib/supabase/server'
import { getTemplate, listArtifactTypes } from './artifact-templates'

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
  /**
   * If the host requested progress (params._meta.progressToken on tools/call),
   * the route handler passes a callback here. Tools that support streaming
   * (currently `ask_sherpa`) call this with each text delta; tools that
   * don't simply ignore it. The route is responsible for SSE framing and
   * for emitting `notifications/progress`.
   */
  onProgress?: (delta: string) => void
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
/*  Tool: search_corpus  (DEPRECATED from public surface)              */
/* ------------------------------------------------------------------ */

/*
 * Deprecated from public MCP surface 2026-05. Folded into `ask_sherpa`
 * internals (corpus retrieval is automatic on every query). Code retained
 * for potential future use as a power-user lookup tool; not exposed via
 * `tools/list`. Other modules may still import `searchCorpusTool` directly
 * for internal scripts/tests, so the export stays.
 *
 * Retrieval-architecture note: this tool calls `retrieveContext` (single
 * hybrid search, raw chunks) — appropriate for a lookup-only tool with no
 * LLM synthesis. The web UI (`/api/chat`) and MCP `ask_sherpa` (via
 * `runSherpaChat`) both use `multiQueryRetrieve`, which runs N parallel
 * `retrieveContext` calls + dedupe + intent boost. So `multiQueryRetrieve`
 * is the canonical "smart" path; `retrieveContext` is the underlying
 * primitive. Both surfaces share the smart path — no real divergence.
 */
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
    if (query.length > 1000) {
      return {
        content: [{ type: 'text', text: 'Query too long (max 1000 chars).' }],
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
/*  Tool: ask_sherpa                                                   */
/* ------------------------------------------------------------------ */

export const askSherpaTool: Tool = {
  name: 'ask_sherpa',
  description:
    "Call during the **advisory** phase — when the user wants a grounded conversational answer to a strategic PMM question. Returns Sherpa's voice: a corpus-cited recommendation with reasoning. Use for \"how do I…\", \"what would you do…\", \"should we…\" framings on positioning, messaging, launch, GTM, or pricing. Do NOT call at planning time (use `scope_pmm_research`), when producing a named deliverable (use `draft_artifact`), or when critiquing existing work (use `get_feedback`).",
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
      'mcp.tool.ask_sherpa',
      {
        userId: ctx.auth.userId,
        sessionId: ctx.session.id,
        toolName: 'ask_sherpa',
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
            console.warn('[ask_sherpa] Failed to load conversation history:', err)
            // Non-fatal — proceed with empty history.
          }
        }

        // ---- Run RAG + LLM (streams via onChunk when host asked for progress) ----
        let result
        try {
          result = await runSherpaChat({
            message: query,
            userId: ctx.auth.userId,
            conversationHistory,
            onChunk: ctx.onProgress,
          })
        } catch (err) {
          console.error('[ask_sherpa] runSherpaChat threw:', err)
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
          console.error('[ask_sherpa] incrementUsage failed:', err),
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
/*  Tool: draft_artifact                                               */
/* ------------------------------------------------------------------ */

export const draftArtifactTool: Tool = {
  name: 'draft_artifact',
  description:
    'Call during the **drafting** phase when the user wants a specific named PMM deliverable produced end-to-end. Returns a fully-filled Markdown artifact (positioning statement, messaging framework, launch plan, battlecard, ICP, persona, blog brief, landing-page copy, pricing-page copy, plus 30 others — 39 total). Required: `artifact_type` enum match. Do NOT call when the user is exploring options conversationally (use `ask_sherpa`), or when they have a draft and want it reviewed (use `get_feedback`).',
  inputSchema: {
    type: 'object',
    required: ['artifact_type'],
    properties: {
      artifact_type: {
        type: 'string',
        enum: listArtifactTypes(),
        description:
          'Snake_case artifact identifier. Must match one of the 39 supported types (e.g. "positioning_statement", "messaging_framework", "battlecard").',
      },
      context: {
        type: 'object',
        description:
          'Free-shape context fields the LLM should weave into the draft (product, company, audience, prior_drafts, competitors, etc.). Passed to the model as JSON.',
        additionalProperties: true,
      },
      notes: {
        type: 'string',
        maxLength: 2000,
        description: 'Optional free-text guidance, constraints, or tone instructions.',
      },
    },
  },
  handler: async (args, ctx) => {
    return startMcpObservation(
      'mcp.tool.draft_artifact',
      {
        userId: ctx.auth.userId,
        sessionId: ctx.session.id,
        toolName: 'draft_artifact',
        input: args,
      },
      async (span) => {
        // ---- Validate input ----
        const artifactType = typeof args.artifact_type === 'string' ? args.artifact_type : ''
        if (!artifactType) {
          return {
            content: [{ type: 'text', text: '`artifact_type` is required.' }],
            isError: true,
            structuredContent: {
              error: 'missing_artifact_type',
              valid_types: listArtifactTypes(),
            },
          }
        }

        const template = getTemplate(artifactType)
        if (!template) {
          const validTypes = listArtifactTypes()
          return {
            content: [
              {
                type: 'text',
                text: `Unknown artifact_type "${artifactType}". Valid types: ${validTypes.join(', ')}.`,
              },
            ],
            isError: true,
            structuredContent: {
              error: 'unknown_artifact_type',
              provided: artifactType,
              valid_types: validTypes,
            },
          }
        }

        const notes = typeof args.notes === 'string' ? args.notes : undefined
        if (notes && notes.length > 2000) {
          return {
            content: [{ type: 'text', text: 'notes too long (max 2000 chars).' }],
            isError: true,
          }
        }

        // Context is a free-shape object; serialize for the prompt.
        const contextObj =
          args.context && typeof args.context === 'object' && !Array.isArray(args.context)
            ? (args.context as Record<string, unknown>)
            : undefined
        let contextJson: string | undefined
        if (contextObj) {
          try {
            contextJson = JSON.stringify(contextObj, null, 2)
          } catch {
            contextJson = undefined
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

        // ---- Build user-facing message: skeleton + context + notes ----
        // The skeleton is the canonical fill-in scaffold; we ask the model to
        // produce the final artifact by replacing every bracketed inline prompt
        // with concrete content drawn from context + corpus + notes.
        const userMessage =
          `Draft a ${template.title}.\n\n` +
          `Use the following Markdown skeleton as the structural scaffold. ` +
          `Replace every bracketed inline prompt (e.g. "[ ... ]") with concrete content. ` +
          `Keep the section headings exactly as written; do not rename, reorder, or skip sections.\n\n` +
          `Skeleton:\n"""\n${template.skeleton}\n"""\n` +
          (contextJson ? `\nContext (JSON):\n\`\`\`json\n${contextJson}\n\`\`\`\n` : '') +
          (notes ? `\nAdditional notes from the user:\n${notes}\n` : '') +
          `\nGround claims in the corpus where relevant; cite sources inline. ` +
          `Output ONLY the completed Markdown artifact — no preamble, no closing remarks.`

        // ---- Run RAG + LLM with template's systemPromptFragment ----
        let result
        try {
          result = await runSherpaChat({
            message: userMessage,
            userId: ctx.auth.userId,
            customSystemPromptSuffix: template.systemPromptFragment,
          })
        } catch (err) {
          console.error('[draft_artifact] runSherpaChat threw:', err)
          return {
            content: [
              {
                type: 'text',
                text: 'I hit an unexpected error drafting that artifact. Try again in a moment.',
              },
            ],
            isError: true,
          }
        }

        // Empty-corpus path — still produce a friendly message; skip increment.
        if (result.chunks.length === 0) {
          const emptyText =
            "I couldn't find PMM principles in my corpus to ground this artifact. Try giving more context about the product, audience, or constraints."
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
              artifact_text: '',
              artifact_type: artifactType,
              citations: [],
              usage: result.usage,
              empty_corpus: true,
            },
          }
        }

        // ---- Increment usage (fire-and-forget) ----
        incrementUsage(ctx.auth.userId).catch((err) =>
          console.error('[draft_artifact] incrementUsage failed:', err),
        )

        span.update({
          output: result.text,
          metadata: {
            artifact_type: artifactType,
            chunk_count: result.chunks.length,
            citation_count: result.citations.length,
            input_tokens: result.usage.inputTokens,
            output_tokens: result.usage.outputTokens,
          },
        })

        return {
          content: [{ type: 'text', text: result.text }],
          structuredContent: {
            artifact_text: result.text,
            artifact_type: artifactType,
            citations: result.citations,
            usage: result.usage,
          },
        }
      },
    )
  },
}

/* ------------------------------------------------------------------ */
/*  Tool: get_feedback                                                 */
/* ------------------------------------------------------------------ */

export const getFeedbackTool: Tool = {
  name: 'get_feedback',
  description:
    "Call during the **validating** phase when the user has work in hand (their text, a URL's content, a file extract) and wants it pressure-tested against PMM principles. Returns structured JSON: `{ critique, gaps[], recommendations[], principles_cited[] }`. Use for reviewing positioning drafts, competitor pages, decks, blog posts, or any artifact the user wants strengthened. Do NOT call to *generate* an artifact (use `draft_artifact`) or to answer a question about a topic (use `ask_sherpa`).",
  inputSchema: {
    type: 'object',
    required: ['content'],
    properties: {
      content: {
        type: 'string',
        minLength: 1,
        maxLength: 50000,
        description:
          'The text to critique. URL/file extraction happens host-side; this tool receives the extracted text.',
      },
      kind: {
        type: 'string',
        description:
          'Free-text hint about what kind of artifact this is (e.g. "positioning statement", "competitor landing page", "resume bullet"). Optional.',
      },
      context: {
        type: 'string',
        maxLength: 2000,
        description: 'Optional context about goals, audience, or constraints.',
      },
    },
  },
  handler: async (args, ctx) => {
    return startMcpObservation(
      'mcp.tool.get_feedback',
      {
        userId: ctx.auth.userId,
        sessionId: ctx.session.id,
        toolName: 'get_feedback',
        input: args,
      },
      async (span) => {
        // ---- Validate input ----
        const content = typeof args.content === 'string' ? args.content : ''
        if (content.trim().length < 1) {
          return {
            content: [{ type: 'text', text: '`content` is required.' }],
            isError: true,
          }
        }
        if (content.length > 50000) {
          return {
            content: [{ type: 'text', text: '`content` too long (max 50000 chars).' }],
            isError: true,
          }
        }

        const kind = typeof args.kind === 'string' && args.kind.trim().length > 0
          ? args.kind.trim()
          : undefined

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
        const kindLabel = kind ?? 'artifact'
        const critiquePrompt =
          `Review the following ${kindLabel} against PMM principles. Focus on: gaps, weaknesses, opportunities to strengthen. Use grounded references from the corpus when relevant.\n\n` +
          `Content:\n"""\n${content}\n"""\n` +
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
          console.error('[get_feedback] runSherpaChat threw:', err)
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
              kind: kindLabel,
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
          console.error('[get_feedback] incrementUsage failed:', err),
        )

        span.update({
          output: result.text,
          metadata: {
            kind: kindLabel,
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
/*  Tool: scope_pmm_research                                           */
/* ------------------------------------------------------------------ */

/**
 * System-prompt suffix that constrains the LLM to return ONLY structured
 * scoping JSON — no prose, no markdown fences. Used by `scope_pmm_research`.
 *
 * Kept as a module-level constant (rather than re-built on every call) so
 * Anthropic prompt caching can amortize it across requests.
 */
export const SCOPE_PMM_RESEARCH_SUFFIX = `You are scoping a PMM research run. Return ONLY valid JSON matching this exact shape — no prose, no preamble, no closing remarks, no markdown code fences:

{
  "angle": "1-2 sentence point of view on how to attack the question through a PMM lens",
  "sub_questions": ["3-7 orthogonal sub-questions a research swarm can answer in parallel"],
  "sources_to_weight": ["which kinds of sources matter most — analyst reports, practitioner blogs, customer interviews, named PMM authors, etc."],
  "anti_patterns": ["2-4 common research mistakes or red herrings to avoid (e.g. feature-list framing, audience = everyone)"],
  "success_criteria": ["3-5 bullets describing what a *good* answer would contain"]
}

Sub-questions must be orthogonal (no overlap), specific, and answerable with PMM corpus knowledge. Ground anti_patterns and success_criteria in cited principles where possible. Do not include the word "json" or any code fences. Output the JSON object and nothing else.`

/**
 * Zod schema for the scoping LLM output. Used to validate the parsed
 * JSON before returning it as structuredContent. On validation failure
 * the handler returns isError:true with the raw text preserved for
 * debugging — it does NOT throw.
 */
export const scopeResultSchema = z.object({
  angle: z.string().min(1),
  sub_questions: z.array(z.string().min(1)).min(1),
  sources_to_weight: z.array(z.string().min(1)),
  anti_patterns: z.array(z.string().min(1)),
  success_criteria: z.array(z.string().min(1)),
})

export type ScopeResult = z.infer<typeof scopeResultSchema>

/**
 * Strip leading/trailing markdown code fences from an LLM response so
 * `JSON.parse` succeeds even when the model ignores the "no fences"
 * instruction. Handles ```json … ``` and bare ``` … ``` fences.
 */
export function stripJsonFences(raw: string): string {
  let s = raw.trim()
  // Leading fence: ```json or ```
  if (s.startsWith('```')) {
    const firstNewline = s.indexOf('\n')
    if (firstNewline !== -1) {
      s = s.slice(firstNewline + 1)
    } else {
      s = s.slice(3)
    }
  }
  // Trailing fence
  if (s.endsWith('```')) {
    s = s.slice(0, -3)
  }
  return s.trim()
}

export const scopePmmResearchTool: Tool = {
  name: 'scope_pmm_research',
  description:
    "Call this at the **start** of any PMM-adjacent research run, before spawning subagents or drafting anything. Returns structured JSON: `{ angle, sub_questions[], sources_to_weight[], anti_patterns[], success_criteria[] }` — a research brief, not prose. Use it to decompose a vague PMM question (\"how should we position X\", \"what's the GTM for Y\") into orthogonal sub-questions a research swarm can attack in parallel. Do NOT call for follow-up questions inside an active research thread, single-fact lookups, or any non-PMM topic.",
  inputSchema: {
    type: 'object',
    required: ['question'],
    properties: {
      question: {
        type: 'string',
        minLength: 10,
        maxLength: 2000,
        description: 'The PMM research question to scope (e.g. "how should a Series B observability startup position against Datadog").',
      },
      context: {
        type: 'string',
        maxLength: 2000,
        description: 'Optional: company stage, audience, prior decisions, constraints, target buyer/ICP if known.',
      },
    },
  },
  handler: async (args, ctx) => {
    return startMcpObservation(
      'mcp.tool.scope_pmm_research',
      {
        userId: ctx.auth.userId,
        sessionId: ctx.session.id,
        toolName: 'scope_pmm_research',
        input: args,
      },
      async (span) => {
        // ---- Validate input ----
        const question = typeof args.question === 'string' ? args.question : ''
        if (question.trim().length < 10) {
          return {
            content: [{ type: 'text', text: '`question` is required (min 10 characters).' }],
            isError: true,
          }
        }
        if (question.length > 2000) {
          return {
            content: [{ type: 'text', text: '`question` too long (max 2000 chars).' }],
            isError: true,
          }
        }

        const context = typeof args.context === 'string' ? args.context : undefined
        if (context && context.length > 2000) {
          return {
            content: [{ type: 'text', text: '`context` too long (max 2000 chars).' }],
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

        // ---- Build user message ----
        const userMessage =
          `Scope the following PMM research question:\n\n` +
          `Question: ${question}\n` +
          (context ? `\nContext: ${context}\n` : '') +
          `\nReturn only the structured JSON object as instructed.`

        // ---- Run RAG + LLM (NON-streaming — JSON output) ----
        // intentOverride: 'review' per spec — closest existing analytical-retrieval intent.
        // Do NOT pass onChunk; streaming partial JSON would corrupt the parse.
        let result
        try {
          result = await runSherpaChat({
            message: userMessage,
            userId: ctx.auth.userId,
            intentOverride: 'review',
            customSystemPromptSuffix: SCOPE_PMM_RESEARCH_SUFFIX,
          })
        } catch (err) {
          console.error('[scope_pmm_research] runSherpaChat threw:', err)
          return {
            content: [
              {
                type: 'text',
                text: 'I hit an unexpected error scoping that question. Try again in a moment.',
              },
            ],
            isError: true,
          }
        }

        // ---- Empty-corpus path: graceful empty shape, skip increment ----
        if (result.chunks.length === 0) {
          const emptyShape: ScopeResult = {
            angle: '',
            sub_questions: [],
            sources_to_weight: [],
            anti_patterns: [],
            success_criteria: [],
          }
          span.update({
            output: 'empty_corpus',
            metadata: {
              empty_corpus: true,
            },
          })
          return {
            content: [{ type: 'text', text: JSON.stringify(emptyShape) }],
            isError: false,
            structuredContent: {
              ...emptyShape,
              citations: [],
              usage: result.usage,
              empty_corpus: true,
            },
          }
        }

        // ---- Parse + validate JSON ----
        const stripped = stripJsonFences(result.text)
        let parsed: unknown
        try {
          parsed = JSON.parse(stripped)
        } catch (err) {
          console.error('[scope_pmm_research] JSON.parse failed:', err)
          return {
            content: [
              {
                type: 'text',
                text: 'Sherpa returned a non-JSON response. Try rephrasing the question.',
              },
            ],
            isError: true,
            structuredContent: {
              error: 'invalid_json',
              raw: result.text,
              usage: result.usage,
            },
          }
        }

        const validated = scopeResultSchema.safeParse(parsed)
        if (!validated.success) {
          console.error('[scope_pmm_research] Zod validation failed:', validated.error.issues)
          return {
            content: [
              {
                type: 'text',
                text: 'Sherpa returned JSON that did not match the expected scoping shape. Try rephrasing the question.',
              },
            ],
            isError: true,
            structuredContent: {
              error: 'invalid_shape',
              issues: validated.error.issues,
              raw: result.text,
              usage: result.usage,
            },
          }
        }

        // ---- Defensive caps: sub_questions ≤ 7, others ≤ 5 ----
        const capped: ScopeResult = {
          angle: validated.data.angle,
          sub_questions: validated.data.sub_questions.slice(0, 7),
          sources_to_weight: validated.data.sources_to_weight.slice(0, 5),
          anti_patterns: validated.data.anti_patterns.slice(0, 5),
          success_criteria: validated.data.success_criteria.slice(0, 5),
        }

        // ---- Increment usage (fire-and-forget) ----
        incrementUsage(ctx.auth.userId).catch((err) =>
          console.error('[scope_pmm_research] incrementUsage failed:', err),
        )

        span.update({
          output: JSON.stringify(capped),
          metadata: {
            sub_question_count: capped.sub_questions.length,
            chunk_count: result.chunks.length,
            citation_count: result.citations.length,
            input_tokens: result.usage.inputTokens,
            output_tokens: result.usage.outputTokens,
          },
        })

        return {
          content: [{ type: 'text', text: JSON.stringify(capped) }],
          structuredContent: {
            ...capped,
            citations: result.citations,
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

// NOTE: `searchCorpusTool` is intentionally NOT registered here — it was
// deprecated from the public MCP surface 2026-05 (see comment block above
// the export). Only the four tools below appear in `tools/list`.
export const tools: Record<string, Tool> = {
  [askSherpaTool.name]: askSherpaTool,
  [draftArtifactTool.name]: draftArtifactTool,
  [getFeedbackTool.name]: getFeedbackTool,
  [scopePmmResearchTool.name]: scopePmmResearchTool,
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
