-- Fix infinite recursion in RLS policies
-- The problem: policies that query the users table to check roles create infinite loops
-- Solution: Use simpler policies that don't query users table, or use security definer functions

-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admin can view all users" ON users;
DROP POLICY IF EXISTS "Clinic admin can view their clinic staff" ON users;
DROP POLICY IF EXISTS "Clinic staff can view users in their clinic" ON users;

-- Create a security definer function to check if user is super admin
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$;

-- Create a security definer function to get user's clinic_id
CREATE OR REPLACE FUNCTION auth.get_user_clinic_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clinic UUID;
BEGIN
  SELECT clinic_id INTO clinic
  FROM users
  WHERE id = auth.uid();
  
  RETURN clinic;
END;
$$;

-- Create a security definer function to get user's role
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid();
  
  RETURN user_role;
END;
$$;

-- Recreate policies using security definer functions (no infinite recursion)
CREATE POLICY "Super admin can view all users"
  ON users FOR SELECT
  USING (auth.is_super_admin());

CREATE POLICY "Super admin can update all users"
  ON users FOR UPDATE
  USING (auth.is_super_admin());

CREATE POLICY "Clinic admin can view their clinic staff"
  ON users FOR SELECT
  USING (
    auth.get_user_role() IN ('clinic_admin', 'clinic_owner')
    AND clinic_id = auth.get_user_clinic_id()
  );

CREATE POLICY "Clinic staff can view users in their clinic"
  ON users FOR SELECT
  USING (
    auth.get_user_role() IN ('clinic_staff', 'sales_staff')
    AND clinic_id = auth.get_user_clinic_id()
  );

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION auth.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_user_clinic_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_user_role() TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION auth.is_super_admin() IS 'Check if current user is super admin (bypasses RLS)';
COMMENT ON FUNCTION auth.get_user_clinic_id() IS 'Get current user clinic_id (bypasses RLS)';
COMMENT ON FUNCTION auth.get_user_role() IS 'Get current user role (bypasses RLS)';
