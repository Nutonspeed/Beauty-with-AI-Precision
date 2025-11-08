-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification settings
  notification_settings JSONB DEFAULT '{
    "email_bookings": true,
    "email_analyses": true,
    "email_promotions": false,
    "email_updates": true,
    "sms_reminders": true,
    "push_notifications": false
  }'::jsonb,
  
  -- User preferences
  language VARCHAR(10) DEFAULT 'th',
  theme VARCHAR(20) DEFAULT 'system',
  timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  currency VARCHAR(10) DEFAULT 'THB',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id)
);

-- Add RLS policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can read own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all preferences
CREATE POLICY "Admins can view all preferences"
  ON user_preferences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('clinic_admin', 'super_admin')
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Add comment
COMMENT ON TABLE user_preferences IS 'Stores user notification settings and preferences';
