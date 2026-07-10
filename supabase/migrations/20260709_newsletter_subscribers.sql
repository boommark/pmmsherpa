-- Blog newsletter subscribers (double-opt-in).
-- Service-role only: RLS is enabled with NO policies (deny-all for anon/authenticated).
-- All reads/writes go through /api/newsletter/* route handlers using the service key.

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'unsubscribed')),
  source text,
  confirm_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create unique index if not exists idx_newsletter_subscribers_confirm_token
  on newsletter_subscribers (confirm_token);

alter table newsletter_subscribers enable row level security;

-- Deny-all: intentionally no policies. Only the service role (which bypasses
-- RLS) can touch this table.

comment on table newsletter_subscribers is
  'Blog newsletter signups. pending -> confirmed via double-opt-in email; service-role access only.';
