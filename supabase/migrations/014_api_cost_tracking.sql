-- Migration 014: API Cost Tracking
-- Tracks all external API call costs for billing and usage analysis

CREATE TABLE api_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service TEXT NOT NULL,          -- claude, gemini, gemini_flash_lite, openai_embeddings, perplexity, brave_search, jina, firecrawl, llamaparse, elevenlabs
  operation TEXT NOT NULL,        -- chat, query_plan, embedding, web_research, web_search, url_fetch, url_scrape, doc_parse, tts
  input_tokens INTEGER,
  output_tokens INTEGER,
  units INTEGER,                  -- generic: chars (tts), pages (parse), requests (search), tokens (embed)
  unit_type TEXT,                 -- tokens, characters, pages, requests
  cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  metadata JSONB,
  conversation_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_costs_user_id ON api_costs(user_id);
CREATE INDEX idx_api_costs_created_at ON api_costs(created_at);
CREATE INDEX idx_api_costs_service ON api_costs(service);

-- RLS
ALTER TABLE api_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own api costs"
  ON api_costs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api costs"
  ON api_costs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on api_costs"
  ON api_costs FOR ALL
  USING (current_setting('request.jwt.claims', true)::json ->> 'role' = 'service_role');
