/**
 * File Upload E2E Probe — core logic.
 *
 * Shared by:
 *   - evals/harness/file_upload_probe.ts      (CLI / cron probe, exit codes)
 *   - evals/braintrust/upload_pipeline.eval.ts (Braintrust experiment wrapper)
 *
 * Verifies the full attachment pipeline end-to-end against a live deployment:
 *   storage upload → /api/upload → /api/chat SSE → model actually SEES the file.
 *
 * Two cases:
 *   image — PNG containing "CODE: VISION-7741"; asserts the model reads it via
 *           vision on the upload turn AND on a follow-up turn where the
 *           attachment payload is NOT re-sent (the cross-turn path that
 *           regressed in Aug 2026: images fell through to a "parsing in
 *           progress" placeholder forever).
 *   pdf   — positioning brief containing codename "MOONSTONE-2288"; asserts
 *           LlamaParse extraction reaches the model, allowing one retry turn
 *           for parse latency.
 *
 * NOTE: fixtures and prompts are deliberately framed as PMM artifacts (a
 * positioning brief, a codename). The Sherpa persona refuses to reveal a
 * "secret code word" and deflects non-PMM asks, which false-negatives evals.
 *
 * Env (read from .env.local / environment):
 *   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY   — required
 *   UPLOAD_PROBE_EMAIL     — probe user email (default upload-probe@pmmsherpa.com)
 *   UPLOAD_PROBE_PASSWORD  — probe user password (required)
 *   SUPABASE_SERVICE_ROLE_KEY — required only for bootstrapProbeUser()
 */

import { createClient, type Session } from '@supabase/supabase-js'
import { config as dotenv } from 'dotenv'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'

// The probe uses untyped queries; keep the client loose so Next's build
// typecheck (which includes evals/) doesn't fight supabase-js generics.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any

// Braintrust's CLI bundles this file to CJS, where import.meta.url is empty —
// so locate the repo root by walking up from cwd to the nearest package.json.
// All entry points (npm scripts, braintrust eval) run from the repo root or
// below it.
function findRepoRoot(): string {
  let dir = process.cwd()
  for (let i = 0; i < 6; i++) {
    if (existsSync(resolve(dir, 'package.json'))) return dir
    dir = dirname(dir)
  }
  return process.cwd()
}
const repoRoot = findRepoRoot()
dotenv({ path: resolve(repoRoot, '.env.local') })
dotenv({ path: resolve(repoRoot, '.env') })

// ── Config ──────────────────────────────────────────────────────────────────

export const DEFAULT_BASE_URL =
  process.env.UPLOAD_PROBE_BASE_URL || 'https://staging.pmmsherpa.com'

const FIXTURES = resolve(repoRoot, 'evals/fixtures/upload-probe')
const BUCKET = 'conversation-files'
const MODEL = 'claude-sonnet'

export const PROBE_EMAIL = process.env.UPLOAD_PROBE_EMAIL || 'upload-probe@pmmsherpa.com'

// The user-visible symptom of a broken attachment pipeline. If the model says
// any of these, the file's content did not reach it.
export const STALL_PHRASES =
  /still\s+(pars\w*|process\w*|load\w*)|haven'?t\s+(fully\s+)?(loaded|processed|finished)|is\s+(still\s+)?parsing|not\s+(yet\s+)?loaded\s+into|could\s?n[o']t\s+(read|load|see|access)\s+(the|your)\s+(file|image|document|attachment)/i

function requireEnv(): { supabaseUrl: string; anonKey: string; password: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const password = process.env.UPLOAD_PROBE_PASSWORD
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  if (!password) {
    throw new Error('Missing UPLOAD_PROBE_PASSWORD (set it in .env.local)')
  }
  return { supabaseUrl, anonKey, password }
}

// ── Auth ────────────────────────────────────────────────────────────────────

/**
 * Serialize the Supabase session into the cookie format @supabase/ssr expects
 * server-side: `sb-<ref>-auth-token` = "base64-" + base64url(JSON(session)),
 * chunked into `.0`, `.1`, ... suffixes when longer than 3180 chars.
 */
function buildAuthCookie(supabaseUrl: string, session: Session): string {
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
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

/**
 * Create (or repair) the probe user. Founder tier bypasses the monthly usage
 * gate — the probe must never eat into (or be blocked by) tier limits.
 */
export async function bootstrapProbeUser(): Promise<void> {
  const { supabaseUrl, password } = requireEnv()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('bootstrap needs SUPABASE_SERVICE_ROLE_KEY')
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: PROBE_EMAIL,
    password,
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
    await admin.auth.admin.updateUserById(userId, { password, email_confirm: true })
  }

  // The profile row is normally created by a signup trigger; upsert covers
  // both cases.
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

export type ProbeSession = {
  supabase: AnySupabase
  cookie: string
  userId: string
}

/** Sign in the probe user and build the auth cookie the API routes expect. */
export async function signInProbe(): Promise<ProbeSession> {
  const { supabaseUrl, anonKey, password } = requireEnv()
  const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })
  const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
    email: PROBE_EMAIL,
    password,
  })
  if (signInErr || !signIn.session) {
    throw new Error(
      `sign-in failed for ${PROBE_EMAIL}: ${signInErr?.message}. Run the CLI with --bootstrap to create the probe user.`,
    )
  }
  console.log(`[auth] signed in as ${PROBE_EMAIL}`)
  return {
    supabase,
    cookie: buildAuthCookie(supabaseUrl, signIn.session),
    userId: signIn.session.user.id,
  }
}

// ── API helpers ─────────────────────────────────────────────────────────────

type SseResult = { text: string; error: string | null; done: boolean; statuses: string[] }

async function sendChat(
  baseUrl: string,
  cookie: string,
  body: Record<string, unknown>,
  timeoutMs = 180_000,
): Promise<SseResult> {
  const res = await fetch(`${baseUrl}/api/chat`, {
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
  baseUrl: string,
  session: ProbeSession,
  fixtureFile: string,
  fileType: string,
): Promise<Uploaded> {
  const bytes = readFileSync(resolve(FIXTURES, fixtureFile))
  const ext = fixtureFile.split('.').pop()
  const objectPath = `${session.userId}/temp/probe-${Date.now()}.${ext}`

  const { error: upErr } = await session.supabase.storage
    .from(BUCKET)
    .upload(objectPath, bytes, { contentType: fileType, upsert: false })
  if (upErr) throw new Error(`storage upload failed: ${upErr.message}`)

  const res = await fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: session.cookie },
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

export type ProbeCase = 'image' | 'pdf'

export type CaseCheck = { check: string; pass: boolean; detail?: string }

export type CaseResult = {
  name: string
  pass: boolean
  checks: CaseCheck[]
}

function check(results: CaseResult, name: string, pass: boolean, detail?: string) {
  results.checks.push({ check: name, pass, detail })
  if (!pass) results.pass = false
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
}

export async function runCase(
  name: ProbeCase,
  session: ProbeSession,
  baseUrl: string = DEFAULT_BASE_URL,
): Promise<CaseResult> {
  const result: CaseResult = { name, pass: true, checks: [] }
  console.log(`\n[case:${name}] starting against ${baseUrl}`)

  const fixture = name === 'image' ? 'sentinel.png' : 'sentinel.pdf'
  const fileType = name === 'image' ? 'image/png' : 'application/pdf'
  const sentinel = name === 'image' ? /7741/ : /MOONSTONE|2288/i
  const firstPrompt =
    name === 'image'
      ? 'I attached an image. What is the code written in it? Reply with just the code.'
      : 'I attached our positioning brief. What is the product codename mentioned in it? Reply with just the codename.'

  // 1. Upload
  const uploaded = await uploadFixture(baseUrl, session, fixture, fileType)
  check(result, 'upload accepted', !!uploaded.id, `status=${uploaded.processingStatus}`)
  check(
    result,
    'processing status sane',
    uploaded.processingStatus !== 'failed',
    uploaded.processingStatus,
  )

  // 2. Conversation
  const { data: conv, error: convErr } = await session.supabase
    .from('conversations')
    .insert({ user_id: session.userId, title: `[probe] file upload ${name}`, model_used: 'claude' })
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
    let turn1 = await sendChat(baseUrl, session.cookie, {
      message: firstPrompt,
      conversationId,
      model: MODEL,
      attachments: attachmentPayload,
    })
    check(result, 'turn1 stream completed', turn1.done && !turn1.error, turn1.error || undefined)

    let turn1Sees = sentinel.test(turn1.text)
    if (!turn1Sees && name === 'pdf') {
      // Legitimate async-parse window: LlamaParse may not finish inside the
      // first turn's 25s poll (and the model doesn't always announce the wait
      // with a recognizable stall phrase). One retry turn for the pdf case.
      console.log('  … pdf sentinel missing in turn1 (async parse window), retrying in 20s')
      await new Promise((r) => setTimeout(r, 20_000))
      turn1 = await sendChat(baseUrl, session.cookie, {
        message:
          'What is the product codename in the positioning brief I attached? Reply with just the codename.',
        conversationId,
        model: MODEL,
      })
      turn1Sees = sentinel.test(turn1.text)
      check(result, 'turn1 model sees file content', turn1Sees, turn1.text.slice(0, 200))
    } else {
      check(result, 'turn1 model sees file content', turn1Sees, turn1.text.slice(0, 200))
      check(result, 'turn1 no stall phrases', !STALL_PHRASES.test(turn1.text))
    }

    // 4. Turn 2 — NO attachment payload. Exercises the cross-turn path where
    // the server must recover the file from conversation_attachments. This is
    // the exact path behind the Aug 2026 "your PNG is still parsing" bug.
    const turn2 = await sendChat(baseUrl, session.cookie, {
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
    await fetch(`${baseUrl}/api/upload?id=${uploaded.id}`, {
      method: 'DELETE',
      headers: { Cookie: session.cookie },
    }).catch(() => {})
    await session.supabase.from('conversations').delete().eq('id', conversationId)
  }

  return result
}
