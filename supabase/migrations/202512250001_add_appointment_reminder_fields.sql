-- Add reminder tracking fields to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_type VARCHAR(50), -- 'confirmation', 'daily_reminder', 'same_day_reminder'
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_sent ON appointments(reminder_sent);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_type ON appointments(reminder_type);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_sent_at ON appointments(reminder_sent_at);

-- Add comment
COMMENT ON COLUMN appointments.reminder_sent IS 'Whether reminder email has been sent';
COMMENT ON COLUMN appointments.reminder_type IS 'Type of reminder sent: confirmation, daily_reminder, same_day_reminder';
COMMENT ON COLUMN appointments.reminder_sent_at IS 'Timestamp when reminder was sent';
