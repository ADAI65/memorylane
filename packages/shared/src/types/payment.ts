import type { ServiceType, PaymentStatus, PaymentType } from './enums';

export interface Payment {
  id: string;
  user_id: string;
  job_id: string | null;
  payment_type: PaymentType;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_invoice_id: string | null;
  service_type: ServiceType | null;
  description: string | null;
  metadata: Record<string, unknown>;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan: 'pro' | 'unlimited';
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCheckoutRequest {
  service_type?: ServiceType;
  job_id?: string;
  plan?: 'pro' | 'unlimited';
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  job_id: string;
  certificate_number: string;
  storage_path: string;
  public_url: string | null;
  restoration_details: Record<string, unknown>;
  created_at: string;
}
