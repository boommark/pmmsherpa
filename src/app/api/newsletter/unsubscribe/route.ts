import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role: newsletter_subscribers is RLS deny-all
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pmmsherpa.com'
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function confirmationPage(title: string, message: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>${title} | PMM Sherpa</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f7f9fc; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px 32px; text-align: center; box-shadow: 0 2px 20px rgba(0,0,0,0.06);">
      <h1 style="font-size: 22px; color: #191c1e; margin: 0 0 12px;">${title}</h1>
      <p style="font-size: 15px; color: #4a4f57; line-height: 1.6; margin: 0 0 24px;">${message}</p>
      <a href="${APP_URL}/blog" style="display: inline-block; background: #0058be; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 11px 28px; border-radius: 9999px;">Back to the blog</a>
    </div>
  </body>
</html>`
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token') ?? ''
    if (!UUID_REGEX.test(token)) {
      return NextResponse.json({ error: 'Invalid unsubscribe link.' }, { status: 400 })
    }

    const { data: subscriber, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
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
        { error: 'This unsubscribe link is invalid or has expired.' },
        { status: 400 }
      )
    }

    if (subscriber.status !== 'unsubscribed') {
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'unsubscribed' })
        .eq('id', subscriber.id)

      if (updateError) {
        console.error('Error unsubscribing newsletter subscriber:', updateError)
        return NextResponse.json(
          { error: 'Something went wrong. Please try again.' },
          { status: 500 }
        )
      }
    }

    return confirmationPage(
      "You're unsubscribed",
      "You won't receive any more blog emails from PMM Sherpa. Changed your mind? You can re-subscribe on the blog anytime."
    )
  } catch (error) {
    console.error('Error processing newsletter unsubscribe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
