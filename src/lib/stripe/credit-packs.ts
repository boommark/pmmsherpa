/**
 * Credit pack catalog for the MCP credit system.
 *
 * One-time-payment SKUs sold via /api/stripe/checkout-credits. Each pack
 * grants `credits` to `profiles.mcp_credits_purchased_remaining` on the
 * checkout.session.completed webhook.
 *
 * Price IDs are populated by `scripts/setup-credit-packs.ts` against both
 * live and test Stripe modes. Prefer the env override when present (so the
 * runtime can read the test ID in dev/staging) and fall back to the
 * compiled-in default for prod.
 *
 * Env vars (set via .env.local / Vercel project env):
 *   STRIPE_PRICE_CREDITS_50_LIVE
 *   STRIPE_PRICE_CREDITS_125_LIVE
 *   STRIPE_PRICE_CREDITS_200_LIVE
 *   STRIPE_PRICE_CREDITS_50_TEST
 *   STRIPE_PRICE_CREDITS_125_TEST
 *   STRIPE_PRICE_CREDITS_200_TEST
 *
 * Mode is detected from STRIPE_SECRET_KEY (sk_live_* vs sk_test_*).
 */

export type CreditPackId = 'pmm_credits_50' | 'pmm_credits_125' | 'pmm_credits_200'

export interface CreditPack {
  id: CreditPackId
  /** Stripe Product `name` (also used as `lookup_key` and metadata.pack). */
  name: CreditPackId
  /** Human-readable label for receipts / UI. */
  label: string
  /** Price in USD (whole dollars). */
  priceUsd: number
  /** Amount in cents for Stripe `unit_amount`. */
  unitAmount: number
  /** Number of MCP credits granted on a successful purchase. */
  credits: number
}

export const CREDIT_PACKS: Record<CreditPackId, CreditPack> = {
  pmm_credits_50: {
    id: 'pmm_credits_50',
    name: 'pmm_credits_50',
    label: '50 MCP credits',
    priceUsd: 5,
    unitAmount: 500,
    credits: 50,
  },
  pmm_credits_125: {
    id: 'pmm_credits_125',
    name: 'pmm_credits_125',
    label: '125 MCP credits',
    priceUsd: 10,
    unitAmount: 1000,
    credits: 125,
  },
  pmm_credits_200: {
    id: 'pmm_credits_200',
    name: 'pmm_credits_200',
    label: '200 MCP credits',
    priceUsd: 15,
    unitAmount: 1500,
    credits: 200,
  },
}

export function isCreditPackId(value: unknown): value is CreditPackId {
  return (
    typeof value === 'string' &&
    (value === 'pmm_credits_50' || value === 'pmm_credits_125' || value === 'pmm_credits_200')
  )
}

/** True if the configured Stripe secret key is a test-mode key. */
export function isTestMode(secretKey: string | undefined = process.env.STRIPE_SECRET_KEY): boolean {
  return !!secretKey && secretKey.startsWith('sk_test_')
}

/**
 * Resolve the Stripe `price` ID for a pack at runtime, choosing test or
 * live depending on STRIPE_SECRET_KEY. Throws if no env var is set.
 */
export function getPriceIdForPack(pack: CreditPackId): string {
  const test = isTestMode()
  const envName: Record<CreditPackId, [string, string]> = {
    pmm_credits_50: ['STRIPE_PRICE_CREDITS_50_TEST', 'STRIPE_PRICE_CREDITS_50_LIVE'],
    pmm_credits_125: ['STRIPE_PRICE_CREDITS_125_TEST', 'STRIPE_PRICE_CREDITS_125_LIVE'],
    pmm_credits_200: ['STRIPE_PRICE_CREDITS_200_TEST', 'STRIPE_PRICE_CREDITS_200_LIVE'],
  }
  const [testEnv, liveEnv] = envName[pack]
  const value = test ? process.env[testEnv] : process.env[liveEnv]
  if (!value) {
    throw new Error(
      `Missing Stripe price ID env var for ${pack} (mode=${test ? 'test' : 'live'}). ` +
        `Run scripts/setup-credit-packs.ts to provision and capture price IDs.`,
    )
  }
  return value
}
