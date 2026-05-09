/**
 * Warm-up endpoint hit by Vercel Cron every 4 minutes to keep the
 * /api/mcp serverless function warm (avoid cold-start latency on the
 * next real ask_sherpa call).
 *
 * Auth: Vercel Cron requests carry a bearer token matching CRON_SECRET.
 * Anyone else gets 401 — this endpoint must not be a public health probe
 * because it shares the same lambda pool as /api/mcp and we want to
 * count warmup invocations distinctly in logs.
 *
 * The endpoint deliberately does NO LLM call — that would burn ~$15/mo
 * just to keep the Anthropic prompt cache alive, and the 1h cache TTL
 * (helpers.ts) plus organic traffic should cover normal usage. If the
 * cache_create rate stays high after the TTL change, revisit and add a
 * minimal Anthropic ping here.
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
