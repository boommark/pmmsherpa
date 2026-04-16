# Roadmap: PMM Sherpa v1.1

**Created:** 2026-04-15
**Milestone:** v1.1 — Free Tier Usage Gating & Pricing
**Phases:** 4
**Requirements covered:** 17/17

## Phases

- [~] **Phase 1: Usage Gating Backend** — DB schema, API middleware, founder exemption, monthly reset (1/2 plans complete)
- [ ] **Phase 2: Usage UI** — Counter in chat, soft warning banner, exhaustion modal
- [ ] **Phase 3: Pricing Page** — Free vs Starter comparison section on homepage
- [ ] **Phase 4: Stripe Billing** — Stripe product, checkout, webhook tier upgrade, subscription management

## Phase Details

### Phase 1: Usage Gating Backend
**Goal:** Track message usage per user per month and enforce limits in the chat API.
**Depends on:** Nothing (first phase)
**Requirements:** GATE-01, GATE-02, GATE-03, GATE-04, GATE-05

**Success Criteria** (what must be TRUE when this phase completes):
1. New `tier` and `messages_used_this_period` columns exist on the profiles table
2. POST /api/chat increments the usage counter and returns 429 when the monthly limit is exceeded
3. Founder accounts (abhishekratna@gmail.com, aratnaai@gmail.com) can send unlimited messages with no 429
4. Usage counter resets automatically when period_start is in a previous calendar month
5. Free tier users are blocked after 10 messages with a clear machine-readable error response

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — DB migration (016_usage_gating.sql) + Profile TypeScript interface extension; applied to Flytr; founder backfill verified (completed 2026-04-16, commits fb26cc0, f66d8e6)
- [ ] 01-02-PLAN.md — /api/chat monthly gate (pre-LLM 429 + post-LLM increment) + FREE_TIER_MONTHLY_LIMIT constant + REQUIREMENTS.md GATE-03 correction + staging-first ship to production

---

### Phase 2: Usage UI
**Goal:** Show users their remaining credits and guide them to upgrade when exhausted.
**Depends on:** Phase 1
**Requirements:** UI-01, UI-02, UI-03, UI-04

**Success Criteria** (what must be TRUE when this phase completes):
1. Chat input area displays "X of 10 messages remaining this month" visible to the user
2. Warning banner appears when 2 or fewer messages remain
3. Modal appears when user hits 0 messages and contains an upgrade CTA button
4. Modal CTA links to the pricing page or pricing section
5. Counter updates in real-time after each message is sent (no page refresh required)

**Plans:** TBD

---

### Phase 3: Pricing Page
**Goal:** Add a pricing section to the homepage comparing Free and Starter tiers.
**Depends on:** Phase 1
**Requirements:** PRICE-01, PRICE-02, PRICE-03

**Success Criteria** (what must be TRUE when this phase completes):
1. Homepage has a visible pricing section with Free vs Starter side-by-side comparison
2. Feature comparison table clearly shows what each tier includes (message limits, features)
3. Starter tier CTA button exists and is wired to checkout flow (or placeholder pending Phase 4)
4. Pricing section is responsive and matches the existing dark-mode design system

**Plans:** TBD

---

### Phase 4: Stripe Billing
**Goal:** Enable users to pay for Starter tier and have their account upgraded automatically.
**Depends on:** Phase 2, Phase 3
**Requirements:** BILL-01, BILL-02, BILL-03, BILL-04, BILL-05

**Success Criteria** (what must be TRUE when this phase completes):
1. Stripe product and price exist for Starter at $11.99/mo
2. User can click "Upgrade" on the pricing page and complete Stripe Checkout end-to-end
3. Webhook receives payment confirmation and updates the user's tier to "starter" in the profiles table
4. Starter tier users have higher or unlimited message allowance enforced by the gating backend
5. User can view and cancel their subscription from the settings page

**Plans:** TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Usage Gating Backend | 1/2 | Executing | - |
| 2. Usage UI | 0/? | Not started | - |
| 3. Pricing Page | 0/? | Not started | - |
| 4. Stripe Billing | 0/? | Not started | - |

---
*Roadmap created: 2026-04-15*
*Last updated: 2026-04-16 — Plan 01-01 complete (DB schema + atomic RPC live on Flytr)*
