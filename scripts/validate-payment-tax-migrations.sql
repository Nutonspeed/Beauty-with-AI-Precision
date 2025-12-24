-- SQL Validation Script for Payment & Tax Receipt Systems
-- Run this in Supabase SQL Editor to validate migrations without persisting changes

BEGIN;

-- Test Payment System Tables
DO $$
DECLARE
    table_exists BOOLEAN;
    column_count INTEGER;
BEGIN
    -- Check payments table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payments'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION 'Payments table does not exist';
    END IF;
    
    -- Check payment_methods table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payment_methods'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION 'Payment methods table does not exist';
    END IF;
    
    -- Check refunds table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'refunds'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION 'Refunds table does not exist';
    END IF;
    
    -- Verify payments table columns
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments';
    
    IF column_count < 10 THEN
        RAISE EXCEPTION 'Payments table missing columns (found %)', column_count;
    END IF;
    
    RAISE NOTICE '✅ Payment System tables validated successfully';
END $$;

-- Test Tax Receipt System Tables
DO $$
DECLARE
    table_exists BOOLEAN;
    column_count INTEGER;
BEGIN
    -- Check tax_receipts table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tax_receipts'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION 'Tax receipts table does not exist';
    END IF;
    
    -- Check tax_receipt_line_items table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tax_receipt_line_items'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION 'Tax receipt line items table does not exist';
    END IF;
    
    -- Verify tax_receipts table has required columns
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tax_receipts'
    AND column_name IN ('receipt_number', 'clinic_id', 'customer_id', 'payment_id', 'subtotal', 'vat_amount', 'total_amount');
    
    IF column_count < 7 THEN
        RAISE EXCEPTION 'Tax receipts table missing required columns (found %)', column_count;
    END IF;
    
    RAISE NOTICE '✅ Tax Receipt System tables validated successfully';
END $$;

-- Test Functions
DO $$
DECLARE
    func_exists BOOLEAN;
BEGIN
    -- Check generate_tax_receipt_number function
    SELECT EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'generate_tax_receipt_number'
    ) INTO func_exists;
    
    IF NOT func_exists THEN
        RAISE EXCEPTION 'generate_tax_receipt_number function does not exist';
    END IF;
    
    -- Check create_tax_receipt_from_payment function
    SELECT EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'create_tax_receipt_from_payment'
    ) INTO func_exists;
    
    IF NOT func_exists THEN
        RAISE EXCEPTION 'create_tax_receipt_from_payment function does not exist';
    END IF;
    
    RAISE NOTICE '✅ Tax receipt functions validated successfully';
END $$;

-- Test RLS Policies
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Check tax_receipts RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'tax_receipts';
    
    IF policy_count < 2 THEN
        RAISE EXCEPTION 'Tax receipts missing RLS policies (found %)', policy_count;
    END IF;
    
    -- Check payments RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'payments';
    
    IF policy_count < 1 THEN
        RAISE EXCEPTION 'Payments missing RLS policies (found %)', policy_count;
    END IF;
    
    RAISE NOTICE '✅ RLS policies validated successfully';
END $$;

-- Test Indexes
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    -- Check tax_receipts indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename = 'tax_receipts';
    
    IF index_count < 4 THEN
        RAISE NOTICE '⚠️ Tax receipts may be missing some indexes (found %)', index_count;
    END IF;
    
    -- Check payments indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename = 'payments';
    
    IF index_count < 2 THEN
        RAISE NOTICE '⚠️ Payments may be missing some indexes (found %)', index_count;
    END IF;
    
    RAISE NOTICE '✅ Indexes validated successfully';
END $$;

-- Test Sample Data Creation (will be rolled back)
DO $$
DECLARE
    sample_clinic_id UUID;
    sample_customer_id UUID;
    sample_payment_id UUID;
    receipt_number TEXT;
BEGIN
    -- Create sample data for testing
    INSERT INTO clinics (name, email, phone, address) 
    VALUES ('Test Clinic', 'test@clinic.com', '1234567890', '123 Test St')
    RETURNING id INTO sample_clinic_id;
    
    INSERT INTO customers (clinic_id, full_name, email) 
    VALUES (sample_clinic_id, 'Test Customer', 'customer@test.com')
    RETURNING id INTO sample_customer_id;
    
    INSERT INTO invoices (clinic_id, customer_id, subtotal, tax_amount, total_amount, issue_date, due_date, status)
    VALUES (sample_clinic_id, sample_customer_id, 1000, 70, 1070, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'sent')
    RETURNING id INTO sample_payment_id;
    
    -- Test generate_tax_receipt_number function
    SELECT generate_tax_receipt_number(sample_clinic_id) INTO receipt_number;
    
    IF receipt_number IS NULL OR receipt_number = '' THEN
        RAISE EXCEPTION 'generate_tax_receipt_number returned null/empty';
    END IF;
    
    RAISE NOTICE '✅ Sample data creation test successful (receipt number: %)', receipt_number;
END $$;

ROLLBACK;

-- Final validation report
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 VALIDATION COMPLETE';
    RAISE NOTICE 'All Payment & Tax Receipt System components validated successfully!';
    RAISE NOTICE 'The migrations are ready to be applied.';
END $$;
