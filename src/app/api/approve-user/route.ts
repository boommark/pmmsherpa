import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getCelebratoryWelcomeEmail } from '@/lib/email/templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

let resend: Resend | null = null
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pmmsherpa.com'

function htmlPage(title: string, message: string, success: boolean) {
  const color = success ? '#0058be' : '#dc2626'
  const icon = success ? '✓' : '✗'
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:40px 20px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<div style="width:56px;height:56px;border-radius:50%;background:${color};color:#fff;font-size:28px;line-height:56px;margin:0 auto 20px;">${icon}</div>
<h1 style="font-size:22px;color:#1f2937;margin:0 0 12px;">${title}</h1>
<p style="font-size:16px;color:#374151;line-height:1.6;margin:0;">${message}</p>
</div></body></html>`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const action = searchParams.get('action') // 'approve' or 'reject'

  if (!token || !action || !['approve', 'reject'].includes(action)) {
    return new NextResponse(
      htmlPage('Invalid Request', 'Missing or invalid parameters.', false),
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Look up the access request by approval_token
  const { data: accessRequest, error: lookupError } = await supabase
    .from('access_requests')
    .select('*')
    .eq('approval_token', token)
    .single()

  if (lookupError || !accessRequest) {
    return new NextResponse(
      htmlPage('Not Found', 'This approval link is invalid or has expired.', false),
      { status: 404, headers: { 'Content-Type': 'text/html' } }
    )
  }

  if (accessRequest.status !== 'pending') {
    const already = accessRequest.status === 'approved' ? 'approved' : 'rejected'
    return new NextResponse(
      htmlPage('Already Processed', `This request was already ${already}.`, false),
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  }

  if (action === 'reject') {
    await supabase
      .from('access_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', accessRequest.id)

    return new NextResponse(
      htmlPage('Request Rejected', `Access request from ${accessRequest.full_name} (${accessRequest.email}) has been rejected.`, false),
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Action is 'approve'
  // 1. Unban the user in Supabase Auth
  if (accessRequest.user_id) {
    const { error: unbanError } = await supabase.auth.admin.updateUserById(
      accessRequest.user_id,
      { ban_duration: 'none' }
    )

    if (unbanError) {
      console.error('Error unbanning user:', unbanError)
      return new NextResponse(
        htmlPage('Error', `Failed to approve user: ${unbanError.message}`, false),
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      )
    }
  }

  // 2. Update access request status
  await supabase
    .from('access_requests')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', accessRequest.id)

  // 3. Send welcome email
  if (!accessRequest.welcome_email_sent) {
    try {
      const welcomeEmail = getCelebratoryWelcomeEmail({
        fullName: accessRequest.full_name,
        email: accessRequest.email,
      })

      await getResend().emails.send({
        from: 'PMM Sherpa <support@pmmsherpa.com>',
        replyTo: 'abhishekratna@gmail.com',
        to: welcomeEmail.to,
        subject: welcomeEmail.subject,
        html: welcomeEmail.html,
        text: welcomeEmail.text,
      })

      await supabase
        .from('access_requests')
        .update({ welcome_email_sent: true })
        .eq('id', accessRequest.id)
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't fail the approval -- user is already unbanned
    }
  }

  return new NextResponse(
    htmlPage(
      'User Approved!',
      `${accessRequest.full_name} (${accessRequest.email}) has been approved and will receive a welcome email shortly.`,
      true
    ),
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  )
}
