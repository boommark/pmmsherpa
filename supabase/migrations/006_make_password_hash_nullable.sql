-- Migration: Make password_hash nullable
-- Description: Since users now set their password after approval, we no longer store password_hash during signup

-- Make password_hash column nullable
ALTER TABLE access_requests ALTER COLUMN password_hash DROP NOT NULL;

-- Update existing records that might have null linkedin_url to set a placeholder
-- (This is for data cleanup if needed)
-- UPDATE access_requests SET linkedin_url = '' WHERE linkedin_url IS NULL;
