-- ============================================================================
-- Fix Helper Functions to Use users Table Instead of user_roles
-- Date: 2025-01-15
-- Purpose: Replace user_roles references with users table which actually exists
-- ============================================================================

-- ============================================================================
-- Function: is_super_admin()
-- Returns TRUE if current user has super_admin role
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO service_role;

-- ============================================================================
-- Function: get_user_clinic_id()
-- Returns the clinic_id for the current user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_clinic_id UUID;
BEGIN
  -- Get clinic_id from users table
  SELECT clinic_id INTO user_clinic_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_clinic_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_clinic_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_clinic_id() TO service_role;

-- ============================================================================
-- Function: get_user_role()
-- Returns the role name for the current user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role_name TEXT;
BEGIN
  SELECT role::TEXT INTO user_role_name
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_role_name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO service_role;

-- ============================================================================
-- Function: can_access_clinic()
-- Check if user can access a specific clinic
-- ============================================================================
CREATE OR REPLACE FUNCTION public.can_access_clinic(target_clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Super admin can access any clinic
  IF public.is_super_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user belongs to this clinic
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND clinic_id = target_clinic_id
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.can_access_clinic(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_clinic(UUID) TO service_role;

-- ============================================================================
-- Verification
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Helper Functions Fixed Successfully!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ is_super_admin() - Now uses users table';
    RAISE NOTICE '✓ get_user_clinic_id() - Now uses users table';
    RAISE NOTICE '✓ get_user_role() - Now uses users table';
    RAISE NOTICE '✓ can_access_clinic() - Now uses users table';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Migration complete - user_roles dependency removed';
    RAISE NOTICE '============================================';
END $$;
