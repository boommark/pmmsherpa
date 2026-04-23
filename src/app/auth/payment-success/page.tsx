'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BlobBackground } from '@/components/ui/blob-background'
import { CheckCircle2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to chat after a brief success message
    const timer = setTimeout(() => {
      router.push('/chat')
      router.refresh()
    }, 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#111418] p-4 relative overflow-hidden">
      <BlobBackground />
      <div className="w-full max-w-md relative z-10">
        <div className="rounded-2xl bg-white/80 dark:bg-[#1e2125]/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,88,190,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-[#e8ecf4]/60 dark:border-transparent p-8 text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-[#191c1e] dark:text-[#e2e4e8]">
            Welcome to PMM Sherpa Starter!
          </h1>
          <p className="text-muted-foreground mb-4">
            Your subscription is active. All models, file uploads, and web research are now unlocked.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to chat...
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <a href="mailto:support@pmmsherpa.com" className="hover:text-foreground transition-colors">
            Contact Us
          </a>
          <span className="text-[#e5e7eb] dark:text-[#3a3d42]">|</span>
          <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
          <span className="text-[#e5e7eb] dark:text-[#3a3d42]">|</span>
          <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
        </div>
      </div>
    </div>
  )
}
