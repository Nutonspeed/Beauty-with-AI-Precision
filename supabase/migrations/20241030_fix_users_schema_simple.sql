-- =====================================================
-- SIMPLIFIED Migration 002: Fix users table
-- Run this in Supabase SQL Editor directly
-- URL: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/editor
-- 
-- ⚠️ IMPORTANT: Run this in TWO separate executions!
--    PostgreSQL requires enum values to be committed before use.
-- =====================================================

-- ========================================
-- PART 1: Run this FIRST, then COMMIT (click "Run" once)
-- ========================================

-- Add new role enum values
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer_free';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer_premium';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'clinic_owner';

-- Add clinic_id column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS clinic_id UUID;

-- Create index for clinic_id
CREATE INDEX IF NOT EXISTS users_clinic_id_idx ON public.users(clinic_id);


-- ========================================
-- PART 2: Run this SECOND (in a new query, after Part 1 completes)
-- ========================================
/*

-- Update existing demo users
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

-- Verify
SELECT email, role, clinic_id FROM public.users ORDER BY email;

*/
