# PMM Sherpa — TODOs

## Comprehensive Test Suite
**What:** Set up Vitest with tests for API routes, hooks, and components beyond search-detection.ts.
**Why:** The project has zero automated tests. Critical paths like message saving to Supabase, conversation loading, SSE stream parsing, and error boundaries are untested. Bugs in these paths cause user-facing issues (blank screens, lost messages).
**Pros:** Prevents regressions, enables confident refactoring, catches edge cases early.
**Cons:** ~2-4 hours of setup + writing. Needs mock strategy for Supabase and LLM providers.
**Context:** Vitest is being added in the current PR for search-detection.ts only. Priority test targets: `useConversationMessages` hook (Supabase query + error handling), `/api/chat` route (SSE streaming, tool config per provider), `ChatContainer` message sync logic.
**Depends on:** Vitest config from current PR.
