-- ============================================================================
-- Queue Management System Migration
-- Created: 2025-01-05
-- Description: Complete queue management system for clinic operations
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. QUEUE ENTRIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS queue_entries (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    queue_number INTEGER NOT NULL,
    
    -- Customer information
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    
    -- Clinic and staff assignment
    clinic_id UUID NOT NULL,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Appointment details
    appointment_type TEXT NOT NULL DEFAULT 'Walk-in',
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'emergency')),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'in-service', 'completed', 'cancelled', 'no-show')),
    
    -- Timestamps
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    called_time TIMESTAMPTZ,
    service_start_time TIMESTAMPTZ,
    service_end_time TIMESTAMPTZ,
    
    -- Time estimates
    estimated_wait_time INTEGER, -- in minutes
    estimated_call_time TIMESTAMPTZ,
    actual_wait_time INTEGER, -- calculated when called
    actual_service_time INTEGER, -- calculated when completed
    
    -- Additional information
    notes TEXT,
    cancellation_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_queue_number CHECK (queue_number > 0),
    CONSTRAINT valid_wait_time CHECK (estimated_wait_time IS NULL OR estimated_wait_time >= 0),
    CONSTRAINT valid_actual_times CHECK (
        (actual_wait_time IS NULL OR actual_wait_time >= 0) AND
        (actual_service_time IS NULL OR actual_service_time >= 0)
    )
);

-- Indexes for performance
CREATE INDEX idx_queue_entries_clinic_status ON queue_entries(clinic_id, status);
CREATE INDEX idx_queue_entries_customer ON queue_entries(customer_id);
CREATE INDEX idx_queue_entries_doctor ON queue_entries(doctor_id);
CREATE INDEX idx_queue_entries_check_in_time ON queue_entries(check_in_time DESC);
CREATE INDEX idx_queue_entries_queue_number ON queue_entries(clinic_id, queue_number);
CREATE INDEX idx_queue_entries_priority ON queue_entries(priority, check_in_time);

-- ============================================================================
-- 2. QUEUE SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS queue_settings (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    clinic_id UUID NOT NULL UNIQUE,
    
    -- Service time settings
    avg_service_time INTEGER NOT NULL DEFAULT 15, -- minutes
    buffer_time INTEGER NOT NULL DEFAULT 5, -- minutes
    
    -- Notification settings
    notify_before_turn INTEGER NOT NULL DEFAULT 2, -- notify when 2 customers ahead
    enable_sms_notifications BOOLEAN NOT NULL DEFAULT true,
    enable_line_notifications BOOLEAN NOT NULL DEFAULT false,
    enable_email_notifications BOOLEAN NOT NULL DEFAULT false,
    
    -- Display settings
    enable_tv_display BOOLEAN NOT NULL DEFAULT true,
    tv_display_refresh_interval INTEGER NOT NULL DEFAULT 30, -- seconds
    show_doctor_names BOOLEAN NOT NULL DEFAULT true,
    show_estimated_times BOOLEAN NOT NULL DEFAULT true,
    
    -- Operating hours
    operating_hours JSONB DEFAULT '{"mon":{"open":"09:00","close":"18:00"},"tue":{"open":"09:00","close":"18:00"},"wed":{"open":"09:00","close":"18:00"},"thu":{"open":"09:00","close":"18:00"},"fri":{"open":"09:00","close":"18:00"},"sat":{"open":"09:00","close":"14:00"},"sun":{"open":null,"close":null}}'::jsonb,
    
    -- Auto-reset settings
    auto_reset_daily BOOLEAN NOT NULL DEFAULT true,
    reset_time TIME NOT NULL DEFAULT '00:00',
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_queue_settings_clinic ON queue_settings(clinic_id);

-- ============================================================================
-- 3. QUEUE NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS queue_notifications (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    queue_entry_id UUID NOT NULL REFERENCES queue_entries(id) ON DELETE CASCADE,
    
    -- Notification details
    type TEXT NOT NULL CHECK (type IN ('sms', 'line', 'email', 'push')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    
    -- Message content
    recipient TEXT NOT NULL, -- phone number, line id, email, or device token
    message TEXT NOT NULL,
    
    -- Delivery tracking
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_queue_notifications_entry ON queue_notifications(queue_entry_id);
CREATE INDEX idx_queue_notifications_status ON queue_notifications(status);

-- ============================================================================
-- 4. QUEUE STATISTICS TABLE (Daily aggregates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS queue_statistics (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()::uuid,
    clinic_id UUID NOT NULL,
    date DATE NOT NULL,
    
    -- Daily metrics
    total_customers INTEGER NOT NULL DEFAULT 0,
    completed_customers INTEGER NOT NULL DEFAULT 0,
    cancelled_customers INTEGER NOT NULL DEFAULT 0,
    no_show_customers INTEGER NOT NULL DEFAULT 0,
    
    -- Time metrics
    avg_wait_time INTEGER, -- minutes
    max_wait_time INTEGER, -- minutes
    min_wait_time INTEGER, -- minutes
    avg_service_time INTEGER, -- minutes
    
    -- Peak hours
    peak_hour INTEGER, -- 0-23
    peak_hour_count INTEGER,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(clinic_id, date)
);

-- Index
CREATE INDEX idx_queue_statistics_clinic_date ON queue_statistics(clinic_id, date DESC);

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queue_entries_updated_at
    BEFORE UPDATE ON queue_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_queue_updated_at();

CREATE TRIGGER queue_settings_updated_at
    BEFORE UPDATE ON queue_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_queue_updated_at();

CREATE TRIGGER queue_statistics_updated_at
    BEFORE UPDATE ON queue_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_queue_updated_at();

-- Calculate actual wait time when customer is called
CREATE OR REPLACE FUNCTION calculate_queue_wait_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'called' AND OLD.status = 'waiting' AND NEW.called_time IS NOT NULL THEN
        NEW.actual_wait_time = EXTRACT(EPOCH FROM (NEW.called_time - NEW.check_in_time)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queue_entries_calculate_wait_time
    BEFORE UPDATE ON queue_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_queue_wait_time();

-- Calculate actual service time when service is completed
CREATE OR REPLACE FUNCTION calculate_queue_service_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.service_end_time IS NOT NULL AND NEW.service_start_time IS NOT NULL THEN
        NEW.actual_service_time = EXTRACT(EPOCH FROM (NEW.service_end_time - NEW.service_start_time)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queue_entries_calculate_service_time
    BEFORE UPDATE ON queue_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_queue_service_time();

-- Update daily statistics when queue entry is updated
CREATE OR REPLACE FUNCTION update_queue_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
    entry_date DATE;
    clinic_uuid UUID;
BEGIN
    entry_date := (NEW.check_in_time AT TIME ZONE 'Asia/Bangkok')::date;
    clinic_uuid := NEW.clinic_id;
    
    -- Insert or update statistics
    INSERT INTO queue_statistics (clinic_id, date, total_customers)
    VALUES (clinic_uuid, entry_date, 1)
    ON CONFLICT (clinic_id, date) DO UPDATE
    SET 
        total_customers = queue_statistics.total_customers + 1,
        updated_at = NOW();
    
    -- Update completed count
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE queue_statistics
        SET completed_customers = completed_customers + 1
        WHERE clinic_id = clinic_uuid AND date = entry_date;
    END IF;
    
    -- Update cancelled count
    IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
        UPDATE queue_statistics
        SET cancelled_customers = cancelled_customers + 1
        WHERE clinic_id = clinic_uuid AND date = entry_date;
    END IF;
    
    -- Update no-show count
    IF NEW.status = 'no-show' AND (OLD.status IS NULL OR OLD.status != 'no-show') THEN
        UPDATE queue_statistics
        SET no_show_customers = no_show_customers + 1
        WHERE clinic_id = clinic_uuid AND date = entry_date;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queue_entries_update_stats
    AFTER INSERT OR UPDATE ON queue_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_queue_daily_stats();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_statistics ENABLE ROW LEVEL SECURITY;

-- Queue Entries Policies
CREATE POLICY "Clinic staff can view all queue entries"
    ON queue_entries FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('clinic_owner', 'clinic_staff', 'doctor')
        )
    );

CREATE POLICY "Customers can view their own queue entries"
    ON queue_entries FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

CREATE POLICY "Clinic staff can insert queue entries"
    ON queue_entries FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('clinic_owner', 'clinic_staff', 'doctor')
        )
    );

CREATE POLICY "Clinic staff can update queue entries"
    ON queue_entries FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('clinic_owner', 'clinic_staff', 'doctor')
        )
    );

CREATE POLICY "Clinic staff can delete queue entries"
    ON queue_entries FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('clinic_owner', 'clinic_staff')
        )
    );

-- Queue Settings Policies
CREATE POLICY "Clinic staff can view queue settings"
    ON queue_settings FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('clinic_owner', 'clinic_staff', 'doctor')
        )
    );

CREATE POLICY "Clinic owners can manage queue settings"
    ON queue_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'clinic_owner'
        )
    );

-- Queue Notifications Policies
CREATE POLICY "Clinic staff can view queue notifications"
    ON queue_notifications FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM queue_entries qe
            JOIN users u ON u.id = auth.uid()
            WHERE qe.id = queue_notifications.queue_entry_id
            AND u.role IN ('clinic_owner', 'clinic_staff', 'doctor')
        )
    );

CREATE POLICY "System can manage queue notifications"
    ON queue_notifications FOR ALL
    TO authenticated
    USING (true);

-- Queue Statistics Policies
CREATE POLICY "Clinic staff can view queue statistics"
    ON queue_statistics FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('clinic_owner', 'clinic_staff', 'doctor')
        )
    );

-- ============================================================================
-- 7. SAMPLE DATA
-- ============================================================================

-- Insert default queue settings for a sample clinic
INSERT INTO queue_settings (clinic_id, avg_service_time, buffer_time)
VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, 15, 5)
ON CONFLICT (clinic_id) DO NOTHING;

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Get next queue number for today
CREATE OR REPLACE FUNCTION get_next_queue_number(p_clinic_id UUID)
RETURNS INTEGER AS $$
DECLARE
    max_number INTEGER;
    today_start TIMESTAMPTZ;
BEGIN
    today_start := (CURRENT_DATE AT TIME ZONE 'Asia/Bangkok');
    
    SELECT COALESCE(MAX(queue_number), 0) INTO max_number
    FROM queue_entries
    WHERE clinic_id = p_clinic_id
    AND check_in_time >= today_start;
    
    RETURN max_number + 1;
END;
$$ LANGUAGE plpgsql;

-- Get current waiting count
CREATE OR REPLACE FUNCTION get_waiting_count(p_clinic_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM queue_entries
        WHERE clinic_id = p_clinic_id
        AND status = 'waiting'
    )::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Calculate estimated wait time
CREATE OR REPLACE FUNCTION calculate_estimated_wait_time(
    p_clinic_id UUID,
    p_priority TEXT
)
RETURNS INTEGER AS $$
DECLARE
    avg_service INTEGER;
    buffer INTEGER;
    waiting_count INTEGER;
    in_service_count INTEGER;
    estimated INTEGER;
BEGIN
    -- Get settings
    SELECT avg_service_time, buffer_time INTO avg_service, buffer
    FROM queue_settings
    WHERE clinic_id = p_clinic_id;
    
    IF avg_service IS NULL THEN
        avg_service := 15;
        buffer := 5;
    END IF;
    
    -- Count customers ahead (considering priority)
    SELECT 
        COUNT(CASE WHEN status = 'waiting' THEN 1 END),
        COUNT(CASE WHEN status = 'in-service' THEN 1 END)
    INTO waiting_count, in_service_count
    FROM queue_entries
    WHERE clinic_id = p_clinic_id
    AND status IN ('waiting', 'in-service');
    
    -- Calculate estimate
    estimated := (waiting_count * (avg_service + buffer)) + (in_service_count * avg_service);
    
    -- Adjust for priority
    IF p_priority = 'urgent' THEN
        estimated := estimated / 2;
    ELSIF p_priority = 'emergency' THEN
        estimated := estimated / 4;
    END IF;
    
    RETURN GREATEST(estimated, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- End of Migration
-- ============================================================================

COMMENT ON TABLE queue_entries IS 'Customer queue entries for clinic queue management';
COMMENT ON TABLE queue_settings IS 'Queue system settings per clinic';
COMMENT ON TABLE queue_notifications IS 'Queue-related notifications sent to customers';
COMMENT ON TABLE queue_statistics IS 'Daily queue statistics for analytics';
