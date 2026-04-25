import type { UserTier } from '@/lib/constants'

export function canAccessDecks(tier: UserTier | string): boolean {
  return tier === 'starter' || tier === 'founder'
}

export const DECKS_UPGRADE_MESSAGE =
  'Artifact exports are available on Starter. Upgrade for $9.99/mo to generate and download battle cards, launch decks, messaging frameworks, and more.'
