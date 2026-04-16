---
phase: 01-usage-gating-backend
plan: 02
subsystem: api
tags: [chat-api, usage-gating, rate-limiting, monthly-quota, typescript, supabase-rpc]

# Dependency graph
requires:
  - phase: 01-01
    provides: profiles.tier + messages_used_this_period + period_start columns, increment_messages_used RPC
provides:
  - Monthly usage gate in POST /api/chat (pre-LLM 429 + post-LLM atomic increment)
  - FREE_TIER_MONTHLY_LIMIT = 10 constant + UserTier type in src/lib/constants.ts
  - Legacy daily email-allowlist rate limit fully removed
  - REQUIREMENTS.md GATE-03 corrected to aratnaai@gmail.com (both occurrences)
  - ROADMAP.md Phase 1 Success Criterion 3 corrected to aratnaai@gmail.com
affects: [Phase 2 Usage UI (reads 429 body fields), Phase 4 Stripe billing tier upgrade]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pre-LLM gate: lazy monthly reset UPDATE + SELECT then JS gate check — returns 429 before SSE stream opens"
    - "Post-LLM increment: supabase.rpc('increment_messages_used', {p_user_id}) after successful LLM response"
    - "Atomic Postgres RPC for counter bump (race-safe); non-atomic JS-side update forbidden"
    - "eslint-disable-next-line any cast on supabase.rpc because generated DB types don't include custom functions"

key-files:
  created: []
  modified:
    - src/lib/constants.ts
    - src/app/api/chat/route.ts
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md

key-decisions:
  - "Split gate into two operations: pre-LLM lazy reset + SELECT (no increment), post-LLM atomic RPC increment"
  - "Legacy EXEMPT_EMAILS in-code array replaced by DB-driven tier='founder' check — founder management via DB, not code deploys"
  - "429 returned as plain JSON before SSE stream opens — frontend can parse it synchronously, no streaming parser needed"
  - "supabase.rpc cast as any because generated types don't include increment_messages_used — acceptable, covered by smoke tests"
  - "Comment in route.ts documents the non-atomic anti-pattern without including the literal forbidden string"

# Metrics
duration: ~10 min
completed: 2026-04-16
---

# Phase 01 Plan 02: Usage Gating API Gate Summary

**Monthly quota gate wired into POST /api/chat: legacy 30/day email-allowlist replaced with DB-driven 10/month limit returning HTTP 429 JSON before SSE opens, with atomic post-LLM RPC increment and unconditional founder bypass.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-16T04:47:26Z
- **Completed:** 2026-04-16 (code tasks ~10 min; staging + prod ship by user)
- **Tasks:** 5/5 complete (Tasks 1-3 auto, Task 4 human-verify approved, Task 5 user-executed)
- **Files modified:** 4

## Accomplishments

- `src/lib/constants.ts` — appended `FREE_TIER_MONTHLY_LIMIT = 10` and `UserTier` type after the existing `isSuperAdmin` function. All existing exports untouched.
- `src/app/api/chat/route.ts`:
  - **Removed** legacy block at original lines 107–142: `DAILY_MESSAGE_LIMIT`, `EXEMPT_EMAILS` array, `usage_logs` count query, in-stream rate-limit text message (36 lines deleted).
  - **Added** `import { FREE_TIER_MONTHLY_LIMIT } from '@/lib/constants'` at top.
  - **Added** pre-LLM monthly gate (Task 2a): lazy reset UPDATE, fallback SELECT, JS gate check, returns HTTP 429 JSON with 5 locked fields before SSE stream opens.
  - **Added** post-LLM atomic RPC increment (Task 2b): `(supabase.rpc as any)('increment_messages_used', { p_user_id: user.id })` immediately after the `usage_logs.insert` block, inside the SSE stream's try block.
- `.planning/REQUIREMENTS.md` — GATE-03 description rewritten to remove `abhishekratna1@gmail.com` reference from the explanation text; footer updated.
- `.planning/ROADMAP.md` — Phase 1 Success Criterion 3 corrected: `abhishekratna1@gmail.com` → `aratnaai@gmail.com`.

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | FREE_TIER_MONTHLY_LIMIT constant + UserTier type | `1d38d90` | src/lib/constants.ts |
| 2a | Remove daily rate limit, add pre-LLM monthly gate | `2f758fb` | src/app/api/chat/route.ts |
| 2b | Atomic post-LLM increment via RPC | `bc83096` | src/app/api/chat/route.ts |
| 3 | Correct GATE-03 founder email in REQUIREMENTS + ROADMAP | `a6bdac7` | .planning/REQUIREMENTS.md, .planning/ROADMAP.md |

| 4 | Merge to staging + smoke tests | `68728f6` | git merge (no source files) |
| 5 | Merge staging to main + production ship | `163a20d` | git merge (no source files) |

## route.ts Diff Summary

### Removed (legacy daily-limit block, lines 107-142 in original file)

```typescript
// Removed entirely:
const DAILY_MESSAGE_LIMIT = 30
const EXEMPT_EMAILS = ['aratnaai@gmail.com', 'abhishekratna@gmail.com', 'abhishekratna1@gmail.com', 'pmmsherpatest@gmail.com']
// + the if (!EXEMPT_EMAILS.includes(...)) block that queried usage_logs and returned an in-stream text error
```

### Added (pre-LLM gate, Task 2a — replaces deleted block, before `const stream = new ReadableStream`)

- Computes `currentMonthStartIso` (first of current UTC month)
- Atomic lazy reset UPDATE: `.update({ period_start, messages_used_this_period: 0 }).eq('id', user.id).lt('period_start', currentMonthStartIso).select(...).maybeSingle()`
- If reset matched: reads from `gateRow`; else falls back to a separate `.select('tier, messages_used_this_period').single()`
- Gate check: `if (tier !== 'founder' && messagesUsed >= FREE_TIER_MONTHLY_LIMIT)` → returns HTTP 429 with 5-field JSON body
- Founders always pass; no increment here

### Added (post-LLM increment, Task 2b — inside SSE stream try block, after `if (usageError)` block)

```typescript
const { error: counterError } = await (supabase.rpc as any)(
  'increment_messages_used',
  { p_user_id: user.id }
)
if (counterError) {
  console.error('[UsageGate] increment_messages_used RPC failed:', counterError)
}
```

## 429 Response Shape (locked)

```json
{
  "error": "message_limit_exceeded",
  "limit": 10,
  "reset_at": "2026-05-01T00:00:00Z",
  "message": "Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month.",
  "upgrade_url": "/pricing"
}
```

Returned with `Content-Type: application/json` and `status: 429` BEFORE the SSE stream opens.

## REQUIREMENTS.md + ROADMAP.md Corrections

- **REQUIREMENTS.md GATE-03** (old): `...aratnaai replaces abhishekratna1...` — removed the `abhishekratna1` mention from the description text; footer reference also cleaned.
- **ROADMAP.md Phase 1 Criterion 3** (old): `Founder accounts (abhishekratna@gmail.com, abhishekratna1@gmail.com)...`
- **ROADMAP.md Phase 1 Criterion 3** (new): `Founder accounts (abhishekratna@gmail.com, aratnaai@gmail.com)...`

## TypeScript + Build Verification

- `npx tsc --noEmit` — zero errors on `src/lib/constants.ts` and `src/app/api/chat/route.ts`
- `npm run build` — exits 0, output: `Compiled successfully in 2.8s` + `Generating static pages (38/38)`
- The `supabase.rpc as any` cast is needed because the generated Supabase types don't include `increment_messages_used` in their function signatures. Runtime correctness confirmed by Plan 01-01's smoke tests (0→1→2 RPC calls, founder exclusion verified).

## Staging Verification (Task 4 — APPROVED)

Staging merge commit: `68728f6` (`merge: phase-01 usage gating backend`)
All 5 GATE smoke tests passed on https://staging.pmmsherpa.com:

- **Test 1 (GATE-01):** Counter incremented 5 to 6 after successful chat (HTTP 200 + SSE done)
- **Test 2 (GATE-02/05):** HTTP 429 with all 5 locked JSON fields at limit
- **Test 3 (GATE-03):** Founder at 9999 messages received HTTP 200 + SSE done; counter stayed 9999
- **Test 4 (GATE-04):** Prior-month period_start triggered lazy reset to current month; counter 0 to 1
- **Test 5 (GATE-05):** All 5 JSON keys present (`error`, `limit`, `message`, `reset_at`, `upgrade_url`)

## Production Ship (Task 5 — COMPLETE)

Production merge commit: `163a20d` (`merge: phase-01 usage gating backend -> production`)
Vercel production deploy: Ready (45s)
Obsidian shipped features log updated with "Free-tier usage gating" entry.
Live at: https://pmmsherpa.com

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `supabase.rpc` TypeScript type error on `increment_messages_used`**
- **Found during:** Task 2b typecheck
- **Issue:** `error TS2345: Argument of type '{ p_user_id: string; }' is not assignable to parameter of type 'undefined'` — generated Supabase types don't include custom functions.
- **Fix:** Added `(supabase.rpc as any)` cast with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment. Plan 01-02 anticipated this exact scenario and permitted it: "if the types are strict, add a minimal `as any` on the first arg".
- **Files modified:** `src/app/api/chat/route.ts`
- **Commit:** `bc83096`

**2. [Rule 2 - Missing] REQUIREMENTS.md had `abhishekratna1@gmail.com` in two places**
- **Found during:** Task 3 (grep check revealed old email in both the GATE-03 description text and the footer `*Last updated*` line)
- **Fix:** Cleaned both occurrences — rewrote the GATE-03 description to remove the "replaces" reference, updated footer to reflect Plan 01-02 completion.
- **Files modified:** `.planning/REQUIREMENTS.md`
- **Commit:** `a6bdac7`

## Handoff Note for Phase 2 (Usage UI)

Frontend reads `messages_used_this_period` and `tier` from /api/chat's 429 response (`limit` + `reset_at` fields) for the exhaustion modal. To render the remaining-count banner in normal flow (when the user is NOT yet at the limit), Phase 2 can either:

(a) Add a new `GET /api/usage` endpoint that returns `{ messages_used_this_period, tier, period_start, limit: FREE_TIER_MONTHLY_LIMIT }` — cleanest, no frontend Supabase dependency.

(b) Have the frontend query `profiles` directly via the browser Supabase client — simpler, but couples frontend to DB schema.

Either works — Phase 1 did not decide, Phase 2 picks.

## Self-Check: PASSED

File existence verification:

- `src/lib/constants.ts` — FOUND (contains FREE_TIER_MONTHLY_LIMIT = 10 and UserTier type)
- `src/app/api/chat/route.ts` — FOUND (contains monthly gate, 429 response, RPC increment)
- `.planning/REQUIREMENTS.md` — FOUND (GATE-03 corrected, no abhishekratna1 references)
- `.planning/ROADMAP.md` — FOUND (Phase 1 Criterion 3 corrected, no abhishekratna1 references)

Commit existence verification:

- `1d38d90` (Task 1 constants) — FOUND on `feature/phase-01-usage-gating`
- `2f758fb` (Task 2a pre-LLM gate) — FOUND on `feature/phase-01-usage-gating`
- `bc83096` (Task 2b post-LLM RPC) — FOUND on `feature/phase-01-usage-gating`
- `a6bdac7` (Task 3 docs correction) — FOUND on `feature/phase-01-usage-gating`

Build verification: `npm run build` exits 0. TypeScript: zero errors on modified files.

---
*Phase: 01-usage-gating-backend*
*Plan: 02*
*Status: COMPLETE — live on pmmsherpa.com*
*Completed: 2026-04-16*
