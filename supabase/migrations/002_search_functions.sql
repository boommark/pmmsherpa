-- Semantic similarity search function
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(512),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT,
  token_count INT,
  context_header TEXT,
  page_number INT,
  section_title TEXT,
  question TEXT,
  document_title TEXT,
  source_type TEXT,
  author TEXT,
  url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity,
    c.token_count,
    c.context_header,
    c.page_number,
    c.section_title,
    c.question,
    d.title AS document_title,
    d.source_type,
    d.author,
    d.url
  FROM chunks c
  JOIN documents d ON c.document_id = d.id
  WHERE c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Full-text keyword search function
CREATE OR REPLACE FUNCTION keyword_search_chunks(
  search_query TEXT,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  rank FLOAT,
  token_count INT,
  context_header TEXT,
  page_number INT,
  section_title TEXT,
  question TEXT,
  document_title TEXT,
  source_type TEXT,
  author TEXT,
  url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.content,
    ts_rank_cd(c.fts_vector, websearch_to_tsquery('english', search_query)) AS rank,
    c.token_count,
    c.context_header,
    c.page_number,
    c.section_title,
    c.question,
    d.title AS document_title,
    d.source_type,
    d.author,
    d.url
  FROM chunks c
  JOIN documents d ON c.document_id = d.id
  WHERE c.fts_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

-- Hybrid search function (combines semantic and keyword search)
CREATE OR REPLACE FUNCTION hybrid_search(
  query_embedding VECTOR(512),
  search_query TEXT,
  semantic_weight FLOAT DEFAULT 0.7,
  match_threshold FLOAT DEFAULT 0.4,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  combined_score FLOAT,
  semantic_score FLOAT,
  keyword_score FLOAT,
  token_count INT,
  context_header TEXT,
  page_number INT,
  section_title TEXT,
  question TEXT,
  document_title TEXT,
  source_type TEXT,
  author TEXT,
  url TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  keyword_weight FLOAT := 1.0 - semantic_weight;
BEGIN
  RETURN QUERY
  WITH semantic_results AS (
    SELECT
      c.id,
      c.document_id,
      c.content,
      1 - (c.embedding <=> query_embedding) AS semantic_score,
      c.token_count,
      c.context_header,
      c.page_number,
      c.section_title,
      c.question
    FROM chunks c
    WHERE c.embedding IS NOT NULL
      AND 1 - (c.embedding <=> query_embedding) > match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  keyword_results AS (
    SELECT
      c.id,
      ts_rank_cd(c.fts_vector, websearch_to_tsquery('english', search_query)) AS keyword_score
    FROM chunks c
    WHERE c.fts_vector @@ websearch_to_tsquery('english', search_query)
    ORDER BY keyword_score DESC
    LIMIT match_count * 2
  ),
  combined AS (
    SELECT
      COALESCE(s.id, k_chunk.id) AS id,
      COALESCE(s.document_id, k_chunk.document_id) AS document_id,
      COALESCE(s.content, k_chunk.content) AS content,
      (
        COALESCE(s.semantic_score, 0) * semantic_weight +
        COALESCE(k.keyword_score, 0) * keyword_weight
      ) AS combined_score,
      COALESCE(s.semantic_score, 0) AS semantic_score,
      COALESCE(k.keyword_score, 0) AS keyword_score,
      COALESCE(s.token_count, k_chunk.token_count) AS token_count,
      COALESCE(s.context_header, k_chunk.context_header) AS context_header,
      COALESCE(s.page_number, k_chunk.page_number) AS page_number,
      COALESCE(s.section_title, k_chunk.section_title) AS section_title,
      COALESCE(s.question, k_chunk.question) AS question
    FROM semantic_results s
    FULL OUTER JOIN keyword_results k ON s.id = k.id
    LEFT JOIN chunks k_chunk ON k.id = k_chunk.id
  )
  SELECT
    c.id,
    c.document_id,
    c.content,
    c.combined_score,
    c.semantic_score,
    c.keyword_score,
    c.token_count,
    c.context_header,
    c.page_number,
    c.section_title,
    c.question,
    d.title AS document_title,
    d.source_type,
    d.author,
    d.url
  FROM combined c
  JOIN documents d ON c.document_id = d.id
  ORDER BY c.combined_score DESC
  LIMIT match_count;
END;
$$;

-- Search documents by metadata
CREATE OR REPLACE FUNCTION search_documents(
  search_query TEXT DEFAULT NULL,
  source_type_filter TEXT DEFAULT NULL,
  author_filter TEXT DEFAULT NULL,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  source_type TEXT,
  author TEXT,
  url TEXT,
  word_count INT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.source_type,
    d.author,
    d.url,
    d.word_count,
    d.created_at
  FROM documents d
  WHERE
    (search_query IS NULL OR d.fts_vector @@ websearch_to_tsquery('english', search_query))
    AND (source_type_filter IS NULL OR d.source_type = source_type_filter)
    AND (author_filter IS NULL OR d.author ILIKE '%' || author_filter || '%')
  ORDER BY d.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Get conversation with messages
CREATE OR REPLACE FUNCTION get_conversation_with_messages(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  conversation_id UUID,
  conversation_title TEXT,
  model_used TEXT,
  message_count INT,
  is_archived BOOLEAN,
  conversation_created_at TIMESTAMPTZ,
  message_id UUID,
  role TEXT,
  content TEXT,
  model TEXT,
  citations JSONB,
  is_saved BOOLEAN,
  rating INT,
  message_created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user owns the conversation
  IF NOT EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = p_conversation_id AND c.user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Conversation not found or access denied';
  END IF;

  RETURN QUERY
  SELECT
    c.id AS conversation_id,
    c.title AS conversation_title,
    c.model_used,
    c.message_count,
    c.is_archived,
    c.created_at AS conversation_created_at,
    m.id AS message_id,
    m.role,
    m.content,
    m.model,
    m.citations,
    m.is_saved,
    m.rating,
    m.created_at AS message_created_at
  FROM conversations c
  LEFT JOIN messages m ON c.id = m.conversation_id
  WHERE c.id = p_conversation_id
  ORDER BY m.created_at ASC;
END;
$$;

-- Get usage statistics for a user
CREATE OR REPLACE FUNCTION get_user_usage_stats(
  p_user_id UUID,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  total_queries BIGINT,
  total_tokens BIGINT,
  claude_queries BIGINT,
  gemini_queries BIGINT,
  avg_latency_ms NUMERIC,
  queries_by_day JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT
      DATE(created_at) AS day,
      COUNT(*) AS count,
      SUM(total_tokens) AS tokens
    FROM usage_logs
    WHERE user_id = p_user_id
      AND created_at > NOW() - (p_days || ' days')::INTERVAL
    GROUP BY DATE(created_at)
    ORDER BY day
  )
  SELECT
    COUNT(*)::BIGINT AS total_queries,
    COALESCE(SUM(total_tokens), 0)::BIGINT AS total_tokens,
    COUNT(*) FILTER (WHERE model = 'claude')::BIGINT AS claude_queries,
    COUNT(*) FILTER (WHERE model = 'gemini')::BIGINT AS gemini_queries,
    ROUND(AVG(latency_ms)::NUMERIC, 2) AS avg_latency_ms,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('day', day, 'count', count, 'tokens', tokens))
       FROM daily_stats),
      '[]'::JSONB
    ) AS queries_by_day
  FROM usage_logs
  WHERE user_id = p_user_id
    AND created_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$;
