# Phase 2: Usage UI - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Show users their remaining message credits in the chat UI and guide them to upgrade when exhausted. Adds a counter below the chat input, a warning banner when credits are low, and an exhaustion modal when the API returns 429. Does NOT include pricing page content (Phase 3) or Stripe checkout (Phase 4) — the upgrade CTA links to `/pricing` which Phase 3 will build.

</domain>

<decisions>
## Implementation Decisions

### Counter placement & style
- Counter text appears **below the chat input bar**, left-aligned, small muted text
- Format: **"X of 10 messages remaining"** — shows both current and total
- Color changes based on remaining count:
  - Default/green: 6+ remaining
  - Amber: 5 remaining
  - Red: 3 or fewer remaining
- **Founders** (`tier='founder'`): Show counter area but display **"Unlimited messages"** instead of a numeric count
- Counter is always visible for free-tier users (not dismissible)

### Warning banner behavior
- **Inline amber banner above the chat input**, slides in when **3 or fewer messages** remain (threshold is 3, not 2)
- Banner contains: warning text ("X messages remaining this month") + small **"Upgrade" button**
- Upgrade button links to `/pricing` (same as Phase 1's `upgrade_url` in the 429 response)
- **Dismissible** with an X button — dismissed state stored in session (reappears on next page load/refresh)
- Banner is persistent while messages <= 3 and not dismissed in current session

### Exhaustion modal
- Modal triggers **when user attempts to send and receives HTTP 429** from `/api/chat`
- Does NOT appear on page load when at 0 — only on send attempt
- Modal content:
  - Locked copy from Phase 1: "Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month."
  - Reset date: "Resets on [Month Day, Year]" — derived from `reset_at` field in the 429 response
  - Prominent **"Upgrade to Starter — $11.99/mo"** button linking to `/pricing`
  - **"Maybe later"** dismiss link
- After dismissal: user can browse conversation history, but **input area is disabled** (greyed out, no typing)
- If user tries to send again (somehow), modal re-appears
- User's unsent message **stays in the input field** — preserved for after upgrade
- Conversation state fully preserved (no loss of in-flight chat per Phase 1 contract)
- Uses shadcn `dialog.tsx` component (already exists)

### Counter data flow
- **Fetch on page load:** Read `profiles.messages_used_this_period`, `tier`, and `period_start` via Supabase browser client on chat page mount
- **Client-side period reset:** If `period_start` is from a previous month, display 10 remaining (full reset) without waiting for server-side lazy reset
- **Optimistic local update:** After each successful message send, decrement `remaining` by 1 locally in Zustand. No extra API call needed.
- **State location:** Add `messagesRemaining`, `userTier`, and `resetAt` to the existing **Zustand chatStore** (`src/stores/chatStore.ts`). Single source of truth — ChatInput reads for counter, banner reads for threshold, ChatContainer handles 429 → modal.
- **429 handling in ChatContainer:** When `fetch('/api/chat')` returns 429, parse the JSON body (`error`, `limit`, `reset_at`, `message`, `upgrade_url`), set remaining to 0 in store, and trigger the modal. Do NOT throw a generic error.

### Claude's Discretion
- Exact animation/transition for the warning banner slide-in
- Whether to use `Alert` component from shadcn or a custom banner div
- Exact styling of the disabled input area when exhausted (opacity, cursor, placeholder text)
- Mobile responsive adjustments for counter and banner layout

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 contract (429 response shape)
- `src/app/api/chat/route.ts` §lines 170-191 — 429 response with `{ error, limit, reset_at, message, upgrade_url }`. This is the exact contract the exhaustion modal consumes.
- `.planning/phases/01-usage-gating-backend/01-CONTEXT.md` §"Error response design" — locked fields, friendly message copy, mid-flow behavior

### Usage gating constants and types
- `src/lib/constants.ts` — `FREE_TIER_MONTHLY_LIMIT = 10`, `UserTier` type
- `src/types/database.ts` §lines 13-28 — `Profile` interface with `tier`, `messages_used_this_period`, `period_start`

### Chat components (where counter/banner/modal integrate)
- `src/components/chat/ChatInput.tsx` — input bar component, counter goes below this
- `src/components/chat/ChatContainer.tsx` §lines 152-250 — `handleSendMessage`, 429 detection point (currently line 221-222 throws generic error)
- `src/stores/chatStore.ts` — Zustand store where usage state will be added

### UI components (reusable)
- `src/components/ui/dialog.tsx` — shadcn dialog for the exhaustion modal
- `src/components/ui/button.tsx` — for upgrade CTA button
- `src/components/ui/badge.tsx` — potential use for counter styling

### Requirements and roadmap
- `.planning/ROADMAP.md` §"Phase 2: Usage UI" — 5 success criteria
- `.planning/REQUIREMENTS.md` §"Usage UI" — UI-01 through UI-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`dialog.tsx`** (shadcn): Ready-made modal with overlay, title, description, close. Use for exhaustion modal.
- **`button.tsx`** (shadcn): Multiple variants — `default` for the upgrade CTA, `ghost` for "Maybe later"
- **`badge.tsx`** (shadcn): Could style the counter, though plain text is the decided approach
- **`useChatStore`** (Zustand): Already manages all chat state — natural home for `messagesRemaining`, `userTier`, `resetAt`
- **`createClient`** (`src/lib/supabase/client.ts`): Browser-side Supabase client, already imported in ChatInput — use for profile fetch

### Established Patterns
- **Zustand for all UI state**: Messages, loading, error, model selection — all in `chatStore.ts`. Usage state follows this pattern.
- **Supabase browser client for reads**: `createClient()` used in settings/usage page and ChatInput for auth checks.
- **Sonner for toasts**: `toast` from `sonner` used throughout — could supplement (not replace) the warning banner.
- **Dark mode via Tailwind classes**: All components use `dark:` variants. Counter/banner/modal must work in dark mode.
- **Lucide icons**: Used everywhere (`Send`, `Loader2`, `Mic`, etc.). Use for warning icon if needed.

### Integration Points
- **ChatInput line 58**: `useChatStore()` already destructured — add `messagesRemaining` and `userTier` here for counter render
- **ChatContainer line 221**: `if (!response.ok)` — currently throws generic error. Must detect 429 specifically and route to modal instead of error state.
- **ChatContainer line 612/625**: Two `<ChatInput>` renders (welcome screen and conversation view) — counter and banner should appear in both.
- **Supabase profile read**: Need to fetch on mount. Pattern exists in `settings/usage/page.tsx` (lines 24-26) — follow same `auth.getUser()` → query pattern.

</code_context>

<specifics>
## Specific Ideas

- Counter color thresholds: default/green at 6+, amber at 5, red at 3 or fewer — chosen by user to create gradual urgency
- Warning banner threshold is **3 remaining** (not the requirement's 2) — user specifically requested "persistent starting from 3 messages"
- Founders see "Unlimited messages" in the counter area — confirms their special status rather than hiding the feature entirely
- Modal upgrade button shows the price inline: "Upgrade to Starter — $11.99/mo" — reduces friction by showing cost upfront
- "Maybe later" as the dismiss text — classy, no pressure, matches the Phase 1 tone

</specifics>

<deferred>
## Deferred Ideas

- **Pricing page content** — Phase 3. The upgrade button links to `/pricing` but that page doesn't exist yet. Planner should handle this gracefully (link works, page may show 404 or placeholder until Phase 3 ships).
- **Stripe checkout flow** — Phase 4. The "Upgrade" button is wired to navigate to `/pricing`, not to trigger Stripe directly.
- **Email notification when credits run low** — not in v1.1 scope. Could be added later as a re-engagement hook.
- **Usage analytics for admins** — existing settings/usage page tracks queries/tokens, not the monthly gating counter. Admin dashboard enhancement is separate scope.

</deferred>

---

*Phase: 02-usage-ui*
*Context gathered: 2026-04-18*
