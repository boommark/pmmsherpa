import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
      // Check if profile is complete — new users (e.g., first Google sign-in) need to finish setup
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', user.id)
          .single() as { data: { profile_completed: boolean } | null }

        if (profile && !profile.profile_completed) {
          return NextResponse.redirect(`${origin}/complete-profile`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Code exchange error:', error)
    // If this was a recovery flow and PKCE failed (e.g. different browser/tab),
    // redirect to forgot-password so user can try again, not the login page
    if (isRecovery) {
      return NextResponse.redirect(`${origin}/forgot-password?error=expired`)
    }
    return NextResponse.redirect(`${origin}/login?error=auth_error`)
  }

  // Handle recovery/magic link tokens
  if (token_hash && type) {
    const supabase = await createClient()

    // Verify the OTP token
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'recovery' | 'email' | 'magiclink',
    })

    if (error) {
      console.error('OTP verification error:', error)
      return NextResponse.redirect(`${origin}/login?error=invalid_token`)
    }

    // For recovery tokens, redirect to password setup page
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/set-password`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  // No code or token - redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
