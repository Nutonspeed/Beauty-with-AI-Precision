-- Create api_logs table for tracking API requests
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Request details
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER, -- in milliseconds
  
  -- User/tenant tracking
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  
  -- Request metadata
  user_agent TEXT,
  ip_address INET,
  
  -- Error tracking
  error_message TEXT,
  error_stack TEXT,
  
  -- Indexing for performance
  INDEX idx_api_logs_created_at ON api_logs(created_at DESC),
  INDEX idx_api_logs_status_code ON api_logs(status_code),
  INDEX idx_api_logs_user_id ON api_logs(user_id),
  INDEX idx_api_logs_clinic_id ON api_logs(clinic_id)
);

-- Enable RLS
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Super admins can view all logs
CREATE POLICY "Super admins can view all api logs"
  ON api_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- System can insert logs
CREATE POLICY "System can insert api logs"
  ON api_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE api_logs IS 'API request logs for monitoring and debugging';
COMMENT ON COLUMN api_logs.response_time IS 'Response time in milliseconds';
COMMENT ON COLUMN api_logs.status_code IS 'HTTP status code (200, 404, 500, etc.)';
