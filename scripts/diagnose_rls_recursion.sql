-- Diagnostic Script: Find ALL tables and policies causing infinite recursion
-- Run this in Supabase SQL Editor to identify the problem

-- Step 1: Check which tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;

-- Step 2: List ALL RLS policies on ALL tables
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,  -- SELECT, INSERT, UPDATE, DELETE, ALL
  qual, -- USING clause
  with_check  -- WITH CHECK clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Step 3: Find policies that might cause recursion (policies that query the same table)
SELECT 
  p.schemaname,
  p.tablename,
  p.policyname,
  p.cmd,
  p.qual AS using_clause,
  p.with_check
FROM pg_policies p
WHERE p.schemaname = 'public'
  -- Find policies where the USING clause mentions the same table name
  AND (
    p.qual ILIKE '%' || p.tablename || '%'
    OR p.with_check ILIKE '%' || p.tablename || '%'
  )
ORDER BY p.tablename, p.policyname;

-- Step 4: Check specifically for customer_notes policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual AS using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'customer_notes'
ORDER BY policyname;

-- Step 5: Check RLS status on specific tables
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'customer_notes', 'sales_leads', 'clinics')
ORDER BY tablename;
