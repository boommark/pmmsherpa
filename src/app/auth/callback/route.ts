import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { runPostSignupOnce } from '@/lib/auth/post-signup'

const REFERRAL_COOKIE = 'pmmsherpa_ref'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('redirect_to') ?? searchParams.get('next') ?? '/chat'
  const isRecovery = next === '/set-password' || type === 'recovery'

  // Handle PKCE code exchange (standard login + Google OAuth flow)
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // First-time signup → run post-signup work, then mark profile complete.
        // Idempotent: subsequent logins skip the body via the profile_completed guard.
        try {
          const referralCode = request.cookies.get(REFERRAL_COOKIE)?.value || null
          await runPostSignupOnce(user.id, {
            referralCode,
            authProvider: user.app_metadata?.provider,
          })
        } catch (e) {
          console.error('[auth/callback] post-signup failed:', e)
          // Non-fatal — user can still proceed; we'll retry on next login.
        }
      }
      const response = NextResponse.redirect(`${origin}${next}`)
      response.cookies.delete(REFERRAL_COOKIE)
      return response
    }
    console.error('Code exchange error:', error)
    if (isRecovery) {
      return NextResponse.redirect(`${origin}/forgot-password?error=expired`)
    }
    return NextResponse.redirect(`${origin}/login?error=auth_error`)
  }

  // Handle recovery/magic link tokens
  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'recovery' | 'email' | 'magiclink',
    })

    if (error) {
      console.error('OTP verification error:', error)
      return NextResponse.redirect(`${origin}/login?error=invalid_token`)
    }

    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/set-password`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login`)
}
