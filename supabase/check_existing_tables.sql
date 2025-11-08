-- =====================================================
-- Check Existing Tables and Objects in Supabase
-- =====================================================
-- Run this script to see what already exists before migration
-- =====================================================

-- 1. Check existing tables in public schema
SELECT 
  tablename as table_name,
  schemaname as schema_name
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check existing ENUM types
SELECT 
  t.typname as enum_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('user_role', 'analysis_tier')
GROUP BY t.typname
ORDER BY t.typname;

-- 3. Check if users table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Check if analysis_history table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'analysis_history'
ORDER BY ordinal_position;

-- 5. Check existing indexes on users table
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- 6. Check existing RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY policyname;

-- 7. Check existing RLS policies on analysis_history table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'analysis_history'
ORDER BY policyname;

-- 8. Check existing triggers
SELECT 
  trigger_name,
  event_manipulation as event,
  event_object_table as table_name,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('users', 'analysis_history')
ORDER BY event_object_table, trigger_name;

-- 9. Check existing functions related to users
SELECT 
  routine_name as function_name,
  routine_type as type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'update_updated_at', 'get_user_role', 'user_has_permission')
ORDER BY routine_name;

-- 10. Summary - Quick Check
SELECT 
  'Tables' as object_type,
  COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'analysis_history')

UNION ALL

SELECT 
  'Enums' as object_type,
  COUNT(*) as count
FROM pg_type
WHERE typname IN ('user_role', 'analysis_tier')

UNION ALL

SELECT 
  'Functions' as object_type,
  COUNT(*) as count
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'update_updated_at', 'get_user_role', 'user_has_permission')

UNION ALL

SELECT 
  'Triggers' as object_type,
  COUNT(*) as count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('users', 'analysis_history');

-- =====================================================
-- Expected Results (After Migration):
-- =====================================================
-- Tables: 2 (users, analysis_history)
-- Enums: 2 (user_role, analysis_tier)
-- Functions: 4 (handle_new_user, update_updated_at, get_user_role, user_has_permission)
-- Triggers: 2 (on_auth_user_created, update_users_updated_at)
-- =====================================================
