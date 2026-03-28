-- Add ElevenLabs voice ID to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS elevenlabs_voice_id TEXT DEFAULT 'VsQmyFHffusQDewmHB5v';

-- Eddie Stirling is the default voice
COMMENT ON COLUMN profiles.elevenlabs_voice_id IS 'ElevenLabs voice ID for TTS. Default: Eddie Stirling (VsQmyFHffusQDewmHB5v)';
