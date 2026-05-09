/**
 * Warm-up endpoint to keep the /api/mcp serverless function warm.
 *
 * Currently UNWIRED to a cron — Vercel Hobby plan only allows daily
 * cron jobs (verified 2026-05-09: deploy rejected with the message
 * "Hobby accounts are limited to daily cron jobs" when an every-4-min
 * schedule was configured), and once-a-day warming is useless for
 * keeping a lambda warm. The endpoint stays in the codebase so that
 * an external pinger
 * (UptimeRobot, Better Uptime, GitHub Actions, etc.) can drive it, or
 * so it can be wired to a sub-daily Vercel cron after a Pro upgrade.
 *
 * Auth: callers must send Authorization: Bearer $CRON_SECRET. No
 * unauthed pingers — keep the endpoint distinguishable from organic
 * traffic in logs.
 *
 * Deliberately does NO LLM call — burning ~$15/mo to keep the Anthropic
 * prompt cache warm via cron is wasteful given the 1h cache TTL fix in
 * helpers.ts. If post-deploy traces still show cache_create on every
 * call, revisit and add a minimal Anthropic ping here.
 */

import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest): Promise<Response> {
  const auth = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return new Response('unauthorized', { status: 401 })
  }
  return Response.json({ ok: true, ts: Date.now() })
}
