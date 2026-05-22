// @memorylane/api - Payment Routes with Stripe integration
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createCheckoutSchema, paymentListQuerySchema, SERVICE_PRICES, ServiceType } from '@memorylane/shared';
import { supabaseAdmin } from '../db/supabase';
import { success, paginated } from '../utils/response';
import { ValidationError, NotFoundError } from '../utils/errors';
import { getStripe, getProPriceId, getUnlimitedPriceId } from '../lib/stripe';
import { env } from '../env';

const payments = new Hono();

// ── POST /api/payments/checkout - Create Stripe checkout session ──
payments.post('/checkout', zValidator('json', createCheckoutSchema), async (c) => {
  const profile = c.get('profile');
  const body = c.req.valid('json');
  const { service_type, job_id, plan } = body;

  const stripe = getStripe();
  const appUrl = env.NEXT_PUBLIC_APP_URL;

  // ── Subscription checkout ──
  if (plan) {
    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(profile.id, profile.email);

    // Determine price
    const priceId = plan === 'pro' ? getProPriceId() : getUnlimitedPriceId();

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      metadata: {
        user_id: profile.id,
        plan,
        type: 'subscription',
      },
      subscription_data: {
        metadata: {
          user_id: profile.id,
          plan,
        },
        trial_period_days: plan === 'pro' ? 7 : undefined, // 7-day trial for Pro
      },
    });

    // Record payment intent
    await supabaseAdmin.from('payments').insert({
      user_id: profile.id,
      payment_type: 'subscription',
      amount_cents: plan === 'pro' ? 1400 : 9900,
      currency: 'usd',
      status: 'pending',
      stripe_checkout_session_id: session.id,
      stripe_customer_id: customerId,
      description: `${plan === 'pro' ? 'Pro Monthly' : 'Unlimited Yearly'} subscription`,
      metadata: { plan },
    });

    return success(c, {
      checkout_url: session.url,
      session_id: session.id,
    }, 201);
  }

  // ── Premium service one-time checkout ──
  if (service_type) {
    const servicePrice = SERVICE_PRICES[service_type as ServiceType];
    if (!servicePrice || servicePrice.priceCents === 0) {
      throw new ValidationError('Invalid premium service type or free service');
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(profile.id, profile.email);

    // Create a payment intent for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: servicePrice.displayName,
              description: servicePrice.description,
            },
            unit_amount: servicePrice.priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/services?checkout=canceled`,
      metadata: {
        user_id: profile.id,
        service_type,
        type: 'premium_service',
        ...(job_id && { job_id }),
      },
    });

    // Record payment
    await supabaseAdmin.from('payments').insert({
      user_id: profile.id,
      job_id: job_id || null,
      payment_type: 'one_time',
      amount_cents: servicePrice.priceCents,
      currency: 'usd',
      status: 'pending',
      stripe_checkout_session_id: session.id,
      stripe_customer_id: customerId,
      service_type: service_type as ServiceType,
      description: servicePrice.displayName,
      metadata: { service_type },
    });

    return success(c, {
      checkout_url: session.url,
      session_id: session.id,
    }, 201);
  }

  throw new ValidationError('Either service_type or plan is required');
});

// ── GET /api/payments/history - List user payments ──────
payments.get('/history', zValidator('query', paymentListQuerySchema), async (c) => {
  const profile = c.get('profile');
  const { page, per_page } = c.req.valid('query');

  const { data, count, error } = await supabaseAdmin
    .from('payments')
    .select('*', { count: 'exact' })
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1);

  if (error) {
    throw new ValidationError('Failed to fetch payment history');
  }

  return paginated(c, data || [], page, per_page, count || 0);
});

// ── GET /api/payments/subscription - Current subscription ─
payments.get('/subscription', async (c) => {
  const profile = c.get('profile');

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', profile.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return success(c, {
    plan: profile.plan,
    subscription_status: profile.subscription_status,
    subscription: subscription || null,
  });
});

// ── POST /api/payments/subscription/cancel - Cancel subscription ─
payments.post('/subscription/cancel', async (c) => {
  const profile = c.get('profile');

  if (profile.plan === 'free') {
    throw new ValidationError('No active subscription to cancel');
  }

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', profile.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!subscription) {
    throw new NotFoundError('Active subscription');
  }

  // Cancel at period end via Stripe
  const stripe = getStripe();
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  // Update local record
  await supabaseAdmin
    .from('subscriptions')
    .update({ cancel_at_period_end: true })
    .eq('id', subscription.id);

  return success(c, {
    message: 'Subscription will be canceled at the end of the billing period',
    current_period_end: subscription.current_period_end,
  });
});

// ── POST /api/payments/subscription/reactivate - Reactivate subscription ─
payments.post('/subscription/reactivate', async (c) => {
  const profile = c.get('profile');

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', profile.id)
    .eq('status', 'active')
    .eq('cancel_at_period_end', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!subscription) {
    throw new NotFoundError('Cancelable subscription');
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: false,
  });

  await supabaseAdmin
    .from('subscriptions')
    .update({ cancel_at_period_end: false })
    .eq('id', subscription.id);

  return success(c, {
    message: 'Subscription reactivated successfully',
  });
});

// ── POST /api/payments/portal - Create Stripe Customer Portal session ─
payments.post('/portal', async (c) => {
  const profile = c.get('profile');

  const customerId = await getOrCreateStripeCustomer(profile.id, profile.email);
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return success(c, { portal_url: session.url });
});

// ── Helper: Get or create Stripe customer ──────────────
async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
): Promise<string> {
  // Check if customer already exists in profile
  if (profile_stripe_customer_id_cache.has(userId)) {
    return profile_stripe_customer_id_cache.get(userId)!;
  }

  const stripe = getStripe();

  // Try to find existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    const customerId = existingCustomers.data[0].id;
    profile_stripe_customer_id_cache.set(userId, customerId);

    // Update profile if not already set
    await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId)
      .is('stripe_customer_id', null);

    return customerId;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: { user_id: userId },
  });

  // Update profile
  await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  profile_stripe_customer_id_cache.set(userId, customer.id);
  return customer.id;
}

// Simple in-memory cache for customer IDs (resets on server restart)
const profile_stripe_customer_id_cache = new Map<string, string>();

export default payments;
