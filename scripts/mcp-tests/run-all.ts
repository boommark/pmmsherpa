/**
 * Orchestrator: runs MCP transport / OAuth / tracing integration tests
 * against a live dev server. Reports pass/fail counts and cleans up
 * test users at the end.
 *
 * Tool-handler tests (search_corpus, ask_sherpa, get_feedback,
 * draft_artifact) live in src/lib/mcp/__tests__/ and run via Vitest:
 *   npx vitest run
 *
 * Usage:
 *   ./node_modules/.bin/tsx scripts/mcp-tests/run-all.ts
 */

import { runTransportTests } from './transport.test'
import { runOAuthTests } from './oauth.test'
import { runTracingTests } from './tracing.test'
import { deleteAllTestUsers, BASE_URL } from './helpers'

async function ensureServerUp() {
  try {
    const res = await fetch(BASE_URL, { method: 'HEAD' })
    if (!res.ok && res.status !== 405) {
      throw new Error(`server returned ${res.status}`)
    }
  } catch (e) {
    console.error(`Dev server at ${BASE_URL} unreachable — start it with: npm run dev`)
    throw e
  }
}

async function main() {
  await ensureServerUp()
  const all = [
    await runTransportTests().catch((e) => {
      console.error('transport tests crashed:', e)
      return null
    }),
    await runOAuthTests().catch((e) => {
      console.error('oauth tests crashed:', e)
      return null
    }),
    await runTracingTests().catch((e) => {
      console.error('tracing tests crashed:', e)
      return null
    }),
  ]
  await deleteAllTestUsers()

  let p = 0,
    f = 0,
    s = 0
  const failures: string[] = []
  for (const r of all) {
    if (!r) {
      f++
      continue
    }
    p += r.passed
    f += r.failed
    s += r.skipped
    failures.push(...r.failures)
  }
  console.log('\n========================================')
  console.log(`Total: passed=${p}  failed=${f}  skipped=${s}`)
  if (failures.length) {
    console.log('\nFailures:')
    for (const msg of failures) console.log(`  - ${msg}`)
  }
  console.log('========================================')
  process.exit(f > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  deleteAllTestUsers().finally(() => process.exit(1))
})
