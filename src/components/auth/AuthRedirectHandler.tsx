'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import posthog from 'posthog-js'

/**
 * Handles auth redirects that arrive via URL hash fragment (implicit flow).
 * When a password reset link uses implicit flow, the recovery token lands in
 * the hash (e.g., #access_token=...&type=recovery). The Supabase client
 * detects this and fires a PASSWORD_RECOVERY event, which we use to redirect
 * to the set-password page.
 */
export function AuthRedirectHandler() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          router.push('/set-password')
        }
        if (event === 'SIGNED_IN' && session?.user) {
          posthog.identify(session.user.id, {
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  return null
}
