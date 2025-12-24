-- Production Readiness Verification Script
-- For 5 clinics with multi-tenant isolation

-- 1. Check if critical tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'clinics', 'users', 'customers', 'appointments', 
        'sales_leads', 'sales_proposals', 'sales_activities',
        'skin_analyses', 'booking_payments', 'ai_usage'
    )
ORDER BY tablename;

-- 2. Verify RLS policies exist for key tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN (
        'clinics', 'users', 'customers', 'appointments', 
        'sales_leads', 'sales_proposals', 'sales_activities',
        'skin_analyses', 'booking_payments', 'ai_usage'
    )
ORDER BY tablename, policyname;

-- 3. Check if helper functions exist
SELECT 
    proname AS function_name,
    prorettype::regtype AS return_type,
    prosecdef AS security_definer
FROM pg_proc 
WHERE proname IN ('is_super_admin', 'get_user_clinic_id', 'get_user_role')
    AND pronamespace = 'public'::regnamespace;

-- 4. Verify AI usage tracking is set up
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_usage' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check subscription plans and AI limits
SELECT 
    id,
    name,
    price,
    ai_requests_per_day,
    features
FROM pricing_plans 
ORDER BY price;

-- 6. Verify database indexes for production queries
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN (
        'users', 'customers', 'appointments', 'sales_leads', 
        'sales_proposals', 'skin_analyses', 'ai_usage'
    )
    AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;

-- 7. Test cross-clinic data isolation (run as super_admin)
-- This should return 0 if RLS is working correctly
-- (Uncomment and run with different user contexts)
/*
-- Test: Users can only see their own clinic's data
SELECT COUNT(*) as cross_clinic_data_leak
FROM customers 
WHERE clinic_id != (SELECT clinic_id FROM users WHERE id = auth.uid());

-- Test: Sales leads are isolated
SELECT COUNT(*) as cross_clinic_leads
FROM sales_leads 
WHERE clinic_id != (SELECT clinic_id FROM users WHERE id = auth.uid());
*/

-- 8. Check for missing clinic_id in critical tables
SELECT 
    'customers' as table_name,
    COUNT(*) as total_rows,
    COUNT(clinic_id) as rows_with_clinic_id,
    COUNT(*) - COUNT(clinic_id) as missing_clinic_id
FROM customers
UNION ALL
SELECT 
    'sales_leads' as table_name,
    COUNT(*) as total_rows,
    COUNT(clinic_id) as rows_with_clinic_id,
    COUNT(*) - COUNT(clinic_id) as missing_clinic_id
FROM sales_leads
UNION ALL
SELECT 
    'sales_proposals' as table_name,
    COUNT(*) as total_rows,
    COUNT(clinic_id) as rows_with_clinic_id,
    COUNT(*) - COUNT(clinic_id) as missing_clinic_id
FROM sales_proposals
UNION ALL
SELECT 
    'skin_analyses' as table_name,
    COUNT(*) as total_rows,
    COUNT(clinic_id) as rows_with_clinic_id,
    COUNT(*) - COUNT(clinic_id) as missing_clinic_id
FROM skin_analyses;

-- 9. Verify RPC functions for AI rate limiting exist
SELECT 
    proname,
    prorettype::regtype,
    prosecdef
FROM pg_proc 
WHERE proname IN ('check_ai_usage_limit', 'log_ai_usage')
    AND pronamespace = 'public'::regnamespace;

-- 10. Check email configuration for invitations
SELECT 
    'smtp_settings' as config_type,
    COUNT(*) as configured
FROM pg_settings 
WHERE name LIKE '%smtp%';

-- Summary query for production readiness
SELECT 
    'Production Readiness Check' as status,
    NOW() as checked_at;
