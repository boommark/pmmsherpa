-- MCP OAuth 2.1 + PKCE storage tables.
--
-- We do NOT mint our own JWTs — we issue opaque MCP authorization codes that
-- bind a PKCE challenge to a Supabase user/session. The /token endpoint
-- exchanges the opaque code for the Supabase access_token + refresh_token.
--
-- Tables:
--   mcp_clients     — registered OAuth clients (RFC 7591 dynamic registration)
--   mcp_auth_codes  — short-lived authorization codes (10-min TTL, single-use)

create table if not exists public.mcp_clients (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  client_name text not null,
  redirect_uris jsonb not null default '[]'::jsonb,
  -- Public clients (PKCE) have no secret. Reserved for confidential clients later.
  client_secret text,
  token_endpoint_auth_method text not null default 'none',
  grant_types jsonb not null default '["authorization_code", "refresh_token"]'::jsonb,
  response_types jsonb not null default '["code"]'::jsonb,
  scope text not null default 'mcp:read mcp:query offline_access',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists mcp_clients_client_id_idx on public.mcp_clients (client_id);

create table if not exists public.mcp_auth_codes (
  code text primary key,
  client_id text not null references public.mcp_clients(client_id) on delete cascade,
  supabase_user_id uuid not null,
  -- The full Supabase session (access_token, refresh_token, expires_at, etc.)
  -- captured at /callback time. /token replays it to the client.
  supabase_session jsonb not null,
  code_challenge text not null,
  code_challenge_method text not null default 'S256',
  redirect_uri text not null,
  scope text not null default 'mcp:read mcp:query',
  state text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mcp_auth_codes_user_id_idx on public.mcp_auth_codes (supabase_user_id);
create index if not exists mcp_auth_codes_expires_at_idx on public.mcp_auth_codes (expires_at);

-- RLS: only the service role touches these tables. No user-facing access.
alter table public.mcp_clients enable row level security;
alter table public.mcp_auth_codes enable row level security;

-- (No policies = service-role-only via Supabase client with SUPABASE_SERVICE_ROLE_KEY.)

-- Cleanup helper: routes can call this opportunistically, or schedule via pg_cron.
create or replace function public.mcp_purge_expired_codes()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted integer;
begin
  delete from public.mcp_auth_codes
  where expires_at < now() - interval '1 hour'
     or used_at is not null and used_at < now() - interval '1 hour';
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;
