-- ===================================
-- MIGRATION VERIFICATION SCRIPT
-- สคริปต์ตรวจสอบว่า Migration สำเร็จหรือไม่
-- ===================================

-- 1. นับตารางทั้งหมดที่สร้างใหม่
SELECT 
  'Total New Tables Created' as check_type,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE ANY(ARRAY[
  'queue_%', 
  'appointment%', 
  'generated_reports', 
  'report_schedules',
  'analytics_events',
  'chat_%', 
  'branch_%',
  'marketing_%',
  'promo_%',
  'campaign_%',
  'customer_segments',
  'loyalty_%',
  'points_%',
  'inventory_%',
  'treatment_%'
]);

-- 2. รายชื่อตารางทั้งหมดที่สร้าง (เรียงตาม batch)
SELECT 
  CASE 
    WHEN table_name LIKE 'queue_%' THEN 'Batch 1: Queue'
    WHEN table_name LIKE 'appointment%' THEN 'Batch 1: Appointment'
    WHEN table_name IN ('generated_reports', 'report_schedules', 'analytics_events') THEN 'Batch 1: Reports'
    WHEN table_name LIKE 'chat_%' THEN 'Batch 2: Chat'
    WHEN table_name LIKE 'branch_%' THEN 'Batch 2: Branch'
    WHEN table_name LIKE 'marketing_%' OR table_name LIKE 'promo_%' OR table_name LIKE 'campaign_%' OR table_name = 'customer_segments' THEN 'Batch 3: Marketing'
    WHEN table_name LIKE 'loyalty_%' OR table_name LIKE 'points_%' THEN 'Batch 3: Loyalty'
    WHEN table_name LIKE 'inventory_%' THEN 'Batch 4: Inventory'
    WHEN table_name LIKE 'treatment_%' THEN 'Batch 4: Treatment'
  END as batch_system,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE ANY(ARRAY[
  'queue_%', 
  'appointment%', 
  'generated_reports', 
  'report_schedules',
  'analytics_events',
  'chat_%', 
  'branch_%',
  'marketing_%',
  'promo_%',
  'campaign_%',
  'customer_segments',
  'loyalty_%',
  'points_%',
  'inventory_%',
  'treatment_%'
])
ORDER BY batch_system, table_name;

-- 3. นับตารางแยกตาม Batch
SELECT 
  'Batch 1: Queue + Appointments + Reports' as batch,
  COUNT(*) as tables_created,
  12 as expected
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
  table_name LIKE 'queue_%' OR 
  table_name LIKE 'appointment%' OR 
  table_name IN ('generated_reports', 'report_schedules', 'analytics_events', 'availability_slots')
)

UNION ALL

SELECT 
  'Batch 2: Chat + Branch',
  COUNT(*),
  11
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'chat_%' OR table_name LIKE 'branch_%')

UNION ALL

SELECT 
  'Batch 3: Marketing + Loyalty',
  COUNT(*),
  12
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
  table_name LIKE 'marketing_%' OR 
  table_name LIKE 'promo_%' OR 
  table_name LIKE 'campaign_%' OR 
  table_name = 'customer_segments' OR
  table_name LIKE 'loyalty_%' OR 
  table_name LIKE 'points_%'
)

UNION ALL

SELECT 
  'Batch 4: Inventory + Treatment',
  COUNT(*),
  12
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'inventory_%' OR table_name LIKE 'treatment_%');

-- 4. ตรวจสอบ RLS เปิดหรือไม่
SELECT 
  'Tables with RLS ENABLED' as check_type,
  COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
AND tablename LIKE ANY(ARRAY[
  'queue_%', 
  'appointment%', 
  'generated_reports', 
  'report_schedules',
  'analytics_events',
  'chat_%', 
  'branch_%',
  'marketing_%',
  'promo_%',
  'campaign_%',
  'customer_segments',
  'loyalty_%',
  'points_%',
  'inventory_%',
  'treatment_%'
]);

-- 5. ตรวจสอบว่ามีตาราง inventory เก่าหรือไม่ (ควรถูกลบแล้ว)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'inventory'
      AND table_name NOT LIKE 'inventory_%'
    ) THEN '⚠️ WARNING: Old inventory table still exists'
    ELSE '✅ OK: Old inventory table dropped successfully'
  END as inventory_check;

-- 6. ตรวจสอบ Default Data
SELECT 
  'Loyalty Tiers (should be 4)' as check_type,
  COUNT(*) as count
FROM loyalty_tiers;

SELECT 
  'Inventory Categories (should be 5)' as check_type,
  COUNT(*) as count
FROM inventory_categories;

-- 7. ตรวจสอบว่าไม่มีคำว่า "patient" ในชื่อ column
SELECT 
  table_name,
  column_name,
  '❌ FOUND PATIENT COLUMN!' as warning
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
  column_name LIKE '%patient%' OR
  column_name LIKE '%ผู้ป่วย%'
)
AND table_name LIKE ANY(ARRAY[
  'queue_%', 
  'appointment%', 
  'chat_%', 
  'branch_%',
  'marketing_%',
  'promo_%',
  'campaign_%',
  'loyalty_%',
  'points_%',
  'inventory_%',
  'treatment_%'
]);

-- 8. สรุปผลรวม
SELECT 
  '=== MIGRATION SUMMARY ===' as summary,
  '' as value
UNION ALL
SELECT 
  'Expected Total Tables:',
  '47 tables'
UNION ALL
SELECT 
  'Batch 1 (Queue + Appointments + Reports):',
  '12 tables'
UNION ALL
SELECT 
  'Batch 2 (Chat + Branch):',
  '11 tables'
UNION ALL
SELECT 
  'Batch 3 (Marketing + Loyalty):',
  '12 tables'
UNION ALL
SELECT 
  'Batch 4 (Inventory + Treatment):',
  '12 tables'
UNION ALL
SELECT 
  'All tables should have RLS enabled',
  'Check above'
UNION ALL
SELECT 
  'No "patient" columns allowed',
  'Check above';
