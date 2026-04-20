import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role client for webhook handler (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        if (!userId) break

        // Save Stripe customer ID and upgrade tier
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            tier: 'starter',
            profile_completed: true,
          } as never)
          .eq('id', userId)

        console.log(`[Stripe] User ${userId} upgraded to starter`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (!userId) {
          // Try to find user by customer ID
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', subscription.customer as string)
            .limit(1)

          if (!profiles?.length) break

          const tier = subscription.status === 'active' ? 'starter' : 'free'
          await supabase
            .from('profiles')
            .update({ tier } as never)
            .eq('id', profiles[0].id)

          console.log(`[Stripe] User ${profiles[0].id} subscription updated to ${tier}`)
          break
        }

        const tier = subscription.status === 'active' ? 'starter' : 'free'
        await supabase
          .from('profiles')
          .update({ tier } as never)
          .eq('id', userId)

        console.log(`[Stripe] User ${userId} subscription updated to ${tier}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Find user by customer ID and downgrade
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .limit(1)

        if (profiles?.length) {
          await supabase
            .from('profiles')
            .update({
              tier: 'free',
              stripe_subscription_id: null,
            } as never)
            .eq('id', profiles[0].id)

          console.log(`[Stripe] User ${profiles[0].id} subscription cancelled — downgraded to free`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Stripe] Payment failed for customer ${invoice.customer}`)
        // Could send an email here via Resend
        break
      }

      default:
        // Unhandled event type
        break
    }
  } catch (err) {
    console.error(`[Stripe] Error processing ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
