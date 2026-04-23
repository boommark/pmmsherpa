'use client'

import { useChatStore } from '@/stores/chatStore'
import { cn } from '@/lib/utils'
import { getMonthlyLimitForTier } from '@/lib/constants'

export function UsageCounter() {
  const { messagesRemaining, userTier } = useChatStore()

  // Not yet fetched — render nothing to avoid flash
  if (messagesRemaining === null) return null

  // Founders bypass the gate entirely.
  if (userTier === 'founder') {
    return (
      <p className="text-xs text-muted-foreground/60 mt-1.5 text-left pl-1">
        Unlimited messages
      </p>
    )
  }

  const limit = getMonthlyLimitForTier(userTier ?? 'free')
  // Color thresholds scale with the cap: green > 50%, amber > 20%, red below.
  const greenThreshold = Math.ceil(limit * 0.5)
  const amberThreshold = Math.ceil(limit * 0.2)
  const colorClass = messagesRemaining >= greenThreshold
    ? 'text-green-600 dark:text-green-400'
    : messagesRemaining >= amberThreshold
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-red-500 dark:text-red-400'

  return (
    <p className={cn('text-xs mt-1.5 text-left pl-1', colorClass)}>
      {messagesRemaining} of {limit} messages remaining this month
    </p>
  )
}
