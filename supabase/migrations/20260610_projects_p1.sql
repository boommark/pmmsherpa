-- Projects feature — Phase 1 (schema + ingestion backend).
--
-- Purely ADDITIVE: new tables, one new RPC, one new storage bucket. Does NOT
-- touch the global `chunks`/`documents` tables or the existing `hybrid_search`
-- function (the DB is shared between staging and prod).
--
-- Design notes (see .planning/scope_2026-06-09_mcp_fixes_and_projects.md WS3):
--   - Separate `project_chunks` table keeps the global HNSW index untouched,
--     gives clean cascade deletes, and simple RLS.
--   - v1 retrieval is an EXACT scan (btree on project_id, no HNSW) —
--     per-project corpora are small (~100 docs max), exact KNN is single-digit
--     ms with perfect recall. Add HNSW only if a project exceeds ~50K chunks.
--   - RLS (user_id = auth.uid()) on all three tables. The chat/API layer uses
--     the service-role client, so route-level ownership checks remain
--     load-bearing — RLS is defense in depth.

-- ────────────────────────────────────────────────────────────────────────────
-- projects
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instructions TEXT, -- Tier 0: free-text project instructions, verbatim in system prompt
  total_token_count INT NOT NULL DEFAULT 0, -- sum of ready docs' token_count
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- project_documents
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT, -- null for pasted text
  mime_type TEXT,
  storage_path TEXT, -- bucket-relative: {user_id}/{project_id}/{doc_id}; null for pasted text
  source_type TEXT NOT NULL DEFAULT 'file' CHECK (source_type IN ('file', 'text')),
  tier TEXT NOT NULL DEFAULT 'rag' CHECK (tier IN ('pinned', 'rag')),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  error_message TEXT,
  llamaparse_job_id TEXT,
  synopsis TEXT, -- 2-3 sentence Haiku summary (corpus "table of contents")
  full_text TEXT, -- extracted markdown (files) or pasted content (text)
  token_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_user ON project_documents(user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- project_chunks
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES project_documents(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE, -- denormalized for fast filter
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- denormalized for RLS
  content TEXT NOT NULL,
  context_header TEXT, -- Haiku contextual-retrieval preamble
  section_title TEXT,
  page_number INT,
  token_count INT,
  embedding VECTOR(512),
  fts TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

-- Exact-scan retrieval: btree on project_id narrows the scan, gin serves keyword
-- search. Deliberately NO HNSW index in v1.
CREATE INDEX IF NOT EXISTS idx_project_chunks_project ON project_chunks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_chunks_document ON project_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_project_chunks_fts ON project_chunks USING gin(fts);

-- ────────────────────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own project documents" ON project_documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project documents" ON project_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project documents" ON project_documents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own project documents" ON project_documents
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own project chunks" ON project_chunks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project chunks" ON project_chunks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project chunks" ON project_chunks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own project chunks" ON project_chunks
  FOR DELETE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- project_hybrid_search — clone of hybrid_search (022) semantics, filtered to
-- one project. 70% semantic + 30% keyword, same return shape plus the project
-- document's title and tier. Exact scan (no vector index) is intentional.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION project_hybrid_search(
  query_embedding VECTOR(512),
  query_text TEXT,
  p_project_id UUID,
  match_count INT DEFAULT 12,
  semantic_weight FLOAT DEFAULT 0.7,
  match_threshold FLOAT DEFAULT 0.4
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
  document_title TEXT,
  tier TEXT
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
      (1 - (c.embedding <=> query_embedding))::FLOAT AS semantic_score,
      c.token_count,
      c.context_header,
      c.page_number,
      c.section_title
    FROM project_chunks c
    WHERE c.project_id = p_project_id
      AND c.embedding IS NOT NULL
      AND 1 - (c.embedding <=> query_embedding) > match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT intermediate_cap
  ),
  keyword_results AS (
    SELECT
      c.id,
      ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text))::FLOAT AS keyword_score
    FROM project_chunks c
    WHERE c.project_id = p_project_id
      AND c.fts @@ websearch_to_tsquery('english', query_text)
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
      )::FLOAT AS combined_score,
      COALESCE(s.semantic_score, 0)::FLOAT AS semantic_score,
      COALESCE(k.keyword_score, 0)::FLOAT AS keyword_score,
      COALESCE(s.token_count, k_chunk.token_count) AS token_count,
      COALESCE(s.context_header, k_chunk.context_header) AS context_header,
      COALESCE(s.page_number, k_chunk.page_number) AS page_number,
      COALESCE(s.section_title, k_chunk.section_title) AS section_title
    FROM semantic_results s
    FULL OUTER JOIN keyword_results k ON s.id = k.id
    LEFT JOIN project_chunks k_chunk ON k.id = k_chunk.id
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
    d.title AS document_title,
    d.tier
  FROM combined c
  JOIN project_documents d ON c.document_id = d.id
  ORDER BY c.combined_score DESC
  LIMIT match_count;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Storage: private bucket for project documents.
-- Path convention: {user_id}/{project_id}/{doc_id}
-- 25MB per-file cap (page cap enforced application-side).
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents',
  false,
  26214400, -- 25MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    'application/rtf',
    'text/rtf',
    'application/epub+zip',
    'text/html',
    'text/plain',
    'text/csv',
    'text/markdown',
    'text/x-markdown',
    'application/json'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Owner-only access keyed on the first path segment (mirrors conversation-files).
CREATE POLICY "Users can upload own project documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-documents' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can view own project documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-documents' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can delete own project documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-documents' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );
