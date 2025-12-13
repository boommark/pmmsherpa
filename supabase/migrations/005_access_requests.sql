-- Migration: Access Requests Table
-- Description: Create table for access request waitlist with admin approval

-- Create access_requests table
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  profession TEXT,
  company TEXT,
  linkedin_url TEXT,
  use_cases TEXT[] DEFAULT '{}', -- Array of selected use cases
  password_hash TEXT NOT NULL, -- Hashed password (user provides during request)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approval_token UUID DEFAULT gen_random_uuid(), -- Secure token for approval link
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_approval_token ON access_requests(approval_token);

-- Enable RLS
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only super admin can read/write
-- First drop if exists to avoid conflicts
DROP POLICY IF EXISTS "Super admin full access on access_requests" ON access_requests;

CREATE POLICY "Super admin full access on access_requests" ON access_requests
  FOR ALL USING (auth.email() = 'abhishekratna@gmail.com');

-- Allow anonymous users to insert access requests (for signup form)
DROP POLICY IF EXISTS "Anyone can request access" ON access_requests;

CREATE POLICY "Anyone can request access" ON access_requests
  FOR INSERT WITH CHECK (true);

-- Add new columns to profiles table for additional user info
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS use_cases TEXT[] DEFAULT '{}';

-- Add super admin policies to existing tables
-- Profiles
DROP POLICY IF EXISTS "Super admin full access on profiles" ON profiles;
CREATE POLICY "Super admin full access on profiles" ON profiles
  FOR ALL USING (auth.email() = 'abhishekratna@gmail.com');

-- Conversations
DROP POLICY IF EXISTS "Super admin full access on conversations" ON conversations;
CREATE POLICY "Super admin full access on conversations" ON conversations
  FOR ALL USING (auth.email() = 'abhishekratna@gmail.com');

-- Messages
DROP POLICY IF EXISTS "Super admin full access on messages" ON messages;
CREATE POLICY "Super admin full access on messages" ON messages
  FOR ALL USING (auth.email() = 'abhishekratna@gmail.com');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_access_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_access_request_updated_at ON access_requests;
CREATE TRIGGER trigger_update_access_request_updated_at
  BEFORE UPDATE ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_access_request_updated_at();
