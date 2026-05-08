/**
 * GET /api/cron/reset-monthly-credits
 *
 * Daily cron endpoint (Vercel Cron) that resets each user's monthly MCP
 * credit bucket if `mcp_credits_month_start < now() - interval '1 month'`.
 * Per-user reset cap depends on their effective tier:
 *   free    → 10
 *   starter → 200
 *   founder → 200 (matches starter; founder bypass is enforced in app code)
 *
 * Purchased credits are NOT touched here — they roll forever.
 *
 * Auth: optional CRON_SECRET. If env var is set, the request must include
 * `Authorization: Bearer $CRON_SECRET` (Vercel's standard pattern).
 *
 * Idempotency: the SQL filter on month_start guarantees a user is reset
 * at most once per ~month. Running the cron twice in the same hour is a
 * no-op for users already inside their fresh window.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  MCP_FREE_MONTHLY_LIMIT,
  MCP_STARTER_MONTHLY_LIMIT,
} from '@/lib/mcp/credits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface DueRow {
  id: string
  tier: string | null
  starter_access_until: string | null
}

function effectivePlanForReset(tier: string | null, starterUntil: string | null): 'free' | 'starter' | 'founder' {
  if (tier === 'founder') return 'founder'
  if (tier === 'starter') return 'starter'
  if (starterUntil && new Date(starterUntil) > new Date()) return 'starter'
  return 'free'
}

function resetCapForPlan(plan: 'free' | 'starter' | 'founder'): number {
  if (plan === 'starter' || plan === 'founder') return MCP_STARTER_MONTHLY_LIMIT
  return MCP_FREE_MONTHLY_LIMIT
}

export async function GET(request: NextRequest) {
  // Optional bearer auth — only enforced when CRON_SECRET is configured.
  const expected = process.env.CRON_SECRET
  if (expected) {
    const auth = request.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = await createServiceClient()
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Find users whose month_start is older than 30 days. We re-bucket by
  // effective plan in app code (rather than a giant SQL CASE) so the
  // logic mirrors getEffectiveTier() exactly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dueRows, error: selectErr } = await (supabase.from('profiles') as any)
    .select('id, tier, starter_access_until')
    .lt('mcp_credits_month_start', cutoff)
    .limit(5000) // safety cap

  if (selectErr) {
    console.error('[cron/reset-monthly-credits] select failed:', selectErr)
    return NextResponse.json({ error: 'select failed' }, { status: 500 })
  }

  const rows = (dueRows ?? []) as DueRow[]
  const nowIso = new Date().toISOString()

  let resetFree = 0
  let resetStarter = 0
  let errors = 0

  for (const row of rows) {
    const plan = effectivePlanForReset(row.tier, row.starter_access_until)
    const cap = resetCapForPlan(plan)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updErr } = await (supabase.from('profiles') as any)
      .update({
        mcp_credits_monthly_remaining: cap,
        mcp_credits_month_start: nowIso,
      })
      .eq('id', row.id)
      // Re-check the cutoff inside the UPDATE so concurrent cron runs
      // collapse to a single reset per user.
      .lt('mcp_credits_month_start', cutoff)
    if (updErr) {
      console.error(`[cron/reset-monthly-credits] update failed for ${row.id}:`, updErr)
      errors += 1
      continue
    }
    if (plan === 'free') resetFree += 1
    else resetStarter += 1
  }

  return NextResponse.json({
    ok: true,
    candidates: rows.length,
    reset_free: resetFree,
    reset_starter: resetStarter,
    errors,
  })
}
