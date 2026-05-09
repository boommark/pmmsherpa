/**
 * MCP Streamable HTTP transport endpoint (spec rev 2025-11-25).
 *
 *   POST /api/mcp    — JSON-RPC requests + notifications
 *   GET  /api/mcp    — server-initiated SSE stream (Phase 2; 405 today)
 *   DELETE /api/mcp  — terminate a session
 *
 * Auth: Authorization: Bearer <token>. The token is validated by
 * validateBearerToken() in src/lib/mcp/auth-context.ts. For Phase 1
 * that's a stub accepting any non-empty token; Build Agent B replaces
 * it with a real JWKS verifier.
 *
 * Sessions: server returns Mcp-Session-Id on the response to the first
 * `initialize`. Clients echo it on every subsequent request.
 */

import { NextRequest } from 'next/server'
import {
  parseJsonRpcBody,
  buildResult,
  buildError,
  encodeSseFrame,
  JSON_RPC_ERRORS,
  MCP_PROTOCOL_VERSION,
  MCP_SESSION_HEADER,
  type JsonRpcRequest,
  type JsonRpcMessage,
  type JsonRpcId,
} from '@/lib/mcp/transport'
import {
  extractBearerToken,
  validateBearerToken,
  type McpAuthContext,
} from '@/lib/mcp/auth-context'
import {
  createSession,
  getSession,
  touchSession,
  markInitialized,
  deleteSession,
  type McpSession,
} from '@/lib/mcp/sessions'
import { getTool, listToolsForRpc } from '@/lib/mcp/tools'
import { startMcpObservation } from '@/lib/mcp/tracing'
import { InsufficientCreditsError } from '@/lib/mcp/credits'
import { setActiveTraceIO } from '@langfuse/tracing'
import { LangfuseOtelSpanAttributes } from '@langfuse/core'

export const runtime = 'nodejs'
export const maxDuration = 60

const SERVER_INFO = { name: 'pmm-sherpa', version: '0.1.0' }

/* ------------------------------------------------------------------ */
/*  Auth response helpers                                              */
/* ------------------------------------------------------------------ */

function unauthorized(reason: 'missing' | 'invalid'): Response {
  // RFC 9728: point clients at the protected-resource metadata so they
  // can discover where to obtain a fresh token. The .well-known route
  // ships in Build Agent B; the URL is stable.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pmmsherpa.com'
  const wwwAuth =
    reason === 'missing'
      ? `Bearer resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`
      : `Bearer error="invalid_token", resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`
  return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      'WWW-Authenticate': wwwAuth,
    },
  })
}

async function authenticate(req: NextRequest): Promise<McpAuthContext | Response> {
  const token = extractBearerToken(req.headers.get('authorization'))
  if (!token) return unauthorized('missing')
  const ctx = await validateBearerToken(token)
  if (!ctx) return unauthorized('invalid')
  return ctx
}

/* ------------------------------------------------------------------ */
/*  Method dispatch                                                    */
/* ------------------------------------------------------------------ */

/** Handle a single JSON-RPC request and return the JSON-RPC envelope. */
async function dispatch(
  req: JsonRpcRequest,
  auth: McpAuthContext,
  session: McpSession | null,
): Promise<{ envelope: JsonRpcMessage; newSession?: McpSession }> {
  const { id, method } = req

  // initialize is the only method that can run without a session.
  if (method === 'initialize') {
    const newSession = session ?? (await createSession(auth.userId))
    await markInitialized(newSession.id)
    return {
      envelope: buildResult(id, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
      }),
      newSession,
    }
  }

  // All other methods require an initialized session.
  if (!session) {
    return {
      envelope: buildError(
        id,
        JSON_RPC_ERRORS.SERVER_NOT_INITIALIZED,
        'Server not initialized: call initialize first and echo Mcp-Session-Id on subsequent requests',
      ),
    }
  }
  if (!session.initialized) {
    return {
      envelope: buildError(
        id,
        JSON_RPC_ERRORS.SERVER_NOT_INITIALIZED,
        'Session exists but initialize handshake has not completed',
      ),
    }
  }
  // Cross-user session takeover guard (spec §6 edge case 15).
  if (session.user_id !== auth.userId) {
    return {
      envelope: buildError(
        id,
        JSON_RPC_ERRORS.INVALID_REQUEST,
        'Session does not belong to the authenticated user',
      ),
    }
  }

  if (method === 'tools/list') {
    return { envelope: buildResult(id, { tools: listToolsForRpc() }) }
  }

  if (method === 'tools/call') {
    const params = (req.params ?? {}) as { name?: unknown; arguments?: unknown }
    if (typeof params.name !== 'string') {
      return {
        envelope: buildError(id, JSON_RPC_ERRORS.INVALID_PARAMS, 'tools/call requires params.name (string)'),
      }
    }
    const tool = getTool(params.name)
    if (!tool) {
      return {
        envelope: buildError(id, JSON_RPC_ERRORS.METHOD_NOT_FOUND, `Unknown tool: ${params.name}`, {
          availableTools: Object.keys(listToolsForRpc().reduce((acc, t) => ({ ...acc, [t.name]: true }), {})),
        }),
      }
    }
    const args =
      params.arguments && typeof params.arguments === 'object' && !Array.isArray(params.arguments)
        ? (params.arguments as Record<string, unknown>)
        : {}

    try {
      const result = await startMcpObservation(
        `mcp.tool.${tool.name}`,
        {
          userId: auth.userId,
          sessionId: session.id,
          toolName: tool.name,
          input: args,
        },
        async (span) => {
          // Set the trace-level name to mcp.tool.<tool_name> so Langfuse
          // API queries by ?name=mcp.tool.<x> work correctly. Without this
          // the trace inherits the outer transport span name.
          span.otelSpan.setAttribute(
            LangfuseOtelSpanAttributes.TRACE_NAME,
            `mcp.tool.${tool.name}`,
          )
          setActiveTraceIO({ input: args })
          return tool.handler(args, { auth, session })
        },
      )
      return { envelope: buildResult(id, result) }
    } catch (err) {
      // Insufficient-credits is a structured JSON-RPC -32000 error per spec.
      if (err instanceof InsufficientCreditsError) {
        return {
          envelope: buildError(id, err.code, err.message, err.data),
        }
      }
      const message = err instanceof Error ? err.message : 'Tool execution failed'
      return {
        envelope: buildError(id, JSON_RPC_ERRORS.INTERNAL_ERROR, message),
      }
    }
  }

  return {
    envelope: buildError(id, JSON_RPC_ERRORS.METHOD_NOT_FOUND, `Method not found: ${method}`),
  }
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                        */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest): Promise<Response> {
  const authResult = await authenticate(req)
  if (authResult instanceof Response) return authResult
  const auth = authResult

  // Parse body
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonResponse(
      buildError(null, JSON_RPC_ERRORS.PARSE_ERROR, 'Body is not valid JSON'),
      400,
    )
  }
  let parsed
  try {
    parsed = parseJsonRpcBody(raw)
  } catch (err) {
    // parseJsonRpcBody throws JsonRpcError envelopes
    return jsonResponse(err as JsonRpcMessage, 400)
  }

  // Resolve session from header, if any
  const sessionHeader = req.headers.get(MCP_SESSION_HEADER)
  let session: McpSession | null = null
  if (sessionHeader) {
    session = await getSession(sessionHeader)
    if (!session) {
      // Unknown session id (e.g. server-side row deleted) → 404 per spec.
      return new Response(
        JSON.stringify(
          buildError(
            null,
            JSON_RPC_ERRORS.INVALID_REQUEST,
            'Unknown Mcp-Session-Id; client must re-initialize',
          ),
        ),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      )
    }
  }

  // Streaming path: single-message tools/call for tools whose handler
  // honors onProgress (currently `ask_sherpa`). Per MCP spec, the server
  // may respond with text/event-stream and emit notifications/progress
  // frames before the final tools/call result envelope. We stream by
  // default — clients that don't render notifications/progress will
  // discard them and still receive the final result envelope correctly.
  // If the client supplied a progressToken we honor it; otherwise we
  // synthesize one so notifications remain spec-valid.
  if (parsed.messages.length === 1 && !parsed.isBatch) {
    const msg = parsed.messages[0]
    if (msg.method === 'tools/call') {
      const params = (msg.params ?? {}) as { name?: unknown }
      const toolName = typeof params.name === 'string' ? params.name : ''
      if (STREAMING_TOOLS.has(toolName)) {
        const progressToken =
          extractProgressToken(msg) ?? `srv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
        return streamingToolCall(msg, auth, session, progressToken)
      }
    }
  }

  // Wrap the whole request in a transport-level observation. Per-tool
  // observations nest under this span via startMcpObservation in dispatch.
  const responses: JsonRpcMessage[] = []
  let issuedSession: McpSession | null = null

  await startMcpObservation(
    'mcp.transport.request',
    {
      userId: auth.userId,
      sessionId: session?.id ?? 'pre-init',
      input: { methods: parsed.messages.map((m) => m.method), batch: parsed.isBatch },
    },
    async () => {
      for (const msg of parsed.messages) {
        const { envelope, newSession } = await dispatch(msg, auth, session ?? issuedSession)
        responses.push(envelope)
        if (newSession && !session && !issuedSession) {
          issuedSession = newSession
        }
      }
      // Notifications: dispatched but no response. Phase 1 has no
      // server-handled notifications, so we ignore them.
    },
  )

  // Touch the session row to bump last_seen_at (best-effort).
  const activeSessionId = (issuedSession ?? session)?.id
  if (activeSessionId && (session !== null || issuedSession !== null)) {
    await touchSession(activeSessionId).catch(() => undefined)
  }

  // If the input was a batch, return an array. Otherwise return the
  // single envelope. Notifications-only input (no responses) → 202.
  if (responses.length === 0) {
    return new Response(null, { status: 202 })
  }
  const body = parsed.isBatch ? responses : responses[0]
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (issuedSession) {
    headers[MCP_SESSION_HEADER] = (issuedSession as McpSession).id
  }
  return new Response(JSON.stringify(body), { status: 200, headers })
}

/* ------------------------------------------------------------------ */
/*  GET — server-initiated SSE stream (Phase 2)                         */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest): Promise<Response> {
  const authResult = await authenticate(req)
  if (authResult instanceof Response) return authResult
  // No server-initiated streams in Phase 1 — return 405 so clients
  // know to fall back to POST-only operation.
  return new Response('Server-initiated streams not supported in Phase 1', {
    status: 405,
    headers: { Allow: 'POST, DELETE' },
  })
}

/* ------------------------------------------------------------------ */
/*  DELETE — session termination                                        */
/* ------------------------------------------------------------------ */

export async function DELETE(req: NextRequest): Promise<Response> {
  const authResult = await authenticate(req)
  if (authResult instanceof Response) return authResult
  const auth = authResult

  const sessionHeader = req.headers.get(MCP_SESSION_HEADER)
  if (!sessionHeader) {
    return jsonResponse(
      buildError(null, JSON_RPC_ERRORS.INVALID_REQUEST, 'Mcp-Session-Id header required'),
      400,
    )
  }
  const session = await getSession(sessionHeader)
  if (!session) {
    return new Response(null, { status: 204 })
  }
  if (session.user_id !== auth.userId) {
    return jsonResponse(
      buildError(null, JSON_RPC_ERRORS.INVALID_REQUEST, 'Session does not belong to authenticated user'),
      403,
    )
  }
  await deleteSession(session.id)
  return new Response(null, { status: 204 })
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function jsonResponse(body: JsonRpcMessage, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/* ------------------------------------------------------------------ */
/*  Streaming tools/call (SSE + notifications/progress)                 */
/* ------------------------------------------------------------------ */

/** Tools whose handler accepts an `onProgress` callback. */
const STREAMING_TOOLS = new Set(['ask_sherpa'])

/** Extract `params._meta.progressToken` per MCP spec; undefined if absent. */
function extractProgressToken(msg: JsonRpcRequest): string | number | undefined {
  const params = msg.params
  if (!params || typeof params !== 'object' || Array.isArray(params)) return undefined
  const meta = (params as Record<string, unknown>)._meta
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return undefined
  const tok = (meta as Record<string, unknown>).progressToken
  if (typeof tok === 'string' || typeof tok === 'number') return tok
  return undefined
}

/**
 * Run a single tools/call with progress streaming. Emits one
 * notifications/progress SSE frame per LLM text delta, then the final
 * tools/call result envelope. Session + tool validation mirrors dispatch().
 */
function streamingToolCall(
  msg: JsonRpcRequest,
  auth: McpAuthContext,
  session: McpSession | null,
  progressToken: string | number,
): Response {
  const id: JsonRpcId = msg.id

  if (!session) {
    return jsonResponse(
      buildError(
        id,
        JSON_RPC_ERRORS.SERVER_NOT_INITIALIZED,
        'Server not initialized: call initialize first and echo Mcp-Session-Id on subsequent requests',
      ),
      400,
    )
  }
  if (!session.initialized) {
    return jsonResponse(
      buildError(id, JSON_RPC_ERRORS.SERVER_NOT_INITIALIZED, 'Session exists but initialize handshake has not completed'),
      400,
    )
  }
  if (session.user_id !== auth.userId) {
    return jsonResponse(
      buildError(id, JSON_RPC_ERRORS.INVALID_REQUEST, 'Session does not belong to the authenticated user'),
      403,
    )
  }

  const params = (msg.params ?? {}) as { name?: unknown; arguments?: unknown }
  const tool = typeof params.name === 'string' ? getTool(params.name) : undefined
  if (!tool) {
    return jsonResponse(
      buildError(id, JSON_RPC_ERRORS.METHOD_NOT_FOUND, `Unknown tool: ${String(params.name)}`),
      400,
    )
  }
  const args =
    params.arguments && typeof params.arguments === 'object' && !Array.isArray(params.arguments)
      ? (params.arguments as Record<string, unknown>)
      : {}

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let progressCounter = 0
      const onProgress = (delta: string) => {
        progressCounter += 1
        const note: JsonRpcMessage = {
          jsonrpc: '2.0',
          method: 'notifications/progress',
          params: {
            progressToken,
            progress: progressCounter,
            message: delta,
          },
        }
        controller.enqueue(encoder.encode(encodeSseFrame(note)))
      }

      ;(async () => {
        try {
          const result = await startMcpObservation(
            `mcp.tool.${tool.name}`,
            {
              userId: auth.userId,
              sessionId: session.id,
              toolName: tool.name,
              input: args,
            },
            async (span) => {
              span.otelSpan.setAttribute(
                LangfuseOtelSpanAttributes.TRACE_NAME,
                `mcp.tool.${tool.name}`,
              )
              setActiveTraceIO({ input: args })
              return tool.handler(args, { auth, session, onProgress })
            },
          )
          controller.enqueue(encoder.encode(encodeSseFrame(buildResult(id, result))))
        } catch (err) {
          if (err instanceof InsufficientCreditsError) {
            controller.enqueue(
              encoder.encode(encodeSseFrame(buildError(id, err.code, err.message, err.data))),
            )
          } else {
            const message = err instanceof Error ? err.message : 'Tool execution failed'
            controller.enqueue(
              encoder.encode(encodeSseFrame(buildError(id, JSON_RPC_ERRORS.INTERNAL_ERROR, message))),
            )
          }
        } finally {
          controller.close()
          touchSession(session.id).catch(() => undefined)
        }
      })()
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
