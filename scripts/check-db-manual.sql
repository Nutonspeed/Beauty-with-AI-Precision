-- ============================================
-- SUPABASE DATABASE INSPECTION QUERIES
-- คัดลอกคำสั่งเหล่านี้ไปรันใน Supabase SQL Editor
-- https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/sql/new
-- ============================================

-- 1️⃣ เช็คตารางทั้งหมดใน public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2️⃣ เช็คว่า users table มีหรือไม่ และมีกี่ rows
SELECT 
  'users' as table_name,
  COUNT(*) as total_rows,
  COUNT(DISTINCT clinic_id) as unique_clinic_ids,
  COUNT(CASE WHEN clinic_id IS NOT NULL THEN 1 END) as rows_with_clinic_id
FROM users;

-- 3️⃣ เช็ค clinic_id ทั้งหมดที่อยู่ใน users table
SELECT 
  clinic_id,
  COUNT(*) as user_count
FROM users
WHERE clinic_id IS NOT NULL
GROUP BY clinic_id
ORDER BY user_count DESC;

-- 4️⃣ เช็คว่า clinics table มีหรือไม่
SELECT 
  COUNT(*) as clinics_count,
  COALESCE(MAX(created_at), NOW()) as last_created
FROM clinics;

-- 5️⃣ เช็ค columns ใน users table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 6️⃣ เช็ค foreign keys ที่มีอยู่ใน users table
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'users' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- 7️⃣ เช็คว่าตารางที่ต้องการสร้างมีอยู่แล้วหรือไม่
SELECT 
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename = t.table_name 
        AND rowsecurity = true
    ) THEN 'RLS Enabled'
    ELSE 'RLS Disabled'
  END as rls_status
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_name IN ('users', 'clinics', 'customers', 'bookings', 'services', 'user_preferences')
ORDER BY t.table_name;

-- 8️⃣ ดูข้อมูล sample จาก users เพื่อเข้าใจปัญหา clinic_id
SELECT 
  id,
  email,
  clinic_id,
  created_at,
  updated_at
FROM users
WHERE clinic_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 9️⃣ เช็คว่ามี clinic_id ที่ไม่อยู่ใน clinics table หรือไม่ (orphaned references)
-- ⚠️ ถ้า clinics table ยังไม่มี query นี้จะ error ให้ข้ามไป
SELECT 
  u.clinic_id,
  COUNT(*) as user_count,
  'ORPHANED - clinic does not exist' as status
FROM users u
WHERE u.clinic_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM clinics c WHERE c.id = u.clinic_id
  )
GROUP BY u.clinic_id;

-- 🔟 เช็ค indexes ที่มีอยู่
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'clinics', 'customers', 'bookings', 'services', 'user_preferences')
ORDER BY tablename, indexname;
