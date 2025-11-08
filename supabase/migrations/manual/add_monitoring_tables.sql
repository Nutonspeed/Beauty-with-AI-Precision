-- ============================================
-- เพิ่มเฉพาะ 2 ตารางใหม่ที่จำเป็น (Task 9)
-- ============================================

-- Table 1: Error Logs
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  url TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info')),
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT
);

-- Indexes for error_logs
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_url ON error_logs(url);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_error_logs_user_created ON error_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity_created ON error_logs(severity, created_at DESC);

-- RLS for error_logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own errors"
  ON error_logs FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can view their own errors"
  ON error_logs FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Admins can view all errors"
  ON error_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'clinic_owner')
    )
  );

CREATE POLICY "Admins can update all errors"
  ON error_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'clinic_owner')
    )
  );

CREATE POLICY "Admins can delete old errors"
  ON error_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Table 2: Performance Metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metric_type TEXT NOT NULL,
  metric_name TEXT,
  metric_value NUMERIC NOT NULL,
  metric_rating TEXT CHECK (metric_rating IN ('good', 'needs-improvement', 'poor')),
  page_url TEXT NOT NULL,
  page_name TEXT,
  endpoint TEXT,
  user_agent TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance_metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_page_url ON performance_metrics(page_url);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_rating ON performance_metrics(metric_rating);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_created ON performance_metrics(metric_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_created ON performance_metrics(metric_name, created_at DESC);

-- RLS for performance_metrics
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert performance metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own metrics"
  ON performance_metrics FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Admins can view all metrics"
  ON performance_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'clinic_owner')
    )
  );

-- Helper Functions
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM error_logs
  WHERE resolved_at IS NOT NULL
    AND resolved_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM performance_metrics
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION get_error_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  severity TEXT,
  count BIGINT,
  unique_users BIGINT,
  unique_urls BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.severity,
    COUNT(*) as count,
    COUNT(DISTINCT e.user_id) as unique_users,
    COUNT(DISTINCT e.url) as unique_urls
  FROM error_logs e
  WHERE e.created_at BETWEEN start_date AND end_date
  GROUP BY e.severity
  ORDER BY count DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_performance_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  metric_name TEXT,
  avg_value NUMERIC,
  p50_value NUMERIC,
  p75_value NUMERIC,
  p95_value NUMERIC,
  sample_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.metric_name,
    AVG(pm.metric_value) as avg_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pm.metric_value) as p50_value,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY pm.metric_value) as p75_value,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY pm.metric_value) as p95_value,
    COUNT(*) as sample_count
  FROM performance_metrics pm
  WHERE pm.created_at BETWEEN start_date AND end_date
    AND pm.metric_name IS NOT NULL
  GROUP BY pm.metric_name
  ORDER BY avg_value DESC;
END;
$$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ เพิ่ม 2 ตารางใหม่สำเร็จ: error_logs และ performance_metrics';
  RAISE NOTICE '📊 พร้อมสำหรับ Error Monitoring และ Performance Tracking';
END $$;
