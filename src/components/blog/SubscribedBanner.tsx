'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, X } from 'lucide-react'

function Banner() {
  const searchParams = useSearchParams()
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || searchParams.get('subscribed') !== '1') return null
  return (
    <div
      role="status"
      className="mb-8 flex items-start justify-between gap-3 rounded-xl border border-[#16a34a]/25 bg-[#16a34a]/[0.06] px-4 py-3 dark:border-[#4ade80]/25 dark:bg-[#4ade80]/[0.08]"
    >
      <div className="flex items-start gap-2.5 text-sm text-[#166534] dark:text-[#86efac]">
        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          <span className="font-semibold">You&apos;re subscribed.</span> New posts will land in
          your inbox.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="text-[#166534]/60 hover:text-[#166534] dark:text-[#86efac]/60 dark:hover:text-[#86efac] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/** Shows a success banner on /blog?subscribed=1 (post-confirmation redirect). */
export function SubscribedBanner() {
  return (
    <Suspense fallback={null}>
      <Banner />
    </Suspense>
  )
}
