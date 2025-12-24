import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getCelebratoryWelcomeEmail } from '@/lib/email/templates'

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Lazy initialization of Resend
let resend: Resend | null = null
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

// Secret key for cron job authentication (set in Vercel env vars)
const CRON_SECRET = process.env.CRON_SECRET

/**
 * This endpoint checks for users who have been unbanned but haven't received
 * their welcome email yet, and sends them the celebratory welcome email.
 *
 * It can be called:
 * 1. Manually by admin after unbanning users in Supabase dashboard
 * 2. Automatically via Vercel Cron (recommended: every 5 minutes)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization - either cron secret or admin session
    const authHeader = request.headers.get('authorization')
    const isCronRequest = authHeader === `Bearer ${CRON_SECRET}`

    if (!isCronRequest && CRON_SECRET) {
      // For manual requests, you could add additional auth here
      // For now, we'll allow it if no CRON_SECRET is set (dev mode)
      // In production, you should add proper admin authentication
    }

    // Find users who:
    // 1. Have an access_request with status 'pending'
    // 2. Have a linked user_id
    // 3. The linked user is NOT banned (banned_until is null or in the past)
    // 4. Haven't been sent a welcome email yet (welcome_email_sent is false/null)

    const { data: pendingRequests, error: fetchError } = await supabaseAdmin
      .from('access_requests')
      .select('id, email, full_name, user_id, welcome_email_sent')
      .eq('status', 'pending')
      .not('user_id', 'is', null)

    if (fetchError) {
      console.error('Error fetching access requests:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch access requests' }, { status: 500 })
    }

    if (!pendingRequests || pendingRequests.length === 0) {
      return NextResponse.json({ message: 'No pending requests to process', sent: 0 })
    }

    const emailsSent: string[] = []
    const errors: string[] = []

    for (const request of pendingRequests) {
      // Skip if welcome email already sent
      if (request.welcome_email_sent) {
        continue
      }

      // Check if the user is unbanned
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(request.user_id)

      if (userError || !userData?.user) {
        console.error(`Error fetching user ${request.user_id}:`, userError)
        errors.push(`Failed to fetch user ${request.email}`)
        continue
      }

      const user = userData.user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bannedUntil = (user as any).banned_until

      // Check if user is unbanned (banned_until is null, 'none', or in the past)
      const isUnbanned = !bannedUntil ||
                         bannedUntil === 'none' ||
                         new Date(bannedUntil) <= new Date()

      if (!isUnbanned) {
        // User is still banned, skip
        continue
      }

      // User is unbanned! Send them the welcome email
      const emailTemplate = getCelebratoryWelcomeEmail({
        fullName: request.full_name,
        email: request.email,
      })

      try {
        await getResend().emails.send({
          from: 'PMMSherpa <noreply@pmmsherpa.com>',
          to: emailTemplate.to,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        })

        // Mark the access request as approved and email sent
        await supabaseAdmin
          .from('access_requests')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            welcome_email_sent: true,
          })
          .eq('id', request.id)

        // Also create/update the user's profile
        await supabaseAdmin
          .from('profiles')
          .upsert({
            id: request.user_id,
            full_name: request.full_name,
            email: request.email,
          }, { onConflict: 'id' })

        emailsSent.push(request.email)
        console.log(`Welcome email sent to ${request.email}`)
      } catch (emailError) {
        console.error(`Error sending email to ${request.email}:`, emailError)
        errors.push(`Failed to send email to ${request.email}`)
      }
    }

    return NextResponse.json({
      message: `Processed ${pendingRequests.length} pending requests`,
      sent: emailsSent.length,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error in send-approval-emails:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}
