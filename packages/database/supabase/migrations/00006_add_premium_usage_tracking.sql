-- Migration 00006_add_premium_usage_tracking.sql
-- Track daily premium service usage for rate limiting

-- Add premium usage tracking columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN premium_usage_today INTEGER DEFAULT 0,
  ADD COLUMN premium_usage_reset_at TIMESTAMPTZ DEFAULT now();

-- Index for admin queries on heavy users
CREATE INDEX idx_profiles_premium_usage ON public.profiles(premium_usage_today DESC);

-- RLS policy: users can only update their own premium_usage fields
CREATE POLICY "users_can_update_own_premium_usage"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
