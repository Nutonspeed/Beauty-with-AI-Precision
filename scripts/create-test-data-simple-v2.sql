-- สร้างข้อมูลทดสอบแบบ Simple (รองรับ clinics.slug NOT NULL)
-- รันใน Supabase SQL Editor

-- Helper: slugify แบบง่าย (lowercase + แทนที่ช่องว่างเป็น -)
-- ถ้าตาราง clinics มี unique constraint ที่ slug ก็จะไม่ชนกันถ้า email ไม่ซ้ำ

-- 1. สร้างคลินิกทดสอบ
INSERT INTO clinics (name, slug, email, phone, address)
SELECT
  'Beauty Clinic Demo' as name,
  'beauty-clinic-demo' as slug,
  'demo@beautyclinic.com' as email,
  '02-123-4567' as phone,
  '123 ถนนสุขุมวิท กรุงเทพฯ' as address
WHERE NOT EXISTS (SELECT 1 FROM clinics WHERE email = 'demo@beautyclinic.com');

-- 2. สร้างลูกค้าทดสอบ
INSERT INTO customers (clinic_id, full_name, email, phone)
SELECT c.id, 'สมศรี ทดสอบ', 'customer@test.com', '089-876-5432'
FROM clinics c
WHERE c.email = 'demo@beautyclinic.com'
AND NOT EXISTS (SELECT 1 FROM customers WHERE email = 'customer@test.com');

-- 3. สร้างบริการทดสอบ
INSERT INTO services (clinic_id, name, description, duration_minutes, price)
SELECT c.id, 'ทรีทเมน์หน้าใส', 'ทรีทเมน์ดูแลผิวหน้าพิเศษ', 60, 1500.00
FROM clinics c
WHERE c.email = 'demo@beautyclinic.com'
AND NOT EXISTS (
  SELECT 1 FROM services s
  WHERE s.clinic_id = c.id AND s.name = 'ทรีทเมน์หน้าใส'
);

INSERT INTO services (clinic_id, name, description, duration_minutes, price)
SELECT c.id, 'ฟิลเลอร์ปากกระจับ', 'เพิ่มปริมาณริมฝีปาก', 30, 5000.00
FROM clinics c
WHERE c.email = 'demo@beautyclinic.com'
AND NOT EXISTS (
  SELECT 1 FROM services s
  WHERE s.clinic_id = c.id AND s.name = 'ฟิลเลอร์ปากกระจับ'
);

-- 4. สร้างพนักงานทดสอบ
INSERT INTO staff_members (clinic_id, role, name, email, phone)
SELECT c.id, 'doctor', 'พญ. แพทย์สาธิต', 'doctor@beautyclinic.com', '082-345-6789'
FROM clinics c
WHERE c.email = 'demo@beautyclinic.com'
AND NOT EXISTS (SELECT 1 FROM staff_members WHERE email = 'doctor@beautyclinic.com');

-- แสดงผลการสร้าง
SELECT
  'Test data created!' as result,
  (SELECT COUNT(*) FROM clinics WHERE email = 'demo@beautyclinic.com') as clinic_count,
  (SELECT COUNT(*) FROM customers WHERE email = 'customer@test.com') as customer_count,
  (SELECT COUNT(*) FROM services WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@beautyclinic.com')) as service_count,
  (SELECT COUNT(*) FROM staff_members WHERE email = 'doctor@beautyclinic.com') as staff_count;
