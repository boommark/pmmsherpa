#!/usr/bin/env node
// Finish the partial run of schedule-onboarding-series.mjs:
//  - Create the Day 7 broadcast (failed on rate limit).
//  - Send a test email for Days 4-7 (we created the Day 4-6 broadcasts but
//    couldn't schedule them because Resend rejects scheduled_at > 30 days).
//  - Days 4-7 will be left as Resend drafts (broadcast objects exist but are
//    not yet scheduled). A separate script will run later to schedule each
//    one once it falls within the 30-day window.

import { Resend } from 'resend'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const resend = new Resend(process.env.RESEND_API_KEY)

const AUDIENCE_ID = '9a13ec93-4d2c-422c-9576-e4f74bead02b'
const FROM = 'PMM Sherpa <hello@pmmsherpa.com>'
const REPLY_TO = 'hello@pmmsherpa.com'
const TEST_TO = 'abhishekratna@gmail.com'
const DRAFTS_DIR = join(__dirname, '..', 'email-drafts', 'onboarding-series')

// Days 4-6: broadcast objects already created (couldn't schedule due to 30-day limit)
// Day 7: needs broadcast object created (rate-limit aborted the previous run)
const ITEMS = [
  { day: 4, subject: "Positioning that doesn't sound like every other SaaS",   scheduledAt: '2026-07-21T14:00:00Z', label: 'Tue 2026-07-21 07:00 PT', existingBroadcastId: '196b121b-3ce7-49ba-8ff9-52e6cf662abc' },
  { day: 5, subject: "Stop guessing on pricing",                               scheduledAt: '2026-08-04T14:00:00Z', label: 'Tue 2026-08-04 07:00 PT', existingBroadcastId: '359707aa-8c7b-4812-931f-e34c934d26de' },
  { day: 6, subject: "Launches fail when alignment breaks down",               scheduledAt: '2026-08-18T14:00:00Z', label: 'Tue 2026-08-18 07:00 PT', existingBroadcastId: '5e15aaf2-7c4a-4fa4-8d9b-b37a7b75a981' },
  { day: 7, subject: "Sales needs a battlecard by tomorrow morning",           scheduledAt: '2026-09-02T14:00:00Z', label: 'Wed 2026-09-02 07:00 PT', existingBroadcastId: null },
]

const UNSUBSCRIBE_ROW_BROADCAST = `<tr><td style="padding:16px 40px 24px 40px;border-top:1px solid #eef0f4;text-align:center;">
<p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">
  <a href="https://pmmsherpa.com" style="color:#9ca3af;text-decoration:none;">pmmsherpa.com</a>
  <span style="color:#d1d5db;padding:0 6px;">&middot;</span>
  <a href="mailto:hello@pmmsherpa.com" style="color:#9ca3af;text-decoration:none;">hello@pmmsherpa.com</a>
  <span style="color:#d1d5db;padding:0 6px;">&middot;</span>
  <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
</p>
</td></tr>
`

const UNSUBSCRIBE_ROW_TEST = UNSUBSCRIBE_ROW_BROADCAST.replace(
  '{{{RESEND_UNSUBSCRIBE_URL}}}',
  'https://pmmsherpa.com/unsubscribe-preview'
)

function injectUnsubscribe(html, row) {
  const marker = '</td></tr>\n</table>\n</td></tr>\n</table>\n</body>'
  if (!html.includes(marker)) {
    throw new Error('Could not find footer marker — HTML structure changed')
  }
  return html.replace(marker, `</td></tr>\n${row}</table>\n</td></tr>\n</table>\n</body>`)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const results = []

  for (const item of ITEMS) {
    console.log(`\n=== Day ${item.day}: ${item.subject} ===`)

    const src = readFileSync(join(DRAFTS_DIR, `day-${item.day}.html`), 'utf8')
    const htmlBroadcast = injectUnsubscribe(src, UNSUBSCRIBE_ROW_BROADCAST)
    const htmlTest = injectUnsubscribe(src, UNSUBSCRIBE_ROW_TEST)

    let broadcastId = item.existingBroadcastId

    // Create the broadcast if it didn't exist (Day 7)
    if (!broadcastId) {
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
        await sleep(400)
        continue
      }
      broadcastId = created.data?.id
      console.log(`   Broadcast created: ${broadcastId}`)
      await sleep(400)
    } else {
      console.log(`   Broadcast already exists: ${broadcastId}`)
    }

    // Send test email (NOT a broadcast — does not consume the audience)
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
      results.push({ day: item.day, broadcastId, testEmailId: null, error: test.error })
      await sleep(400)
      continue
    }
    console.log(`   Test sent to ${TEST_TO} (id: ${test.data?.id})`)

    results.push({
      day: item.day,
      broadcastId,
      testEmailId: test.data?.id,
      targetScheduledAt: item.scheduledAt,
      label: item.label,
      subject: item.subject,
      status: 'draft (not yet scheduled — outside 30-day window)',
    })
    await sleep(400)
  }

  console.log('\n\n=========== SUMMARY ===========')
  console.log(JSON.stringify(results, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
