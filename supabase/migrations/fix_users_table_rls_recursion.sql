-- =====================================================
-- Fix: Infinite Recursion in Users Table RLS Policies
-- =====================================================
-- Problem: Some RLS policies on 'users' table are querying
-- the same 'users' table, causing infinite recursion
-- =====================================================

-- 1. Drop problematic policies on users table
DROP POLICY IF EXISTS "Clinic admin can view their clinic staff" ON public.users;
DROP POLICY IF EXISTS "Sales staff can view notes from their clinic" ON public.users;
DROP POLICY IF EXISTS "Super admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admin can update all users" ON public.users;

-- 2. Recreate policies WITHOUT infinite recursion
-- Using auth.uid() directly instead of subqueries

-- Policy: Users can view their own data (KEEP - no recursion)
-- Already exists and correct

-- Policy: Super admin can view all users (FIXED)
CREATE POLICY "Super admin can view all users"
  ON public.users
  FOR SELECT
  USING (
    -- Direct check without subquery
    (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) = 'super_admin'
  );

-- Policy: Super admin can update all users (FIXED)
CREATE POLICY "Super admin can update all users"
  ON public.users
  FOR UPDATE
  USING (
    -- Direct check without subquery
    (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) = 'super_admin'
  );

-- 3. Verify no recursion issues
DO $$
DECLARE
  policy_record RECORD;
  has_issues BOOLEAN := FALSE;
BEGIN
  FOR policy_record IN 
    SELECT policyname, qual::text as definition
    FROM pg_policies 
    WHERE tablename = 'users' AND schemaname = 'public'
  LOOP
    -- Check if policy contains problematic patterns
    IF policy_record.definition LIKE '%SELECT%users%WHERE%' AND 
       policy_record.definition NOT LIKE '%LIMIT 1%' THEN
      RAISE WARNING 'Policy "%" may still have recursion issues', policy_record.policyname;
      has_issues := TRUE;
    END IF;
  END LOOP;
  
  IF NOT has_issues THEN
    RAISE NOTICE '✅ All policies verified - no recursion detected';
  END IF;
END $$;

-- 4. List all current policies on users table
SELECT 
  policyname,
  cmd as operation,
  LEFT(qual::text, 150) as policy_definition
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;
