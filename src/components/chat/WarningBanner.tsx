'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/stores/chatStore'
import { cn } from '@/lib/utils'

export function WarningBanner() {
  const { messagesRemaining } = useChatStore()
  const [dismissed, setDismissed] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setUpgrading(false)
    }
  }

  // Show when remaining is known, <= 3, and not dismissed this session
  const shouldShow = messagesRemaining !== null && messagesRemaining <= 3 && messagesRemaining > 0 && !dismissed

  if (!shouldShow) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center justify-between gap-2 px-3 py-2 mx-auto w-full max-w-3xl',
        'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800',
        'rounded-xl mb-2 text-sm text-amber-800 dark:text-amber-200',
        'animate-in slide-in-from-bottom-2 duration-200'
      )}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{messagesRemaining} message{messagesRemaining !== 1 ? 's' : ''} remaining this month</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={handleUpgrade}
          disabled={upgrading}
          className="h-7 text-xs border-amber-400 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900"
        >
          {upgrading ? 'Redirecting…' : 'Upgrade'}
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
