#!/usr/bin/env node
// Schedule the 7-part onboarding broadcast series on Resend.
// - Tuesdays 7:00 AM PT (14:00 UTC during PDT), spaced 2 weeks apart.
// - Day 7 pushed to Wed 2026-09-02 per request.
// - Injects unsubscribe footer into each day-N.html before sending.
// - Sends a test email to abhishekratna@gmail.com for each day after scheduling.

import { Resend } from 'resend'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const resend = new Resend(process.env.RESEND_API_KEY)

const AUDIENCE_ID = '9a13ec93-4d2c-422c-9576-e4f74bead02b'
const FROM = 'Dona at PMM Sherpa <support@pmmsherpa.com>'
const REPLY_TO = 'support@pmmsherpa.com'
const TEST_TO = 'abhishekratna@gmail.com'
const DRAFTS_DIR = join(__dirname, '..', 'email-drafts', 'onboarding-series')

const SCHEDULE = [
  { day: 1, subject: "GTM strategy shouldn't take weeks of guesswork",        scheduledAt: '2026-06-09T14:00:00Z', label: 'Tue 2026-06-09 07:00 PT' },
  { day: 2, subject: "Your landing page might be working against you",         scheduledAt: '2026-06-23T14:00:00Z', label: 'Tue 2026-06-23 07:00 PT' },
  { day: 3, subject: "PMM Sherpa works on your career too",                    scheduledAt: '2026-07-07T14:00:00Z', label: 'Tue 2026-07-07 07:00 PT' },
  { day: 4, subject: "Positioning that doesn't sound like every other SaaS",   scheduledAt: '2026-07-21T14:00:00Z', label: 'Tue 2026-07-21 07:00 PT' },
  { day: 5, subject: "Stop guessing on pricing",                               scheduledAt: '2026-08-04T14:00:00Z', label: 'Tue 2026-08-04 07:00 PT' },
  { day: 6, subject: "Launches fail when alignment breaks down",               scheduledAt: '2026-08-18T14:00:00Z', label: 'Tue 2026-08-18 07:00 PT' },
  { day: 7, subject: "Sales needs a battlecard by tomorrow morning",           scheduledAt: '2026-09-02T14:00:00Z', label: 'Wed 2026-09-02 07:00 PT' },
]

const UNSUBSCRIBE_ROW_BROADCAST = `<tr><td style="padding:16px 40px 24px 40px;border-top:1px solid #eef0f4;text-align:center;">
<p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">
  <a href="https://pmmsherpa.com" style="color:#9ca3af;text-decoration:none;">pmmsherpa.com</a>
  <span style="color:#d1d5db;padding:0 6px;">&middot;</span>
  <a href="mailto:support@pmmsherpa.com" style="color:#9ca3af;text-decoration:none;">support@pmmsherpa.com</a>
  <span style="color:#d1d5db;padding:0 6px;">&middot;</span>
  <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
</p>
</td></tr>
`

// For the test send via resend.emails.send (not a broadcast), the
// {{{RESEND_UNSUBSCRIBE_URL}}} token does not get substituted. Swap to a
// placeholder URL so the link still renders.
const UNSUBSCRIBE_ROW_TEST = UNSUBSCRIBE_ROW_BROADCAST.replace(
  '{{{RESEND_UNSUBSCRIBE_URL}}}',
  'https://pmmsherpa.com/unsubscribe-preview'
)

function injectUnsubscribe(html, row) {
  // Insert the new row right after the existing sign-off row, before the
  // inner-table close. The HTMLs end with:
  //   </td></tr>\n</table>\n</td></tr>\n</table>\n</body>
  const marker = '</td></tr>\n</table>\n</td></tr>\n</table>\n</body>'
  if (!html.includes(marker)) {
    throw new Error('Could not find footer marker — HTML structure changed')
  }
  return html.replace(
    marker,
    `</td></tr>\n${row}</table>\n</td></tr>\n</table>\n</body>`
  )
}

async function main() {
  const results = []

  for (const item of SCHEDULE) {
    console.log(`\n=== Day ${item.day}: ${item.subject} ===`)
    console.log(`   Scheduled: ${item.label} (${item.scheduledAt})`)

    const src = readFileSync(join(DRAFTS_DIR, `day-${item.day}.html`), 'utf8')
    const htmlBroadcast = injectUnsubscribe(src, UNSUBSCRIBE_ROW_BROADCAST)
    const htmlTest = injectUnsubscribe(src, UNSUBSCRIBE_ROW_TEST)

    // 1) Create the broadcast
    const created = await resend.broadcasts.create({
      audienceId: AUDIENCE_ID,
      from: FROM,
      replyTo: REPLY_TO,
      subject: item.subject,
      html: htmlBroadcast,
      name: `Onboarding Day ${item.day} — ${item.label}`,
    })
    if (created.error) {
      console.error(`   CREATE FAILED:`, created.error)
      results.push({ day: item.day, broadcastId: null, error: created.error })
      continue
    }
    const broadcastId = created.data?.id
    console.log(`   Broadcast created: ${broadcastId}`)

    // 2) Schedule the broadcast
    const scheduled = await resend.broadcasts.send(broadcastId, {
      scheduledAt: item.scheduledAt,
    })
    if (scheduled.error) {
      console.error(`   SCHEDULE FAILED:`, scheduled.error)
      results.push({ day: item.day, broadcastId, error: scheduled.error })
      continue
    }
    console.log(`   Scheduled for ${item.scheduledAt}`)

    // 3) Send a test copy (not via broadcast, so it does not consume the audience)
    const testSubject = `[TEST · Day ${item.day}] ${item.subject}`
    const test = await resend.emails.send({
      from: FROM,
      to: TEST_TO,
      replyTo: REPLY_TO,
      subject: testSubject,
      html: htmlTest,
    })
    if (test.error) {
      console.error(`   TEST SEND FAILED:`, test.error)
      results.push({ day: item.day, broadcastId, testId: null, error: test.error })
      continue
    }
    console.log(`   Test sent to ${TEST_TO} (id: ${test.data?.id})`)

    results.push({
      day: item.day,
      broadcastId,
      testEmailId: test.data?.id,
      scheduledAt: item.scheduledAt,
      label: item.label,
      subject: item.subject,
    })
  }

  console.log('\n\n=========== SUMMARY ===========')
  console.log(JSON.stringify(results, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
