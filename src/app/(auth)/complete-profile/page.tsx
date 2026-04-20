'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { BlobBackground } from '@/components/ui/blob-background'
import { AnimatedOrb } from '@/components/ui/animated-orb'
import { USE_CASES } from '@/lib/constants'
import { Loader2, CheckCircle2, Zap, Gift } from 'lucide-react'

export default function CompleteProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [selectedPlan, setSelectedPlan] = useState<'free' | 'starter'>('free')

  const [formData, setFormData] = useState({
    linkedinUrl: '',
    profession: '',
    company: '',
    useCases: [] as string[],
    consentGiven: false,
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
    }
    loadUser()
  }, [supabase, router])

  const handleUseCaseToggle = (useCase: string) => {
    setFormData(prev => ({
      ...prev,
      useCases: prev.useCases.includes(useCase)
        ? prev.useCases.filter(u => u !== useCase)
        : [...prev.useCases, useCase]
    }))
  }

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

    if (formData.useCases.length === 0) {
      setError('Please select at least one area of interest')
      return
    }

    if (!formData.consentGiven) {
      setError('Please accept the communication consent to continue')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl: formData.linkedinUrl,
          profession: formData.profession || null,
          company: formData.company || null,
          useCases: formData.useCases,
          consentGiven: formData.consentGiven,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete profile')
      }

      // If user chose Starter, redirect to Stripe Checkout
      if (selectedPlan === 'starter') {
        const checkoutResp = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_1TO9jf0VHMhK76TXbpK6gwMr' }),
        })
        const checkoutData = await checkoutResp.json()
        if (checkoutData.url) {
          window.location.href = checkoutData.url
          return
        }
      }

      // Free plan — go straight to chat
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
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex justify-center mb-4">
              <AnimatedOrb size="sm" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#0058be] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 20L7 10l5 6 4-10 6 14" />
                </svg>
              </div>
              <span className="text-xl font-bold text-[#0058be] dark:text-[#a8c0f0]">
                PMMSherpa
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#191c1e] dark:text-[#e2e4e8]">Complete Your Profile</h1>
            <p className="text-muted-foreground text-sm">
              {userName ? `Welcome, ${userName}! ` : ''}Tell us a bit about yourself so we can personalize your experience.
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profession" className="text-sm font-medium">Role</Label>
                <Input
                  id="profession"
                  placeholder="Product Marketing Manager"
                  value={formData.profession}
                  onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                  className="h-11 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30] border-none focus:bg-[#d8e2ff] dark:focus:bg-[#33363b] focus:ring-0 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="h-11 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30] border-none focus:bg-[#d8e2ff] dark:focus:bg-[#33363b] focus:ring-0 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">What are you interested in? *</Label>
              <div className="grid gap-3 sm:grid-cols-2 p-4 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30]">
                {USE_CASES.map((useCase) => (
                  <div key={useCase} className="flex items-center space-x-2">
                    <Checkbox
                      id={`uc-${useCase}`}
                      checked={formData.useCases.includes(useCase)}
                      onCheckedChange={() => handleUseCaseToggle(useCase)}
                      className="border-[#0058be]/30 data-[state=checked]:bg-[#0058be] data-[state=checked]:border-[#0058be]"
                    />
                    <label htmlFor={`uc-${useCase}`} className="text-sm cursor-pointer leading-tight">
                      {useCase}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Choose your plan</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('free')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPlan === 'free'
                      ? 'border-[#0058be] bg-[#0058be]/5 dark:bg-[#0058be]/10'
                      : 'border-[#e5e7eb] dark:border-[#3a3d42] hover:border-[#0058be]/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-4 w-4 text-[#0058be]" />
                    <span className="font-semibold text-sm">Free</span>
                  </div>
                  <p className="text-xs text-muted-foreground">10 messages per month</p>
                  <p className="text-lg font-bold mt-1">$0</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan('starter')}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                    selectedPlan === 'starter'
                      ? 'border-[#0058be] bg-[#0058be]/5 dark:bg-[#0058be]/10'
                      : 'border-[#e5e7eb] dark:border-[#3a3d42] hover:border-[#0058be]/50'
                  }`}
                >
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-[#0058be] text-white text-[10px] font-semibold rounded-full uppercase tracking-wide">
                    Recommended
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-[#0058be]" />
                    <span className="font-semibold text-sm">Starter</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Unlimited chats, all models</p>
                  <p className="text-lg font-bold mt-1">$9.99<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                </button>
              </div>
            </div>

            {/* Consent checkbox */}
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30]">
              <Checkbox
                id="consent"
                checked={formData.consentGiven}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consentGiven: checked === true }))}
                className="mt-0.5 border-[#0058be]/30 data-[state=checked]:bg-[#0058be] data-[state=checked]:border-[#0058be]"
              />
              <label htmlFor="consent" className="text-sm cursor-pointer leading-relaxed text-muted-foreground">
                I understand that PMM Sherpa or its founders may reach out to me with product notification emails and promotional emails. *
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#0058be] hover:bg-[#004a9e] shadow-none font-medium text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedPlan === 'starter' ? 'Proceeding to payment...' : 'Saving...'}
                </>
              ) : (
                selectedPlan === 'starter' ? 'Continue to Payment' : 'Get Started Free'
              )}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
