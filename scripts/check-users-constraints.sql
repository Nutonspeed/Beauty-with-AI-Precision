-- ตรวจสอบ constraints และ triggers ของ users table

-- 1. Check constraints
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public' AND rel.relname = 'users';

-- 2. Check triggers  
SELECT 
  tgname AS trigger_name,
  tgtype AS trigger_type,
  proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'users' AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 3. Check column type
SELECT 
  column_name,
  data_type,
  udt_name,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name = 'role';
