-- =====================================================
-- Migration 002 PART 2: Update user roles
-- Run this AFTER Part 1 has been committed
-- =====================================================

-- Update existing demo users with correct roles
UPDATE public.users SET role = 'super_admin' WHERE email = 'admin@ai367bar.com';
UPDATE public.users SET role = 'clinic_owner', clinic_id = '00000000-0000-0000-0000-000000000001' WHERE email = 'clinic-owner@example.com';
UPDATE public.users SET role = 'sales_staff', clinic_id = '00000000-0000-0000-0000-000000000001' WHERE email = 'sales@example.com';
UPDATE public.users SET role = 'customer_free' WHERE email = 'customer@example.com';

-- Add RLS policy for clinic access
DROP POLICY IF EXISTS "Clinic staff can view users in their clinic" ON public.users;
CREATE POLICY "Clinic staff can view users in their clinic"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.clinic_id = public.users.clinic_id
      AND u.role IN ('clinic_owner', 'clinic_staff', 'clinic_admin')
    )
  );

-- Verify results
SELECT email, role, clinic_id FROM public.users ORDER BY email;
