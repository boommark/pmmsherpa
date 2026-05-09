/**
 * MCP credit ledger helpers.
 *
 * The MCP credit system is INDEPENDENT from the per-tier monthly message
 * gate consumed by /api/chat (web). Web → /api/chat → checkUsageGate
 * (`messages_used_this_period`). MCP → tools/call → checkAndDeductMcpCredits
 * (`mcp_credits_*`).
 *
 * Each successful MCP tool call costs `MCP_CREDIT_COST_PER_CALL` credits.
 * Deduction order: monthly first, then purchased. The deduction itself is
 * an atomic SQL update via the `deduct_mcp_credits` RPC (migration
 * 20260507) — we never read-then-write from app code.
 *
 * Pre-call check returns `{ allowed: false }` with the structured error
 * payload if the user has < required credits BEFORE the call. The MCP
 * error envelope shape is:
 *   { code: -32000, message: 'INSUFFICIENT_CREDITS',
 *     data: { balance, required, purchase_url } }
 */

import { createServiceClient } from '@/lib/supabase/server'
import { getEffectiveTier } from '@/lib/constants'

export const MCP_CREDIT_COST_PER_CALL = 2
export const MCP_FREE_MONTHLY_LIMIT = 10
export const MCP_STARTER_MONTHLY_LIMIT = 200
export const MCP_INSUFFICIENT_CREDITS_CODE = -32000

const PURCHASE_URL = 'https://pmmsherpa.com/chat?buy_credits=true'

export interface CreditBalance {
  monthly_remaining: number
  purchased_remaining: number
  total_remaining: number
  plan: 'free' | 'starter' | 'founder' | string
}

export interface CheckResult {
  allowed: boolean
  balance: CreditBalance
  /** When `allowed === false`, structured payload to surface as MCP error.data. */
  errorData?: {
    balance: number
    required: number
    purchase_url: string
  }
}

/** Returns the per-tier monthly cap used by the reset job. */
export function monthlyLimitForPlan(plan: string): number {
  if (plan === 'starter' || plan === 'founder') return MCP_STARTER_MONTHLY_LIMIT
  return MCP_FREE_MONTHLY_LIMIT
}

/** Read-only balance fetch — used by GET /api/me/credits. */
export async function getCreditBalance(userId: string): Promise<CreditBalance | null> {
  const supabase = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('profiles') as any)
    .select(
      'tier, starter_access_until, mcp_credits_monthly_remaining, mcp_credits_purchased_remaining',
    )
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  const plan = getEffectiveTier(data.tier ?? 'free', data.starter_access_until)
  const monthly = Number(data.mcp_credits_monthly_remaining ?? 0)
  const purchased = Number(data.mcp_credits_purchased_remaining ?? 0)
  return {
    monthly_remaining: monthly,
    purchased_remaining: purchased,
    total_remaining: monthly + purchased,
    plan,
  }
}

/**
 * Pre-call check — does NOT deduct. Use to short-circuit a tool call
 * before any LLM/RAG work happens. Founders bypass entirely.
 */
export async function checkMcpCredits(
  userId: string,
  required: number = MCP_CREDIT_COST_PER_CALL,
): Promise<CheckResult> {
  const balance = await getCreditBalance(userId)
  if (!balance) {
    // Profile lookup failure → fail closed with a sensible error payload.
    return {
      allowed: false,
      balance: {
        monthly_remaining: 0,
        purchased_remaining: 0,
        total_remaining: 0,
        plan: 'unknown',
      },
      errorData: { balance: 0, required, purchase_url: PURCHASE_URL },
    }
  }

  // Founders bypass.
  if (balance.plan === 'founder') {
    return { allowed: true, balance }
  }

  if (balance.total_remaining < required) {
    return {
      allowed: false,
      balance,
      errorData: {
        balance: balance.total_remaining,
        required,
        purchase_url: PURCHASE_URL,
      },
    }
  }

  return { allowed: true, balance }
}

/**
 * Atomic deduction via the `deduct_mcp_credits(uuid, int)` RPC.
 * Returns the new balance row (with monthly + purchased) or `null` if the
 * user lacked enough credits.
 *
 * Founders are NOT skipped at the SQL level — caller must check plan first
 * (we want a single SQL path that's race-safe for everyone else). The
 * tools.ts wrapper reads balance.plan === 'founder' and skips deduction.
 */
export async function deductMcpCredits(
  userId: string,
  amount: number = MCP_CREDIT_COST_PER_CALL,
): Promise<{ monthly_remaining: number; purchased_remaining: number } | null> {
  const supabase = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('deduct_mcp_credits', {
    p_user_id: userId,
    p_amount: amount,
  })
  if (error) {
    console.error('[McpCredits] deduct_mcp_credits RPC failed:', error)
    return null
  }
  if (!Array.isArray(data) || data.length === 0) return null
  const row = data[0] as { monthly_remaining: number; purchased_remaining: number }
  return row
}

/** Convenience: build the MCP-style insufficient-credits error envelope. */
export function buildInsufficientCreditsError(check: CheckResult) {
  return {
    code: MCP_INSUFFICIENT_CREDITS_CODE,
    message: 'INSUFFICIENT_CREDITS',
    data: check.errorData ?? {
      balance: check.balance.total_remaining,
      required: MCP_CREDIT_COST_PER_CALL,
      purchase_url: PURCHASE_URL,
    },
  }
}

/**
 * Sentinel error thrown from inside a tool handler when the user has
 * insufficient credits. The route handler catches this and converts it to
 * a JSON-RPC error envelope with code=-32000, preserving the structured
 * `data` payload. Throwing (vs returning) avoids depending on tool-level
 * isError plumbing — INSUFFICIENT_CREDITS is a transport-level outcome.
 */
export class InsufficientCreditsError extends Error {
  readonly code = MCP_INSUFFICIENT_CREDITS_CODE
  readonly data: { balance: number; required: number; purchase_url: string }
  constructor(check: CheckResult) {
    super('INSUFFICIENT_CREDITS')
    this.name = 'InsufficientCreditsError'
    this.data = check.errorData ?? {
      balance: check.balance.total_remaining,
      required: MCP_CREDIT_COST_PER_CALL,
      purchase_url: PURCHASE_URL,
    }
  }
}
