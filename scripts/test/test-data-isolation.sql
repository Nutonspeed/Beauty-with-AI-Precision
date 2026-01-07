-- Multi-tenant Data Isolation Test
-- ทดสอบว่าข้อมูลแยกกันระหว่างคลินิกถูกต้อง

-- 1. สร้าง test users สำหรับคลินิกต่างๆ
-- (รันใน Supabase SQL Editor ด้วย service role)

-- สร้างคลินิกทดสอบ (ถ้ายังไม่มี)
INSERT INTO clinics (id, name, slug, email, phone, address, status, created_at, updated_at)
VALUES 
  ('test-clinic-1', 'Test Clinic 1', 'test-clinic-1', 'clinic1@test.com', '123-456', 'Address 1', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO clinics (id, name, slug, email, phone, address, status, created_at, updated_at)
VALUES 
  ('test-clinic-2', 'Test Clinic 2', 'test-clinic-2', 'clinic2@test.com', '789-012', 'Address 2', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. สร้าง users สำหรับทดสอบ
-- User 1 - สังกัด clinic 1
INSERT INTO users (id, email, role, clinic_id, created_at, updated_at)
VALUES 
  ('test-user-1', 'user1@test.com', 'clinic_owner', 'test-clinic-1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- User 2 - สังกัด clinic 2
INSERT INTO users (id, email, role, clinic_id, created_at, updated_at)
VALUES 
  ('test-user-2', 'user2@test.com', 'clinic_owner', 'test-clinic-2', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. สร้างข้อมูล skin_analyses สำหรับแต่ละคลินิก
INSERT INTO skin_analyses (id, user_id, clinic_id, analysis_data, created_at, updated_at)
VALUES 
  ('analysis-1', 'test-user-1', 'test-clinic-1', '{"test": "data1"}', NOW(), NOW()),
  ('analysis-2', 'test-user-1', 'test-clinic-1', '{"test": "data2"}', NOW(), NOW()),
  ('analysis-3', 'test-user-2', 'test-clinic-2', '{"test": "data3"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. สร้างข้อมูล sales_leads สำหรับแต่ละคลินิก
INSERT INTO sales_leads (id, customer_user_id, clinic_id, status, data, created_at, updated_at)
VALUES 
  ('lead-1', 'test-user-1', 'test-clinic-1', '{"status": "new"}', '{"test": "lead1"}', NOW(), NOW()),
  ('lead-2', 'test-user-2', 'test-clinic-2', '{"status": "new"}', '{"test": "lead2"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. ทดสอด RLS Policies
-- ให้รัน query ต่อไปนี้โดย login เป็น test-user-1 และ test-user-2 ตามลำดับ

-- Query สำหรับตรวจสอบว่า user เห็นเฉพาะข้อมูลของคลินิกตัวเอง
SELECT 
  'skin_analyses visible to user' as test_type,
  COUNT(*) as record_count,
  STRING_AGG(DISTINCT clinic_id::text, ', ') as visible_clinics
FROM skin_analyses
WHERE user_id = auth.uid();

-- Query สำหรับตรวจสอบ sales leads
SELECT 
  'sales_leads visible to user' as test_type,
  COUNT(*) as record_count,
  STRING_AGG(DISTINCT clinic_id::text, ', ') as visible_clinics
FROM sales_leads
WHERE clinic_id = (
  SELECT clinic_id FROM users WHERE id = auth.uid()
);

-- 6. ตรวจสอบว่าไม่สามารถเข้าถึงข้อมูลคลินิกอื่นได้
-- (ควจะ return 0 rows ถ้า RLS ทำงานถูกต้อง)
SELECT 
  'should_not_see_other_clinic_data' as test_type,
  COUNT(*) as leaked_records
FROM skin_analyses
WHERE clinic_id != (
  SELECT clinic_id FROM users WHERE id = auth.uid()
);

-- 7. Cleanup test data (รันหลังทดสอบเสร็จ)
-- DELETE FROM skin_analyses WHERE user_id IN ('test-user-1', 'test-user-2');
-- DELETE FROM sales_leads WHERE customer_user_id IN ('test-user-1', 'test-user-2');
-- DELETE FROM users WHERE id IN ('test-user-1', 'test-user-2');
-- DELETE FROM clinics WHERE id IN ('test-clinic-1', 'test-clinic-2');
