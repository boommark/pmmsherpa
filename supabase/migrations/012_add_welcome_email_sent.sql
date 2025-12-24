-- Migration: Add welcome_email_sent to access_requests
-- Description: Track whether the celebratory welcome email has been sent to approved users

-- Add welcome_email_sent column
ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups of users needing welcome emails
CREATE INDEX IF NOT EXISTS idx_access_requests_welcome_email ON access_requests(welcome_email_sent) WHERE welcome_email_sent = FALSE;
