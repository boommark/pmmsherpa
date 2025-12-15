-- Migration: Add user_id to access_requests
-- Description: Link access requests to the auth user created during signup
-- The new flow creates the user immediately (but banned) when they request access

-- Add user_id column to link access request to auth user
ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_access_requests_user_id ON access_requests(user_id);
