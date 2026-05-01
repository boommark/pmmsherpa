-- Phase 1.5 polish: function-level statement_timeout + intermediate-set cap
-- on hybrid_search.
--
-- Why: long expanded tsqueries from `expandQuery()` can scan large GIN slices
-- and run ts_rank_cd over millions of rows before the LIMIT cuts in. p95 is
-- ~1-2s but the long tail can exceed the role default. Function-attached
-- `SET statement_timeout` keeps the relaxation scoped to this function.
-- LEAST(match_count * 2, 40) caps intermediate result sets.
--
-- Behavior is otherwise unchanged from migration 004.

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
  speaker_role TEXT,
  url TEXT
)
LANGUAGE plpgsql
SET statement_timeout = '15s'
AS $$
DECLARE
  keyword_weight FLOAT := 1.0 - semantic_weight;
  intermediate_cap INT := LEAST(match_count * 2, 40);
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
    LIMIT intermediate_cap
  ),
  keyword_results AS (
    SELECT
      c.id,
      ts_rank_cd(c.fts_vector, websearch_to_tsquery('english', search_query)) AS keyword_score
    FROM chunks c
    WHERE c.fts_vector @@ websearch_to_tsquery('english', search_query)
    ORDER BY keyword_score DESC
    LIMIT intermediate_cap
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
    d.speaker_role,
    d.url
  FROM combined c
  JOIN documents d ON c.document_id = d.id
  ORDER BY c.combined_score DESC
  LIMIT match_count;
END;
$$;
