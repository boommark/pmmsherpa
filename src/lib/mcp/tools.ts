/**
 * MCP tool registry.
 *
 * Each tool declares a JSON Schema (used by tools/list) and an async
 * handler invoked by tools/call. Handlers receive the parsed arguments,
 * an auth context, and the active MCP session — they return an MCP
 * tool result envelope: { content: [...], isError?, structuredContent? }.
 *
 * Build Agent C will replace search_corpus with the real implementation
 * that calls retrieveContext() from src/lib/rag/retrieval.ts.
 */

import type { McpAuthContext } from './auth-context'
import type { McpSession } from './sessions'
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval'
import type { RetrievedChunk } from '@/types/chat'
import type { SourceType } from '@/types/database'

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

/** Standard "not implemented in Phase 1" stub envelope. */
function notImplemented(toolName: string): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: `Tool "${toolName}" is registered but not yet implemented in Phase 1. Use search_corpus for now.`,
      },
    ],
    isError: true,
  }
}

/* ------------------------------------------------------------------ */
/*  Tool: search_corpus  (STUB — Build Agent C replaces handler body)  */
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
    // retrieveContext generates the embedding internally (text-embedding-3-small,
    // 512 dim, same as /api/chat) and calls the hybrid_search RPC.
    const { chunks: rawChunks } = await retrieveContext(
      { query, topK: sourceTypes ? Math.min(topK * 3, 20) : topK },
      ctx.auth.userId,
    )

    // Optional post-retrieval filter by source type, then trim back to topK.
    const chunks: RetrievedChunk[] = sourceTypes
      ? rawChunks.filter((c) => sourceTypes.includes(c.sourceType)).slice(0, topK)
      : rawChunks

    if (chunks.length === 0) {
      return {
        content: [{ type: 'text', text: 'No matching documents found.' }],
        structuredContent: { chunks: [] },
      }
    }

    // ---- Format result ----
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
/*  Tool: query_pmm_sherpa  (STUB — Phase 1.5)                          */
/* ------------------------------------------------------------------ */

export const queryPmmSherpaTool: Tool = {
  name: 'query_pmm_sherpa',
  description:
    'Ask PMM Sherpa a strategic product-marketing question. Returns a synthesized answer with citations from the knowledge base, current web research, and the full Layer-4 voice system prompt.',
  inputSchema: {
    type: 'object',
    required: ['query'],
    properties: {
      query: { type: 'string', minLength: 3, maxLength: 4000 },
      conversation_id: { type: 'string' },
      model: { type: 'string', enum: ['opus', 'sonnet', 'gemini-pro'] },
    },
  },
  handler: async () => notImplemented('query_pmm_sherpa'),
}

/* ------------------------------------------------------------------ */
/*  Tool: validate_artifact  (STUB — Phase 1.5)                         */
/* ------------------------------------------------------------------ */

export const validateArtifactTool: Tool = {
  name: 'validate_artifact',
  description:
    'Review a PMM artifact (positioning, messaging, launch plan) and surface gaps, inconsistencies, and missed PMM principles.',
  inputSchema: {
    type: 'object',
    required: ['artifact_text', 'artifact_type'],
    properties: {
      artifact_text: { type: 'string', minLength: 10, maxLength: 20000 },
      artifact_type: {
        type: 'string',
        enum: ['positioning', 'messaging', 'launch_plan', 'other'],
      },
      context: { type: 'string', maxLength: 4000 },
    },
  },
  handler: async () => notImplemented('validate_artifact'),
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
