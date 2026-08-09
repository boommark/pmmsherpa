/**
 * File Upload E2E Probe — CLI runner.
 *
 * Thin wrapper around evals/harness/upload_probe_core.ts for cron / manual
 * runs. For Braintrust-tracked runs (experiment history, cross-run
 * comparison), use: npm run eval:uploads:braintrust
 *
 * Usage:
 *   npm run eval:uploads          # staging
 *   npm run eval:uploads:prod     # production
 *   npx tsx evals/harness/file_upload_probe.ts [--base-url URL] [--case image|pdf|all] [--bootstrap]
 *
 * Exit code 0 = all cases passed; 1 = any failure. Prints a JSON summary line
 * prefixed with "PROBE_RESULT " for cron/log scraping.
 */

import {
  DEFAULT_BASE_URL,
  bootstrapProbeUser,
  signInProbe,
  runCase,
  type CaseResult,
  type ProbeCase,
} from './upload_probe_core.js'

const args = process.argv.slice(2)
function argValue(flag: string): string | undefined {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}

const BASE_URL = argValue('--base-url') || DEFAULT_BASE_URL
const CASE = (argValue('--case') || 'all') as ProbeCase | 'all'
const BOOTSTRAP = args.includes('--bootstrap')

async function main() {
  if (BOOTSTRAP) await bootstrapProbeUser()

  const session = await signInProbe()

  const cases: ProbeCase[] = CASE === 'all' ? ['image', 'pdf'] : [CASE]
  const results: CaseResult[] = []
  for (const c of cases) {
    try {
      results.push(await runCase(c, session, BASE_URL))
    } catch (err) {
      console.error(`[case:${c}] threw:`, err)
      results.push({
        name: c,
        pass: false,
        checks: [{ check: 'case ran without throwing', pass: false, detail: String(err) }],
      })
    }
  }

  const allPass = results.every((r) => r.pass)
  console.log(
    '\nPROBE_RESULT ' +
      JSON.stringify({
        ok: allPass,
        baseUrl: BASE_URL,
        at: new Date().toISOString(),
        cases: results.map((r) => ({
          name: r.name,
          pass: r.pass,
          failed: r.checks.filter((c) => !c.pass).map((c) => c.check),
        })),
      }),
  )
  process.exit(allPass ? 0 : 1)
}

main().catch((err) => {
  console.error('Probe crashed:', err)
  console.log(
    'PROBE_RESULT ' + JSON.stringify({ ok: false, baseUrl: BASE_URL, crash: String(err) }),
  )
  process.exit(1)
})
