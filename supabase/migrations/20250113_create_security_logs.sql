-- Create security logging tables for monitoring authentication and suspicious activities
-- This migration creates tables for tracking security events, failed logins, and active sessions

-- Table: security_events
-- Purpose: Track all security-related events in the system
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- 'failed_login', 'suspicious_activity', 'unauthorized_access', 'brute_force', 'session_hijack'
  severity VARCHAR(20) NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  request_path VARCHAR(500),
  request_method VARCHAR(10),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: failed_login_attempts
-- Purpose: Track failed authentication attempts for brute force detection
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  failure_reason VARCHAR(100), -- 'invalid_credentials', 'account_locked', 'account_disabled', 'email_not_verified'
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: active_sessions
-- Purpose: Track active user sessions for monitoring and management
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  session_token VARCHAR(500) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet', 'unknown'
  browser VARCHAR(100),
  os VARCHAR(100),
  location_country VARCHAR(100),
  location_city VARCHAR(100),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: suspicious_activities
-- Purpose: Track patterns that may indicate security threats
CREATE TABLE IF NOT EXISTS suspicious_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type VARCHAR(50) NOT NULL, -- 'unusual_location', 'rapid_requests', 'data_export', 'privilege_escalation', 'api_abuse'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  ip_address INET,
  description TEXT NOT NULL,
  risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
  indicators JSONB DEFAULT '[]'::jsonb, -- Array of detected indicators
  auto_blocked BOOLEAN DEFAULT FALSE,
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_clinic_id ON security_events(clinic_id);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);

CREATE INDEX IF NOT EXISTS idx_failed_login_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_created_at ON failed_login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_failed_login_blocked ON failed_login_attempts(blocked_until);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_clinic_id ON active_sessions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_is_active ON active_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_activity ON active_sessions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires_at ON active_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_suspicious_activities_created_at ON suspicious_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_activity_type ON suspicious_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_user_id ON suspicious_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_risk_score ON suspicious_activities(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_reviewed ON suspicious_activities(reviewed);

-- Enable Row Level Security
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_events
CREATE POLICY "Super admins can view all security events"
  ON security_events FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Super admins can insert security events"
  ON security_events FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update security events"
  ON security_events FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- RLS Policies for failed_login_attempts
CREATE POLICY "Super admins can view all failed login attempts"
  ON failed_login_attempts FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "System can insert failed login attempts"
  ON failed_login_attempts FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow system to log failed attempts

-- RLS Policies for active_sessions
CREATE POLICY "Super admins can view all active sessions"
  ON active_sessions FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Users can view their own sessions"
  ON active_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage sessions"
  ON active_sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for suspicious_activities
CREATE POLICY "Super admins can view all suspicious activities"
  ON suspicious_activities FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Super admins can update suspicious activities"
  ON suspicious_activities FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "System can insert suspicious activities"
  ON suspicious_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE active_sessions
  SET is_active = FALSE
  WHERE expires_at < NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect brute force attempts
CREATE OR REPLACE FUNCTION detect_brute_force(p_email VARCHAR, p_ip_address INET)
RETURNS JSONB AS $$
DECLARE
  v_attempt_count INTEGER;
  v_should_block BOOLEAN := FALSE;
  v_blocked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Count recent failed attempts (last 15 minutes)
  SELECT COUNT(*) INTO v_attempt_count
  FROM failed_login_attempts
  WHERE (email = p_email OR ip_address = p_ip_address)
    AND last_attempt_at > NOW() - INTERVAL '15 minutes';
  
  -- Block if more than 5 attempts in 15 minutes
  IF v_attempt_count >= 5 THEN
    v_should_block := TRUE;
    v_blocked_until := NOW() + INTERVAL '30 minutes';
  END IF;
  
  RETURN jsonb_build_object(
    'should_block', v_should_block,
    'attempt_count', v_attempt_count,
    'blocked_until', v_blocked_until
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
