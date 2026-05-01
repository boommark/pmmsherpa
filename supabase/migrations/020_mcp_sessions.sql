-- Migration 020: MCP session map
--
-- Streamable HTTP transport (spec rev 2025-11-25) requires a server-issued
-- session id returned on the response to the first `initialize`. Clients
-- echo it as `Mcp-Session-Id` on every subsequent request. Vercel
-- functions are stateless, so we persist sessions here.
--
-- Consumed by: src/lib/mcp/sessions.ts
-- Phase 1 Build Brief A.

CREATE TABLE IF NOT EXISTS mcp_sessions (
  id            uuid PRIMARY KEY,
  user_id       uuid NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  initialized   boolean NOT NULL DEFAULT false
);

-- Lookup by user (e.g. "all open sessions for this account") — small
-- table, but free hygiene.
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_user_id
  ON mcp_sessions(user_id);

-- Allow a janitor job to reap stale rows (last_seen_at < now() - 24h).
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_last_seen
  ON mcp_sessions(last_seen_at);

-- RLS: only the service role inserts/reads this table (the MCP route
-- uses createServiceClient()). Lock anon/authenticated out so a stolen
-- access token can't enumerate sessions across tenants.
ALTER TABLE mcp_sessions ENABLE ROW LEVEL SECURITY;

-- No policies → only the service role bypasses RLS by default.
