-- Fix RLS policies for bookings table to allow clinic staff access
-- Drop existing policies
DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

-- Create new comprehensive policies
-- 1. Customers can view their own bookings
CREATE POLICY "Customers can view their own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid()::text = patient_id 
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

-- 2. Clinic staff can view all bookings
CREATE POLICY "Clinic staff can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

-- 3. Customers can create their own bookings
CREATE POLICY "Customers can create their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    auth.uid()::text = patient_id 
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

-- 4. Clinic staff can create bookings for any customer
CREATE POLICY "Clinic staff can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

-- 5. Customers can update their own bookings
CREATE POLICY "Customers can update their own bookings"
  ON bookings FOR UPDATE
  USING (
    auth.uid()::text = patient_id 
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

-- 6. Clinic staff can update any booking
CREATE POLICY "Clinic staff can update bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

-- 7. Clinic staff can delete bookings
CREATE POLICY "Clinic staff can delete bookings"
  ON bookings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

-- Comments
COMMENT ON POLICY "Customers can view their own bookings" ON bookings IS 'Customers and clinic staff can view bookings';
COMMENT ON POLICY "Clinic staff can view all bookings" ON bookings IS 'Clinic staff have full visibility';
COMMENT ON POLICY "Clinic staff can create bookings" ON bookings IS 'Staff can book appointments for customers';
COMMENT ON POLICY "Clinic staff can update bookings" ON bookings IS 'Staff can modify booking details';
COMMENT ON POLICY "Clinic staff can delete bookings" ON bookings IS 'Staff can cancel/remove bookings';
