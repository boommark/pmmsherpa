'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/stores/chatStore'

function formatResetDate(isoString: string | null): string {
  if (!isoString) return 'next month'
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function ExhaustionModal() {
  const { showExhaustionModal, resetAt, setShowExhaustionModal } = useChatStore()

  return (
    <Dialog open={showExhaustionModal} onOpenChange={(open) => { if (!open) setShowExhaustionModal(false) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You&apos;ve used all your free messages</DialogTitle>
          <DialogDescription>
            Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Resets on {formatResetDate(resetAt)}
        </p>
        <div className="flex flex-col gap-3 mt-2">
          <Button asChild className="w-full bg-[#0058be] hover:bg-[#004a9e] text-white">
            <a href="/pricing">Upgrade to Starter — $11.99/mo</a>
          </Button>
          <button
            onClick={() => setShowExhaustionModal(false)}
            className="text-sm text-muted-foreground hover:text-foreground text-center"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
