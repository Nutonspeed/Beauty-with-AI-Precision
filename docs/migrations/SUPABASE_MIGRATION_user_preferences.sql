-- ============================================================================
-- SUPABASE SQL MIGRATION: user_preferences Table
-- ============================================================================
-- Description: Creates user_preferences table for storing notification
--              settings and user preferences (language, theme, etc.)
-- Date: 2024-10-31
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================================

-- Step 1: Create user_preferences table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification settings (stored as JSONB for flexibility)
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
  
  -- Unique constraint: one preference record per user
  CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id)
);


-- Step 2: Enable Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;


-- Step 3: Create RLS Policies
-- ----------------------------------------------------------------------------

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can read own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admins can view all preferences" ON user_preferences;

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
      AND users.role IN ('admin', 'super_admin')
    )
  );


-- Step 4: Create Index for Performance
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);


-- Step 5: Create Trigger for Auto-updating updated_at
-- ----------------------------------------------------------------------------

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS trigger_update_user_preferences_updated_at ON user_preferences;
DROP FUNCTION IF EXISTS update_user_preferences_updated_at();

-- Create function
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();


-- Step 6: Add Table Comment
-- ----------------------------------------------------------------------------
COMMENT ON TABLE user_preferences IS 'Stores user notification settings and preferences (language, theme, timezone, etc.)';


-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify)
-- ============================================================================

-- Check table structure
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_preferences';

-- Check RLS policies
-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'user_preferences';

-- Check indexes
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'user_preferences';

-- Test insert (replace with your user_id)
-- INSERT INTO user_preferences (user_id) 
-- VALUES ('your-user-id-here') 
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
