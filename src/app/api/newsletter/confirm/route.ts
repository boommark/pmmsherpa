import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getNewsletterAdminNotificationEmail } from '@/lib/email/templates'

// Use service role: newsletter_subscribers is RLS deny-all
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Lazy initialization of Resend to avoid build-time errors
let resend: Resend | null = null
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pmmsherpa.com'
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token') ?? ''
    if (!UUID_REGEX.test(token)) {
      return NextResponse.json({ error: 'Invalid confirmation link.' }, { status: 400 })
    }

    const { data: subscriber, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, status, source')
      .eq('confirm_token', token)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching newsletter subscriber:', fetchError)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    if (!subscriber) {
      return NextResponse.json(
        { error: 'This confirmation link is invalid or has expired.' },
        { status: 400 }
      )
    }

    // Already confirmed → idempotent friendly redirect
    if (subscriber.status !== 'confirmed') {
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
        .eq('id', subscriber.id)

      if (updateError) {
        console.error('Error confirming newsletter subscriber:', updateError)
        return NextResponse.json(
          { error: 'Something went wrong. Please try again.' },
          { status: 500 }
        )
      }

      // Notify admin (non-blocking; mirror access-request pattern)
      const emailTemplate = getNewsletterAdminNotificationEmail({
        email: subscriber.email,
        source: subscriber.source,
      })
      try {
        await getResend().emails.send({
          from: 'PMM Sherpa <support@pmmsherpa.com>',
          to: emailTemplate.to,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        })
      } catch (emailError) {
        console.error('Error sending admin newsletter notification:', emailError)
      }
    }

    return NextResponse.redirect(new URL('/blog?subscribed=1', APP_URL))
  } catch (error) {
    console.error('Error confirming newsletter subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
