'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { BlobBackground } from '@/components/ui/blob-background'
import { AnimatedOrb } from '@/components/ui/animated-orb'
import { USE_CASES } from '@/lib/constants'
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function RequestAccessPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    profession: '',
    company: '',
    linkedinUrl: '',
    useCases: [] as string[],
  })

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

    if (!formData.fullName || !formData.email) {
      setError('Please fill in all required fields')
      return
    }

    if (!formData.password || !formData.confirmPassword) {
      setError('Please enter and confirm your password')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.linkedinUrl) {
      setError('LinkedIn profile is required')
      return
    }

    if (!validateLinkedInUrl(formData.linkedinUrl)) {
      setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)')
      return
    }

    if (formData.useCases.length === 0) {
      setError('Please select at least one use case')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          profession: formData.profession,
          company: formData.company,
          linkedinUrl: formData.linkedinUrl,
          useCases: formData.useCases,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] dark:bg-[#111418] p-4 relative overflow-hidden">
        <BlobBackground />
        <div className="w-full max-w-md relative z-10">
          <div className="rounded-2xl bg-white/80 dark:bg-[#1e2125]/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(25,28,30,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-8 text-center">
            <div className="mx-auto mb-6 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-[#191c1e] dark:text-[#e2e4e8]">Request Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your interest in PMMSherpa. We&apos;re reviewing your request and will be in touch soon.
            </p>
            <p className="text-sm text-muted-foreground mb-6 p-4 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30]">
              You&apos;ll receive an email at <strong className="text-foreground">{formData.email}</strong> once your access is approved. You can then sign in with the password you just created.
            </p>
            <Link href="/">
              <Button
                variant="outline"
                className="rounded-lg bg-white dark:bg-[#282b30] border-none shadow-none hover:bg-[#f2f4f7] dark:hover:bg-[#33363b]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] dark:bg-[#111418] p-4 relative overflow-hidden">
      <BlobBackground />

      <div className="w-full max-w-lg relative z-10 my-8">
        <div className="rounded-2xl bg-white/80 dark:bg-[#1e2125]/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(25,28,30,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-8">
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

            <h1 className="text-2xl font-bold text-[#191c1e] dark:text-[#e2e4e8]">Request Access</h1>
            <p className="text-muted-foreground text-sm">
              Your second brain for product marketing—expert knowledge, real-time research, voice conversations
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  className="h-11 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30] border-none focus:bg-[#d8e2ff] dark:focus:bg-[#33363b] focus:ring-0 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="h-11 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30] border-none focus:bg-[#d8e2ff] dark:focus:bg-[#33363b] focus:ring-0 transition-colors"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="h-11 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30] border-none focus:bg-[#d8e2ff] dark:focus:bg-[#33363b] focus:ring-0 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="h-11 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30] border-none focus:bg-[#d8e2ff] dark:focus:bg-[#33363b] focus:ring-0 transition-colors"
                />
              </div>
            </div>

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
              <p className="text-xs text-muted-foreground">
                We use this to verify your professional background
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-11 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30] border-none focus:bg-[#d8e2ff] dark:focus:bg-[#33363b] focus:ring-0 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession" className="text-sm font-medium">Profession</Label>
                <Input
                  id="profession"
                  placeholder="Product Marketing Manager"
                  value={formData.profession}
                  onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                  className="h-11 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30] border-none focus:bg-[#d8e2ff] dark:focus:bg-[#33363b] focus:ring-0 transition-colors"
                />
              </div>
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

            <div className="space-y-3">
              <Label className="text-sm font-medium">What do you want to use PMMSherpa for? *</Label>
              <div className="grid gap-3 sm:grid-cols-2 p-4 rounded-xl bg-[#f2f4f7] dark:bg-[#282b30]">
                {USE_CASES.map((useCase) => (
                  <div key={useCase} className="flex items-center space-x-2">
                    <Checkbox
                      id={useCase}
                      checked={formData.useCases.includes(useCase)}
                      onCheckedChange={() => handleUseCaseToggle(useCase)}
                      className="border-[#0058be]/30 data-[state=checked]:bg-[#0058be] data-[state=checked]:border-[#0058be]"
                    />
                    <label
                      htmlFor={useCase}
                      className="text-sm cursor-pointer leading-tight"
                    >
                      {useCase}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#0058be] hover:bg-[#004a9e] shadow-none font-medium text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Request Access'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#0058be] dark:text-[#a8c0f0] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
