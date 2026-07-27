import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const LOGO_URL = 'https://pmmsherpa.com/email/logo-blue.png'
const APP_URL = 'https://pmmsherpa.com'

function getUpdateEmailHtml(firstName: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <!-- Logo -->
            <tr>
              <td align="center" style="padding: 32px 0 16px 0;">
                <img src="${LOGO_URL}" alt="PMM Sherpa" width="56" height="56" style="border-radius: 12px;" />
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 8px 40px 32px 40px;">
                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Hey ${firstName},</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">If you asked Sherpa something earlier today and watched it think, then come back with nothing at all, that was not you. That was us.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">For a few hours today, a backend API issue on our side caused responses to fail silently. Your messages went through, Sherpa looked like it was analyzing, and then nothing showed up. To make it worse, those attempts still counted against your monthly chats.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 12px 0;"><strong>Here is where things stand:</strong></p>

                <p style="font-size: 16px; line-height: 1.8; color: #1f2937; margin: 0 0 20px 0;">
                  &#9656; The issue is fixed, and everything has been running normally since this afternoon<br>
                  &#9656; Every chat those failed messages used has been restored to your account<br>
                  &#9656; We're adding safeguards so a failure like this shows a clear error instead of a blank screen
                </p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;">No action needed on your end. If anything still feels off, just reply to this email and I will personally take a look.</p>

                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
                  <tr>
                    <td align="center">
                      <a href="${APP_URL}/chat" style="display: inline-block; background-color: #0058be; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Pick up where you left off</a>
                    </td>
                  </tr>
                </table>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Sorry for the bump, and thank you for your patience.</p>

                <!-- Sign off -->
                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 8px 0 4px 0;">With gratitude,</p>
                <p style="font-size: 16px; color: #1f2937; margin: 0 0 4px 0;"><strong>Dona</strong></p>
                <p style="font-size: 14px; color: #6b7280; margin: 0;"><a href="mailto:support@pmmsherpa.com" style="color: #6b7280; text-decoration: none;">support@pmmsherpa.com</a></p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="font-size: 13px; color: #9ca3af; margin: 0;"><a href="${APP_URL}" style="color: #9ca3af; text-decoration: none;">pmmsherpa.com</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const { testEmail, firstName } = await request.json()

    if (!testEmail) {
      return NextResponse.json({ error: 'testEmail required' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'PMM Sherpa <support@pmmsherpa.com>',
      to: testEmail,
      subject: 'About today\'s blank responses (fixed, and your chats restored)',
      html: getUpdateEmailHtml(firstName || 'there'),
    })

    if (error) {
      console.error('Email send error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Send update email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
