-- Quick RLS Test
-- Run this in Supabase SQL Editor

-- 1. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('customers', 'sales_leads', 'sales_proposals', 'appointments')
ORDER BY tablename;

-- 2. Count total records by clinic
SELECT 
  c.name as clinic_name,
  COUNT(DISTINCT cu.id) as customers,
  COUNT(DISTINCT sl.id) as sales_leads,
  COUNT(DISTINCT sp.id) as sales_proposals,
  COUNT(DISTINCT a.id) as appointments
FROM clinics c
LEFT JOIN customers cu ON cu.clinic_id = c.id
LEFT JOIN sales_leads sl ON sl.clinic_id = c.id
LEFT JOIN sales_proposals sp ON sp.clinic_id = c.id
LEFT JOIN appointments a ON a.clinic_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- 3. Test RLS - Switch to different user context to test
-- (You'll need to run this with different user tokens in the UI)

-- As a regular user, you should only see your clinic's data:
-- SELECT COUNT(*) FROM customers; -- Should show only your clinic's customers
