'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Chat error:', error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          This conversation couldn&apos;t be loaded. This might be a temporary issue — try again or start a new chat.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild className="gap-2 bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
            <Link href="/chat">
              <Home className="h-4 w-4" />
              New chat
            </Link>
          </Button>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground/50">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
