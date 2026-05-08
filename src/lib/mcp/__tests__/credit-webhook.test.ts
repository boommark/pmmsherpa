/**
 * Tests for the Stripe webhook credit-grant path.
 *
 * Covers:
 *   - checkout.session.completed with mode='payment' + metadata.credits
 *     calls grant_mcp_credits with the right user + amount.
 *   - Replaying the same Stripe event.id is idempotent (the second call
 *     short-circuits — no second grant_mcp_credits invocation).
 *   - Subscription path is unaffected (no grant_mcp_credits call when
 *     metadata.credits is absent).
 *
 * Strategy: import the route's POST handler with mocked Stripe client and
 * mocked Supabase client, fire two events with the same id, observe the
 * RPC was called once.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const { rpcMock, fromMock, constructEventMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(
    async (): Promise<{ data: unknown; error: unknown }> => ({ data: 50, error: null }),
  ),
  fromMock: vi.fn(),
  constructEventMock: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: constructEventMock },
  },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: fromMock,
    rpc: rpcMock,
  })),
}))

import { POST } from '@/app/api/webhooks/stripe/route'

const TEST_USER = '00000000-0000-4000-8000-000000000001'

function makeRequest(rawBody: string, sig = 't=1,v1=fake'): Request {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': sig },
    body: rawBody,
  })
}

interface IdempotencyState {
  seen: Set<string>
}

function setupIdempotency(state: IdempotencyState) {
  // The webhook calls supabase.from('stripe_webhook_events').insert(...)
  // first (idempotency). On a duplicate it fails with code 23505. For
  // other tables (profiles) it is idempotent UPDATE.
  fromMock.mockImplementation((table: string) => {
    if (table === 'stripe_webhook_events') {
      return {
        insert: (row: { event_id: string }) => ({
          select: () => ({
            maybeSingle: async () => {
              if (state.seen.has(row.event_id)) {
                return { data: null, error: { code: '23505' } }
              }
              state.seen.add(row.event_id)
              return { data: { event_id: row.event_id }, error: null }
            },
          }),
        }),
      }
    }
    if (table === 'profiles') {
      return {
        update: () => ({
          eq: () => ({}),
        }),
      }
    }
    return {}
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('webhook: credit grant on checkout.session.completed', () => {
  it('calls grant_mcp_credits with userId + credits when mode=payment + metadata.credits', async () => {
    const state: IdempotencyState = { seen: new Set() }
    setupIdempotency(state)

    constructEventMock.mockReturnValueOnce({
      id: 'evt_test_credits_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_1',
          mode: 'payment',
          customer: 'cus_1',
          metadata: {
            supabase_user_id: TEST_USER,
            pack: 'pmm_credits_50',
            credits: '50',
          },
        },
      },
    })

    const res = await POST(makeRequest('{}') as never)
    expect(res.status).toBe(200)
    expect(rpcMock).toHaveBeenCalledTimes(1)
    expect(rpcMock).toHaveBeenCalledWith('grant_mcp_credits', {
      p_user_id: TEST_USER,
      p_amount: 50,
    })
  })

  it('is idempotent: same event.id twice = one grant', async () => {
    const state: IdempotencyState = { seen: new Set() }
    setupIdempotency(state)

    const event = {
      id: 'evt_test_dupe',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_1',
          mode: 'payment',
          customer: 'cus_1',
          metadata: {
            supabase_user_id: TEST_USER,
            pack: 'pmm_credits_125',
            credits: '125',
          },
        },
      },
    }

    constructEventMock.mockReturnValue(event)

    const r1 = await POST(makeRequest('{}') as never)
    const r2 = await POST(makeRequest('{}') as never)

    expect(r1.status).toBe(200)
    expect(r2.status).toBe(200)
    // First call grants, second short-circuits via 23505.
    expect(rpcMock).toHaveBeenCalledTimes(1)
  })

  it('does NOT call grant_mcp_credits for subscription checkout (no metadata.credits)', async () => {
    const state: IdempotencyState = { seen: new Set() }
    setupIdempotency(state)

    constructEventMock.mockReturnValueOnce({
      id: 'evt_test_sub_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_2',
          mode: 'subscription',
          customer: 'cus_2',
          subscription: 'sub_1',
          metadata: { supabase_user_id: TEST_USER },
        },
      },
    })

    const res = await POST(makeRequest('{}') as never)
    expect(res.status).toBe(200)
    expect(rpcMock).not.toHaveBeenCalled()
  })

  it('returns 500 if grant_mcp_credits fails so Stripe retries', async () => {
    const state: IdempotencyState = { seen: new Set() }
    setupIdempotency(state)

    rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'db down' } })

    constructEventMock.mockReturnValueOnce({
      id: 'evt_test_grant_fail',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_3',
          mode: 'payment',
          customer: 'cus_3',
          metadata: {
            supabase_user_id: TEST_USER,
            pack: 'pmm_credits_50',
            credits: '50',
          },
        },
      },
    })

    const res = await POST(makeRequest('{}') as never)
    expect(res.status).toBe(500)
  })
})
