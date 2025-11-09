-- 🗄️ Apply User Management Migration to Supabase Production
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/editor

-- Step 1: Check if tables already exist
SELECT EXISTS (
  SELECT FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename = 'invitations'
) AS invitations_exists,
EXISTS (
  SELECT FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename = 'user_activity_log'
) AS activity_log_exists;

-- Step 2: If tables don't exist, run the full migration file:
-- supabase/migrations/20250209000000_user_management_tables.sql

-- Step 3: Verify tables created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('invitations', 'user_activity_log')
ORDER BY table_name, ordinal_position;

-- Step 4: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('invitations', 'user_activity_log')
ORDER BY tablename, policyname;

-- Step 5: Test insert (as super_admin)
-- INSERT INTO user_activity_log (user_id, action, details)
-- VALUES (
--   auth.uid(),
--   'test_migration',
--   '{"message": "Migration applied successfully"}'::jsonb
-- );

-- SELECT * FROM user_activity_log WHERE action = 'test_migration';
