-- ===================================
-- ALL-IN-ONE MIGRATION SCRIPT
-- รวม migrations ทั้งหมดสำหรับ Tasks 11-20
-- วิธีใช้: Copy ทั้งหมด -> Paste ใน Supabase SQL Editor
-- ===================================

-- เริ่มต้น Transaction
BEGIN;

-- ===================================
-- TASK 13: QUEUE MANAGEMENT SYSTEM
-- ===================================

-- Drop existing tables if any
DROP TABLE IF EXISTS queue_statistics CASCADE;
DROP TABLE IF EXISTS queue_notifications CASCADE;
DROP TABLE IF EXISTS queue_settings CASCADE;
DROP TABLE IF EXISTS queue_entries CASCADE;

-- 1. Queue Entries Table
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_number VARCHAR(20) NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  service_type VARCHAR(100),
  priority VARCHAR(20) CHECK (priority IN ('normal', 'high', 'urgent')) DEFAULT 'normal',
  status VARCHAR(20) CHECK (status IN ('waiting', 'called', 'serving', 'completed', 'cancelled', 'no-show')) DEFAULT 'waiting',
  branch_id UUID,
  counter_number VARCHAR(10),
  staff_id UUID REFERENCES auth.users(id),
  estimated_wait_time INTEGER,
  actual_wait_time INTEGER,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  called_time TIMESTAMP WITH TIME ZONE,
  serving_time TIMESTAMP WITH TIME ZONE,
  completed_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_queue_entries_status ON queue_entries(status);
CREATE INDEX idx_queue_entries_branch ON queue_entries(branch_id);
CREATE INDEX idx_queue_entries_check_in ON queue_entries(check_in_time DESC);

-- 2. Queue Settings Table
CREATE TABLE queue_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  service_type VARCHAR(100),
  prefix VARCHAR(10) DEFAULT 'Q',
  counter_count INTEGER DEFAULT 1,
  avg_service_time INTEGER DEFAULT 15,
  operating_hours JSONB,
  auto_call_enabled BOOLEAN DEFAULT FALSE,
  sms_notification_enabled BOOLEAN DEFAULT FALSE,
  display_board_enabled BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Queue Notifications Table  
CREATE TABLE queue_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_entry_id UUID REFERENCES queue_entries(id) ON DELETE CASCADE,
  notification_type VARCHAR(20) CHECK (notification_type IN ('sms', 'email', 'push', 'display')) NOT NULL,
  recipient VARCHAR(255),
  message TEXT,
  status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Queue Statistics Table
CREATE TABLE queue_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  branch_id UUID,
  service_type VARCHAR(100),
  total_queues INTEGER DEFAULT 0,
  completed_queues INTEGER DEFAULT 0,
  cancelled_queues INTEGER DEFAULT 0,
  no_show_queues INTEGER DEFAULT 0,
  avg_wait_time INTEGER,
  avg_service_time INTEGER,
  peak_hour INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_queue_stats UNIQUE (date, branch_id, service_type)
);

-- Enable RLS
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Service Role)
CREATE POLICY "Service role access queue_entries" ON queue_entries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access queue_settings" ON queue_settings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access queue_notifications" ON queue_notifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access queue_statistics" ON queue_statistics FOR ALL USING (auth.role() = 'service_role');

-- ===================================
-- TASK 14: APPOINTMENT SYSTEM
-- ===================================

-- Drop existing if any
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS appointment_cancellations CASCADE;
DROP TABLE IF EXISTS appointment_reminders CASCADE;
DROP TABLE IF EXISTS appointment_services CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

-- 1. Appointments Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id),
  branch_id UUID,
  staff_id UUID REFERENCES auth.users(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  status VARCHAR(20) CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')) DEFAULT 'scheduled',
  customer_notes TEXT,
  staff_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- 2. Appointment Services Table
CREATE TABLE appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID,
  service_name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Appointment Reminders Table
CREATE TABLE appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type VARCHAR(20) CHECK (reminder_type IN ('sms', 'email', 'push')) NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Appointment Cancellations Table
CREATE TABLE appointment_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Availability Slots Table
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES auth.users(id),
  branch_id UUID,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role access appointments" ON appointments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access appointment_services" ON appointment_services FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access appointment_reminders" ON appointment_reminders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access appointment_cancellations" ON appointment_cancellations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access availability_slots" ON availability_slots FOR ALL USING (auth.role() = 'service_role');

-- ===================================
-- TASK 15: REPORTS & ANALYTICS
-- ===================================

DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS report_schedules CASCADE;
DROP TABLE IF EXISTS generated_reports CASCADE;

-- 1. Generated Reports Table
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  parameters JSONB,
  file_url TEXT,
  file_format VARCHAR(20),
  status VARCHAR(20) CHECK (status IN ('generating', 'completed', 'failed')) DEFAULT 'generating',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 2. Report Schedules Table
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL,
  frequency VARCHAR(20) CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')) NOT NULL,
  recipients JSONB NOT NULL,
  parameters JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  last_generated_at TIMESTAMP WITH TIME ZONE,
  next_generation_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Analytics Events Table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  properties JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);

-- Enable RLS
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access generated_reports" ON generated_reports FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access report_schedules" ON report_schedules FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access analytics_events" ON analytics_events FOR ALL USING (auth.role() = 'service_role');

-- Commit transaction
COMMIT;

-- แสดงผลลัพธ์
SELECT 'Queue System: 4 tables created' as status
UNION ALL
SELECT 'Appointment System: 5 tables created'
UNION ALL  
SELECT 'Reports & Analytics: 3 tables created'
UNION ALL
SELECT 'Total: 12 tables created in this batch';
