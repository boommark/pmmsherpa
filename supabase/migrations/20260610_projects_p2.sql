-- Projects feature — Phase 2 (project-aware chat).
--
-- Purely ADDITIVE: one nullable column + one index on conversations.
-- The DB is shared between staging and prod — no existing tables/functions
-- are modified beyond this nullable column.
--
-- conversations.project_id links a conversation to a project. When set, the
-- chat route loads project context (instructions, pinned docs, synopses,
-- project RAG) on every turn. ON DELETE SET NULL: deleting a project keeps
-- its conversations, they just revert to plain (non-project) chats.

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_id)
  WHERE project_id IS NOT NULL;
