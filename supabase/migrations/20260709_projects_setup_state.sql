-- Interactive project setup assistant: per-project setup progress.
-- Shape (version 1):
--   { "version": 1,
--     "steps": { "describe": "pending|completed|skipped",
--                "instructions": "...", "documents": "..." },
--     "dismissed": false, "completed_at": null }
-- Nullable on purpose — existing projects stay NULL and clients normalize.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS setup_state JSONB;
