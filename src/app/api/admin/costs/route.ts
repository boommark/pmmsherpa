import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { PRICING } from '@/lib/cost-tracker'

const LLM_SERVICES = new Set(['claude', 'gemini', 'gemini_flash_lite'])

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const serviceClient = await createServiceClient()
  const range = parseInt(request.nextUrl.searchParams.get('range') || '30')
  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString()

  const [costsResult, profilesResult] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (serviceClient.from('api_costs') as any)
      .select('service, operation, cost_usd, created_at, user_id, input_tokens, output_tokens, units, unit_type')
      .gte('created_at', since).order('created_at', { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (serviceClient.from('profiles') as any).select('id, email, full_name'),
  ])

  const costs = costsResult.data || []
  const profiles = profilesResult.data || []

  const profileMap: Record<string, { email: string; full_name: string }> = {}
  for (const p of profiles) profileMap[p.id] = { email: p.email, full_name: p.full_name }

  // Totals
  let totalSpend = 0, totalInputTokens = 0, totalOutputTokens = 0
  for (const c of costs) {
    totalSpend += parseFloat(c.cost_usd)
    totalInputTokens += c.input_tokens || 0
    totalOutputTokens += c.output_tokens || 0
  }

  // Per-service aggregation with consumption metrics
  const serviceStats: Record<string, {
    cost: number; calls: number; inputTokens: number; outputTokens: number;
    units: number; unitType: string; isLLM: boolean
  }> = {}
  for (const c of costs) {
    const cost = parseFloat(c.cost_usd)
    const isLLM = LLM_SERVICES.has(c.service)
    if (!serviceStats[c.service]) {
      serviceStats[c.service] = { cost: 0, calls: 0, inputTokens: 0, outputTokens: 0, units: 0, unitType: c.unit_type || (isLLM ? 'tokens' : 'requests'), isLLM }
    }
    const s = serviceStats[c.service]
    s.cost += cost
    s.calls += 1
    s.inputTokens += c.input_tokens || 0
    s.outputTokens += c.output_tokens || 0
    s.units += c.units || 0
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

  // Per-user with per-service consumption
  const userMap: Record<string, {
    cost: number; calls: number; inputTokens: number; outputTokens: number
    services: Record<string, { cost: number; calls: number; inputTokens: number; outputTokens: number; units: number }>
  }> = {}
  for (const c of costs) {
    if (!userMap[c.user_id]) userMap[c.user_id] = { cost: 0, calls: 0, inputTokens: 0, outputTokens: 0, services: {} }
    const u = userMap[c.user_id]
    const cost = parseFloat(c.cost_usd)
    u.cost += cost
    u.calls += 1
    u.inputTokens += c.input_tokens || 0
    u.outputTokens += c.output_tokens || 0
    if (!u.services[c.service]) u.services[c.service] = { cost: 0, calls: 0, inputTokens: 0, outputTokens: 0, units: 0 }
    const sv = u.services[c.service]
    sv.cost += cost
    sv.calls += 1
    sv.inputTokens += c.input_tokens || 0
    sv.outputTokens += c.output_tokens || 0
    sv.units += c.units || 0
  }

  const users = Object.entries(userMap)
    .map(([userId, d]) => ({ userId, email: profileMap[userId]?.email || 'unknown', fullName: profileMap[userId]?.full_name || '', ...d }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 50)

  // Active services (only ones with data)
  const activeServices = Object.keys(serviceStats).sort((a, b) => serviceStats[b].cost - serviceStats[a].cost)

  const daysWithData = Object.keys(dailyMap).length || 1
  const avgDaily = totalSpend / daysWithData

  return NextResponse.json({
    totalSpend, projectedMonthly: avgDaily * 30, avgDaily,
    totalInputTokens, totalOutputTokens,
    serviceStats, activeServices,
    dailySpend, users, pricing: PRICING, range,
    totalCalls: costs.length,
  })
}
