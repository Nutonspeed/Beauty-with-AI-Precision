-- RLS Policy Verification Script
-- ตรวจสอบ Row Level Security policies ใน production

-- 1. Check RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- 2. Check all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check critical tables have RLS policies
SELECT 
  'users' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'users'
  AND schemaname = 'public'

UNION ALL

SELECT 
  'skin_analyses' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'skin_analyses'
  AND schemaname = 'public'

UNION ALL

SELECT 
  'sales_leads' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'sales_leads'
  AND schemaname = 'public'

UNION ALL

SELECT 
  'sales_proposals' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'sales_proposals'
  AND schemaname = 'public'

UNION ALL

SELECT 
  'clinics' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'clinics'
  AND schemaname = 'public'

UNION ALL

SELECT 
  'appointments' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'appointments'
  AND schemaname = 'public'

ORDER BY table_name;

-- 4. Test RLS for multi-tenant isolation
-- สร้าง test query เพื่อตรวจสอบว่า users สามารถเห็นเฉพาะข้อมูลของตัวเอง
SELECT 
  'RLS Test: Users should only see their own data' as test_description,
  'Run this query with different user contexts to verify data isolation' as instruction;

-- 5. Check functions used in RLS policies
SELECT 
  proname as function_name,
  prosrc as source_code,
  pronargs as argument_count,
  proargtypes as argument_types
FROM pg_proc 
WHERE proname IN (
  'get_user_role',
  'get_user_clinic_id',
  'is_super_admin',
  'can_access_sales'
)
  AND pronamespace = 'public'::regnamespace
ORDER BY proname;
