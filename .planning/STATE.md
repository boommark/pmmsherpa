---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: "Free Tier Usage Gating & Pricing"
current_phase: 01
current_plan: 2
total_plans_in_phase: 2
status: executing
last_updated: "2026-04-16T04:42:34Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 2
  completed_plans: 1
---

# State

## Current Position

Phase: 01 (usage-gating-backend) — EXECUTING
Current Plan: 2 of 2 (01-01 complete, 01-02 next)
Status: Plan 01-01 complete, ready for Plan 01-02
Last activity: 2026-04-16 — Plan 01-01 complete (DB migration + RPC + TS types)

Progress: [##--------] 12.5% (1/8 plans complete across 4 phases; 1/2 in Phase 01)

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-15)

**Core value:** Expert GTM advisory grounded in the world's best practitioner knowledge, available the moment you need it.
**Current focus:** Phase 01 — usage-gating-backend, Plan 02 (chat API monthly gate)
**Current phase:** 01
**Next action:** Run /gsd:execute-plan 01-02 (on feature/phase-01-usage-gating branch)

## Performance Metrics

- Requirements defined: 17
- Phases planned: 4
- Phases complete: 0/4
- Plans complete: 1/8 (01-01)
- Requirements completed: 3/17 (GATE-01, GATE-03, GATE-04 — partially; fully gated by Plan 02 shipping to prod)

| Plan | Duration | Tasks | Files | Completed |
|------|----------|-------|-------|-----------|
| 01-01 | ~15 min | 3 | 2 | 2026-04-16 |

## Accumulated Context

- Usage analysis completed (data/usage-analysis-2026-04-14.md)
- MCP server technical research completed (MCP_SERVER_TECHNICAL_RESEARCH.md)
- Credit pricing strategy defined: $0.20/credit PAYG, packs at $15/$49/$99
- Logo banner shipped to production (35 company SVGs)
- Homepage subheadline updated to: "The world's best GTM knowledge, brought to life and ready to work with you."
- Existing `usage_logs` table in Supabase tracks model, tokens, latency per message (available for reference)
- Stripe API key available, no products created yet
- Live profile count in Flytr: **205 total** (STATE previously noted 155 — stale); 2 founders + 203 free after Plan 01-01 applied
- Migration 016 (tier / messages_used_this_period / period_start columns + founder backfill + increment_messages_used RPC + idx_profiles_period_start) applied live to Flytr on 2026-04-16
- Feature branch `feature/phase-01-usage-gating` branched off `staging`, Plan 02 continues on same branch (not yet pushed)

## Key Decisions

- Free tier: 10 messages/month per user
- Reset: Calendar month (1st of each month), simpler than rolling 30-day window
- Pricing: $11.99/mo Starter tier
- **Founder exempt (CORRECTED in Plan 01-01):** `abhishekratna@gmail.com` and `aratnaai@gmail.com`. Supersedes older list that had `abhishekratna1@gmail.com`. Plan 02 will update REQUIREMENTS.md GATE-03 to reflect this.
- `pmmsherpatest@gmail.com` is NOT exempt (pays like everyone else for cleaner test data)
- Billing: Stripe (API key available, no products created yet)
- **Atomic RPC for concurrent safety:** Use `increment_messages_used(uuid)` Postgres function instead of JS-side read-modify-write for counter bumps (race-safe)
- **Founder-skip inside the RPC:** `WHERE tier != 'founder'` is in the SQL function itself, so `/api/chat` can blindly call the RPC after every successful LLM response without branching on tier
- **`tier` union includes `'starter'`** in the TS type now, even though Phase 1 only uses `'free'|'founder'` — leaves room for Phase 4 without another type migration
- **`period_start` typed as `string`** (ISO date), not `Date` — Supabase returns Postgres `date` columns as `"YYYY-MM-DD"` strings

## Issues / Blockers

- None active. STATE.md's previous "155 approved users" figure was stale — actual count is 205 (per DB at 2026-04-16). Does not affect migration correctness.

## Session Continuity

- Roadmap: .planning/ROADMAP.md
- Requirements: .planning/REQUIREMENTS.md
- Project: .planning/PROJECT.md
- Stack: Next.js 16, Supabase PostgreSQL, Vercel, Tailwind + shadcn/ui
- Staging workflow: feature branch → staging → main (never push directly to main)
- Supabase project: Flytr (ogbjdvnkejkqqebyetqx)
- Active working branch: `feature/phase-01-usage-gating` (off staging; 2 commits ahead; not pushed)
- Last session: 2026-04-16 — stopped at Plan 01-01 complete, ready for Plan 01-02

---
*State initialized: 2026-04-15*
*Last updated: 2026-04-16 — Plan 01-01 complete, DB schema + RPC live on Flytr*
