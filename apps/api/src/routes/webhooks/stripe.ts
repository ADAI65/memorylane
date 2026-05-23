// @memorylane/api - Stripe Webhook handler
import { Hono } from 'hono';
import { getStripe } from '../../lib/stripe.js';
import { supabaseAdmin } from '../../db/supabase.js';
import { env } from '../../env.js';
import { getPremiumQueue, updateJobStatus, addJobEvent } from '../../lib/queue.js';
import { DEFAULT_MODEL_PER_SERVICE } from '@memorylane/shared';
import { ServiceType } from '@memorylane/shared';
import Stripe from 'stripe';

const webhook = new Hono();

// ── Stripe event types we handle ────────────────────────
const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

// ── POST /api/webhooks/stripe ──────────────────────────
webhook.post('/', async (c) => {
  const body = await c.req.text();
  const sig = c.req.header('stripe-signature');

  if (!sig) {
    return c.json({ error: 'Missing stripe-signature header' }, 400);
  }

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      return c.json({ error: 'Stripe webhook not configured' }, 503);
    }
    event = getStripe().webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Stripe Webhook] Signature verification failed: ${message}`);
    return c.json({ error: 'Invalid signature' }, 400);
  }

  console.log(`[Stripe Webhook] Received: ${event.type}`);

  if (!HANDLED_EVENTS.has(event.type)) {
    return c.json({ received: true, handled: false });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, message);
    return c.json({ error: 'Webhook handler error' }, 500);
  }

  return c.json({ received: true, handled: true });
});

// ── Event Handlers ──────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata as Record<string, string> | null;
  const { user_id, type, plan, service_type, job_id } = metadata || {};

  if (!user_id) {
    console.warn('[Stripe Webhook] No user_id in session metadata');
    return;
  }

  // Update payment record
  await supabaseAdmin
    .from('payments')
    .update({
      status: 'succeeded',
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq('stripe_checkout_session_id', session.id);

  if (type === 'subscription' && plan) {
    console.log(`[Stripe Webhook] Subscription checkout completed for user ${user_id}, plan: ${plan}`);
    // Subscription will be handled by customer.subscription.created event
  } else if (type === 'premium_service' && service_type && job_id) {
    // Mark job as paid and enqueue to premium worker
    await supabaseAdmin
      .from('restoration_jobs')
      .update({
        payment_id: session.payment_intent as string,
        status: 'queued',
      })
      .eq('id', job_id);

    // Fetch the full job data to enqueue
    const { data: job } = await supabaseAdmin
      .from('restoration_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (job) {
      const queue = getPremiumQueue();
      await queue.add(job_id, {
        jobId: job.id,
        userId: job.user_id,
        uploadId: job.upload_id,
        serviceType: job.service_type,
        aiModel: job.ai_model || DEFAULT_MODEL_PER_SERVICE[service_type as ServiceType],
        aiParams: (job.ai_params as Record<string, unknown>) || {},
        priority: 1,
        animationType: job.ai_params?.animationType as string | undefined,
        durationSeconds: job.ai_params?.durationSeconds as number | undefined,
        audioText: job.ai_params?.audioText as string | undefined,
        batchUploadIds: (job.batch_upload_ids as string[]) || undefined,
      });

      await updateJobStatus(job_id, 'queued');
      await addJobEvent(job_id, 'queued', 'Payment received, job queued for processing', 0);
      console.log(`[Stripe Webhook] Premium job ${job_id} (${service_type}) enqueued after payment`);
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  const plan = subscription.metadata.plan as 'pro' | 'unlimited';

  if (!userId || !plan) {
    console.warn('[Stripe Webhook] Missing user_id or plan in subscription metadata');
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    console.warn('[Stripe Webhook] No price ID in subscription');
    return;
  }

  // Create subscription record
  await supabaseAdmin.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan,
    status: subscription.status as 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
  });

  // Update user plan
  await supabaseAdmin
    .from('profiles')
    .update({
      plan,
      subscription_status: 'active',
    })
    .eq('id', userId);

  console.log(`[Stripe Webhook] Subscription created: user=${userId}, plan=${plan}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  if (!userId) return;

  // Update subscription record
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status as 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update profile subscription status
  const profileStatus = subscription.status === 'active' || subscription.status === 'trialing'
    ? 'active'
    : subscription.status === 'past_due'
      ? 'past_due'
      : 'canceled';

  await supabaseAdmin
    .from('profiles')
    .update({ subscription_status: profileStatus })
    .eq('id', userId);

  console.log(`[Stripe Webhook] Subscription updated: user=${userId}, status=${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  if (!userId) return;

  // Update subscription record
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('stripe_subscription_id', subscription.id);

  // Downgrade user to free
  await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'free',
      subscription_status: 'canceled',
    })
    .eq('id', userId);

  console.log(`[Stripe Webhook] Subscription deleted: user=${userId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // For subscription renewals, update the payment record
  if (invoice.subscription && invoice.payment_intent) {
    const subscription = await getStripe().subscriptions.retrieve(
      invoice.subscription as string,
    );
    const userId = subscription.metadata.user_id;
    const plan = subscription.metadata.plan;

    if (userId && plan) {
      await supabaseAdmin.from('payments').insert({
        user_id: userId,
        payment_type: 'subscription',
        amount_cents: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        stripe_payment_intent_id: invoice.payment_intent as string,
        stripe_subscription_id: invoice.subscription as string,
        stripe_customer_id: invoice.customer as string,
        stripe_invoice_id: invoice.id,
        description: `${plan} subscription renewal`,
        paid_at: new Date().toISOString(),
        metadata: { plan, type: 'renewal' },
      });
    }
  }

  console.log(`[Stripe Webhook] Invoice payment succeeded: ${invoice.id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await getStripe().subscriptions.retrieve(
      invoice.subscription as string,
    );
    const userId = subscription.metadata.user_id;

    if (userId) {
      await supabaseAdmin
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('id', userId);
    }
  }

  console.log(`[Stripe Webhook] Invoice payment failed: ${invoice.id}`);
}

export default webhook;
