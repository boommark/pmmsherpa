/**
 * Skeleton Message Component
 *
 * Displays a loading placeholder animation while AI is generating a response.
 * Uses pulse animation for a smooth, professional loading state.
 */

import { Bot } from 'lucide-react'

export function SkeletonMessage() {
  return (
    <div className="flex gap-2 sm:gap-2.5 md:gap-3 items-start animate-pulse">
      {/* Avatar skeleton */}
      <div className="flex-shrink-0">
        <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
          <Bot className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  )
}

/**
 * Compact Skeleton Message
 *
 * Smaller version for use in tight spaces or mobile views
 */
export function SkeletonMessageCompact() {
  return (
    <div className="flex gap-2 items-start animate-pulse">
      <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  )
}
