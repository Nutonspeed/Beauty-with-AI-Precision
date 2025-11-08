-- ============================================================================
-- SUPABASE MIGRATION: bookings Table
-- ============================================================================
-- Description: Creates bookings table for clinic appointment management
-- Date: 2024-12-31
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================================

-- Step 1: Create ENUM for booking status
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create bookings table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Booking Details
  treatment_type VARCHAR(255) NOT NULL, -- Cached from service name
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),

  -- Status and Lifecycle
  status booking_status NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,

  -- Staff Assignment
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Customer Information (cached for convenience)
  customer_notes TEXT,
  internal_notes TEXT,

  -- Communication
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  follow_up_sent BOOLEAN NOT NULL DEFAULT false,
  follow_up_sent_at TIMESTAMP WITH TIME ZONE,

  -- Cancellation
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT bookings_no_double_booking UNIQUE (clinic_id, booking_date, booking_time, staff_id),
  CONSTRAINT bookings_valid_status_times CHECK (
    (status = 'confirmed' AND confirmed_at IS NOT NULL) OR
    (status != 'confirmed' AND confirmed_at IS NULL)
  ),
  CONSTRAINT bookings_valid_completion_times CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR
    (status != 'completed' AND completed_at IS NULL)
  )
);


-- Step 3: Enable Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;


-- Step 4: Create RLS Policies
-- ----------------------------------------------------------------------------
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Clinic staff can view their clinic bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Clinic staff can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Clinic staff can update their clinic bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update their pending bookings" ON bookings;
DROP POLICY IF EXISTS "Super admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Super admins can manage all bookings" ON bookings;

-- Clinic staff can view bookings from their clinic
CREATE POLICY "Clinic staff can view their clinic bookings"
  ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = bookings.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff')
    )
  );

-- Customers can view their own bookings
CREATE POLICY "Customers can view their own bookings"
  ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = bookings.customer_id
      AND customers.email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Clinic staff can insert bookings for their clinic
CREATE POLICY "Clinic staff can insert bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = bookings.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff')
    )
  );

-- Clinic staff can update bookings from their clinic
CREATE POLICY "Clinic staff can update their clinic bookings"
  ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = bookings.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = bookings.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff')
    )
  );

-- Customers can update their pending bookings (limited fields)
CREATE POLICY "Customers can update their pending bookings"
  ON bookings
  FOR UPDATE
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = bookings.customer_id
      AND customers.email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = bookings.customer_id
      AND customers.email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Super admins can view all bookings
CREATE POLICY "Super admins can view all bookings"
  ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Super admins can manage all bookings
CREATE POLICY "Super admins can manage all bookings"
  ON bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );


-- Step 5: Create Indexes for Performance
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bookings_clinic_id ON bookings(clinic_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_time ON bookings(booking_time);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_clinic_date ON bookings(clinic_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_date ON bookings(customer_id, booking_date DESC);


-- Step 6: Create Trigger for Auto-updating updated_at
-- ----------------------------------------------------------------------------
-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS trigger_update_bookings_updated_at ON bookings;
DROP FUNCTION IF EXISTS update_bookings_updated_at();

-- Create function
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();


-- Step 7: Create Trigger for Status Timestamps
-- ----------------------------------------------------------------------------
-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS trigger_booking_status_timestamps ON bookings;
DROP FUNCTION IF EXISTS update_booking_status_timestamps();

-- Create function
CREATE OR REPLACE FUNCTION update_booking_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Set timestamps based on status changes
  IF OLD.status != NEW.status THEN
    CASE NEW.status
      WHEN 'confirmed' THEN
        NEW.confirmed_at = NOW();
      WHEN 'in_progress' THEN
        NEW.started_at = NOW();
      WHEN 'completed' THEN
        NEW.completed_at = NOW();
      WHEN 'cancelled' THEN
        NEW.cancelled_at = NOW();
        NEW.cancelled_by = auth.uid();
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_booking_status_timestamps
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_status_timestamps();


-- Step 8: Add Table Comment
-- ----------------------------------------------------------------------------
COMMENT ON TABLE bookings IS 'Clinic appointment bookings with status tracking and staff assignment';


-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify)
-- ============================================================================

-- Check table structure
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'bookings';

-- Check RLS policies
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'bookings';

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'bookings';

-- Test insert (replace with your IDs)
-- INSERT INTO bookings (clinic_id, customer_id, service_id, treatment_type, booking_date, booking_time, duration_minutes, price)
-- VALUES ('clinic-id', 'customer-id', 'service-id', 'Basic Facial', '2024-12-31', '10:00', 60, 1500.00);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
