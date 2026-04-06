import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { PRICING } from '@/lib/cost-tracker'

export async function GET(request: NextRequest) {
  // Auth check with user-scoped client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Use service role client for data queries — bypasses RLS to see ALL users
  const serviceClient = await createServiceClient()

  const range = parseInt(request.nextUrl.searchParams.get('range') || '30')
  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString()

  // Fetch costs and user profiles in parallel
  const [costsResult, profilesResult] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (serviceClient.from('api_costs') as any)
      .select('service, operation, cost_usd, created_at, user_id, input_tokens, output_tokens, units')
      .gte('created_at', since)
      .order('created_at', { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (serviceClient.from('profiles') as any)
      .select('id, email, full_name'),
  ])

  const costs = costsResult.data || []
  const profiles = profilesResult.data || []

  // Build profile lookup
  const profileMap: Record<string, { email: string; full_name: string }> = {}
  for (const p of profiles) {
    profileMap[p.id] = { email: p.email, full_name: p.full_name }
  }

  // Total spend
  const totalSpend = costs.reduce((s: number, c: { cost_usd: string }) => s + parseFloat(c.cost_usd), 0)

  // Per-service breakdown
  const serviceBreakdown: Record<string, number> = {}
  for (const c of costs) {
    serviceBreakdown[c.service] = (serviceBreakdown[c.service] || 0) + parseFloat(c.cost_usd)
  }

  // Daily spend
  const dailyMap: Record<string, number> = {}
  for (const c of costs) {
    const day = c.created_at.slice(0, 10)
    dailyMap[day] = (dailyMap[day] || 0) + parseFloat(c.cost_usd)
  }
  const dailySpend = Object.entries(dailyMap)
    .map(([day, cost]) => ({ day, cost }))
    .sort((a, b) => a.day.localeCompare(b.day))

  // Per-user costs
  const userCostMap: Record<string, number> = {}
  for (const c of costs) {
    userCostMap[c.user_id] = (userCostMap[c.user_id] || 0) + parseFloat(c.cost_usd)
  }
  const topUsers = Object.entries(userCostMap)
    .map(([userId, cost]) => ({
      userId,
      email: profileMap[userId]?.email || 'unknown',
      fullName: profileMap[userId]?.full_name || '',
      cost,
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 50)

  // Projection
  const daysWithData = Object.keys(dailyMap).length || 1
  const avgDaily = totalSpend / daysWithData
  const projectedMonthly = avgDaily * 30

  // Top service
  const topService = Object.entries(serviceBreakdown).sort(([, a], [, b]) => b - a)[0] || ['none', 0]

  return NextResponse.json({
    totalSpend,
    projectedMonthly,
    avgDaily,
    serviceBreakdown,
    dailySpend,
    topUsers,
    topService: { name: topService[0], cost: topService[1] },
    pricing: PRICING,
    range,
    totalCalls: costs.length,
  })
}
