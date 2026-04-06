'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, DollarSign, TrendingUp, BarChart3, Users } from 'lucide-react'

interface CostData {
  totalSpend: number
  projectedMonthly: number
  avgDaily: number
  serviceBreakdown: Record<string, number>
  dailySpend: Array<{ day: string; cost: number }>
  topUsers: Array<{ userId: string; email: string; fullName: string; cost: number }>
  topService: { name: string; cost: number }
  pricing: Record<string, unknown>
  range: number
  totalCalls: number
}

function formatUSD(n: number): string {
  if (n < 0.01 && n > 0) return '<$0.01'
  return `$${n.toFixed(2)}`
}

const SERVICE_LABELS: Record<string, string> = {
  claude: 'Claude Sonnet',
  gemini: 'Gemini Pro',
  gemini_flash_lite: 'Gemini Flash Lite',
  openai_embeddings: 'OpenAI Embeddings',
  perplexity: 'Perplexity',
  brave_search: 'Brave Search',
  jina: 'Jina Reader',
  firecrawl: 'Firecrawl',
  llamaparse: 'LlamaParse',
  elevenlabs: 'ElevenLabs TTS',
}

export default function AdminCostsPage() {
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState(30)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/costs?range=${range}`)
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        if (r.status === 403) { setError('Admin access only.'); return null }
        return r.json()
      })
      .then(d => { if (d) setData(d) })
      .catch(() => setError('Failed to load cost data'))
      .finally(() => setLoading(false))
  }, [router, range])

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

  const { totalSpend, projectedMonthly, avgDaily, serviceBreakdown, dailySpend, topUsers, topService, totalCalls } = data
  const maxDailyCost = Math.max(...dailySpend.map(d => d.cost), 0.01)
  const totalServiceCost = Object.values(serviceBreakdown).reduce((s, v) => s + v, 0) || 1

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header + Range selector */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cost Tracking</h1>
            <p className="text-muted-foreground text-sm mt-1">{totalCalls} API calls tracked</p>
          </div>
          <div className="flex gap-1">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setRange(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  range === d
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatUSD(totalSpend)}</p>
              <p className="text-xs text-muted-foreground">last {range} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Projected Monthly</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatUSD(projectedMonthly)}</p>
              <p className="text-xs text-muted-foreground">at current pace</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Daily</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatUSD(avgDaily)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Service</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold truncate">{SERVICE_LABELS[topService.name] || topService.name}</p>
              <p className="text-xs text-muted-foreground">{formatUSD(topService.cost)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily spend chart + Service breakdown */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Daily Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailySpend.length > 0 ? (
                <div className="flex items-end gap-1 h-32">
                  {dailySpend.slice(-30).map(d => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {formatUSD(d.cost)}
                      </span>
                      <div
                        className="w-full bg-emerald-500/80 rounded-t-sm min-h-[2px] transition-all"
                        style={{ height: `${Math.max(Math.round((d.cost / maxDailyCost) * 100), 2)}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground rotate-45 origin-left hidden sm:block">
                        {new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No cost data yet. Make some chat requests to start tracking.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Service Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(serviceBreakdown).length > 0 ? (
                Object.entries(serviceBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([service, cost]) => {
                    const pct = Math.round((cost / totalServiceCost) * 100)
                    return (
                      <div key={service}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground truncate">{SERVICE_LABELS[service] || service}</span>
                          <span className="font-medium">{formatUSD(cost)} <span className="text-muted-foreground">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full">
                          <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top users table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Top Users by Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">User</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map(u => (
                      <tr key={u.userId} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2.5 pr-4">
                          <p className="font-medium">{u.fullName || '—'}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="py-2.5 text-right font-mono font-medium">
                          {formatUSD(u.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No user cost data yet</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
