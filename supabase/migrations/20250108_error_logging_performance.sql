-- Migration: Error Logging and Performance Monitoring
-- Created: 2025-01-08
-- Description: Tables for storing error logs and performance metrics

-- ============================================
-- 1. ERROR LOGS TABLE
-- ============================================

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  url TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info')),
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT
);

-- Create indexes for error_logs
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_url ON error_logs(url);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved_at) WHERE resolved_at IS NOT NULL;

-- Create composite index for common queries
CREATE INDEX idx_error_logs_user_created ON error_logs(user_id, created_at DESC);
CREATE INDEX idx_error_logs_severity_created ON error_logs(severity, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE error_logs IS 'Stores client-side and server-side error logs for monitoring and debugging';
COMMENT ON COLUMN error_logs.id IS 'Unique identifier for the error log entry';
COMMENT ON COLUMN error_logs.user_id IS 'ID of the user who encountered the error (nullable for unauthenticated users)';
COMMENT ON COLUMN error_logs.error_message IS 'Error message text';
COMMENT ON COLUMN error_logs.error_stack IS 'Error stack trace for debugging';
COMMENT ON COLUMN error_logs.component_stack IS 'React component stack trace (for React errors)';
COMMENT ON COLUMN error_logs.url IS 'URL where the error occurred';
COMMENT ON COLUMN error_logs.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN error_logs.severity IS 'Error severity level: error, warning, or info';
COMMENT ON COLUMN error_logs.context IS 'Additional context data as JSON (e.g., browser info, custom metadata)';
COMMENT ON COLUMN error_logs.created_at IS 'Timestamp when the error occurred';
COMMENT ON COLUMN error_logs.resolved_at IS 'Timestamp when the error was marked as resolved';
COMMENT ON COLUMN error_logs.resolved_by IS 'User ID who resolved the error';
COMMENT ON COLUMN error_logs.resolution_notes IS 'Notes about how the error was resolved';

-- Enable Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for error_logs

-- Policy: Users can insert their own errors (or anonymous errors)
CREATE POLICY "Users can log their own errors"
  ON error_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    auth.uid()::TEXT = user_id 
    OR user_id IS NULL
    OR auth.role() = 'anon'
  );

-- Policy: Users can view their own errors
CREATE POLICY "Users can view their own errors"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid()::TEXT = user_id);

-- Policy: Admins can view all errors
CREATE POLICY "Admins can view all errors"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::TEXT
      AND users.role IN ('super_admin', 'clinic_admin')
    )
  );

-- Policy: Admins can update errors (mark as resolved)
CREATE POLICY "Admins can update errors"
  ON error_logs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::TEXT
      AND users.role IN ('super_admin', 'clinic_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::TEXT
      AND users.role IN ('super_admin', 'clinic_admin')
    )
  );

-- Policy: Admins can delete errors (for cleanup)
CREATE POLICY "Admins can delete errors"
  ON error_logs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::TEXT
      AND users.role IN ('super_admin', 'clinic_admin')
    )
  );

-- ============================================
-- 2. PERFORMANCE METRICS TABLE
-- ============================================

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  metric_type TEXT NOT NULL, -- 'web-vital', 'page-view', 'api-call', 'long-task', etc.
  metric_name TEXT, -- 'LCP', 'FID', 'CLS', etc. for web vitals
  metric_value NUMERIC NOT NULL,
  metric_rating TEXT CHECK (metric_rating IN ('good', 'needs-improvement', 'poor')),
  page_url TEXT NOT NULL,
  page_name TEXT, -- friendly page name (e.g., 'dashboard', 'booking')
  endpoint TEXT, -- API endpoint if metric_type is 'api-call'
  user_agent TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance_metrics
CREATE INDEX idx_perf_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_perf_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_perf_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_perf_metrics_rating ON performance_metrics(metric_rating);
CREATE INDEX idx_perf_metrics_created_at ON performance_metrics(created_at DESC);
CREATE INDEX idx_perf_metrics_page_name ON performance_metrics(page_name);
CREATE INDEX idx_perf_metrics_endpoint ON performance_metrics(endpoint) WHERE endpoint IS NOT NULL;

-- Create composite indexes for common queries
CREATE INDEX idx_perf_metrics_type_created ON performance_metrics(metric_type, created_at DESC);
CREATE INDEX idx_perf_metrics_name_created ON performance_metrics(metric_name, created_at DESC);
CREATE INDEX idx_perf_metrics_page_created ON performance_metrics(page_name, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE performance_metrics IS 'Stores performance metrics for monitoring application performance';
COMMENT ON COLUMN performance_metrics.id IS 'Unique identifier for the performance metric';
COMMENT ON COLUMN performance_metrics.user_id IS 'ID of the user (nullable for anonymous users)';
COMMENT ON COLUMN performance_metrics.metric_type IS 'Type of metric: web-vital, page-view, api-call, long-task, etc.';
COMMENT ON COLUMN performance_metrics.metric_name IS 'Specific metric name (e.g., LCP, FID, CLS for web vitals)';
COMMENT ON COLUMN performance_metrics.metric_value IS 'Numeric value of the metric (e.g., milliseconds, bytes)';
COMMENT ON COLUMN performance_metrics.metric_rating IS 'Performance rating: good, needs-improvement, or poor';
COMMENT ON COLUMN performance_metrics.page_url IS 'Full URL where the metric was collected';
COMMENT ON COLUMN performance_metrics.page_name IS 'Friendly page name for easier filtering';
COMMENT ON COLUMN performance_metrics.endpoint IS 'API endpoint path (for api-call metrics)';
COMMENT ON COLUMN performance_metrics.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN performance_metrics.context IS 'Additional context data as JSON';
COMMENT ON COLUMN performance_metrics.created_at IS 'Timestamp when the metric was recorded';

-- Enable Row Level Security
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_metrics

-- Policy: Anyone can insert performance metrics
CREATE POLICY "Anyone can log performance metrics"
  ON performance_metrics
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: Admins can view all performance metrics
CREATE POLICY "Admins can view all performance metrics"
  ON performance_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::TEXT
      AND users.role IN ('super_admin', 'clinic_admin')
    )
  );

-- Policy: Admins can delete old performance metrics (for cleanup)
CREATE POLICY "Admins can delete performance metrics"
  ON performance_metrics
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::TEXT
      AND users.role IN ('super_admin', 'clinic_admin')
    )
  );

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Function to clean up old error logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM error_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND resolved_at IS NOT NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_error_logs IS 'Deletes resolved error logs older than 90 days';

-- Function to clean up old performance metrics (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM performance_metrics
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_performance_metrics IS 'Deletes performance metrics older than 30 days';

-- Function to get error statistics for a time period
CREATE OR REPLACE FUNCTION get_error_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '24 hours',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_errors BIGINT,
  by_severity JSONB,
  by_url JSONB,
  resolved_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_errors,
    jsonb_object_agg(severity, severity_count) as by_severity,
    jsonb_object_agg(url, url_count) as by_url,
    COUNT(*) FILTER (WHERE resolved_at IS NOT NULL)::BIGINT as resolved_count
  FROM (
    SELECT
      severity,
      COUNT(*) as severity_count,
      url,
      COUNT(*) OVER (PARTITION BY url) as url_count,
      resolved_at
    FROM error_logs
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY severity, url, resolved_at
  ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_error_stats IS 'Gets error statistics for a specified time period';

-- Function to get performance statistics
CREATE OR REPLACE FUNCTION get_performance_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '24 hours',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_metrics BIGINT,
  avg_by_type JSONB,
  rating_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_metrics,
    jsonb_object_agg(metric_type, avg_value) as avg_by_type,
    jsonb_object_agg(metric_rating, rating_count) as rating_distribution
  FROM (
    SELECT
      metric_type,
      AVG(metric_value) as avg_value,
      metric_rating,
      COUNT(*) as rating_count
    FROM performance_metrics
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY metric_type, metric_rating
  ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_performance_stats IS 'Gets performance statistics for a specified time period';

-- ============================================
-- 4. GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_error_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_performance_stats TO authenticated;

-- Only admins can execute cleanup functions
-- (These should be called via scheduled jobs)
REVOKE EXECUTE ON FUNCTION cleanup_old_error_logs FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION cleanup_old_performance_metrics FROM PUBLIC;

-- ============================================
-- 5. SAMPLE QUERIES (FOR REFERENCE)
-- ============================================

-- Get error stats for last 24 hours
-- SELECT * FROM get_error_stats();

-- Get performance stats for last 7 days
-- SELECT * FROM get_performance_stats(NOW() - INTERVAL '7 days', NOW());

-- Find most common errors
-- SELECT error_message, COUNT(*) as count
-- FROM error_logs
-- WHERE created_at > NOW() - INTERVAL '24 hours'
-- GROUP BY error_message
-- ORDER BY count DESC
-- LIMIT 10;

-- Find slowest pages (by LCP)
-- SELECT page_name, AVG(metric_value) as avg_lcp
-- FROM performance_metrics
-- WHERE metric_name = 'LCP'
-- AND created_at > NOW() - INTERVAL '7 days'
-- GROUP BY page_name
-- ORDER BY avg_lcp DESC
-- LIMIT 10;

-- Find pages with poor performance ratings
-- SELECT page_name, metric_name, COUNT(*) as poor_count
-- FROM performance_metrics
-- WHERE metric_rating = 'poor'
-- AND created_at > NOW() - INTERVAL '7 days'
-- GROUP BY page_name, metric_name
-- ORDER BY poor_count DESC;
