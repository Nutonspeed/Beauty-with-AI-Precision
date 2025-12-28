-- Privacy System Database Migration
-- GDPR/PDPA Compliance Tables
-- Created: 2024-01-XX

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Alternative: use built-in gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- Privacy Settings Table
-- Stores user privacy preferences and consent tracking
-- =============================================================================
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email Preferences (JSONB for flexibility)
  email_preferences JSONB DEFAULT '{
    "weeklyDigest": true,
    "progressReports": true,
    "goalAchievements": true,
    "reEngagement": false,
    "bookingReminders": true,
    "analysisComplete": true,
    "marketingEmails": false,
    "productUpdates": false
  }'::jsonb,
  
  -- Data Sharing Preferences
  share_data_for_research BOOLEAN DEFAULT false,
  share_anonymous_data BOOLEAN DEFAULT true,
  allow_third_party_analytics BOOLEAN DEFAULT true,
  
  -- Consent Tracking
  privacy_policy_accepted BOOLEAN DEFAULT false,
  privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
  privacy_policy_version VARCHAR(20),
  
  terms_of_service_accepted BOOLEAN DEFAULT false,
  terms_of_service_accepted_at TIMESTAMP WITH TIME ZONE,
  terms_of_service_version VARCHAR(20),
  
  marketing_consent BOOLEAN DEFAULT false,
  marketing_consent_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one settings record per user
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON privacy_settings(user_id);

-- =============================================================================
-- Data Export Requests Table
-- GDPR Right to Data Portability
-- =============================================================================
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Request Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Export Details
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- File Information
  download_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  file_size BIGINT,
  file_format VARCHAR(20) DEFAULT 'zip',
  
  -- Error Handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  data_types_included JSONB,
  export_format_version VARCHAR(20)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_expires_at ON data_export_requests(expires_at);

-- =============================================================================
-- Account Deletion Requests Table
-- GDPR Right to Erasure (Right to be Forgotten)
-- =============================================================================
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Request Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  
  -- Deletion Details
  reason TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Confirmation (30-day grace period)
  confirmation_token VARCHAR(64),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  
  -- Processing
  processing_started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Cancellation
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- What was deleted
  data_deleted JSONB,
  backup_created BOOLEAN DEFAULT false,
  backup_expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_status ON account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_scheduled_for ON account_deletion_requests(scheduled_for);

-- =============================================================================
-- Privacy Logs Table
-- Audit trail for all privacy-related actions
-- =============================================================================
CREATE TABLE IF NOT EXISTS privacy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action Details
  action VARCHAR(50) NOT NULL CHECK (action IN (
    'privacy_updated',
    'consent_given',
    'consent_withdrawn',
    'data_export_requested',
    'data_export_downloaded',
    'account_deletion_requested',
    'account_deletion_confirmed',
    'account_deletion_cancelled',
    'data_accessed',
    'data_modified',
    'settings_viewed'
  )),
  
  -- Additional Context
  details JSONB,
  
  -- Request Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(255),
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for querying logs
CREATE INDEX IF NOT EXISTS idx_privacy_logs_user_id ON privacy_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_logs_action ON privacy_logs(action);
CREATE INDEX IF NOT EXISTS idx_privacy_logs_timestamp ON privacy_logs(timestamp DESC);

-- =============================================================================
-- Row Level Security (RLS) Policies
-- Ensure users can only access their own privacy data
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_logs ENABLE ROW LEVEL SECURITY;

-- Privacy Settings Policies
DROP POLICY IF EXISTS "Users can view own privacy settings" ON privacy_settings;
CREATE POLICY "Users can view own privacy settings" ON privacy_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own privacy settings" ON privacy_settings;
CREATE POLICY "Users can insert own privacy settings" ON privacy_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own privacy settings" ON privacy_settings;
CREATE POLICY "Users can update own privacy settings" ON privacy_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Data Export Requests Policies
DROP POLICY IF EXISTS "Users can view own export requests" ON data_export_requests;
CREATE POLICY "Users can view own export requests" ON data_export_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create export requests" ON data_export_requests;
CREATE POLICY "Users can create export requests" ON data_export_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Account Deletion Requests Policies
DROP POLICY IF EXISTS "Users can view own deletion requests" ON account_deletion_requests;
CREATE POLICY "Users can view own deletion requests" ON account_deletion_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create deletion requests" ON account_deletion_requests;
CREATE POLICY "Users can create deletion requests" ON account_deletion_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own deletion requests" ON account_deletion_requests;
CREATE POLICY "Users can update own deletion requests" ON account_deletion_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Privacy Logs Policies (read-only for users)
DROP POLICY IF EXISTS "Users can view own privacy logs" ON privacy_logs;
CREATE POLICY "Users can view own privacy logs" ON privacy_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can insert privacy logs" ON privacy_logs;
CREATE POLICY "Service can insert privacy logs" ON privacy_logs
  FOR INSERT WITH CHECK (true); -- Service role can insert logs for any user

-- =============================================================================
-- Functions and Triggers
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for privacy_settings
DROP TRIGGER IF EXISTS update_privacy_settings_updated_at ON privacy_settings;
CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Comments for Documentation
-- =============================================================================

COMMENT ON TABLE privacy_settings IS 'User privacy preferences and consent tracking';
COMMENT ON TABLE data_export_requests IS 'GDPR data export requests (Right to Data Portability)';
COMMENT ON TABLE account_deletion_requests IS 'GDPR account deletion requests (Right to Erasure)';
COMMENT ON TABLE privacy_logs IS 'Audit trail for all privacy-related actions';

COMMENT ON COLUMN privacy_settings.email_preferences IS 'JSONB object storing all email notification preferences';
COMMENT ON COLUMN data_export_requests.expires_at IS 'Export download link expires 7 days after creation';
COMMENT ON COLUMN account_deletion_requests.scheduled_for IS 'Account deletion scheduled 30 days after request';
COMMENT ON COLUMN privacy_logs.action IS 'Type of privacy action performed';
