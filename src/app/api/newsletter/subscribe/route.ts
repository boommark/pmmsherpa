import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getNewsletterConfirmEmail } from '@/lib/email/templates'

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

// Light per-IP in-memory rate limit (v1; resets on cold start, per-instance)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 6
const hitsByIp = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (hitsByIp.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (hits.length >= RATE_LIMIT_MAX) {
    hitsByIp.set(ip, hits)
    return true
  }
  hits.push(now)
  hitsByIp.set(ip, hits)
  return false
}

const CONFIRM_MESSAGE =
  'Almost there — check your inbox and click the confirmation link.'
const ALREADY_SUBSCRIBED_MESSAGE = "You're already subscribed. Nothing more to do!"

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    const email =
      typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const source =
      typeof body?.source === 'string' ? body.source.slice(0, 120) : null

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const { data: existing, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('id, status, confirm_token')
      .eq('email', email)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching newsletter subscriber:', fetchError)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    // Re-subscribing a confirmed email is a friendly no-op
    if (existing?.status === 'confirmed') {
      return NextResponse.json({ success: true, message: ALREADY_SUBSCRIBED_MESSAGE })
    }

    const confirmToken = randomUUID()
    if (existing) {
      // pending (resend confirmation) or unsubscribed (re-opt-in) → back to pending
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'pending', source, confirm_token: confirmToken })
        .eq('id', existing.id)
      if (updateError) {
        console.error('Error updating newsletter subscriber:', updateError)
        return NextResponse.json(
          { error: 'Something went wrong. Please try again.' },
          { status: 500 }
        )
      }
    } else {
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, status: 'pending', source, confirm_token: confirmToken })
      if (insertError) {
        console.error('Error inserting newsletter subscriber:', insertError)
        return NextResponse.json(
          { error: 'Something went wrong. Please try again.' },
          { status: 500 }
        )
      }
    }

    const emailTemplate = getNewsletterConfirmEmail({
      email,
      confirmUrl: `${APP_URL}/api/newsletter/confirm?token=${confirmToken}`,
      unsubscribeUrl: `${APP_URL}/api/newsletter/unsubscribe?token=${confirmToken}`,
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
      console.error('Error sending newsletter confirmation email:', emailError)
      return NextResponse.json(
        { error: 'Could not send the confirmation email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: CONFIRM_MESSAGE })
  } catch (error) {
    console.error('Error processing newsletter subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
