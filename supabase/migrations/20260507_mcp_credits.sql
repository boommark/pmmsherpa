-- Migration 20260507: MCP credit system
--
-- Adds three columns to `profiles` for the MCP credit ledger and creates a
-- webhook idempotency table + atomic deduction RPC. The MCP credit system
-- is INDEPENDENT from the per-tier monthly message gate consumed by the web
-- /api/chat surface (migration 016). Each MCP tool call (ask_sherpa,
-- draft_artifact, get_feedback, scope_pmm_research) costs 2 credits.
--
-- Plan caps:
--   free       → 10  monthly credits (resets each month)
--   starter    → 200 monthly credits (resets each month)
-- Founders bypass the gate entirely (handled in app code).
--
-- Purchased credits are rolling — they never reset and are spent only after
-- the monthly bucket is exhausted.
--
-- Consumed by:
--   - src/lib/mcp/credits.ts (deduction/check helpers)
--   - src/app/api/stripe/checkout-credits/route.ts (one-time pack purchase)
--   - src/app/api/webhooks/stripe/route.ts (credit grant on completed payment)
--   - src/app/api/cron/reset-monthly-credits/route.ts (daily lazy reset job)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mcp_credits_monthly_remaining int NOT NULL DEFAULT 10;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mcp_credits_purchased_remaining int NOT NULL DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mcp_credits_month_start timestamptz NOT NULL DEFAULT now();

-- Backfill: anyone who already has tier='starter' gets the starter monthly
-- bucket; everyone else stays at the column default of 10. We touch only
-- the monthly bucket — purchased stays at 0. month_start is already
-- now() from the column default, so the daily reset job will recompute on
-- the appropriate cadence per user.
UPDATE profiles
SET mcp_credits_monthly_remaining = 200
WHERE tier = 'starter';

-- Indices: the deduction path filters by id (PK, already indexed) and the
-- daily reset job filters by mcp_credits_month_start. Add an index for the
-- latter to keep the scan cheap as the user table grows.
CREATE INDEX IF NOT EXISTS idx_profiles_mcp_credits_month_start
  ON profiles(mcp_credits_month_start);

-- ------------------------------------------------------------------
-- Webhook idempotency table
-- ------------------------------------------------------------------
-- Stripe webhooks can be redelivered. To avoid double-granting credits
-- on retries, we record every processed event_id and short-circuit on
-- duplicate. Service role only (no user-facing access).
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------
-- Atomic deduction RPC
-- ------------------------------------------------------------------
-- Subtracts `p_amount` credits from a user, draining the monthly bucket
-- first and the purchased bucket second. Race-safe via single UPDATE with
-- CASE expressions. Returns the new balance row (or zero rows if the
-- balance was insufficient — caller treats null result as "insufficient").
--
-- Conceptually:
--   if monthly >= amount     → monthly -= amount
--   elif (monthly + purchased) >= amount → purchased -= (amount - monthly); monthly = 0
--   else                                → no-op (return null)
CREATE OR REPLACE FUNCTION public.deduct_mcp_credits(
  p_user_id uuid,
  p_amount int
)
RETURNS TABLE(
  monthly_remaining int,
  purchased_remaining int
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles
  SET
    mcp_credits_monthly_remaining = CASE
      WHEN mcp_credits_monthly_remaining >= p_amount THEN mcp_credits_monthly_remaining - p_amount
      ELSE 0
    END,
    mcp_credits_purchased_remaining = CASE
      WHEN mcp_credits_monthly_remaining >= p_amount THEN mcp_credits_purchased_remaining
      ELSE mcp_credits_purchased_remaining - (p_amount - mcp_credits_monthly_remaining)
    END
  WHERE id = p_user_id
    AND (mcp_credits_monthly_remaining + mcp_credits_purchased_remaining) >= p_amount
  RETURNING mcp_credits_monthly_remaining, mcp_credits_purchased_remaining;
$$;

GRANT EXECUTE ON FUNCTION public.deduct_mcp_credits(uuid, int) TO authenticated, service_role;

-- ------------------------------------------------------------------
-- Atomic credit grant RPC (used by webhook)
-- ------------------------------------------------------------------
-- Adds `p_amount` to mcp_credits_purchased_remaining for a user. Race-safe
-- via single UPDATE.
CREATE OR REPLACE FUNCTION public.grant_mcp_credits(
  p_user_id uuid,
  p_amount int
)
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles
  SET mcp_credits_purchased_remaining = mcp_credits_purchased_remaining + p_amount
  WHERE id = p_user_id
  RETURNING mcp_credits_purchased_remaining;
$$;

GRANT EXECUTE ON FUNCTION public.grant_mcp_credits(uuid, int) TO service_role;
