import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check is_admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Run all queries in parallel
  const [
    usersResult,
    conversationsResult,
    messagesResult,
    modelBreakdownResult,
    dailyActivityResult,
    topUsersResult,
    tokenStatsResult,
  ] = await Promise.all([
    // Total users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }),

    // Total conversations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('conversations') as any).select('id', { count: 'exact', head: true }),

    // Total messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('messages') as any).select('id', { count: 'exact', head: true }),

    // Conversations by model
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('conversations') as any)
      .select('model_used')
      .not('model_used', 'is', null),

    // Daily active users (last 30 days) — unique users per day
    supabase.rpc('admin_daily_activity' as never),

    // Top users by conversation count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('profiles') as any)
      .select('id, email, full_name, created_at'),

    // Token stats from usage_logs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('usage_logs') as any)
      .select('model, total_tokens, latency_ms, created_at, user_id'),
  ])

  // Conversations per user — join manually
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: convPerUser } = await (supabase.from('conversations') as any)
    .select('user_id')

  // Build user conversation counts
  const convCounts: Record<string, number> = {}
  for (const c of convPerUser || []) {
    convCounts[c.user_id] = (convCounts[c.user_id] || 0) + 1
  }

  // Last active per user from conversations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lastActive } = await (supabase.from('conversations') as any)
    .select('user_id, updated_at')
    .order('updated_at', { ascending: false })

  const lastActivePer: Record<string, string> = {}
  for (const c of lastActive || []) {
    if (!lastActivePer[c.user_id]) lastActivePer[c.user_id] = c.updated_at
  }

  // Build users list
  const users = (usersResult.data || [])
  const allProfiles = topUsersResult.data || []
  const enrichedUsers = allProfiles.map((p: { id: string; email: string; full_name: string; created_at: string }) => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name,
    joined: p.created_at,
    conversations: convCounts[p.id] || 0,
    last_active: lastActivePer[p.id] || null,
  })).sort((a: { conversations: number }, b: { conversations: number }) => b.conversations - a.conversations)

  // Model breakdown
  const modelCounts: Record<string, number> = {}
  for (const c of modelBreakdownResult.data || []) {
    const m = c.model_used || 'unknown'
    modelCounts[m] = (modelCounts[m] || 0) + 1
  }

  // Daily activity from conversations (fallback if RPC not set up)
  const dailyMap: Record<string, Set<string>> = {}
  for (const c of convPerUser || []) {
    // We need dates — fetch again with dates
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: convWithDates } = await (supabase.from('conversations') as any)
    .select('user_id, created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  const dauMap: Record<string, Set<string>> = {}
  for (const c of convWithDates || []) {
    const day = c.created_at.slice(0, 10)
    if (!dauMap[day]) dauMap[day] = new Set()
    dauMap[day].add(c.user_id)
  }

  const dailyActivity = Object.entries(dauMap).map(([day, users]) => ({
    day,
    dau: users.size,
  })).sort((a, b) => a.day.localeCompare(b.day))

  // WAU — unique users in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: wauData } = await (supabase.from('conversations') as any)
    .select('user_id')
    .gte('created_at', weekAgo)
  const wau = new Set((wauData || []).map((c: { user_id: string }) => c.user_id)).size

  // DAU today
  const today = new Date().toISOString().slice(0, 10)
  const dau = dauMap[today]?.size || 0

  // Token stats
  const logs = tokenStatsResult.data || []
  const totalTokens = logs.reduce((sum: number, l: { total_tokens: number }) => sum + (l.total_tokens || 0), 0)
  const avgLatency = logs.length
    ? Math.round(logs.reduce((sum: number, l: { latency_ms: number }) => sum + (l.latency_ms || 0), 0) / logs.length)
    : null

  return NextResponse.json({
    overview: {
      total_users: usersResult.count || 0,
      total_conversations: conversationsResult.count || 0,
      total_messages: messagesResult.count || 0,
      dau,
      wau,
      total_tokens: totalTokens,
      avg_latency_ms: avgLatency,
    },
    model_breakdown: modelCounts,
    daily_activity: dailyActivity,
    users: enrichedUsers,
  })
}
