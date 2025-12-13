-- Create conversation_attachments table for file uploads
CREATE TABLE IF NOT EXISTS conversation_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  file_size INTEGER NOT NULL, -- bytes
  storage_path TEXT NOT NULL, -- Supabase Storage path
  extracted_text TEXT, -- For documents (PDFs, docs)
  thumbnail_path TEXT, -- For images/videos
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_attachments_conversation ON conversation_attachments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user ON conversation_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_message ON conversation_attachments(message_id);

-- Enable RLS
ALTER TABLE conversation_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies: Users can only manage their own attachments
CREATE POLICY "Users can view own attachments" ON conversation_attachments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attachments" ON conversation_attachments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attachments" ON conversation_attachments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own attachments" ON conversation_attachments
  FOR DELETE USING (auth.uid() = user_id);

-- Super admin access
CREATE POLICY "Super admin full access to attachments" ON conversation_attachments
  FOR ALL USING (auth.email() = 'abhishekratna@gmail.com');

-- Add attachments array to messages table to reference attachment IDs
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_ids UUID[] DEFAULT '{}';

-- Create storage bucket for conversation files (run this in Supabase Dashboard SQL Editor)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'conversation-files',
--   'conversation-files',
--   false,
--   52428800, -- 50MB max
--   ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
-- );

-- Storage policies for the bucket (also run in Dashboard)
-- CREATE POLICY "Users can upload to own folder" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'conversation-files' AND
--     auth.uid()::text = (string_to_array(name, '/'))[1]
--   );
--
-- CREATE POLICY "Users can view own files" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'conversation-files' AND
--     auth.uid()::text = (string_to_array(name, '/'))[1]
--   );
--
-- CREATE POLICY "Users can delete own files" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'conversation-files' AND
--     auth.uid()::text = (string_to_array(name, '/'))[1]
--   );
