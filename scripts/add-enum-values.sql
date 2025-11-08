-- เพิ่มค่า customer, clinic_staff, super_admin ใน enum user_role
-- รันใน Supabase SQL Editor

-- เช็คว่า enum มีค่าอะไรบ้าง
SELECT enumlabel 
FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE pg_type.typname = 'user_role'
ORDER BY enumsortorder;

-- เพิ่มค่าใหม่
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'clinic_staff';  
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- เช็คอีกครั้ง
SELECT enumlabel 
FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE pg_type.typname = 'user_role'
ORDER BY enumsortorder;
