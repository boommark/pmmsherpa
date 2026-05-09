/**
 * Tests for the daily monthly-reset endpoint
 * (`/api/cron/reset-monthly-credits`).
 *
 * Covers:
 *   - Free user past the cutoff is reset to 10
 *   - Starter user past the cutoff is reset to 200
 *   - User on a future starter_access_until (referral grant) is treated
 *     as starter (gets 200)
 *   - mcp_credits_purchased_remaining is NEVER touched
 *   - Auth: when CRON_SECRET is set, missing/wrong bearer returns 401
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }))

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(async () => ({ from: fromMock })),
}))

import { GET } from '@/app/api/cron/reset-monthly-credits/route'

interface DueRow {
  id: string
  tier: string | null
  starter_access_until: string | null
}

function makeRequest(secret?: string): Request {
  const headers: Record<string, string> = {}
  if (secret) headers['authorization'] = `Bearer ${secret}`
  return new Request('http://localhost/api/cron/reset-monthly-credits', { headers })
}

interface UpdateCall {
  id: string
  patch: Record<string, unknown>
}

function setupSupabase(rows: DueRow[], updates: UpdateCall[]) {
  fromMock.mockImplementation(() => ({
    select: () => ({
      lt: () => ({
        limit: async () => ({ data: rows, error: null }),
      }),
    }),
    update: (patch: Record<string, unknown>) => ({
      eq: (_col: string, id: string) => ({
        lt: async () => {
          updates.push({ id, patch })
          return { error: null }
        },
      }),
    }),
  }))
}

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.CRON_SECRET
})

afterEach(() => {
  delete process.env.CRON_SECRET
})

describe('reset-monthly-credits: per-plan cap', () => {
  it('resets a free user to 10 monthly credits', async () => {
    const updates: UpdateCall[] = []
    setupSupabase(
      [{ id: 'u1', tier: 'free', starter_access_until: null }],
      updates,
    )
    const res = await GET(makeRequest() as never)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.reset_free).toBe(1)
    expect(updates).toHaveLength(1)
    expect(updates[0].patch.mcp_credits_monthly_remaining).toBe(10)
  })

  it('resets a starter user to 200 monthly credits', async () => {
    const updates: UpdateCall[] = []
    setupSupabase(
      [{ id: 'u2', tier: 'starter', starter_access_until: null }],
      updates,
    )
    const res = await GET(makeRequest() as never)
    const body = await res.json()
    expect(body.reset_starter).toBe(1)
    expect(updates[0].patch.mcp_credits_monthly_remaining).toBe(200)
  })

  it('treats a user with future starter_access_until as starter (referral grant)', async () => {
    const updates: UpdateCall[] = []
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    setupSupabase(
      [{ id: 'u3', tier: 'free', starter_access_until: future }],
      updates,
    )
    const res = await GET(makeRequest() as never)
    const body = await res.json()
    expect(body.reset_starter).toBe(1)
    expect(updates[0].patch.mcp_credits_monthly_remaining).toBe(200)
  })

  it('does NOT touch mcp_credits_purchased_remaining', async () => {
    const updates: UpdateCall[] = []
    setupSupabase(
      [{ id: 'u4', tier: 'free', starter_access_until: null }],
      updates,
    )
    await GET(makeRequest() as never)
    expect(updates[0].patch.mcp_credits_purchased_remaining).toBeUndefined()
  })

  it('updates mcp_credits_month_start to a fresh ISO timestamp', async () => {
    const updates: UpdateCall[] = []
    setupSupabase(
      [{ id: 'u5', tier: 'free', starter_access_until: null }],
      updates,
    )
    await GET(makeRequest() as never)
    const newStart = updates[0].patch.mcp_credits_month_start as string
    expect(newStart).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    // Within last 60s.
    const ageMs = Date.now() - new Date(newStart).getTime()
    expect(ageMs).toBeLessThan(60_000)
  })
})

describe('reset-monthly-credits: auth', () => {
  it('returns 401 when CRON_SECRET is set and bearer is missing', async () => {
    process.env.CRON_SECRET = 'shhh'
    setupSupabase([], [])
    const res = await GET(makeRequest() as never)
    expect(res.status).toBe(401)
  })

  it('returns 200 when CRON_SECRET matches', async () => {
    process.env.CRON_SECRET = 'shhh'
    setupSupabase([], [])
    const res = await GET(makeRequest('shhh') as never)
    expect(res.status).toBe(200)
  })

  it('skips auth check when CRON_SECRET is unset', async () => {
    setupSupabase([], [])
    const res = await GET(makeRequest() as never)
    expect(res.status).toBe(200)
  })
})
