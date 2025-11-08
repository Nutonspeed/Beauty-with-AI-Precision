-- =====================================================
-- Verification Script: Customer Notes Migration
-- =====================================================
-- Run this BEFORE running the actual migration
-- to check for any conflicts or issues
-- =====================================================

-- 1. Check if customer_notes table already exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'customer_notes'
    ) THEN '⚠️  WARNING: customer_notes table already exists'
    ELSE '✅ OK: customer_notes table does not exist yet'
  END AS table_check;

-- 2. Check if there are any existing policies on customer_notes
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'customer_notes'
    ) THEN '⚠️  WARNING: Policies exist on customer_notes table'
    ELSE '✅ OK: No policies exist yet'
  END AS policy_check;

-- 3. List existing policies if any (to see what needs to be dropped)
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  LEFT(qual::text, 100) as policy_definition
FROM pg_policies 
WHERE tablename = 'customer_notes'
ORDER BY policyname;

-- 4. Check if referenced tables exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
    THEN '✅ OK: auth.users table exists'
    ELSE '❌ ERROR: auth.users table does NOT exist (required for foreign key)'
  END AS auth_users_check;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clinics')
    THEN '✅ OK: public.clinics table exists'
    ELSE '⚠️  WARNING: public.clinics table does NOT exist (will make clinic_id nullable)'
  END AS clinics_check;

-- 5. Check if sales_staff_id column structure matches auth.users
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND column_name = 'id';

-- 6. Check current RLS status on related tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname IN ('public', 'auth')
AND tablename IN ('users', 'clinics', 'skin_analyses')
ORDER BY tablename;

-- 7. Check for any existing infinite recursion issues in users table policies
SELECT 
  policyname,
  LEFT(qual::text, 200) as policy_using_clause,
  CASE 
    WHEN qual::text LIKE '%SELECT%users%' THEN '⚠️  WARNING: Policy contains SELECT on users table (potential recursion)'
    ELSE '✅ OK: No recursion detected'
  END as recursion_check
FROM pg_policies 
WHERE tablename = 'users'
AND schemaname = 'public';

-- 8. Check text search configuration availability
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'english')
    THEN '✅ OK: Text search configuration available'
    ELSE '❌ ERROR: Text search configuration NOT available'
  END AS text_search_check;

-- 9. Verify gen_random_uuid() function exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'gen_random_uuid')
    THEN '✅ OK: gen_random_uuid() function available'
    ELSE '❌ ERROR: gen_random_uuid() function NOT available (need pgcrypto extension)'
  END AS uuid_function_check;

-- 10. Check storage bucket (if needed)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'customer-attachments')
    THEN '✅ OK: Storage bucket exists'
    ELSE 'ℹ️  INFO: Storage bucket does not exist (will be created if needed)'
  END AS storage_check;

-- =====================================================
-- Summary
-- =====================================================
-- After running this script, review the results:
-- - All ✅ OK: Safe to proceed with migration
-- - Any ⚠️  WARNING: Review and fix before proceeding
-- - Any ❌ ERROR: Must fix before running migration
-- =====================================================

-- 11. Final compatibility check
SELECT 
  '=== MIGRATION COMPATIBILITY REPORT ===' as report_header;

SELECT 
  'Total Issues Found: ' || COUNT(*) as summary
FROM (
  -- Check for blockers
  SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
  UNION ALL
  SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'gen_random_uuid')
  UNION ALL
  SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'english')
) issues;

-- 12. Show what will be created
SELECT 
  '=== MIGRATION WILL CREATE ===' as creation_plan;

SELECT 'Table: customer_notes' as item UNION ALL
SELECT 'Indexes: 8 total' UNION ALL
SELECT 'RLS Policies: 4 total' UNION ALL
SELECT 'Trigger: update_customer_notes_updated_at' UNION ALL
SELECT 'Function: update_customer_notes_updated_at' UNION ALL
SELECT 'Text Search: Content indexing';

-- =====================================================
-- RECOMMENDATION
-- =====================================================
-- If you see the infinite recursion warning on users table,
-- run this fix FIRST before creating customer_notes:
--
-- DROP POLICY IF EXISTS "Sales staff can view notes from their clinic" ON public.users;
-- DROP POLICY IF EXISTS "Clinic admin can view their clinic staff" ON public.users;
--
-- Then recreate those policies WITHOUT subqueries on users table
-- =====================================================
