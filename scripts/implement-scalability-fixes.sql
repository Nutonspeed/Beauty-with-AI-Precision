-- Immediate Scalability Fixes
-- Run these queries on your Supabase database to improve performance

-- ========================================
-- 1. Add Critical Database Indexes
-- ========================================

-- Index for tenant queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clinics_active_created 
ON clinics(is_active, created_at);

-- Index for user queries by clinic
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_clinic_role 
ON users(clinic_id, role);

-- Index for appointment analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_clinic_status 
ON appointments(clinic_id, status, created_at);

-- Index for audit logs (most queried)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_created 
ON audit_logs(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_created 
ON audit_logs(action, created_at DESC);

-- Index for feature flags lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_flags_clinic_feature 
ON feature_flags(clinic_id, feature_key);

-- Index for subscription queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clinic_subscriptions_status 
ON clinic_subscriptions(status, created_at);

-- Index for sales queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_leads_clinic_created 
ON sales_leads(clinic_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_proposals_clinic_status 
ON sales_proposals(clinic_id, status, created_at DESC);

-- ========================================
-- 2. Optimize RLS Policies
-- ========================================

-- Replace expensive RLS with optimized versions
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON audit_logs;

CREATE POLICY "Super admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE role = 'super_admin' 
      LIMIT 1
    )
  );

-- Add bypass for system operations
CREATE POLICY "System service role bypass" ON audit_logs
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ========================================
-- 3. Create Materialized Views for Analytics
-- ========================================

-- Clinic performance summary (refreshed daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS clinic_performance_summary AS
SELECT 
  c.id as clinic_id,
  c.name as clinic_name,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT CASE WHEN u.role = 'customer' THEN u.id END) as total_customers,
  COUNT(a.id) as total_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
  COUNT(CASE WHEN a.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_appointments,
  COALESCE(SUM(CASE WHEN sp.status = 'paid' THEN sp.amount END), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN sp.created_at > NOW() - INTERVAL '30 days' AND sp.status = 'paid' THEN sp.amount END), 0) as recent_revenue,
  MAX(a.created_at) as last_activity
FROM clinics c
LEFT JOIN users u ON u.clinic_id = c.id
LEFT JOIN appointments a ON a.clinic_id = c.id
LEFT JOIN booking_payments sp ON sp.appointment_id = a.id
WHERE c.is_active = true
GROUP BY c.id, c.name;

-- Create unique index for refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinic_performance_summary_unique 
ON clinic_performance_summary(clinic_id);

-- ========================================
-- 4. Create Function to Refresh Materialized View
-- ========================================

CREATE OR REPLACE FUNCTION refresh_clinic_performance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY clinic_performance_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (requires pg_cron extension)
-- Uncomment if pg_cron is available
-- SELECT cron.schedule('refresh-clinic-performance', '0 2 * * *', 'SELECT refresh_clinic_performance();');

-- ========================================
-- 5. Optimize Audit Logs with Partitioning (Optional)
-- ========================================

-- Create partitioned table for new audit logs
CREATE TABLE IF NOT EXISTS audit_logs_partitioned (
  LIKE audit_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for current year
DO $$
DECLARE
  month_date date;
  start_date date;
  end_date date;
BEGIN
  FOR month_date IN 
    SELECT generate_series(
      date_trunc('month', CURRENT_DATE),
      date_trunc('month', CURRENT_DATE) + INTERVAL '11 months',
      '1 month'
    )::date
  LOOP
    start_date := month_date;
    end_date := month_date + INTERVAL '1 month';
    
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS audit_logs_%s 
      PARTITION OF audit_logs_partitioned 
      FOR VALUES FROM (%L) TO (%L)',
      to_char(month_date, 'YYYY_MM'),
      start_date,
      end_date
    );
  END LOOP;
END $$;

-- ========================================
-- 6. Add Database Performance Monitoring
-- ========================================

-- Create view for slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100 -- queries taking more than 100ms
ORDER BY mean_time DESC
LIMIT 20;

-- Create view for table sizes
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ========================================
-- 7. Create Connection Pool Helper
-- ========================================

-- Function to check connection pool status
CREATE OR REPLACE FUNCTION check_connection_pool()
RETURNS TABLE(
  active_connections integer,
  max_connections integer,
  utilization_percent numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as active_connections,
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
    ROUND(
      (COUNT(*)::float / (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') * 100), 
      2
    ) as utilization_percent
  FROM pg_stat_activity
  WHERE state = 'active';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. Verification Queries
-- ========================================

-- Check if indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('clinics', 'users', 'appointments', 'audit_logs', 'feature_flags')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check materialized view
SELECT 
  schemaname,
  matviewname,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size
FROM pg_matviews
WHERE matviewname = 'clinic_performance_summary';

-- Show performance summary
SELECT 'Database optimization completed!' as status,
       NOW() as completed_at;

-- ========================================
-- 9. Recommended Next Steps
-- ========================================

/*
1. Set up Redis for application caching:
   npm install @upstash/redis

2. Implement connection pooling in your app:
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000
   });

3. Add rate limiting to AI endpoints:
   Use Upstash Redis for distributed rate limiting

4. Set up CDN for static assets:
   Configure Cloudflare or Vercel Edge Network

5. Monitor performance:
   - Query the slow_queries view regularly
   - Monitor table_sizes view
   - Set up alerts for high utilization
*/
