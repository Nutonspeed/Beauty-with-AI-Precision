-- Database Health Check Script
-- ใช้สำหรับตรวจสอบสุขภาพของ database ใน production

-- 1. Quick Health Check
SELECT check_database_health();

-- 2. Detailed Foreign Key Check
SELECT 
  tc.table_name,
  COUNT(*) as fk_count
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
GROUP BY tc.table_name
ORDER BY fk_count DESC;

-- 3. Orphaned Records Check
SELECT 
  'skin_analyses orphaned' as check_name,
  COUNT(*) as count
FROM skin_analyses sa
LEFT JOIN users u ON sa.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'sales_leads orphaned' as check_name,
  COUNT(*) as count
FROM sales_leads sl
LEFT JOIN users u ON sl.customer_user_id = u.id
WHERE sl.customer_user_id IS NOT NULL AND u.id IS NULL

UNION ALL

SELECT 
  'appointments orphaned' as check_name,
  COUNT(*) as count
FROM appointments a
LEFT JOIN users u ON a.customer_id = u.id
WHERE u.id IS NULL;

-- 4. Duplicate Invitations Check
SELECT 
  email,
  clinic_id,
  COUNT(*) as duplicate_count
FROM invitations
WHERE status = 'pending' AND expires_at > NOW()
GROUP BY email, clinic_id
HAVING COUNT(*) > 1;

-- 5. Invalid User References
SELECT 
  'users with invalid clinic_id' as check_name,
  COUNT(*) as count
FROM users u
WHERE u.clinic_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM clinics c WHERE c.id = u.clinic_id);

-- 6. Index Usage Statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  CASE 
    WHEN idx_scan = 0 THEN 'unused'
    WHEN idx_scan < 100 THEN 'rarely_used'
    ELSE 'actively_used'
  END as usage_status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;

-- 7. Table Sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- 8. RLS Policy Check
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'clinics', 'skin_analyses', 
                    'sales_leads', 'invitations', 'appointments')
ORDER BY tablename;

-- 9. Recent Activity
SELECT 
  'users' as table_name,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d
FROM users

UNION ALL

SELECT 
  'skin_analyses' as table_name,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d
FROM skin_analyses

UNION ALL

SELECT 
  'sales_leads' as table_name,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d
FROM sales_leads

UNION ALL

SELECT 
  'invitations' as table_name,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d
FROM invitations;
