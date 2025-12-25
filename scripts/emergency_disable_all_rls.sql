-- Emergency RLS Disable: Turn off RLS on ALL public tables to isolate the issue
-- WARNING: This removes security - only use temporarily for debugging!
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    tbl_name text;
BEGIN
    -- Loop through all tables in public schema and disable RLS
    FOR tbl_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
          AND rowsecurity = true  -- Only tables with RLS enabled
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl_name);
        RAISE NOTICE 'Disabled RLS on table: %', tbl_name;
    END LOOP;
END $$;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity AS rls_still_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;

-- If the above query returns NO rows, RLS is successfully disabled on all tables
