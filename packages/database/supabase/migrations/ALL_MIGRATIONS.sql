-- ================================================================
-- MemoryLane Database Migration (Complete, ordered by dependency)
-- Run this in Supabase Dashboard → SQL Editor
-- ================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- PART 1: Utility functions
-- ================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- PART 2: Enum types
-- ================================================================

CREATE TYPE job_service_type AS ENUM (
    'basic_restoration',
    'photo_animation',
    'memory_video',
    'historical_dating',
    'era_colorization',
    'face_match',
    'certificate'
);

CREATE TYPE job_status AS ENUM (
    'pending',
    'queued',
    'processing',
    'completed',
    'failed',
    'canceled'
);

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

-- ================================================================
-- PART 3: Core tables (no foreign-key dependencies)
-- ================================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'unlimited')),
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled')),
    stripe_customer_id TEXT,
    daily_free_used INTEGER DEFAULT 0,
    daily_free_reset_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_plan ON public.profiles(plan);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Uploads
CREATE TABLE public.uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    original_url TEXT,
    width INTEGER,
    height INTEGER,
    status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'ready', 'processing', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_uploads_user_id ON public.uploads(user_id, created_at DESC);
CREATE INDEX idx_uploads_status ON public.uploads(status);

CREATE TRIGGER update_uploads_updated_at
    BEFORE UPDATE ON public.uploads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- PART 4: Billing tables (payments, subscriptions, certificates)
-- Must come BEFORE restoration_jobs due to FK reference
-- ================================================================

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID,  -- FK added later after restoration_jobs is created

    payment_type payment_type NOT NULL,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    currency TEXT DEFAULT 'usd' CHECK (currency IN ('usd', 'eur', 'gbp')),
    status payment_status DEFAULT 'pending',

    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    stripe_invoice_id TEXT,

    service_type job_service_type,
    description TEXT,
    metadata JSONB DEFAULT '{}',

    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_user_id ON public.payments(user_id, created_at DESC);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_stripe_checkout ON public.payments(stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX idx_payments_stripe_subscription ON public.payments(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- PART 5: Jobs tables (depends on payments)
-- ================================================================

CREATE TABLE public.restoration_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    upload_id UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
    service_type job_service_type NOT NULL DEFAULT 'basic_restoration',
    status job_status DEFAULT 'pending',

    ai_model TEXT,
    ai_params JSONB DEFAULT '{}',

    result_storage_path TEXT,
    result_url TEXT,
    result_metadata JSONB DEFAULT '{}',

    queued_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_duration_seconds INTEGER,

    error_message TEXT,
    error_code TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    is_premium BOOLEAN DEFAULT false,
    price_cents INTEGER DEFAULT 0,
    payment_id UUID REFERENCES public.payments(id),

    parent_job_id UUID REFERENCES public.restoration_jobs(id) ON DELETE CASCADE,
    batch_upload_ids UUID[] DEFAULT '{}',

    bullmq_job_id TEXT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_jobs_user_id ON public.restoration_jobs(user_id, created_at DESC);
CREATE INDEX idx_jobs_status ON public.restoration_jobs(status);
CREATE INDEX idx_jobs_service_type ON public.restoration_jobs(service_type);
CREATE INDEX idx_jobs_upload_id ON public.restoration_jobs(upload_id);
CREATE INDEX idx_jobs_payment_id ON public.restoration_jobs(payment_id) WHERE payment_id IS NOT NULL;

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.restoration_jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Back-fill the deferred FK on payments.job_id
ALTER TABLE public.payments
    ADD CONSTRAINT payments_job_id_fkey
    FOREIGN KEY (job_id) REFERENCES public.restoration_jobs(id) ON DELETE SET NULL;

-- Job events
CREATE TABLE public.job_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.restoration_jobs(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('queued', 'started', 'progress', 'completed', 'failed')),
    message TEXT,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_job_events_job_id ON public.job_events(job_id, created_at);

-- Certificates (depends on restoration_jobs)
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

CREATE INDEX idx_certificates_user ON public.certificates(user_id);
CREATE INDEX idx_certificates_number ON public.certificates(certificate_number);

-- ================================================================
-- PART 6: Row Level Security
-- ================================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- Uploads
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own uploads" ON public.uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploads" ON public.uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own uploads" ON public.uploads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own uploads" ON public.uploads FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage uploads" ON public.uploads FOR ALL USING (auth.role() = 'service_role');

-- Restoration Jobs
ALTER TABLE public.restoration_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own jobs" ON public.restoration_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.restoration_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.restoration_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON public.restoration_jobs FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage jobs" ON public.restoration_jobs FOR ALL USING (auth.role() = 'service_role');

-- Job Events
ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own job events" ON public.job_events FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.restoration_jobs
        WHERE id = job_events.job_id AND user_id = auth.uid()
    ));
CREATE POLICY "Service role can manage job events" ON public.job_events FOR ALL USING (auth.role() = 'service_role');

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage payments" ON public.payments FOR ALL USING (auth.role() = 'service_role');

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions FOR ALL USING (auth.role() = 'service_role');

-- Certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Users can manage own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage certificates" ON public.certificates FOR ALL USING (auth.role() = 'service_role');

-- ================================================================
-- PART 7: Helper functions
-- ================================================================

CREATE OR REPLACE FUNCTION public.reset_daily_free_usage()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET daily_free_used = 0, daily_free_reset_at = now()
    WHERE daily_free_reset_at < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_daily_usage(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_profile profiles%ROWTYPE;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
    IF v_profile.daily_free_reset_at < now() - INTERVAL '24 hours' THEN
        UPDATE public.profiles SET daily_free_used = 1, daily_free_reset_at = now() WHERE id = p_user_id;
    ELSE
        UPDATE public.profiles SET daily_free_used = daily_free_used + 1 WHERE id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_daily_limit(p_user_id UUID, p_limit INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_reset_at TIMESTAMPTZ;
BEGIN
    SELECT daily_free_used, daily_free_reset_at INTO v_count, v_reset_at
    FROM public.profiles WHERE id = p_user_id;
    IF v_reset_at < now() - INTERVAL '24 hours' THEN RETURN false; END IF;
    RETURN v_count >= p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ================================================================
-- PART 8: Admin role (00005)
-- ================================================================

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;

CREATE POLICY "Users can read own profile with admin" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile with admin" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ================================================================
-- PART 9: Premium usage tracking (00006)
-- ================================================================

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS premium_usage_today INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS premium_usage_reset_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_premium_usage ON public.profiles(premium_usage_today DESC);

CREATE POLICY "users_can_update_own_premium_usage"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ================================================================
-- PART 10: Storage bucket for user uploads (00007)
-- ================================================================

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  false,
  false,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow users to read own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow users to delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
