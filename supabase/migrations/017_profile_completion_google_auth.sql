-- Migration 017: Profile completion gate for Google OAuth flow
--
-- Adds consent_given and profile_completed columns to profiles.
-- Google OAuth (and email signup) users are created immediately but must
-- complete their profile (LinkedIn URL + consent) before accessing chat.
-- The middleware checks profile_completed to gate access.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS consent_given boolean NOT NULL DEFAULT false;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_completed boolean NOT NULL DEFAULT false;

-- Backfill: all existing users who already have access should be marked as completed.
-- This includes founder accounts and all previously approved users.
UPDATE profiles SET profile_completed = true WHERE id IN (
  SELECT id FROM auth.users WHERE banned_until IS NULL OR banned_until < now()
);

-- Also mark founders explicitly
UPDATE profiles
SET profile_completed = true, consent_given = true
WHERE tier = 'founder';

-- Index for middleware lookups (fast check on every request)
CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed
  ON profiles(profile_completed);
