-- Enable Row Level Security on all user tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_responses ENABLE ROW LEVEL SECURITY;

-- Documents and chunks are public read (knowledge base)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

-- =====================
-- PROFILES POLICIES
-- =====================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================
-- CONVERSATIONS POLICIES
-- =====================

-- Users can read their own conversations
CREATE POLICY "Users can read own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create conversations for themselves
CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- MESSAGES POLICIES
-- =====================

-- Users can read messages from their own conversations
CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

-- Users can create messages in their own conversations
CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

-- Users can update their own messages (for saving/rating)
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

-- =====================
-- USAGE LOGS POLICIES
-- =====================

-- Users can read their own usage logs
CREATE POLICY "Users can read own usage logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert usage logs (API routes)
CREATE POLICY "Service role can insert usage logs"
  ON usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- SAVED RESPONSES POLICIES
-- =====================

-- Users can read their own saved responses
CREATE POLICY "Users can read own saved responses"
  ON saved_responses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create saved responses for themselves
CREATE POLICY "Users can create own saved responses"
  ON saved_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own saved responses
CREATE POLICY "Users can update own saved responses"
  ON saved_responses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved responses
CREATE POLICY "Users can delete own saved responses"
  ON saved_responses FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- DOCUMENTS POLICIES (PUBLIC READ)
-- =====================

-- Anyone authenticated can read documents
CREATE POLICY "Authenticated users can read documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can modify documents (ingestion)
CREATE POLICY "Service role can manage documents"
  ON documents FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================
-- CHUNKS POLICIES (PUBLIC READ)
-- =====================

-- Anyone authenticated can read chunks
CREATE POLICY "Authenticated users can read chunks"
  ON chunks FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can modify chunks (ingestion)
CREATE POLICY "Service role can manage chunks"
  ON chunks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================
-- GRANT PERMISSIONS
-- =====================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant permissions to authenticated users
GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT SELECT, INSERT ON usage_logs TO authenticated;
GRANT ALL ON saved_responses TO authenticated;
GRANT SELECT ON documents TO authenticated;
GRANT SELECT ON chunks TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant execute on search functions to authenticated users
GRANT EXECUTE ON FUNCTION match_chunks TO authenticated;
GRANT EXECUTE ON FUNCTION keyword_search_chunks TO authenticated;
GRANT EXECUTE ON FUNCTION hybrid_search TO authenticated;
GRANT EXECUTE ON FUNCTION search_documents TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_with_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_usage_stats TO authenticated;
