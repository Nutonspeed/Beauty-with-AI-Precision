-- สร้างข้อมูลทดสอบแบบ Simple (ไม่ใช้ ON CONFLICT)
-- รันใน Supabase SQL Editor

-- 1. สร้างคลินิกทดสอบ
INSERT INTO clinics (name, email, phone, address)
SELECT 'Beauty Clinic Demo', 'demo@beautyclinic.com', '02-123-4567', '123 ถนนสุขุมวิท กรุงเทพฯ'
WHERE NOT EXISTS (SELECT 1 FROM clinics WHERE email = 'demo@beautyclinic.com');

-- 2. สร้างลูกค้าทดสอบ
INSERT INTO customers (clinic_id, full_name, email, phone)
SELECT c.id, 'สมศรี ทดสอบ', 'customer@test.com', '089-876-5432'
FROM clinics c 
WHERE c.email = 'demo@beautyclinic.com'
AND NOT EXISTS (SELECT 1 FROM customers WHERE email = 'customer@test.com');

-- 3. สร้างบริการทดสอบ
INSERT INTO services (clinic_id, name, description, duration, price)
SELECT c.id, 'ทรีทเมน์หน้าใส', 'ทรีทเมน์ดูแลผิวหน้าพิเศษ', 60, 1500.00
FROM clinics c WHERE c.email = 'demo@beautyclinic.com'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'ทรีทเมน์หน้าใส');

INSERT INTO services (clinic_id, name, description, duration, price)
SELECT c.id, 'ฟิลเลอร์ปากกระจับ', 'เพิ่มปริมาณริมฝีปาก', 30, 5000.00
FROM clinics c WHERE c.email = 'demo@beautyclinic.com'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'ฟิลเลอร์ปากกระจับ');

-- 4. สร้างพนักงานทดสอบ
INSERT INTO staff (clinic_id, full_name, email, phone, role)
SELECT c.id, 'พญ. แพทย์สาธิต', 'doctor@beautyclinic.com', '082-345-6789', 'doctor'
FROM clinics c WHERE c.email = 'demo@beautyclinic.com'
AND NOT EXISTS (SELECT 1 FROM staff WHERE email = 'doctor@beautyclinic.com');

-- แสดงผลการสร้าง
SELECT 'Test data created!' as result,
       (SELECT COUNT(*) FROM clinics WHERE email = 'demo@beautyclinic.com') as clinic_count,
       (SELECT COUNT(*) FROM customers WHERE email = 'customer@test.com') as customer_count,
       (SELECT COUNT(*) FROM services WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@beautyclinic.com')) as service_count,
       (SELECT COUNT(*) FROM staff WHERE email = 'doctor@beautyclinic.com') as staff_count;
