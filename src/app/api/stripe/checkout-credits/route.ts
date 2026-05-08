/**
 * POST /api/stripe/checkout-credits
 *
 * Creates a Stripe Checkout Session in `payment` mode for one of the
 * three MCP credit packs. Auth required (cookie session). The webhook
 * (src/app/api/webhooks/stripe/route.ts → checkout.session.completed)
 * grants credits when payment succeeds.
 *
 * Body:  { pack: 'pmm_credits_50' | 'pmm_credits_125' | 'pmm_credits_200' }
 * Reply: { url: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import {
  CREDIT_PACKS,
  getPriceIdForPack,
  isCreditPackId,
  type CreditPackId,
} from '@/lib/stripe/credit-packs'

interface ProfileRow {
  stripe_customer_id: string | null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: userResult, error: authError } = await supabase.auth.getUser()
    const user = userResult?.user
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { pack?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!isCreditPackId(body.pack)) {
      return NextResponse.json(
        {
          error: 'Invalid pack — must be one of pmm_credits_50, pmm_credits_125, pmm_credits_200',
        },
        { status: 400 },
      )
    }
    const pack: CreditPackId = body.pack
    const cfg = CREDIT_PACKS[pack]

    let priceId: string
    try {
      priceId = getPriceIdForPack(pack)
    } catch (err) {
      console.error('[checkout-credits] Missing price ID env:', err)
      return NextResponse.json(
        { error: 'Credit packs are not configured. Contact support.' },
        { status: 500 },
      )
    }

    // Reuse or create the Stripe customer — same pattern as
    // /api/stripe/create-checkout so we don't orphan customers.
    const { data: profile } = (await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()) as { data: ProfileRow | null }

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId } as never)
        .eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/chat?credits_added=true`,
      cancel_url: `${appUrl}/chat?credits_canceled=true`,
      allow_promotion_codes: true,
      metadata: {
        supabase_user_id: user.id,
        pack: cfg.name,
        credits: String(cfg.credits),
      },
      // Also stash on the PaymentIntent so webhook handlers reading
      // `payment_intent.succeeded` can credit deterministically.
      payment_intent_data: {
        metadata: {
          supabase_user_id: user.id,
          pack: cfg.name,
          credits: String(cfg.credits),
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[checkout-credits] error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
