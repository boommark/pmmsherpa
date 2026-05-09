'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useProfile } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, CreditCard, Zap, Sparkles, ArrowUpCircle, AlertCircle } from 'lucide-react'
import { CREDIT_PACKS, type CreditPackId } from '@/lib/stripe/credit-packs'
import { FREE_TIER_MONTHLY_LIMIT, STARTER_TIER_MONTHLY_LIMIT } from '@/lib/constants'

function BillingPageInner() {
  const { profile, loading } = useProfile()
  const searchParams = useSearchParams()
  const [upgrading, setUpgrading] = useState(false)
  const [managingBilling, setManagingBilling] = useState(false)
  const [buyingPack, setBuyingPack] = useState<CreditPackId | null>(null)
  const [error, setError] = useState<string | null>(null)

  const upgradeCancelled = searchParams.get('upgrade_cancelled') === 'true'
  const creditsAdded = searchParams.get('credits_added') === 'true'

  const handleUpgrade = async () => {
    setUpgrading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.assign(data.url)
      } else {
        setError(data.error || 'Could not start checkout')
        setUpgrading(false)
      }
    } catch {
      setError('Network error. Try again.')
      setUpgrading(false)
    }
  }

  const handleManageBilling = async () => {
    setManagingBilling(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.assign(data.url)
      } else {
        setError(data.error || 'Could not open billing portal')
        setManagingBilling(false)
      }
    } catch {
      setError('Network error. Try again.')
      setManagingBilling(false)
    }
  }

  const handleBuyPack = async (pack: CreditPackId) => {
    setBuyingPack(pack)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.assign(data.url)
      } else {
        setError(data.error || 'Could not start checkout')
        setBuyingPack(null)
      }
    } catch {
      setError('Network error. Try again.')
      setBuyingPack(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const tier = profile?.tier ?? 'free'
  const isFree = tier === 'free'
  const isStarter = tier === 'starter'
  const isFounder = tier === 'founder'
  const messagesUsed = profile?.messages_used_this_period ?? 0
  const messageLimit = isStarter ? STARTER_TIER_MONTHLY_LIMIT : FREE_TIER_MONTHLY_LIMIT
  const messagePct = Math.min(100, (messagesUsed / messageLimit) * 100)
  const monthlyCredits = profile?.mcp_credits_monthly_remaining ?? 0
  const purchasedCredits = profile?.mcp_credits_purchased_remaining ?? 0
  const totalCredits = monthlyCredits + purchasedCredits
  const monthlyAllowance = isStarter ? 200 : 10

  const topupPacks: CreditPackId[] = ['pmm_credits_50', 'pmm_credits_125', 'pmm_credits_200']

  return (
    <div className="h-full overflow-y-auto">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Billing & credits</h1>
          <p className="text-muted-foreground">
            Manage your plan, buy MCP credits, and update payment details.
          </p>
        </div>

        <div className="space-y-6">
          {creditsAdded && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Credits added. You&apos;re ready to keep going.</AlertDescription>
            </Alert>
          )}
          {upgradeCancelled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Upgrade cancelled. No charge was made.</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current plan</CardTitle>
              <CardDescription>
                {isFounder
                  ? 'Founder access. Unlimited usage.'
                  : isStarter
                    ? "You're on Starter. $9.99 per month."
                    : "You're on the Free plan."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30]">
                <div className="flex items-center gap-3">
                  <Zap className={`h-5 w-5 ${isFree ? 'text-muted-foreground' : 'text-[#0058be]'}`} />
                  <div>
                    <p className="text-sm font-semibold capitalize">
                      PMM Sherpa {tier}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isFounder
                        ? 'Unmetered'
                        : isStarter
                          ? '200 web messages + 200 MCP credits per month'
                          : '10 web messages + 10 MCP credits per month — top up MCP anytime'}
                    </p>
                  </div>
                </div>
                {isStarter && (
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                    Active
                  </span>
                )}
              </div>

              {!isFounder && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Web chat messages this month</span>
                      <span className="font-medium">{messagesUsed} / {messageLimit}</span>
                    </div>
                    <div className="w-full bg-[#e8ecf4] dark:bg-[#282b30] rounded-full h-1.5">
                      <div
                        className="bg-[#0058be] h-1.5 rounded-full transition-all"
                        style={{ width: `${messagePct}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">MCP credits remaining</span>
                      <span className="font-medium">
                        {totalCredits} <span className="text-muted-foreground font-normal">({monthlyCredits} monthly + {purchasedCredits} topup)</span>
                      </span>
                    </div>
                    <div className="w-full bg-[#e8ecf4] dark:bg-[#282b30] rounded-full h-1.5">
                      <div
                        className="bg-[#0058be] h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (monthlyCredits / monthlyAllowance) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Monthly resets on the 1st. Topup credits never expire.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {isFree && (
                  <Button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="bg-[#0058be] hover:bg-[#004a9e] text-white"
                  >
                    {upgrading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                    )}
                    {upgrading ? 'Redirecting…' : 'Upgrade to Starter — $9.99/mo'}
                  </Button>
                )}
                {isStarter && (
                  <Button
                    variant="outline"
                    onClick={handleManageBilling}
                    disabled={managingBilling}
                  >
                    {managingBilling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    {managingBilling ? 'Opening portal…' : 'Manage subscription'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* MCP credit topups */}
          {!isFounder && (
            <Card>
              <CardHeader>
                <CardTitle>MCP credit topups</CardTitle>
                <CardDescription>
                  Top up anytime. Each MCP query costs 2 credits. Topup credits never expire.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {topupPacks.map((packId) => {
                    const pack = CREDIT_PACKS[packId]
                    const isBest = packId === 'pmm_credits_200'
                    const queries = Math.floor(pack.credits / 2)
                    const perQuery = (pack.priceUsd / queries).toFixed(2)
                    return (
                      <div
                        key={pack.id}
                        className={`relative rounded-xl p-4 border transition-all ${
                          isBest
                            ? 'border-[#0058be] bg-[#0058be]/[0.03]'
                            : 'border-[#e8ecf4] dark:border-[#282b30]'
                        }`}
                      >
                        {isBest && (
                          <div className="absolute -top-2.5 left-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#0058be] px-2 py-0.5 text-[10px] font-semibold text-white">
                              <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                              Best value
                            </span>
                          </div>
                        )}
                        <div className="text-2xl font-bold tracking-[-0.01em] mb-0.5">
                          ${pack.priceUsd}
                        </div>
                        <div className="text-sm font-semibold text-[#0058be] dark:text-[#a8c0f0] mb-1.5">
                          {pack.credits} credits
                        </div>
                        <div className="text-xs text-muted-foreground mb-0.5">
                          ~{queries} queries
                        </div>
                        <div className="text-[10px] text-muted-foreground mb-3">
                          ${perQuery} per query
                        </div>
                        <Button
                          size="sm"
                          variant={isBest ? 'default' : 'outline'}
                          onClick={() => handleBuyPack(packId)}
                          disabled={buyingPack !== null}
                          className={`w-full text-xs h-8 ${
                            isBest ? 'bg-[#0058be] hover:bg-[#004a9e] text-white' : ''
                          }`}
                        >
                          {buyingPack === packId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            'Buy'
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <BillingPageInner />
    </Suspense>
  )
}
