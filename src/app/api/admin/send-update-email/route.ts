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
              <td style="padding: 0 40px 32px 40px;">
                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Hey ${firstName},</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">You've probably noticed something about AI writing. It's correct. It's structured. And the moment you read it, you know exactly what it is.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">That's the problem I couldn't stop thinking about. Not whether Sherpa gives good advice. It does. But whether the advice lands the way it would from a sharp colleague who's been in the role for fifteen years. The kind who skips the preamble, tells you the story that matters, and trusts you to figure out the implications.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">So I rebuilt the voice. Not the model. Not the retrieval. The actual writing system underneath.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;">Here's everything that shipped this week.</p>

                <!-- Divider -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
                  <tr><td style="border-top: 1px solid #e5e7eb;"></td></tr>
                </table>

                <!-- Feature: Voice -->
                <p style="font-size: 13px; font-weight: 700; color: #0058be; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">A voice that doesn't sound like AI</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Four iterations over two weeks. I went through Strunk's Elements of Style, Roy Peter Clark's Writing Tools, and Donovan's book on TED talks, and distilled them into rules that govern every sentence Sherpa produces. Active verbs. Subject first. Shortest sentence for your sharpest insight. And the one that changed everything: progressive reveal. Instead of announcing "I will now discuss the bowling pin strategy," Sherpa tells you what VAST Data did. Then names the pattern in the middle of the story. You discover the framework. You don't get lectured about it.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;">The first iteration was tight but clinical. The second was grounded but bossy. The third was respectful but still presentational. The fourth thinks through the problem alongside you. That's the version running right now.</p>

                <!-- Divider -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
                  <tr><td style="border-top: 1px solid #e5e7eb;"></td></tr>
                </table>

                <!-- Feature: Screenshot -->
                <p style="font-size: 13px; font-weight: 700; color: #0058be; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Screenshot paste with real vision</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;">Cmd+V a screenshot straight into the chat. A competitor's landing page. A Gong call summary. A pricing table you're trying to make sense of. Sherpa doesn't just acknowledge the image. It reads it, analyzes it, and responds to what's actually on the screen.</p>

                <!-- Divider -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
                  <tr><td style="border-top: 1px solid #e5e7eb;"></td></tr>
                </table>

                <!-- Feature: Web browsing -->
                <p style="font-size: 13px; font-weight: 700; color: #0058be; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Live web browsing</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;">When your question needs current information, Sherpa now searches the web in real time and reads the actual pages. Not cached summaries. Not stale snippets. The live content, pulled and analyzed while you wait. Useful when you're tracking a competitor launch, researching a market, or validating something you heard in a meeting.</p>

                <!-- Divider -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
                  <tr><td style="border-top: 1px solid #e5e7eb;"></td></tr>
                </table>

                <!-- Feature: File handling -->
                <p style="font-size: 13px; font-weight: 700; color: #0058be; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Smarter file handling</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;">Upload a PDF, a Word doc, or a plain text file and Sherpa extracts the content and uses it as context for your conversation. The upload pipeline is faster and more reliable now, so you can drop in a research report or a draft brief and start working with it immediately.</p>

                <!-- Divider -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
                  <tr><td style="border-top: 1px solid #e5e7eb;"></td></tr>
                </table>

                <!-- Feature: Sidebar -->
                <p style="font-size: 13px; font-weight: 700; color: #0058be; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Cleaner conversation management</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;">Your sidebar now has a three-dot menu for renaming and deleting chats. The new chat screen loads instantly without the scroll jump. Small things, but the kind that make the difference between a tool you tolerate and one you actually want to open.</p>

                <!-- Divider -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
                  <tr><td style="border-top: 1px solid #e5e7eb;"></td></tr>
                </table>

                <!-- Prompts section -->
                <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 16px 0;">Three things to try this week</p>

                <p style="font-size: 15px; line-height: 1.7; color: #6b7280; margin: 0 0 16px 0;">Paste one of these into the chat and see what comes back.</p>

                <!-- Prompt 1 -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px 0;">
                  <tr>
                    <td style="background: #f0f6ff; border-radius: 8px; padding: 16px 20px;">
                      <p style="font-size: 14px; font-weight: 600; color: #0058be; margin: 0 0 6px 0;">Pressure-test your positioning</p>
                      <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0; font-style: italic;">"Here's our positioning statement: [paste yours]. Poke holes in it. Where would a skeptical buyer push back?"</p>
                    </td>
                  </tr>
                </table>

                <!-- Prompt 2 -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px 0;">
                  <tr>
                    <td style="background: #f0f6ff; border-radius: 8px; padding: 16px 20px;">
                      <p style="font-size: 14px; font-weight: 600; color: #0058be; margin: 0 0 6px 0;">Screenshot a competitor</p>
                      <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0; font-style: italic;">"Cmd+V their landing page or pricing table straight into the chat. Then ask: What are they really selling, and where's the opening for us?"</p>
                    </td>
                  </tr>
                </table>

                <!-- Prompt 3 -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
                  <tr>
                    <td style="background: #f0f6ff; border-radius: 8px; padding: 16px 20px;">
                      <p style="font-size: 14px; font-weight: 600; color: #0058be; margin: 0 0 6px 0;">Prep for a hard conversation</p>
                      <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0; font-style: italic;">"I need to convince my VP of Product that we should delay launch by two weeks to fix our messaging. Give me the three strongest arguments and the one thing I should not say."</p>
                    </td>
                  </tr>
                </table>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 24px 0;">The voice difference is something you feel, not something I can describe in an email. Try one of those prompts. If the response reads like it came from a person who's been thinking about your problem, that's the whole point.</p>

                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="${APP_URL}/chat" style="display: inline-block; background-color: #0058be; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Try it now</a>
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
      subject: "Sherpa doesn't sound like AI anymore",
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
