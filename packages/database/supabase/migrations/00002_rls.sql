-- Migration 00002_rls.sql
-- Row Level Security policies

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
    ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- Uploads
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own uploads"
    ON public.uploads FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads"
    ON public.uploads FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads"
    ON public.uploads FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploads"
    ON public.uploads FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage uploads"
    ON public.uploads FOR ALL USING (auth.role() = 'service_role');
