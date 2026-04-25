import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { SUPER_ADMIN_EMAIL, REFERRAL_THRESHOLD, REFERRAL_REWARD_DAYS, REFERRAL_MAX_ACCESS_DAYS, REFERRAL_MAX_MILESTONES } from '@/lib/constants'
import { getOnboardingEmail, getReferralRewardEmail } from '@/lib/email/templates'

let resend: Resend | null = null
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { linkedinUrl, consentGiven, termsAccepted, referralCode: inboundReferralCode } = body

    if (!linkedinUrl) {
      return NextResponse.json({ error: 'LinkedIn profile URL is required' }, { status: 400 })
    }

    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i
    if (!linkedinRegex.test(linkedinUrl)) {
      return NextResponse.json({ error: 'Invalid LinkedIn profile URL' }, { status: 400 })
    }

    if (!consentGiven) {
      return NextResponse.json({ error: 'Communication consent is required' }, { status: 400 })
    }

    if (!termsAccepted) {
      return NextResponse.json({ error: 'You must accept the Terms of Service and Privacy Policy' }, { status: 400 })
    }

    const serviceClient = await createServiceClient()

    // Check if profile was already completed — guards duplicate sends and re-attribution
    const { data: existing } = await serviceClient
      .from('profiles')
      .select('profile_completed, email, full_name, tier, referral_code')
      .eq('id', user.id)
      .single() as { data: { profile_completed: boolean; email: string; full_name: string; tier: string; referral_code: string | null } | null }
    const alreadyCompleted = existing?.profile_completed === true

    // Generate a deterministic referral code for this user (name prefix + UUID suffix)
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'User'
    const namePart = userName.split(' ')[0].replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 6) || 'USER'
    const uuidSuffix = user.id.replace(/-/g, '').toUpperCase().slice(-4)
    const myReferralCode = existing?.referral_code || `${namePart}-${uuidSuffix}`

    const { error: updateError } = await serviceClient
      .from('profiles')
      .update({
        linkedin_url: linkedinUrl,
        consent_given: true,
        profile_completed: true,
        referral_code: myReferralCode,
      } as never)
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Everything below only runs on first-time profile completion
    if (alreadyCompleted) return NextResponse.json({ success: true })

    const userEmail = user.email || existing?.email || ''
    const userFullName = userName

    // --- Referral attribution ---
    if (inboundReferralCode && typeof inboundReferralCode === 'string') {
      try {
        const { data: referrer } = await serviceClient
          .from('profiles')
          .select('id, email, full_name, referral_count, referral_rewards_granted, starter_access_until')
          .eq('referral_code', inboundReferralCode.trim().toUpperCase())
          .neq('id', user.id) // cannot self-refer
          .single() as {
            data: {
              id: string
              email: string
              full_name: string
              referral_count: number
              referral_rewards_granted: number
              starter_access_until: string | null
            } | null
          }

        if (referrer) {
          // Set referred_by on the new user — only if not already attributed
          await serviceClient
            .from('profiles')
            .update({ referred_by: referrer.id } as never)
            .eq('id', user.id)
            .is('referred_by' as never, null)

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

            // Extend from current access end (or now if expired/null)
            const baseDate =
              newAccessUntil && new Date(newAccessUntil) > now ? new Date(newAccessUntil) : now

            const extended = new Date(
              baseDate.getTime() + milestonesToGrant * REFERRAL_REWARD_DAYS * 24 * 60 * 60 * 1000
            )

            // Cap at 90 days from today
            newAccessUntil = (extended < maxUntil ? extended : maxUntil).toISOString()
            rewardGranted = true
          }

          await serviceClient
            .from('profiles')
            .update({
              referral_count: newCount,
              referral_rewards_granted: expectedMilestones,
              ...(rewardGranted ? { starter_access_until: newAccessUntil } : {}),
            } as never)
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
              console.error('[Referral] Failed to send reward email:', e)
            }
          }
        }
      } catch (e) {
        console.error('[Referral] Attribution error:', e)
        // Non-fatal — profile completion succeeds regardless
      }
    }

    // --- Onboarding email to new user ---
    try {
      const userTier = (existing?.tier as 'free' | 'starter') || 'free'
      const onboarding = getOnboardingEmail({
        fullName: userFullName,
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
      console.error('[Onboarding] Failed to send onboarding email:', e)
    }

    // --- Admin notification ---
    try {
      await getResend().emails.send({
        from: 'PMM Sherpa <noreply@pmmsherpa.com>',
        to: SUPER_ADMIN_EMAIL,
        subject: `New signup: ${userFullName}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0058be; margin-bottom: 16px;">New User Signup</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${userFullName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Email</td><td style="padding: 8px 0; font-weight: 600;">${userEmail}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">LinkedIn</td><td style="padding: 8px 0;"><a href="${linkedinUrl}" style="color: #0058be;">${linkedinUrl}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Auth Provider</td><td style="padding: 8px 0;">${user.app_metadata?.provider || 'email'}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Referred by code</td><td style="padding: 8px 0;">${inboundReferralCode || '—'}</td></tr>
            </table>
          </div>
        `,
      })
    } catch (e) {
      console.error('[Admin] Failed to send admin notification:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
