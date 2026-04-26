-- Migration 019: Referral system
-- Tracks referral codes, attribution, reward milestones, and time-boxed Starter access.
-- Tier gate reads starter_access_until at request time — no cron job needed for expiry.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_rewards_granted INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS starter_access_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS profiles_referral_code_idx ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS profiles_referred_by_idx ON profiles(referred_by);
