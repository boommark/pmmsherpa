'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, BarChart3, MessageSquare, Clock, Zap } from 'lucide-react'

interface UsageStats {
  total_queries: number
  total_tokens: number
  claude_queries: number
  gemini_queries: number
  avg_latency_ms: number
  queries_by_day: Array<{ day: string; count: number; tokens: number }>
}

export default function UsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.rpc as any)('get_user_usage_stats', {
        p_user_id: user.id,
        p_days: 30,
      })

      if (data && data.length > 0) {
        setStats(data[0])
      }
      setLoading(false)
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Usage Analytics</h1>
        <p className="text-muted-foreground">
          Track your PMMSherpa usage over the last 30 days
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Queries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_queries || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        {/* Total Tokens */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_tokens ? (stats.total_tokens / 1000).toFixed(1) + 'k' : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        {/* Avg Latency */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avg_latency_ms ? (stats.avg_latency_ms / 1000).toFixed(1) + 's' : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Average latency</p>
          </CardContent>
        </Card>

        {/* Model Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900">
                Claude: {stats?.claude_queries || 0}
              </Badge>
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">
                Gemini: {stats?.gemini_queries || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
          <CardDescription>Your query activity over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.queries_by_day && stats.queries_by_day.length > 0 ? (
            <div className="space-y-2">
              {stats.queries_by_day.slice(-7).reverse().map((day) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-24">
                    {new Date(day.day).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-4">
                    <div
                      className="bg-primary h-4 rounded-full"
                      style={{
                        width: `${Math.min(100, (day.count / Math.max(...stats.queries_by_day.map((d) => d.count))) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {day.count} queries
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity in the last 30 days
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
