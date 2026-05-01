/**
 * MCP session management against Postgres `mcp_sessions`.
 *
 * Streamable HTTP requires a server-issued session id (Mcp-Session-Id
 * header) returned on the response to the first `initialize`. Clients
 * echo it on every subsequent request. We persist sessions in Supabase
 * because Vercel serverless functions are stateless.
 *
 * Schema lives in supabase/migrations/<ts>_mcp_sessions.sql.
 */

import { randomUUID } from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/server'

export interface McpSession {
  id: string
  user_id: string
  created_at: string
  last_seen_at: string
  initialized: boolean
}

const TABLE = 'mcp_sessions'

/**
 * Create a new session row. Called from the `initialize` JSON-RPC
 * handler. Returns the generated session id.
 */
export async function createSession(userId: string): Promise<McpSession> {
  const id = randomUUID()
  const now = new Date().toISOString()
  const supabase = await createServiceClient()
  const row: McpSession = {
    id,
    user_id: userId,
    created_at: now,
    last_seen_at: now,
    initialized: false,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from(TABLE) as any).insert(row)
  if (error) {
    throw new Error(`Failed to create MCP session: ${error.message}`)
  }
  return row
}

/**
 * Look up a session by id. Returns null if it doesn't exist (caller
 * should respond 404 → client must re-initialize).
 */
export async function getSession(sessionId: string): Promise<McpSession | null> {
  if (!sessionId) return null
  const supabase = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from(TABLE) as any)
    .select('*')
    .eq('id', sessionId)
    .maybeSingle()
  if (error || !data) return null
  return data as McpSession
}

/**
 * Bump last_seen_at on an existing session. No-op if the row doesn't
 * exist. Best-effort — we don't fail the request on touch errors.
 */
export async function touchSession(sessionId: string): Promise<void> {
  if (!sessionId) return
  const supabase = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from(TABLE) as any)
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', sessionId)
}

/**
 * Mark a session initialized after the `initialize` JSON-RPC handshake
 * completes. tools/call is rejected with -32002 until this is true.
 */
export async function markInitialized(sessionId: string): Promise<void> {
  const supabase = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from(TABLE) as any)
    .update({ initialized: true, last_seen_at: new Date().toISOString() })
    .eq('id', sessionId)
}

/**
 * Delete a session. Called from DELETE /api/mcp.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  if (!sessionId) return
  const supabase = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from(TABLE) as any).delete().eq('id', sessionId)
}
