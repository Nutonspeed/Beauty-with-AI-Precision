-- Booking System Database Schema
-- สร้างตาราง bookings สำหรับระบบจองนัดหมาย

-- Drop existing table if exists
DROP TABLE IF EXISTS bookings CASCADE;

-- Create bookings table
CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  doctor_id VARCHAR(50) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  appointment_date DATE NOT NULL,
  start_time VARCHAR(5) NOT NULL, -- "HH:MM" format
  end_time VARCHAR(5) NOT NULL,   -- "HH:MM" format
  duration INTEGER NOT NULL,       -- in minutes
  treatment_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(20),
  payment_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show')),
  CONSTRAINT chk_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  CONSTRAINT chk_payment_method CHECK (payment_method IN ('promptpay', 'credit_card', 'cash') OR payment_method IS NULL)
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_patient_id ON bookings(patient_id);
CREATE INDEX idx_bookings_doctor_id ON bookings(doctor_id);
CREATE INDEX idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_reminder_sent ON bookings(reminder_sent);

-- Create composite index for availability checks
CREATE INDEX idx_bookings_doctor_date_time ON bookings(doctor_id, appointment_date, start_time, end_time);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create doctors table (if not exists)
CREATE TABLE IF NOT EXISTS doctors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  working_hours JSONB, -- {"monday": {"start": "09:00", "end": "18:00"}, ...}
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert sample doctors
INSERT INTO doctors (id, name, specialization, email, phone, working_hours) VALUES
('dr001', 'พญ. สมหญิง ใจดี', 'Dermatology', 'dr.somying@example.com', '0812345678', 
  '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}, "wednesday": {"start": "09:00", "end": "18:00"}, "thursday": {"start": "09:00", "end": "18:00"}, "friday": {"start": "09:00", "end": "18:00"}}'::jsonb),
('dr002', 'นพ. วิทย์ มีสุข', 'Aesthetic Medicine', 'dr.wit@example.com', '0823456789',
  '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}, "wednesday": {"start": "09:00", "end": "18:00"}, "thursday": {"start": "09:00", "end": "18:00"}, "friday": {"start": "09:00", "end": "18:00"}}'::jsonb),
('dr003', 'พญ. ปริม สวย', 'Cosmetic Surgery', 'dr.prim@example.com', '0834567890',
  '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}, "wednesday": {"start": "09:00", "end": "18:00"}, "thursday": {"start": "09:00", "end": "18:00"}, "friday": {"start": "09:00", "end": "18:00"}}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert sample bookings for demo
INSERT INTO bookings (
  id, patient_id, patient_name, patient_email, patient_phone,
  doctor_id, doctor_name, appointment_date, start_time, end_time, duration,
  treatment_type, status, payment_status, payment_method, payment_amount
) VALUES
('BK001', 'PAT123', 'คุณสมชาย ใจดี', 'somchai@example.com', '0801234567',
  'dr001', 'พญ. สมหญิง ใจดี', CURRENT_DATE + INTERVAL '1 day', '10:00', '11:00', 60,
  'botox', 'confirmed', 'paid', 'promptpay', 15000),
('BK002', 'PAT123', 'คุณสมชาย ใจดี', 'somchai@example.com', '0801234567',
  'dr002', 'นพ. วิทย์ มีสุข', CURRENT_DATE + INTERVAL '3 days', '14:00', '15:00', 60,
  'laser', 'pending', 'pending', 'credit_card', 12000),
('BK003', 'PAT123', 'คุณสมชาย ใจดี', 'somchai@example.com', '0801234567',
  'dr001', 'พญ. สมหญิง ใจดี', CURRENT_DATE - INTERVAL '7 days', '11:00', '12:00', 60,
  'hydrafacial', 'completed', 'paid', 'cash', 5000)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings (patients can only see their own bookings)
CREATE POLICY "Patients can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid()::text = patient_id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Patients can create their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid()::text = patient_id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Patients can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid()::text = patient_id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- Create policies for doctors (public read)
CREATE POLICY "Everyone can view doctors"
  ON doctors FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage doctors"
  ON doctors FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- Comments
COMMENT ON TABLE bookings IS 'Stores all booking appointments';
COMMENT ON TABLE doctors IS 'Stores doctor information and availability';
COMMENT ON COLUMN bookings.reminder_sent IS 'TRUE if 24-hour reminder has been sent';
COMMENT ON COLUMN bookings.payment_amount IS 'Amount in Thai Baht (THB)';
