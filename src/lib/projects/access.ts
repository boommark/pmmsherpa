/**
 * Plan gate for the Projects feature.
 *
 * Projects are a paid feature: available to 'starter' and 'founder' tiers
 * (including time-boxed referral-granted starter access). Free-tier users
 * get a 403 with an upgrade message. Ownership checks stay in auth.ts —
 * this module only answers "may this user use Projects at all?".
 */

import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getEffectiveTier } from '@/lib/constants'

export const PROJECTS_UPGRADE_MESSAGE =
  'Projects are available on the Starter plan. Upgrade to create and use projects.'

export function canUseProjects(
  tier: string,
  starterAccessUntil: string | null | undefined,
): boolean {
  return getEffectiveTier(tier, starterAccessUntil) !== 'free'
}

/**
 * Read the caller's profile and verify they're on a paid tier.
 * Returns null when allowed, or a ready-to-return 403/500 response.
 */
export async function requireProjectsTier(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: SupabaseClient<any>,
  userId: string,
): Promise<NextResponse | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (service.from('profiles') as any)
    .select('tier, starter_access_until')
    .eq('id', userId)
    .single()

  if (error || !data) {
    console.error('[Projects] tier lookup failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  if (!canUseProjects(data.tier, data.starter_access_until)) {
    return NextResponse.json({ error: PROJECTS_UPGRADE_MESSAGE }, { status: 403 })
  }
  return null
}
