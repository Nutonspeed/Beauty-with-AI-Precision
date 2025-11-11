-- ============================================================================
-- Database Table Performance Analysis Script
-- ============================================================================
-- Purpose: Analyze table sizes, index usage, and query performance
-- Date: 2025-11-10
-- Phase: Phase 4 - Task 4 (Optimize Large Tables)
-- ============================================================================

-- ============================================================================
-- SECTION 1: Table Size Analysis
-- ============================================================================

-- 1.1 List all tables by total size (table + indexes + toast)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes,
  (SELECT count(*) FROM information_schema.columns WHERE table_schema = schemaname AND table_name = tablename) AS column_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- ============================================================================
-- SECTION 2: Row Count Analysis
-- ============================================================================

-- 2.1 Estimated row counts for all tables
SELECT 
  schemaname,
  tablename,
  n_live_tup AS estimated_rows,
  n_dead_tup AS dead_rows,
  CASE 
    WHEN n_live_tup > 0 
    THEN ROUND((n_dead_tup::numeric / n_live_tup::numeric) * 100, 2)
    ELSE 0 
  END AS dead_row_percentage,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ============================================================================
-- SECTION 3: Index Usage Analysis
-- ============================================================================

-- 3.1 Unused indexes (candidates for removal)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan AS scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  pg_relation_size(indexrelid) AS size_bytes
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- 3.2 Most used indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan AS scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan > 0
ORDER BY idx_scan DESC
LIMIT 20;

-- 3.3 Index hit rate (should be > 95%)
SELECT 
  schemaname,
  tablename,
  indexname,
  CASE 
    WHEN (idx_blks_hit + idx_blks_read) > 0
    THEN ROUND((idx_blks_hit::numeric / (idx_blks_hit + idx_blks_read)::numeric) * 100, 2)
    ELSE 0
  END AS index_hit_rate_percent
FROM pg_statio_user_indexes
WHERE schemaname = 'public'
ORDER BY index_hit_rate_percent ASC;

-- ============================================================================
-- SECTION 4: Table Bloat Analysis
-- ============================================================================

-- 4.1 Check for table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  n_dead_tup AS dead_tuples,
  CASE 
    WHEN n_live_tup > 0 
    THEN ROUND((n_dead_tup::numeric / n_live_tup::numeric) * 100, 2)
    ELSE 0 
  END AS bloat_percentage,
  CASE
    WHEN n_dead_tup > 10000 AND (n_dead_tup::numeric / NULLIF(n_live_tup, 0)::numeric) > 0.1 
    THEN '🔴 HIGH - Run VACUUM FULL'
    WHEN n_dead_tup > 5000 AND (n_dead_tup::numeric / NULLIF(n_live_tup, 0)::numeric) > 0.05
    THEN '🟡 MEDIUM - Run VACUUM'
    ELSE '✅ OK'
  END AS bloat_status,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_dead_tup > 100
ORDER BY n_dead_tup DESC;

-- ============================================================================
-- SECTION 5: Sequential Scans (Full Table Scans)
-- ============================================================================

-- 5.1 Tables with high sequential scans (may need indexes)
SELECT 
  schemaname,
  tablename,
  seq_scan AS sequential_scans,
  seq_tup_read AS rows_read,
  idx_scan AS index_scans,
  n_live_tup AS estimated_rows,
  CASE 
    WHEN seq_scan > 0 AND idx_scan > 0
    THEN ROUND((seq_scan::numeric / (seq_scan + idx_scan)::numeric) * 100, 2)
    WHEN seq_scan > 0
    THEN 100.00
    ELSE 0
  END AS seq_scan_percentage,
  CASE
    WHEN seq_scan > 1000 AND idx_scan < seq_scan AND n_live_tup > 10000
    THEN '🔴 HIGH - Add indexes'
    WHEN seq_scan > 500 AND idx_scan < seq_scan AND n_live_tup > 5000
    THEN '🟡 MEDIUM - Review queries'
    ELSE '✅ OK'
  END AS recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
ORDER BY seq_scan DESC
LIMIT 20;

-- ============================================================================
-- SECTION 6: Cache Hit Ratios
-- ============================================================================

-- 6.1 Overall cache hit ratio (should be > 99%)
SELECT 
  'Overall Cache Hit Rate' AS metric,
  ROUND(
    (sum(heap_blks_hit) / NULLIF((sum(heap_blks_hit) + sum(heap_blks_read)), 0)::numeric) * 100, 
    2
  ) AS percentage,
  CASE
    WHEN (sum(heap_blks_hit) / NULLIF((sum(heap_blks_hit) + sum(heap_blks_read)), 0)::numeric) * 100 >= 99
    THEN '✅ Excellent'
    WHEN (sum(heap_blks_hit) / NULLIF((sum(heap_blks_hit) + sum(heap_blks_read)), 0)::numeric) * 100 >= 95
    THEN '🟡 Good - Can improve'
    ELSE '🔴 Poor - Needs optimization'
  END AS status
FROM pg_statio_user_tables;

-- 6.2 Per-table cache hit ratio
SELECT 
  schemaname,
  tablename,
  heap_blks_hit AS cache_hits,
  heap_blks_read AS disk_reads,
  CASE 
    WHEN (heap_blks_hit + heap_blks_read) > 0
    THEN ROUND((heap_blks_hit::numeric / (heap_blks_hit + heap_blks_read)::numeric) * 100, 2)
    ELSE 100
  END AS cache_hit_rate_percent,
  CASE
    WHEN (heap_blks_hit + heap_blks_read) > 0 
      AND (heap_blks_hit::numeric / (heap_blks_hit + heap_blks_read)::numeric) * 100 < 95
    THEN '🔴 LOW - Review access patterns'
    ELSE '✅ OK'
  END AS status
FROM pg_statio_user_tables
WHERE schemaname = 'public'
  AND (heap_blks_hit + heap_blks_read) > 0
ORDER BY cache_hit_rate_percent ASC
LIMIT 20;

-- ============================================================================
-- SECTION 7: JSONB Column Analysis
-- ============================================================================

-- 7.1 Tables with JSONB columns (candidates for GIN indexes)
SELECT 
  t.table_schema,
  t.table_name,
  c.column_name,
  c.data_type,
  (SELECT count(*) 
   FROM pg_indexes i 
   WHERE i.tablename = t.table_name 
     AND i.indexdef LIKE '%USING gin%'
     AND i.indexdef LIKE '%' || c.column_name || '%'
  ) AS has_gin_index
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND c.data_type = 'jsonb'
ORDER BY t.table_name, c.column_name;

-- ============================================================================
-- SECTION 8: Query Performance Statistics (if pg_stat_statements enabled)
-- ============================================================================

-- 8.1 Slowest queries by total time
-- Note: Requires pg_stat_statements extension
-- SELECT 
--   LEFT(query, 100) AS query_preview,
--   calls,
--   ROUND(total_exec_time::numeric, 2) AS total_time_ms,
--   ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
--   ROUND(max_exec_time::numeric, 2) AS max_time_ms,
--   ROUND((total_exec_time / sum(total_exec_time) OVER ()) * 100, 2) AS pct_total_time
-- FROM pg_stat_statements
-- WHERE query NOT LIKE '%pg_stat_statements%'
-- ORDER BY total_exec_time DESC
-- LIMIT 20;

-- ============================================================================
-- SECTION 9: Partitioning Candidates
-- ============================================================================

-- 9.1 Large tables that could benefit from partitioning
SELECT 
  schemaname,
  tablename,
  n_live_tup AS estimated_rows,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  seq_scan AS sequential_scans,
  idx_scan AS index_scans,
  CASE
    WHEN n_live_tup > 10000000 -- 10M rows
    THEN '🔴 CRITICAL - Partition immediately'
    WHEN n_live_tup > 1000000 -- 1M rows
    THEN '🟡 HIGH - Consider partitioning'
    WHEN n_live_tup > 100000 -- 100K rows
    THEN '🟢 MEDIUM - Monitor growth'
    ELSE '✅ OK'
  END AS partition_recommendation,
  -- Check if table has date columns for time-based partitioning
  (SELECT string_agg(column_name, ', ')
   FROM information_schema.columns
   WHERE table_schema = schemaname
     AND table_name = tablename
     AND (data_type LIKE '%timestamp%' OR data_type = 'date')
  ) AS date_columns
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_live_tup > 50000
ORDER BY n_live_tup DESC;

-- ============================================================================
-- SECTION 10: Autovacuum Configuration Check
-- ============================================================================

-- 10.1 Current autovacuum settings
SELECT 
  name,
  setting,
  unit,
  short_desc
FROM pg_settings
WHERE name LIKE 'autovacuum%'
ORDER BY name;

-- ============================================================================
-- SECTION 11: Recommendations Summary
-- ============================================================================

-- 11.1 Generate optimization recommendations
WITH table_stats AS (
  SELECT 
    schemaname,
    tablename,
    n_live_tup,
    n_dead_tup,
    seq_scan,
    idx_scan,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
)
SELECT 
  tablename,
  pg_size_pretty(size_bytes) AS table_size,
  n_live_tup AS rows,
  ARRAY_AGG(DISTINCT
    CASE
      WHEN n_dead_tup > 10000 AND (n_dead_tup::numeric / NULLIF(n_live_tup, 0)) > 0.1
        THEN 'Run VACUUM FULL'
      WHEN n_dead_tup > 5000 AND (n_dead_tup::numeric / NULLIF(n_live_tup, 0)) > 0.05
        THEN 'Run VACUUM'
      WHEN seq_scan > 1000 AND idx_scan < seq_scan AND n_live_tup > 10000
        THEN 'Add missing indexes'
      WHEN n_live_tup > 1000000
        THEN 'Consider table partitioning'
      WHEN size_bytes > 1073741824 -- 1GB
        THEN 'Monitor growth rate'
      ELSE NULL
    END
  ) FILTER (WHERE 
    (n_dead_tup > 5000) OR 
    (seq_scan > 500 AND idx_scan < seq_scan) OR 
    (n_live_tup > 1000000) OR
    (size_bytes > 1073741824)
  ) AS recommendations
FROM table_stats
WHERE 
  n_dead_tup > 5000 OR 
  (seq_scan > 500 AND idx_scan < seq_scan) OR 
  n_live_tup > 1000000 OR
  size_bytes > 1073741824
GROUP BY tablename, size_bytes, n_live_tup, n_dead_tup, seq_scan, idx_scan
ORDER BY size_bytes DESC;

-- ============================================================================
-- SECTION 12: Specific Table Analysis - skin_analyses
-- ============================================================================

-- 12.1 Detailed analysis for skin_analyses table
SELECT 
  'skin_analyses' AS table_name,
  (SELECT count(*) FROM skin_analyses) AS exact_row_count,
  pg_size_pretty(pg_total_relation_size('skin_analyses')) AS total_size,
  pg_size_pretty(pg_relation_size('skin_analyses')) AS table_size,
  pg_size_pretty(pg_total_relation_size('skin_analyses') - pg_relation_size('skin_analyses')) AS indexes_size,
  (SELECT count(*) FROM pg_indexes WHERE tablename = 'skin_analyses') AS index_count,
  (SELECT n_dead_tup FROM pg_stat_user_tables WHERE tablename = 'skin_analyses') AS dead_tuples;

-- 12.2 Column size breakdown for skin_analyses
SELECT 
  attname AS column_name,
  pg_size_pretty(sum(pg_column_size(attname::text))::bigint) AS column_size
FROM pg_stats
WHERE tablename = 'skin_analyses'
  AND schemaname = 'public'
GROUP BY attname
ORDER BY sum(pg_column_size(attname::text)) DESC;

-- ============================================================================
-- EXECUTION NOTES
-- ============================================================================
-- 
-- To run this analysis:
-- 1. psql $DATABASE_URL -f scripts/analyze-table-performance.sql > analysis_report.txt
-- 2. Review the report for optimization opportunities
-- 3. Implement recommendations based on priority
--
-- Expected insights:
-- - Tables needing VACUUM
-- - Unused indexes to remove
-- - Missing indexes to add
-- - Partitioning candidates
-- - Cache hit ratios
-- - Query performance bottlenecks
--
-- ============================================================================
