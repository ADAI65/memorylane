-- Migration 00004_billing.sql
-- Payment and billing tables

CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'refunded',
    'canceled'
);

CREATE TYPE payment_type AS ENUM (
    'one_time',
    'subscription',
    'credit_purchase'
);

-- Payments / Orders table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.restoration_jobs(id) ON DELETE SET NULL,

    payment_type payment_type NOT NULL,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    currency TEXT DEFAULT 'usd' CHECK (currency IN ('usd', 'eur', 'gbp')),
    status payment_status DEFAULT 'pending',

    -- Stripe references
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    stripe_invoice_id TEXT,

    -- Service metadata
    service_type job_service_type,
    description TEXT,
    metadata JSONB DEFAULT '{}',

    -- Timing
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_price_id TEXT NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('pro', 'unlimited')),
    status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Certificates table
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.restoration_jobs(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    restoration_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_payments_user_id ON public.payments(user_id, created_at DESC);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_stripe_checkout ON public.payments(stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX idx_payments_stripe_subscription ON public.payments(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_certificates_user ON public.certificates(user_id);
CREATE INDEX idx_certificates_number ON public.certificates(certificate_number);

-- Updated_at triggers
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
    ON public.payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payments"
    ON public.payments FOR ALL USING (auth.role() = 'service_role');

-- RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
    ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
    ON public.subscriptions FOR ALL USING (auth.role() = 'service_role');

-- RLS for certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read certificates"
    ON public.certificates FOR SELECT USING (true);

CREATE POLICY "Users can manage own certificates"
    ON public.certificates FOR INSERT UPDATE DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage certificates"
    ON public.certificates FOR ALL USING (auth.role() = 'service_role');

-- Daily free usage reset function
CREATE OR REPLACE FUNCTION public.reset_daily_free_usage()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET daily_free_used = 0, daily_free_reset_at = now()
    WHERE daily_free_reset_at < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment daily usage function
CREATE OR REPLACE FUNCTION public.increment_daily_usage(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_profile profiles%ROWTYPE;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

    IF v_profile.daily_free_reset_at < now() - INTERVAL '24 hours' THEN
        UPDATE public.profiles
        SET daily_free_used = 1, daily_free_reset_at = now()
        WHERE id = p_user_id;
    ELSE
        UPDATE public.profiles
        SET daily_free_used = daily_free_used + 1
        WHERE id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has reached daily limit
CREATE OR REPLACE FUNCTION public.check_daily_limit(p_user_id UUID, p_limit INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_reset_at TIMESTAMPTZ;
BEGIN
    SELECT daily_free_used, daily_free_reset_at
    INTO v_count, v_reset_at
    FROM public.profiles WHERE id = p_user_id;

    -- Reset if window has passed
    IF v_reset_at < now() - INTERVAL '24 hours' THEN
        RETURN false;
    END IF;

    RETURN v_count >= p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
