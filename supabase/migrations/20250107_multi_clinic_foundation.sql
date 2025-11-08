-- ============================================================================
-- Multi-Clinic Foundation Migration
-- Version: 1.0.0
-- Date: 2025-01-07
-- 
-- Purpose: Upgrade existing single-tenant system to support multiple clinics
-- Scale Target: 4 clinics × 30 sales = 120+ concurrent users
-- 
-- IMPORTANT: This migration works with EXISTING schema
-- - clinics table already exists
-- - users table already has clinic_id
-- - Only adding missing columns to skin_analyses
-- ============================================================================

-- ============================================================================
-- STEP 1: Check existing clinics table (already exists, skip creation)
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clinics') THEN
    RAISE EXCEPTION 'Clinics table does not exist! Please check your schema.';
  ELSE
    RAISE NOTICE '✅ Clinics table already exists';
  END IF;
END $$;

-- Optional: Add missing columns to clinics if needed
DO $$ 
BEGIN
  -- Add clinic_code if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clinics' 
    AND column_name = 'clinic_code'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN clinic_code VARCHAR(20) UNIQUE;
    RAISE NOTICE '✅ Added clinic_code to clinics table';
  END IF;

  -- Add subscription_tier if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clinics' 
    AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN subscription_tier TEXT DEFAULT 'standard';
    RAISE NOTICE '✅ Added subscription_tier to clinics table';
  END IF;

  -- Add max_sales_staff if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clinics' 
    AND column_name = 'max_sales_staff'
  ) THEN
    ALTER TABLE public.clinics ADD COLUMN max_sales_staff INTEGER DEFAULT 50;
    RAISE NOTICE '✅ Added max_sales_staff to clinics table';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: DO NOT create clinics table (already exists!)
-- ============================================================================
-- SKIP: Table already exists in schema

-- Old code removed:
-- CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  clinic_code VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "CLI001", "CLI002"
  clinic_name VARCHAR(255) NOT NULL,        -- e.g., "Beauty Clinic Bangkok"
  clinic_name_en VARCHAR(255),
  
  -- Branding
  logo_url TEXT,
  brand_color VARCHAR(7),                   -- e.g., "#FF6B6B"
  
  -- Contact
  phone VARCHAR(50),
  email VARCHAR(255),
  line_official VARCHAR(100),
  website TEXT,
  
  -- Address
  address TEXT,
  district VARCHAR(100),
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Thailand',
  
  -- Business Settings
  subscription_tier TEXT DEFAULT 'standard', -- free, standard, premium, enterprise
  subscription_expires_at TIMESTAMPTZ,
  max_sales_staff INTEGER DEFAULT 50,       -- Limit per clinic
  max_analyses_per_month INTEGER DEFAULT 10000,
  
  -- Features enabled
  features_enabled JSONB DEFAULT '{"offline_mode": true, "crm_integration": true, "analytics": true}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  trial_ends_at TIMESTAMPTZ,
  
  -- Owner (Super Admin for this clinic)
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadata
  settings JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clinics_code ON public.clinics(clinic_code);
CREATE INDEX IF NOT EXISTS idx_clinics_active ON public.clinics(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_clinics_owner ON public.clinics(owner_user_id);

COMMENT ON TABLE public.clinics IS 'Master clinic/organization table - each clinic can have multiple branches and staff';
COMMENT ON COLUMN public.clinics.max_sales_staff IS 'Maximum number of sales staff allowed (for subscription limits)';

-- ============================================================================
-- STEP 2: Add clinic_id to existing users table
-- ============================================================================
DO $$ 
BEGIN
  -- Add clinic_id column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added clinic_id to users table';
  ELSE
    RAISE NOTICE 'ℹ️  Column clinic_id already exists in users table';
  END IF;

  -- Add branch_id column if not exists (for staff assigned to specific branch)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added branch_id to users table';
  ELSE
    RAISE NOTICE 'ℹ️  Column branch_id already exists in users table';
  END IF;
END $$;

-- Create index for clinic_id in users
CREATE INDEX IF NOT EXISTS idx_users_clinic ON public.users(clinic_id);
CREATE INDEX IF NOT EXISTS idx_users_branch ON public.users(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_clinic_role ON public.users(clinic_id, role);

-- ============================================================================
-- STEP 3: Update user_role ENUM to include new roles
-- ============================================================================
DO $$ 
BEGIN
  -- Check if enum value exists before adding
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'clinic_owner' 
    AND enumtypid = 'user_role'::regtype
  ) THEN
    ALTER TYPE user_role ADD VALUE 'clinic_owner';
    RAISE NOTICE '✅ Added clinic_owner to user_role enum';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'ℹ️  Role clinic_owner already exists';
END $$;

-- ============================================================================
-- STEP 4: Add clinic_id to skin_analyses table
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'skin_analyses' 
    AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.skin_analyses ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added clinic_id to skin_analyses table';
  ELSE
    RAISE NOTICE 'ℹ️  Column clinic_id already exists in skin_analyses table';
  END IF;

  -- Add sales_staff_id to track who performed the analysis
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'skin_analyses' 
    AND column_name = 'sales_staff_id'
  ) THEN
    ALTER TABLE public.skin_analyses ADD COLUMN sales_staff_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added sales_staff_id to skin_analyses table';
  ELSE
    RAISE NOTICE 'ℹ️  Column sales_staff_id already exists in skin_analyses table';
  END IF;

  -- Add branch_id to track which branch
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'skin_analyses' 
    AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE public.skin_analyses ADD COLUMN branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added branch_id to skin_analyses table';
  ELSE
    RAISE NOTICE 'ℹ️  Column branch_id already exists in skin_analyses table';
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_skin_analyses_clinic ON public.skin_analyses(clinic_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_sales_staff ON public.skin_analyses(sales_staff_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_branch ON public.skin_analyses(branch_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_clinic_created ON public.skin_analyses(clinic_id, created_at DESC);

-- ============================================================================
-- STEP 5: Create Leads Table (CRM for Sales Staff)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Clinic & Branch
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  
  -- Sales staff who captured this lead
  sales_staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Lead Information
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  line_id VARCHAR(100),
  
  -- Lead Status
  status VARCHAR(20) DEFAULT 'new',  -- new, contacted, hot, warm, cold, converted, lost
  source VARCHAR(50),                -- walk_in, online, referral, event, social_media
  
  -- Analysis Reference (if analysis was done)
  analysis_id UUID REFERENCES public.skin_analyses(id) ON DELETE SET NULL,
  
  -- Follow-up
  follow_up_date DATE,
  last_contact_date DATE,
  next_action TEXT,
  
  -- Interests
  interested_treatments TEXT[],
  budget_range VARCHAR(50),         -- "< 10000", "10000-30000", "30000-50000", "> 50000"
  
  -- Conversion
  converted_to_customer BOOLEAN DEFAULT false,
  converted_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  
  -- Notes & History
  notes TEXT,
  interaction_history JSONB DEFAULT '[]'::jsonb,  -- [{date, type, notes}, ...]
  
  -- Score (for lead prioritization)
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_clinic ON public.leads(clinic_id);
CREATE INDEX IF NOT EXISTS idx_leads_sales_staff ON public.leads(sales_staff_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON public.leads(follow_up_date) WHERE follow_up_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_hot ON public.leads(clinic_id, status, lead_score DESC) WHERE status IN ('hot', 'warm');

COMMENT ON TABLE public.leads IS 'CRM leads captured by sales staff during demos';
COMMENT ON COLUMN public.leads.lead_score IS 'Automated score based on engagement, budget, timeline';

-- ============================================================================
-- STEP 6: Enable Row Level Security (RLS) for Multi-Tenancy
-- ============================================================================

-- Enable RLS on clinics table
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own clinic
DROP POLICY IF EXISTS "Users can view own clinic" ON public.clinics;
CREATE POLICY "Users can view own clinic"
  ON public.clinics
  FOR SELECT
  USING (
    id = (SELECT clinic_id FROM public.users WHERE id = auth.uid())
  );

-- Policy: Clinic owners can update their clinic
DROP POLICY IF EXISTS "Clinic owners can update" ON public.clinics;
CREATE POLICY "Clinic owners can update"
  ON public.clinics
  FOR UPDATE
  USING (
    owner_user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND clinic_id = clinics.id 
      AND role IN ('clinic_owner', 'super_admin')
    )
  );

-- Enable RLS on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Sales staff can view leads in their clinic
DROP POLICY IF EXISTS "Sales can view own clinic leads" ON public.leads;
CREATE POLICY "Sales can view own clinic leads"
  ON public.leads
  FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM public.users WHERE id = auth.uid())
  );

-- Policy: Sales staff can insert leads
DROP POLICY IF EXISTS "Sales can create leads" ON public.leads;
CREATE POLICY "Sales can create leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (
    sales_staff_id = auth.uid()
    AND clinic_id = (SELECT clinic_id FROM public.users WHERE id = auth.uid())
  );

-- Policy: Sales staff can update their own leads
DROP POLICY IF EXISTS "Sales can update own leads" ON public.leads;
CREATE POLICY "Sales can update own leads"
  ON public.leads
  FOR UPDATE
  USING (
    sales_staff_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND clinic_id = leads.clinic_id 
      AND role IN ('clinic_admin', 'clinic_owner', 'super_admin')
    )
  );

-- Update skin_analyses RLS policies for multi-clinic
DROP POLICY IF EXISTS "Clinic staff can view own clinic analyses" ON public.skin_analyses;
CREATE POLICY "Clinic staff can view own clinic analyses"
  ON public.skin_analyses
  FOR SELECT
  USING (
    -- User's own analyses
    user_id = auth.uid()::text
    OR 
    -- Sales staff can see analyses from their clinic
    clinic_id = (SELECT clinic_id FROM public.users WHERE id = auth.uid())
    OR
    -- Demo mode (no clinic_id)
    clinic_id IS NULL
  );

-- ============================================================================
-- STEP 7: Create helper functions
-- ============================================================================

-- Function: Get user's clinic_id
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT clinic_id FROM public.users WHERE id = auth.uid());
END;
$$;

-- Function: Check if user has clinic permission
CREATE OR REPLACE FUNCTION user_has_clinic_permission(target_clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_clinic UUID;
  user_role_val user_role;
BEGIN
  SELECT clinic_id, role INTO user_clinic, user_role_val
  FROM public.users 
  WHERE id = auth.uid();
  
  -- Super admin can access all clinics
  IF user_role_val = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user belongs to target clinic
  RETURN user_clinic = target_clinic_id;
END;
$$;

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS update_clinics_updated_at ON public.clinics;
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 8: Seed default clinics (for testing)
-- ============================================================================

-- Insert default clinic if none exists
INSERT INTO public.clinics (
  clinic_code,
  clinic_name,
  clinic_name_en,
  phone,
  email,
  subscription_tier,
  max_sales_staff,
  is_active
) VALUES 
  ('CLI001', 'Beauty Clinic Bangkok', 'Beauty Clinic Bangkok', '02-123-4567', 'contact@beautyclinic.com', 'enterprise', 50, true),
  ('CLI002', 'Aesthetic Center Phuket', 'Aesthetic Center Phuket', '076-123-456', 'info@aestheticphuket.com', 'premium', 30, true),
  ('CLI003', 'Skin Care Clinic Chiang Mai', 'Skin Care Clinic Chiang Mai', '053-123-456', 'hello@skincarecm.com', 'standard', 20, true),
  ('CLI004', 'Beauty Hub Pattaya', 'Beauty Hub Pattaya', '038-123-456', 'support@beautyhub.com', 'premium', 30, true)
ON CONFLICT (clinic_code) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================================================

-- Check if migration succeeded
DO $$
DECLARE
  clinic_count INTEGER;
  lead_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO clinic_count FROM public.clinics;
  SELECT COUNT(*) INTO lead_count FROM public.leads;
  
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Clinics created: %', clinic_count;
  RAISE NOTICE 'Leads table ready: % rows', lead_count;
END $$;

-- ============================================================================
-- ROLLBACK SCRIPT (Run if needed)
-- ============================================================================
/*
-- WARNING: This will delete all multi-clinic data!

DROP TABLE IF EXISTS public.leads CASCADE;
ALTER TABLE public.skin_analyses DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.skin_analyses DROP COLUMN IF EXISTS sales_staff_id CASCADE;
ALTER TABLE public.skin_analyses DROP COLUMN IF EXISTS branch_id CASCADE;
ALTER TABLE public.users DROP COLUMN IF EXISTS clinic_id CASCADE;
ALTER TABLE public.users DROP COLUMN IF EXISTS branch_id CASCADE;
DROP TABLE IF EXISTS public.clinics CASCADE;
DROP FUNCTION IF EXISTS get_user_clinic_id();
DROP FUNCTION IF EXISTS user_has_clinic_permission(UUID);

*/
