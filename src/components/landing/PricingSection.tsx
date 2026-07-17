'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Sparkles, Loader2 } from 'lucide-react'
import { useProfile, useUser } from '@/hooks/useSupabase'
import type { CreditPackId } from '@/lib/stripe/credit-packs'

type PlanFeature = {
  label: string
  included: boolean
}

type Plan = {
  key: 'free' | 'starter'
  name: string
  price: string
  cadence: string
  tagline: string
  features: PlanFeature[]
  highlighted?: boolean
}

const plans: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    tagline: 'Try every tool. See if Sherpa thinks like you do.',
    features: [
      { label: '10 web chat messages / month', included: true },
      { label: '10 MCP credits / month', included: true },
      { label: 'All 4 tools (Frame, Consult, Validate, Grow)', included: true },
      { label: 'Email support', included: true },
      { label: 'MCP credit topups available', included: true },
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    price: '$14.99',
    cadence: 'per month',
    tagline: 'For PMMs who use Sherpa as a daily thinking partner.',
    features: [
      { label: '200 web chat messages / month', included: true },
      { label: '200 MCP credits / month', included: true },
      { label: 'All 4 tools (Frame, Consult, Validate, Grow)', included: true },
      { label: 'MCP credit topups available', included: true },
      { label: 'Priority email support', included: true },
    ],
    highlighted: true,
  },
]

type Topup = {
  pack: CreditPackId
  price: string
  credits: string
  queries: string
  perQuery: string
  bestValue?: boolean
}

const topups: Topup[] = [
  {
    pack: 'pmm_credits_50',
    price: '$5',
    credits: '50 credits',
    queries: 'About 25 queries',
    perQuery: '~$0.20 per query',
  },
  {
    pack: 'pmm_credits_125',
    price: '$10',
    credits: '125 credits',
    queries: 'About 62 queries',
    perQuery: '~$0.16 per query',
  },
  {
    pack: 'pmm_credits_200',
    price: '$15',
    credits: '200 credits',
    queries: 'About 100 queries',
    perQuery: '~$0.15 per query',
    bestValue: true,
  },
]

export function PricingSection() {
  const { user, loading: userLoading } = useUser()
  const { profile, loading: profileLoading } = useProfile()
  const loading = userLoading || profileLoading
  const [pendingPlan, setPendingPlan] = useState<'free' | 'starter' | null>(null)
  const [pendingPack, setPendingPack] = useState<CreditPackId | null>(null)

  const isLoggedIn = !!user
  const tier = profile?.tier
  const isStarter = tier === 'starter' || tier === 'founder'

  const planLabel = (key: 'free' | 'starter'): string => {
    if (loading) return '…'
    if (key === 'free') {
      if (!isLoggedIn) return 'Get started'
      return tier === 'free' ? 'Your current plan' : 'Free included'
    }
    if (!isLoggedIn) return 'Subscribe'
    if (isStarter) return 'Manage subscription'
    return 'Upgrade to Starter'
  }

  const handlePlanClick = async (key: 'free' | 'starter') => {
    if (loading) return
    if (!isLoggedIn) {
      window.location.assign(key === 'starter' ? '/signup?plan=starter' : '/signup')
      return
    }
    if (key === 'free') {
      window.location.assign('/settings/billing')
      return
    }
    if (isStarter) {
      setPendingPlan('starter')
      try {
        const res = await fetch('/api/stripe/portal', { method: 'POST' })
        const data = await res.json()
        if (data.url) {
          window.location.assign(data.url)
          return
        }
      } catch {
        // fall through to billing page
      }
      window.location.assign('/settings/billing')
      setPendingPlan(null)
      return
    }
    setPendingPlan('starter')
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.assign(data.url)
        return
      }
    } catch {
      // fall through
    }
    window.location.assign('/settings/billing')
    setPendingPlan(null)
  }

  const handleTopupClick = async (pack: CreditPackId) => {
    if (loading) return
    if (!isLoggedIn) {
      window.location.assign('/signup?next=/settings/billing')
      return
    }
    setPendingPack(pack)
    try {
      const res = await fetch('/api/stripe/checkout-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.assign(data.url)
        return
      }
    } catch {
      // fall through
    }
    window.location.assign('/settings/billing')
    setPendingPack(null)
  }

  const topupCtaLabel = (): string => {
    if (loading) return '…'
    if (!isLoggedIn) return 'Sign up to buy'
    return 'Buy'
  }

  return (
    <section
      id="pricing"
      className="py-14 md:py-20 scroll-mt-20"
      style={{
        background: 'linear-gradient(180deg, #f8f9fd 0%, #f0f3fa 50%, #f8f9fd 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* Section header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e] mb-4">
            Pay for what you use across every AI
          </h2>
          <p className="text-base md:text-lg text-[#4a4f57] max-w-2xl mx-auto leading-relaxed">
            Free to try. Upgrade for more, or top up MCP credits as needed.
          </p>
        </div>

        {/* Plan comparison cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-14 md:mb-20">
          {plans.map((plan) => {
            const isPending = pendingPlan === plan.key
            const isCurrent =
              isLoggedIn && ((plan.key === 'free' && tier === 'free') || (plan.key === 'starter' && isStarter))
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-7 md:p-8 transition-all flex flex-col ${
                  plan.highlighted
                    ? 'bg-white border-2 border-[#0058be] shadow-[0_12px_40px_rgba(0,88,190,0.12)]'
                    : 'bg-white border border-[#e8ecf4]/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0058be] to-[#2170e4] px-3 py-1 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(0,88,190,0.25)]">
                      <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                      Recommended
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-xl font-bold text-[#191c1e] mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-extrabold tracking-[-0.02em] text-[#191c1e]">
                      {plan.price}
                    </span>
                    <span className="text-sm text-[#5f6368]">{plan.cadence}</span>
                  </div>
                  <p className="text-sm text-[#4a4f57] leading-relaxed">{plan.tagline}</p>
                </div>

                <ul className="space-y-3 mb-7 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.label}
                      className={`flex items-start gap-3 text-sm leading-relaxed ${
                        feature.included ? 'text-[#3a3f47]' : 'text-[#9ca3af]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                          feature.included ? 'bg-[#0058be]/10' : 'bg-[#f0f2f5]'
                        }`}
                      >
                        {feature.included ? (
                          <Check className="h-3 w-3 text-[#0058be]" strokeWidth={3} />
                        ) : (
                          <span className="block h-px w-2 bg-[#9ca3af]" />
                        )}
                      </span>
                      <span>{feature.label}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePlanClick(plan.key)}
                  disabled={loading || isPending}
                  className={`w-full rounded-full h-11 font-medium shadow-none ${
                    plan.highlighted
                      ? 'bg-[#0058be] hover:bg-[#004a9e] text-white'
                      : 'bg-[#f2f4f7] hover:bg-[#e8ecf4] text-[#191c1e]'
                  }`}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    planLabel(plan.key)
                  )}
                </Button>
                {isCurrent && (
                  <p className="text-center text-xs text-[#5f6368] mt-2">Your current plan</p>
                )}
              </div>
            )
          })}
        </div>

        {/* MCP topup cards */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">
              MCP Credit Topups
            </p>
            <h3 className="text-2xl md:text-3xl font-bold tracking-[-0.02em] text-[#191c1e]">
              Need more credits? Top up anytime.
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-8">
            {topups.map((topup) => {
              const isPending = pendingPack === topup.pack
              return (
                <div
                  key={topup.price}
                  className={`relative rounded-2xl p-6 md:p-7 bg-white transition-all flex flex-col ${
                    topup.bestValue
                      ? 'border-2 border-[#0058be] shadow-[0_8px_28px_rgba(0,88,190,0.10)]'
                      : 'border border-[#e8ecf4]/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  {topup.bestValue && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0058be] to-[#2170e4] px-3 py-1 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(0,88,190,0.25)]">
                        <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                        Best value
                      </span>
                    </div>
                  )}
                  <div className="text-3xl font-extrabold tracking-[-0.02em] text-[#191c1e] mb-1">
                    {topup.price}
                  </div>
                  <div className="text-sm font-semibold text-[#0058be] mb-3">{topup.credits}</div>
                  <div className="text-sm text-[#4a4f57] mb-1">{topup.queries}</div>
                  <div className="text-xs text-[#5f6368] mb-5">{topup.perQuery}</div>
                  <Button
                    onClick={() => handleTopupClick(topup.pack)}
                    disabled={loading || isPending}
                    variant={topup.bestValue ? 'default' : 'outline'}
                    className={`mt-auto w-full rounded-full h-10 font-medium shadow-none ${
                      topup.bestValue
                        ? 'bg-[#0058be] hover:bg-[#004a9e] text-white'
                        : 'bg-white hover:bg-[#f2f4f7] text-[#191c1e] border-[#e8ecf4]'
                    }`}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      topupCtaLabel()
                    )}
                  </Button>
                </div>
              )
            })}
          </div>

          <p className="text-center text-sm md:text-base text-[#4a4f57] leading-relaxed max-w-3xl mx-auto mb-6">
            MCP credits let you use PMMSherpa across Claude.ai, Claude Code, ChatGPT, Codex,
            Gemini CLI, and Antigravity. Each query costs 2 credits. Topup credits never expire.
          </p>

          <div className="flex justify-center">
            <Link href="/docs">
              <Button
                variant="ghost"
                className="gap-2 rounded-full text-[#0058be] hover:text-[#004a9e] hover:bg-[#0058be]/[0.06] font-medium"
              >
                See setup guide <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
