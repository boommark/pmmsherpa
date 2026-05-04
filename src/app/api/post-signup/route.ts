import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runPostSignupOnce } from '@/lib/auth/post-signup'

/**
 * Idempotent post-signup endpoint. Called from the email-signup page when
 * Supabase returns an immediate session (i.e., email confirmation disabled).
 * For the standard flows (Google OAuth + email confirmation), /auth/callback
 * runs the same helper directly server-side.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let referralCode: string | null = null
  try {
    const body = await request.json()
    if (typeof body?.referralCode === 'string') referralCode = body.referralCode
  } catch {
    // empty body is fine
  }

  try {
    await runPostSignupOnce(user.id, {
      referralCode,
      authProvider: user.app_metadata?.provider,
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[api/post-signup]', e)
    return NextResponse.json({ error: 'Post-signup failed' }, { status: 500 })
  }
}
