import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('redirect_to') ?? searchParams.get('next') ?? '/chat'

  // Handle PKCE code exchange (standard login flow)
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Code exchange error:', error)
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
