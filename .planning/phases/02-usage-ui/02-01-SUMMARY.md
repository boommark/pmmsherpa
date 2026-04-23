---
phase: 02-usage-ui
plan: 01
subsystem: ui
tags: [zustand, react, shadcn, tailwind, typescript, usage-gating]

# Dependency graph
requires:
  - phase: 01-usage-gating
    provides: "FREE_TIER_MONTHLY_LIMIT constant, UserTier type, messagesRemaining DB columns in profiles, increment_messages_used RPC"
provides:
  - "Extended Zustand chatStore with messagesRemaining, userTier, resetAt, showExhaustionModal state fields"
  - "setUsageState action with UTC-safe client-side period reset logic"
  - "decrementRemaining action guarded for null and founder/starter tiers"
  - "setShowExhaustionModal action with optional resetAt parameter"
  - "UsageCounter component: color-coded counter with founder/starter unlimited support"
  - "WarningBanner component: dismissible amber banner at <= 3 remaining with /pricing link"
  - "ExhaustionModal component: shadcn Dialog with locked copy, formatted reset date, $11.99/mo CTA"
affects: [02-02, 03-billing, 04-starter]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Usage gating state co-located in chatStore (Zustand)"
    - "Client-side lazy period reset using UTC date comparison"
    - "Component reads from Zustand, not local state, for modal control"
    - "WarningBanner dismissed per session via local useState (not Zustand, not sessionStorage)"

key-files:
  created:
    - src/components/chat/UsageCounter.tsx
    - src/components/chat/WarningBanner.tsx
    - src/components/chat/ExhaustionModal.tsx
  modified:
    - src/stores/chatStore.ts

key-decisions:
  - "Dismiss state for WarningBanner in local useState (not Zustand) — resets on page reload per CONTEXT.md"
  - "ExhaustionModal controlled exclusively by Zustand showExhaustionModal — not local state"
  - "setUsageState uses UTC comparison (getUTCFullYear/getUTCMonth) to avoid timezone issues with bare date strings from Supabase"
  - "decrementRemaining floors at 0 via Math.max — no negative remaining count possible"

patterns-established:
  - "Usage state pattern: Zustand fields (messagesRemaining, userTier) populated by parent container via setUsageState, components read-only"
  - "Color threshold: green >= 6, amber 4-5, red <= 3 remaining"
  - "Banner threshold: show at <= 3, hide at 0 (modal handles 0 case)"

requirements-completed: [UI-01, UI-02, UI-03, UI-04]

# Metrics
duration: ~8min
completed: 2026-04-19
---

# Phase 02 Plan 01: Usage UI Components Summary

**Zustand chatStore extended with 4 usage gating fields and 3 actions, plus UsageCounter, WarningBanner, and ExhaustionModal components ready for chat integration**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-19T16:43:55Z
- **Completed:** 2026-04-19T16:45:40Z
- **Tasks:** 2
- **Files modified:** 4 (1 modified, 3 created)

## Accomplishments

- Extended chatStore with messagesRemaining/userTier/resetAt/showExhaustionModal state and setUsageState/decrementRemaining/setShowExhaustionModal actions
- Created UsageCounter with green/amber/red color thresholds and founder/starter unlimited support
- Created WarningBanner (session-dismissible amber banner at <= 3 remaining, upgrade link to /pricing)
- Created ExhaustionModal (shadcn Dialog with locked copy, formatted reset date, $11.99/mo CTA)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend Zustand chatStore with usage gating state and actions** - `cc51594` (feat)
2. **Task 2: Create UsageCounter, WarningBanner, and ExhaustionModal components** - `ae5c0be` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `src/stores/chatStore.ts` - Extended with 4 state fields and 3 usage gating actions
- `src/components/chat/UsageCounter.tsx` - Color-coded counter with founder/starter unlimited support
- `src/components/chat/WarningBanner.tsx` - Dismissible amber banner at <= 3 remaining
- `src/components/chat/ExhaustionModal.tsx` - Shadcn Dialog with locked copy and $11.99/mo upgrade CTA

## Decisions Made

- Dismiss state for WarningBanner stored in local `useState` (not Zustand, not sessionStorage) — resets on page reload as specified in CONTEXT.md
- ExhaustionModal controlled exclusively by Zustand `showExhaustionModal` — Radix Dialog `onOpenChange` calls `setShowExhaustionModal(false)` for Esc key and backdrop click
- UTC comparison (`getUTCFullYear`/`getUTCMonth`) used in `setUsageState` to avoid timezone mismatches with bare `YYYY-MM-DD` date strings returned by Supabase
- `decrementRemaining` floors at 0 via `Math.max(0, remaining - 1)` — prevents negative count

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all TypeScript compiled clean on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three components are ready to be imported and wired into ChatContainer and ChatInput in Plan 02-02
- chatStore actions are ready to be called from ChatContainer (profile fetch → setUsageState) and /api/chat response handler (decrementRemaining, setShowExhaustionModal on 429)
- Components import correctly from `@/stores/chatStore` and compile clean

---
*Phase: 02-usage-ui*
*Completed: 2026-04-19*

## Self-Check: PASSED

- FOUND: src/stores/chatStore.ts
- FOUND: src/components/chat/UsageCounter.tsx
- FOUND: src/components/chat/WarningBanner.tsx
- FOUND: src/components/chat/ExhaustionModal.tsx
- FOUND: .planning/phases/02-usage-ui/02-01-SUMMARY.md
- FOUND commit cc51594 (Task 1)
- FOUND commit ae5c0be (Task 2)
- TypeScript: compiled clean (npx tsc --noEmit exits 0)
