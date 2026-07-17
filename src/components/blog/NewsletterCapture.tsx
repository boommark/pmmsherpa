'use client'

import { useState } from 'react'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function NewsletterCapture({ source }: { source: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
        return
      }
      setStatus('success')
      setMessage(data.message || 'Check your inbox to confirm your subscription.')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section
      aria-label="Newsletter signup"
      className="rounded-2xl border border-[#e8ecf4]/70 bg-[#f7f9fc] p-6 md:p-8 dark:border-white/[0.08] dark:bg-white/[0.03]"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <Mail className="h-5 w-5 text-[#0058be] dark:text-[#5a9cf5]" strokeWidth={2} />
        <h2 className="text-lg font-bold text-[#191c1e] dark:text-white">
          Get new posts in your inbox
        </h2>
      </div>
      <p className="text-sm text-[#4a4f57] dark:text-[#8e9199] leading-relaxed mb-5 max-w-lg">
        Essays on positioning, messaging, and go-to-market — written for people who own the
        outcome. No spam, unsubscribe anytime.
      </p>
      {status === 'success' ? (
        <div className="flex items-start gap-2 text-sm text-[#16a34a] dark:text-[#4ade80]">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            aria-label="Email address"
            disabled={status === 'loading'}
            className="flex-1 h-11 rounded-full border border-[#e2e5ea] bg-white px-4 text-sm text-[#191c1e] placeholder:text-[#9ca3af] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#d8e2ff] disabled:opacity-60 dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white dark:placeholder:text-[#6b7280] dark:focus:border-[#5a9cf5] dark:focus:ring-[#0058be]/30"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="h-11 rounded-full bg-[#0058be] hover:bg-[#004a9e] text-white text-sm font-medium px-6 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subscribing…
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
      )}
      {status === 'error' && message ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{message}</p>
      ) : null}
    </section>
  )
}
