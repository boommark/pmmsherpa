/**
 * Shared helpers for MCP server tests.
 *
 * Loads .env.local, mints a real Supabase JWT for a test user via the
 * service-role admin API, exposes utilities for JSON-RPC over HTTP and
 * PKCE crypto.
 */

import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'
import crypto from 'node:crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

dotenvConfig({ path: path.resolve(process.cwd(), '.env.local') })

export const BASE_URL = process.env.MCP_TEST_BASE_URL ?? 'http://localhost:3000'
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE || !ANON) {
  throw new Error('Missing Supabase env vars in .env.local')
}

export const TEST_EMAIL_PRIMARY = `mcp-test-${Date.now()}-a@pmmsherpa-tests.local`
export const TEST_EMAIL_SECOND = `mcp-test-${Date.now()}-b@pmmsherpa-tests.local`
export const TEST_PASSWORD = 'McpTest!Pass#' + crypto.randomBytes(8).toString('hex')

interface TestUser {
  userId: string
  email: string
  accessToken: string
  refreshToken: string
}

/* -------------------------------------------------- */
/*  Test counter / reporter                           */
/* -------------------------------------------------- */
export class Reporter {
  passed = 0
  failed = 0
  skipped = 0
  failures: string[] = []

  pass(name: string) {
    this.passed++
    console.log(`  PASS: ${name}`)
  }
  fail(name: string, reason: string) {
    this.failed++
    this.failures.push(`${name}: ${reason}`)
    console.log(`  FAIL: ${name}: ${reason}`)
  }
  skip(name: string, reason: string) {
    this.skipped++
    console.log(`  SKIP: ${name}: ${reason}`)
  }
  summary(category: string) {
    console.log(
      `\n[${category}] passed=${this.passed} failed=${this.failed} skipped=${this.skipped}`,
    )
  }
}

/** Wrap an assertion so a throw becomes a structured fail. */
export async function check(
  reporter: Reporter,
  name: string,
  fn: () => Promise<void> | void,
): Promise<void> {
  try {
    await fn()
    reporter.pass(name)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    reporter.fail(name, msg)
  }
}

/* -------------------------------------------------- */
/*  User management                                   */
/* -------------------------------------------------- */
const adminClient: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const createdUserIds: string[] = []

export async function createTestUser(email: string): Promise<TestUser> {
  // Create user with email_confirm so password sign-in works immediately.
  const { data: created, error: cErr } = await adminClient.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  })
  if (cErr || !created.user) {
    throw new Error(`createUser failed: ${cErr?.message ?? 'no user'}`)
  }
  createdUserIds.push(created.user.id)

  // Sign in with anon client to receive a real Supabase access token (JWT).
  const anonClient = createClient(SUPABASE_URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: session, error: sErr } = await anonClient.auth.signInWithPassword({
    email,
    password: TEST_PASSWORD,
  })
  if (sErr || !session.session) {
    throw new Error(`signIn failed: ${sErr?.message ?? 'no session'}`)
  }
  return {
    userId: created.user.id,
    email,
    accessToken: session.session.access_token,
    refreshToken: session.session.refresh_token,
  }
}

export async function deleteAllTestUsers(): Promise<void> {
  for (const id of createdUserIds) {
    await adminClient.auth.admin.deleteUser(id).catch(() => undefined)
  }
}

/* -------------------------------------------------- */
/*  HTTP helpers                                      */
/* -------------------------------------------------- */
export interface RpcResponse {
  status: number
  headers: Headers
  body: any
  rawText: string
}

export async function postRpc(
  payload: unknown,
  opts: {
    token?: string
    sessionId?: string
    rawBody?: string
  } = {},
): Promise<RpcResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`
  if (opts.sessionId) headers['mcp-session-id'] = opts.sessionId

  const body = opts.rawBody ?? JSON.stringify(payload)
  const res = await fetch(`${BASE_URL}/api/mcp`, {
    method: 'POST',
    headers,
    body,
  })
  const rawText = await res.text()
  let parsed: any = null
  try {
    parsed = rawText ? JSON.parse(rawText) : null
  } catch {
    parsed = null
  }
  return { status: res.status, headers: res.headers, body: parsed, rawText }
}

export async function initializeSession(token: string): Promise<string> {
  const res = await postRpc(
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'mcp-test-client', version: '0.0.1' },
      },
    },
    { token },
  )
  if (res.status !== 200) {
    throw new Error(`initialize failed: status=${res.status} body=${res.rawText}`)
  }
  const sid = res.headers.get('mcp-session-id')
  if (!sid) throw new Error('initialize did not return mcp-session-id header')
  return sid
}

/* -------------------------------------------------- */
/*  PKCE helpers                                      */
/* -------------------------------------------------- */
export function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
export function genPkcePair(): { verifier: string; challenge: string } {
  const verifier = base64url(crypto.randomBytes(48)).slice(0, 64)
  const challenge = base64url(
    crypto.createHash('sha256').update(verifier).digest(),
  )
  return { verifier, challenge }
}

/* -------------------------------------------------- */
/*  Direct DB access via service role                 */
/* -------------------------------------------------- */
export function getServiceClient(): SupabaseClient {
  return adminClient
}

/* -------------------------------------------------- */
/*  Sleep                                             */
/* -------------------------------------------------- */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
