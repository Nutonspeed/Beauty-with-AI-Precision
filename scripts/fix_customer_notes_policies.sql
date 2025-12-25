-- =====================================================
-- Fix Script: Drop Old RLS Policies for Customer Notes
-- =====================================================
-- Run this FIRST to remove any existing bad policies
-- that are causing infinite recursion errors
-- =====================================================

-- Drop all existing customer_notes policies (if table exists)
DO $$ 
BEGIN
  -- Drop customer_notes policies
  DROP POLICY IF EXISTS "Sales staff can view notes from their clinic" ON public.customer_notes;
  DROP POLICY IF EXISTS "Sales staff can view their own notes" ON public.customer_notes;
  DROP POLICY IF EXISTS "Sales staff can create notes" ON public.customer_notes;
  DROP POLICY IF EXISTS "Sales staff can update their own notes" ON public.customer_notes;
  DROP POLICY IF EXISTS "Sales staff can delete their own notes" ON public.customer_notes;
  DROP POLICY IF EXISTS "Clinic admin can view all clinic notes" ON public.customer_notes;
  
  RAISE NOTICE '✅ Dropped all old customer_notes policies';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'ℹ️  customer_notes table does not exist yet - no policies to drop';
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Error dropping policies: %', SQLERRM;
END $$;

-- =====================================================
-- Verification: Check if policies were dropped
-- =====================================================
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'customer_notes';
  
  IF policy_count = 0 THEN
    RAISE NOTICE '✅ All policies successfully removed';
  ELSE
    RAISE NOTICE '⚠️  Still have % policies remaining', policy_count;
  END IF;
END $$;

-- Show remaining policies (should be empty)
SELECT 
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'customer_notes';
