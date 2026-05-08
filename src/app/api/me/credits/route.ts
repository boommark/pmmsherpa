/**
 * GET /api/me/credits
 *
 * Returns the authed user's current MCP credit balance + plan. Consumed by
 * the M2 UI agent (chat header chip + buy-credits modal).
 *
 * Auth: cookie session via @/lib/supabase/server.createClient().
 *
 * Reply: {
 *   monthly_remaining: number,
 *   purchased_remaining: number,
 *   total_remaining: number,
 *   plan: 'free' | 'starter' | 'founder',
 * }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCreditBalance } from '@/lib/mcp/credits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: userResult, error: authError } = await supabase.auth.getUser()
  const user = userResult?.user
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const balance = await getCreditBalance(user.id)
  if (!balance) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json(balance)
}
