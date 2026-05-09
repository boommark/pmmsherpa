#!/usr/bin/env node
import { Resend } from 'resend'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const resend = new Resend(process.env.RESEND_API_KEY)

const AUDIENCE_ID = '9a13ec93-4d2c-422c-9576-e4f74bead02b'
const LOGO_URL = 'https://pmmsherpa.com/email/logo-blue.png'
const LAUNCH_IMAGE_URL = 'https://pmmsherpa.com/email/mcp-launch.png'
const APP_URL = 'https://pmmsherpa.com'
const GITHUB_URL = 'https://github.com/boommark/pmmsherpa-mcp'
const DOCS_URL = 'https://pmmsherpa.com/docs'

const SCHEDULED_AT = '2026-05-09T15:00:00Z'

const HTML = `<!DOCTYPE html>
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
            <tr>
              <td align="center" style="padding: 32px 0 16px 0;">
                <img src="${LOGO_URL}" alt="PMM Sherpa" width="56" height="56" style="border-radius: 12px;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 0 40px 24px 40px;">
                <img src="${LAUNCH_IMAGE_URL}" alt="PMM Sherpa MCP launch" width="520" style="width: 100%; max-width: 520px; height: auto; border-radius: 8px; display: block;" />
              </td>
            </tr>
            <tr>
              <td style="padding: 0 40px 32px 40px;">
                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Hi,</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">PMM Sherpa just got a major upgrade. It's now a <strong>secure MCP server with a PMM skills pack</strong> that plugs directly into Claude, ChatGPT, Claude Code, Antigravity, and Gemini CLI.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;">The senior-PMM brain you've been working with on pmmsherpa.com now shows up inside the tools you already use, with the corpus and the calibrated voice intact.</p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                  <tr><td style="border-top: 1px solid #e5e7eb;"></td></tr>
                </table>

                <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 12px 0;">What you can do with it</p>

                <p style="font-size: 16px; line-height: 1.8; color: #1f2937; margin: 0 0 28px 0;">
                  &#9656; Plan a GTM launch end-to-end with named frameworks<br>
                  &#9656; Audit your landing page or homepage in minutes<br>
                  &#9656; Draft positioning that doesn't sound like everyone else's<br>
                  &#9656; Build a competitive battlecard your sales team will actually open<br>
                  &#9656; Pressure-test pricing and packaging before you ship<br>
                  &#9656; Prep for PMM interviews with senior-level answer scaffolds
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                  <tr><td style="border-top: 1px solid #e5e7eb;"></td></tr>
                </table>

                <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 12px 0;">The bigger unlock is for your agents</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;">If you're wiring a GTM agent or a PMM workflow, Sherpa is the brain you plug in. Your agent stops reasoning like a junior. It reasons like a senior PMM from the first prompt.</p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                  <tr>
                    <td align="center">
                      <a href="${DOCS_URL}" style="display: inline-block; background-color: #0058be; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Read the docs</a>
                    </td>
                  </tr>
                </table>

                <p style="font-size: 15px; line-height: 1.7; color: #6b7280; margin: 0 0 28px 0; text-align: center;">
                  Or jump straight to the <a href="${GITHUB_URL}" style="color: #0058be; text-decoration: none; font-weight: 600;">GitHub repo</a>.
                </p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 8px 0 4px 0;">With gratitude,</p>
                <p style="font-size: 16px; color: #1f2937; margin: 0 0 4px 0;"><strong>Dona</strong></p>
                <p style="font-size: 14px; color: #6b7280; margin: 0;"><a href="mailto:support@pmmsherpa.com" style="color: #6b7280; text-decoration: none;">support@pmmsherpa.com</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="font-size: 13px; color: #9ca3af; margin: 0;">
                  <a href="${APP_URL}" style="color: #9ca3af; text-decoration: none;">pmmsherpa.com</a>
                  <span style="color: #d1d5db; padding: 0 6px;">·</span>
                  <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

const SUBJECT = 'PMM Sherpa now lives inside Claude, ChatGPT, and Claude Code'
const FROM = 'Dona at PMM Sherpa <hello@pmmsherpa.com>'
const NAME = 'MCP launch announcement (2026-05-09)'

async function main() {
  console.log('Creating Resend broadcast...')
  const created = await resend.broadcasts.create({
    audienceId: AUDIENCE_ID,
    from: FROM,
    subject: SUBJECT,
    html: HTML,
    name: NAME,
  })

  if (created.error) {
    console.error('Create failed:', created.error)
    process.exit(1)
  }

  const broadcastId = created.data?.id
  console.log('Created broadcast:', broadcastId)

  console.log(`Scheduling for ${SCHEDULED_AT} (8:00 AM PDT, 2026-05-09)...`)
  const scheduled = await resend.broadcasts.send(broadcastId, {
    scheduledAt: SCHEDULED_AT,
  })

  if (scheduled.error) {
    console.error('Schedule failed:', scheduled.error)
    process.exit(1)
  }

  console.log('Scheduled. Result:', JSON.stringify(scheduled.data, null, 2))
  console.log(`\nBroadcast ID: ${broadcastId}`)
  console.log(`View: https://resend.com/broadcasts/${broadcastId}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
