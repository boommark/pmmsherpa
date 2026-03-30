import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const LOGO_URL = 'https://pmmsherpa.com/email/logo-blue.png'
const YT_THUMBNAIL_URL = 'https://pmmsherpa.com/email/yt-thumbnail-demo01.png'
const YOUTUBE_URL = 'https://youtu.be/ONkeE5T20Mk?si=p6N_nLePyPZlhc8-'
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
              <td style="padding: 0 40px 32px 40px;">
                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Hey ${firstName},</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">You know that moment when you're staring at your homepage copy and something feels off, but you can't tell if it's actually off or if you've just been looking at it too long?</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">I had that moment last week. So I did something I probably should have done earlier: I ran my own homepage through PMMSherpa.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">It rewrote the whole thing. A little humbling, I won't lie. But it was also the best proof point I could have asked for, because it didn't just clean up my sentences. It strengthened the message underneath them.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">That's the distinction most AI tools miss entirely. Copy is the words. Messaging is the foundation underneath the words: what your customer actually struggles with, what your product actually does about it, and the principles that hold up when someone pushes back.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 24px 0;">I recorded the whole process. My old copy goes in, a sharper version comes out, and you can see exactly what changed and why.</p>

                <!-- YouTube Thumbnail -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                  <tr>
                    <td align="center">
                      <a href="${YOUTUBE_URL}" target="_blank" style="display: block; text-decoration: none;">
                        <img src="${YT_THUMBNAIL_URL}" alt="Watch the demo" width="520" style="max-width: 100%; border-radius: 8px; display: block;" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 10px;">
                      <a href="${YOUTUBE_URL}" target="_blank" style="font-size: 14px; color: #0058be; text-decoration: none; font-weight: 500;">&#9654; Watch the demo</a>
                    </td>
                  </tr>
                </table>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">If you've been meaning to revisit your own messaging, or if you've got a launch coming up and want to pressure-test your positioning before it goes live, this is a good time. PMMSherpa is free to try right now, for a limited time.</p>

                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="${APP_URL}/chat" style="display: inline-block; background-color: #0058be; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Try PMMSherpa</a>
                    </td>
                  </tr>
                </table>

                <!-- Sign off -->
                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 32px 0 4px 0;">Talk soon,</p>
                <p style="font-size: 16px; color: #1f2937; margin: 0 0 4px 0;"><strong>Abhishek</strong></p>
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
    const { testEmail } = await request.json()

    if (!testEmail) {
      return NextResponse.json({ error: 'testEmail required' }, { status: 400 })
    }

    const firstName = testEmail.split('@')[0].split('.')[0]
    const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

    const { data, error } = await resend.emails.send({
      from: 'PMMSherpa <hello@pmmsherpa.com>',
      to: testEmail,
      subject: "I ran my own homepage through PMMSherpa.",
      html: getUpdateEmailHtml(capitalizedName),
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
