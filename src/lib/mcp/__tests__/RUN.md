# Running the MCP Test Suite

## Prerequisites

**Vitest is NOT yet installed in `package.json`.** Add it before the first run:

```bash
npm install -D vitest @vitest/ui
```

Add to `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui"
}
```

Create `vitest.config.ts` at the repo root:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    exclude: ['scripts/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## Run everything (mocked, fast)

```bash
npm test
```

Categories 1, 2, 3, 4, 5, 6, 8, and 9 run with no external API calls. Live-smoke (category 7) is skipped by default.

## Run a single category

```bash
npm test -- schema             # category 1
npm test -- input-validation   # category 2
npm test -- auth               # category 3
npm test -- usage-gate         # category 4
npm test -- empty-corpus       # category 5
npm test -- handlers           # category 6
npm test -- live-smoke         # category 7  (only with PMM_LIVE=1)
npm test -- golden             # category 8
npm test -- prompt-injection   # category 9
```

## Run live smoke against staging

```bash
PMM_LIVE=1 \
STAGING_URL="https://staging.pmmsherpa.com" \
STAGING_TOKEN="<a valid Supabase access token>" \
npm test -- live-smoke
```

Without `PMM_LIVE=1`, the file's `describe.skip` swallows it.

To get a `STAGING_TOKEN`, sign in at staging.pmmsherpa.com and copy the access token from `localStorage` (key: `sb-<project>-auth-token`), or use the `/api/test/issue-token` dev helper if available.

## What each category guarantees (one-liner)

| Category | Guarantee |
|---|---|
| 1 schema | Registry shape — exactly 3 tools, valid JSON Schema, no deprecated names. |
| 2 input-validation | Every handler returns a structured error envelope on bad input; never throws. |
| 3 auth | Bearer token verification rejects bad tokens; cross-user takeover blocked. |
| 4 usage-gate | Monthly cap returns `message_limit_exceeded`; no LLM call, no usage increment. |
| 5 empty-corpus | Empty retrieval returns friendly text + `empty_corpus: true`; no usage increment. |
| 6 handlers | Mocked LLM → correct envelope; templates and intents wired right. |
| 7 live-smoke | Staging server actually responds; 3 tools listed; every tool finishes < 30s. |
| 8 golden | structuredContent shape stable across releases (inline snapshot). |
| 9 prompt-injection | Hostile inputs across 10 attack classes don't crash, leak, or smuggle tool calls. |

## Categories that will FAIL until Agent A's rename ships

The tests target the NEW names — `ask_sherpa`, `draft_artifact`, `get_feedback`. Until `tools.ts` exports these names (in lieu of `query_pmm_sherpa`, `validate_artifact`, and adds `draft_artifact`):

- **1 schema** — fails. Asserts the registry contains exactly the new names.
- **2 input-validation** — fails (most assertions short-circuit on `if (!t) return`, but draft_artifact tests will produce zero coverage and that's caught by the schema test).
- **4 usage-gate** — fails. Iterates over the new tool names.
- **5 empty-corpus** — fails for `ask_sherpa` and `get_feedback` because lookup is by new name.
- **6 handlers** — fails. Asserts on `intentOverride: 'review'` for `get_feedback` (old name was `validate_artifact`); asserts `draft_artifact` exists.
- **8 golden** — fails. New names not in registry yet.
- **9 prompt-injection** — fails because every fixture targets the new names.

Categories that PASS today (against unrenamed code):

- **3 auth** — independent of tool names.

Once the rename ships, all 9 categories should pass mocked. Then run category 7 against staging.

## CI integration (suggested)

```yaml
# .github/workflows/mcp-tests.yml
- run: npm install
- run: npm test  # categories 1-6, 8, 9 — gates merge to main
- run: npm test -- live-smoke
  env:
    PMM_LIVE: '1'
    STAGING_TOKEN: ${{ secrets.STAGING_TOKEN }}
  if: github.event_name == 'push' && github.ref == 'refs/heads/staging'
```

## Troubleshooting

- **"Cannot find module '@/...'"** — vitest config alias not set. See `vitest.config.ts` above.
- **"jose is not defined"** — auth.test.ts mocks `../jwks` but uses real `jose`; ensure jose is installed (it is — see `package.json`).
- **Inline snapshot mismatch in `golden.test.ts`** — run `npm test -- golden -u` to update once you've reviewed the diff.
- **prompt-injection tests pass even though my handler echoes attack text** — that's deliberate. We test envelope integrity, not LLM refusal. See category 9 docs.
