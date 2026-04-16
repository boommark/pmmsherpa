---
phase: 1
slug: usage-gating-backend
status: draft
nyquist_compliant: true
nyquist_applicable: false
nyquist_applicable_reason: "No automated test framework exists in this project (package.json has no test script; no Jest/Vitest/Playwright installed). Validation is manual-by-design against staging: SQL verification queries in Supabase SQL editor + curl smoke tests against staging.pmmsherpa.com. A human-verify checkpoint in Plan 01 Task 2 and a 5-test smoke suite in Plan 02 Task 4 substitute for automated sampling."
wave_0_complete: true
wave_0_complete_reason: "No Wave 0 test-scaffold artifacts are required. Per-task automated verify blocks use file-content assertions (grep -qF) and tsc/npm build checks that run in under 60 seconds without any test framework install. Manual smoke tests are explicitly captured in Plan 02 Task 4's how-to-verify section with runnable curl + SQL commands."
created: 2026-04-15
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed (no Jest/Vitest/Playwright; `package.json` has no `test` script) |
| **Config file** | none |
| **Quick run command** | N/A — use SQL verification queries and curl smoke tests |
| **Full suite command** | N/A — run the 5-criterion curl + SQL suite (see Per-Task Verification Map) |
| **Estimated runtime** | ~60 seconds for full manual curl + SQL suite |

---

## Sampling Rate

- **After every task commit:** Run the per-task `<automated>` verify block from the PLAN.md (file-content `grep -qF` + `tsc --noEmit` + `npm run build`) — all complete in under 60 seconds without any test framework.
- **After every plan wave:** Run the full curl + SQL suite against `https://staging.pmmsherpa.com` (Plan 02 Task 4 human-verify checkpoint).
- **Before `/gsd:verify-work`:** All 5 success criteria must be green on staging.
- **Max feedback latency:** ~60 seconds (manual curl + SQL query turnaround).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | GATE-01 | DB schema query (via Plan 01 Task 2 human-verify) | `SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('tier', 'messages_used_this_period', 'period_start');` — expect 3 rows | Inline in plan | ⬜ pending |
| 1-01-02 | 01 | 1 | GATE-03 | DB data query (via Plan 01 Task 2 human-verify) | `SELECT email, tier FROM profiles p JOIN auth.users u ON p.id = u.id WHERE u.email IN ('abhishekratna@gmail.com', 'aratnaai@gmail.com');` — expect 2 rows with `tier = 'founder'` | Inline in plan | ⬜ pending |
| 1-01-03 | 01 | 1 | GATE-01 | RPC presence (via Plan 01 Task 2 human-verify) | `SELECT proname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'increment_messages_used';` — expect 1 row | Inline in plan | ⬜ pending |
| 1-02-01 | 02 | 2 | GATE-01 | Staging curl + DB query | Send 1 chat to staging; then `SELECT messages_used_this_period FROM profiles WHERE id = '<test_user_id>'` — expect incremented by 1 (atomic via RPC) | Inline in plan | ⬜ pending |
| 1-02-02 | 02 | 2 | GATE-02, GATE-05 | Staging curl smoke test | Set `messages_used_this_period = 10` via SQL; send chat; assert HTTP 429 with body `{"error":"message_limit_exceeded","limit":10,...}` | Inline in plan | ⬜ pending |
| 1-02-03 | 02 | 2 | GATE-03 | Staging curl smoke test | Set `messages_used_this_period = 10` for `abhishekratna@gmail.com`; send chat as that user; assert HTTP 200 (SSE stream); counter stays at 10 (RPC's founder exclusion) | Inline in plan | ⬜ pending |
| 1-02-04 | 02 | 2 | GATE-04 | DB manipulation + curl | Set `period_start = '2026-03-01', messages_used_this_period = 10`; send chat; assert HTTP 200; verify `period_start = '2026-04-01'` and `messages_used_this_period = 1` after | Inline in plan | ⬜ pending |
| 1-02-05 | 02 | 2 | GATE-05 | Staging curl smoke test | Confirm 429 body contains all 5 required fields: `error`, `limit`, `reset_at`, `message`, `upgrade_url` | Inline in plan | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Task IDs are projected; actual IDs assigned by gsd-planner during plan generation.*

---

## Wave 0 Requirements

**None.** This phase intentionally ships without automated test scaffolds. Per-task `<automated>` verify blocks in the PLAN.md files cover file-content assertions and build-level checks (grep -qF + tsc + npm run build); manual smoke tests are captured inline in Plan 02 Task 4's how-to-verify section with runnable curl + SQL commands.

Optional scripts (NOT required for sign-off) that could be added later as hygiene:

- `scripts/verify-phase-01-migration.sql` — SQL verification queries for schema + founder backfill + RPC presence
- `scripts/smoke-phase-01-gating.sh` — curl smoke test harness for staging (5-test suite), reads `STAGING_SESSION_COOKIE` and `TEST_USER_UUID` from env

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Staging smoke tests | GATE-01, GATE-02, GATE-03, GATE-04, GATE-05 | No test framework installed; gate behavior requires a real authenticated session against a deployed Next.js 16 SSE handler | Log into `https://staging.pmmsherpa.com`, copy session cookie, run curl commands against `/api/chat`, inspect HTTP status + JSON body (see Plan 02 Task 4) |
| Founder backfill verification | GATE-03 | Reads from `auth.users` which requires Supabase Studio or service-role SQL — not part of any automated pipeline | Run founder SQL query in Supabase SQL editor after migration applies (Plan 01 Task 2) |
| RPC presence + atomicity | GATE-01 | The `increment_messages_used` function must be verified in Postgres system catalogs + smoke-tested roundtrip | `pg_proc` query + manual call + counter re-read (Plan 01 Task 2 step 7-9) |
| Lazy-reset behavior | GATE-04 | Requires manipulating `period_start` to a prior month to exercise the reset branch — deliberately out-of-phase DB state | SQL setup → curl → SQL inspection sequence in Supabase Studio (Plan 02 Task 4 Test 4) |

---

## Validation Sign-Off

**Nyquist applicability:** This project has no automated test framework installed (no Jest/Vitest/Playwright, no `test` script in `package.json`). Nyquist-style sampling against a running test runner is therefore not applicable. `nyquist_applicable: false` with this explicit justification. Instead, per-task automated verify blocks run `grep -qF` file-content assertions plus `tsc --noEmit` and `npm run build` — all feedback within 60 seconds, meeting the spirit of Nyquist (fast failure detection) without a test runner. End-to-end behavior is validated by the human-verify checkpoints in Plan 01 Task 2 (DB state) and Plan 02 Task 4 (5-test smoke suite against staging).

- [x] All tasks have `<automated>` verify blocks OR explicit human-verify checkpoints with runnable commands
- [x] Sampling continuity: every code-producing task has file-content + tsc/build assertions in its verify block
- [x] No Wave 0 test-scaffold gaps — none required for this phase
- [x] No watch-mode flags
- [x] Feedback latency < 60s for all automated verify blocks
- [x] `nyquist_compliant: true` (per the exemption justified above)
- [x] `nyquist_applicable: false` with `nyquist_applicable_reason` documented in frontmatter

**Approval:** approved-by-exemption (manual validation regime justified; no test framework required for this phase)
