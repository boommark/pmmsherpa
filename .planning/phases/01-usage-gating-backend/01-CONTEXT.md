# Phase 1: Usage Gating Backend - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Track message usage per user per calendar month and enforce limits in the chat API (`POST /api/chat`). Adds tier and counter columns to the `profiles` table, performs the monthly reset lazily on each request, and returns a structured 429 response when the limit is hit. UI for displaying the counter and exhaustion modal lives in Phase 2 — this phase only delivers the backend contract Phase 2 will consume.

</domain>

<decisions>
## Implementation Decisions

### Error response design
- **HTTP status:** Return proper HTTP `429 Too Many Requests` BEFORE opening the SSE stream when the user is over the limit. Do NOT mix the limit signal into the SSE stream the way the current daily-limit code does at `src/app/api/chat/route.ts:128-141`.
- **Response body shape:**
  ```json
  {
    "error": "message_limit_exceeded",
    "limit": 10,
    "reset_at": "2026-05-01T00:00:00Z",
    "message": "Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month.",
    "upgrade_url": "/pricing"
  }
  ```
- **Required fields:** `error` (machine-readable code), `limit` (number), `reset_at` (ISO 8601 first day of next calendar month UTC), `message` (verbatim string the frontend renders), `upgrade_url` (string).
- **Mid-flow behavior:** Block at the very next `/api/chat` request after the user hits 10. Frontend renders an exhaustion modal that preserves conversation state (no loss of in-flight chat). When/if the user upgrades (Phase 4), they should be able to continue the same conversation seamlessly.
- **Friendly message copy (locked):** `"Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month."` Crisp, classy, no shame.

### Counter strategy
- **Storage:** Add three new columns to `profiles`:
  - `tier text NOT NULL DEFAULT 'free'` — values: `'free'`, `'founder'`, future: `'starter'`
  - `messages_used_this_period int NOT NULL DEFAULT 0`
  - `period_start date NOT NULL DEFAULT date_trunc('month', now())::date` — first day of the user's current period (always the 1st of a calendar month UTC)
- **Reset:** Lazy reset on each chat request. If `period_start < date_trunc('month', now())::date`, reset `messages_used_this_period = 0` and set `period_start` to the first of the current month — in the same atomic UPDATE that increments the counter.
- **Increment timing:** AFTER successful LLM response, alongside the existing `usage_logs` insert at `src/app/api/chat/route.ts:634`. Failed/errored requests do NOT count against the user's quota.
- **Pre-check + post-increment pattern:** Read the counter (with lazy reset applied) BEFORE calling the LLM to decide whether to return 429. Increment AFTER the LLM call succeeds.
- **Atomicity:** Use a single Postgres `UPDATE ... RETURNING` statement that handles reset + increment in one round-trip. Race-safe against concurrent requests. Suggested shape (planner can refine):
  ```sql
  UPDATE profiles
  SET
    period_start = CASE
      WHEN period_start < date_trunc('month', now())::date
      THEN date_trunc('month', now())::date
      ELSE period_start
    END,
    messages_used_this_period = CASE
      WHEN period_start < date_trunc('month', now())::date THEN 1
      ELSE messages_used_this_period + 1
    END
  WHERE id = $user_id
    AND (
      tier = 'founder'
      OR period_start < date_trunc('month', now())::date
      OR messages_used_this_period < $limit
    )
  RETURNING messages_used_this_period, tier, period_start;
  ```
  If no row returned → user is over the limit. If row returned → request proceeds.
- **Free tier limit constant:** `10` messages/month. Define as a server-side constant (e.g., `FREE_TIER_MONTHLY_LIMIT`) in a shared config file so it's referenced from one place.

### Existing user migration
- **Default tier:** All 155 existing approved users get `tier = 'free'` immediately, same rules as new users. No grace period in code — Abhishek handles communication out-of-band per STATE.md.
- **Migration mechanic:** Single Supabase migration that:
  1. Adds `tier`, `messages_used_this_period`, `period_start` columns with `DEFAULT 'free'`, `DEFAULT 0`, `DEFAULT date_trunc('month', now())::date` respectively.
  2. The DEFAULTs cause existing rows to be backfilled in the same transaction (no separate UPDATE needed for `tier` since the DEFAULT applies to existing NULL rows when the column is added with `NOT NULL DEFAULT`).
  3. Backfills founder accounts: `UPDATE profiles SET tier = 'founder' WHERE id IN (SELECT id FROM auth.users WHERE email IN ('abhishekratna@gmail.com', 'aratnaai@gmail.com'));`
- **Tier values for v1.1:** `'free'` (default, 10/mo), `'founder'` (unlimited, 2 accounts). `'starter'` will be added in Phase 4 — leave room for it but don't define yet.

### Exempt accounts list
- **Founder tier accounts (UPDATED — supersedes REQUIREMENTS.md GATE-03):**
  - `abhishekratna@gmail.com`
  - `aratnaai@gmail.com`
- **Drop from exempt list (compared to current code at `src/app/api/chat/route.ts:108-114`):**
  - `abhishekratna1@gmail.com` — was in original requirements but user has switched to aratnaai; drop it
  - `pmmsherpatest@gmail.com` — pays like everyone else for cleaner test data
- **Mechanism:** `tier = 'founder'` field in `profiles`. Gating logic checks tier — if `'founder'`, skip limit. No email list in code anywhere.
- **REQUIREMENTS.md update required:** GATE-03 currently reads `abhishekratna@gmail.com and abhishekratna1@gmail.com`. Update to `abhishekratna@gmail.com and aratnaai@gmail.com` as part of this phase's plan.

### Claude's Discretion
- Migration filename and SQL formatting style (follow existing migration conventions in the repo).
- Where exactly to define the `FREE_TIER_MONTHLY_LIMIT` constant (likely `src/lib/constants.ts` since it already exists).
- Whether to refactor the existing daily-limit logic at `src/app/api/chat/route.ts:108-141` (remove or keep alongside the monthly limit). Recommend: remove the daily limit since the monthly limit replaces its purpose, but planner should confirm there's no other use case.
- Internal helper function names and module structure (e.g., `checkAndIncrementUsage()` vs `gateChat()` vs middleware).
- Whether to expose the counter via a separate `GET /api/usage` endpoint for Phase 2 to call, OR pipe it back as a response header on `/api/chat`. Either works — Phase 2 will need it.
- Logging/observability: whether to add a new event type to existing telemetry. Default: log limit-hit events to console + braintrust like other events.
- TypeScript types in `src/types/database.ts` — must be updated to include the new columns, but exact patch shape is the planner's call.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` §"Phase 1: Usage Gating Backend" — Phase goal, 5 success criteria, requirements GATE-01 through GATE-05
- `.planning/REQUIREMENTS.md` §"Usage Gating" — full requirement text for GATE-01 through GATE-05 (NOTE: GATE-03 founder list will be updated by this phase's plan)
- `.planning/STATE.md` — current project state, key decisions, accumulated context for v1.1

### Project conventions
- `pmmsherpa/CLAUDE.md` — project context, tech stack, deploy workflow (NEVER push directly to main, always staging first), database schema reference
- `pmmsherpa/CLAUDE.md` §"Git & Deploy Workflow" — staging-first workflow that this phase's PR must follow

### Existing code that this phase modifies or replaces
- `src/app/api/chat/route.ts` §lines 108-141 — current daily rate limit implementation (the pattern this phase's monthly gate replaces / sits alongside)
- `src/app/api/chat/route.ts` §lines 630-650 — existing `usage_logs` insert (where post-increment happens alongside)
- `src/types/database.ts` §lines 145-188 — Database type, profiles table type definition (must be updated)
- `src/lib/supabase/server.ts` — server-side Supabase client used by API routes
- `src/lib/supabase/client.ts` — browser client (Phase 2 will use to read counter)
- `src/lib/constants.ts` — likely home for `FREE_TIER_MONTHLY_LIMIT`

### Reference data
- `data/usage-analysis-2026-04-14.md` — usage analysis informing the 10/month limit choice (per STATE.md)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Supabase server client** (`src/lib/supabase/server.ts`): `createClient()` returns an authenticated server client used by all API routes. Use the same pattern in any new route or helper.
- **`profiles` table**: Already exists with user metadata (theme, model pref, voice pref). Adding tier/counter columns is additive — no breaking changes.
- **`usage_logs` table**: Already inserts a row per successful chat. Counter increment can sit in the same code path right next to the existing insert at `src/app/api/chat/route.ts:634` for atomicity.
- **`src/lib/constants.ts`**: Existing module for shared constants — natural home for `FREE_TIER_MONTHLY_LIMIT`.

### Established Patterns
- **Auth check at top of API route**: `const { data: { user } } = await supabase.auth.getUser(); if (!user) return new Response('Unauthorized', { status: 401 })` — follow same pattern in any new endpoint.
- **Email-based exemption (current daily limit)**: Hardcoded array at `src/app/api/chat/route.ts:108-114`. This phase REPLACES this pattern with DB-driven `tier = 'founder'` checks.
- **SSE response stream**: Current daily-limit error is delivered as a friendly text message in the SSE stream. This phase deliberately CHANGES the pattern for monthly limits — return a real 429 HTTP response BEFORE opening the SSE stream.
- **Type any-casts on supabase.from()**: Pattern in current code (`(supabase.from('usage_logs') as any)`). Either follow the pattern or fix the type properly when updating `src/types/database.ts`.

### Integration Points
- **Single insertion point in `POST /api/chat`**: All chat requests flow through one route handler. The pre-check (return 429) goes at the top, near the existing daily-limit check. The post-increment goes near the existing `usage_logs.insert` call.
- **`profiles` row read on every request**: Already happens implicitly via `supabase.auth.getUser()` — but the explicit profile read for tier+counter is a new ~1-row SELECT or combined into the atomic UPDATE.
- **Phase 2 dependency**: Phase 2 (Usage UI) needs a way to read `messages_used_this_period` and `tier` to render the counter. Two viable hooks: (a) include current usage in the chat API's success response, (b) add `GET /api/usage` endpoint. Planner picks one.
- **Frontend chat send handler** (`src/components/chat/ChatContainer.tsx` and friends): Will need to detect HTTP 429 from `/api/chat` in Phase 2 and surface the modal — but the only Phase 1 requirement is that the contract is clear.

</code_context>

<specifics>
## Specific Ideas

- **Friendly upgrade message tone:** Classy, no shame, no anxiety. Locked copy: `"Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month."` Goes in the `message` field of the 429 response.
- **Conversation state preservation:** When the modal pops up after exhaustion, the conversation must remain intact. User should be able to upgrade and pick up exactly where they were. (Implementation lands in Phase 2 + Phase 4 — Phase 1 just must not destroy state.)
- **`reset_at` is precise:** First day of next calendar month at 00:00:00 UTC. Used by the frontend to render "Resets on May 1" or similar.

</specifics>

<deferred>
## Deferred Ideas

- **Admin override / impersonation** — granting bonus messages to a specific user from an admin UI. Belongs in a future admin-tooling phase, not v1.1.
- **Per-minute or per-hour rate limit** — separate concern from monthly quota. Could be added later if abuse patterns emerge.
- **Usage observability dashboard** — Braintrust + admin metrics page for tracking how many users hit the limit. Belongs with Phase 4 billing analytics.
- **Existing user notification email** — STATE.md confirms this is manual, not in-product. Out of scope.
- **Bonus messages / referral credits** — would need a separate credits column. Not in v1.1.
- **Reconciliation job (counter vs usage_logs)** — only needed if drift becomes a real problem. Defer until observed.
- **Daily rate limit refactor** — current 30/day limit at `src/app/api/chat/route.ts:108-141` will likely be removed when monthly gating ships. Planner should make the call; if removed, mention in plan.

</deferred>

---

*Phase: 01-usage-gating-backend*
*Context gathered: 2026-04-15*
