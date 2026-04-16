---
phase: 01-usage-gating-backend
verified: 2026-04-16T00:00:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
gaps: []
human_verification: []
---

# Phase 01: Usage Gating Backend Verification Report

**Phase Goal:** Track message usage per user per month and enforce limits in the chat API.
**Verified:** 2026-04-16
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | New `tier` and `messages_used_this_period` columns exist on the profiles table | VERIFIED | `supabase/migrations/016_usage_gating.sql` contains `ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free'` and `ADD COLUMN IF NOT EXISTS messages_used_this_period int NOT NULL DEFAULT 0`. Migration applied to live Flytr DB; 9 SQL checks confirmed by user in Plan 01-01 Task 2. `period_start` column also present. |
| 2 | POST /api/chat increments the usage counter and returns 429 when the monthly limit is exceeded | VERIFIED | `src/app/api/chat/route.ts` lines 108-193 implement pre-LLM gate returning HTTP 429 with `message_limit_exceeded` before SSE opens. Lines 698-721 call `(supabase.rpc as any)('increment_messages_used', { p_user_id: user.id })` post-LLM. Both paths confirmed in staging smoke tests (Tests 1 + 2). |
| 3 | Founder accounts (abhishekratna@gmail.com, aratnaai@gmail.com) can send unlimited messages with no 429 | VERIFIED | Migration 016 backfills both accounts to `tier='founder'`. Gate check at route.ts line 170: `if (tier !== 'founder' && messagesUsed >= FREE_TIER_MONTHLY_LIMIT)` — founders always pass. RPC's `WHERE tier != 'founder'` ensures counter never increments for founders. Confirmed: staging Test 3 (founder at 9999 → HTTP 200, counter stays 9999). |
| 4 | Usage counter resets automatically when period_start is in a previous calendar month | VERIFIED | route.ts lines 125-136: lazy reset UPDATE sets `period_start = currentMonthStartIso` and `messages_used_this_period = 0` when `period_start < current month`. Confirmed: staging Test 4 (period_start='2026-03-01' + count=10 → HTTP 200 + period_start='2026-04-01' + count=1). |
| 5 | Free tier users are blocked after 10 messages with a clear machine-readable error response | VERIFIED | `FREE_TIER_MONTHLY_LIMIT = 10` in `src/lib/constants.ts`. 429 JSON body contains all 5 locked fields: `error`, `limit`, `reset_at`, `message`, `upgrade_url`. Confirmed: staging Tests 2 + 5 (HTTP 429 + `jq 'keys'` returns all 5 keys). |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/016_usage_gating.sql` | Schema migration: tier/messages_used_this_period/period_start columns + founder backfill + index + increment_messages_used RPC + GRANT | VERIFIED | File exists. Contains all 3 `ADD COLUMN IF NOT EXISTS` statements, `UPDATE profiles SET tier='founder'` for the two founder emails, `CREATE INDEX IF NOT EXISTS idx_profiles_period_start`, `CREATE OR REPLACE FUNCTION increment_messages_used(p_user_id uuid)` with `SECURITY DEFINER` + `SET search_path = public`, `GRANT EXECUTE ... TO authenticated`. No `BEGIN`/`COMMIT` wrappers. Applied to live Flytr DB. |
| `src/types/database.ts` | Profile interface extended with tier, messages_used_this_period, period_start | VERIFIED | Lines 22-25: `tier: 'free' \| 'founder' \| 'starter'`, `messages_used_this_period: number`, `period_start: string` with `// Usage gating — Phase 1 (v1.1)` comment. All original fields preserved. Database type at line 155 inherits via `Row: Profile` mapping. |
| `src/lib/constants.ts` | FREE_TIER_MONTHLY_LIMIT = 10 constant and UserTier type | VERIFIED | Lines 30-33: `export const FREE_TIER_MONTHLY_LIMIT = 10`, `export type UserTier = 'free' \| 'founder' \| 'starter'`. All existing exports (SUPER_ADMIN_EMAIL, USE_CASES, UseCase, isSuperAdmin) untouched. |
| `src/app/api/chat/route.ts` | Monthly quota gate + post-LLM counter increment; legacy daily limit removed | VERIFIED | Import `FREE_TIER_MONTHLY_LIMIT` at line 4. Pre-LLM gate at lines 108-193: lazy reset UPDATE, fallback SELECT, JS gate check, HTTP 429 JSON with all 5 locked fields. Post-LLM RPC at lines 698-721: `(supabase.rpc as any)('increment_messages_used', { p_user_id: user.id })`. `EXEMPT_EMAILS`, `DAILY_MESSAGE_LIMIT`, `daily limit of 30 messages`, and `abhishekratna1@gmail.com` all absent. |
| `.planning/REQUIREMENTS.md` | GATE-03 reads aratnaai@gmail.com | VERIFIED | Line 12: `**GATE-03**: Founder accounts (abhishekratna@gmail.com, aratnaai@gmail.com) bypass all limits`. `abhishekratna1@gmail.com` absent from entire file. All other GATE requirements (01, 02, 04, 05) present. |
| `.planning/ROADMAP.md` | Phase 1 Success Criterion 3 reads aratnaai@gmail.com | VERIFIED | Line 25: `Founder accounts (abhishekratna@gmail.com, aratnaai@gmail.com) can send unlimited messages with no 429`. `abhishekratna1@gmail.com` absent from entire file. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `supabase/migrations/016_usage_gating.sql` | profiles table (live Supabase) | Applied via Supabase SQL editor | WIRED | 9 SQL verification checks passed by user: 3 columns confirmed in `information_schema.columns`, 2 founder rows confirmed, `increment_messages_used` function confirmed in `pg_proc`, EXECUTE grant confirmed in `routine_privileges`, RPC smoke test confirmed counter increment. |
| `supabase/migrations/016_usage_gating.sql` | `increment_messages_used(uuid)` function | `CREATE OR REPLACE FUNCTION` + `GRANT EXECUTE` | WIRED | Function present in file and confirmed live in DB. `SECURITY DEFINER`, `SET search_path = public`, `WHERE id = p_user_id AND tier != 'founder'` predicate. `authenticated` role has EXECUTE. |
| `src/app/api/chat/route.ts` | profiles table (pre-LLM gate) | `supabase.from('profiles').update(...).lt('period_start', ...).select(...)` + fallback `.select(...).single()` | WIRED | Lines 128-166 perform lazy reset UPDATE then fallback SELECT. Both paths assign `tier` and `messagesUsed` consumed by gate check at line 170. |
| `src/app/api/chat/route.ts` | `increment_messages_used(uuid)` RPC | `(supabase.rpc as any)('increment_messages_used', { p_user_id: user.id })` | WIRED | Line 715-718: call is inside the SSE stream's `try` block, after `usage_logs.insert` — meaning it fires only after successful LLM response. `as any` cast documented as intentional (generated Supabase types don't include custom functions). |
| `src/lib/constants.ts` | `src/app/api/chat/route.ts` | `import { FREE_TIER_MONTHLY_LIMIT } from '@/lib/constants'` | WIRED | Line 4 of route.ts. `FREE_TIER_MONTHLY_LIMIT` consumed at line 170 (gate check) and line 181 (429 response body). |
| `src/types/database.ts` | `src/app/api/chat/route.ts` | TypeScript inference; `as any` casts on Supabase calls | WIRED | Profile interface extended. Route reads `tier` and `messages_used_this_period` from `gateRow` and `profileRow` without TypeScript errors on the new fields. |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| GATE-01 | 01-01-PLAN, 01-02-PLAN | System tracks messages per user per calendar month | SATISFIED | `messages_used_this_period` column in DB + `increment_messages_used` RPC + post-LLM call in route.ts. Staging Test 1: counter 5→6. |
| GATE-02 | 01-02-PLAN | Free tier users are limited to 10 messages per month | SATISFIED | Pre-LLM gate at route.ts line 170; `FREE_TIER_MONTHLY_LIMIT = 10`. Staging Test 2: HTTP 429 at limit. |
| GATE-03 | 01-01-PLAN, 01-02-PLAN | Founder accounts bypass all limits | SATISFIED | tier='founder' DB backfill in migration 016; `tier !== 'founder'` gate check; RPC's `WHERE tier != 'founder'` predicate. Staging Test 3: founder at 9999 → HTTP 200, counter unchanged. REQUIREMENTS.md and ROADMAP.md corrected to aratnaai@gmail.com. |
| GATE-04 | 01-01-PLAN, 01-02-PLAN | Message counter resets on the 1st of each calendar month | SATISFIED | `period_start` column + lazy reset UPDATE in pre-LLM gate. Staging Test 4: prior-month period_start triggers reset to current month first, counter ends at 1. |
| GATE-05 | 01-02-PLAN | System blocks message submission when monthly limit is reached | SATISFIED | HTTP 429 returned before SSE stream opens; JSON body has `error`, `limit`, `reset_at`, `message`, `upgrade_url`. Staging Test 5: `jq 'keys'` returns all 5. |

All 5 Phase 1 requirements (GATE-01 through GATE-05) are satisfied. No orphaned requirements — all 5 were claimed by plans 01-01 and 01-02, and all are confirmed in REQUIREMENTS.md as `[x]`.

---

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| None | — | — | — |

Scanned `src/app/api/chat/route.ts`, `src/lib/constants.ts`, `src/types/database.ts`, `supabase/migrations/016_usage_gating.sql`. No TODO/FIXME/PLACEHOLDER comments, no empty implementations, no return null/return {}/return [] stubs found in phase-modified code. The `(supabase.rpc as any)` cast is intentional and documented in both the code comment and SUMMARY; it is not an anti-pattern here.

---

### Human Verification Required

None. All 5 success criteria were verified by live HTTP smoke tests on staging.pmmsherpa.com and SQL verification queries against the live Flytr Supabase project. Results documented in `01-02-SUMMARY.md` under "Staging Verification (Task 4 — APPROVED)".

The following were human-verified during execution (not needing re-verification now):
- DB columns present with correct types and defaults (SQL check)
- 2 founder rows with `tier='founder'`, all others `tier='free'` (SQL check)
- `increment_messages_used` function callable by `authenticated` role (SQL + RPC smoke test)
- HTTP 429 body shape, HTTP 200 + SSE for founders, lazy reset behavior (live curl tests on staging)

---

### Gaps Summary

No gaps. All 5 phase success criteria are verified at all three levels (exists, substantive, wired). The feature branch was merged through staging to main; production deploy confirmed at commit `163a20d`. The phase is complete and live on pmmsherpa.com.

---

_Verified: 2026-04-16_
_Verifier: Claude (gsd-verifier)_
