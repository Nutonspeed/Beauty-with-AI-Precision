-- CRITICAL FIX: Force disable RLS on users table and verify
-- Run this in Supabase SQL Editor

-- Step 1: Force disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies on users table (they won't matter if RLS is disabled, but let's be thorough)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 3: Verify RLS status
SELECT 
  tablename,
  rowsecurity AS rls_enabled,
  CASE 
    WHEN rowsecurity = false THEN '✅ RLS IS DISABLED'
    WHEN rowsecurity = true THEN '❌ RLS IS STILL ENABLED'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'users';

-- Step 4: Check if any policies still exist (should be empty)
SELECT 
  policyname,
  cmd,
  '❌ POLICY STILL EXISTS - THIS SHOULD BE EMPTY!' as warning
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users';

-- Expected results:
-- Query 3 should show: rls_enabled = false, status = '✅ RLS IS DISABLED'
-- Query 4 should return NO rows (no policies exist)
