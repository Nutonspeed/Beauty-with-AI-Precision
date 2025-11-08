-- ============================================================================
-- Appointment Scheduling System for Beauty Clinic
-- ============================================================================
-- Features:
-- - Doctor/Room availability management
-- - Time slot booking with conflict detection
-- - Recurring appointments
-- - Cancellation/rescheduling with policies
-- - Automated reminders (Email/SMS/LINE)
-- ============================================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS appointment_reminders CASCADE;
DROP TABLE IF EXISTS appointment_cancellations CASCADE;
DROP TABLE IF EXISTS appointment_recurrence CASCADE;
DROP TABLE IF EXISTS appointment_slots CASCADE;
DROP TABLE IF EXISTS doctor_availability CASCADE;
DROP TABLE IF EXISTS room_availability CASCADE;
DROP TABLE IF EXISTS service_rooms CASCADE;

-- ============================================================================
-- 1. Service Rooms Table
-- ============================================================================
CREATE TABLE service_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  room_type VARCHAR(50) NOT NULL, -- 'treatment', 'consultation', 'laser', 'facial', etc.
  capacity INTEGER DEFAULT 1,
  equipment JSONB DEFAULT '[]'::jsonb, -- Array of equipment available
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'maintenance', 'inactive'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinic_id, room_number)
);

CREATE INDEX idx_service_rooms_clinic ON service_rooms(clinic_id);
CREATE INDEX idx_service_rooms_status ON service_rooms(status);

COMMENT ON TABLE service_rooms IS 'Treatment rooms for customer services';
COMMENT ON COLUMN service_rooms.equipment IS 'JSON array of equipment, e.g., ["laser machine", "facial steamer"]';

-- ============================================================================
-- 2. Doctor Availability Table
-- ============================================================================
CREATE TABLE doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL, -- References clinic_staff or users
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  max_appointments_per_slot INTEGER DEFAULT 1,
  slot_duration_minutes INTEGER DEFAULT 30, -- Default slot duration
  break_start_time TIME, -- Optional lunch/break time
  break_end_time TIME,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE, -- NULL means indefinite
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_break_time CHECK (
    (break_start_time IS NULL AND break_end_time IS NULL) OR
    (break_start_time IS NOT NULL AND break_end_time IS NOT NULL AND break_end_time > break_start_time)
  )
);

CREATE INDEX idx_doctor_availability_doctor ON doctor_availability(doctor_id);
CREATE INDEX idx_doctor_availability_clinic ON doctor_availability(clinic_id);
CREATE INDEX idx_doctor_availability_day ON doctor_availability(day_of_week);
CREATE INDEX idx_doctor_availability_dates ON doctor_availability(effective_from, effective_to);

COMMENT ON TABLE doctor_availability IS 'Weekly schedule for doctors/staff';
COMMENT ON COLUMN doctor_availability.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';

-- ============================================================================
-- 3. Room Availability Table
-- ============================================================================
CREATE TABLE room_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES service_rooms(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_room_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_room_availability_room ON room_availability(room_id);
CREATE INDEX idx_room_availability_day ON room_availability(day_of_week);
CREATE INDEX idx_room_availability_dates ON room_availability(effective_from, effective_to);

COMMENT ON TABLE room_availability IS 'Weekly schedule for treatment rooms';

-- ============================================================================
-- 4. Appointment Slots Table (Enhanced bookings)
-- ============================================================================
CREATE TABLE appointment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL, -- References users table
  doctor_id UUID, -- Optional: specific doctor
  room_id UUID REFERENCES service_rooms(id) ON DELETE SET NULL,
  service_id UUID, -- References services table if exists
  
  -- Appointment details
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  
  -- Customer information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20) NOT NULL,
  
  -- Service details
  service_name VARCHAR(255) NOT NULL,
  service_price DECIMAL(10, 2),
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'
  confirmation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'declined'
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid', 'deposit', 'paid', 'refunded'
  
  -- Notes and special requirements
  customer_notes TEXT,
  staff_notes TEXT,
  special_requirements JSONB DEFAULT '{}'::jsonb,
  
  -- Cancellation tracking
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID, -- User who cancelled
  cancellation_reason TEXT,
  cancellation_fee DECIMAL(10, 2) DEFAULT 0,
  
  -- Rescheduling tracking
  rescheduled_from UUID REFERENCES appointment_slots(id),
  rescheduled_to UUID REFERENCES appointment_slots(id),
  reschedule_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_appointment_time CHECK (end_time > start_time),
  CONSTRAINT valid_duration CHECK (duration_minutes > 0)
);

CREATE INDEX idx_appointment_slots_clinic ON appointment_slots(clinic_id);
CREATE INDEX idx_appointment_slots_customer ON appointment_slots(customer_id);
CREATE INDEX idx_appointment_slots_doctor ON appointment_slots(doctor_id);
CREATE INDEX idx_appointment_slots_room ON appointment_slots(room_id);
CREATE INDEX idx_appointment_slots_date ON appointment_slots(appointment_date);
CREATE INDEX idx_appointment_slots_status ON appointment_slots(status);
CREATE INDEX idx_appointment_slots_datetime ON appointment_slots(appointment_date, start_time);

COMMENT ON TABLE appointment_slots IS 'Customer appointment bookings with full scheduling details';
COMMENT ON COLUMN appointment_slots.special_requirements IS 'JSON for allergies, preferences, etc.';

-- ============================================================================
-- 5. Appointment Recurrence Table
-- ============================================================================
CREATE TABLE appointment_recurrence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_appointment_id UUID NOT NULL REFERENCES appointment_slots(id) ON DELETE CASCADE,
  recurrence_pattern VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'biweekly', 'monthly'
  recurrence_interval INTEGER DEFAULT 1, -- Every N days/weeks/months
  recurrence_days JSONB, -- For weekly: [1,3,5] = Mon, Wed, Fri
  total_occurrences INTEGER, -- NULL = indefinite
  occurrences_created INTEGER DEFAULT 1,
  end_date DATE,
  next_occurrence_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointment_recurrence_parent ON appointment_recurrence(parent_appointment_id);
CREATE INDEX idx_appointment_recurrence_next_date ON appointment_recurrence(next_occurrence_date);

COMMENT ON TABLE appointment_recurrence IS 'Recurring appointment settings';
COMMENT ON COLUMN appointment_recurrence.recurrence_days IS 'JSON array of days for weekly patterns';

-- ============================================================================
-- 6. Appointment Cancellations Table
-- ============================================================================
CREATE TABLE appointment_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointment_slots(id) ON DELETE CASCADE,
  cancelled_by_user_id UUID NOT NULL,
  cancelled_by_role VARCHAR(50) NOT NULL, -- 'customer', 'staff', 'admin', 'system'
  cancellation_reason TEXT NOT NULL,
  cancellation_type VARCHAR(20) NOT NULL, -- 'customer_request', 'no_show', 'staff_unavailable', 'emergency', 'other'
  
  -- Policy enforcement
  hours_before_appointment DECIMAL(10, 2), -- How many hours before appointment
  cancellation_fee DECIMAL(10, 2) DEFAULT 0,
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  policy_applied VARCHAR(100), -- Which cancellation policy was applied
  
  -- Rescheduling offer
  reschedule_offered BOOLEAN DEFAULT false,
  rescheduled_to_appointment_id UUID REFERENCES appointment_slots(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointment_cancellations_appointment ON appointment_cancellations(appointment_id);
CREATE INDEX idx_appointment_cancellations_user ON appointment_cancellations(cancelled_by_user_id);
CREATE INDEX idx_appointment_cancellations_created ON appointment_cancellations(created_at);

COMMENT ON TABLE appointment_cancellations IS 'Detailed cancellation records with policy tracking';

-- ============================================================================
-- 7. Appointment Reminders Table
-- ============================================================================
CREATE TABLE appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointment_slots(id) ON DELETE CASCADE,
  reminder_type VARCHAR(20) NOT NULL, -- 'email', 'sms', 'line', 'push'
  reminder_timing INTEGER NOT NULL, -- Hours before appointment
  
  -- Sending status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  scheduled_send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  
  -- Message details
  recipient VARCHAR(255) NOT NULL, -- Email/phone/LINE ID
  message_content TEXT,
  message_id VARCHAR(255), -- External service message ID
  
  -- Tracking
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointment_reminders_appointment ON appointment_reminders(appointment_id);
CREATE INDEX idx_appointment_reminders_status ON appointment_reminders(status);
CREATE INDEX idx_appointment_reminders_scheduled ON appointment_reminders(scheduled_send_at);

COMMENT ON TABLE appointment_reminders IS 'Automated appointment reminder notifications';

-- ============================================================================
-- Database Functions
-- ============================================================================

-- Function: Check for appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflict(
  p_clinic_id UUID,
  p_doctor_id UUID,
  p_room_id UUID,
  p_appointment_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_appointment_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_exists BOOLEAN;
BEGIN
  -- Check doctor conflict
  IF p_doctor_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM appointment_slots
      WHERE clinic_id = p_clinic_id
        AND doctor_id = p_doctor_id
        AND appointment_date = p_appointment_date
        AND status NOT IN ('cancelled', 'no-show')
        AND (id != p_exclude_appointment_id OR p_exclude_appointment_id IS NULL)
        AND (
          (start_time <= p_start_time AND end_time > p_start_time) OR
          (start_time < p_end_time AND end_time >= p_end_time) OR
          (start_time >= p_start_time AND end_time <= p_end_time)
        )
    ) INTO conflict_exists;
    
    IF conflict_exists THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  -- Check room conflict
  IF p_room_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM appointment_slots
      WHERE clinic_id = p_clinic_id
        AND room_id = p_room_id
        AND appointment_date = p_appointment_date
        AND status NOT IN ('cancelled', 'no-show')
        AND (id != p_exclude_appointment_id OR p_exclude_appointment_id IS NULL)
        AND (
          (start_time <= p_start_time AND end_time > p_start_time) OR
          (start_time < p_end_time AND end_time >= p_end_time) OR
          (start_time >= p_start_time AND end_time <= p_end_time)
        )
    ) INTO conflict_exists;
    
    IF conflict_exists THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_appointment_conflict IS 'Check if appointment time conflicts with existing bookings';

-- Function: Calculate cancellation fee
CREATE OR REPLACE FUNCTION calculate_cancellation_fee(
  p_appointment_id UUID,
  p_cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS DECIMAL AS $$
DECLARE
  appointment_datetime TIMESTAMP WITH TIME ZONE;
  service_price DECIMAL(10, 2);
  hours_before DECIMAL(10, 2);
  fee DECIMAL(10, 2);
BEGIN
  -- Get appointment details
  SELECT 
    (appointment_date + start_time)::TIMESTAMP WITH TIME ZONE,
    service_price
  INTO appointment_datetime, service_price
  FROM appointment_slots
  WHERE id = p_appointment_id;
  
  -- Calculate hours before appointment
  hours_before := EXTRACT(EPOCH FROM (appointment_datetime - p_cancelled_at)) / 3600;
  
  -- Apply cancellation policy
  -- Less than 24 hours: 50% fee
  -- Less than 12 hours: 75% fee
  -- Less than 6 hours: 100% fee
  IF hours_before < 6 THEN
    fee := service_price;
  ELSIF hours_before < 12 THEN
    fee := service_price * 0.75;
  ELSIF hours_before < 24 THEN
    fee := service_price * 0.5;
  ELSE
    fee := 0;
  END IF;
  
  RETURN fee;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_cancellation_fee IS 'Calculate cancellation fee based on policy';

-- Function: Auto-schedule reminders when appointment is created
CREATE OR REPLACE FUNCTION auto_schedule_reminders()
RETURNS TRIGGER AS $$
DECLARE
  appointment_datetime TIMESTAMP WITH TIME ZONE;
  reminder_times INTEGER[] := ARRAY[24, 2]; -- 24 hours and 2 hours before
  reminder_time INTEGER;
  send_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only for new scheduled appointments
  IF TG_OP = 'INSERT' AND NEW.status = 'scheduled' THEN
    appointment_datetime := (NEW.appointment_date + NEW.start_time)::TIMESTAMP WITH TIME ZONE;
    
    -- Create reminders for email and SMS
    FOREACH reminder_time IN ARRAY reminder_times
    LOOP
      send_time := appointment_datetime - (reminder_time || ' hours')::INTERVAL;
      
      -- Only create if send time is in the future
      IF send_time > NOW() THEN
        -- Email reminder
        IF NEW.customer_email IS NOT NULL THEN
          INSERT INTO appointment_reminders (
            appointment_id, reminder_type, reminder_timing,
            scheduled_send_at, recipient
          ) VALUES (
            NEW.id, 'email', reminder_time,
            send_time, NEW.customer_email
          );
        END IF;
        
        -- SMS reminder
        IF NEW.customer_phone IS NOT NULL THEN
          INSERT INTO appointment_reminders (
            appointment_id, reminder_type, reminder_timing,
            scheduled_send_at, recipient
          ) VALUES (
            NEW.id, 'sms', reminder_time,
            send_time, NEW.customer_phone
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_schedule_reminders
  AFTER INSERT ON appointment_slots
  FOR EACH ROW
  EXECUTE FUNCTION auto_schedule_reminders();

COMMENT ON FUNCTION auto_schedule_reminders IS 'Automatically create reminder records when appointment is created';

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_rooms_updated_at BEFORE UPDATE ON service_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_availability_updated_at BEFORE UPDATE ON doctor_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_availability_updated_at BEFORE UPDATE ON room_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_slots_updated_at BEFORE UPDATE ON appointment_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_recurrence_updated_at BEFORE UPDATE ON appointment_recurrence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_reminders_updated_at BEFORE UPDATE ON appointment_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE service_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_recurrence ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Service Rooms Policies
CREATE POLICY "Clinic staff can manage service rooms"
  ON service_rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clinic_staff
      WHERE clinic_staff.clinic_id = service_rooms.clinic_id
        AND clinic_staff.user_id::text = auth.uid()::text
    )
  );

-- Doctor Availability Policies
CREATE POLICY "Clinic staff can manage doctor availability"
  ON doctor_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clinic_staff
      WHERE clinic_staff.clinic_id = doctor_availability.clinic_id
        AND clinic_staff.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Public can view doctor availability"
  ON doctor_availability FOR SELECT
  USING (is_available = true);

-- Room Availability Policies
CREATE POLICY "Clinic staff can manage room availability"
  ON room_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM service_rooms
      JOIN clinic_staff ON service_rooms.clinic_id = clinic_staff.clinic_id
      WHERE service_rooms.id = room_availability.room_id
        AND clinic_staff.user_id::text = auth.uid()::text
    )
  );

-- Appointment Slots Policies
CREATE POLICY "Customers can view their own appointments"
  ON appointment_slots FOR SELECT
  USING (auth.uid()::text = customer_id::text);

CREATE POLICY "Clinic staff can view all appointments"
  ON appointment_slots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clinic_staff
      WHERE clinic_staff.clinic_id = appointment_slots.clinic_id
        AND clinic_staff.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Customers can create their own appointments"
  ON appointment_slots FOR INSERT
  WITH CHECK (auth.uid()::text = customer_id::text);

CREATE POLICY "Clinic staff can create any appointment"
  ON appointment_slots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_staff
      WHERE clinic_staff.clinic_id = appointment_slots.clinic_id
        AND clinic_staff.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Customers can update their own appointments"
  ON appointment_slots FOR UPDATE
  USING (auth.uid()::text = customer_id::text);

CREATE POLICY "Clinic staff can update any appointment"
  ON appointment_slots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clinic_staff
      WHERE clinic_staff.clinic_id = appointment_slots.clinic_id
        AND clinic_staff.user_id::text = auth.uid()::text
    )
  );

-- Appointment Reminders Policies
CREATE POLICY "Clinic staff can manage reminders"
  ON appointment_reminders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM appointment_slots
      JOIN clinic_staff ON appointment_slots.clinic_id = clinic_staff.clinic_id
      WHERE appointment_slots.id = appointment_reminders.appointment_id
        AND clinic_staff.user_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- Sample Data
-- ============================================================================

-- Sample service rooms (will use first clinic_id from clinics table)
DO $$
DECLARE
  sample_clinic_id UUID;
BEGIN
  SELECT id INTO sample_clinic_id FROM clinics LIMIT 1;
  
  IF sample_clinic_id IS NOT NULL THEN
    INSERT INTO service_rooms (clinic_id, name, room_number, room_type, equipment) VALUES
    (sample_clinic_id, 'ห้องทำหน้า 1', 'R101', 'facial', '["facial steamer", "LED therapy", "microdermabrasion"]'::jsonb),
    (sample_clinic_id, 'ห้องเลเซอร์ 1', 'R102', 'laser', '["Q-switch laser", "CO2 laser", "cooling system"]'::jsonb),
    (sample_clinic_id, 'ห้องปรึกษา 1', 'R103', 'consultation', '["computer", "skin analyzer", "before/after photos"]'::jsonb),
    (sample_clinic_id, 'ห้องฉีดโบท็อก', 'R104', 'injection', '["botox", "filler", "numbing cream"]'::jsonb);
  END IF;
END $$;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE appointment_slots IS 'Main appointment booking table - use customer_id not patient_id (beauty clinic context)';
COMMENT ON COLUMN appointment_slots.customer_id IS 'Customer seeking beauty services, not a patient';
COMMENT ON COLUMN appointment_slots.customer_name IS 'Customer name for appointment';
