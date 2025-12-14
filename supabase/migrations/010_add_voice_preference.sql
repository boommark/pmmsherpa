-- Add voice_preference column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS voice_preference TEXT DEFAULT 'nova';

-- Add check constraint for valid TTS voices
ALTER TABLE profiles
ADD CONSTRAINT valid_voice_preference
CHECK (voice_preference IN ('alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'));

-- Update existing rows to have default voice
UPDATE profiles SET voice_preference = 'nova' WHERE voice_preference IS NULL;
