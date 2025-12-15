-- =================================================================
-- Fix RLS for public.users table
-- Purpose: Prevent anonymous reads while allowing authenticated users
--          to see their own data and super_admins to see all
-- =================================================================

-- Step 1: Check current state (READ ONLY)
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- List existing policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- Check if is_super_admin function exists
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname = 'is_super_admin';

-- =================================================================
-- Step 2: Apply secure RLS policies (RUN AFTER REVIEWING STEP 1)
-- =================================================================

-- Begin transaction for atomic changes
BEGIN;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be too permissive
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Public read access" ON public.users;
DROP POLICY IF EXISTS "Allow anonymous access" ON public.users;

-- Create secure policies

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Policy 3: Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Policy 4: Super admins can do everything
-- Note: This uses the is_super_admin function from migration 20251111_multi_tenant_fixed.sql
CREATE POLICY "Super admins full access" ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

COMMIT;

-- =================================================================
-- Step 3: Verification queries (RUN AFTER STEP 2)
-- =================================================================

-- Test with service role (should see all)
SELECT 'Service role count:' as test, COUNT(*) as count FROM public.users;

-- Test with anon key (should return 0 rows)
-- Run this in a separate session with NEXT_PUBLIC_SUPABASE_ANON_KEY:
-- SELECT COUNT(*) FROM public.users;

-- Check final policies
SELECT 
  policyname,
  permissive,
  cmd,
  substr(qual, 1, 100) as condition_preview
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';
