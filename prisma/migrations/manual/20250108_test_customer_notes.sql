-- Test Customer Notes System
-- Run this AFTER running 20250108_customer_notes.sql

-- 1. Check if table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'customer_notes';

-- 2. Check columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'customer_notes'
ORDER BY ordinal_position;

-- 3. Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'customer_notes';

-- 4. Check RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'customer_notes';

-- 5. Check policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'customer_notes';

-- 6. Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'customer_notes';

-- 7. Insert test note (replace UUIDs with real ones from your database)
-- INSERT INTO customer_notes (
--   customer_id,
--   sales_staff_id, 
--   clinic_id,
--   content,
--   note_type,
--   tags,
--   created_by_name
-- ) VALUES (
--   'YOUR_CUSTOMER_ID',
--   'YOUR_SALES_STAFF_ID',
--   'YOUR_CLINIC_ID',
--   'ลูกค้าสนใจ Botox แบบ 50 units งบประมาณประมาณ 15,000 บาท',
--   'call',
--   ARRAY['ร้อนแรง', 'งบ-15k'],
--   'ทดสอบระบบ'
-- );

-- 8. Query test note
-- SELECT * FROM customer_notes ORDER BY created_at DESC LIMIT 5;
