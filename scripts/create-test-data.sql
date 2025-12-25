-- สร้างข้อมูลทดสอบสำหรับ Beauty AI Precision
-- รันใน Supabase SQL Editor

-- 1. สร้างคลินิกทดสอบ
INSERT INTO clinics (
    name, 
    email, 
    phone, 
    address, 
    province, 
    postal_code,
    tax_id,
    branch_code
) VALUES (
    'Beauty Clinic Demo',
    'demo@beautyclinic.com',
    '02-123-4567',
    '123 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตห้วยขวาง กรุงเทพฯ 10310',
    'กรุงเทพมหานคร',
    '10310',
    '1234567890123',
    '00001'
) ON CONFLICT (email) DO NOTHING;

-- 2. สร้างผู้ใช้ทดสอบ (clinic_owner)
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    phone,
    raw_user_meta_data,
    created_at
) VALUES (
    gen_random_uuid(),
    'owner@beautyclinic.com',
    NOW(),
    '081-234-5678',
    '{"role": "clinic_owner", "full_name": "คลินิกเจ้าของ"}',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 3. สร้างผู้ใช้ใน public.users
INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    clinic_id,
    created_at
) 
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'role',
    c.id,
    NOW()
FROM auth.users au
JOIN clinics c ON c.email = 'demo@beautyclinic.com'
WHERE au.email = 'owner@beautyclinic.com'
ON CONFLICT (email) DO NOTHING;

-- 4. สร้างลูกค้าทดสอบ
INSERT INTO customers (
    clinic_id,
    full_name,
    email,
    phone,
    line_id,
    birth_date,
    gender,
    address,
    created_at
) 
SELECT 
    c.id,
    'สมศรี ทดสอบ',
    'customer@test.com',
    '089-876-5432',
    'test_customer',
    '1990-01-01',
    'female',
    '456 ถนนพระราม 4 กรุงเทพฯ',
    NOW()
FROM clinics c 
WHERE c.email = 'demo@beautyclinic.com'
ON CONFLICT (email) DO NOTHING;

-- 5. สร้างบริการทดสอบ
INSERT INTO services (
    clinic_id,
    name,
    description,
    category,
    duration,
    price,
    created_at
) 
SELECT 
    c.id,
    'ทรีทเมน์หน้าใส',
    'ทรีทเมน์ดูแลผิวหน้าพิเศษ ช่วยลดสิวและให้ผิวกระจ่างใส',
    'facial',
    60,
    1500.00,
    NOW()
FROM clinics c 
WHERE c.email = 'demo@beautyclinic.com'
ON CONFLICT DO NOTHING;

INSERT INTO services (
    clinic_id,
    name,
    description,
    category,
    duration,
    price,
    created_at
) 
SELECT 
    c.id,
    'ฟิลเลอร์ปากกระจับ',
    'เพิ่มปริมาณริมฝีปากให้ดูสวยงามอิ่มเต็ม',
    'injectable',
    30,
    5000.00,
    NOW()
FROM clinics c 
WHERE c.email = 'demo@beautyclinic.com'
ON CONFLICT DO NOTHING;

-- 6. สร้างพนักงานทดสอบ
INSERT INTO staff (
    clinic_id,
    full_name,
    email,
    phone,
    role,
    specialties,
    license_number,
    created_at
) 
SELECT 
    c.id,
    'พญ. แพทย์สาธิต',
    'doctor@beautyclinic.com',
    '082-345-6789',
    'doctor',
    array['facial', 'injectable'],
    'MD12345',
    NOW()
FROM clinics c 
WHERE c.email = 'demo@beautyclinic.com'
ON CONFLICT (email) DO NOTHING;

-- 7. สร้างช่วงเวลาทำงาน
INSERT INTO staff_availability (
    staff_id,
    day_of_week,
    start_time,
    end_time,
    is_available
)
SELECT 
    s.id,
    1, -- จันทร์
    '09:00',
    '18:00',
    true
FROM staff s
WHERE s.email = 'doctor@beautyclinic.com'
ON CONFLICT DO NOTHING;

INSERT INTO staff_availability (
    staff_id,
    day_of_week,
    start_time,
    end_time,
    is_available
)
SELECT 
    s.id,
    2, -- อังคาร
    '09:00',
    '18:00',
    true
FROM staff s
WHERE s.email = 'doctor@beautyclinic.com'
ON CONFLICT DO NOTHING;

-- 8. สร้างวันหยุด
INSERT INTO clinic_holidays (
    clinic_id,
    date,
    name,
    is_recurring
)
SELECT 
    c.id,
    CURRENT_DATE + INTERVAL '7 days', -- สัปดาห์หน้า
    'วันหยุดทดสอบ',
    false
FROM clinics c 
WHERE c.email = 'demo@beautyclinic.com'
ON CONFLICT DO NOTHING;

-- แสดงผลการสร้าง
SELECT 'Test data created successfully!' as result;
