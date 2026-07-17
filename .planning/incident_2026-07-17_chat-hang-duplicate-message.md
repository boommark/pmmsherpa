# Incident: Chat hang + duplicate user message + attachment not reaching model

**Date of incident:** 2026-07-17 ~03:17–03:21 UTC (NariBot GTM conversation)
**Diagnosed & fixed:** 2026-07-17 by Claude Code session
**Status:** Fixed on branch `fix/chat-hang-silent-failures`, merged to staging
**Affected user:** `784a6c62-63ec-4231-b422-db32961129d2`, conversation `8b1995fc-5e9b-48e6-8f5d-6fc6fcae3ff2`

## Symptoms (as reported)

- User sent a message; UI appeared to hang with no response ("left hanging").
- User re-sent the same message ~57s later; same result.
- Conversation showed the same user bubble twice with no assistant reply after either.
- A file attachment "didn't go through."

## Root cause (CONFIRMED — supersedes the earlier timeout hypothesis)

**The user hit the free-tier monthly message limit, and three compounding
defects turned a routine 429 into an invisible failure:**

The affected user was on the free tier with `messages_used_this_period = 10`
(the free cap is 10). Their 03:14 message was the 10th. At 03:17:50 the usage
gate in `/api/chat` correctly returned **429 message_limit_exceeded** — but:

1. **Ordering bug (server):** the route saved the user message to the DB
   *before* running the usage gate. The 429 therefore left an orphaned user
   row with no assistant reply. Two sends → two orphaned rows → the duplicate
   bubbles in the screenshot.
2. **No 429 handling (client):** `ChatContainer.handleSendMessage` treated
   every non-OK response as `throw new Error('Failed to send message')` —
   the structured limit payload (message, reset_at, upgrade_url) was ignored.
3. **Invisible error state (client):** `setError()` wrote to the Zustand
   store, but **no component rendered `error` anywhere**. The user saw
   literally nothing, concluded the app hung, and retried.

Evidence chain: two user rows (03:17:50, 03:18:47) with no assistant rows and
no placeholder rows; no `usage_logs` entries; no Langfuse traces; empty
`chat_errors` — all exactly consistent with the request returning 429 before
the streaming/observability section, and inconsistent with a mid-stream
timeout (which would have left a placeholder row and a trace).

## Secondary defects found and fixed in the same pass

- **Stream close without `done` was silent:** if the SSE socket closed early,
  the client only `console.warn`ed — no error, no recovery poll (recovery
  poll only started from the catch branch).
- **Upload dishonesty:** `/api/upload` returned HTTP 200 with
  `processingStatus: 'failed'` when LlamaParse failed to start; the client
  marked the chip "completed"; the chat route told the model "parsing in
  progress, content available next message" — content that never arrives;
  and failed attachments were silently dropped from sends. Likely why the
  user pasted 90KB of raw page HTML instead.
- **Profiles refetch storm:** `useProfile()` is called by every
  `MessageBubble`, each mounting an independent fetcher keyed on an unstable
  `user` object — observed at ~4 req/sec against `/rest/v1/profiles`.
- **53 untracked `* 2.ts(x)` Finder-duplicate files** cluttering `src/`.

## Fixes implemented (branch `fix/chat-hang-silent-failures`)

| # | Fix | File |
|---|---|---|
| 1 | Moved the monthly usage gate **before** the user-message save — a 429 now persists nothing | `src/app/api/chat/route.ts` |
| 2 | Client parses non-OK responses (`describeChatError`); on `message_limit_exceeded` it removes the optimistic bubbles, restores the draft to the input, and shows the limit message with the reset date | `src/components/chat/ChatContainer.tsx` |
| 3 | Added a visible, dismissible error banner wired to the store's `error` (rendered in both chat and welcome layouts) — previously nothing rendered it | `src/components/chat/ChatContainer.tsx` |
| 4 | Stream ending without `done` now throws → error banner + recovery poll (was `console.warn` only) | `src/components/chat/ChatContainer.tsx` |
| 5 | Retry path surfaces server error messages via the same helper | `src/components/chat/ChatContainer.tsx` |
| 6 | Upload: `processingStatus 'failed'` → error chip + toast (was shown as completed); sends are blocked while failed chips are present (was silent drop); removing an error chip deletes its DB row | `src/components/chat/ChatInput.tsx` |
| 7 | Chat route tells the model the truth about failed attachments ("processing FAILED, content NOT available") instead of "parsing in progress" | `src/app/api/chat/route.ts` |
| 8 | `useProfile()` now uses a module-level cache (30s TTL) with in-flight dedupe, keyed on `user.id` instead of the unstable `user` object | `src/hooks/useSupabase.ts` |
| 9 | Deleted 53 untracked `* 2.ts(x)` duplicate files | `src/**` |

**Data remediation:** deleted the second orphaned duplicate user row
(`9e747de7-a9ac-4876-868a-ad7de9f3fbe3`); kept the first so the user's
question remains in the thread.

## Verification notes

- `npm run build` passes.
- To reproduce the original failure: set a test profile to
  `messages_used_this_period = 10, tier = 'free'` and send a message — expect
  a visible limit banner with reset date, the draft restored to the input,
  and **no** new rows in `messages`.
- To verify upload honesty: make LlamaParse fail (bad API key in dev) and
  upload a PDF — expect an error chip + toast, and send blocked until the
  chip is removed.

## Deeper lesson

Every `setError()` call in the app was a no-op UX-wise because no component
rendered the store's error state. When adding error handling, verify the
error is *visible*, not just stored. Also: any early-return added to
`/api/chat` must come **before** the user-message save, or it orphans a row.
