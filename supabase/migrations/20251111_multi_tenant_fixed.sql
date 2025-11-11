-- ============================================================================
-- Multi-Tenant Enhancement Migration (FIXED for existing schema)
-- Version: 2.1.0
-- Date: 2025-11-11
-- 
-- Purpose: Add clinic_id to tables that exist in the current database
-- Priority: CRITICAL for 6-clinic launch
-- 
-- Tables confirmed to exist: 76 tables from schema dump
-- This migration only touches tables that actually exist
-- ============================================================================

-- ============================================================================
-- STEP 1: Add clinic_id to skin_analyses (CRITICAL!)
-- ============================================================================
DO $$ 
BEGIN
  -- Add clinic_id column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'skin_analyses' 
    AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.skin_analyses 
    ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added clinic_id to skin_analyses';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_id already exists in skin_analyses';
  END IF;

  -- Add sales_staff_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'skin_analyses' 
    AND column_name = 'sales_staff_id'
  ) THEN
    ALTER TABLE public.skin_analyses 
    ADD COLUMN sales_staff_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added sales_staff_id to skin_analyses';
  ELSE
    RAISE NOTICE 'ℹ️  sales_staff_id already exists in skin_analyses';
  END IF;

  -- Add branch_id if not exists (branches table exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'skin_analyses' 
    AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE public.skin_analyses 
    ADD COLUMN branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added branch_id to skin_analyses';
  ELSE
    RAISE NOTICE 'ℹ️  branch_id already exists in skin_analyses';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_skin_analyses_clinic ON public.skin_analyses(clinic_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_sales_staff ON public.skin_analyses(sales_staff_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_branch ON public.skin_analyses(branch_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_clinic_created ON public.skin_analyses(clinic_id, created_at DESC);

-- ============================================================================
-- STEP 2: Add clinic_id to treatment_records
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'treatment_records' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.treatment_records ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
    CREATE INDEX idx_treatment_records_clinic ON public.treatment_records(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to treatment_records';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_id already exists in treatment_records';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Add clinic_id to chat_rooms
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'chat_rooms' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.chat_rooms ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
    CREATE INDEX idx_chat_rooms_clinic ON public.chat_rooms(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to chat_rooms';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_id already exists in chat_rooms';
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Add clinic_id to chat_messages
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'chat_messages' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.chat_messages ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
    CREATE INDEX idx_chat_messages_clinic ON public.chat_messages(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to chat_messages';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_id already exists in chat_messages';
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Verify sales_leads has clinic_id (should exist from 20250107 migration)
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'sales_leads' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.sales_leads ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_sales_leads_clinic ON public.sales_leads(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to sales_leads';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_id already exists in sales_leads';
  END IF;
END $$;

-- ============================================================================
-- STEP 6: Add clinic_id to marketing_campaigns
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'marketing_campaigns' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.marketing_campaigns ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_marketing_campaigns_clinic ON public.marketing_campaigns(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to marketing_campaigns';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_id already exists in marketing_campaigns';
  END IF;
END $$;

-- ============================================================================
-- STEP 7: Add clinic_id to promo_codes
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'promo_codes' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.promo_codes ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_promo_codes_clinic ON public.promo_codes(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to promo_codes';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_id already exists in promo_codes';
  END IF;
END $$;

-- ============================================================================
-- STEP 8: Add clinic_id to queue_entries
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'queue_entries' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.queue_entries ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_queue_entries_clinic ON public.queue_entries(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to queue_entries';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_id already exists in queue_entries';
  END IF;
END $$;

-- ============================================================================
-- STEP 9: Add clinic_id to customer_notes
-- ============================================================================
DO $$ 
BEGIN
  -- clinic_id already exists in customer_notes (from schema)
  RAISE NOTICE 'ℹ️  customer_notes already has clinic_id column';
END $$;

-- ============================================================================
-- STEP 10: Update existing data (backfill clinic_id from user's clinic)
-- ============================================================================

-- Update skin_analyses with clinic_id from user
UPDATE public.skin_analyses sa
SET clinic_id = u.clinic_id
FROM public.users u
WHERE sa.user_id = u.id::text
AND sa.clinic_id IS NULL
AND u.clinic_id IS NOT NULL;

-- Update sales_leads with clinic_id from sales_staff
UPDATE public.sales_leads sl
SET clinic_id = u.clinic_id
FROM public.users u
WHERE sl.sales_user_id = u.id
AND sl.clinic_id IS NULL
AND u.clinic_id IS NOT NULL;

-- ============================================================================
-- STEP 11: Create helper functions for super_admin check
-- ============================================================================

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT role = 'super_admin' 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT clinic_id 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$;

-- ============================================================================
-- STEP 12: Enable RLS on critical tables
-- ============================================================================

-- Enable RLS on skin_analyses
ALTER TABLE public.skin_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view analyses from their clinic
DROP POLICY IF EXISTS "Clinic staff can view own clinic analyses" ON public.skin_analyses;
CREATE POLICY "Clinic staff can view own clinic analyses"
  ON public.skin_analyses
  FOR SELECT
  USING (
    -- Super admin sees all
    is_super_admin()
    OR
    -- User's own analyses
    user_id = auth.uid()::text
    OR 
    -- Staff can see their clinic's analyses
    clinic_id = get_user_clinic_id()
    OR
    -- Legacy data without clinic_id (temporary)
    clinic_id IS NULL
  );

-- Policy: Staff can insert analyses
DROP POLICY IF EXISTS "Staff can create analyses" ON public.skin_analyses;
CREATE POLICY "Staff can create analyses"
  ON public.skin_analyses
  FOR INSERT
  WITH CHECK (
    -- Must set clinic_id to user's clinic
    clinic_id = get_user_clinic_id()
    OR
    -- Super admin can create anywhere
    is_super_admin()
  );

-- Policy: Staff can update own clinic analyses
DROP POLICY IF EXISTS "Staff can update own clinic analyses" ON public.skin_analyses;
CREATE POLICY "Staff can update own clinic analyses"
  ON public.skin_analyses
  FOR UPDATE
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- Enable RLS on sales_leads
ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sales can view own clinic leads" ON public.sales_leads;
CREATE POLICY "Sales can view own clinic leads"
  ON public.sales_leads
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Sales can create leads" ON public.sales_leads;
CREATE POLICY "Sales can create leads"
  ON public.sales_leads
  FOR INSERT
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    OR
    is_super_admin()
  );

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can view own bookings" ON public.bookings;
CREATE POLICY "Clinic can view own bookings"
  ON public.bookings
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- Enable RLS on chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can view own chat rooms" ON public.chat_rooms;
CREATE POLICY "Clinic can view own chat rooms"
  ON public.chat_rooms
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can view own messages" ON public.chat_messages;
CREATE POLICY "Clinic can view own messages"
  ON public.chat_messages
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- Enable RLS on queue_entries
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can manage queue" ON public.queue_entries;
CREATE POLICY "Clinic can manage queue"
  ON public.queue_entries
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- ============================================================================
-- STEP 13: Enhance clinics table (add missing columns)
-- ============================================================================

DO $$ 
BEGIN
  -- Add clinic_name as alias to name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'clinic_name'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN clinic_name TEXT;
    -- Copy existing name to clinic_name
    UPDATE public.clinics SET clinic_name = name WHERE clinic_name IS NULL;
    RAISE NOTICE '✅ Added clinic_name to clinics';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_name already exists in clinics';
  END IF;

  -- Add clinic_code if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'clinic_code'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN clinic_code VARCHAR(20) UNIQUE;
    RAISE NOTICE '✅ Added clinic_code to clinics';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_code already exists in clinics';
  END IF;

  -- Add subscription_tier if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN subscription_tier TEXT DEFAULT 'starter';
    RAISE NOTICE '✅ Added subscription_tier to clinics';
  ELSE
    RAISE NOTICE 'ℹ️  subscription_tier already exists in clinics';
  END IF;

  -- Add max_sales_staff if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'max_sales_staff'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN max_sales_staff INTEGER DEFAULT 5;
    RAISE NOTICE '✅ Added max_sales_staff to clinics';
  ELSE
    RAISE NOTICE 'ℹ️  max_sales_staff already exists in clinics';
  END IF;

  -- Add max_analyses_per_month if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'max_analyses_per_month'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN max_analyses_per_month INTEGER DEFAULT 100;
    RAISE NOTICE '✅ Added max_analyses_per_month to clinics';
  ELSE
    RAISE NOTICE 'ℹ️  max_analyses_per_month already exists in clinics';
  END IF;
END $$;

-- Enable RLS on clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own clinic" ON public.clinics;
CREATE POLICY "Users can view own clinic"
  ON public.clinics
  FOR SELECT
  USING (
    is_super_admin()
    OR
    id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Super admin can manage all clinics" ON public.clinics;
CREATE POLICY "Super admin can manage all clinics"
  ON public.clinics
  FOR ALL
  USING (is_super_admin());

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  tables_with_clinic_id INTEGER;
  tables_with_rls INTEGER;
BEGIN
  -- Count tables with clinic_id
  SELECT COUNT(DISTINCT table_name) INTO tables_with_clinic_id
  FROM information_schema.columns
  WHERE table_schema = 'public'
  AND column_name = 'clinic_id';

  -- Count tables with RLS
  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = true;

  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Multi-Tenant Enhancement Migration Complete!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Tables with clinic_id: %', tables_with_clinic_id;
  RAISE NOTICE 'Tables with RLS enabled: %', tables_with_rls;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Key Tables Updated:';
  RAISE NOTICE '  ✅ skin_analyses - Added clinic_id, sales_staff_id, branch_id';
  RAISE NOTICE '  ✅ treatment_records - Added clinic_id';
  RAISE NOTICE '  ✅ chat_rooms - Added clinic_id';
  RAISE NOTICE '  ✅ chat_messages - Added clinic_id';
  RAISE NOTICE '  ✅ sales_leads - Verified clinic_id';
  RAISE NOTICE '  ✅ marketing_campaigns - Added clinic_id';
  RAISE NOTICE '  ✅ promo_codes - Added clinic_id';
  RAISE NOTICE '  ✅ queue_entries - Added clinic_id';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next Steps:';
  RAISE NOTICE '1. Verify RLS policies work correctly';
  RAISE NOTICE '2. Update application code to set clinic_id';
  RAISE NOTICE '3. Test with 2 demo clinics';
  RAISE NOTICE '4. Proceed to Invitation System';
END $$;
