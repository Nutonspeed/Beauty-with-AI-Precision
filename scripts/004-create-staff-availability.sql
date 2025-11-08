-- Create staff_availability table for managing staff schedules
CREATE TABLE IF NOT EXISTS staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  break_start_time TIME,
  break_end_time TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_staff_availability_staff_date ON staff_availability(staff_id, date);
CREATE INDEX IF NOT EXISTS idx_staff_availability_clinic ON staff_availability(clinic_id);

-- Enable RLS
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view their own availability"
  ON staff_availability FOR SELECT
  USING (auth.uid() = staff_id);

CREATE POLICY "Staff can manage their own availability"
  ON staff_availability FOR ALL
  USING (auth.uid() = staff_id);

CREATE POLICY "Clinic staff can view all availability"
  ON staff_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = staff_availability.clinic_id
      AND users.role IN ('admin', 'clinic_staff')
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_staff_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER staff_availability_updated_at
  BEFORE UPDATE ON staff_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_availability_updated_at();
