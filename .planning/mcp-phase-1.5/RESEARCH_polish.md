# Phase 1.5 Polish — Research Brief

Branch: `feature/mcp-phase-1.5`. Research only; no code changes made.

---

## 1. Raise `match_threshold` for cleaner empty-result UX in MCP `search_corpus`

**Where the threshold lives.** Two layers, both at 0.4:

- TS default: `src/lib/rag/retrieval.ts:18` (`matchThreshold = 0.4` on `retrieveContext`). The value is passed to the RPC at line 34.
- SQL default: `supabase/migrations/002_search_functions.sql:100` and re-declared in `004_add_speaker_role_to_search.sql:106` (`match_threshold FLOAT DEFAULT 0.4`).

The TS arg always wins because callers always pass `match_threshold` explicitly through the RPC. The SQL default only matters if a caller omits it.

**Keyword fallback path.** Inside `hybrid_search` (migration 004, lines 150–157) the keyword CTE uses `c.fts_vector @@ websearch_to_tsquery('english', search_query)` with no threshold. So even when semantic similarity is below 0.4 (cold), any chunk whose FTS matches a token returns a positive `keyword_score` and survives the FULL OUTER JOIN. With `semantic_weight = 0.7`, a pure keyword hit produces `combined_score = 0.3 * ts_rank_cd`, which on long chunks lands around 0.02–0.10 — low but non-zero, so MCP still returns "noise" rows. This is the root cause of gibberish-but-tokenizes queries returning hits.

**Recommended threshold.** Use `0.55` for the MCP path. Reasoning: `text-embedding-3-small` cosine similarity for clearly relevant PMM chunks typically lands 0.55–0.75; off-topic English text drifts to 0.30–0.45; gibberish lands below 0.30. 0.55 cleanly cuts the off-topic tier while keeping real hits. Crucially, MCP also needs a **floor on `combined_score`** post-keyword-merge — recommend filtering returned rows where `combined_score < 0.25` in `searchCorpusTool` (TS-side, after `retrieveContext`) so pure keyword-only hits don't leak through. Don't lower the keyword influence globally; it matters for the chat path.

**Scope.** MCP-only. `/api/chat` already has the LLM as a noise filter and benefits from the looser recall. Do not change SQL defaults — keep the chat path at 0.4.

**Recommended fix.** (a) Add an optional `matchThreshold` plumbed override (already exists in the interface at `retrieval.ts:11`) — `searchCorpusTool` in `src/lib/mcp/tools.ts:147` should pass `matchThreshold: 0.55`. (b) Add a post-RPC filter in the same handler dropping chunks where `similarity < 0.25` before the `chunks.length === 0` check at `tools.ts:157`. No SQL migration required. Splitting into a separate `retrieveStrict` is overkill — the param already exists, just expose it.

---

## 2. `hybrid_search` Postgres `statement_timeout`

**Current value.** No `statement_timeout` is set anywhere in the repo (`grep statement_timeout` across `src/`, `supabase/migrations/` returns no matches). The function uses the Supabase default for the role making the RPC call. Supabase default for the `authenticated` role is **8 seconds**, and for service-role calls it's typically the database-wide default (often 60s but project-dependent). MCP uses `createServiceClient()` (`retrieval.ts:20`) so it inherits the service-role timeout.

**Why the query is slow.** Looking at `hybrid_search` (migration 004, lines 132–199):

1. Semantic CTE uses HNSW (`idx_chunks_embedding`, migration 001 line 118) — fast, sub-100ms.
2. Keyword CTE uses GIN on `fts_vector` (`idx_chunks_fts`, line 125) — fast for selective queries, but `websearch_to_tsquery` on common stop-word-heavy queries can match millions of rows, then `ts_rank_cd` runs on every match before `LIMIT match_count * 2`. On a 38K-chunk table this is borderline; on long or vague queries it dominates.
3. The `LEFT JOIN chunks k_chunk ON k.id = k_chunk.id` re-fetches chunk content for keyword-only hits — extra heap fetch but indexed.
4. Final `JOIN documents d ON c.document_id = d.id` is fine (`idx_chunks_document_id` exists).

The killer is the keyword path on long expanded queries from `expandQuery()` (`retrieval.ts:25`) — the `tsquery` rewrites multi-word queries into broad disjunctions that scan large slices of the GIN index.

**Recommended fix.** Two-layer:

(a) **Raise the function-level timeout** by adding `SET statement_timeout = '15s'` to the `hybrid_search` function definition (Postgres function-attached GUC — applies only to that function, no global change). New migration, e.g. `021_hybrid_search_timeout.sql`, recreates `hybrid_search` with `SET statement_timeout = '15s'` between `LANGUAGE plpgsql` and `AS $$`. 15s is generous — typical p95 is 1–2s; this only helps the long tail.

(b) **Tighten the query**: cap `match_count * 2` at a constant ceiling (e.g. `LEAST(match_count * 2, 40)`) in both CTEs to prevent runaway intermediate result sets when callers pass large `topK`. Also consider trimming `expandQuery` output — currently it can balloon the tsquery. Out of scope for this polish item but worth noting.

Don't use `ALTER ROLE` (too broad) or per-query `SET LOCAL` from TS (extra round-trip). Function-level `SET` is the cleanest.

---

## 3. Stray `src/lib/artifacts/index 2.ts` and other iCloud dups

**State.** The `src/lib/artifacts/` directory contains **only** iCloud duplicate files — no canonical files exist. Contents:

- `src/lib/artifacts/index 2.ts` (3.8K) — references `./renderer` (missing) and `./prompts/index` (missing).
- `src/lib/artifacts/renderer 2.ts`
- `src/lib/artifacts/gate 2.ts`
- `src/lib/artifacts/prompts 2/` (directory)

`git ls-files src/lib/artifacts/` returns empty — none of these are tracked. Git history shows commit `90c21b5 Revert "Add artifact export feature (Phases 1-4)"` removed the canonical files; iCloud kept the old copies under " 2" names. Nothing in `src/` imports `@/lib/artifacts/*` (verified via grep — only matches are unrelated word "artifacts" in `system-prompt.ts` and a `guides/page.tsx` reference). The whole directory is dead weight.

**Other iCloud dups in repo** (untracked but present on disk, all matching `* 2.*`):

- `supabase/migrations/019_referral_system 2.sql` — the only " 2" file inside a tracked directory that could realistically be picked up by Supabase CLI on `supabase db push`. Risky.
- `marp-templates/` — 30+ " 2.html"/" 2.md"/" 2.css" files (the reverted artifact templates).
- `public/email/guides 2.png`, `public/email/chat-home 2.png`.

`.gitignore` already has the right pattern at lines 77–81 (`* 2.*`, `* 3.*`, `*\ 2`, `*\ 3`), so none are tracked. The pattern is sound — no tightening needed.

**Recommended fix.** Delete the dups from disk (not `git rm` since they're not tracked — plain `rm`). Suggested one-liner scope: remove the entire `src/lib/artifacts/` directory (zero canonical content, zero imports), the stray `supabase/migrations/019_referral_system 2.sql` (dangerous near `supabase db push`), and optionally the `marp-templates/* 2.*` and `public/email/* 2.png` files for hygiene. `.gitignore` is already correct — leave it. Prevention follow-up (out of scope): consider moving the repo out of iCloud Drive; the gitignore pattern hides the dups from git but doesn't stop iCloud from regenerating them.

---

**Word count: ~600.**
