-- Supabase schema for learning-site progress sync (Auth + RLS version)
-- Run this in Supabase SQL Editor after creating a project.
-- This replaces the old sync_key-based schema.

-- 1. Enable UUID extension (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User progress table - one row per user
CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies - users can only access their own data
CREATE POLICY "select_own_progress" ON user_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own_progress" ON user_progress
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_progress" ON user_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_progress" ON user_progress
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. Helper function to get progress (optional, can query table directly with RLS)
CREATE OR REPLACE FUNCTION get_my_progress()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT progress_json INTO result
  FROM user_progress
  WHERE user_id = auth.uid();

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- 6. Helper function to upsert progress
CREATE OR REPLACE FUNCTION upsert_my_progress(p_progress JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_progress (user_id, progress_json, updated_at)
  VALUES (auth.uid(), COALESCE(p_progress, '{}'::jsonb), now())
  ON CONFLICT (user_id) DO UPDATE
  SET progress_json = EXCLUDED.progress_json,
      updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_my_progress(JSONB) TO authenticated;

-- 7. (Optional) Auto-create progress row on user signup
-- Run this in Supabase Dashboard -> Database -> Functions -> Create Function
-- Or run manually:
/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, progress_json)
  VALUES (NEW.id, '{}'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
*/