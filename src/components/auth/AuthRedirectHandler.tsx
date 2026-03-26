'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          router.push('/set-password')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  return null
}
