-- Migration 018: Stripe billing columns
--
-- Adds stripe_customer_id and stripe_subscription_id to profiles.
-- Used by Stripe webhook handler to link Stripe customers to Supabase users.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Index for webhook lookups by customer ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
