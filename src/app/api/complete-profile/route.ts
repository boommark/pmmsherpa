import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

let resend: Resend | null = null
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { linkedinUrl, consentGiven } = body

    if (!linkedinUrl) {
      return NextResponse.json({ error: 'LinkedIn profile URL is required' }, { status: 400 })
    }

    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i
    if (!linkedinRegex.test(linkedinUrl)) {
      return NextResponse.json({ error: 'Invalid LinkedIn profile URL' }, { status: 400 })
    }

    if (!consentGiven) {
      return NextResponse.json({ error: 'Communication consent is required' }, { status: 400 })
    }

    const serviceClient = await createServiceClient()
    const { error: updateError } = await serviceClient
      .from('profiles')
      .update({
        linkedin_url: linkedinUrl,
        consent_given: true,
        profile_completed: true,
      } as never)
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Send notification email to admin about new user signup
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'Unknown'
    try {
      await getResend().emails.send({
        from: 'PMM Sherpa <noreply@pmmsherpa.com>',
        to: SUPER_ADMIN_EMAIL,
        subject: `New signup: ${userName}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0058be; margin-bottom: 16px;">New User Signup</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${userName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Email</td><td style="padding: 8px 0; font-weight: 600;">${user.email}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">LinkedIn</td><td style="padding: 8px 0;"><a href="${linkedinUrl}" style="color: #0058be;">${linkedinUrl}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Auth Provider</td><td style="padding: 8px 0;">${user.app_metadata?.provider || 'email'}</td></tr>
            </table>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
