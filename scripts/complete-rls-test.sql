-- Complete RLS Test for Production
-- Run this in Supabase SQL Editor (as service_role)

-- =====================================================
-- STEP 1: Verify RLS is ENABLED on all critical tables
-- =====================================================
SELECT 
  'RLS Status' as test_type,
  tablename as table_name,
  CASE 
    WHEN rowsecurity THEN 'ENABLED ✓'
    ELSE 'DISABLED ✗'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('customers', 'sales_leads', 'sales_proposals', 'appointments', 'skin_analyses', 'treatment_records')
ORDER BY tablename;

-- =====================================================
-- STEP 2: Count data by clinic (as super_admin)
-- =====================================================
SELECT 
  'Data Distribution' as test_type,
  c.name as clinic_name,
  c.id as clinic_id,
  COUNT(DISTINCT cu.id) as customers,
  COUNT(DISTINCT sl.id) as sales_leads,
  COUNT(DISTINCT sp.id) as sales_proposals,
  COUNT(DISTINCT a.id) as appointments,
  COUNT(DISTINCT sa.id) as skin_analyses
FROM clinics c
LEFT JOIN customers cu ON cu.clinic_id = c.id
LEFT JOIN sales_leads sl ON sl.clinic_id = c.id
LEFT JOIN sales_proposals sp ON sp.clinic_id = c.id
LEFT JOIN appointments a ON a.clinic_id = c.id
LEFT JOIN skin_analyses sa ON sa.clinic_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- =====================================================
-- STEP 3: Test RLS Policies Exist
-- =====================================================
SELECT 
  'RLS Policies' as test_type,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('customers', 'sales_leads', 'sales_proposals', 'appointments', 'skin_analyses')
ORDER BY tablename, policyname;

-- =====================================================
-- STEP 4: Test Functions Exist
-- =====================================================
SELECT 
  'Functions' as test_type,
  proname as function_name,
  pronargs as num_args
FROM pg_proc 
WHERE proname IN ('is_super_admin', 'get_user_clinic_id', 'get_user_role')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- =====================================================
-- STEP 5: AI Usage Table Check
-- =====================================================
SELECT 
  'AI Usage' as test_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_usage') THEN 'EXISTS ✓'
    ELSE 'MISSING ✗'
  END as status;

-- =====================================================
-- STEP 6: Indexes for Performance
-- =====================================================
SELECT 
  'Indexes' as test_type,
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('customers', 'sales_leads', 'sales_proposals', 'appointments')
  AND (indexname LIKE '%clinic%' OR indexname LIKE '%rls%')
ORDER BY tablename, indexname;

-- =====================================================
-- INSTRUCTIONS FOR MANUAL TESTING:
-- =====================================================
/*
To complete testing, you need to:

1. Switch to a regular user context (not service_role):
   - In Supabase Dashboard: Authentication → Users → Copy JWT token
   - Or use the API with a user's token

2. Run these queries as a regular user:

   -- Should show ONLY your clinic's data
   SELECT 'My Clinic Customers' as test, COUNT(*) as count FROM customers;
   
   -- Should return 0 (no access to other clinics)
   SELECT 'Cross-Clinic Access' as test, COUNT(*) as count 
   FROM (
     SELECT id FROM customers WHERE clinic_id != (SELECT clinic_id FROM users WHERE id = auth.uid())
     UNION ALL
     SELECT id FROM sales_leads WHERE clinic_id != (SELECT clinic_id FROM users WHERE id = auth.uid())
   ) cross_clinic;

3. Expected Results:
   - RLS Status: All tables should show 'ENABLED ✓'
   - Cross-Clinic Access: Must return 0
   - Each clinic sees only its own data

*/
