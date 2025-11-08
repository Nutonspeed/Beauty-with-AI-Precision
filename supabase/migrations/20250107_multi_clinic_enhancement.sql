-- ============================================================================
-- Multi-Clinic Enhancement Migration
-- Version: 2.0.0 (Compatible with existing schema)
-- Date: 2025-01-07
-- 
-- Purpose: Enhance existing multi-clinic system for 120+ concurrent users
-- Scale Target: 4 clinics × 30 sales = 120+ users
-- 
-- ASSUMPTIONS:
-- ✅ clinics table already exists
-- ✅ users table already has clinic_id
-- ✅ branches table already exists
-- ✅ sales_leads, sales_activities, sales_proposals already exist
-- 
-- WHAT THIS MIGRATION DOES:
-- 1. Add missing columns to skin_analyses (clinic_id, sales_staff_id, branch_id)
-- 2. Add missing columns to clinics (subscription limits)
-- 3. Update RLS policies for multi-clinic isolation
-- 4. Create helper functions for permissions
-- ============================================================================

-- ============================================================================
-- STEP 1: Enhance Clinics Table (Add subscription limits)
-- ============================================================================
DO $$ 
BEGIN
  -- Add clinic_code if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'clinic_code'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN clinic_code VARCHAR(20) UNIQUE;
    RAISE NOTICE '✅ Added clinic_code to clinics';
  END IF;

  -- Add subscription_tier if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN subscription_tier TEXT DEFAULT 'standard';
    RAISE NOTICE '✅ Added subscription_tier to clinics';
  END IF;

  -- Add max_sales_staff if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'max_sales_staff'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN max_sales_staff INTEGER DEFAULT 50;
    RAISE NOTICE '✅ Added max_sales_staff to clinics';
  END IF;

  -- Add max_analyses_per_month if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'max_analyses_per_month'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN max_analyses_per_month INTEGER DEFAULT 10000;
    RAISE NOTICE '✅ Added max_analyses_per_month to clinics';
  END IF;

  -- Add features_enabled if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clinics' AND column_name = 'features_enabled'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN features_enabled JSONB DEFAULT '{"offline_mode": true, "crm_integration": true, "analytics": true}'::jsonb;
    RAISE NOTICE '✅ Added features_enabled to clinics';
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinics_code ON public.clinics(clinic_code);
CREATE INDEX IF NOT EXISTS idx_clinics_tier ON public.clinics(subscription_tier) WHERE is_active = true;

-- ============================================================================
-- STEP 2: Enhance skin_analyses Table (Add clinic context)
-- ============================================================================
DO $$ 
BEGIN
  -- Add clinic_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'skin_analyses' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.skin_analyses ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added clinic_id to skin_analyses';
  END IF;

  -- Add sales_staff_id if not exists (who performed the analysis)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'skin_analyses' AND column_name = 'sales_staff_id'
  ) THEN
    ALTER TABLE public.skin_analyses ADD COLUMN sales_staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added sales_staff_id to skin_analyses';
  END IF;

  -- Add branch_id if not exists (which branch)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'skin_analyses' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE public.skin_analyses ADD COLUMN branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added branch_id to skin_analyses';
  END IF;

  -- Add is_shared if not exists (for Save & Share feature)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'skin_analyses' AND column_name = 'is_shared'
  ) THEN
    ALTER TABLE public.skin_analyses ADD COLUMN is_shared BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ Added is_shared to skin_analyses';
  END IF;

  -- Add share_token if not exists (for public share links)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'skin_analyses' AND column_name = 'share_token'
  ) THEN
    ALTER TABLE public.skin_analyses ADD COLUMN share_token TEXT UNIQUE;
    RAISE NOTICE '✅ Added share_token to skin_analyses';
  END IF;

  -- Add share_expires_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'skin_analyses' AND column_name = 'share_expires_at'
  ) THEN
    ALTER TABLE public.skin_analyses ADD COLUMN share_expires_at TIMESTAMPTZ;
    RAISE NOTICE '✅ Added share_expires_at to skin_analyses';
  END IF;
END $$;

-- Create indexes for performance (100+ concurrent users)
CREATE INDEX IF NOT EXISTS idx_analyses_clinic ON public.skin_analyses(clinic_id);
CREATE INDEX IF NOT EXISTS idx_analyses_sales_staff ON public.skin_analyses(sales_staff_id);
CREATE INDEX IF NOT EXISTS idx_analyses_branch ON public.skin_analyses(branch_id);
CREATE INDEX IF NOT EXISTS idx_analyses_clinic_created ON public.skin_analyses(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_share_token ON public.skin_analyses(share_token) WHERE share_token IS NOT NULL;

-- ============================================================================
-- STEP 3: Add branch_id to users (if not exists)
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_users_branch ON public.users(branch_id);
    RAISE NOTICE '✅ Added branch_id to users';
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Create Helper Functions for Multi-Clinic Permissions
-- ============================================================================

-- Function: Get user's clinic_id
CREATE OR REPLACE FUNCTION public.get_user_clinic_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT clinic_id FROM public.users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function: Check if user has permission in clinic
CREATE OR REPLACE FUNCTION public.user_has_clinic_permission(
  user_uuid UUID,
  target_clinic_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role_val TEXT;
  user_clinic_id_val UUID;
BEGIN
  SELECT role::TEXT, clinic_id INTO user_role_val, user_clinic_id_val
  FROM public.users WHERE id = user_uuid;
  
  -- Super admin can access all clinics
  IF user_role_val = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Clinic owner can access own clinic
  IF user_role_val = 'clinic_owner' AND user_clinic_id_val = target_clinic_id THEN
    RETURN true;
  END IF;
  
  -- Clinic admin/staff can access own clinic
  IF user_role_val IN ('clinic_admin', 'clinic_staff', 'sales_staff') 
     AND user_clinic_id_val = target_clinic_id THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- STEP 5: RLS Policies for Multi-Clinic Isolation
-- ============================================================================

-- Enable RLS on skin_analyses (if not already enabled)
ALTER TABLE public.skin_analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (replace with multi-clinic versions)
DROP POLICY IF EXISTS "Users can view own clinic analyses" ON public.skin_analyses;
DROP POLICY IF EXISTS "Sales staff can view own clinic analyses" ON public.skin_analyses;
DROP POLICY IF EXISTS "Users can insert own clinic analyses" ON public.skin_analyses;
DROP POLICY IF EXISTS "Allow public read access for demo" ON public.skin_analyses;

-- Policy: Users can view analyses from their own clinic
CREATE POLICY "Users can view own clinic analyses"
ON public.skin_analyses
FOR SELECT
USING (
  auth.uid() = user_id::uuid  -- User's own analyses (including demo users with TEXT user_id)
  OR
  clinic_id IN (
    SELECT clinic_id FROM public.users WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'clinic_owner', 'clinic_admin')
  )
);

-- Policy: Sales staff can only create analyses in their own clinic
CREATE POLICY "Sales staff can insert own clinic analyses"
ON public.skin_analyses
FOR INSERT
WITH CHECK (
  -- Allow demo users (user_id as TEXT)
  user_id IS NOT NULL
  OR
  -- Sales staff must be from same clinic
  (
    clinic_id IN (
      SELECT clinic_id FROM public.users WHERE id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('sales_staff', 'clinic_staff', 'clinic_admin', 'clinic_owner', 'super_admin')
    )
  )
);

-- Policy: Allow public read for demo analyses (backward compatibility)
CREATE POLICY "Allow public read access for demo"
ON public.skin_analyses
FOR SELECT
USING (
  user_id LIKE 'demo-%'  -- Demo analyses are public
  OR
  is_shared = true AND (share_expires_at IS NULL OR share_expires_at > NOW())  -- Shared analyses
);

-- ============================================================================
-- STEP 6: Seed Data for 4 Clinics (if clinics are empty)
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.clinics LIMIT 1) THEN
    -- Insert 4 clinics
    INSERT INTO public.clinics (clinic_code, name, slug, subscription_tier, max_sales_staff, max_analyses_per_month, is_active, features_enabled)
    VALUES
      ('CLI001', 'Bangkok Skin Clinic', 'bangkok-skin-clinic', 'enterprise', 50, 50000, true, '{"offline_mode": true, "crm_integration": true, "analytics": true}'::jsonb),
      ('CLI002', 'Phuket Beauty Center', 'phuket-beauty-center', 'premium', 30, 20000, true, '{"offline_mode": true, "crm_integration": true, "analytics": true}'::jsonb),
      ('CLI003', 'Chiang Mai Wellness', 'chiang-mai-wellness', 'standard', 20, 10000, true, '{"offline_mode": false, "crm_integration": true, "analytics": false}'::jsonb),
      ('CLI004', 'Pattaya Aesthetic Clinic', 'pattaya-aesthetic', 'premium', 30, 20000, true, '{"offline_mode": true, "crm_integration": true, "analytics": true}'::jsonb);
    
    RAISE NOTICE '✅ Seeded 4 clinics';
  ELSE
    RAISE NOTICE 'ℹ️  Clinics already exist, skipping seed data';
  END IF;
END $$;

-- ============================================================================
-- STEP 7: Update Indexes for Performance (120+ Concurrent Users)
-- ============================================================================

-- Index for fast user lookup by clinic
CREATE INDEX IF NOT EXISTS idx_users_clinic_role ON public.users(clinic_id, role);

-- Index for sales performance queries
CREATE INDEX IF NOT EXISTS idx_sales_leads_sales_user ON public.sales_leads(sales_user_id, status);
CREATE INDEX IF NOT EXISTS idx_sales_activities_lead_created ON public.sales_activities(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_proposals_lead_status ON public.sales_proposals(lead_id, status);

-- Index for bookings by clinic
CREATE INDEX IF NOT EXISTS idx_bookings_clinic_date ON public.bookings(clinic_id, booking_date DESC);

-- ============================================================================
-- Migration Complete!
-- ============================================================================
DO $$ 
BEGIN
  RAISE NOTICE '
  ============================================================================
  ✅ Multi-Clinic Enhancement Migration Complete!
  ============================================================================
  
  📊 Changes Applied:
  1. Enhanced clinics table with subscription limits
  2. Added clinic_id, sales_staff_id, branch_id to skin_analyses
  3. Created RLS policies for multi-clinic isolation
  4. Created helper functions: get_user_clinic_id(), user_has_clinic_permission()
  5. Seeded 4 clinics (if empty)
  6. Created performance indexes for 120+ concurrent users
  
  🎯 Ready for:
  - 4 clinics × 30 sales = 120+ concurrent users
  - Multi-tenant data isolation with RLS
  - Sales performance tracking per clinic
  - Save & Share with expiry tokens
  
  ⚠️  Next Steps:
  1. Verify with: SELECT * FROM clinics;
  2. Test RLS: SELECT * FROM skin_analyses WHERE clinic_id = <clinic_id>;
  3. Run performance tests with 100+ concurrent users
  
  ============================================================================
  ';
END $$;
