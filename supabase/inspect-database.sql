-- =====================================================
-- Database Inspection Script
-- =====================================================
-- Run this in Supabase SQL Editor to see all existing tables and their structures
-- https://bgejeqqngzvuokdffadu.supabase.co/project/_/sql
-- =====================================================

-- 1️⃣ List ALL tables in public schema
SELECT 
  tablename as "Table Name",
  schemaname as "Schema"
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- =====================================================

-- 2️⃣ Count total tables
SELECT COUNT(*) as "Total Tables in Public Schema"
FROM pg_tables 
WHERE schemaname = 'public';

-- =====================================================

-- 3️⃣ Show detailed structure of EACH table
-- (Column names, data types, nullable, defaults)

SELECT 
  table_name as "Table",
  column_name as "Column",
  data_type as "Type",
  is_nullable as "Nullable",
  column_default as "Default"
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =====================================================

-- 4️⃣ Check for ENUM types
SELECT 
  t.typname as "ENUM Name",
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as "Values"
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- =====================================================

-- 5️⃣ Check Row Level Security (RLS) status
SELECT 
  schemaname as "Schema",
  tablename as "Table",
  CASE 
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as "RLS Status"
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================

-- 6️⃣ List all RLS Policies
SELECT 
  schemaname as "Schema",
  tablename as "Table",
  policyname as "Policy Name",
  cmd as "Command",
  CASE 
    WHEN roles = '{public}' THEN 'Public'
    ELSE array_to_string(roles, ', ')
  END as "Roles"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================

-- 7️⃣ Check all Triggers
SELECT 
  trigger_name as "Trigger",
  event_object_table as "Table",
  event_manipulation as "Event",
  action_statement as "Action"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================

-- 8️⃣ List all Functions
SELECT 
  routine_name as "Function Name",
  routine_type as "Type",
  data_type as "Returns"
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- =====================================================

-- 9️⃣ Check Indexes
SELECT 
  schemaname as "Schema",
  tablename as "Table",
  indexname as "Index Name",
  indexdef as "Definition"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================

-- 🔟 Check Foreign Key Relationships
SELECT
  tc.table_name as "Table", 
  kcu.column_name as "Column",
  ccu.table_name AS "References Table",
  ccu.column_name AS "References Column"
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 📊 SUMMARY FOR MIGRATION DECISION
-- =====================================================

-- Check if critical tables for our migration exist:
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') 
    THEN '✅ EXISTS'
    ELSE '❌ NOT EXISTS'
  END as "users table",
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analysis_history') 
    THEN '✅ EXISTS'
    ELSE '❌ NOT EXISTS'
  END as "analysis_history table",
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') 
    THEN '✅ EXISTS'
    ELSE '❌ NOT EXISTS'
  END as "user_role ENUM",
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'analysis_tier') 
    THEN '✅ EXISTS'
    ELSE '❌ NOT EXISTS'
  END as "analysis_tier ENUM";

-- =====================================================
-- 📝 INTERPRETATION GUIDE
-- =====================================================
/*

🔍 What to look for:

1. If "users" table EXISTS:
   - Check its columns (Query #3)
   - See if it has: id, email, role, tier, full_name, etc.
   - Check if it matches our migration needs

2. If "analysis_history" table EXISTS:
   - Check its columns
   - See if it has: id, user_id, analysis_type, image_url, results

3. If ENUM types EXIST (user_role, analysis_tier):
   - Check their values match our needs
   - public, free_user, premium_customer, etc.

4. For OTHER tables (not users/analysis_history):
   - These might be from previous migrations or other features
   - Don't delete unless you're sure they're not needed
   - Our migration will NOT affect them

✅ SAFE TO RUN MIGRATION IF:
   - "users" table does NOT exist, OR
   - "users" table exists but structure is different

⚠️ REVIEW CAREFULLY IF:
   - "users" table exists with same structure
   - You might need to modify migration to UPDATE instead of CREATE

📌 RECOMMENDATION:
   After reviewing results, we can:
   1. Run full migration if tables don't exist
   2. Create a modified migration to add missing columns
   3. Skip migration if everything already exists correctly

*/
