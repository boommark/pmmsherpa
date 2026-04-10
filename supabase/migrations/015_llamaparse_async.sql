-- Async LlamaParse: track the parse job id so the chat route can finish
-- retrieval later if the upload function returns before the parse is done.
--
-- Flow:
--   1. /api/upload kicks off a LlamaParse v2 job, saves llamaparse_job_id
--      with processing_status='processing', and returns immediately.
--   2. /api/chat, on first send after the upload, polls the job briefly
--      and writes extracted_text back, flipping status to 'completed'.
--   3. Subsequent messages reuse the persisted extracted_text — no re-poll.

ALTER TABLE conversation_attachments
  ADD COLUMN IF NOT EXISTS llamaparse_job_id TEXT;

CREATE INDEX IF NOT EXISTS idx_attachments_llamaparse_job
  ON conversation_attachments(llamaparse_job_id)
  WHERE llamaparse_job_id IS NOT NULL;
