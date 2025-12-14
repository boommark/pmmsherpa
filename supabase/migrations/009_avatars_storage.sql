-- Create storage bucket for user avatars
-- Note: Storage bucket creation and policies must be run in Supabase Dashboard SQL Editor
-- This migration documents the required setup

-- The avatars bucket should be PUBLIC so avatar URLs can be accessed without authentication
-- Run the following in Supabase Dashboard SQL Editor:

-- Create the avatars bucket (public for read access)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'avatars',
--   'avatars',
--   true,  -- Public bucket so avatar images can be displayed
--   5242880, -- 5MB max
--   ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
-- );

-- Storage policies for the avatars bucket
-- Users can upload to their own folder (folder name = user id)
-- CREATE POLICY "Users can upload own avatar" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'avatars' AND
--     auth.uid()::text = (string_to_array(name, '/'))[1]
--   );

-- Anyone can view avatars (public bucket)
-- CREATE POLICY "Anyone can view avatars" ON storage.objects
--   FOR SELECT USING (bucket_id = 'avatars');

-- Users can update their own avatar
-- CREATE POLICY "Users can update own avatar" ON storage.objects
--   FOR UPDATE USING (
--     bucket_id = 'avatars' AND
--     auth.uid()::text = (string_to_array(name, '/'))[1]
--   );

-- Users can delete their own avatar
-- CREATE POLICY "Users can delete own avatar" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'avatars' AND
--     auth.uid()::text = (string_to_array(name, '/'))[1]
--   );
