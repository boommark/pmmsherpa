# MCP Server Test Suite

Canonical test suite for the PMM Sherpa MCP server. Every new MCP tool MUST pass categories 1, 2, 4, 5, 6, 8, and 9 before merge to `main`. Categories 3 (auth) and 7 (live smoke) gate prod deploys.

## Categories

| # | File | Gate | What it guarantees |
|---|---|---|---|
| 1 | `schema.test.ts` | merge | Public registry has exactly 3 tools, no deprecated names, valid JSON Schema. |
| 2 | `input-validation.test.ts` | merge | Every handler returns a structured error envelope on bad input — never throws. |
| 3 | `auth.test.ts` | deploy | Bearer token extraction + JWT verification reject malformed/expired/missing tokens. Cross-user session takeover guarded at route layer. |
| 4 | `usage-gate.test.ts` | merge | When the monthly cap is hit, every tool returns `error: 'message_limit_exceeded'` with `tier`/`used`/`limit`/`reset_at`. `incrementUsage` is NOT called. |
| 5 | `empty-corpus.test.ts` | merge | When retrieval returns no chunks, handler returns friendly text + `empty_corpus: true`. Usage is NOT incremented. |
| 6 | `handlers.test.ts` | merge | With LLM mocked, every tool returns the right structured envelope. `draft_artifact` injects template `systemPromptFragment`. `get_feedback` passes `intentOverride: 'review'`. |
| 7 | `live-smoke.test.ts` | deploy | Skipped without `PMM_LIVE=1`. Hits staging via real HTTP — `tools/list` returns 3, every tool completes < 30s. |
| 8 | `golden.test.ts` | merge | Inline-snapshot of structuredContent shape (key set + types). Catches envelope drift. |
| 9 | `prompt-injection.test.ts` | merge | Locks in 12 attack fixtures across 10 categories. Every new tool inherits these — no merge without exercising them. |

## Adding a new tool

1. Add the tool to `src/lib/mcp/tools.ts`.
2. Add its name to the expected list in `schema.test.ts` and update the count.
3. Add a row to `VALID_INPUTS` in `usage-gate.test.ts` and `handlers.test.ts`.
4. Add the new tool to the `appliesTo` array of every relevant fixture in `fixtures/prompt-injection.ts`. If a new attack class is needed, add it (and update the category-coverage assertion in `prompt-injection.test.ts`).
5. Add a structural snapshot in `golden.test.ts`.
6. If the tool consumes the usage gate, no extra wiring needed — usage-gate.test.ts iterates over the canonical tool list.
7. If the tool needs auth at a different layer than the route handler, add a test in `auth.test.ts`.

See `RUN.md` for how to execute each category.
