-- =====================================================
-- Check Existing Database Objects
-- =====================================================
-- Run this script BEFORE running the migration
-- to see what already exists in your database
-- =====================================================

-- 1. Check existing tables in public schema
SELECT 
  'Tables' as object_type,
  tablename as object_name
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check existing ENUM types
SELECT 
  'ENUM Types' as object_type,
  t.typname as object_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('user_role', 'analysis_tier')
GROUP BY t.typname
ORDER BY t.typname;

-- 3. Check existing indexes
SELECT 
  'Indexes' as object_type,
  indexname as object_name,
  tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. Check existing triggers
SELECT 
  'Triggers' as object_type,
  trigger_name as object_name,
  event_object_table as table_name,
  action_timing || ' ' || event_manipulation as trigger_event
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 5. Check existing functions
SELECT 
  'Functions' as object_type,
  proname as object_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND proname IN ('handle_new_user', 'update_updated_at', 'get_user_role', 'user_has_permission')
ORDER BY proname;

-- 6. Check RLS policies
SELECT 
  'RLS Policies' as object_type,
  schemaname,
  tablename,
  policyname as object_name,
  cmd as command
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'analysis_history')
ORDER BY tablename, policyname;

-- 7. Check if tables have RLS enabled
SELECT 
  'RLS Status' as object_type,
  tablename as object_name,
  CASE 
    WHEN relrowsecurity THEN 'ENABLED ✅'
    ELSE 'DISABLED ❌'
  END as rls_status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('users', 'analysis_history')
ORDER BY c.relname;

-- 8. Check users table structure (if exists)
SELECT 
  'Users Table Columns' as object_type,
  column_name as object_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 9. Check analysis_history table structure (if exists)
SELECT 
  'Analysis History Columns' as object_type,
  column_name as object_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'analysis_history'
ORDER BY ordinal_position;

-- 10. Summary Count
SELECT 
  'Summary' as section,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
  (SELECT COUNT(DISTINCT typname) FROM pg_type WHERE typname IN ('user_role', 'analysis_tier')) as total_enums,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as total_triggers,
  (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public') as total_functions;

-- =====================================================
-- INTERPRETATION GUIDE
-- =====================================================
-- 
-- If you see ZERO results in sections 1-6:
--   ✅ Your database is empty, safe to run full migration
--
-- If you see SOME results:
--   ⚠️  You have existing objects, check conflicts before migrating
--   
-- Common scenarios:
--   1. Tables exist but no ENUMs → Need to add ENUMs carefully
--   2. Tables exist but different structure → May need ALTER TABLE
--   3. All objects exist → Migration may fail, consider versioning
--
-- =====================================================
