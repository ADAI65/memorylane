-- Migration 00003_jobs.sql
-- Job queue tables: restoration_jobs, job_events

-- Custom enum types
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

-- Restoration Jobs table
CREATE TABLE public.restoration_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    upload_id UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
    service_type job_service_type NOT NULL DEFAULT 'basic_restoration',
    status job_status DEFAULT 'pending',

    -- AI-specific parameters
    ai_model TEXT,
    ai_params JSONB DEFAULT '{}',

    -- Results
    result_storage_path TEXT,
    result_url TEXT,
    result_metadata JSONB DEFAULT '{}',

    -- Timing
    queued_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_duration_seconds INTEGER,

    -- Error handling
    error_message TEXT,
    error_code TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Billing
    is_premium BOOLEAN DEFAULT false,
    price_cents INTEGER DEFAULT 0,
    payment_id UUID REFERENCES public.payments(id),

    -- Batch operations
    parent_job_id UUID REFERENCES public.restoration_jobs(id) ON DELETE CASCADE,
    batch_upload_ids UUID[] DEFAULT '{}',

    -- BullMQ reference
    bullmq_job_id TEXT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Job Events table (for real-time status tracking)
CREATE TABLE public.job_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.restoration_jobs(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('queued', 'started', 'progress', 'completed', 'failed')),
    message TEXT,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_jobs_user_id ON public.restoration_jobs(user_id, created_at DESC);
CREATE INDEX idx_jobs_status ON public.restoration_jobs(status);
CREATE INDEX idx_jobs_service_type ON public.restoration_jobs(service_type);
CREATE INDEX idx_jobs_upload_id ON public.restoration_jobs(upload_id);
CREATE INDEX idx_jobs_payment_id ON public.restoration_jobs(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX idx_job_events_job_id ON public.job_events(job_id, created_at);

-- Updated_at trigger
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.restoration_jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for jobs
ALTER TABLE public.restoration_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own jobs"
    ON public.restoration_jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
    ON public.restoration_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
    ON public.restoration_jobs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
    ON public.restoration_jobs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage jobs"
    ON public.restoration_jobs FOR ALL USING (auth.role() = 'service_role');

-- RLS for job_events
ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own job events"
    ON public.job_events FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.restoration_jobs
        WHERE id = job_events.job_id AND user_id = auth.uid()
    ));

CREATE POLICY "Service role can manage job events"
    ON public.job_events FOR ALL USING (auth.role() = 'service_role');
