/**
 * MCP Streamable HTTP transport helpers (spec rev 2025-11-25).
 *
 * Owns:
 *   - JSON-RPC 2.0 message parsing / validation
 *   - SSE response framing for streaming responses
 *   - JSON-RPC envelope builders (success, error, notification)
 *
 * The route handler at src/app/api/mcp/route.ts uses these helpers
 * to translate raw HTTP requests <-> MCP server primitives.
 */

export const MCP_PROTOCOL_VERSION = '2025-11-25'
export const MCP_SESSION_HEADER = 'mcp-session-id'

/* ------------------------------------------------------------------ */
/*  JSON-RPC 2.0 types                                                 */
/* ------------------------------------------------------------------ */

export type JsonRpcId = string | number | null

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: JsonRpcId
  method: string
  params?: unknown
}

export interface JsonRpcNotification {
  jsonrpc: '2.0'
  method: string
  params?: unknown
}

export interface JsonRpcSuccess {
  jsonrpc: '2.0'
  id: JsonRpcId
  result: unknown
}

export interface JsonRpcErrorObject {
  code: number
  message: string
  data?: unknown
}

export interface JsonRpcError {
  jsonrpc: '2.0'
  id: JsonRpcId
  error: JsonRpcErrorObject
}

export type JsonRpcMessage =
  | JsonRpcRequest
  | JsonRpcNotification
  | JsonRpcSuccess
  | JsonRpcError

/* ------------------------------------------------------------------ */
/*  Standard error codes (JSON-RPC 2.0 + MCP additions)                */
/* ------------------------------------------------------------------ */

export const JSON_RPC_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  /** MCP: server received a request before initialize completed. */
  SERVER_NOT_INITIALIZED: -32002,
} as const

/* ------------------------------------------------------------------ */
/*  Parsing                                                            */
/* ------------------------------------------------------------------ */

export interface ParsedBody {
  /** A single request, or batch — both legal per JSON-RPC 2.0. */
  messages: JsonRpcRequest[]
  /** Notifications stripped from the input (no response expected). */
  notifications: JsonRpcNotification[]
  /** True if the input was a batch envelope. */
  isBatch: boolean
}

/**
 * Parse a raw POST body into JSON-RPC requests + notifications.
 * Throws a ParseError-shaped object the caller can hand to buildError.
 */
export function parseJsonRpcBody(raw: unknown): ParsedBody {
  if (raw === null || raw === undefined) {
    throw makeParseFailure('empty body')
  }
  const isBatch = Array.isArray(raw)
  const items = isBatch ? raw : [raw]
  const messages: JsonRpcRequest[] = []
  const notifications: JsonRpcNotification[] = []

  for (const item of items) {
    if (!isPlainObject(item)) {
      throw makeInvalidRequest('non-object envelope')
    }
    const obj = item as Record<string, unknown>
    if (obj.jsonrpc !== '2.0') {
      throw makeInvalidRequest('jsonrpc must be "2.0"')
    }
    if (typeof obj.method !== 'string' || obj.method.length === 0) {
      throw makeInvalidRequest('method must be a non-empty string')
    }
    if ('id' in obj && obj.id !== null && typeof obj.id !== 'string' && typeof obj.id !== 'number') {
      throw makeInvalidRequest('id must be string, number, or null')
    }
    if ('id' in obj) {
      messages.push({
        jsonrpc: '2.0',
        id: obj.id as JsonRpcId,
        method: obj.method,
        params: obj.params,
      })
    } else {
      notifications.push({
        jsonrpc: '2.0',
        method: obj.method,
        params: obj.params,
      })
    }
  }
  return { messages, notifications, isBatch }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function makeParseFailure(detail: string): JsonRpcError {
  return {
    jsonrpc: '2.0',
    id: null,
    error: { code: JSON_RPC_ERRORS.PARSE_ERROR, message: `Parse error: ${detail}` },
  }
}

function makeInvalidRequest(detail: string): JsonRpcError {
  return {
    jsonrpc: '2.0',
    id: null,
    error: { code: JSON_RPC_ERRORS.INVALID_REQUEST, message: `Invalid Request: ${detail}` },
  }
}

/* ------------------------------------------------------------------ */
/*  Envelope builders                                                  */
/* ------------------------------------------------------------------ */

export function buildResult(id: JsonRpcId, result: unknown): JsonRpcSuccess {
  return { jsonrpc: '2.0', id, result }
}

export function buildError(
  id: JsonRpcId,
  code: number,
  message: string,
  data?: unknown,
): JsonRpcError {
  return {
    jsonrpc: '2.0',
    id,
    error: data === undefined ? { code, message } : { code, message, data },
  }
}

/* ------------------------------------------------------------------ */
/*  SSE framing                                                        */
/* ------------------------------------------------------------------ */

/**
 * Encode a JSON-RPC envelope as a single SSE `data:` event. MCP
 * Streamable HTTP allows either application/json (single response)
 * or text/event-stream (one or more `data:` frames). For Phase 1 we
 * always return single-shot application/json to keep route logic
 * simple — these helpers exist for forward compatibility when we
 * add streaming tools (e.g. progressive query_pmm_sherpa).
 */
export function encodeSseFrame(envelope: JsonRpcMessage | JsonRpcMessage[]): string {
  return `data: ${JSON.stringify(envelope)}\n\n`
}

export function sseStream(envelopes: JsonRpcMessage[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const env of envelopes) {
        controller.enqueue(encoder.encode(encodeSseFrame(env)))
      }
      controller.close()
    },
  })
}
