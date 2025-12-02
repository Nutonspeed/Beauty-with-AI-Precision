-- Database Optimization Migrations
-- Run these migrations to optimize database performance

-- Migration 001: Add Essential Indexes
-- Indexes for frequently queried columns

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_clinic_id ON users(clinic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_status ON users(role, clinic_id) WHERE deleted_at IS NULL;

-- Skin analyses indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skin_analyses_user_id ON skin_analyses(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skin_analyses_clinic_id ON skin_analyses(clinic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skin_analyses_created_at ON skin_analyses(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skin_analyses_confidence ON skin_analyses(confidence_score) WHERE confidence_score > 0.7;

-- Sales leads indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_leads_clinic_id ON sales_leads(clinic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_leads_status ON sales_leads(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_leads_created_at ON sales_leads(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_leads_assigned_staff ON sales_leads(assigned_staff_id, status);

-- Bookings indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_clinic_id ON bookings(clinic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, booking_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Treatments indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_treatments_clinic_id ON treatments(clinic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_treatments_category ON treatments(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_treatments_active ON treatments(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_treatments_price_range ON treatments(price) WHERE is_active = true;

-- Chat history indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_history_participants ON chat_history(sender_id, receiver_id);

-- Video calls indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_calls_clinic_id ON video_calls(clinic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_calls_status ON video_calls(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_calls_created_at ON video_calls(created_at DESC);

-- Migration 002: Create Partitioned Tables for Large Datasets
-- Partition skin_analyses by month for better performance

-- Create partitioned table for skin analyses
CREATE TABLE IF NOT EXISTS skin_analyses_partitioned (
    LIKE skin_analyses INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions (example for current and future months)
-- Note: These would be created dynamically based on current date
CREATE TABLE IF NOT EXISTS skin_analyses_y2024m12 PARTITION OF skin_analyses_partitioned
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE IF NOT EXISTS skin_analyses_y2025m01 PARTITION OF skin_analyses_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Migration 003: Create Materialized Views for Complex Queries
-- Materialized view for clinic analytics

CREATE MATERIALIZED VIEW IF NOT EXISTS clinic_analytics_summary AS
SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT sa.id) as total_analyses,
    COUNT(DISTINCT sl.id) as total_leads,
    COUNT(DISTINCT b.id) as total_bookings,
    AVG(sa.confidence_score) as avg_confidence_score,
    COUNT(DISTINCT CASE WHEN sl.status = 'converted' THEN sl.id END) as converted_leads,
    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings
FROM clinics c
LEFT JOIN users u ON u.clinic_id = c.id AND u.deleted_at IS NULL
LEFT JOIN skin_analyses sa ON sa.user_id = u.id AND sa.deleted_at IS NULL
LEFT JOIN sales_leads sl ON sl.clinic_id = c.id AND sl.deleted_at IS NULL
LEFT JOIN bookings b ON b.clinic_id = c.id AND b.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name;

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinic_analytics_summary_clinic_id 
    ON clinic_analytics_summary(clinic_id);

-- Migration 004: Optimize Table Storage and Parameters
-- Update table statistics and optimize storage

-- Update table statistics for better query planning
ANALYZE users;
ANALYZE skin_analyses;
ANALYZE sales_leads;
ANALYZE bookings;
ANALYZE treatments;
ANALYZE chat_history;
ANALYZE video_calls;

-- Set table-level optimizations
ALTER TABLE users SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE skin_analyses SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE sales_leads SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE bookings SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE chat_history SET (autovacuum_vacuum_scale_factor = 0.05);

-- Migration 005: Create Partial Indexes for Common Queries
-- Partial indexes for specific query patterns

-- Active users index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active 
    ON users(clinic_id, role) 
    WHERE deleted_at IS NULL AND is_active = true;

-- Recent analyses index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skin_analyses_recent 
    ON skin_analyses(user_id, created_at DESC) 
    WHERE created_at > NOW() - INTERVAL '30 days' AND deleted_at IS NULL;

-- Hot leads index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_leads_hot 
    ON sales_leads(clinic_id, created_at DESC) 
    WHERE status IN ('new', 'contacted') AND deleted_at IS NULL;

-- Upcoming bookings index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_upcoming 
    ON bookings(clinic_id, booking_date, status) 
    WHERE booking_date >= NOW() AND status IN ('scheduled', 'confirmed') AND deleted_at IS NULL;

-- Available treatments index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_treatments_available 
    ON treatments(clinic_id, category, price) 
    WHERE is_active = true AND deleted_at IS NULL;

-- Migration 006: Create Composite Indexes for Join Optimization
-- Composite indexes for common join patterns

-- User clinic join optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_clinic_role_active 
    ON users(clinic_id, role, is_active) 
    WHERE deleted_at IS NULL;

-- Analysis user join optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skin_analyses_user_clinic_date 
    ON skin_analyses(user_id, clinic_id, created_at DESC) 
    WHERE deleted_at IS NULL;

-- Lead staff assignment optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_leads_clinic_staff_status 
    ON sales_leads(clinic_id, assigned_staff_id, status, created_at DESC) 
    WHERE deleted_at IS NULL;

-- Booking user clinic optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_clinic_date_status 
    ON bookings(user_id, clinic_id, booking_date DESC, status) 
    WHERE deleted_at IS NULL;

-- Migration 007: Create Trigger-based Optimizations
-- Triggers for maintaining denormalized data

-- Create clinic stats trigger function
CREATE OR REPLACE FUNCTION update_clinic_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update clinic statistics when relevant data changes
    IF TG_TABLE_NAME = 'users' THEN
        UPDATE clinics 
        SET 
            total_users = (
                SELECT COUNT(*) 
                FROM users 
                WHERE clinic_id = NEW.clinic_id AND deleted_at IS NULL
            ),
            updated_at = NOW()
        WHERE id = NEW.clinic_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for clinic stats updates
CREATE TRIGGER trigger_update_clinic_stats_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION update_clinic_stats();

-- Migration 008: Create Performance Monitoring Views
-- Views for monitoring database performance

CREATE OR REPLACE VIEW performance_slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100 -- queries taking more than 100ms on average
ORDER BY mean_time DESC
LIMIT 50;

CREATE OR REPLACE VIEW performance_table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

CREATE OR REPLACE VIEW performance_index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Migration 009: Create Database Configuration Optimizations
-- Apply PostgreSQL configuration optimizations

-- Note: These require superuser privileges
-- SET shared_buffers = '256MB';
-- SET effective_cache_size = '1GB';
-- SET maintenance_work_mem = '64MB';
-- SET checkpoint_completion_target = 0.9;
-- SET wal_buffers = '16MB';
-- SET default_statistics_target = 100;
-- SET random_page_cost = 1.1;
-- SET effective_io_concurrency = 200;

-- Migration 010: Create Cleanup and Maintenance Procedures
-- Automated cleanup procedures

CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Archive old chat messages (older than 1 year)
    DELETE FROM chat_history 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Archive old video call records (older than 6 months)
    DELETE FROM video_calls 
    WHERE created_at < NOW() - INTERVAL '6 months' AND status = 'completed';
    
    -- Remove expired sessions
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
    
    -- Update statistics
    ANALYZE;
    
    RAISE NOTICE 'Cleanup completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');
