-- ============================================================================
-- SUPABASE MIGRATION: clinics Table
-- ============================================================================
-- Description: Creates clinics table for multi-tenant clinic management
-- Date: 2024-12-31
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================================

-- Step 1: Create clinics table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),

  -- Business settings
  business_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "09:00", "close": "17:00", "closed": false},
    "sunday": {"open": null, "close": null, "closed": true}
  }'::jsonb,

  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#1F2937',

  -- Settings
  timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
  currency VARCHAR(3) DEFAULT 'THB',
  language VARCHAR(5) DEFAULT 'th',

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Owner (references users table)
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);


-- Step 2: Enable Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;


-- Step 3: Create RLS Policies
-- ----------------------------------------------------------------------------
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Clinic owners can view their clinics" ON clinics;
DROP POLICY IF EXISTS "Clinic owners can insert their clinics" ON clinics;
DROP POLICY IF EXISTS "Clinic owners can update their clinics" ON clinics;
DROP POLICY IF EXISTS "Clinic staff can view their clinic" ON clinics;
DROP POLICY IF EXISTS "Super admins can view all clinics" ON clinics;
DROP POLICY IF EXISTS "Super admins can manage all clinics" ON clinics;

-- Clinic owners can view their own clinics
CREATE POLICY "Clinic owners can view their clinics"
  ON clinics
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Clinic owners can insert their clinics
CREATE POLICY "Clinic owners can insert their clinics"
  ON clinics
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Clinic owners can update their clinics
CREATE POLICY "Clinic owners can update their clinics"
  ON clinics
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Clinic staff can view their clinic (through users table relationship)
CREATE POLICY "Clinic staff can view their clinic"
  ON clinics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = clinics.id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff')
    )
  );

-- Super admins can view all clinics
CREATE POLICY "Super admins can view all clinics"
  ON clinics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Super admins can manage all clinics
CREATE POLICY "Super admins can manage all clinics"
  ON clinics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );


-- Step 4: Create Indexes for Performance
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clinics_owner_id ON clinics(owner_id);
CREATE INDEX IF NOT EXISTS idx_clinics_slug ON clinics(slug);
CREATE INDEX IF NOT EXISTS idx_clinics_is_active ON clinics(is_active);
CREATE INDEX IF NOT EXISTS idx_clinics_created_at ON clinics(created_at DESC);


-- Step 5: Create Trigger for Auto-updating updated_at
-- ----------------------------------------------------------------------------
-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS trigger_update_clinics_updated_at ON clinics;
DROP FUNCTION IF EXISTS update_clinics_updated_at();

-- Create function
CREATE OR REPLACE FUNCTION update_clinics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_clinics_updated_at();


-- Step 6: Add Table Comment
-- ----------------------------------------------------------------------------
COMMENT ON TABLE clinics IS 'Multi-tenant clinic management with branding and business settings';


-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify)
-- ============================================================================

-- Check table structure
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'clinics';

-- Check RLS policies
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'clinics';

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'clinics';

-- Test insert (replace with your user_id)
-- INSERT INTO clinics (name, slug, owner_id)
-- VALUES ('Demo Clinic', 'demo-clinic', 'your-user-id-here');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
