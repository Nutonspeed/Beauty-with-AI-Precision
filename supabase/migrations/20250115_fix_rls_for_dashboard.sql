-- ============================================================================
-- Fix RLS Policies for Dashboard Endpoints
-- Date: 2025-01-15
-- Purpose: Enable RLS on treatments table and ensure proper access for clinic staff
-- ============================================================================

-- ============================================================================
-- STEP 1: Enable RLS on treatments table (public master data)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all treatments (master data)
DROP POLICY IF EXISTS "Everyone can view treatments" ON public.treatments;
CREATE POLICY "Everyone can view treatments"
  ON public.treatments
  FOR SELECT
  TO public
  USING (true);

-- Allow service role full access for management
DROP POLICY IF EXISTS "Service role can manage treatments" ON public.treatments;
CREATE POLICY "Service role can manage treatments"
  ON public.treatments
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- STEP 2: Verify bookings policies work with new helper functions
-- ============================================================================

-- Ensure bookings policies use the corrected helper functions
-- (These should already work after our previous migration fixing helper functions)

-- Re-create the main clinic access policy to be explicit
DROP POLICY IF EXISTS "Clinic can view own bookings" ON public.bookings;
CREATE POLICY "Clinic can view own bookings"
  ON public.bookings
  FOR SELECT
  USING (
    -- Super admin can see all
    is_super_admin()
    OR
    -- Clinic staff can see their clinic's bookings
    clinic_id = get_user_clinic_id()
  );

-- Also allow clinic staff to create/update/delete their clinic's bookings
DROP POLICY IF EXISTS "Clinic can manage own bookings" ON public.bookings;
CREATE POLICY "Clinic can manage own bookings"
  ON public.bookings
  FOR ALL
  USING (
    is_super_admin() OR clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    is_super_admin() OR clinic_id = get_user_clinic_id()
  );

-- ============================================================================
-- STEP 3: Add explicit policies for revenue/reporting queries
-- ============================================================================

-- Ensure customers table policies work for aggregation queries
DROP POLICY IF EXISTS "Clinic staff can view clinic customers for reporting" ON public.customers;
CREATE POLICY "Clinic staff can view clinic customers for reporting"
  ON public.customers
  FOR SELECT
  USING (
    is_super_admin()
    OR
    -- User's clinic_id matches customer's clinic_id
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = customers.clinic_id
      AND users.role IN ('super_admin', 'clinic_owner', 'clinic_staff')
    )
  );

-- ============================================================================
-- Verification
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RLS Policies Updated Successfully!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ treatments table - RLS enabled, public read access';
    RAISE NOTICE '✓ bookings - policies updated for clinic access';
    RAISE NOTICE '✓ customers - reporting access policy added';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Dashboard endpoints should now work properly';
    RAISE NOTICE '============================================';
END $$;
