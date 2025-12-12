'use client'

import { Loader2 } from 'lucide-react'

interface StatusIndicatorProps {
  message: string
}

export function StatusIndicator({ message }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>{message}</span>
    </div>
  )
}
