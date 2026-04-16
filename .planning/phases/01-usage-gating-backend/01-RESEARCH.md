# Phase 1: Usage Gating Backend — Research

**Researched:** 2026-04-15
**Domain:** Supabase Postgres schema migration, Next.js 16 App Router API route middleware, RLS policies
**Confidence:** HIGH — all findings drawn directly from reading the live codebase

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Error response design**
- HTTP status: Return proper HTTP `429 Too Many Requests` BEFORE opening the SSE stream. Do NOT mix the limit signal into the SSE stream.
- Response body shape (verbatim):
  ```json
  {
    "error": "message_limit_exceeded",
    "limit": 10,
    "reset_at": "2026-05-01T00:00:00Z",
    "message": "Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month.",
    "upgrade_url": "/pricing"
  }
  ```
- Block at the very next `/api/chat` request after the user hits 10.

**Counter strategy**
- Three new columns on `profiles`: `tier text NOT NULL DEFAULT 'free'`, `messages_used_this_period int NOT NULL DEFAULT 0`, `period_start date NOT NULL DEFAULT date_trunc('month', now())::date`
- Lazy reset: if `period_start < date_trunc('month', now())::date`, reset counter + update period_start in the same atomic UPDATE that increments.
- Increment timing: AFTER successful LLM response, alongside the existing `usage_logs` insert at line 634.
- Pre-check BEFORE calling the LLM. Failed/errored requests do NOT count.
- Atomic `UPDATE ... RETURNING` handles reset + increment + gate in one round-trip (exact SQL shape specified in CONTEXT.md).

**Founder accounts**
- `abhishekratna@gmail.com` and `aratnaai@gmail.com` only — `abhishekratna1@gmail.com` and `pmmsherpatest@gmail.com` are dropped.
- Mechanism: `tier = 'founder'` DB field, not an in-code email list.

**Existing user migration**
- All 155 existing users get `tier = 'free'` via column DEFAULT (no separate backfill UPDATE needed for free tier).
- Founder backfill: `UPDATE profiles SET tier = 'founder' WHERE id IN (SELECT id FROM auth.users WHERE email IN ('abhishekratna@gmail.com', 'aratnaai@gmail.com'));`
- No grace period in code.

**Free tier limit constant:** `FREE_TIER_MONTHLY_LIMIT = 10`, defined server-side in a shared config file.

**REQUIREMENTS.md update required:** GATE-03 founder list must be updated from `abhishekratna1@gmail.com` to `aratnaai@gmail.com` as part of this phase's plan.

### Claude's Discretion

- Migration filename and SQL formatting style (follow existing conventions).
- Where exactly to define `FREE_TIER_MONTHLY_LIMIT` (likely `src/lib/constants.ts`).
- Whether to remove the existing daily-limit logic at lines 108-141 (recommended: remove since monthly limit replaces it, but planner must confirm).
- Internal helper function names and module structure (e.g., `checkAndIncrementUsage()`).
- Whether Phase 2 reads usage via a `GET /api/usage` endpoint or via a response header on `/api/chat`.
- Whether to add logging for limit-hit events to Braintrust.
- TypeScript type patch shape in `src/types/database.ts`.

### Deferred Ideas (OUT OF SCOPE)

- Admin override / impersonation
- Per-minute or per-hour rate limit
- Usage observability dashboard
- Existing user notification email
- Bonus messages / referral credits
- Reconciliation job (counter vs usage_logs)
- Daily rate limit refactor is in-scope IF planner removes it; the refactor itself is not deferred but the decision is Claude's discretion

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GATE-01 | System tracks messages per user per calendar month | Atomic UPDATE on `profiles` with `messages_used_this_period` column handles this |
| GATE-02 | Free tier users are limited to 10 messages per month | `FREE_TIER_MONTHLY_LIMIT = 10` constant; UPDATE's WHERE clause gates at the limit |
| GATE-03 | Founder accounts (abhishekratna@gmail.com, aratnaai@gmail.com) bypass all limits | `tier = 'founder'` check in UPDATE's WHERE clause means founders always get a RETURNING row |
| GATE-04 | Message counter resets on the 1st of each calendar month | Lazy reset in the atomic UPDATE when `period_start < date_trunc('month', now())::date` |
| GATE-05 | System blocks message submission when monthly limit is reached | No row returned from UPDATE → return 429 before SSE stream opens |

</phase_requirements>

---

## Summary

- **Migration convention is sequential integer prefix, no timestamp.** Next migration is `016_usage_gating.sql`. SQL style uses block comments at the top, no transactional wrappers, no explicit down migrations.
- **Daily-limit code is self-contained at lines 107-142.** It uses the anon client, reads `usage_logs`, and returns an SSE-wrapped message — the wrong pattern. Phase 1 replaces this with a real 429 before the stream opens. The block can be removed cleanly.
- **`usage_logs` insert is at lines 633-645.** Post-increment goes immediately after that insert inside the same `try` block.
- **`route.ts` uses the anon/session Supabase client (not service role) for all writes.** The existing `UPDATE ... SET` pattern on `profiles` is covered by the existing RLS policy `"Users can update own profile"` which allows `auth.uid() = id`. The atomic UPDATE will pass RLS without needing `createServiceClient()`.
- **No test infrastructure exists.** Zero test files, no Jest/Vitest config, no `test` script in `package.json`. Validation plan must rely on curl smoke tests and direct Supabase SQL queries.

---

## Migration Conventions

**Location:** `supabase/migrations/`

**Naming scheme:** Sequential three-digit integer prefix, no timestamp, lowercase underscores.
- Current highest: `015_llamaparse_async.sql`
- Next migration: `016_usage_gating.sql`

**SQL style observed across migrations:**
- Block comment header: `-- Migration NNN: Brief description` followed by a sentence explaining purpose.
- No `BEGIN; ... COMMIT;` transactional wrappers — each statement runs at the top level.
- No down migration / rollback scripts. Forward-only.
- `ADD COLUMN IF NOT EXISTS` preferred for safety (see `015_llamaparse_async.sql`).
- `CREATE INDEX IF NOT EXISTS` for new indexes.
- Inline comments on columns where the purpose isn't obvious (see `014_api_cost_tracking.sql`).
- RLS policy names follow pattern: `"Users can <verb> own <table>"` or `"Service role <verb> on <table>"`.

**Migration 016 will need to:**
1. `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free'`
2. `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS messages_used_this_period int NOT NULL DEFAULT 0`
3. `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS period_start date NOT NULL DEFAULT date_trunc('month', now())::date`
4. `UPDATE profiles SET tier = 'founder' WHERE id IN (SELECT id FROM auth.users WHERE email IN ('abhishekratna@gmail.com', 'aratnaai@gmail.com'))`
5. Add an index on `(id, period_start)` for the atomic UPDATE's WHERE clause performance (profiles is small so this is optional but good hygiene).
6. No new RLS policy needed — the existing `"Users can update own profile"` policy covers the UPDATE.

---

## /api/chat Current Shape

**File:** `src/app/api/chat/route.ts`

### Auth / user lookup (lines 59-68)

```typescript
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }
```

`user.id` (UUID) and `user.email` (string) are available immediately after this block. All subsequent code in the route handler can reference `user`.

### Daily-limit block to REMOVE (lines 107-142)

```typescript
    // Rate limiting: 50 messages/day per user (admin accounts exempt)
    const DAILY_MESSAGE_LIMIT = 30
    const EXEMPT_EMAILS = [
      'aratnaai@gmail.com',
      'abhishekratna@gmail.com',
      'abhishekratna1@gmail.com',
      'pmmsherpatest@gmail.com',
    ]

    if (!EXEMPT_EMAILS.includes(user.email || '')) {
      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count, error: countError } = await (supabase.from('usage_logs') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart.toISOString())

      if (!countError && count !== null && count >= DAILY_MESSAGE_LIMIT) {
        console.log(`[RateLimit] User ${user.email} hit daily limit: ${count}/${DAILY_MESSAGE_LIMIT}`)
        const rateLimitStream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'text',
              content: "You've reached your daily limit of 30 messages. Your quota resets at midnight UTC — come back tomorrow and pick up right where you left off!"
            })}\n\n`))
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
            controller.close()
          },
        })
        return new Response(rateLimitStream, {
          headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
        })
      }
    }
```

This entire block (lines 107-142) is replaced by Phase 1's pre-check. The new monthly gate goes in its place.

### SSE stream opens (line 144-145)

```typescript
    // Create streaming response with status updates
    const stream = new ReadableStream({
      async start(controller) {
```

The pre-check 429 MUST be returned before reaching line 144. Returning from the outer `try` block (like the 401 at line 67) achieves this.

### Usage logs insert (lines 632-645)

```typescript
          // Log usage
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: usageError } = await (supabase.from('usage_logs') as any).insert({
            user_id: user.id,
            model: dbModel,
            input_tokens: usage?.inputTokens || 0,
            output_tokens: usage?.outputTokens || 0,
            latency_ms: latencyMs,
            endpoint: '/api/chat',
          })

          if (usageError) {
            console.error('Error logging usage:', usageError)
          }
```

**Post-increment location:** Immediately after line 645 (after the `usageError` log), add the atomic `UPDATE ... RETURNING` call to increment `messages_used_this_period`. This is inside the `async start(controller)` closure, inside the SSE stream's `try` block — meaning it only runs after a successful LLM response, satisfying the CONTEXT.md requirement that failed requests do not count.

**Important:** `supabase` is captured in the outer closure and is accessible here. No need to re-create the client.

### Structural note on the SSE stream

The outer `POST` function has its own `try/catch`. The SSE stream's `async start(controller)` is a nested async closure. `user` and `supabase` are closed over from the outer function and are fully accessible inside the stream closure. The `return new Response('Unauthorized', ...)` pattern at line 67 confirms that returning a `new Response(...)` from the outer `POST` function before the SSE stream is created works correctly.

---

## profiles Type Diff

**Current `Profile` interface** (`src/types/database.ts` lines 13-24):

```typescript
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_model: 'claude' | 'gemini' | 'openai';
  theme: 'light' | 'dark' | 'system';
  voice_preference: TTSVoice;
  elevenlabs_voice_id: ElevenLabsVoiceId | null;
  created_at: string;
  updated_at: string;
}
```

**Required additions:**

```typescript
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_model: 'claude' | 'gemini' | 'openai';
  theme: 'light' | 'dark' | 'system';
  voice_preference: TTSVoice;
  elevenlabs_voice_id: ElevenLabsVoiceId | null;
  // Usage gating — Phase 1
  tier: 'free' | 'founder' | 'starter';
  messages_used_this_period: number;
  period_start: string;  // ISO date string: "YYYY-MM-DD"
  created_at: string;
  updated_at: string;
}
```

**Note on `Database` type** (lines 148-188): The `Database.public.Tables.profiles` Row/Insert/Update types derive from `Profile`, so updating `Profile` automatically propagates to the Database type. However, the existing `(supabase.from('profiles') as any)` cast pattern in the codebase means TS enforcement is lax — both updating `Profile` cleanly and leaving the `as any` casts are viable approaches for the planner.

**Note on `period_start`:** The Postgres column is `date` type. Supabase returns it as a `string` in ISO format (`"2026-04-01"`). TypeScript type should be `string`, not `Date`.

---

## Constants and Helpers

**File:** `src/lib/constants.ts`

**Current shape:**
```typescript
export const SUPER_ADMIN_EMAIL = 'abhishekratna@gmail.com'
export const USE_CASES = [...] as const
export type UseCase = (typeof USE_CASES)[number]
export const isSuperAdmin = (email: string | null | undefined): boolean => { ... }
```

**Pattern:** Named exports, no default export, no wrapping object. Mix of `const` values and exported helper functions.

**Where to add the limit constant:** Add `export const FREE_TIER_MONTHLY_LIMIT = 10` to this file. It is already imported by other modules and is the established home for shared configuration values.

**Optional helper to add here:**
```typescript
export const FOUNDER_TIER = 'founder' as const
export type UserTier = 'free' | 'founder' | 'starter'
```

This avoids magic strings in the route handler and in migration validation queries. Planner's call whether to add these.

---

## HTTP Response Pattern (Non-SSE)

**Reference:** Line 67 in `route.ts` — the existing 401 pattern:

```typescript
return new Response('Unauthorized', { status: 401 })
```

This returns from the outer `POST` function before the SSE stream is created. The same pattern applies for the 429. The confirmed correct form for Next.js 16 App Router (using `next/server`'s `NextRequest` with plain `Response`):

```typescript
return new Response(
  JSON.stringify({
    error: 'message_limit_exceeded',
    limit: FREE_TIER_MONTHLY_LIMIT,
    reset_at: '<first-day-of-next-month>T00:00:00Z',
    message: 'Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month.',
    upgrade_url: '/pricing',
  }),
  {
    status: 429,
    headers: { 'Content-Type': 'application/json' },
  }
)
```

**`NextResponse` vs `Response`:** The current codebase uses the native `Response` constructor (not `NextResponse` from `next/server`) for simple responses. Both work in Next.js 16 App Router. Recommend continuing with `Response` for consistency with existing auth error responses.

**`reset_at` calculation:** First day of next calendar month at UTC midnight. Pure JS:
```typescript
const now = new Date()
const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
const resetAtIso = resetAt.toISOString() // "2026-05-01T00:00:00.000Z"
```

---

## Supabase Client / RLS Considerations

**Client used in `route.ts`:** `createClient()` from `src/lib/supabase/server.ts` — this is the **anon/session client** that authenticates via the user's JWT cookie. It is NOT the service role client.

**Why this matters for the atomic UPDATE:** The UPDATE runs as the authenticated user (`auth.uid()` = the user's UUID). The existing RLS policy on `profiles` is:

```sql
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

The atomic `UPDATE profiles ... WHERE id = $user_id` will match this policy perfectly because `auth.uid()` equals `user.id` in the session context. **No service role client is needed for the atomic UPDATE.**

**Why the existing `usage_logs` insert works:** The policy `"Service role can insert usage logs"` uses `WITH CHECK (auth.uid() = user_id)` — despite the name, it actually permits authenticated users (not just service role) to insert their own rows. The `as any` cast bypasses TS but the operation succeeds at runtime because `auth.uid() = user_id` is satisfied.

**For the new counter UPDATE:** Will work with the anon/session client. No `createServiceClient()` needed.

**RLS policy needed in migration:** The existing `"Users can update own profile"` policy already covers the new columns (policies are row-level, not column-level in Postgres). No new RLS policy is required for the counter increment.

**However:** A new RLS policy for the SELECT-only read of profiles (if Phase 2 calls `GET /api/usage`) would need the existing `"Users can read own profile"` SELECT policy — which already exists. Nothing new needed there either.

---

## Testing Conventions

**Current state:** Zero test files exist in the project. No Jest, Vitest, or Playwright config. No `test` script in `package.json` (scripts are `dev`, `build`, `start`, `lint` only).

**Implication for planning:** Do not plan tasks that write unit tests — there is no test runner installed. Validation must use alternative artifacts:

1. **SQL verification queries** — run directly in Supabase SQL editor to confirm migration applied correctly and founder backfill succeeded.
2. **curl smoke tests** — against `https://staging.pmmsherpa.com/api/chat` to confirm 429 shape, increment behavior, and founder bypass.
3. **Manual DB state inspection** — query `SELECT id, email, tier, messages_used_this_period, period_start FROM profiles` after test sends.

Plans should include these as verification steps rather than automated test assertions.

---

## Open Questions / Assumptions for Planner

1. **Remove or retain the daily-limit block?** CONTEXT.md marks this as Claude's discretion and recommends removal. The research confirms the block (lines 107-142) is self-contained and can be deleted cleanly. Recommendation: remove it entirely. If there is a concern about the daily limit serving as a separate abuse-prevention layer, note that the monthly limit of 10 messages is more restrictive than 30/day for all practical purposes.

2. **Helper function extraction vs inline code?** The pre-check + post-increment logic could live entirely inline in `route.ts` (simpler, less indirection) or be extracted to `src/lib/usage-gate.ts` (more testable if tests are added later). Given no test infrastructure exists, inline is fine for Phase 1. Planner should choose.

3. **Phase 2 contract: response header vs `GET /api/usage`?** CONTEXT.md says either works. Research shows the SSE stream's `done` event is sent at the end of streaming — adding usage data to the `done` event payload is a third option that Phase 2 could consume. Planner should pick one and document it as the Phase 2 contract.

4. **`as any` casts:** The codebase uses `(supabase.from('...') as any)` everywhere because `Database` types were not fully maintained. The planner should decide whether to update `src/types/database.ts` properly (enabling type-safe queries) or continue the `as any` pattern. Updating the type is low risk and directly serves this phase — recommended.

5. **Braintrust logging for limit hits:** CONTEXT.md says "default: log limit-hit events to console + braintrust like other events." The `btLogger` is initialized at the top of route.ts and is accessible throughout the handler. A simple `btLogger.log({ ... })` call can be added when the 429 is returned. Planner's call whether to include this in Phase 1 plans.

6. **REQUIREMENTS.md GATE-03 update:** CONTEXT.md explicitly requires updating GATE-03 from `abhishekratna1@gmail.com` to `aratnaai@gmail.com` as part of this phase's plan. This is a two-line file edit — planner should include it as a task.

---

## Validation Architecture

> `workflow.nyquist_validation` key not found in `.planning/config.json` (file does not exist) — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — no Jest/Vitest/Playwright |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

Validation for Phase 1 uses SQL queries and curl smoke tests against staging. All artifacts are listed below.

### Phase 1 Success Criteria → Validation Map

| Success Criterion | Test Type | Validation Artifact | Failure Mode Detection |
|-------------------|-----------|---------------------|----------------------|
| (a) `tier`, `messages_used_this_period`, `period_start` columns exist on `profiles` | DB schema query | `SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('tier', 'messages_used_this_period', 'period_start');` — expect 3 rows | Zero rows = migration not applied |
| (a) Founder backfill correct | DB data query | `SELECT p.email, p.tier FROM profiles p JOIN auth.users u ON p.id = u.id WHERE u.email IN ('abhishekratna@gmail.com', 'aratnaai@gmail.com');` — expect 2 rows with `tier = 'founder'` | Either row missing or tier != 'founder' |
| (b) POST /api/chat increments counter | Staging curl + DB query | Send 1 authenticated message to staging; then `SELECT messages_used_this_period FROM profiles WHERE id = '<test_user_id>'` — expect value incremented by 1 | Counter unchanged = post-increment not wired |
| (b) POST /api/chat returns 429 when limit exceeded | Staging curl smoke test | Set `messages_used_this_period = 10` for a test user via SQL; send a chat request; assert HTTP 429 with body `{"error":"message_limit_exceeded","limit":10,...}` | HTTP 200 with SSE stream = gate not firing |
| (c) Founder accounts unlimited | Staging curl smoke test | Set `messages_used_this_period = 10` for `abhishekratna@gmail.com`; send a chat request as that user; assert HTTP 200 SSE stream (not 429) | HTTP 429 = founder check not working |
| (d) Lazy reset when period_start is previous month | DB manipulation + curl | Set `period_start = '2026-03-01', messages_used_this_period = 10` for test user via SQL; send a chat request; assert HTTP 200 (not 429); then verify `SELECT period_start, messages_used_this_period FROM profiles WHERE id = '<test_user_id>'` shows `period_start = '2026-04-01'` and `messages_used_this_period = 1` | 429 returned = reset not firing; or old period_start persists = UPDATE not writing |
| (e) Free tier blocked after 10 with machine-readable error | Staging curl smoke test | Confirm 429 body contains all five required fields: `error`, `limit`, `reset_at`, `message`, `upgrade_url`; parse JSON and assert field presence | Missing fields = Phase 2 modal contract broken |

### SQL Commands for Test Setup (Staging)

```sql
-- Set a test free-tier user to the limit (replace UUID)
UPDATE profiles SET messages_used_this_period = 10 WHERE id = '<test_user_uuid>';

-- Simulate previous month to trigger reset
UPDATE profiles SET period_start = '2026-03-01', messages_used_this_period = 10 WHERE id = '<test_user_uuid>';

-- Reset test user after testing
UPDATE profiles SET messages_used_this_period = 0, period_start = date_trunc('month', now())::date WHERE id = '<test_user_uuid>';
```

### Curl Command Template

```bash
# Must have a valid session cookie from staging.pmmsherpa.com login
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://staging.pmmsherpa.com/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: <session_cookie>" \
  -d '{"message":"test","model":"claude"}'
# Expected: 429 when at limit, 200 otherwise
```

### Sampling Rate

- **Per task completion:** Run the relevant SQL verification query before marking the task done.
- **Per wave merge (before merging to staging):** Run the full curl suite against staging (all 5 criteria above).
- **Phase gate:** All 5 criteria green before `/gsd:verify-work`.

### Wave 0 Gaps

None — this phase has no test framework. All validation uses SQL queries and curl. No test files need to be created; validation artifacts are manual by design.

---

## Sources

### Primary (HIGH confidence)

All findings are from direct code reads of the live codebase:

- `src/app/api/chat/route.ts` — daily-limit block shape, auth pattern, usage_logs insert location, SSE structure, client import
- `src/types/database.ts` — Profile interface, Database type structure
- `src/lib/supabase/server.ts` — client type (anon/session vs service role)
- `src/lib/supabase/client.ts` — browser client (for Phase 2 reference)
- `src/lib/constants.ts` — constants file shape and pattern
- `supabase/migrations/001_initial_schema.sql` — profiles table origin, SQL style
- `supabase/migrations/003_rls_policies.sql` — existing profiles RLS policies, grants
- `supabase/migrations/014_api_cost_tracking.sql` — recent migration style reference
- `supabase/migrations/015_llamaparse_async.sql` — most recent migration, ADD COLUMN IF NOT EXISTS pattern
- `package.json` — confirmed no test scripts or test framework

---

## RESEARCH COMPLETE
