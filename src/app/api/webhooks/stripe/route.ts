import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import Stripe from 'stripe'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

// Use service role client for webhook handler (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

let resend: Resend | null = null
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

function formatAmount(amountTotal: number | null, currency: string | null) {
  if (amountTotal == null) return '—'
  return (amountTotal / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: (currency || 'usd').toUpperCase(),
  })
}

// Admin alert on a completed purchase — mirrors the signup / MCP-connection
// notifications so Abhishek gets an email the moment money comes in. Best
// effort: a send failure must never fail the webhook (Stripe would retry the
// whole event and we'd double-process the purchase).
async function notifyAdminPurchase(opts: {
  kind: string
  email: string | null
  amount: string
  extraRows?: Array<[string, string]>
}) {
  const rows: Array<[string, string]> = [
    ['Type', opts.kind],
    ['Customer', opts.email || '—'],
    ['Amount', opts.amount],
    ...(opts.extraRows || []),
  ]
  try {
    await getResend().emails.send({
      from: 'PMM Sherpa <noreply@pmmsherpa.com>',
      to: SUPER_ADMIN_EMAIL,
      subject: `New purchase: ${opts.kind}${opts.email ? ` — ${opts.email}` : ''}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0058be; margin-bottom: 16px;">💳 New Purchase</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${rows
              .map(
                ([label, value]) =>
                  `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">${label}</td><td style="padding: 8px 0; font-weight: 600;">${value}</td></tr>`,
              )
              .join('')}
          </table>
        </div>
      `,
    })
  } catch (e) {
    console.error('[Stripe] Failed to send admin purchase notification:', e)
  }
}

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

  // ---- Idempotency: ignore replays of the same Stripe event ----
  // We persist event.id BEFORE branching so a retry never double-applies.
  // INSERT ... ON CONFLICT DO NOTHING returns 0 rows on a duplicate.
  const { data: insertedEvent, error: insertErr } = await (supabase
    .from('stripe_webhook_events') as ReturnType<typeof supabase.from>)
    .insert({ event_id: event.id, event_type: event.type } as never)
    .select('event_id')
    .maybeSingle()

  if (insertErr) {
    // Unique-violation on event_id is the duplicate path → swallow.
    // Other DB errors → log but proceed (idempotency is best-effort here;
    // the per-branch logic is also idempotent at the DB level via UPDATE
    // semantics for subscription tier flips).
    if ((insertErr as { code?: string }).code === '23505') {
      console.log(`[Stripe] Duplicate event ${event.id} (${event.type}); skipping.`)
      return NextResponse.json({ received: true, duplicate: true })
    }
    console.error(`[Stripe] Idempotency insert failed for ${event.id}:`, insertErr)
  } else if (!insertedEvent) {
    // maybeSingle() with no row + no error means the conflict was swallowed.
    console.log(`[Stripe] Duplicate event ${event.id} (${event.type}); skipping.`)
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        if (!userId) break

        // ---- Credit-pack purchase (mode === 'payment' + metadata.credits) ----
        // One-time pack purchase from /api/stripe/checkout-credits.
        if (session.mode === 'payment' && session.metadata?.credits) {
          const creditsRaw = session.metadata.credits
          const credits = Number.parseInt(creditsRaw, 10)
          if (!Number.isFinite(credits) || credits <= 0) {
            console.error(
              `[Stripe] Invalid credits metadata "${creditsRaw}" on session ${session.id}`,
            )
            break
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: grantErr } = await (supabase.rpc as any)('grant_mcp_credits', {
            p_user_id: userId,
            p_amount: credits,
          })
          if (grantErr) {
            console.error(
              `[Stripe] grant_mcp_credits failed for user ${userId} (event ${event.id}):`,
              grantErr,
            )
            // Surface a 500 so Stripe retries — idempotency table will
            // gate the retry properly only if the insert above succeeded.
            return NextResponse.json({ error: 'Credit grant failed' }, { status: 500 })
          }
          console.log(
            `[Stripe] User ${userId} purchased ${credits} MCP credits (pack=${session.metadata.pack})`,
          )
          await notifyAdminPurchase({
            kind: 'Credit pack',
            email: session.customer_details?.email ?? session.customer_email ?? null,
            amount: formatAmount(session.amount_total, session.currency),
            extraRows: [
              ['Pack', session.metadata.pack ?? '—'],
              ['Credits', String(credits)],
            ],
          })
          break
        }

        // ---- Subscription path (legacy Starter $9.99/mo) ----
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
        await notifyAdminPurchase({
          kind: 'Starter upgrade ($9.99/mo)',
          email: session.customer_details?.email ?? session.customer_email ?? null,
          amount: formatAmount(session.amount_total, session.currency),
        })
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
