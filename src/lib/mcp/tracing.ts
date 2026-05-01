/**
 * Langfuse tracing helper for the MCP surface.
 *
 * Mirrors the pattern from src/app/api/chat/route.ts:266–284. Every
 * MCP observation is tagged surface:mcp so the same Langfuse project
 * (PMMSherpa-MCP) can serve both web and MCP traffic — filterable by
 * tag rather than split into separate projects.
 *
 * Trace name conventions:
 *   - mcp.transport.request   → outer envelope (POST /api/mcp)
 *   - mcp.tool.<tool_name>    → per tools/call invocation
 */

import { startActiveObservation, setActiveTraceIO } from '@langfuse/tracing'
import { LangfuseOtelSpanAttributes } from '@langfuse/core'
import { waitUntil } from '@vercel/functions'
import { langfuseSpanProcessor } from '@/instrumentation'

export interface McpObservationContext {
  userId: string
  sessionId: string
  toolName?: string
  input: unknown
  /** Extra metadata merged into the Langfuse trace metadata bag. */
  metadata?: Record<string, unknown>
}

/**
 * Wrap an MCP code path in a Langfuse observation tagged surface:mcp.
 * The handler receives the active span so it can call span.update()
 * with output/usage, and setActiveTraceIO() is pre-populated with the
 * supplied input.
 *
 * Always calls waitUntil(forceFlush) in the finally block — required
 * on Vercel because the lambda freezes before async OTLP exports
 * complete.
 */
export async function startMcpObservation<T>(
  name: string,
  ctx: McpObservationContext,
  fn: (span: Parameters<Parameters<typeof startActiveObservation>[1]>[0]) => Promise<T>,
): Promise<T> {
  return startActiveObservation(name, async (span) => {
    span.update({
      input: ctx.input,
      metadata: {
        userId: ctx.userId,
        sessionId: ctx.sessionId,
        surface: 'mcp',
        toolName: ctx.toolName,
        ...(ctx.metadata ?? {}),
      },
    })
    setActiveTraceIO({ input: ctx.input })
    span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_NAME, name)
    if (ctx.userId) {
      span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_USER_ID, ctx.userId)
    }
    if (ctx.sessionId) {
      span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_SESSION_ID, ctx.sessionId)
    }
    span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_TAGS, ['surface:mcp'])
    try {
      return await fn(span)
    } finally {
      // Flush OTLP queue — Vercel lambda otherwise freezes before
      // the export completes and the trace is lost.
      waitUntil(langfuseSpanProcessor.forceFlush())
    }
  })
}
