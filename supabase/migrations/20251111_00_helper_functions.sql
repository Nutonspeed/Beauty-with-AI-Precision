-- ============================================================================
-- Helper Functions for Multi-Tenant RLS
-- Date: 2025-11-11
-- Purpose: Create helper functions needed by RLS policies
-- MUST RUN THIS FIRST before other migrations
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
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
    AND is_active = TRUE
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
  -- Try to get clinic_id from user_roles table
  SELECT clinic_id INTO user_clinic_id
  FROM public.user_roles
  WHERE user_id = auth.uid()
  AND is_active = TRUE
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
  SELECT role INTO user_role_name
  FROM public.user_roles
  WHERE user_id = auth.uid()
  AND is_active = TRUE
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'clinic_owner' THEN 2
      WHEN 'sales_staff' THEN 3
      WHEN 'customer_free' THEN 4
      ELSE 5
    END
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
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND clinic_id = target_clinic_id
    AND is_active = TRUE
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
    RAISE NOTICE 'Helper Functions Created Successfully!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ is_super_admin() - Check if user is super admin';
    RAISE NOTICE '✓ get_user_clinic_id() - Get users clinic ID';
    RAISE NOTICE '✓ get_user_role() - Get users role name';
    RAISE NOTICE '✓ can_access_clinic() - Check clinic access';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Now you can run the main migration file';
    RAISE NOTICE '============================================';
END $$;
