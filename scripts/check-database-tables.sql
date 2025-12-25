-- Check if required tables exist in the database
-- Run this in Supabase SQL Editor

-- Check Payment System Tables
SELECT 
    table_name,
    table_type,
    'Payment System' as system_group
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'payment_methods', 'refunds', 'invoices', 'invoice_line_items')
ORDER BY table_name;

-- Check Tax Receipt System Tables  
SELECT 
    table_name,
    table_type,
    'Tax Receipt System' as system_group
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tax_receipts', 'tax_receipt_line_items')
ORDER BY table_name;

-- Check Core Tables
SELECT 
    table_name,
    table_type,
    'Core System' as system_group
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clinics', 'customers', 'appointments', 'users')
ORDER BY table_name;

-- Check Functions
SELECT 
    routine_name,
    routine_type,
    'Functions' as system_group
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%tax_receipt%' OR routine_name LIKE '%invoice%'
ORDER BY routine_name;

-- Check RLS Policies
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
WHERE tablename IN ('payments', 'tax_receipts', 'invoices', 'customers')
ORDER BY tablename, policyname;
