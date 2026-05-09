/**
 * Provision (or look up) the three MCP credit-pack Stripe products + prices
 * in BOTH live and test mode. Idempotent — uses `lookup_keys` so reruns
 * find existing prices instead of creating duplicates.
 *
 * Reads two keys from .env.local: STRIPE_SECRET_KEY (live) and
 * STRIPE_SECRET_KEY_TEST. If either is missing the script skips that mode
 * with a warning.
 *
 * Run: `npx tsx scripts/setup-credit-packs.ts`
 *
 * Output: prints the resulting price IDs as KEY=VALUE lines that can be
 * pasted into .env.local / Vercel.
 */

import * as dotenv from 'dotenv'
import * as path from 'node:path'
// Load .env.local explicitly (Next convention) before reading any keys.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config() // .env fallback
import Stripe from 'stripe'
import { CREDIT_PACKS, type CreditPackId } from '../src/lib/stripe/credit-packs'

interface ProvisionResult {
  pack: CreditPackId
  productId: string
  priceId: string
}

async function ensurePack(stripe: Stripe, pack: CreditPackId): Promise<ProvisionResult> {
  const cfg = CREDIT_PACKS[pack]
  const lookupKey = cfg.name

  // ------ Find or create the product ------
  // Stripe doesn't support product lookup_keys, so we list by name match.
  const existingProducts = await stripe.products.search({
    query: `name:'${cfg.name}'`,
    limit: 1,
  })

  let product: Stripe.Product
  if (existingProducts.data.length > 0) {
    product = existingProducts.data[0]
  } else {
    product = await stripe.products.create({
      name: cfg.name,
      description: `${cfg.label} for the PMM Sherpa MCP server.`,
      metadata: {
        pack: cfg.name,
        credits: String(cfg.credits),
      },
    })
  }

  // ------ Find or create the price (lookup_key keyed by pack name) ------
  const existingPrices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  })

  let price: Stripe.Price
  if (existingPrices.data.length > 0) {
    price = existingPrices.data[0]
    // Sanity: if the existing price doesn't match unit_amount or currency,
    // surface a loud error rather than silently use a wrong price.
    if (price.unit_amount !== cfg.unitAmount || price.currency !== 'usd') {
      throw new Error(
        `Existing price ${price.id} for lookup_key ${lookupKey} has unit_amount=${price.unit_amount}, ` +
          `currency=${price.currency}; expected ${cfg.unitAmount} USD. Refusing to overwrite — ` +
          `archive the old price in Stripe and rerun.`,
      )
    }
  } else {
    price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: cfg.unitAmount,
      lookup_key: lookupKey,
      metadata: {
        pack: cfg.name,
        credits: String(cfg.credits),
      },
    })
  }

  return { pack, productId: product.id, priceId: price.id }
}

async function provisionMode(label: 'live' | 'test', secretKey: string): Promise<void> {
  console.log(`\n=== ${label.toUpperCase()} MODE ===`)
  const stripe = new Stripe(secretKey, { typescript: true })

  const results: ProvisionResult[] = []
  for (const pack of ['pmm_credits_50', 'pmm_credits_125', 'pmm_credits_200'] as CreditPackId[]) {
    try {
      const r = await ensurePack(stripe, pack)
      results.push(r)
      console.log(`  ${pack}: product=${r.productId} price=${r.priceId}`)
    } catch (err) {
      console.error(`  ${pack}: FAILED — ${(err as Error).message}`)
    }
  }

  console.log(`\n# Paste into .env.local for ${label}:`)
  for (const r of results) {
    const envName =
      r.pack === 'pmm_credits_50'
        ? `STRIPE_PRICE_CREDITS_50_${label.toUpperCase()}`
        : r.pack === 'pmm_credits_125'
          ? `STRIPE_PRICE_CREDITS_125_${label.toUpperCase()}`
          : `STRIPE_PRICE_CREDITS_200_${label.toUpperCase()}`
    console.log(`${envName}=${r.priceId}`)
  }
}

async function main() {
  const liveKey = process.env.STRIPE_SECRET_KEY
  const testKey = process.env.STRIPE_SECRET_KEY_TEST

  if (!liveKey && !testKey) {
    console.error('Neither STRIPE_SECRET_KEY nor STRIPE_SECRET_KEY_TEST is set in env.')
    process.exit(1)
  }

  if (liveKey) {
    if (!liveKey.startsWith('sk_live_')) {
      console.warn(
        `STRIPE_SECRET_KEY does not start with sk_live_ — running in whatever mode it is.`,
      )
    }
    await provisionMode('live', liveKey)
  } else {
    console.warn('STRIPE_SECRET_KEY not set — skipping live mode.')
  }

  if (testKey) {
    if (!testKey.startsWith('sk_test_')) {
      console.warn(
        `STRIPE_SECRET_KEY_TEST does not start with sk_test_ — refusing to run.`,
      )
    } else {
      await provisionMode('test', testKey)
    }
  } else {
    console.warn('STRIPE_SECRET_KEY_TEST not set — skipping test mode.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
