#!/usr/bin/env node
import { Resend } from 'resend'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local'), quiet: true })

const resend = new Resend(process.env.RESEND_API_KEY)

const AUDIENCE_ID = '9a13ec93-4d2c-422c-9576-e4f74bead02b'
const LOGO_URL = 'https://pmmsherpa.com/email/logo-blue.png'
const COHORT_URL = 'https://maven.com/abhishek-ratna/master-claude-code-pm-gtm'
const APP_URL = 'https://pmmsherpa.com'

const SUBJECT = 'Join my upcoming Maven Masterclass to build your own PMM Sherpa'
const FROM = 'PMM Sherpa <support@pmmsherpa.com>'
const REPLY_TO = 'abhishekratna@gmail.com'
const NAME = 'Maven cohort announcement (2026-05-28)'

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
              <td align="center" style="padding: 32px 0 24px 0;">
                <img src="${LOGO_URL}" alt="PMM Sherpa" width="56" height="56" style="border-radius: 12px;" />
              </td>
            </tr>
            <tr>
              <td style="padding: 0 40px 32px 40px;">
                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Hi,</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Announcing my next cohort for all want-to-be product builders.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;"><a href="${COHORT_URL}" style="color: #0058be; text-decoration: none; font-weight: 600;">Master Claude Code for Product Building and Agentic GTM</a> is a 6-week live cohort on Maven. It starts <strong>June 2</strong>.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">This isn't just theory. I used Claude Code to build PMM Sherpa from scratch. 56 sessions, 1.35 billion tokens, just me and Claude Code created a platform that now boasts 200+ users across 12 countries.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;">The cohort is me teaching everything I learned in those sessions across the foundations, the mistakes, the architecture decisions.</p>

                <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 12px 0;">Here's what you'll actually learn across the six weeks</p>

                <p style="font-size: 16px; line-height: 1.8; color: #1f2937; margin: 0 0 28px 0;">
                  &#9656; How LLMs and agents work, a genuine from-scratch understanding, not a hand-wavy overview<br>
                  &#9656; Claude Code from zero: CLAUDE.md, subagents, hooks, and MCP, the full toolkit<br>
                  &#9656; How to define and instrument evals so your product doesn't drift once it ships<br>
                  &#9656; GTM strategy and positioning for AI products, drawing on lessons from my time at Google, Meta, Atlassian, and Databricks<br>
                  &#9656; How to build multi-agent marketing systems, real pipelines that handle research, positioning, messaging, and content generation together
                </p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">No prior coding experience required. Every session is live. You'll have office hours, a peer community, lifetime access to recordings, and a real project you've built by the end.</p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Reimbursable as L&amp;D if your company covers it (I've included a reimbursement template on the page).</p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0; background-color: #eff6ff; border-radius: 8px;">
                  <tr>
                    <td style="padding: 16px 20px;">
                      <p style="font-size: 15px; line-height: 1.6; color: #1f2937; margin: 0;"><strong style="color: #0058be;">Paid subscribers are eligible for an exclusive 20% discount.</strong> If you're a paid member, please email <a href="mailto:support@pmmsherpa.com" style="color: #0058be; text-decoration: none; font-weight: 600;">support@pmmsherpa.com</a> to request the code.</p>
                    </td>
                  </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                  <tr>
                    <td align="center">
                      <a href="${COHORT_URL}" style="display: inline-block; background-color: #0058be; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reserve your spot</a>
                    </td>
                  </tr>
                </table>

                <p style="font-size: 15px; line-height: 1.7; color: #6b7280; margin: 0 0 28px 0; text-align: center;">
                  Or browse the syllabus at <a href="${COHORT_URL}" style="color: #0058be; text-decoration: none;">maven.com/abhishek-ratna/master-claude-code-pm-gtm</a>
                </p>

                <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Happy to answer any questions if you want to know more before signing up.</p>

                <p style="font-size: 16px; color: #1f2937; margin: 0 0 4px 0;"><strong>Dona</strong></p>
                <p style="font-size: 14px; color: #6b7280; margin: 0;"><a href="mailto:support@pmmsherpa.com" style="color: #6b7280; text-decoration: none;">support@pmmsherpa.com</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="font-size: 13px; color: #9ca3af; margin: 0;">
                  <a href="${APP_URL}" style="color: #9ca3af; text-decoration: none;">pmmsherpa.com</a>
                  <span style="color: #d1d5db; padding: 0 6px;">&middot;</span>
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

const MODE = process.argv[2] || 'create'

async function main() {
  if (MODE === 'test') {
    console.log('Sending test email to abhishekratna@gmail.com...')
    const r = await resend.emails.send({
      from: FROM,
      to: 'abhishekratna@gmail.com',
      replyTo: REPLY_TO,
      subject: `[TEST] ${SUBJECT}`,
      html: HTML.replace('{{{RESEND_UNSUBSCRIBE_URL}}}', 'https://pmmsherpa.com'),
    })
    if (r.error) {
      console.error('Test failed:', r.error)
      process.exit(1)
    }
    console.log('Test sent. id:', r.data?.id)
    return
  }

  if (MODE === 'create') {
    console.log('Creating Resend broadcast (draft, not scheduled)...')
    const created = await resend.broadcasts.create({
      audienceId: AUDIENCE_ID,
      from: FROM,
      replyTo: REPLY_TO,
      subject: SUBJECT,
      html: HTML,
      name: NAME,
    })
    if (created.error) {
      console.error('Create failed:', created.error)
      process.exit(1)
    }
    console.log('Created broadcast id:', created.data?.id)
    console.log('View: https://resend.com/broadcasts/' + created.data?.id)
    console.log('\nNot sent. Run with `send <id> <ISO-datetime>` to schedule.')
    return
  }

  if (MODE === 'send') {
    const id = process.argv[3]
    const scheduledAt = process.argv[4]
    if (!id) { console.error('Need broadcast id'); process.exit(1) }
    const args = scheduledAt ? { scheduledAt } : {}
    const r = await resend.broadcasts.send(id, args)
    if (r.error) { console.error('Send failed:', r.error); process.exit(1) }
    console.log('Sent/scheduled:', JSON.stringify(r.data, null, 2))
    return
  }

  console.error('Usage: node create-maven-broadcast.mjs [test|create|send <id> [scheduledAt]]')
  process.exit(1)
}

main().catch((e) => { console.error(e); process.exit(1) })
