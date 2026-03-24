'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, MessageSquare, BarChart3, Zap, Clock, TrendingUp, Activity } from 'lucide-react'

interface AnalyticsData {
  overview: {
    total_users: number
    total_conversations: number
    total_messages: number
    dau: number
    wau: number
    total_tokens: number
    avg_latency_ms: number | null
  }
  model_breakdown: Record<string, number>
  daily_activity: Array<{ day: string; dau: number }>
  users: Array<{
    id: string
    email: string
    full_name: string
    joined: string
    conversations: number
    last_active: string | null
  }>
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        if (r.status === 403) { setError('Admin access only.'); return null }
        return r.json()
      })
      .then(d => { if (d) setData(d) })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const { overview, model_breakdown, daily_activity, users } = data
  const maxDau = Math.max(...daily_activity.map(d => d.dau), 1)
  const last14 = daily_activity.slice(-14)

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">PMMSherpa usage overview</p>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{overview.total_users}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{overview.total_conversations}</p>
              <p className="text-xs text-muted-foreground">{overview.total_messages} messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">DAU / WAU</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{overview.dau}</p>
              <p className="text-xs text-muted-foreground">{overview.wau} this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {overview.avg_latency_ms ? `${(overview.avg_latency_ms / 1000).toFixed(1)}s` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                {overview.total_tokens > 0 ? `${(overview.total_tokens / 1000).toFixed(0)}k tokens` : 'No token data yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily activity + model breakdown */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Daily activity chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Daily Active Users (last 14 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {last14.length > 0 ? (
                <div className="flex items-end gap-1.5 h-32">
                  {last14.map(d => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.dau}
                      </span>
                      <div
                        className="w-full bg-indigo-500/80 rounded-t-sm min-h-[4px] transition-all"
                        style={{ height: `${Math.round((d.dau / maxDau) * 100)}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground rotate-45 origin-left hidden sm:block">
                        {new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No activity data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Model breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Model Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(model_breakdown).length > 0 ? (
                Object.entries(model_breakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([model, count]) => {
                    const total = Object.values(model_breakdown).reduce((s, v) => s + v, 0)
                    const pct = Math.round((count / total) * 100)
                    return (
                      <div key={model}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground truncate">{model}</span>
                          <span className="font-medium">{count} <span className="text-muted-foreground">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full">
                          <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Users table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">User</th>
                    <th className="text-right py-2 pr-4 text-muted-foreground font-medium">Conversations</th>
                    <th className="text-right py-2 pr-4 text-muted-foreground font-medium">Last Active</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 pr-4">
                        <p className="font-medium">{u.full_name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="py-2.5 pr-4 text-right">
                        <Badge variant={u.conversations > 0 ? 'default' : 'secondary'} className="font-mono">
                          {u.conversations}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-muted-foreground text-xs">
                        {u.last_active
                          ? new Date(u.last_active).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '—'}
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground text-xs">
                        {new Date(u.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
