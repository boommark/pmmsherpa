---
phase: 01-usage-gating-backend
plan: 01
subsystem: database
tags: [supabase, postgres, migration, rpc, typescript, usage-gating, monthly-quota]

# Dependency graph
requires:
  - phase: none
    provides: first plan of milestone v1.1
provides:
  - profiles.tier column (text, default 'free', values 'free'|'founder'|'starter')
  - profiles.messages_used_this_period column (int, default 0)
  - profiles.period_start column (date, default first of current calendar month UTC)
  - Founder backfill (abhishekratna@gmail.com, aratnaai@gmail.com → tier='founder')
  - increment_messages_used(uuid) atomic, race-safe RPC with SECURITY DEFINER + founder exclusion
  - Profile TypeScript interface extended with tier, messages_used_this_period, period_start
  - idx_profiles_period_start index
affects: [01-02-PLAN chat gate, Phase 2 usage UI, Phase 4 Stripe billing tier upgrade]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Postgres atomic RPC via CREATE OR REPLACE FUNCTION with SECURITY DEFINER + SET search_path = public"
    - "Use RPC for concurrent counter increments instead of JS-side read-modify-write (race-safe)"
    - "Tier-aware predicate inside the UPDATE (WHERE tier != 'founder') so founders never burn quota"

key-files:
  created:
    - supabase/migrations/016_usage_gating.sql
  modified:
    - src/types/database.ts

key-decisions:
  - "Founder backfill uses aratnaai@gmail.com (user switched from abhishekratna1@gmail.com)"
  - "pmmsherpatest@gmail.com NOT exempt — test account pays like everyone else for cleaner data"
  - "Atomic increment via Postgres RPC (not JS update) to avoid lost-write race on concurrent chat requests"
  - "tier union includes 'starter' now even though Phase 1 only uses 'free'|'founder' — leaves room for Phase 4 without another type migration"
  - "period_start typed as string (ISO date) in TS — Supabase returns Postgres date columns as YYYY-MM-DD strings, not JS Date"

patterns-established:
  - "Migration style: sequential integer prefix (016_), no BEGIN/COMMIT wrapper, no down-migration, IF NOT EXISTS on ADD COLUMN/CREATE INDEX, CREATE OR REPLACE FUNCTION for idempotent RPC"
  - "Hot-path RPCs declared SECURITY DEFINER with explicit SET search_path = public"
  - "EXECUTE grants to the 'authenticated' role so the session/anon client can invoke the function"

requirements-completed: [GATE-01, GATE-03, GATE-04]

# Metrics
duration: ~15 min
completed: 2026-04-16
---

# Phase 01 Plan 01: Usage Gating Backend (Schema + RPC + Types) Summary

**profiles table extended with tier/messages_used_this_period/period_start + atomic increment_messages_used RPC applied to Flytr; founder tier backfilled to 2 accounts; Profile TS interface extended.**

## Performance

- **Duration:** ~15 min (excluding human-verify checkpoint wait)
- **Started:** 2026-04-16T04:36:20Z (approx — plan start)
- **Completed:** 2026-04-16T04:42:34Z
- **Tasks:** 3/3 (1 auto, 1 checkpoint:human-verify, 1 auto)
- **Files modified:** 2

## Accomplishments

- Migration `supabase/migrations/016_usage_gating.sql` written and applied live to Flytr (`ogbjdvnkejkqqebyetqx`) via Supabase SQL editor / MCP.
- `profiles` table now has `tier` (text, default 'free'), `messages_used_this_period` (int, default 0), `period_start` (date, default first of month UTC). Existing 203 users auto-defaulted to `tier='free'` via column DEFAULT.
- Founder backfill applied: `abhishekratna@gmail.com` and `aratnaai@gmail.com` → `tier='founder'`. Legacy `abhishekratna1@gmail.com` intentionally NOT exempt (stays `tier='free'`). Test account `pmmsherpatest@gmail.com` also `tier='free'`.
- `increment_messages_used(p_user_id uuid)` RPC created with `SECURITY DEFINER`, `SET search_path = public`, and founder-skip predicate (`WHERE id = p_user_id AND tier != 'founder'`). Race-safe for concurrent `/api/chat` requests.
- `EXECUTE` on the RPC granted to `authenticated` role so the session client in the chat route can call it.
- `idx_profiles_period_start` index created for hot-path UPDATE scans.
- `Profile` TypeScript interface in `src/types/database.ts` extended with the three new fields — `tier: 'free' | 'founder' | 'starter'`, `messages_used_this_period: number`, `period_start: string`. `npx tsc --noEmit` passes with zero errors.
- Feature branch `feature/phase-01-usage-gating` created off `staging`, 2 commits landed, NOT yet pushed (Plan 02 continues on same branch per staging-first workflow).

## Task Commits

Each task was committed atomically on `feature/phase-01-usage-gating`:

1. **Task 1: Create branch + write migration 016 SQL** — `fb26cc0` (feat)
2. **Task 2: User applies migration 016 to Flytr + 9 SQL verifications** — no commit (human-verify checkpoint; DB-only change)
3. **Task 3: Extend Profile TypeScript interface** — `f66d8e6` (feat)

**Plan metadata commit:** Pending (final summary + state commit below).

## Files Created/Modified

- `supabase/migrations/016_usage_gating.sql` (**created**) — 3x `ALTER TABLE ADD COLUMN IF NOT EXISTS`, 1x `UPDATE profiles SET tier='founder'` founder backfill, 1x `CREATE INDEX IF NOT EXISTS idx_profiles_period_start`, 1x `CREATE OR REPLACE FUNCTION increment_messages_used(uuid)` with SECURITY DEFINER, 1x `GRANT EXECUTE ... TO authenticated`.
- `src/types/database.ts` (**modified**) — Profile interface gains `tier: 'free' | 'founder' | 'starter'`, `messages_used_this_period: number`, `period_start: string` (ISO date) with `// Usage gating — Phase 1 (v1.1)` comment. `Database` type at line 148+ automatically inherits via the `Row: Profile` mapping — no manual edit needed there.

## DB Verification Results (Task 2, user-run against Flytr)

All 9 SQL checks passed:

1. **Columns present** — `information_schema.columns` returned 3 rows:
   - `tier` text, NOT NULL, default `'free'`
   - `messages_used_this_period` integer, NOT NULL, default `0`
   - `period_start` date, NOT NULL, default `(date_trunc('month', now()))::date`
2. **Founder backfill** — `abhishekratna@gmail.com → founder`, `aratnaai@gmail.com → founder`
3. **Legacy email NOT founder** — `abhishekratna1@gmail.com → free` (intentionally excluded)
4. **Test account NOT founder** — `pmmsherpatest@gmail.com → free` (intentionally excluded)
5. **Counts** — 2 founders + 203 free = 205 total profiles (STATE.md had noted ~155; actual count is higher)
6. **RPC exists** — `increment_messages_used(p_user_id uuid)` present in `public` schema
7. **EXECUTE grant** — `authenticated` role has EXECUTE on `increment_messages_used`
8. **RPC smoke test** — On free user `002899bc-b59e-40d3-be0c-53c562ecc7b8`: 0 → 1 → 2 after two calls, then reset to 0
9. **Founder exclusion verified** — Calling `increment_messages_used` on both founder ids kept their counters at 0 (the `WHERE tier != 'founder'` predicate works end-to-end)

## Profile Interface Diff

```diff
 export interface Profile {
   id: string;
   email: string;
   full_name: string | null;
   avatar_url: string | null;
   preferred_model: 'claude' | 'gemini' | 'openai';
   theme: 'light' | 'dark' | 'system';
   voice_preference: TTSVoice;
   elevenlabs_voice_id: ElevenLabsVoiceId | null;
+  // Usage gating — Phase 1 (v1.1)
+  tier: 'free' | 'founder' | 'starter';
+  messages_used_this_period: number;
+  period_start: string;  // ISO date string from Postgres `date` column, e.g. "2026-04-01"
   created_at: string;
   updated_at: string;
 }
```

`npx tsc --noEmit` exits clean (no errors on any file).

## Branch State

- Current branch: `feature/phase-01-usage-gating`
- Based on: `staging` (pulled fresh before branching)
- Commits ahead of staging: 2 (`fb26cc0`, `f66d8e6`) plus the upcoming plan-metadata commit
- Pushed to remote: **NO** — per plan execution context, Plan 02 continues on the same branch and the merge to `staging` happens only after Plan 02 acceptance tests pass.
- Also contains: `.planning/` directory files pulled from `main` so the planning/state tracking can continue on this branch.

## Decisions Made

- **Founder list is authoritative via `tier='founder'`, not an in-code email array.** Supersedes the hardcoded `EXEMPT_EMAILS` at `src/app/api/chat/route.ts:108-114` (Plan 02 will remove the array).
- **`aratnaai@gmail.com` replaces `abhishekratna1@gmail.com`** in the founder list. Note: REQUIREMENTS.md GATE-03 still reads the old email pair — Plan 02 will update that doc as part of its scope.
- **Atomic RPC over JS-side increment.** A naive `supabase.from('profiles').update({ messages_used_this_period: x + 1 })` from Next.js would be subject to lost-write races on concurrent sends; the Postgres UPDATE inside the RPC serializes via the row lock.
- **Founder-skip inside the RPC, not outside.** `WHERE tier != 'founder'` inside the function keeps `/api/chat` route logic simple (it can blindly call the RPC after every LLM success) and guarantees founders never burn quota even if a caller forgets to branch.
- **`period_start: string`, not `Date`.** Supabase returns Postgres `date` columns as `"YYYY-MM-DD"` strings — typing as `Date` would lie about the wire format.

## Deviations from Plan

None — plan executed exactly as written.

All three tasks' acceptance criteria passed on the first run. No auto-fixes applied. No architectural decisions needed.

---

**Total deviations:** 0
**Impact on plan:** Clean execution.

## Issues Encountered

- **STATE.md uncommitted change blocked `git checkout staging`** at the very start. The GSD init step had already written an updated frontmatter to `.planning/STATE.md` on the working tree. Resolved by stashing, switching to staging, branching, then `git checkout main -- .planning/` to bring the phase planning files onto the feature branch. Noted for future: GSD init touching STATE.md before `git checkout` is a small friction point when the active branch differs from where planning lives.

- **User count mismatch** between STATE.md ("155 users") and actual DB (205 profiles). Not a blocker — the migration's `NOT NULL DEFAULT 'free'` correctly backfills all existing rows regardless of count. STATE.md's 155 figure is stale. Noted for updating STATE.md in the final state-update step.

## User Setup Required

None. The migration was applied manually via Supabase SQL editor during the Task 2 human-verify checkpoint and is live on Flytr. No environment variables, dashboard config, or external-service setup is needed for Plan 01.

## Next Phase Readiness / Handoff to Plan 02

**Ready for Plan 02 (chat API monthly gate):**

- `profiles.tier`, `profiles.messages_used_this_period`, `profiles.period_start` exist in live Flytr DB with correct defaults.
- `increment_messages_used(p_user_id uuid)` exists, is EXECUTE-granted to `authenticated`, and was smoke-tested against a real user id (0 → 1 → 2, reset to 0).
- `Profile` TS interface sees the new shape — no `(supabase as any)` cast needed for the new fields.
- Feature branch `feature/phase-01-usage-gating` is the working branch; DO NOT merge to staging yet.

**Handoff note for Plan 02 author:**

> Use `supabase.rpc('increment_messages_used', { p_user_id: user.id })` for the post-LLM counter bump in `src/app/api/chat/route.ts`. It is atomic, race-safe, and founder-aware (`tier='founder'` users are skipped by the function's `WHERE` clause — no JS-side branching needed). Do NOT use a JS-side `messages_used_this_period + 1` write — that would be non-atomic and lose concurrent writes under even modest load.
>
> For the pre-LLM gate, a direct `.select('tier, messages_used_this_period, period_start').eq('id', user.id).single()` is fine (reads don't race). Apply the lazy monthly reset in a `CASE`-based atomic UPDATE inline with the gate check per the pattern in `01-CONTEXT.md §Counter strategy`.
>
> Also as part of Plan 02: update `REQUIREMENTS.md` GATE-03 to replace `abhishekratna1@gmail.com` with `aratnaai@gmail.com` (the roadmap still carries the old email).

## Self-Check: PASSED

File existence verification:

- `supabase/migrations/016_usage_gating.sql` → FOUND
- `src/types/database.ts` → FOUND (modified, contains the 3 new Profile fields)

Commit existence verification:

- `fb26cc0` (Task 1 migration commit) → FOUND on `feature/phase-01-usage-gating`
- `f66d8e6` (Task 3 Profile interface commit) → FOUND on `feature/phase-01-usage-gating`

DB-level verification: all 9 SQL checks passed in live Flytr (documented under "DB Verification Results" above, run by user via Supabase MCP).

---
*Phase: 01-usage-gating-backend*
*Plan: 01*
*Completed: 2026-04-16*
