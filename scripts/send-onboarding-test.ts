import { config } from 'dotenv'
config({ path: '.env.local' })
import { Resend } from 'resend'
import { getOnboardingEmail } from '../src/lib/email/templates'

const TEST_TO = process.argv[2] || 'abhishekratna@gmail.com'
const TIER: 'free' | 'starter' = process.argv[3] === 'starter' ? 'starter' : 'free'

async function main() {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const email = getOnboardingEmail({
    fullName: 'Abhishek Ratna',
    email: TEST_TO,
    referralCode: 'abhishek-test',
    tier: TIER,
  })

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

  console.log(`Sent ${TIER} onboarding to ${TEST_TO}. Resend ID:`, data?.id)
}

main().catch((e) => { console.error(e); process.exit(1) })
