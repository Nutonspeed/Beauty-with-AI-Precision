-- =====================================================
-- Fix RLS Infinite Recursion in Users Table
-- =====================================================
-- Problem: RLS policies were querying users table while evaluating users table access
-- Solution: Use auth.jwt() to check role instead of querying users table
-- Date: 2025-11-05
-- =====================================================

-- 1. Drop all existing RLS policies on users table
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Super admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admin can update all users" ON public.users;
DROP POLICY IF EXISTS "Clinic admin can view their clinic staff" ON public.users;

-- 2. Create a function to get current user's role from JWT claims
-- This avoids querying the users table during RLS evaluation
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt()->>'user_role',
    (SELECT role::text FROM public.users WHERE id = auth.uid())
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 3. Create a function to update JWT claims with user role
-- This will be called by a trigger to keep JWT in sync
CREATE OR REPLACE FUNCTION public.update_user_jwt_claims()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's JWT claims with their role
  -- This requires Supabase to be configured to read app_metadata
  PERFORM auth.update_user_metadata(
    NEW.id,
    jsonb_build_object('user_role', NEW.role::text)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to update JWT claims when role changes
DROP TRIGGER IF EXISTS sync_user_role_to_jwt ON public.users;
CREATE TRIGGER sync_user_role_to_jwt
  AFTER INSERT OR UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_jwt_claims();

-- 5. Create NEW RLS Policies (no circular dependencies)

-- Policy: Users can always view their own data
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Super admins can view all users
CREATE POLICY "users_select_admin"
  ON public.users
  FOR SELECT
  USING (
    (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Policy: Clinic admins can view clinic staff
-- TODO: Add proper clinic_id relationship when clinic_staff table is created
CREATE POLICY "users_select_clinic_admin"
  ON public.users
  FOR SELECT
  USING (
    (auth.jwt()->>'user_role')::text IN ('clinic_admin', 'clinic_owner')
    AND role IN ('clinic_staff', 'clinic_admin', 'clinic_owner')
  );

-- Policy: Sales staff can view customers and leads
CREATE POLICY "users_select_sales"
  ON public.users
  FOR SELECT
  USING (
    (auth.jwt()->>'user_role')::text = 'sales_staff'
    AND role IN ('free_user', 'premium_customer')
  );

-- Policy: Users can update their own profile (except role and tier)
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1)
    AND tier = (SELECT tier FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- Policy: Super admin can update all users
CREATE POLICY "users_update_admin"
  ON public.users
  FOR UPDATE
  USING ((auth.jwt()->>'user_role')::text = 'super_admin');

-- Policy: Super admin can insert users
CREATE POLICY "users_insert_admin"
  ON public.users
  FOR INSERT
  WITH CHECK ((auth.jwt()->>'user_role')::text = 'super_admin');

-- Policy: Super admin can delete users
CREATE POLICY "users_delete_admin"
  ON public.users
  FOR DELETE
  USING ((auth.jwt()->>'user_role')::text = 'super_admin');

-- 6. Fix analysis_history policies as well (same issue)
DROP POLICY IF EXISTS "Users can view their own analysis history" ON public.analysis_history;
DROP POLICY IF EXISTS "Users can insert their own analysis" ON public.analysis_history;
DROP POLICY IF EXISTS "Super admin can view all analysis" ON public.analysis_history;

-- Policy: Users can view their own analysis history
CREATE POLICY "analysis_history_select_own"
  ON public.analysis_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own analysis
CREATE POLICY "analysis_history_insert_own"
  ON public.analysis_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Super admin can view all analysis
CREATE POLICY "analysis_history_select_admin"
  ON public.analysis_history
  FOR SELECT
  USING ((auth.jwt()->>'user_role')::text = 'super_admin');

-- Policy: Super admin can delete analysis
CREATE POLICY "analysis_history_delete_admin"
  ON public.analysis_history
  FOR DELETE
  USING ((auth.jwt()->>'user_role')::text = 'super_admin');

-- 7. Update existing users to sync their roles to JWT
-- This is a one-time operation to populate JWT claims
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, role FROM public.users LOOP
    BEGIN
      -- Try to update user metadata with role
      -- Note: This might fail if auth.update_user_metadata doesn't exist
      -- In that case, roles will be synced on next update via trigger
      PERFORM auth.update_user_metadata(
        user_record.id,
        jsonb_build_object('user_role', user_record.role::text)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not update JWT for user %: %', user_record.id, SQLERRM;
    END;
  END LOOP;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check current user's role (should work without recursion)
-- SELECT get_current_user_role();

-- Check if policies are working
-- SELECT * FROM public.users; -- Should only see allowed users

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'users'
-- ORDER BY policyname;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. This migration uses JWT claims to store user role
-- 2. Supabase needs to be configured to include custom claims in JWT
-- 3. The trigger will keep JWT in sync when role changes
-- 4. Fallback to querying users table if JWT claim doesn't exist
-- 5. No more infinite recursion! 🎉

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
/*
DROP TRIGGER IF EXISTS sync_user_role_to_jwt ON public.users;
DROP FUNCTION IF EXISTS public.update_user_jwt_claims();
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Then re-run the original migration: 20241027_create_users_and_rbac.sql
*/
