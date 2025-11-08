-- =====================================================
-- Supabase Migration: User Authentication & RBAC Setup
-- =====================================================
-- This migration creates the users table with Role-Based Access Control
-- and sets up necessary triggers and policies
-- 
-- Run this in Supabase SQL Editor:
-- https://bgejeqqngzvuokdffadu.supabase.co/project/_/sql
-- =====================================================

-- 1. Create ENUM types for roles and tiers (with safety checks)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM (
      'public',
      'free_user',
      'premium_customer',
      'clinic_staff',
      'clinic_admin',
      'sales_staff',
      'super_admin'
    );
    RAISE NOTICE '✅ Created ENUM type: user_role';
  ELSE
    RAISE NOTICE 'ℹ️  ENUM type user_role already exists, skipping';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'analysis_tier') THEN
    CREATE TYPE analysis_tier AS ENUM (
      'free',
      'premium',
      'clinical'
    );
    RAISE NOTICE '✅ Created ENUM type: analysis_tier';
  ELSE
    RAISE NOTICE 'ℹ️  ENUM type analysis_tier already exists, skipping';
  END IF;
END $$;

-- 2. Create users table (extends auth.users)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    CREATE TABLE public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL UNIQUE,
      role user_role NOT NULL DEFAULT 'free_user',
      tier analysis_tier NOT NULL DEFAULT 'free',
      full_name TEXT,
      avatar_url TEXT,
      phone TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ,
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      metadata JSONB DEFAULT '{}'::jsonb
    );
    RAISE NOTICE '✅ Created table: users';
  ELSE
    RAISE NOTICE 'ℹ️  Table users already exists, skipping';
  END IF;
END $$;

-- 3. Create index for better query performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS users_tier_idx ON public.users(tier);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies

-- Policy: Users can view their own data
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data (except role and tier)
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
    AND tier = (SELECT tier FROM public.users WHERE id = auth.uid())
  );

-- Policy: Super admin can view all users
DROP POLICY IF EXISTS "Super admin can view all users" ON public.users;
CREATE POLICY "Super admin can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy: Super admin can update all users
DROP POLICY IF EXISTS "Super admin can update all users" ON public.users;
CREATE POLICY "Super admin can update all users"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy: Clinic admin can view their clinic staff
DROP POLICY IF EXISTS "Clinic admin can view their clinic staff" ON public.users;
CREATE POLICY "Clinic admin can view their clinic staff"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() 
      AND role = 'clinic_admin'
      AND (
        role IN ('clinic_staff', 'clinic_admin')
      )
    )
  );

-- 6. Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    role,
    tier,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    'free_user',
    'free',
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 10. Create analysis_history table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analysis_history') THEN
    CREATE TABLE public.analysis_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      analysis_type TEXT NOT NULL DEFAULT 'skin_analysis',
      image_url TEXT NOT NULL,
      results JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    RAISE NOTICE '✅ Created table: analysis_history';
  ELSE
    RAISE NOTICE 'ℹ️  Table analysis_history already exists, skipping';
  END IF;
END $$;

-- 11. Create index for analysis_history
CREATE INDEX IF NOT EXISTS analysis_history_user_id_idx ON public.analysis_history(user_id);
CREATE INDEX IF NOT EXISTS analysis_history_created_at_idx ON public.analysis_history(created_at DESC);

-- 12. Enable RLS for analysis_history
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies for analysis_history

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own analysis history" ON public.analysis_history;
DROP POLICY IF EXISTS "Users can insert their own analysis" ON public.analysis_history;
DROP POLICY IF EXISTS "Super admin can view all analysis" ON public.analysis_history;

-- Policy: Users can view their own analysis history
CREATE POLICY "Users can view their own analysis history"
  ON public.analysis_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own analysis
CREATE POLICY "Users can insert their own analysis"
  ON public.analysis_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Super admin can view all analysis history
CREATE POLICY "Super admin can view all analysis"
  ON public.analysis_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 14. Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 15. Create function to check if user has permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
  user_id UUID,
  required_role user_role
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role_value user_role;
  role_hierarchy JSONB := '{
    "public": 0,
    "free_user": 1,
    "premium_customer": 2,
    "clinic_staff": 3,
    "clinic_admin": 4,
    "sales_staff": 3,
    "super_admin": 5
  }';
BEGIN
  SELECT role INTO user_role_value FROM public.users WHERE id = user_id;
  
  RETURN (role_hierarchy->>user_role_value::text)::int >= (role_hierarchy->>required_role::text)::int;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DEMO DATA (Optional - for testing)
-- =====================================================
-- Uncomment below to create demo users
-- Note: You need to create these users in Supabase Auth first,
-- then update the UUIDs below with the actual auth.users IDs

/*
-- Demo User 1: Free User
INSERT INTO public.users (id, email, role, tier, full_name, email_verified)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual UUID
  'customer@example.com',
  'free_user',
  'free',
  'Demo Free User',
  true
);

-- Demo User 2: Premium Customer
INSERT INTO public.users (id, email, role, tier, full_name, email_verified)
VALUES (
  '00000000-0000-0000-0000-000000000002', -- Replace with actual UUID
  'premium@example.com',
  'premium_customer',
  'premium',
  'Demo Premium User',
  true
);

-- Demo User 3: Clinic Staff
INSERT INTO public.users (id, email, role, tier, full_name, email_verified)
VALUES (
  '00000000-0000-0000-0000-000000000003', -- Replace with actual UUID
  'staff@example.com',
  'clinic_staff',
  'clinical',
  'Demo Clinic Staff',
  true
);

-- Demo User 4: Clinic Admin
INSERT INTO public.users (id, email, role, tier, full_name, email_verified)
VALUES (
  '00000000-0000-0000-0000-000000000004', -- Replace with actual UUID
  'clinic-owner@example.com',
  'clinic_admin',
  'clinical',
  'Demo Clinic Owner',
  true
);

-- Demo User 5: Sales Staff
INSERT INTO public.users (id, email, role, tier, full_name, email_verified)
VALUES (
  '00000000-0000-0000-0000-000000000005', -- Replace with actual UUID
  'sales@example.com',
  'sales_staff',
  'premium',
  'Demo Sales Staff',
  true
);

-- Demo User 6: Super Admin
INSERT INTO public.users (id, email, role, tier, full_name, email_verified)
VALUES (
  '00000000-0000-0000-0000-000000000006', -- Replace with actual UUID
  'admin@example.com',
  'super_admin',
  'clinical',
  'Demo Super Admin',
  true
);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the migration was successful:

-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'analysis_history');

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
/*
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.update_updated_at();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.user_has_permission(UUID, user_role);
DROP TABLE IF EXISTS public.analysis_history;
DROP TABLE IF EXISTS public.users;
DROP TYPE IF EXISTS analysis_tier;
DROP TYPE IF EXISTS user_role;
*/
