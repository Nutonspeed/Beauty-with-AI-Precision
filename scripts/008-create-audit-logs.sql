CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'marketing', 'data_processing', 'hipaa')),
  version VARCHAR(20) NOT NULL,
  granted BOOLEAN DEFAULT true,
  ip_address INET,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, consent_type, version)
);

CREATE TABLE IF NOT EXISTS data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  access_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('unauthorized_access', 'data_breach', 'suspicious_activity', 'failed_login', 'other')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  details JSONB,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_user_consents_user ON user_consents(user_id);
CREATE INDEX idx_data_access_logs_user ON data_access_logs(user_id);
CREATE INDEX idx_data_access_logs_accessed_by ON data_access_logs(accessed_by);
CREATE INDEX idx_security_incidents_status ON security_incidents(status);
CREATE INDEX idx_security_incidents_severity ON security_incidents(severity);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can view their own consents
CREATE POLICY "Users can view own consents"
  ON user_consents FOR SELECT
  USING (user_id = auth.uid());

-- Users can manage their own consents
CREATE POLICY "Users can manage own consents"
  ON user_consents FOR ALL
  USING (user_id = auth.uid());

-- Users can view who accessed their data
CREATE POLICY "Users can view own data access logs"
  ON data_access_logs FOR SELECT
  USING (user_id = auth.uid());

-- Staff can view data access logs
CREATE POLICY "Staff can view data access logs"
  ON data_access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'clinic_staff')
    )
  );

-- Only admins can manage security incidents
CREATE POLICY "Admins can manage security incidents"
  ON security_incidents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_status VARCHAR DEFAULT 'success'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    status
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent,
    p_status
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log data access
CREATE OR REPLACE FUNCTION log_data_access(
  p_user_id UUID,
  p_accessed_by UUID,
  p_resource_type VARCHAR,
  p_resource_id UUID,
  p_access_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO data_access_logs (
    user_id,
    accessed_by,
    resource_type,
    resource_id,
    access_reason
  ) VALUES (
    p_user_id,
    p_accessed_by,
    p_resource_type,
    p_resource_id,
    p_access_reason
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
