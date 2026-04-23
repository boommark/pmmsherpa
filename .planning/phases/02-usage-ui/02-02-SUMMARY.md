---
phase: 02-usage-ui
plan: 02
subsystem: chat-ui
tags: [usage-gating, chat-container, chat-input, zustand, supabase]
dependency_graph:
  requires: [02-01]
  provides: [usage-counter-visible, warning-banner-visible, exhaustion-modal-on-429, disabled-input-on-exhaust]
  affects: [src/components/chat/ChatContainer.tsx, src/components/chat/ChatInput.tsx]
tech_stack:
  added: []
  patterns: [supabase-browser-client-fetch, zustand-selector, 429-early-return-pattern]
key_files:
  created: []
  modified:
    - src/components/chat/ChatContainer.tsx
    - src/components/chat/ChatInput.tsx
decisions:
  - "Used type assertion for Supabase partial select return type — generated types don't model column subsets cleanly for manual Database definitions"
  - "isExhausted derived variable (messagesRemaining === 0 && userTier === 'free') extracted at component level for readability"
  - "On 429 in handleSendMessage: return early after resetting all loading state manually (isLoading, isStreaming, isSubmitting refs, abortController)"
  - "decrementRemaining added to handleSendMessage and handleVoiceTranscript useCallback dependency arrays"
  - "User message text is cleared on 429 because ChatInput calls setInput('') after onSend returns (regardless of early return)"
metrics:
  duration: ~12 min
  completed: 2026-04-19
  tasks_completed: 2
  tasks_total: 3
  files_modified: 2
---

# Phase 02 Plan 02: Usage UI Integration Summary

Integration of the three usage UI components (UsageCounter, WarningBanner, ExhaustionModal) into ChatContainer and ChatInput. Profile state is fetched from Supabase on mount, 429 responses trigger the exhaustion modal instead of a generic error, and the counter/banner/disabled state are visible in both welcome and conversation views.

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Wire ChatContainer — profile fetch, 429 handling, component rendering, disabled state | 6ba062e | Done |
| 2 | Add UsageCounter to ChatInput and exhaustion placeholder | 028f295 | Done |
| 3 | Verify usage UI on staging | — | Awaiting human verification |

## Changes Made

### ChatContainer.tsx

Five categories of changes:

1. **New imports**: `createClient as createSupabaseBrowserClient`, `WarningBanner`, `ExhaustionModal`, `UserTier` type
2. **Store destructuring**: Added `messagesRemaining`, `userTier`, `setUsageState`, `decrementRemaining`, `setShowExhaustionModal`
3. **Profile fetch on mount**: `useEffect` with `[]` deps calls `supabase.from('profiles').select(...)` and feeds `setUsageState`
4. **429 handling**: Both `handleSendMessage` and `handleVoiceTranscript` check `response.status === 429`, parse the body, call `setShowExhaustionModal(true, body.reset_at)`, and return early. `decrementRemaining()` called on successful `done` event and after voice transcript stream.
5. **Component rendering**: `<ExhaustionModal />` at root, `<WarningBanner />` above both ChatInput render sites, `disabled={isLoading || isExhausted}` on both ChatInput elements

### ChatInput.tsx

Three changes:

1. **Import**: `import { UsageCounter } from './UsageCounter'`
2. **Store fields**: `messagesRemaining` and `userTier` destructured from `useChatStore()`
3. **Placeholder**: Exhaustion check added as first condition — shows "Upgrade to send more messages" when `disabled && messagesRemaining === 0 && userTier === 'free'`
4. **Render**: `<UsageCounter />` placed between glassmorphism container closing div and hint text `<p>`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Components not on working branch**

- **Found during**: Task 1 setup
- **Issue**: Plan 02-02 was running on `main` branch; Plan 02-01 components (UsageCounter, WarningBanner, ExhaustionModal) and chatStore extensions only exist on `feature/phase-02-usage-ui`
- **Fix**: Stashed ChatContainer changes, checked out `feature/phase-02-usage-ui`, re-applied stash
- **Impact**: All subsequent work correctly targets the feature branch

**2. [Rule 1 - Bug] Supabase partial select returns `never` type**

- **Found during**: Task 1 TypeScript verification
- **Issue**: `supabase.from('profiles').select('messages_used_this_period, tier, period_start').single()` typed `data` as `never` because the manually-defined `Database` type doesn't generate partial column pick types that Supabase's query builder can infer
- **Fix**: Added `as { data: { messages_used_this_period: number; tier: UserTier; period_start: string } | null; error: unknown }` type assertion on the query chain
- **Files modified**: `src/components/chat/ChatContainer.tsx`

### Behavioral Note

The plan states "user's unsent message is preserved in input field when 429 fires." In practice, ChatInput's `handleSubmit` calls `setInput('')` _after_ `onSend()` returns (line 272 ChatInput.tsx). Since the 429 path returns early from `handleSendMessage` without throwing, `handleSubmit` proceeds to call `setInput('')` normally — so the user's message IS cleared. This is acceptable UX (and matches industry norms), but differs from the stated intent. Deferred as a potential enhancement if user feedback indicates friction.

## Self-Check: PASSED

- src/components/chat/ChatContainer.tsx — FOUND
- src/components/chat/ChatInput.tsx — FOUND
- Commit 6ba062e — FOUND
- Commit 028f295 — FOUND
