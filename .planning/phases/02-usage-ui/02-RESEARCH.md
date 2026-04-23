# Phase 02: Usage UI - Research

**Researched:** 2026-04-18
**Domain:** React/Next.js UI state management, Zustand store extension, shadcn/ui dialog, Tailwind color theming
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Counter placement & style**
- Counter text appears below the chat input bar, left-aligned, small muted text
- Format: "X of 10 messages remaining" — shows both current and total
- Color changes based on remaining count:
  - Default/green: 6+ remaining
  - Amber: 5 remaining
  - Red: 3 or fewer remaining
- Founders (`tier='founder'`): Show counter area but display "Unlimited messages" instead of a numeric count
- Counter is always visible for free-tier users (not dismissible)

**Warning banner behavior**
- Inline amber banner above the chat input, slides in when 3 or fewer messages remain (threshold is 3, not 2)
- Banner contains: warning text ("X messages remaining this month") + small "Upgrade" button
- Upgrade button links to `/pricing`
- Dismissible with an X button — dismissed state stored in session (reappears on next page load/refresh)
- Banner is persistent while messages <= 3 and not dismissed in current session

**Exhaustion modal**
- Modal triggers when user attempts to send and receives HTTP 429 from `/api/chat`
- Does NOT appear on page load when at 0 — only on send attempt
- Modal content:
  - "Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month."
  - Reset date: "Resets on [Month Day, Year]" derived from `reset_at` field in 429 response
  - Prominent "Upgrade to Starter — $11.99/mo" button linking to `/pricing`
  - "Maybe later" dismiss link
- After dismissal: input area is disabled (greyed out, no typing)
- If user tries to send again, modal re-appears
- User's unsent message stays in the input field
- Uses shadcn `dialog.tsx` component (already exists)

**Counter data flow**
- Fetch on page load: Read `profiles.messages_used_this_period`, `tier`, and `period_start` via Supabase browser client on chat page mount
- Client-side period reset: If `period_start` is from a previous month, display 10 remaining (full reset)
- Optimistic local update: After each successful message send, decrement `remaining` by 1 locally in Zustand
- State location: Add `messagesRemaining`, `userTier`, and `resetAt` to the existing Zustand chatStore
- 429 handling in ChatContainer: When `fetch('/api/chat')` returns 429, parse JSON body, set remaining to 0 in store, and trigger the modal. Do NOT throw a generic error.

### Claude's Discretion
- Exact animation/transition for the warning banner slide-in
- Whether to use `Alert` component from shadcn or a custom banner div
- Exact styling of the disabled input area when exhausted (opacity, cursor, placeholder text)
- Mobile responsive adjustments for counter and banner layout

### Deferred Ideas (OUT OF SCOPE)
- Pricing page content — Phase 3
- Stripe checkout flow — Phase 4
- Email notification when credits run low — not in v1.1 scope
- Usage analytics for admins — separate scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UI-01 | User sees remaining message count in chat input area | Zustand store extension + Supabase profile fetch on mount + ChatInput counter render below textarea |
| UI-02 | User sees a soft warning banner when 2 or fewer messages remain (overridden by CONTEXT.md to threshold of 3) | Conditional banner component in ChatContainer above ChatInput, session-dismissed state via `useState` |
| UI-03 | User sees an exhaustion modal when limit is reached, with upgrade CTA | 429 detection in `handleSendMessage`, shadcn `dialog.tsx` modal component, store flag `showExhaustionModal` |
| UI-04 | Exhaustion modal links to pricing page | `href="/pricing"` on the upgrade CTA `<Button>` inside the modal |
</phase_requirements>

---

## Summary

Phase 2 adds three visible UI layers on top of the Phase 1 backend gate: a persistent message counter below the chat input, a dismissible warning banner when credits run low, and a modal that fires when the API returns 429. All state lives in the existing Zustand `chatStore.ts`; there is no new server endpoint, no new database table, and no new page.

The critical integration point is `ChatContainer.handleSendMessage` at line 221, which currently does `throw new Error('Failed to send message')` for any non-200 response. This generic path must be replaced with a 429-specific branch that parses the JSON body and sets store state (`remaining = 0`, `showExhaustionModal = true`, `resetAt = <value from response>`) instead of throwing. The `ChatInput` component already reads from `useChatStore()` at line 55, so adding `messagesRemaining` and `userTier` to the destructure is minimal friction.

The shadcn `dialog.tsx` component already exists in the project at `src/components/ui/dialog.tsx` and has been used elsewhere. The `button.tsx` variant system supports `default` (blue CTA) and `ghost` (Maybe later link) out of the box. Tailwind dark-mode variants (`dark:`) are used throughout and must be applied to the counter, banner, and modal.

**Primary recommendation:** Extend `chatStore.ts` with four new fields (`messagesRemaining`, `userTier`, `resetAt`, `showExhaustionModal`), create two new components (`UsageCounter` and `WarningBanner`), create one new component (`ExhaustionModal`), surgically patch the 429 branch in `ChatContainer.handleSendMessage`, and add a `useEffect` to `ChatContainer` that fetches the profile on mount.

---

## Standard Stack

### Core (already in project — no new installs required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | in use | Client-side usage state (`messagesRemaining`, `userTier`, `resetAt`, `showExhaustionModal`) | Already the single source of truth for all chat state |
| @supabase/supabase-js | in use | Browser-side profile fetch on mount | Already imported in ChatInput and settings pages; `createClient()` at `src/lib/supabase/client.ts` |
| shadcn/ui dialog | in use (dialog.tsx exists) | Exhaustion modal overlay | Already installed; no `npx shadcn@latest add` needed |
| shadcn/ui button | in use | Upgrade CTA and dismiss link | `default` and `ghost` variants cover both buttons |
| Tailwind CSS | in use | Counter color thresholds, banner styling, dark mode | `text-green-600`, `text-amber-500`, `text-red-500` with `dark:` variants |
| lucide-react | in use | Warning icon in banner (e.g. `AlertTriangle`) | Used everywhere in the project |

**No new packages required.** This phase is purely additive UI on top of existing infrastructure.

---

## Architecture Patterns

### Recommended File Structure (new files only)

```
src/
├── components/
│   └── chat/
│       ├── UsageCounter.tsx       # "X of 10 messages remaining" below input
│       ├── WarningBanner.tsx      # Amber slide-in banner at <= 3 remaining
│       └── ExhaustionModal.tsx    # Modal on 429
├── stores/
│   └── chatStore.ts               # Extended with 4 new fields + actions
```

### Pattern 1: Zustand Store Extension

**What:** Add usage state and actions to the existing `chatStore.ts`. Keep all usage state co-located with chat state so components have a single import.

**When to use:** Any time a new piece of chat-context state is needed by multiple components.

**New fields to add to `ChatStore` interface:**
```typescript
// Usage gating — Phase 2
messagesRemaining: number | null   // null = not yet fetched
userTier: 'free' | 'founder' | 'starter' | null
resetAt: string | null             // ISO string from 429 body
showExhaustionModal: boolean

// Actions
setUsageState: (remaining: number, tier: UserTier, periodStart: string) => void
decrementRemaining: () => void
setShowExhaustionModal: (show: boolean, resetAt?: string) => void
```

**Initial state additions:**
```typescript
messagesRemaining: null,
userTier: null,
resetAt: null,
showExhaustionModal: false,
```

**`setUsageState` action — handles client-side period reset logic:**
```typescript
setUsageState: (used, tier, periodStart) => {
  // Client-side lazy reset: if period_start is a prior month, treat as 0 used
  const now = new Date()
  const periodMonth = new Date(periodStart + 'T00:00:00Z') // avoid timezone shift on bare date
  const isCurrentPeriod =
    periodMonth.getUTCFullYear() === now.getUTCFullYear() &&
    periodMonth.getUTCMonth() === now.getUTCMonth()
  const effectiveUsed = isCurrentPeriod ? used : 0
  set({
    messagesRemaining: FREE_TIER_MONTHLY_LIMIT - effectiveUsed,
    userTier: tier,
  })
}
```

Note: `FREE_TIER_MONTHLY_LIMIT` is already exported from `src/lib/constants.ts` as `10`.

### Pattern 2: Profile Fetch on Mount (ChatContainer useEffect)

**What:** Fetch profile once when ChatContainer mounts. Follow the exact pattern from `settings/usage/page.tsx`.

**Source:** `src/app/(dashboard)/settings/usage/page.tsx` lines 23-41 (already in project).

```typescript
// In ChatContainer, after existing useEffects:
const { setUsageState } = useChatStore()

useEffect(() => {
  const supabase = createSupabaseBrowserClient()
  async function fetchUsage() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase
      .from('profiles')
      .select('messages_used_this_period, tier, period_start')
      .eq('id', user.id)
      .single()
    if (profile) {
      setUsageState(profile.messages_used_this_period, profile.tier, profile.period_start)
    }
  }
  fetchUsage()
}, []) // mount-only — no deps, intentional
```

`createSupabaseBrowserClient` is already imported in `ChatInput.tsx` as `createClient from '@/lib/supabase/client'`. `ChatContainer.tsx` can add the same import.

### Pattern 3: 429 Detection in handleSendMessage

**What:** Replace the generic `if (!response.ok) { throw new Error(...) }` at line 221 with a 429-specific branch before the generic throw.

**Integration point:** `ChatContainer.tsx` line 221-222.

```typescript
if (!response.ok) {
  if (response.status === 429) {
    const body = await response.json() as {
      error: string
      limit: number
      reset_at: string
      message: string
      upgrade_url: string
    }
    // Remove the optimistic assistant message placeholder
    finishStreaming(assistantMessageId)
    // Update store: zero remaining, show modal
    setShowExhaustionModal(true, body.reset_at)
    // Keep the user's unsent message in input — do NOT clear it
    // (input text lives in ChatInput local state, not store — no action needed)
    setIsLoading(false)
    setStatusMessage(null)
    isStreamingRef.current = false
    isSubmittingRef.current = false
    setAbortController(null)
    return  // exit handleSendMessage early, do NOT throw
  }
  throw new Error('Failed to send message')
}
```

**Critical detail:** The user's typed text lives in `ChatInput`'s local `useState` (`input`), not in the store. Because `setInput('')` is called only after `onSend` returns without error, and we `return` early from `handleSendMessage` before the store's `onSend` callback completes its normal path, the input text is preserved automatically. No special handling needed.

**However:** `addMessage(userMessage)` and `startStreaming(assistantMessageId)` already ran before the `fetch` call. On 429, clean up the assistant message placeholder via `finishStreaming` and optionally remove the optimistic user message via `removeMessagesFromIndex`. Decision: keep the optimistic user message in the thread (user can see their last prompt) — only remove the assistant placeholder.

### Pattern 4: UsageCounter Component

**What:** Renders below the `<div>` containing the glassmorphism chat input box in `ChatInput.tsx`, replacing the existing `<p>` hint text on mobile or sitting alongside it.

**Placement in ChatInput.tsx:** After the closing `</div>` of the glassmorphism container (currently line 374), before the `<p>` hint text (currently line 375). Both the counter and the hint text live inside the outer `<div className="w-full max-w-3xl mx-auto">`.

```tsx
// src/components/chat/UsageCounter.tsx
import { useChatStore } from '@/stores/chatStore'
import { cn } from '@/lib/utils'

export function UsageCounter() {
  const { messagesRemaining, userTier } = useChatStore()

  // Not yet fetched — render nothing to avoid flash
  if (messagesRemaining === null) return null

  if (userTier === 'founder') {
    return (
      <p className="text-xs text-muted-foreground/60 mt-1.5 text-left pl-1">
        Unlimited messages
      </p>
    )
  }

  const colorClass = messagesRemaining >= 6
    ? 'text-green-600 dark:text-green-400'
    : messagesRemaining === 5
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-red-500 dark:text-red-400'

  return (
    <p className={cn('text-xs mt-1.5 text-left pl-1', colorClass)}>
      {messagesRemaining} of 10 messages remaining this month
    </p>
  )
}
```

### Pattern 5: WarningBanner Component

**What:** Amber inline banner that appears above the chat input when `messagesRemaining <= 3`. Dismissible per session via local `useState` (not Zustand, intentionally — it resets on page reload as specified).

**Placement in ChatContainer.tsx:** Render `<WarningBanner />` immediately above the `<ChatInput>` renders at lines 612 and 625. Since there are two `<ChatInput>` render sites (welcome screen and conversation view), the banner should be placed in both wrappers.

```tsx
// src/components/chat/WarningBanner.tsx
'use client'
import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/stores/chatStore'
import { cn } from '@/lib/utils'

export function WarningBanner() {
  const { messagesRemaining } = useChatStore()
  const [dismissed, setDismissed] = useState(false)

  const shouldShow = messagesRemaining !== null && messagesRemaining <= 3 && !dismissed

  if (!shouldShow) return null

  return (
    <div className={cn(
      'flex items-center justify-between gap-2 px-3 py-2 mx-auto w-full max-w-3xl',
      'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800',
      'rounded-xl mb-2 text-sm text-amber-800 dark:text-amber-200',
      'animate-in slide-in-from-bottom-2 duration-200'  // Tailwind animate-in (shadcn ships this)
    )}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{messagesRemaining} message{messagesRemaining !== 1 ? 's' : ''} remaining this month</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button asChild size="sm" variant="outline" className="h-7 text-xs border-amber-400 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900">
          <a href="/pricing">Upgrade</a>
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
```

**Animation note:** `animate-in slide-in-from-bottom-2 duration-200` uses the `tailwindcss-animate` plugin that shadcn/ui installs. This is confirmed present because shadcn's `dialog.tsx` and other components in the project use `data-[state=open]:animate-in`. HIGH confidence it is available.

### Pattern 6: ExhaustionModal Component

**What:** shadcn `Dialog` that opens when `showExhaustionModal === true`. Controlled by Zustand state.

```tsx
// src/components/chat/ExhaustionModal.tsx
'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/stores/chatStore'

function formatResetDate(isoString: string | null): string {
  if (!isoString) return 'next month'
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function ExhaustionModal() {
  const { showExhaustionModal, resetAt, setShowExhaustionModal } = useChatStore()

  return (
    <Dialog open={showExhaustionModal} onOpenChange={(open) => { if (!open) setShowExhaustionModal(false) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You&apos;ve used all your free messages</DialogTitle>
          <DialogDescription>
            Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Resets on {formatResetDate(resetAt)}
        </p>
        <div className="flex flex-col gap-3 mt-2">
          <Button asChild className="w-full bg-[#0058be] hover:bg-[#004a9e] text-white">
            <a href="/pricing">Upgrade to Starter — $11.99/mo</a>
          </Button>
          <button
            onClick={() => setShowExhaustionModal(false)}
            className="text-sm text-muted-foreground hover:text-foreground text-center"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Disabled input state after dismiss:** When `showExhaustionModal === false` AND `messagesRemaining === 0`, `ChatInput` should receive `disabled={true}`. The existing `disabled` prop on `ChatInput` already greys out the textarea and shows a `Loader2` on the button. For the exhausted state, a specific placeholder text can be added: "Upgrade to send more messages". This means `ChatContainer` passes `disabled={isLoading || (messagesRemaining === 0 && userTier === 'free')}` to both `<ChatInput>` renders.

### Anti-Patterns to Avoid

- **Fetching profile inside ChatInput:** ChatInput is a controlled input — keep data fetching in ChatContainer (the orchestrator). ChatInput only reads from the store.
- **Session storage for banner dismiss:** `useState` is simpler and matches the spec (reappear on refresh). Don't use `sessionStorage` unless the spec changes.
- **Polling for usage updates:** Do not poll the server. One fetch on mount + optimistic decrement is the decided pattern.
- **Throwing on 429:** The current code throws a generic Error for any non-OK response. The 429 path must `return` early with modal state, not propagate to the `catch` block.
- **Reading `response.body` after 429:** Once you call `response.json()` for the 429 body, do not attempt to read `response.body` as a stream. The two are mutually exclusive on the same response object.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal overlay with backdrop | Custom portal div | shadcn `dialog.tsx` (already exists) | Handles focus trap, keyboard close (Esc), scroll lock, accessibility |
| Slide-in animation | CSS keyframes in component | Tailwind `animate-in slide-in-from-bottom-2` | Already available via `tailwindcss-animate` (shadcn dep) |
| Date formatting for reset date | Manual date string builder | `Date.toLocaleDateString()` with `en-US` locale options | Handles month name, ordinal, year correctly |
| Color threshold logic | Inline ternary chains | Extracted to a helper or `cn()` map | Keeps the component clean; thresholds may change |

---

## Common Pitfalls

### Pitfall 1: Two ChatInput Render Sites
**What goes wrong:** Counter and banner appear only in one view (welcome screen or conversation) but not both.
**Why it happens:** `ChatContainer.tsx` renders `<ChatInput>` in two branches — welcome screen (line 612) and conversation view (line 625). A developer adds the counter/banner to only one branch.
**How to avoid:** `WarningBanner` reads from Zustand and is self-contained. Render `<ExhaustionModal>` once at the ChatContainer root (outside both branches) — a Dialog with `open={showExhaustionModal}` renders correctly regardless of which view is active. Render `<WarningBanner>` in both input wrapper sites OR pass it through `ChatInput` itself (simpler: include it in `ChatInput`'s return, so it inherits placement automatically from both render sites).
**Warning signs:** Warning banner disappears when switching from welcome screen to active conversation.

### Pitfall 2: Bare Date String Timezone Trap
**What goes wrong:** `new Date('2026-04-01')` interprets the ISO date as UTC midnight, which converts to the prior day in negative UTC offset timezones (e.g., US Pacific = March 31).
**Why it happens:** Postgres `date` columns are returned as `"YYYY-MM-DD"` strings. JavaScript's `new Date()` treats these as UTC when no time component is present.
**How to avoid:** When comparing `period_start` to the current month for the client-side reset logic, append `T00:00:00Z` explicitly: `new Date(periodStart + 'T00:00:00Z')`. Then compare `.getUTCFullYear()` and `.getUTCMonth()`, not `.getFullYear()` / `.getMonth()`. This is already noted in STATE.md: `period_start typed as string (ISO date)`.

### Pitfall 3: Race Between Profile Fetch and First Message
**What goes wrong:** User sends a message before the profile fetch resolves. `messagesRemaining` is `null`. Optimistic decrement runs on `null - 1 = NaN` or `-1`.
**Why it happens:** `useEffect` profile fetch is async; the user could theoretically interact before it completes.
**How to avoid:** In `decrementRemaining`, guard against null: `if (state.messagesRemaining === null) return`. Founder check: skip decrement if `userTier === 'founder'`. The server will still enforce the gate; the local counter just may show `null` briefly.

### Pitfall 4: Exhaustion Modal on Abort
**What goes wrong:** If the user aborts a streaming response and the partially-read response happens to have a non-OK status, the modal fires spuriously.
**Why it happens:** The AbortError path at line 309 is handled before the generic catch, but the `if (!response.ok)` check at line 221 runs before the stream read loop. An aborted request may never reach line 221 at all — however, ensure the 429 handling path properly checks `error.name !== 'AbortError'` before calling `setShowExhaustionModal`.
**How to avoid:** The 429 detection lives at `if (!response.ok)` before the stream reader — by this point the request has already received headers (HTTP 429 is a header-level response). Abort only fires during the stream read phase. These two paths are mutually exclusive — but worth knowing.

### Pitfall 5: Starter Tier Users See Incorrect Counter
**What goes wrong:** A user on `tier='starter'` (future Phase 4) sees a "X of 10 messages remaining" counter or gets shown the exhaustion modal.
**Why it happens:** `FREE_TIER_MONTHLY_LIMIT` applies only to free tier. Starter tier is currently unlimited (or will be 500+, per STATE.md).
**How to avoid:** In counter/banner/modal logic, always gate on `userTier === 'free'`. Founders already show "Unlimited messages". Treat `starter` the same as `founder` for display purposes (show "Unlimited" or hide counter entirely) until Phase 4 defines starter limits. The `UserTier` type already includes `'starter'` in `constants.ts`.

---

## Code Examples

### Verified Pattern: Supabase Profile Fetch (from settings/usage/page.tsx)

```typescript
// Source: src/app/(dashboard)/settings/usage/page.tsx lines 23-41
const supabase = createClient()  // from '@/lib/supabase/client'

useEffect(() => {
  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // ... then query profiles table
  }
  fetchStats()
}, [supabase])
```

### Verified Pattern: Zustand Store Structure (from chatStore.ts)

```typescript
// Source: src/stores/chatStore.ts
export const useChatStore = create<ChatStore>((set, get) => ({
  // All state fields with initial values
  // All actions as functions that call set()
}))
```

### Verified Pattern: shadcn Dialog (from dialog.tsx — exists at src/components/ui/dialog.tsx)

```tsx
// Standard shadcn dialog usage
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>...</DialogTitle>
      <DialogDescription>...</DialogDescription>
    </DialogHeader>
    {/* body content */}
  </DialogContent>
</Dialog>
```

### Verified Pattern: 429 Response Contract (from src/app/api/chat/route.ts lines 178-190)

```typescript
// Source: src/app/api/chat/route.ts lines 178-190 (Phase 1 — shipped to production)
return new Response(
  JSON.stringify({
    error: 'message_limit_exceeded',
    limit: FREE_TIER_MONTHLY_LIMIT,           // 10
    reset_at: resetAtIso,                      // "2026-05-01T00:00:00Z"
    message: 'Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month.',
    upgrade_url: '/pricing',
  }),
  { status: 429, headers: { 'Content-Type': 'application/json' } }
)
```

### Verified Pattern: Tailwind Color Variants in Use

```tsx
// Pattern used throughout the project:
<p className="text-muted-foreground/60">...</p>        // subtle grey
<span className="text-green-600 dark:text-green-400">  // green
<span className="text-amber-500 dark:text-amber-400">  // amber
<span className="text-red-500 dark:text-red-400">      // red
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-component auth fetches | Zustand store as single source | Project inception | Counter + banner both read from store — no duplicate fetches |
| Generic error throw for all non-200 | 429-specific branch with modal | This phase | Users get actionable upgrade prompt instead of generic error toast |

---

## Open Questions

1. **`<ExhaustionModal>` placement — ChatContainer root vs page layout**
   - What we know: The modal needs to be accessible from `handleSendMessage` in ChatContainer. Placing it at ChatContainer root (outside both welcome/conversation branches) works because Dialog renders in a portal.
   - What's unclear: Whether VoiceModeOverlay (also rendered at ChatContainer root) has any stacking context conflicts.
   - Recommendation: Render ExhaustionModal as a sibling to VoiceModeOverlay at the bottom of ChatContainer's return JSX. Both use portals and should not conflict.

2. **Voice mode path and 429**
   - What we know: `handleVoiceTranscript` (ChatContainer ~line 361) also calls `/api/chat`. It has its own `if (!response.ok)` check (line 388).
   - What's unclear: Whether Phase 2 should also handle 429 in the voice path.
   - Recommendation: Yes — add the same 429 detection in `handleVoiceTranscript` for completeness. Simpler to do it now; easy to miss it as a separate path.

3. **Optimistic decrement for voice messages**
   - What we know: Voice messages go through a separate code path in ChatContainer.
   - What's unclear: Whether `decrementRemaining()` should be called from the voice success path too.
   - Recommendation: Yes, call it in `handleVoiceTranscript` after a successful stream, same as the main path.

---

## Validation Architecture

`workflow.nyquist_validation` key is absent from `.planning/config.json` — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config.*, vitest.config.*, or test/ directory in project root |
| Config file | None — Wave 0 gap |
| Quick run command | `npm run lint` (closest proxy — no unit test runner exists) |
| Full suite command | `npm run build` (full TypeScript compile + Next.js build checks) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-01 | Counter shows "X of 10 messages remaining" below input | manual smoke | `npm run build` (TS compile verifies prop types) | ❌ Wave 0 |
| UI-02 | Warning banner appears at <=3 remaining, dismissible | manual smoke | `npm run build` | ❌ Wave 0 |
| UI-03 | Exhaustion modal opens on 429, not on page load | manual smoke | `npm run build` | ❌ Wave 0 |
| UI-04 | Modal CTA links to /pricing | manual smoke | `npm run build` | ❌ Wave 0 |

**Note:** This project has no unit/integration test infrastructure. All phase verification is manual smoke testing on staging. The `npm run build` gate catches TypeScript and import errors but not runtime behavior.

### Sampling Rate
- **Per task commit:** `npm run build` — catches TS errors
- **Per wave merge:** `npm run build` + manual smoke on staging (counter visible, banner at 3, modal on 429)
- **Phase gate:** Full manual smoke checklist before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test runner configured — manual smoke testing only (acceptable for this project given no existing test infra)
- [ ] Consider adding a simple `__tests__/usage.test.ts` with `@testing-library/react` if test infra is desired — but this is out of scope for Phase 2

---

## Sources

### Primary (HIGH confidence)
- Direct code read: `src/stores/chatStore.ts` — current Zustand store structure and all existing actions
- Direct code read: `src/components/chat/ChatInput.tsx` — full component, confirmed `useChatStore()` destructure at line 55, two render sites in ChatContainer confirmed at lines 612 and 625
- Direct code read: `src/components/chat/ChatContainer.tsx` — `handleSendMessage` code path, lines 152-351; the generic `!response.ok` throw at line 221-222; two ChatInput render sites at lines 612 and 625
- Direct code read: `src/app/api/chat/route.ts` lines 165-191 — exact 429 response contract (shipped to production 2026-04-16)
- Direct code read: `src/lib/constants.ts` — `FREE_TIER_MONTHLY_LIMIT = 10`, `UserTier` type
- Direct code read: `src/types/database.ts` lines 13-28 — `Profile` interface with `tier`, `messages_used_this_period`, `period_start`
- Direct code read: `src/components/ui/dialog.tsx` — confirmed present
- Direct code read: `src/app/(dashboard)/settings/usage/page.tsx` — profile fetch pattern
- Direct code read: `.planning/phases/02-usage-ui/02-CONTEXT.md` — all locked decisions

### Secondary (MEDIUM confidence)
- `tailwindcss-animate` presence inferred from shadcn/ui components in project using `animate-in` classes; not directly verified against package.json
- Voice mode 429 handling gap identified by reading `handleVoiceTranscript` code path

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed present in codebase
- Architecture: HIGH — integration points confirmed by direct code reads
- Pitfalls: HIGH — derived from actual code reading (the generic throw at line 221 is a fact, not speculation)
- Test infra: HIGH — confirmed no test runner exists in project

**Research date:** 2026-04-18
**Valid until:** 2026-05-18 (stable stack, no fast-moving dependencies)
