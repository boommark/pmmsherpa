/**
 * Tests for the MCP credit ledger helpers (src/lib/mcp/credits.ts).
 *
 * Covers:
 *   - getCreditBalance returns the right shape and resolves plan via
 *     getEffectiveTier (starter_access_until handling).
 *   - checkMcpCredits short-circuits founders, denies free users at zero
 *     balance, and emits the structured errorData payload.
 *   - deductMcpCredits delegates to the deduct_mcp_credits RPC and
 *     surfaces null on insufficient balance.
 *   - InsufficientCreditsError carries code -32000 + structured data.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const { fromMock, rpcMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  rpcMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(async () => ({
    from: fromMock,
    rpc: rpcMock,
  })),
}))

import {
  checkMcpCredits,
  deductMcpCredits,
  getCreditBalance,
  InsufficientCreditsError,
  MCP_CREDIT_COST_PER_CALL,
  MCP_INSUFFICIENT_CREDITS_CODE,
  monthlyLimitForPlan,
} from '../credits'

const TEST_USER = '00000000-0000-4000-8000-000000000001'

function mockProfileSelect(row: Record<string, unknown> | null, error: unknown = null) {
  fromMock.mockReturnValue({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: row, error }),
      }),
    }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('monthlyLimitForPlan', () => {
  it('returns 10 for free', () => {
    expect(monthlyLimitForPlan('free')).toBe(10)
  })
  it('returns 200 for starter', () => {
    expect(monthlyLimitForPlan('starter')).toBe(200)
  })
  it('returns 200 for founder (parity with starter for reset cap)', () => {
    expect(monthlyLimitForPlan('founder')).toBe(200)
  })
})

describe('getCreditBalance', () => {
  it('returns shape with monthly + purchased + total + plan', async () => {
    mockProfileSelect({
      tier: 'starter',
      starter_access_until: null,
      mcp_credits_monthly_remaining: 150,
      mcp_credits_purchased_remaining: 25,
    })
    const b = await getCreditBalance(TEST_USER)
    expect(b).toEqual({
      monthly_remaining: 150,
      purchased_remaining: 25,
      total_remaining: 175,
      plan: 'starter',
    })
  })

  it('resolves plan via getEffectiveTier when starter_access_until is in the future', async () => {
    const futureIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    mockProfileSelect({
      tier: 'free',
      starter_access_until: futureIso,
      mcp_credits_monthly_remaining: 5,
      mcp_credits_purchased_remaining: 0,
    })
    const b = await getCreditBalance(TEST_USER)
    expect(b?.plan).toBe('starter')
  })

  it('returns null on profile lookup error', async () => {
    mockProfileSelect(null, { message: 'boom' })
    expect(await getCreditBalance(TEST_USER)).toBeNull()
  })
})

describe('checkMcpCredits', () => {
  it('allows when total >= required (starter user with monthly credits)', async () => {
    mockProfileSelect({
      tier: 'starter',
      starter_access_until: null,
      mcp_credits_monthly_remaining: 100,
      mcp_credits_purchased_remaining: 0,
    })
    const r = await checkMcpCredits(TEST_USER)
    expect(r.allowed).toBe(true)
    expect(r.balance.plan).toBe('starter')
  })

  it('founder bypass: allowed even with zero balance', async () => {
    mockProfileSelect({
      tier: 'founder',
      starter_access_until: null,
      mcp_credits_monthly_remaining: 0,
      mcp_credits_purchased_remaining: 0,
    })
    const r = await checkMcpCredits(TEST_USER)
    expect(r.allowed).toBe(true)
    expect(r.balance.plan).toBe('founder')
  })

  it('denies free user with no remaining credits', async () => {
    mockProfileSelect({
      tier: 'free',
      starter_access_until: null,
      mcp_credits_monthly_remaining: 0,
      mcp_credits_purchased_remaining: 0,
    })
    const r = await checkMcpCredits(TEST_USER)
    expect(r.allowed).toBe(false)
    expect(r.errorData).toEqual({
      balance: 0,
      required: MCP_CREDIT_COST_PER_CALL,
      purchase_url: 'https://pmmsherpa.com/chat?buy_credits=true',
    })
  })

  it('denies when balance < required (free user with 1 credit, needs 2)', async () => {
    mockProfileSelect({
      tier: 'free',
      starter_access_until: null,
      mcp_credits_monthly_remaining: 1,
      mcp_credits_purchased_remaining: 0,
    })
    const r = await checkMcpCredits(TEST_USER)
    expect(r.allowed).toBe(false)
    expect(r.errorData?.balance).toBe(1)
  })

  it('fails closed when profile lookup fails', async () => {
    mockProfileSelect(null, { message: 'db error' })
    const r = await checkMcpCredits(TEST_USER)
    expect(r.allowed).toBe(false)
    expect(r.balance.plan).toBe('unknown')
  })
})

describe('deductMcpCredits', () => {
  it('returns the new balance row from the RPC', async () => {
    rpcMock.mockResolvedValueOnce({
      data: [{ monthly_remaining: 8, purchased_remaining: 0 }],
      error: null,
    })
    const r = await deductMcpCredits(TEST_USER, 2)
    expect(rpcMock).toHaveBeenCalledWith('deduct_mcp_credits', {
      p_user_id: TEST_USER,
      p_amount: 2,
    })
    expect(r).toEqual({ monthly_remaining: 8, purchased_remaining: 0 })
  })

  it('returns null when the RPC returns an empty result (insufficient balance)', async () => {
    rpcMock.mockResolvedValueOnce({ data: [], error: null })
    expect(await deductMcpCredits(TEST_USER, 2)).toBeNull()
  })

  it('returns null on RPC error', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })
    expect(await deductMcpCredits(TEST_USER, 2)).toBeNull()
  })
})

describe('InsufficientCreditsError', () => {
  it('carries the JSON-RPC -32000 code and structured data', () => {
    const err = new InsufficientCreditsError({
      allowed: false,
      balance: { monthly_remaining: 0, purchased_remaining: 0, total_remaining: 0, plan: 'free' },
      errorData: {
        balance: 0,
        required: 2,
        purchase_url: 'https://pmmsherpa.com/chat?buy_credits=true',
      },
    })
    expect(err.code).toBe(MCP_INSUFFICIENT_CREDITS_CODE)
    expect(err.message).toBe('INSUFFICIENT_CREDITS')
    expect(err.data).toEqual({
      balance: 0,
      required: 2,
      purchase_url: 'https://pmmsherpa.com/chat?buy_credits=true',
    })
  })
})
