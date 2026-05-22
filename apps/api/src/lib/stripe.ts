// @memorylane/api - Stripe client wrapper
import Stripe from 'stripe';
import { env } from '../env';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Stripe price IDs are configured via environment variables.
 * If not set, we create prices dynamically (useful for dev).
 */
export function getProPriceId(): string {
  if (env.STRIPE_PRO_MONTHLY_PRICE_ID) {
    return env.STRIPE_PRO_MONTHLY_PRICE_ID;
  }
  // Fallback for development
  throw new Error('STRIPE_PRO_MONTHLY_PRICE_ID not configured');
}

export function getUnlimitedPriceId(): string {
  if (env.STRIPE_UNLIMITED_YEARLY_PRICE_ID) {
    return env.STRIPE_UNLIMITED_YEARLY_PRICE_ID;
  }
  throw new Error('STRIPE_UNLIMITED_YEARLY_PRICE_ID not configured');
}
