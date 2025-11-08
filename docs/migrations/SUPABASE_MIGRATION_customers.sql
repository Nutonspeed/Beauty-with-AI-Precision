-- ============================================================================
-- SUPABASE MIGRATION: customers Table
-- ============================================================================
-- Description: Creates customers table for clinic customer management and lead tracking
-- Date: 2024-12-31
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================================

-- Step 1: Create customers table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,

  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),

  -- Skin Profile
  skin_type VARCHAR(50),
  skin_concerns TEXT[],
  allergies TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,

  -- Lead Management
  lead_status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, converted, lost
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_source VARCHAR(100), -- website, referral, social_media, walk_in, etc.
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  next_follow_up_at TIMESTAMP WITH TIME ZONE,

  -- Marketing
  email_subscribed BOOLEAN NOT NULL DEFAULT true,
  sms_subscribed BOOLEAN NOT NULL DEFAULT true,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: email per clinic (allow multiple clinics to have same email)
  CONSTRAINT customers_clinic_email_unique UNIQUE (clinic_id, email)
);


-- Step 2: Enable Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;


-- Step 3: Create RLS Policies
-- ----------------------------------------------------------------------------
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Clinic staff can view their clinic customers" ON customers;
DROP POLICY IF EXISTS "Clinic staff can insert customers" ON customers;
DROP POLICY IF EXISTS "Clinic staff can update their clinic customers" ON customers;
DROP POLICY IF EXISTS "Clinic staff can delete their clinic customers" ON customers;
DROP POLICY IF EXISTS "Super admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Super admins can manage all customers" ON customers;

-- Clinic staff can view customers from their clinic
CREATE POLICY "Clinic staff can view their clinic customers"
  ON customers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = customers.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff')
    )
  );

-- Clinic staff can insert customers for their clinic
CREATE POLICY "Clinic staff can insert customers"
  ON customers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = customers.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff')
    )
  );

-- Clinic staff can update customers from their clinic
CREATE POLICY "Clinic staff can update their clinic customers"
  ON customers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = customers.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = customers.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff')
    )
  );

-- Clinic staff can delete customers from their clinic (soft delete by setting is_active = false)
CREATE POLICY "Clinic staff can delete their clinic customers"
  ON customers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = customers.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin')
    )
  );

-- Super admins can view all customers
CREATE POLICY "Super admins can view all customers"
  ON customers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Super admins can manage all customers
CREATE POLICY "Super admins can manage all customers"
  ON customers
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
CREATE INDEX IF NOT EXISTS idx_customers_clinic_id ON customers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_lead_status ON customers(lead_status);
CREATE INDEX IF NOT EXISTS idx_customers_lead_score ON customers(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_next_follow_up ON customers(next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;


-- Step 5: Create Trigger for Auto-updating updated_at
-- ----------------------------------------------------------------------------
-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS trigger_update_customers_updated_at ON customers;
DROP FUNCTION IF EXISTS update_customers_updated_at();

-- Create function
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();


-- Step 6: Add Table Comment
-- ----------------------------------------------------------------------------
COMMENT ON TABLE customers IS 'Clinic customer management with lead tracking and marketing consent';


-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify)
-- ============================================================================

-- Check table structure
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'customers';

-- Check RLS policies
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'customers';

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'customers';

-- Test insert (replace with your clinic_id)
-- INSERT INTO customers (clinic_id, full_name, email, phone, lead_source)
-- VALUES ('your-clinic-id-here', 'John Doe', 'john@example.com', '+66812345678', 'website');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
