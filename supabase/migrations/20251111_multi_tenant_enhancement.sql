-- ============================================================================
-- Multi-Tenant Enhancement Migration
-- Version: 2.0.0
-- Date: 2025-11-11
-- 
-- Purpose: Add clinic_id to ALL tables that need tenant isolation
-- Priority: CRITICAL for 6-clinic launch
-- 
-- Context: Migration 20250107 exists but skin_analyses missing clinic_id
-- This migration completes the multi-tenant foundation
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

  -- Add branch_id if not exists
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
-- STEP 2: Add clinic_id to other critical tables
-- ============================================================================

-- Bookings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
    ALTER TABLE public.bookings ADD COLUMN branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;
    CREATE INDEX idx_bookings_clinic ON public.bookings(clinic_id);
    CREATE INDEX idx_bookings_branch ON public.bookings(branch_id);
    RAISE NOTICE '✅ Added clinic_id to bookings';
  END IF;
END $$;

-- Treatments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'treatments' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.treatments ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
    ALTER TABLE public.treatments ADD COLUMN branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;
    CREATE INDEX idx_treatments_clinic ON public.treatments(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to treatments';
  END IF;
END $$;

-- Treatment Records
DO $$ 
BEGIN
  -- Check if table exists first
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'treatment_records'
  ) THEN
    -- Table exists, check if column exists
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
  ELSE
    RAISE NOTICE '⚠️  Table treatment_records does not exist - skipping';
  END IF;
END $$;

-- Products
DO $$ 
BEGIN
  -- Check if table exists first
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'products'
  ) THEN
    -- Table exists, check if column exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'clinic_id'
    ) THEN
      ALTER TABLE public.products ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
      CREATE INDEX idx_products_clinic ON public.products(clinic_id);
      RAISE NOTICE '✅ Added clinic_id to products';
    ELSE
      RAISE NOTICE 'ℹ️  clinic_id already exists in products';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  Table products does not exist - skipping';
  END IF;
END $$;

-- Invoices
DO $$ 
BEGIN
  -- Check if table exists first
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'invoices'
  ) THEN
    -- Table exists, check if column exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'clinic_id'
    ) THEN
      ALTER TABLE public.invoices ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
      CREATE INDEX idx_invoices_clinic ON public.invoices(clinic_id);
      RAISE NOTICE '✅ Added clinic_id to invoices';
    ELSE
      RAISE NOTICE 'ℹ️  clinic_id already exists in invoices';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  Table invoices does not exist - skipping';
  END IF;
END $$;

-- Chat Rooms
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'chat_rooms' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.chat_rooms ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
    CREATE INDEX idx_chat_rooms_clinic ON public.chat_rooms(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to chat_rooms';
  END IF;
END $$;

-- Chat Messages
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'chat_messages' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.chat_messages ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
    CREATE INDEX idx_chat_messages_clinic ON public.chat_messages(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to chat_messages';
  END IF;
END $$;

-- Sales Leads (already should have, but double check)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'sales_leads' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.sales_leads ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_sales_leads_clinic ON public.sales_leads(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to sales_leads';
  END IF;
END $$;

-- Sales Proposals
DO $$ 
BEGIN
  -- Check if table exists first
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'sales_proposals'
  ) THEN
    -- Table exists, check if column exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'sales_proposals' AND column_name = 'clinic_id'
    ) THEN
      ALTER TABLE public.sales_proposals ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
      CREATE INDEX idx_sales_proposals_clinic ON public.sales_proposals(clinic_id);
      RAISE NOTICE '✅ Added clinic_id to sales_proposals';
    ELSE
      RAISE NOTICE 'ℹ️  clinic_id already exists in sales_proposals';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  Table sales_proposals does not exist - skipping';
  END IF;
END $$;

-- Marketing Campaigns
DO $$ 
BEGIN
  -- Check if table exists first
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'marketing_campaigns'
  ) THEN
    -- Table exists, check if column exists
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
  ELSE
    RAISE NOTICE '⚠️  Table marketing_campaigns does not exist - skipping';
  END IF;
END $$;

-- Promo Codes
DO $$ 
BEGIN
  -- Check if table exists first
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'promo_codes'
  ) THEN
    -- Table exists, check if column exists
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
  ELSE
    RAISE NOTICE '⚠️  Table promo_codes does not exist - skipping';
  END IF;
END $$;

-- Queue Entries
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'queue_entries' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.queue_entries ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    ALTER TABLE public.queue_entries ADD COLUMN branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;
    CREATE INDEX idx_queue_entries_clinic ON public.queue_entries(clinic_id);
    CREATE INDEX idx_queue_entries_branch ON public.queue_entries(branch_id);
    RAISE NOTICE '✅ Added clinic_id to queue_entries';
  END IF;
END $$;

-- Notifications
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    CREATE INDEX idx_notifications_clinic ON public.notifications(clinic_id);
    RAISE NOTICE '✅ Added clinic_id to notifications';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Update existing data (backfill clinic_id from user's clinic)
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
WHERE sl.sales_staff_id = u.id
AND sl.clinic_id IS NULL
AND u.clinic_id IS NOT NULL;

-- ============================================================================
-- STEP 4: Create helper function for super_admin check
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
-- STEP 5: Enable RLS on critical tables
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

-- Enable RLS on treatments (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'treatments') THEN
    ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Clinic can manage treatments" ON public.treatments;
    CREATE POLICY "Clinic can manage treatments"
      ON public.treatments
      FOR ALL
      USING (
        is_super_admin()
        OR
        clinic_id = get_user_clinic_id()
      );
    RAISE NOTICE '✅ RLS enabled on treatments';
  ELSE
    RAISE NOTICE '⚠️  Table treatments does not exist - skipping RLS';
  END IF;
END $$;

-- Enable RLS on invoices (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Clinic can view own invoices" ON public.invoices;
    CREATE POLICY "Clinic can view own invoices"
      ON public.invoices
      FOR ALL
      USING (
        is_super_admin()
        OR
        clinic_id = get_user_clinic_id()
      );
    RAISE NOTICE '✅ RLS enabled on invoices';
  ELSE
    RAISE NOTICE '⚠️  Table invoices does not exist - skipping RLS';
  END IF;
END $$;

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

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own clinic notifications" ON public.notifications;
CREATE POLICY "Users see own clinic notifications"
  ON public.notifications
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
    OR
    user_id = auth.uid()
  );

-- ============================================================================
-- STEP 6: Create clinics table enhancements
-- ============================================================================

-- Add missing columns to clinics if needed
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
  END IF;

  -- Add clinic_code if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'clinic_code'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN clinic_code VARCHAR(20) UNIQUE;
    RAISE NOTICE '✅ Added clinic_code to clinics';
  END IF;

  -- Add subscription_tier if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN subscription_tier TEXT DEFAULT 'starter';
    RAISE NOTICE '✅ Added subscription_tier to clinics';
  END IF;

  -- Add max_sales_staff if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'max_sales_staff'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN max_sales_staff INTEGER DEFAULT 5;
    RAISE NOTICE '✅ Added max_sales_staff to clinics';
  END IF;

  -- Add max_analyses_per_month if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'max_analyses_per_month'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN max_analyses_per_month INTEGER DEFAULT 100;
    RAISE NOTICE '✅ Added max_analyses_per_month to clinics';
  END IF;

  -- Add is_active if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE '✅ Added is_active to clinics';
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
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '1. Test tenant isolation with 2 demo clinics';
  RAISE NOTICE '2. Verify RLS policies work correctly';
  RAISE NOTICE '3. Update application code to set clinic_id';
  RAISE NOTICE '4. Proceed to Phase 2: Invitation System';
END $$;
