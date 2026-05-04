/**
 * Idempotent post-signup work — runs ONCE per user on first authenticated visit.
 *
 * Triggered from /auth/callback (Google OAuth + email confirmation) and
 * /api/post-signup (immediate-session email signup, when email confirmation
 * is disabled). Both paths converge here so we don't duplicate sends.
 *
 * Side effects on first call:
 *   - Generate a referral code (name prefix + UUID suffix)
 *   - Mark profile_completed = true
 *   - Apply inbound referral attribution (if referral code provided)
 *   - Add the user to the Resend "General" audience
 *   - Send the onboarding email
 *   - Send admin notification
 *
 * Subsequent calls are no-ops via the profile_completed guard.
 */

import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import {
  SUPER_ADMIN_EMAIL,
  REFERRAL_THRESHOLD,
  REFERRAL_REWARD_DAYS,
  REFERRAL_MAX_ACCESS_DAYS,
  REFERRAL_MAX_MILESTONES,
} from '@/lib/constants'
import { getOnboardingEmail, getReferralRewardEmail } from '@/lib/email/templates'

let resend: Resend | null = null
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

interface PostSignupOptions {
  referralCode?: string | null
  authProvider?: string
}

export async function runPostSignupOnce(
  userId: string,
  opts: PostSignupOptions = {}
): Promise<{ alreadyRan: boolean }> {
  const serviceClient = await createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (serviceClient.from('profiles') as any)
    .select('profile_completed, email, full_name, tier, referral_code')
    .eq('id', userId)
    .single()

  if (existing?.profile_completed === true) {
    return { alreadyRan: true }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await (serviceClient.auth as any).admin.getUserById(userId)
  if (!user) return { alreadyRan: true }

  const userName: string =
    user.user_metadata?.full_name || user.user_metadata?.name || existing?.full_name || 'User'
  const userEmail: string = user.email || existing?.email || ''
  const namePart =
    userName.split(' ')[0].replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 6) || 'USER'
  const uuidSuffix = userId.replace(/-/g, '').toUpperCase().slice(-4)
  const myReferralCode: string = existing?.referral_code || `${namePart}-${uuidSuffix}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (serviceClient.from('profiles') as any)
    .update({
      consent_given: true,
      profile_completed: true,
      referral_code: myReferralCode,
    })
    .eq('id', userId)

  if (updateError) {
    console.error('[PostSignup] Profile update error:', updateError)
    throw new Error('Failed to mark profile complete')
  }

  // --- Referral attribution ---
  const inboundReferralCode = opts.referralCode?.trim().toUpperCase()
  if (inboundReferralCode) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: referrer } = await (serviceClient.from('profiles') as any)
        .select('id, email, full_name, referral_count, referral_rewards_granted, starter_access_until')
        .eq('referral_code', inboundReferralCode)
        .neq('id', userId)
        .single()

      if (referrer) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (serviceClient.from('profiles') as any)
          .update({ referred_by: referrer.id })
          .eq('id', userId)
          .is('referred_by', null)

        const newCount = referrer.referral_count + 1
        const expectedMilestones = Math.min(
          Math.floor(newCount / REFERRAL_THRESHOLD),
          REFERRAL_MAX_MILESTONES
        )
        const milestonesToGrant = expectedMilestones - referrer.referral_rewards_granted

        let newAccessUntil = referrer.starter_access_until
        let rewardGranted = false

        if (milestonesToGrant > 0) {
          const now = new Date()
          const maxUntil = new Date(now.getTime() + REFERRAL_MAX_ACCESS_DAYS * 24 * 60 * 60 * 1000)
          const baseDate =
            newAccessUntil && new Date(newAccessUntil) > now ? new Date(newAccessUntil) : now
          const extended = new Date(
            baseDate.getTime() + milestonesToGrant * REFERRAL_REWARD_DAYS * 24 * 60 * 60 * 1000
          )
          newAccessUntil = (extended < maxUntil ? extended : maxUntil).toISOString()
          rewardGranted = true
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (serviceClient.from('profiles') as any)
          .update({
            referral_count: newCount,
            referral_rewards_granted: expectedMilestones,
            ...(rewardGranted ? { starter_access_until: newAccessUntil } : {}),
          })
          .eq('id', referrer.id)

        if (rewardGranted && newAccessUntil) {
          try {
            const rewardEmail = getReferralRewardEmail({
              fullName: referrer.full_name || 'there',
              email: referrer.email,
              referralCount: newCount,
              unlockedAt: new Date().toISOString(),
              accessUntil: newAccessUntil,
            })
            await getResend().emails.send({
              from: 'PMM Sherpa <support@pmmsherpa.com>',
              replyTo: 'abhishekratna@gmail.com',
              to: referrer.email,
              subject: rewardEmail.subject,
              html: rewardEmail.html,
              text: rewardEmail.text,
            })
          } catch (e) {
            console.error('[PostSignup] Failed to send referral reward email:', e)
          }
        }
      }
    } catch (e) {
      console.error('[PostSignup] Referral attribution error:', e)
    }
  }

  // --- Add to Resend audience (General) ---
  try {
    const nameParts = userName.trim().split(' ')
    await getResend().contacts.create({
      audienceId: '9a13ec93-4d2c-422c-9576-e4f74bead02b',
      email: userEmail,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      unsubscribed: false,
    })
  } catch (e) {
    console.error('[PostSignup] Failed to add contact to Resend audience:', e)
  }

  // --- Onboarding email ---
  try {
    const userTier = (existing?.tier as 'free' | 'starter') || 'free'
    const onboarding = getOnboardingEmail({
      fullName: userName,
      email: userEmail,
      referralCode: myReferralCode,
      tier: userTier === 'starter' ? 'starter' : 'free',
    })
    await getResend().emails.send({
      from: 'PMM Sherpa <support@pmmsherpa.com>',
      replyTo: 'abhishekratna@gmail.com',
      to: onboarding.to,
      subject: onboarding.subject,
      html: onboarding.html,
      text: onboarding.text,
    })
  } catch (e) {
    console.error('[PostSignup] Failed to send onboarding email:', e)
  }

  // --- Admin notification ---
  try {
    const provider = opts.authProvider || user.app_metadata?.provider || 'email'
    await getResend().emails.send({
      from: 'PMM Sherpa <noreply@pmmsherpa.com>',
      to: SUPER_ADMIN_EMAIL,
      subject: `New signup: ${userName}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0058be; margin-bottom: 16px;">New User Signup</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${userName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Email</td><td style="padding: 8px 0; font-weight: 600;">${userEmail}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Auth Provider</td><td style="padding: 8px 0;">${provider}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Referred by code</td><td style="padding: 8px 0;">${inboundReferralCode || '—'}</td></tr>
          </table>
        </div>
      `,
    })
  } catch (e) {
    console.error('[PostSignup] Failed to send admin notification:', e)
  }

  return { alreadyRan: false }
}
