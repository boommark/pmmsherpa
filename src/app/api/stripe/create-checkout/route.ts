import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// Awaited Supabase server client (createClient is async in this codebase).
type DbClient = Awaited<ReturnType<typeof createClient>>

// Create a Stripe customer and persist it immediately so repeat visits reuse
// the same customer instead of creating orphans.
async function createAndPersistCustomer(
  supabase: DbClient,
  user: { id: string; email?: string },
): Promise<string> {
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { supabase_user_id: user.id },
  })

  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id } as never)
    .eq('id', user.id)

  return customer.id
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single() as { data: { stripe_customer_id: string | null } | null }

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      customerId = await createAndPersistCustomer(supabase, user)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const buildSession = (customer: string) =>
      stripe.checkout.sessions.create({
        customer,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/auth/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/settings?upgrade_cancelled=true`,
        allow_promotion_codes: true,
        subscription_data: {
          metadata: {
            supabase_user_id: user.id,
          },
        },
        metadata: {
          supabase_user_id: user.id,
        },
      })

    let session
    try {
      session = await buildSession(customerId)
    } catch (err) {
      // Self-heal a stale customer ID. A profile can carry a stripe_customer_id
      // that doesn't exist in the live account — e.g. a test-mode ID written
      // during staging, or a leftover from a previous Stripe account. Live
      // Checkout then rejects it with resource_missing on `customer`. Create a
      // fresh customer, persist it, and retry once so the user isn't blocked.
      if (
        err instanceof Stripe.errors.StripeInvalidRequestError &&
        err.code === 'resource_missing' &&
        err.param === 'customer'
      ) {
        console.warn(
          `[Stripe] Stale customer ${customerId} for user ${user.id}; recreating.`,
        )
        customerId = await createAndPersistCustomer(supabase, user)
        session = await buildSession(customerId)
      } else {
        throw err
      }
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
