/**
 * File Upload E2E Probe
 *
 * Verifies the full attachment pipeline end-to-end against a live deployment:
 *   storage upload → /api/upload → /api/chat SSE → model actually SEES the file.
 *
 * Two cases:
 *   image — uploads a PNG containing "CODE: VISION-7741" and asserts the model
 *           reads it via vision, on the upload turn AND on a follow-up turn
 *           where the attachment payload is NOT re-sent (the cross-turn path
 *           that regressed in Aug 2026: images fell through to a "parsing in
 *           progress" placeholder forever).
 *   pdf   — uploads a PDF containing "MOONSTONE-2288" and asserts LlamaParse
 *           extraction reaches the model, allowing one retry turn for parse
 *           latency.
 *
 * Both cases also fail on "stall phrases" ("still parsing", "hasn't loaded",
 * etc.) — the user-visible symptom of a broken pipeline.
 *
 * Usage:
 *   npx tsx evals/harness/file_upload_probe.ts [--base-url URL] [--case image|pdf|all] [--bootstrap]
 *
 * Env (read from .env.local / environment):
 *   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY   — required
 *   UPLOAD_PROBE_EMAIL     — probe user email (default upload-probe@pmmsherpa.com)
 *   UPLOAD_PROBE_PASSWORD  — probe user password (required)
 *   SUPABASE_SERVICE_ROLE_KEY — required only with --bootstrap (creates the
 *     probe user with tier=founder so it bypasses the monthly usage gate)
 *
 * Exit code 0 = all cases passed; 1 = any failure. Prints a JSON summary line
 * prefixed with "PROBE_RESULT " for cron/log scraping.
 */

import { createClient, type Session } from '@supabase/supabase-js'

// The probe uses untyped queries; keep the client loose so Next's build
// typecheck (which includes evals/) doesn't fight supabase-js generics.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any
import { config as dotenv } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname2 = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname2, '../..')
dotenv({ path: resolve(repoRoot, '.env.local') })
dotenv({ path: resolve(repoRoot, '.env') })

// ── Config ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
function argValue(flag: string): string | undefined {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}

const BASE_URL = argValue('--base-url') || process.env.UPLOAD_PROBE_BASE_URL || 'https://staging.pmmsherpa.com'
const CASE = (argValue('--case') || 'all') as 'image' | 'pdf' | 'all'
const BOOTSTRAP = args.includes('--bootstrap')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const PROBE_EMAIL = process.env.UPLOAD_PROBE_EMAIL || 'upload-probe@pmmsherpa.com'
const PROBE_PASSWORD = process.env.UPLOAD_PROBE_PASSWORD

const FIXTURES = resolve(repoRoot, 'evals/fixtures/upload-probe')
const BUCKET = 'conversation-files'
const MODEL = 'claude-sonnet'

// The user-visible symptom of a broken attachment pipeline. If the model says
// any of these, the file's content did not reach it.
const STALL_PHRASES =
  /still\s+(pars\w*|process\w*|load\w*)|haven'?t\s+(fully\s+)?(loaded|processed|finished)|is\s+(still\s+)?parsing|not\s+(yet\s+)?loaded\s+into|could\s?n[o']t\s+(read|load|see|access)\s+(the|your)\s+(file|image|document|attachment)/i

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}
if (!PROBE_PASSWORD) {
  console.error('Missing UPLOAD_PROBE_PASSWORD (set it in .env.local)')
  process.exit(1)
}

const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]

// ── Auth helpers ────────────────────────────────────────────────────────────

/**
 * Serialize the Supabase session into the cookie format @supabase/ssr expects
 * server-side: `sb-<ref>-auth-token` = "base64-" + base64url(JSON(session)),
 * chunked into `.0`, `.1`, ... suffixes when longer than 3180 chars.
 */
function buildAuthCookie(session: Session): string {
  const name = `sb-${projectRef}-auth-token`
  const encoded = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url')
  const CHUNK = 3180
  if (encoded.length <= CHUNK) return `${name}=${encoded}`
  const parts: string[] = []
  for (let i = 0; i * CHUNK < encoded.length; i++) {
    parts.push(`${name}.${i}=${encoded.slice(i * CHUNK, (i + 1) * CHUNK)}`)
  }
  return parts.join('; ')
}

async function bootstrapProbeUser() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('--bootstrap needs SUPABASE_SERVICE_ROLE_KEY')
  const admin = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } })

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: PROBE_EMAIL,
    password: PROBE_PASSWORD!,
    email_confirm: true,
  })
  let userId = created?.user?.id
  if (createErr) {
    if (!/already|exists|registered/i.test(createErr.message)) throw createErr
    // User exists — find it and reset the password so the env value works
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const existing = list?.users.find((u) => u.email === PROBE_EMAIL)
    if (!existing) throw new Error(`User ${PROBE_EMAIL} exists but not found via listUsers`)
    userId = existing.id
    await admin.auth.admin.updateUserById(userId, { password: PROBE_PASSWORD!, email_confirm: true })
  }

  // Founder tier bypasses the monthly usage gate — the probe must never eat
  // into (or be blocked by) tier limits. The profile row is normally created
  // by a signup trigger; upsert covers both cases.
  const { error: profErr } = await admin.from('profiles').upsert(
    {
      id: userId!,
      email: PROBE_EMAIL,
      full_name: 'Upload Probe (automated eval)',
      tier: 'founder',
      profile_completed: true,
      consent_given: true,
      linkedin_url: 'https://www.linkedin.com/company/pmmsherpa',
    },
    { onConflict: 'id' },
  )
  if (profErr) throw new Error(`profile upsert failed: ${profErr.message}`)
  console.log(`[bootstrap] probe user ready: ${PROBE_EMAIL} (${userId})`)
}

// ── API helpers ─────────────────────────────────────────────────────────────

type SseResult = { text: string; error: string | null; done: boolean; statuses: string[] }

async function sendChat(
  cookie: string,
  body: Record<string, unknown>,
  timeoutMs = 180_000,
): Promise<SseResult> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '')
    throw new Error(`/api/chat HTTP ${res.status}: ${text.slice(0, 300)}`)
  }
  const result: SseResult = { text: '', error: null, done: false, statuses: [] }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      let event: { type?: string; content?: string; message?: string }
      try {
        event = JSON.parse(line.slice(6))
      } catch {
        continue
      }
      if (event.type === 'text') result.text += event.content || ''
      else if (event.type === 'status') result.statuses.push(event.message || '')
      else if (event.type === 'error') result.error = event.message || 'unknown SSE error'
      else if (event.type === 'done') result.done = true
    }
  }
  return result
}

type Uploaded = { id: string; storagePath: string; processingStatus: string; objectPath: string }

async function uploadFixture(
  supabase: AnySupabase,
  cookie: string,
  userId: string,
  fixtureFile: string,
  fileType: string,
): Promise<Uploaded> {
  const bytes = readFileSync(resolve(FIXTURES, fixtureFile))
  const ext = fixtureFile.split('.').pop()
  const objectPath = `${userId}/temp/probe-${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, bytes, { contentType: fileType, upsert: false })
  if (upErr) throw new Error(`storage upload failed: ${upErr.message}`)

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      storagePath: objectPath,
      fileName: fixtureFile,
      fileType,
      fileSize: bytes.length,
      conversationId: null,
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`/api/upload HTTP ${res.status}: ${text.slice(0, 300)}`)
  }
  const data = (await res.json()) as { id: string; storagePath: string; processingStatus: string }
  return { ...data, objectPath }
}

// ── Cases ───────────────────────────────────────────────────────────────────

type CaseResult = {
  name: string
  pass: boolean
  checks: Array<{ check: string; pass: boolean; detail?: string }>
}

function check(results: CaseResult, name: string, pass: boolean, detail?: string) {
  results.checks.push({ check: name, pass, detail })
  if (!pass) results.pass = false
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
}

async function runCase(
  name: 'image' | 'pdf',
  supabase: AnySupabase,
  cookie: string,
  userId: string,
): Promise<CaseResult> {
  const result: CaseResult = { name, pass: true, checks: [] }
  console.log(`\n[case:${name}] starting against ${BASE_URL}`)

  const fixture = name === 'image' ? 'sentinel.png' : 'sentinel.pdf'
  const fileType = name === 'image' ? 'image/png' : 'application/pdf'
  const sentinel = name === 'image' ? /7741/ : /MOONSTONE|2288/i
  const firstPrompt =
    name === 'image'
      ? 'I attached an image. What is the code written in it? Reply with just the code.'
      : 'I attached our positioning brief. What is the product codename mentioned in it? Reply with just the codename.'

  // 1. Upload
  const uploaded = await uploadFixture(supabase, cookie, userId, fixture, fileType)
  check(result, 'upload accepted', !!uploaded.id, `status=${uploaded.processingStatus}`)
  check(
    result,
    'processing status sane',
    uploaded.processingStatus !== 'failed',
    uploaded.processingStatus,
  )

  // 2. Conversation
  const { data: conv, error: convErr } = await supabase.from('conversations')
    .insert({ user_id: userId, title: `[probe] file upload ${name}`, model_used: 'claude' })
    .select()
    .single()
  if (convErr || !conv) throw new Error(`conversation insert failed: ${convErr?.message}`)
  const conversationId = (conv as { id: string }).id

  const attachmentPayload = [
    {
      id: uploaded.id,
      fileName: fixture,
      fileType,
      fileSize: readFileSync(resolve(FIXTURES, fixture)).length,
      storagePath: uploaded.storagePath,
      extractedText: null,
    },
  ]

  try {
    // 3. Turn 1 — attachment payload included (upload-turn path)
    let turn1 = await sendChat(cookie, {
      message: firstPrompt,
      conversationId,
      model: MODEL,
      attachments: attachmentPayload,
    })
    check(result, 'turn1 stream completed', turn1.done && !turn1.error, turn1.error || undefined)

    let turn1Sees = sentinel.test(turn1.text)
    if (!turn1Sees && name === 'pdf' && STALL_PHRASES.test(turn1.text)) {
      // Legitimate async-parse window: LlamaParse may not finish inside the
      // first turn's 25s poll. One retry turn is allowed for the pdf case.
      console.log('  … pdf not parsed in turn1 (legit async window), retrying in 20s')
      await new Promise((r) => setTimeout(r, 20_000))
      turn1 = await sendChat(cookie, {
        message: 'What is the product codename in the positioning brief I attached? Reply with just the codename.',
        conversationId,
        model: MODEL,
      })
      turn1Sees = sentinel.test(turn1.text)
      check(result, 'pdf readable after retry turn', turn1Sees, turn1.text.slice(0, 200))
    } else {
      check(result, 'turn1 model sees file content', turn1Sees, turn1.text.slice(0, 200))
      check(result, 'turn1 no stall phrases', !STALL_PHRASES.test(turn1.text))
    }

    // 4. Turn 2 — NO attachment payload. Exercises the cross-turn path where
    // the server must recover the file from conversation_attachments. This is
    // the exact path behind the Aug 2026 "your PNG is still parsing" bug.
    const turn2 = await sendChat(cookie, {
      message:
        'Without me re-attaching anything: what was the product codename (or code, for an image) in the file I uploaded earlier in this conversation? Reply with just that.',
      conversationId,
      model: MODEL,
    })
    check(result, 'turn2 stream completed', turn2.done && !turn2.error, turn2.error || undefined)
    check(result, 'turn2 cross-turn recall works', sentinel.test(turn2.text), turn2.text.slice(0, 200))
    check(result, 'turn2 no stall phrases', !STALL_PHRASES.test(turn2.text))
  } finally {
    // 5. Cleanup — best-effort: delete attachment (removes storage object too),
    // then the conversation (messages cascade via FK).
    await fetch(`${BASE_URL}/api/upload?id=${uploaded.id}`, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    }).catch(() => {})
    await supabase.from('conversations')
      .delete()
      .eq('id', conversationId)
  }

  return result
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (BOOTSTRAP) await bootstrapProbeUser()

  const supabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } })
  const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
    email: PROBE_EMAIL,
    password: PROBE_PASSWORD!,
  })
  if (signInErr || !signIn.session) {
    throw new Error(
      `sign-in failed for ${PROBE_EMAIL}: ${signInErr?.message}. Run with --bootstrap to create the probe user.`,
    )
  }
  const cookie = buildAuthCookie(signIn.session)
  const userId = signIn.session.user.id
  console.log(`[auth] signed in as ${PROBE_EMAIL}`)

  const cases: Array<'image' | 'pdf'> = CASE === 'all' ? ['image', 'pdf'] : [CASE]
  const results: CaseResult[] = []
  for (const c of cases) {
    try {
      results.push(await runCase(c, supabase, cookie, userId))
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
