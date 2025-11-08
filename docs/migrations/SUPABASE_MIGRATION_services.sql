-- ============================================================================
-- SUPABASE MIGRATION: services Table
-- ============================================================================
-- Description: Creates services table for clinic treatment/service offerings
-- Date: 2024-12-31
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================================

-- Step 1: Create services table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,

  -- Service Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- facial, treatment, consultation, etc.
  service_type VARCHAR(100), -- premium, standard, basic

  -- Pricing and Duration
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  currency VARCHAR(3) DEFAULT 'THB',

  -- Service Settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  max_bookings_per_day INTEGER,
  requires_consultation BOOLEAN NOT NULL DEFAULT false,

  -- Images and Media
  image_url TEXT,
  thumbnail_url TEXT,

  -- Additional Information
  benefits TEXT[],
  contraindications TEXT,
  preparation_instructions TEXT,
  aftercare_instructions TEXT,

  -- Metadata
  internal_notes TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: service name per clinic
  CONSTRAINT services_clinic_name_unique UNIQUE (clinic_id, name)
);


-- Step 2: Enable Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE services ENABLE ROW LEVEL SECURITY;


-- Step 3: Create RLS Policies
-- ----------------------------------------------------------------------------
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Clinic staff can view their clinic services" ON services;
DROP POLICY IF EXISTS "Clinic staff can insert services" ON services;
DROP POLICY IF EXISTS "Clinic staff can update their clinic services" ON services;
DROP POLICY IF EXISTS "Clinic staff can delete their clinic services" ON services;
DROP POLICY IF EXISTS "Public can view active services" ON services;
DROP POLICY IF EXISTS "Super admins can view all services" ON services;
DROP POLICY IF EXISTS "Super admins can manage all services" ON services;

-- Clinic staff can view services from their clinic
CREATE POLICY "Clinic staff can view their clinic services"
  ON services
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = services.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff')
    )
  );

-- Clinic staff can insert services for their clinic
CREATE POLICY "Clinic staff can insert services"
  ON services
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = services.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin')
    )
  );

-- Clinic staff can update services from their clinic
CREATE POLICY "Clinic staff can update their clinic services"
  ON services
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = services.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = services.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin')
    )
  );

-- Clinic staff can delete services from their clinic
CREATE POLICY "Clinic staff can delete their clinic services"
  ON services
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = services.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin')
    )
  );

-- Public can view active services (for booking forms)
CREATE POLICY "Public can view active services"
  ON services
  FOR SELECT
  USING (is_active = true);

-- Super admins can view all services
CREATE POLICY "Super admins can view all services"
  ON services
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Super admins can manage all services
CREATE POLICY "Super admins can manage all services"
  ON services
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
CREATE INDEX IF NOT EXISTS idx_services_clinic_id ON services(clinic_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(price);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services(sort_order);


-- Step 5: Create Trigger for Auto-updating updated_at
-- ----------------------------------------------------------------------------
-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS trigger_update_services_updated_at ON services;
DROP FUNCTION IF EXISTS update_services_updated_at();

-- Create function
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_services_updated_at();


-- Step 6: Add Table Comment
-- ----------------------------------------------------------------------------
COMMENT ON TABLE services IS 'Clinic service offerings with pricing, duration, and booking settings';


-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify)
-- ============================================================================

-- Check table structure
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'services';

-- Check RLS policies
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'services';

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'services';

-- Test insert (replace with your clinic_id)
-- INSERT INTO services (clinic_id, name, price, duration_minutes, category)
-- VALUES ('your-clinic-id-here', 'Basic Facial', 1500.00, 60, 'facial');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
