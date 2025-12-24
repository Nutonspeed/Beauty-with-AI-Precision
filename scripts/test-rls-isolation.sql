-- Test RLS Isolation for Production
-- Run this script with different user contexts to verify data isolation

-- Test 1: Find existing users from different clinics
-- (Run as super_admin/service_role)

-- Find a user from Bangkok clinic
CREATE TEMPORARY VIEW test_user_bangkok AS
SELECT id, email, full_name, role, clinic_id
FROM public.users 
WHERE clinic_id IN (
  SELECT id FROM clinics 
  WHERE name ILIKE '%bangkok%' OR email ILIKE '%bangkok%'
)
LIMIT 1;

-- Find a user from another clinic (not Bangkok)
CREATE TEMPORARY VIEW test_user_other AS
SELECT id, email, full_name, role, clinic_id
FROM public.users 
WHERE clinic_id IN (
  SELECT id FROM clinics 
  WHERE name NOT ILIKE '%bangkok%' AND email NOT ILIKE '%bangkok%'
)
LIMIT 1;

-- Test 3: Verify isolation queries
-- (Run as user from test_user_bangkok view)

-- Should only see Bangkok clinic's customers
SELECT 'Customers visible to Bangkok staff' as test, COUNT(*) as count
FROM customers 
WHERE clinic_id = (SELECT clinic_id FROM test_user_bangkok);

-- Should NOT see other clinics' customers
SELECT 'Cross-clinic customers visible (should be 0)' as test, COUNT(*) as count
FROM customers 
WHERE clinic_id != (SELECT clinic_id FROM test_user_bangkok);

-- Test 4: Test sales leads isolation
-- (Run as user from test_user_bangkok)

-- Should only see own clinic's leads
SELECT 'Own clinic leads visible' as test, COUNT(*) as count
FROM sales_leads 
WHERE clinic_id = (SELECT clinic_id FROM test_user_bangkok);

-- Test 5: Test AI usage tracking (only if table exists)
-- (Run as user from test_user_bangkok after an AI analysis)
-- Note: Skip for now if ai_usage table doesn't exist

-- Test 6: Verify subscription limits (only if function exists)
-- (Run as user from test_user_bangkok)
-- Note: Skip for now if get_clinic_usage_stats function doesn't exist

-- Test 7: Test cross-clinic access attempt
-- (Run as user from test_user_bangkok)

-- This should return 0 rows if RLS is working
SELECT 'Cross-clinic data access test' as test, COUNT(*) as count
FROM (
  SELECT id FROM customers WHERE clinic_id != (SELECT clinic_id FROM test_user_bangkok)
  UNION ALL
  SELECT id FROM sales_leads WHERE clinic_id != (SELECT clinic_id FROM test_user_bangkok)
  UNION ALL
  SELECT id FROM appointments WHERE clinic_id != (SELECT clinic_id FROM test_user_bangkok)
) cross_clinic_data;

-- Summary: Show which users we're testing with
SELECT 'Bangkok test user' as test_user, email, clinic_id FROM test_user_bangkok
UNION ALL
SELECT 'Other clinic test user' as test_user, email, clinic_id FROM test_user_other;
