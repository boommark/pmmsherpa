#!/usr/bin/env node
import { Resend } from 'resend'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { register } from 'tsx/esm/api'

register()

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const { getOnboardingEmail } = await import('../src/lib/email/templates.ts')

const resend = new Resend(process.env.RESEND_API_KEY)

const TEST_TO = process.argv[2] || 'abhishekratna@gmail.com'
const TIER = (process.argv[3] === 'starter' ? 'starter' : 'free')

const email = getOnboardingEmail({
  fullName: 'Abhishek Ratna',
  email: TEST_TO,
  referralCode: 'abhishek-test',
  tier: TIER,
})

console.log(`Sending onboarding test (${TIER}) to ${TEST_TO}...`)
const { data, error } = await resend.emails.send({
  from: 'Dona at PMM Sherpa <hello@pmmsherpa.com>',
  replyTo: 'abhishekratna@gmail.com',
  to: TEST_TO,
  subject: `[TEST] ${email.subject}`,
  html: email.html,
  text: email.text,
})

if (error) {
  console.error('Send failed:', error)
  process.exit(1)
}

console.log('Sent. Resend ID:', data?.id)
