-- ============================================================================
-- Add clinic_id to EXISTING tables + Create missing tables
-- Date: 2025-11-11
-- Purpose: Alter existing customers/appointments tables to add clinic_id
--          AND create missing staff_members/treatment_plans tables
-- ============================================================================

-- ============================================================================
-- STEP 1: Add clinic_id to EXISTING customers table
-- ============================================================================

-- Add clinic_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'customers' 
        AND column_name = 'clinic_id'
    ) THEN
        ALTER TABLE public.customers 
        ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added clinic_id column to customers table';
    ELSE
        RAISE NOTICE 'clinic_id column already exists in customers table';
    END IF;
END $$;

-- Add other missing columns to customers if needed
DO $$ 
BEGIN
    -- Add status column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'customers' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.customers 
        ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'));
    END IF;

    -- Add tags column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'customers' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE public.customers 
        ADD COLUMN tags TEXT[];
    END IF;

    -- Add created_by column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'customers' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.customers 
        ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create indexes for customers (IF NOT EXISTS prevents errors)
CREATE INDEX IF NOT EXISTS idx_customers_clinic ON public.customers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_created ON public.customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_clinic_created ON public.customers(clinic_id, created_at DESC);

-- Add unique constraint if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'customers_clinic_email_unique'
    ) THEN
        ALTER TABLE public.customers 
        ADD CONSTRAINT customers_clinic_email_unique UNIQUE (clinic_id, email);
    END IF;
END $$;

-- Enable RLS on customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop old policies if exist and create new ones
DROP POLICY IF EXISTS "Clinic can view own customers" ON public.customers;
CREATE POLICY "Clinic can view own customers"
  ON public.customers
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can create customers" ON public.customers;
CREATE POLICY "Clinic can create customers"
  ON public.customers
  FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can update own customers" ON public.customers;
CREATE POLICY "Clinic can update own customers"
  ON public.customers
  FOR UPDATE
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can delete own customers" ON public.customers;
CREATE POLICY "Clinic can delete own customers"
  ON public.customers
  FOR DELETE
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- ============================================================================
-- STEP 2: Add clinic_id to EXISTING appointments table
-- ============================================================================

-- Add clinic_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments' 
        AND column_name = 'clinic_id'
    ) THEN
        ALTER TABLE public.appointments 
        ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added clinic_id column to appointments table';
    ELSE
        RAISE NOTICE 'clinic_id column already exists in appointments table';
    END IF;
END $$;

-- Add other potentially missing columns to appointments
DO $$ 
BEGIN
    -- Add branch_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments' 
        AND column_name = 'branch_id'
    ) THEN
        ALTER TABLE public.appointments 
        ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    END IF;

    -- Add reminders column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments' 
        AND column_name = 'reminders'
    ) THEN
        ALTER TABLE public.appointments 
        ADD COLUMN reminders JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add cancelled_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments' 
        AND column_name = 'cancelled_at'
    ) THEN
        ALTER TABLE public.appointments 
        ADD COLUMN cancelled_at TIMESTAMPTZ;
    END IF;

    -- Add cancelled_by if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments' 
        AND column_name = 'cancelled_by'
    ) THEN
        ALTER TABLE public.appointments 
        ADD COLUMN cancelled_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON public.appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_branch ON public.appointments(branch_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON public.appointments(clinic_id, appointment_date DESC);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop old policies if exist and create new ones
DROP POLICY IF EXISTS "Clinic can view own appointments" ON public.appointments;
CREATE POLICY "Clinic can view own appointments"
  ON public.appointments
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can create appointments" ON public.appointments;
CREATE POLICY "Clinic can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can update own appointments" ON public.appointments;
CREATE POLICY "Clinic can update own appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can delete own appointments" ON public.appointments;
CREATE POLICY "Clinic can delete own appointments"
  ON public.appointments
  FOR DELETE
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- ============================================================================
-- STEP 3: Create staff_members table (completely new)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'receptionist', 'therapist', 'manager', 'other')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive', 'terminated')),
  commission_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT staff_clinic_email_unique UNIQUE (clinic_id, email)
);

-- Indexes for staff_members
CREATE INDEX IF NOT EXISTS idx_staff_clinic ON public.staff_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_user ON public.staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON public.staff_members(role);
CREATE INDEX IF NOT EXISTS idx_staff_clinic_role ON public.staff_members(clinic_id, role);

-- RLS for staff_members
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can view own staff" ON public.staff_members;
CREATE POLICY "Clinic can view own staff"
  ON public.staff_members
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can create staff" ON public.staff_members;
CREATE POLICY "Clinic can create staff"
  ON public.staff_members
  FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can update own staff" ON public.staff_members;
CREATE POLICY "Clinic can update own staff"
  ON public.staff_members
  FOR UPDATE
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can delete own staff" ON public.staff_members;
CREATE POLICY "Clinic can delete own staff"
  ON public.staff_members
  FOR DELETE
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- ============================================================================
-- STEP 4: Create treatment_plans table (completely new)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.skin_analyses(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  plan_name TEXT NOT NULL,
  description TEXT,
  target_concerns TEXT[],
  recommended_treatments JSONB DEFAULT '[]'::jsonb,
  recommended_products JSONB DEFAULT '[]'::jsonb,
  duration_weeks INTEGER,
  estimated_cost DECIMAL(10,2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'on_hold')),
  start_date DATE,
  end_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for treatment_plans
CREATE INDEX IF NOT EXISTS idx_treatment_clinic ON public.treatment_plans(clinic_id);
CREATE INDEX IF NOT EXISTS idx_treatment_customer ON public.treatment_plans(customer_id);
CREATE INDEX IF NOT EXISTS idx_treatment_analysis ON public.treatment_plans(analysis_id);
CREATE INDEX IF NOT EXISTS idx_treatment_status ON public.treatment_plans(status);
CREATE INDEX IF NOT EXISTS idx_treatment_clinic_created ON public.treatment_plans(clinic_id, created_at DESC);

-- RLS for treatment_plans
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can view own treatment plans" ON public.treatment_plans;
CREATE POLICY "Clinic can view own treatment plans"
  ON public.treatment_plans
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can create treatment plans" ON public.treatment_plans;
CREATE POLICY "Clinic can create treatment plans"
  ON public.treatment_plans
  FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can update own treatment plans" ON public.treatment_plans;
CREATE POLICY "Clinic can update own treatment plans"
  ON public.treatment_plans
  FOR UPDATE
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can delete own treatment plans" ON public.treatment_plans;
CREATE POLICY "Clinic can delete own treatment plans"
  ON public.treatment_plans
  FOR DELETE
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Migration Complete! Summary:';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ Added clinic_id to customers table';
    RAISE NOTICE '✓ Added clinic_id to appointments table';
    RAISE NOTICE '✓ Created staff_members table';
    RAISE NOTICE '✓ Created treatment_plans table';
    RAISE NOTICE '✓ All RLS policies enabled';
    RAISE NOTICE '✓ All indexes created';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Next step: Run verification scripts';
    RAISE NOTICE '  1. node scripts/check-existing-tables.mjs';
    RAISE NOTICE '  2. node scripts/comprehensive-system-test.mjs';
    RAISE NOTICE '============================================';
END $$;
