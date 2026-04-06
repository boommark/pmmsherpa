'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, DollarSign, TrendingUp, BarChart3, Users, Zap, Hash } from 'lucide-react'

interface ServiceStat {
  cost: number; calls: number; inputTokens: number; outputTokens: number
  units: number; unitType: string; isLLM: boolean
}

interface UserData {
  userId: string; email: string; fullName: string
  cost: number; calls: number; inputTokens: number; outputTokens: number
  services: Record<string, { cost: number; calls: number; inputTokens: number; outputTokens: number; units: number }>
}

interface CostData {
  totalSpend: number; projectedMonthly: number; avgDaily: number
  totalInputTokens: number; totalOutputTokens: number
  serviceStats: Record<string, ServiceStat>
  activeServices: string[]
  dailySpend: Array<{ day: string; cost: number }>
  users: UserData[]
  pricing: Record<string, unknown>
  range: number; totalCalls: number
}

function formatUSD(n: number): string {
  if (n < 0.01 && n > 0) return '<$0.01'
  return `$${n.toFixed(2)}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function formatUnits(n: number, unitType: string): string {
  const label = unitType === 'tokens' ? 'tok' : unitType === 'characters' ? 'chars' : unitType === 'pages' ? 'pg' : 'req'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ${label}`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K ${label}`
  return `${n} ${label}`
}

const SERVICE_LABELS: Record<string, string> = {
  claude: 'Claude',
  gemini: 'Gemini Pro',
  gemini_flash_lite: 'Flash Lite',
  openai_embeddings: 'Embeddings',
  perplexity: 'Perplexity',
  brave_search: 'Brave',
  jina: 'Jina',
  firecrawl: 'Firecrawl',
  llamaparse: 'LlamaParse',
  elevenlabs: 'ElevenLabs',
}

const SERVICE_UNIT_LABELS: Record<string, string> = {
  claude: 'tokens (in/out)',
  gemini: 'tokens (in/out)',
  gemini_flash_lite: 'tokens (in/out)',
  openai_embeddings: 'tokens',
  perplexity: 'requests',
  brave_search: 'requests',
  jina: 'requests',
  firecrawl: 'pages',
  llamaparse: 'pages',
  elevenlabs: 'characters',
}

const LLM_SERVICES = new Set(['claude', 'gemini', 'gemini_flash_lite'])

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  if (error) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-destructive">{error}</p></div>
  if (!data) return null

  const { totalSpend, projectedMonthly, avgDaily, totalInputTokens, totalOutputTokens, serviceStats, activeServices, dailySpend, users, totalCalls } = data
  const maxDailyCost = Math.max(...dailySpend.map(d => d.cost), 0.01)

  const llmServices = activeServices.filter(s => LLM_SERVICES.has(s))
  const utilityServices = activeServices.filter(s => !LLM_SERVICES.has(s))

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header + Range selector */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cost & Usage Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">{totalCalls.toLocaleString()} API calls tracked</p>
          </div>
          <div className="flex gap-1">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setRange(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${range === d ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Input Tokens</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatTokens(totalInputTokens)}</p>
              <p className="text-xs text-muted-foreground">across all LLMs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Output Tokens</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatTokens(totalOutputTokens)}</p>
              <p className="text-xs text-muted-foreground">across all LLMs</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily spend chart */}
        <Card>
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
                    <div className="w-full bg-emerald-500/80 rounded-t-sm min-h-[2px] transition-all"
                      style={{ height: `${Math.max(Math.round((d.cost / maxDailyCost) * 100), 2)}%` }} />
                    <span className="text-[9px] text-muted-foreground rotate-45 origin-left hidden sm:block">
                      {new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No cost data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* LLM Models — service cards */}
        {llmServices.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">LLM Models</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {llmServices.map(service => {
                const s = serviceStats[service]
                return (
                  <Card key={service}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{SERVICE_LABELS[service] || service}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cost</span>
                        <span className="font-mono font-medium">{formatUSD(s.cost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Input tokens</span>
                        <span className="font-mono">{formatTokens(s.inputTokens)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Output tokens</span>
                        <span className="font-mono">{formatTokens(s.outputTokens)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Calls</span>
                        <span className="font-mono">{s.calls.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Utility APIs — service cards */}
        {utilityServices.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Utility APIs</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {utilityServices.map(service => {
                const s = serviceStats[service]
                return (
                  <Card key={service}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{SERVICE_LABELS[service] || service}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cost</span>
                        <span className="font-mono font-medium">{formatUSD(s.cost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{s.unitType}</span>
                        <span className="font-mono">{s.units.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Calls</span>
                        <span className="font-mono">{s.calls.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Users table — one column per active service */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Usage by User
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium sticky left-0 bg-card z-10">User</th>
                      {activeServices.map(service => (
                        <th key={service} className="text-right py-2 px-3 text-muted-foreground font-medium whitespace-nowrap">
                          <div>{SERVICE_LABELS[service] || service}</div>
                          <div className="text-[10px] font-normal opacity-60">{SERVICE_UNIT_LABELS[service] || 'units'}</div>
                        </th>
                      ))}
                      <th className="text-right py-2 pl-3 text-muted-foreground font-medium">
                        <div>Total</div>
                        <div className="text-[10px] font-normal opacity-60">cost</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.userId} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2.5 pr-4 sticky left-0 bg-card z-10">
                          <p className="font-medium">{u.fullName || '—'}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        {activeServices.map(service => {
                          const sv = u.services[service]
                          if (!sv || sv.calls === 0) {
                            return <td key={service} className="text-right py-2.5 px-3 text-muted-foreground/40 font-mono">—</td>
                          }
                          const isLLM = LLM_SERVICES.has(service)
                          return (
                            <td key={service} className="text-right py-2.5 px-3 font-mono text-xs">
                              {isLLM ? (
                                <div>
                                  <span className="text-muted-foreground">{formatTokens(sv.inputTokens)}</span>
                                  <span className="text-muted-foreground/50"> / </span>
                                  <span>{formatTokens(sv.outputTokens)}</span>
                                </div>
                              ) : (
                                <span>{sv.units.toLocaleString()}</span>
                              )}
                              <div className="text-[10px] text-muted-foreground">{formatUSD(sv.cost)}</div>
                            </td>
                          )
                        })}
                        <td className="text-right py-2.5 pl-3 font-mono font-medium">
                          {formatUSD(u.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Totals row */}
                  <tfoot>
                    <tr className="border-t-2 border-border">
                      <td className="py-2.5 pr-4 font-semibold sticky left-0 bg-card z-10">Total</td>
                      {activeServices.map(service => {
                        const s = serviceStats[service]
                        const isLLM = LLM_SERVICES.has(service)
                        return (
                          <td key={service} className="text-right py-2.5 px-3 font-mono text-xs font-medium">
                            {isLLM ? (
                              <div>
                                <span className="text-muted-foreground">{formatTokens(s.inputTokens)}</span>
                                <span className="text-muted-foreground/50"> / </span>
                                <span>{formatTokens(s.outputTokens)}</span>
                              </div>
                            ) : (
                              <span>{s.units.toLocaleString()}</span>
                            )}
                            <div className="text-[10px] text-muted-foreground">{formatUSD(s.cost)}</div>
                          </td>
                        )
                      })}
                      <td className="text-right py-2.5 pl-3 font-mono font-bold">{formatUSD(totalSpend)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No user data yet</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
