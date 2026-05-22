-- Migration 00005_add_is_admin.sql
-- Add independent admin role field to profiles (security fix: admin access should not be based on plan)

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- RLS: Only admins can update the is_admin field
CREATE POLICY "admins_can_set_is_admin" ON public.profiles
    FOR UPDATE USING (true)
    WITH CHECK (
        -- Prevent non-admins from setting is_admin to true
        CASE WHEN NEW.is_admin = true THEN
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
        ELSE true END
    );
