/**
 * Shared monthly usage gate.
 *
 * Extracted from src/app/api/chat/route.ts:154–254 so the MCP surface
 * (and any future surface) can apply the same per-tier monthly cap.
 *
 * Behavior mirrors the chat route:
 *   - Lazy reset: if `period_start` is in a prior calendar month, bring
 *     it forward and zero `messages_used_this_period` in a single update.
 *   - Founders bypass the gate entirely (Infinity limit).
 *   - Increment is via the atomic `increment_messages_used` RPC, called
 *     AFTER a successful response so failed requests don't count.
 *
 * This module uses the service-role client so it works in any server
 * runtime (web route, MCP tool handler, RPC, etc.) without depending on
 * the cookie-based auth client.
 */

import { createServiceClient } from '@/lib/supabase/server'
import { getMonthlyLimitForTier, getEffectiveTier } from '@/lib/constants'

export interface UsageGateResult {
  allowed: boolean
  tier: 'free' | 'starter' | 'founder' | string
  used: number
  limit: number
  /** ISO timestamp for the next reset (1st of next calendar month, UTC). */
  resetAt?: string
  /** Human-readable message safe to surface to the client when allowed===false. */
  errorMessage?: string
}

function computeMonthStartIso(): string {
  const currentMonthStart = new Date()
  currentMonthStart.setUTCDate(1)
  currentMonthStart.setUTCHours(0, 0, 0, 0)
  return currentMonthStart.toISOString().slice(0, 10) // "YYYY-MM-DD"
}

function computeNextResetIso(): string {
  const now = new Date()
  const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  return resetAt.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

/**
 * Check whether `userId` is allowed to consume one more message this
 * billing period. Performs a lazy reset if the stored `period_start` is
 * stale. Does NOT increment — call `incrementUsage()` after a successful
 * response.
 */
export async function checkUsageGate(userId: string): Promise<UsageGateResult> {
  const supabase = await createServiceClient()
  const currentMonthStartIso = computeMonthStartIso()

  // Lazy reset: bring period_start forward and zero the counter for any
  // row whose period_start is in a prior month. Returns the new row, or
  // null if nothing matched (i.e., we're still inside the current period).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: gateRow, error: gateError } = await (supabase.from('profiles') as any)
    .update({
      period_start: currentMonthStartIso,
      messages_used_this_period: 0,
    })
    .eq('id', userId)
    .lt('period_start', currentMonthStartIso)
    .select('tier, starter_access_until, messages_used_this_period, period_start')
    .maybeSingle()

  if (gateError) {
    console.error('[UsageGate] Lazy reset error:', gateError)
  }

  let tier: string
  let messagesUsed: number

  if (gateRow) {
    tier = getEffectiveTier(gateRow.tier, gateRow.starter_access_until)
    messagesUsed = gateRow.messages_used_this_period // 0 after reset
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profileRow, error: profileError } = await (supabase.from('profiles') as any)
      .select('tier, starter_access_until, messages_used_this_period')
      .eq('id', userId)
      .single()

    if (profileError || !profileRow) {
      console.error('[UsageGate] Failed to read profile:', profileError)
      // Fail closed but with a clear error — caller decides what to do.
      return {
        allowed: false,
        tier: 'unknown',
        used: 0,
        limit: 0,
        errorMessage: 'Could not read your usage profile. Please try again.',
      }
    }

    tier = getEffectiveTier(profileRow.tier, profileRow.starter_access_until)
    messagesUsed = profileRow.messages_used_this_period
  }

  // Founders bypass the gate.
  if (tier === 'founder') {
    return { allowed: true, tier, used: messagesUsed, limit: Infinity }
  }

  const monthlyLimit = getMonthlyLimitForTier(tier)
  if (messagesUsed >= monthlyLimit) {
    const resetAtIso = computeNextResetIso()
    const errorMessage =
      tier === 'free'
        ? 'Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month.'
        : "You've hit your monthly message cap. Your quota resets on the 1st of next month."
    return {
      allowed: false,
      tier,
      used: messagesUsed,
      limit: monthlyLimit,
      resetAt: resetAtIso,
      errorMessage,
    }
  }

  return { allowed: true, tier, used: messagesUsed, limit: monthlyLimit }
}

/**
 * Atomic counter increment. Wraps the existing
 * `increment_messages_used` Postgres RPC (migration 016). Race-safe.
 *
 * Always called AFTER a successful response. A missed increment at
 * worst gives a single free extra message; the pre-LLM gate remains the
 * authoritative blocker.
 */
export async function incrementUsage(userId: string): Promise<void> {
  const supabase = await createServiceClient()
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.rpc as any)('increment_messages_used', {
      p_user_id: userId,
    })
    if (error) {
      console.error('[UsageGate] increment_messages_used RPC failed:', error)
    }
  } catch (err) {
    console.error('[UsageGate] increment_messages_used threw:', err)
  }
}
