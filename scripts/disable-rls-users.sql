-- ปิด RLS บน users table ชั่วคราวเพื่อทดสอบ
-- Run this in Supabase SQL Editor

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Optional: Show current RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'users';
