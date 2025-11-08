-- =====================================================
-- Migration 002: Fix users table schema
-- =====================================================
-- This migration fixes the users table to match code expectations:
-- 1. Add clinic_id column
-- 2. Update role enum to include missing roles
-- 3. Update existing user roles to correct values
-- =====================================================

-- Step 1: Add clinic_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN clinic_id UUID;
    RAISE NOTICE '✅ Added column clinic_id to users table';
  ELSE
    RAISE NOTICE 'ℹ️  Column clinic_id already exists, skipping';
  END IF;
END $$;

-- Step 2: Update role enum to include all required roles
-- We need to add: customer_free, customer_premium, super_admin
-- and keep existing ones for compatibility
DO $$
BEGIN
  -- Add customer_free if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'customer_free') THEN
    ALTER TYPE user_role ADD VALUE 'customer_free';
    RAISE NOTICE '✅ Added customer_free to user_role enum';
  END IF;

  -- Add customer_premium if not exists  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'customer_premium') THEN
    ALTER TYPE user_role ADD VALUE 'customer_premium';
    RAISE NOTICE '✅ Added customer_premium to user_role enum';
  END IF;

  -- Note: super_admin already exists in the original migration
  -- Check if it exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'super_admin') THEN
    -- This shouldn't happen based on migration 001, but let's be safe
    RAISE NOTICE 'ℹ️  super_admin role already exists';
  END IF;

  -- Add clinic_owner if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'clinic_owner') THEN
    ALTER TYPE user_role ADD VALUE 'clinic_owner';
    RAISE NOTICE '✅ Added clinic_owner to user_role enum';
  END IF;

  RAISE NOTICE '✅ Updated user_role enum with all required values';
END $$;

-- Step 3: Update existing demo users to have correct roles
-- Based on email patterns, assign appropriate roles

-- Update super admin
UPDATE public.users 
SET role = 'super_admin'
WHERE email = 'admin@ai367bar.com';

-- Update clinic owner
UPDATE public.users 
SET role = 'clinic_owner', 
    clinic_id = '00000000-0000-0000-0000-000000000001'
WHERE email = 'clinic-owner@example.com';

-- Update sales staff
UPDATE public.users 
SET role = 'sales_staff',
    clinic_id = '00000000-0000-0000-0000-000000000001'
WHERE email = 'sales@example.com';

-- Update customer (free tier)
UPDATE public.users 
SET role = 'customer_free'
WHERE email = 'customer@example.com';

-- Verify updates
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count FROM public.users WHERE role != 'free_user';
  RAISE NOTICE '✅ Updated % user roles', updated_count;
END $$;

-- Step 4: Create index for clinic_id for better performance
CREATE INDEX IF NOT EXISTS users_clinic_id_idx ON public.users(clinic_id);

-- Step 5: Add RLS policy for clinic-based access
-- Clinic staff can view users in their clinic
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

RAISE NOTICE '✅ Migration 002 completed successfully';
