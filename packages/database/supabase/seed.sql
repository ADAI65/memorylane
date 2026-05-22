-- Seed data for development
-- This file is only used in development environments

-- Insert a test admin user profile (requires auth.users entry first via Supabase dashboard)
-- INSERT INTO public.profiles (id, email, full_name, plan)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001',
--     'admin@memorylane.ai',
--     'Admin User',
--     'unlimited'
-- );

-- Create storage buckets
-- Note: These must be created via Supabase Dashboard or API since SQL INSERT
-- into storage.buckets requires service_role access

-- Storage bucket policies are defined in RLS policies above
-- Buckets to create:
-- 1. user-uploads (private)
-- 2. restoration-results (private)
-- 3. certificates (public)
-- 4. temp (private)
