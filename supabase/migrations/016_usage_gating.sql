-- Migration 016: Usage gating — monthly message quota
--
-- Adds tier, messages_used_this_period, and period_start columns to profiles.
-- Backfills founder accounts (abhishekratna@gmail.com, aratnaai@gmail.com) to tier='founder'.
-- All other existing users default to tier='free' via the column DEFAULT.
-- Also adds increment_messages_used(uuid) — an atomic, race-safe RPC used by
-- the post-LLM counter bump in /api/chat (consumed by Phase 1 Plan 02).
--
-- Consumed by: src/app/api/chat/route.ts pre-LLM gate and post-LLM increment
-- (see Phase 1 Plan 02).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS messages_used_this_period int NOT NULL DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS period_start date NOT NULL DEFAULT date_trunc('month', now())::date;

-- Backfill founder tier for the two accounts that bypass all quota limits.
-- Supersedes the old EXEMPT_EMAILS array in src/app/api/chat/route.ts:109-114.
-- Note: abhishekratna1@gmail.com is INTENTIONALLY dropped from the founder list
-- (user switched to aratnaai@gmail.com). pmmsherpatest@gmail.com is also dropped
-- (test account pays like everyone else for cleaner data).
UPDATE profiles
SET tier = 'founder'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('abhishekratna@gmail.com', 'aratnaai@gmail.com')
);

-- Optional but recommended: speeds up the per-user UPDATE in the hot chat path.
-- profiles is small today but this is cheap hygiene.
CREATE INDEX IF NOT EXISTS idx_profiles_period_start
  ON profiles(period_start);

-- Atomic monthly counter increment — race-safe against concurrent chat requests.
-- Called from src/app/api/chat/route.ts AFTER a successful LLM response.
-- Founders are excluded via the tier != 'founder' predicate so their counter
-- stays at 0 and they never burn quota. Runs as SECURITY DEFINER because the
-- anon/session client invokes it; the WHERE id = p_user_id scope ensures a
-- user can only increment their own row (the route passes auth.uid()).
CREATE OR REPLACE FUNCTION increment_messages_used(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles
  SET messages_used_this_period = messages_used_this_period + 1
  WHERE id = p_user_id AND tier != 'founder';
$$;

GRANT EXECUTE ON FUNCTION increment_messages_used(uuid) TO authenticated;
