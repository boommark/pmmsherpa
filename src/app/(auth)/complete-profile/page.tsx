'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BlobBackground } from '@/components/ui/blob-background'
import { AnimatedOrb } from '@/components/ui/animated-orb'
import { Loader2, CheckCircle2 } from 'lucide-react'
import posthog from 'posthog-js'

export default function CompleteProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    linkedinUrl: '',
  })

  // Pre-fill from authenticated user
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email || '')
      setUserName(user.user_metadata?.full_name || user.user_metadata?.name || '')

      // If the user cancelled out of Stripe but their profile is already complete,
      // send them to settings where they can upgrade — don't strand them on an empty form.
      const cancelled = new URLSearchParams(window.location.search).get('cancelled')
      if (cancelled === 'true') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', user.id)
          .single() as { data: { profile_completed: boolean } | null }
        if (profile?.profile_completed) {
          router.replace('/settings?upgrade=true')
          return
        }
      }
    }
    loadUser()
  }, [supabase, router])

  const validateLinkedInUrl = (url: string): boolean => {
    if (!url) return false
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i
    return linkedinRegex.test(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.linkedinUrl) {
      setError('LinkedIn profile is required')
      return
    }

    if (!validateLinkedInUrl(formData.linkedinUrl)) {
      setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)')
      return
    }

    setIsLoading(true)

    try {
      const referralCode = typeof window !== 'undefined' ? localStorage.getItem('pmmsherpa_ref') : null
      const response = await fetch('/api/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl: formData.linkedinUrl,
          consentGiven: true,
          termsAccepted: true,
          ...(referralCode ? { referralCode } : {}),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete profile')
      }

      if (typeof window !== 'undefined') localStorage.removeItem('pmmsherpa_ref')

      posthog.capture('profile_completed', { plan: 'free' })

      setIsSubmitted(true)
      setTimeout(() => {
        router.push('/chat')
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#111418] p-4 relative overflow-hidden">
        <BlobBackground />
        <div className="w-full max-w-md relative z-10">
          <div className="rounded-2xl bg-white/80 dark:bg-[#1e2125]/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,88,190,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-[#e8ecf4]/60 dark:border-transparent p-8 text-center">
            <div className="mx-auto mb-6 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-[#191c1e] dark:text-[#e2e4e8]">You&apos;re all set!</h1>
            <p className="text-muted-foreground">
              Taking you to PMM Sherpa...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#111418] p-4 relative overflow-hidden">
      <BlobBackground />

      <div className="w-full max-w-lg relative z-10 my-8">
        <div className="rounded-2xl bg-white/80 dark:bg-[#1e2125]/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,88,190,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-[#e8ecf4]/60 dark:border-transparent p-8">
          {/* Header — orb only, no duplicate logo */}
          <div className="text-center space-y-3 mb-8">
            <div className="flex justify-center mb-4">
              <AnimatedOrb size="md" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0058be] to-[#3b82f6] bg-clip-text text-transparent">
              {userName ? `Welcome, ${userName}!` : 'Almost there!'}
            </h1>
            <p className="text-muted-foreground text-sm">
              One quick step — share your LinkedIn so we know who&apos;s joining.
            </p>
          </div>

          {/* Pre-filled info */}
          {userEmail && (
            <div className="mb-6 p-3 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30] text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{userEmail}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className="text-sm font-medium">LinkedIn Profile *</Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                required
                className="h-11 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30] border-none focus:bg-[#d8e2ff] dark:focus:bg-[#33363b] focus:ring-0 transition-colors"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#0058be] hover:bg-[#004a9e] shadow-none font-medium text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Get Started'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              By continuing, you agree to our{' '}
              <Link href="/terms" target="_blank" className="text-[#0058be] dark:text-[#a8c0f0] hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" target="_blank" className="text-[#0058be] dark:text-[#a8c0f0] hover:underline">
                Privacy Policy
              </Link>
              , and to receive product updates from PMM Sherpa. You can unsubscribe anytime.
            </p>
          </form>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            You&apos;ll start on the Free plan. Upgrade to Starter anytime from{' '}
            <Link href="/settings" className="text-[#0058be] dark:text-[#a8c0f0] hover:underline">
              Settings
            </Link>
            .
          </p>
        </div>

        <div className="text-center mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            &larr; Back to home
          </Link>
          <span className="text-[#e5e7eb] dark:text-[#3a3d42]">|</span>
          <a href="mailto:support@pmmsherpa.com" className="hover:text-foreground transition-colors">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}
