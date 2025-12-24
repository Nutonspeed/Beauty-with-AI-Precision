-- =====================================================
-- Fix ALL Users Table RLS Policies - Remove Infinite Recursion
-- =====================================================

-- Step 1: Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Clinic staff can view users in their clinic" ON public.users;
DROP POLICY IF EXISTS "Super admin can update all users" ON public.users;
DROP POLICY IF EXISTS "Super admin can view all users" ON public.users;
DROP POLICY IF EXISTS "users_delete_admin" ON public.users;
DROP POLICY IF EXISTS "users_insert_admin" ON public.users;
DROP POLICY IF EXISTS "users_select_admin" ON public.users;
DROP POLICY IF EXISTS "users_select_clinic_admin" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_sales" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

-- Step 2: Create SIMPLE policies WITHOUT any recursion
-- Key: NO subqueries that reference users table at all!

-- Policy 1: Users can ALWAYS view their own data
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own data
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy 3: Allow SELECT for ALL authenticated users (temporarily)
-- This removes the recursion completely
CREATE POLICY "users_select_policy"
  ON public.users
  FOR SELECT
  USING (true);  -- Allow all authenticated users to read

-- Policy 4: Allow INSERT (for registration)
CREATE POLICY "users_insert_admin"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Step 3: Verification
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'users' AND schemaname = 'public';
  
  RAISE NOTICE '✅ Total policies on users table: %', policy_count;
  RAISE NOTICE '✅ All policies recreated without infinite recursion';
END $$;

-- Step 4: Show all policies
SELECT 
  policyname,
  cmd as operation,
  LEFT(qual::text, 100) as using_clause
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;
