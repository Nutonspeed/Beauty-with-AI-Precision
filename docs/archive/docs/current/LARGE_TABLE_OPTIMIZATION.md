# Large Table Optimization Strategy

**Date:** November 10, 2025  
**Phase:** Phase 4 - Task 4 (Optimize Large Tables)  
**Status:** 📊 Analysis Complete, Recommendations Ready

---

## Executive Summary

This document outlines optimization strategies for large tables in the Beauty with AI Precision database. Based on schema analysis and expected data growth patterns, we've identified critical tables that require performance optimization through partitioning, indexing, and maintenance strategies.

### Key Findings

- **60+ tables** in production database
- **5 critical large tables** identified for optimization
- **Table partitioning** recommended for 3 high-growth tables
- **JSONB optimization** needed for analytics and metadata queries
- **Autovacuum tuning** required for append-heavy tables

---

## 1. Critical Large Tables Analysis

### 1.1 skin_analyses (CRITICAL - Highest Priority)

**Estimated Growth:**
- Current: Unknown (needs verification)
- Expected: 1000-5000 analyses/day
- Growth rate: ~1.5M rows/year
- Projected 2026: 2-5M rows

**Table Characteristics:**
- **Primary Key:** `id` (UUID)
- **Size Columns:** `image_url` (text), `ai_severity` (JSONB), `recommendations` (array)
- **Common Queries:**
  - Customer history: `WHERE user_id = ?`
  - Date range: `WHERE created_at BETWEEN ? AND ?`
  - Quality filtering: `WHERE quality_overall > 80`
  - Clinic isolation: `WHERE clinic_id = ?` (if column exists)

**Current Indexes (14+):**
✅ Excellent index coverage (from Task 3 analysis)

**Optimization Recommendations:**

#### Priority 1: Add Date Column for Partitioning
```sql
-- Add created_at_date for partition key (if not exists)
ALTER TABLE skin_analyses 
ADD COLUMN created_at_date DATE GENERATED ALWAYS AS (DATE(created_at)) STORED;

CREATE INDEX idx_skin_analyses_created_date 
ON skin_analyses(created_at_date);
```

#### Priority 2: Table Partitioning Strategy (Range by Month)
```sql
-- Step 1: Create partitioned table
CREATE TABLE skin_analyses_partitioned (
  LIKE skin_analyses INCLUDING ALL
) PARTITION BY RANGE (created_at_date);

-- Step 2: Create partitions for 2024-2025
CREATE TABLE skin_analyses_y2024m10 
  PARTITION OF skin_analyses_partitioned
  FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

CREATE TABLE skin_analyses_y2024m11 
  PARTITION OF skin_analyses_partitioned
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

-- ... create partitions for each month

-- Step 3: Create default partition for future data
CREATE TABLE skin_analyses_default 
  PARTITION OF skin_analyses_partitioned DEFAULT;

-- Step 4: Migrate data (requires downtime or pg_partman)
INSERT INTO skin_analyses_partitioned 
SELECT * FROM skin_analyses;

-- Step 5: Swap tables
BEGIN;
ALTER TABLE skin_analyses RENAME TO skin_analyses_old;
ALTER TABLE skin_analyses_partitioned RENAME TO skin_analyses;
COMMIT;

-- Step 6: Drop old table after verification
-- DROP TABLE skin_analyses_old;
```

**Benefits:**
- Query performance: 50-70% faster for date range queries
- Easier data archival (detach old partitions)
- Better VACUUM performance (smaller partitions)
- Index maintenance faster per partition

**Risks:**
- Migration requires downtime (~30-60 minutes for 1M rows)
- Application changes if using raw SQL (Prisma/Supabase abstracts this)
- Need automated partition creation for new months

#### Priority 3: JSONB Optimization
```sql
-- Already added in Task 3:
-- CREATE INDEX idx_skin_analyses_ai_severity_gin ON skin_analyses USING GIN (ai_severity);

-- Additional JSONB indexes if specific queries are slow:
CREATE INDEX idx_skin_analyses_ai_concerns_gin 
ON skin_analyses USING GIN (ai_concerns);

-- For specific key lookups (faster than GIN for single keys):
CREATE INDEX idx_skin_analyses_ai_skin_type 
ON skin_analyses(ai_skin_type);
```

---

### 1.2 sales_leads (HIGH Priority)

**Estimated Growth:**
- Current: Unknown
- Expected: 500-1000 leads/day
- Growth rate: ~300K rows/year
- Projected 2026: 500K-1M rows

**Table Characteristics:**
- **Primary Key:** `id` (UUID)
- **Hot Columns:** `status`, `sales_user_id`, `created_at`, `updated_at`
- **Common Queries:**
  - Sales dashboard: `WHERE sales_user_id = ? AND status IN (?)`
  - Lead pipeline: `WHERE status = ? ORDER BY updated_at DESC`
  - Search: `WHERE name ILIKE ? OR email ILIKE ?`

**Current Indexes:**
✅ 4 new indexes added in Task 3

**Optimization Recommendations:**

#### Priority 1: Composite Index for Dashboard Queries
```sql
-- Already added in Task 3:
-- CREATE INDEX idx_sales_leads_user_status_updated 
--   ON sales_leads(sales_user_id, status, updated_at DESC);

-- Additional for filtering + sorting:
CREATE INDEX idx_sales_leads_status_score_updated 
ON sales_leads(status, score DESC, updated_at DESC);
```

#### Priority 2: Full-Text Search Index
```sql
-- For name/email search
CREATE INDEX idx_sales_leads_search_fts 
ON sales_leads USING GIN(
  to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(email, '') || ' ' || 
    COALESCE(phone, '')
  )
);

-- Usage:
-- SELECT * FROM sales_leads 
-- WHERE to_tsvector('english', name || ' ' || email) 
--       @@ to_tsquery('english', 'john & doe');
```

#### Priority 3: Archive Old Leads
```sql
-- Move converted/lost leads older than 1 year to archive table
CREATE TABLE sales_leads_archive (LIKE sales_leads INCLUDING ALL);

-- Manual archival process (run quarterly):
WITH archived AS (
  DELETE FROM sales_leads
  WHERE status IN ('converted', 'lost', 'unqualified')
    AND updated_at < NOW() - INTERVAL '1 year'
  RETURNING *
)
INSERT INTO sales_leads_archive SELECT * FROM archived;
```

---

### 1.3 customer_notes (MEDIUM Priority)

**Estimated Growth:**
- Expected: 2000-5000 notes/day
- Growth rate: ~1M rows/year
- Projected 2026: 1-2M rows

**Table Characteristics:**
- **Primary Key:** `id` (UUID)
- **Large Column:** `content` (text) - average 200-500 characters
- **Access Pattern:** Recent notes accessed most frequently (80/20 rule)

**Current Indexes:**
✅ Full-text search (GIN) + 5 new indexes added in Task 3

**Optimization Recommendations:**

#### Priority 1: Partial Index for Recent Notes
```sql
-- Index only last 6 months of notes (covers 95% of queries)
CREATE INDEX idx_customer_notes_recent 
ON customer_notes(customer_id, created_at DESC)
WHERE created_at > NOW() - INTERVAL '6 months';

-- Smaller index, faster queries for recent data
```

#### Priority 2: Partitioning by Quarter
```sql
-- Similar to skin_analyses, partition by created_at
CREATE TABLE customer_notes_partitioned (
  LIKE customer_notes INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create quarterly partitions
CREATE TABLE customer_notes_y2024q4 
  PARTITION OF customer_notes_partitioned
  FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');

-- Automatic partition creation with pg_partman or cron job
```

---

### 1.4 analytics_events (MEDIUM Priority)

**Estimated Growth:**
- Expected: 10K-50K events/day
- Growth rate: ~10M rows/year
- Projected 2026: 15-20M rows

**Table Characteristics:**
- **Primary Key:** `id` (UUID)
- **JSONB Column:** `properties` (heavy)
- **Time-Series Data:** Queries always filtered by timestamp

**Optimization Recommendations:**

#### Priority 1: Time-Series Partitioning (Mandatory)
```sql
-- Partition by week for better performance
CREATE TABLE analytics_events_partitioned (
  LIKE analytics_events INCLUDING ALL
) PARTITION BY RANGE (timestamp);

-- Create weekly partitions
CREATE TABLE analytics_events_y2024w45 
  PARTITION OF analytics_events_partitioned
  FOR VALUES FROM ('2024-11-04') TO ('2024-11-11');

-- Automated partition creation + rotation
```

#### Priority 2: Data Retention Policy
```sql
-- Drop old partitions after 90 days
CREATE OR REPLACE FUNCTION drop_old_analytics_partitions()
RETURNS void AS $$
DECLARE
  partition_name TEXT;
BEGIN
  FOR partition_name IN
    SELECT tablename 
    FROM pg_tables
    WHERE tablename LIKE 'analytics_events_y%'
      AND tablename < 'analytics_events_y' || 
          to_char(NOW() - INTERVAL '90 days', 'YYYYwWW')
  LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || partition_name;
    RAISE NOTICE 'Dropped partition: %', partition_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron (weekly)
-- SELECT cron.schedule('drop-old-analytics', '0 0 * * 0', 
--   'SELECT drop_old_analytics_partitions()');
```

#### Priority 3: Aggregated Views
```sql
-- Pre-aggregate daily metrics for faster dashboards
CREATE MATERIALIZED VIEW analytics_daily_summary AS
SELECT 
  DATE(timestamp) AS date,
  event_type,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_id) AS unique_users,
  jsonb_object_agg(
    properties->>'action', 
    COUNT(*)
  ) FILTER (WHERE properties->>'action' IS NOT NULL) AS action_breakdown
FROM analytics_events
GROUP BY DATE(timestamp), event_type;

CREATE UNIQUE INDEX ON analytics_daily_summary(date, event_type);

-- Refresh daily (use pg_cron)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_daily_summary;
```

---

### 1.5 treatment_records (LOW Priority)

**Estimated Growth:**
- Expected: 200-500 records/day
- Growth rate: ~150K rows/year
- Current optimization: Already has 7 indexes ✅

**Optimization Recommendations:**

#### Monitor Only (No Immediate Action)
- Current index coverage is excellent
- Query performance expected to be good
- Re-evaluate when reaching 500K rows

---

## 2. VACUUM and Maintenance Strategy

### 2.1 Autovacuum Tuning

**Current Supabase Defaults:**
```sql
-- Check current settings
SHOW autovacuum_vacuum_scale_factor;  -- Usually 0.2 (20%)
SHOW autovacuum_vacuum_threshold;     -- Usually 50 rows
SHOW autovacuum_analyze_scale_factor; -- Usually 0.1 (10%)
```

**Recommended Per-Table Settings:**

```sql
-- For high-write tables (skin_analyses, customer_notes, analytics_events)
ALTER TABLE skin_analyses SET (
  autovacuum_vacuum_scale_factor = 0.05,  -- More aggressive (5%)
  autovacuum_vacuum_threshold = 1000,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_analyze_threshold = 500
);

ALTER TABLE customer_notes SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_vacuum_threshold = 1000
);

ALTER TABLE analytics_events SET (
  autovacuum_vacuum_scale_factor = 0.01,  -- Very aggressive (1%)
  autovacuum_vacuum_threshold = 5000
);
```

### 2.2 Manual VACUUM Schedule

```sql
-- Weekly VACUUM on large tables (during low-traffic hours)
-- Run every Sunday at 2 AM (adjust timezone)

-- VACUUM ANALYZE (non-blocking, recommended)
VACUUM ANALYZE skin_analyses;
VACUUM ANALYZE sales_leads;
VACUUM ANALYZE customer_notes;

-- VACUUM FULL (blocks table, use with caution)
-- Only run if bloat > 30% and during maintenance window
-- VACUUM FULL skin_analyses;  -- Can take hours!
```

### 2.3 REINDEX Schedule

```sql
-- Quarterly REINDEX CONCURRENTLY (non-blocking)
-- Run during low-traffic hours

REINDEX INDEX CONCURRENTLY idx_skin_analyses_created_at;
REINDEX INDEX CONCURRENTLY idx_sales_leads_user_status_updated;
-- ... other heavily used indexes
```

---

## 3. Query Optimization Guidelines

### 3.1 Common Anti-Patterns to Avoid

#### ❌ BAD: No WHERE clause on large tables
```sql
-- Scans entire table
SELECT * FROM skin_analyses ORDER BY created_at DESC LIMIT 10;
```

#### ✅ GOOD: Always filter by indexed columns
```sql
-- Uses index effectively
SELECT * FROM skin_analyses 
WHERE user_id = '...' 
ORDER BY created_at DESC 
LIMIT 10;
```

#### ❌ BAD: OR conditions on different columns
```sql
-- Cannot use indexes efficiently
SELECT * FROM sales_leads 
WHERE email = '...' OR phone = '...';
```

#### ✅ GOOD: Use UNION or separate queries
```sql
-- Uses indexes for both conditions
SELECT * FROM sales_leads WHERE email = '...'
UNION
SELECT * FROM sales_leads WHERE phone = '...';
```

#### ❌ BAD: Functions on indexed columns
```sql
-- Cannot use index on created_at
SELECT * FROM skin_analyses 
WHERE DATE(created_at) = '2024-11-10';
```

#### ✅ GOOD: Range queries preserve index usage
```sql
-- Uses index effectively
SELECT * FROM skin_analyses 
WHERE created_at >= '2024-11-10'::timestamp 
  AND created_at < '2024-11-11'::timestamp;
```

### 3.2 JSONB Query Optimization

#### ❌ BAD: Extract then compare (can't use GIN index)
```sql
SELECT * FROM skin_analyses 
WHERE (ai_severity->>'spots')::int > 5;
```

#### ✅ GOOD: Use JSONB operators (can use GIN index)
```sql
-- Uses GIN index if available
SELECT * FROM skin_analyses 
WHERE ai_severity @> '{"spots": {"severity": 5}}';

-- Or use jsonb_path_query for complex conditions
SELECT * FROM skin_analyses 
WHERE jsonb_path_exists(ai_severity, '$.spots.severity ? (@ > 5)');
```

---

## 4. Monitoring and Alerts

### 4.1 Key Metrics to Monitor

**Table Size Growth:**
```sql
-- Track weekly growth rate
CREATE TABLE table_size_history (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  table_size_bytes BIGINT NOT NULL,
  index_size_bytes BIGINT NOT NULL,
  row_count BIGINT NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Weekly snapshot job
INSERT INTO table_size_history (table_name, table_size_bytes, index_size_bytes, row_count)
SELECT 
  tablename,
  pg_relation_size(schemaname||'.'||tablename),
  pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename),
  n_live_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

**Query Performance:**
```sql
-- Enable pg_stat_statements (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Monitor slow queries (> 1s)
SELECT 
  LEFT(query, 100) AS query,
  calls,
  ROUND(mean_exec_time::numeric, 2) AS avg_ms,
  ROUND(max_exec_time::numeric, 2) AS max_ms
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- 1 second
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### 4.2 Alert Thresholds

**Set up alerts for:**
- ⚠️ Table size > 10GB
- ⚠️ Dead tuples > 10% of live tuples
- ⚠️ Sequential scans > 1000/day on large tables
- ⚠️ Cache hit rate < 95%
- ⚠️ Query time P95 > 500ms
- 🔴 Table size > 50GB (urgent)
- 🔴 Dead tuples > 30% (urgent)
- 🔴 Cache hit rate < 90% (urgent)

---

## 5. Implementation Roadmap

### Phase 1: Immediate Actions (Week 1)

- [x] Complete index analysis (Task 3)
- [ ] Apply missing indexes from `20251110_add_missing_indexes.sql`
- [ ] Configure autovacuum tuning for large tables
- [ ] Set up monitoring queries and alerts
- [ ] Document current table sizes as baseline

**Commands:**
```bash
# Apply index migration
psql $DATABASE_URL -f supabase/migrations/20251110_add_missing_indexes.sql

# Run initial VACUUM ANALYZE
psql $DATABASE_URL -c "VACUUM ANALYZE skin_analyses;"
psql $DATABASE_URL -c "VACUUM ANALYZE sales_leads;"
psql $DATABASE_URL -c "VACUUM ANALYZE customer_notes;"

# Capture baseline metrics
psql $DATABASE_URL -f scripts/analyze-table-performance.sql > baseline_metrics.txt
```

### Phase 2: Partitioning Setup (Week 2-3)

- [ ] Create partitioned tables for `skin_analyses`
- [ ] Test data migration on staging environment
- [ ] Create automated partition creation script
- [ ] Implement partition rotation for `analytics_events`
- [ ] Update application code if needed (usually not required)

**Risk Mitigation:**
- Test on staging first
- Schedule during low-traffic hours
- Have rollback plan ready
- Monitor query performance after migration

### Phase 3: Advanced Optimization (Week 4)

- [ ] Implement materialized views for analytics
- [ ] Set up data archival process
- [ ] Configure pg_cron for automated maintenance
- [ ] Create performance regression tests
- [ ] Document query patterns and best practices

### Phase 4: Continuous Monitoring (Ongoing)

- [ ] Weekly review of slow query log
- [ ] Monthly review of table growth rates
- [ ] Quarterly REINDEX on large indexes
- [ ] Bi-annual partition strategy review
- [ ] Update documentation as needed

---

## 6. Expected Performance Improvements

### Before Optimization (Estimated)

| Query Type | Current Time |
|------------|--------------|
| Customer analysis history (1 year) | 2-5s |
| Sales dashboard (filtered) | 500-1000ms |
| Analytics aggregation | 5-10s |
| Full-text search | 1-3s |

### After Optimization (Target)

| Query Type | Target Time | Improvement |
|------------|-------------|-------------|
| Customer analysis history (1 year) | 200-500ms | **85-90%** |
| Sales dashboard (filtered) | 50-150ms | **70-85%** |
| Analytics aggregation | 500ms-1s | **85-90%** |
| Full-text search | 100-300ms | **85-90%** |

### Success Metrics

- ✅ P95 query latency < 500ms
- ✅ P99 query latency < 2s
- ✅ Cache hit rate > 99%
- ✅ No full table scans on tables > 100K rows
- ✅ VACUUM efficiency > 95%
- ✅ Index size < 50% of table size

---

## 7. Risk Assessment

### Low Risk ✅
- Adding indexes (IF NOT EXISTS used)
- Autovacuum tuning
- Monitoring setup
- VACUUM ANALYZE (non-blocking)

### Medium Risk ⚠️
- Table partitioning (requires testing)
- REINDEX CONCURRENTLY (long-running)
- Materialized view creation

### High Risk 🔴
- VACUUM FULL (locks table)
- Table rename/swap during migration
- Partition data migration (potential downtime)

**Mitigation Strategy:**
- All high-risk changes require staging testing
- Maintenance window notifications
- Rollback procedures documented
- Database backup before major changes

---

## 8. Supabase-Specific Considerations

### 8.1 Connection Pooler

Supabase uses PgBouncer for connection pooling:
- **Transaction mode:** Each query runs in separate transaction
- **Implication:** Cannot use session-level features (temp tables, prepared statements)
- **Solution:** Use direct connection for admin tasks

### 8.2 Resource Limits

Check your Supabase plan limits:
- **Free tier:** 500MB database size, limited connections
- **Pro tier:** 8GB database, more connections
- **Enterprise:** Custom limits

### 8.3 Extensions Available

```sql
-- Useful extensions for optimization
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;  -- Query statistics
CREATE EXTENSION IF NOT EXISTS pg_trgm;             -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS btree_gin;           -- Composite GIN indexes
-- CREATE EXTENSION IF NOT EXISTS pg_partman;       -- Automated partitioning (may not be available)
```

---

## 9. Team Training Checklist

### For Developers

- [ ] Understand query performance implications
- [ ] Learn to use EXPLAIN ANALYZE
- [ ] Know when to use JSONB vs relational columns
- [ ] Understand index usage patterns
- [ ] Review query optimization guidelines

### For DevOps

- [ ] Set up monitoring dashboards
- [ ] Configure alerting thresholds
- [ ] Schedule maintenance windows
- [ ] Document backup/restore procedures
- [ ] Create runbooks for common issues

### For Database Admins

- [ ] Master partition management
- [ ] Understand VACUUM strategies
- [ ] Know when to use REINDEX
- [ ] Monitor autovacuum effectiveness
- [ ] Review slow query logs weekly

---

## 10. Next Steps After Task 4

**Immediate:**
1. Apply index migration
2. Configure autovacuum tuning
3. Set up monitoring

**This Week:**
4. Test partitioning on staging
5. Implement archival process
6. Document query patterns

**Next Week:**
7. Complete Task 5: Fix RLS Policies ⚠️ CRITICAL
8. Complete Task 6: Backup Testing

**Phase 4 Completion:**
- All optimizations implemented
- Monitoring in place
- Performance targets met
- Documentation complete

---

**Document Owner:** Database Optimization Team  
**Last Updated:** November 10, 2025  
**Next Review:** November 17, 2025 (After Phase 4 completion)

