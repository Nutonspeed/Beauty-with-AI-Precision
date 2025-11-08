-- Fix customer user record
-- ใช้ตอนที่ UPDATE ไม่ได้ผล

-- Insert directly with TEXT column (bypass enum check)
INSERT INTO public.users (
  id,
  email,
  role,
  full_name,
  is_active,
  created_at,
  updated_at
) VALUES (
  '1276645e-3c17-4438-af1d-627937bb3382',
  'test-customer@beautyclinic.com',
  'customer',
  'Test Customer',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'customer',
  email = 'test-customer@beautyclinic.com',
  full_name = 'Test Customer',
  is_active = true,
  updated_at = NOW();

-- Verify
SELECT id, email, role, full_name, is_active 
FROM public.users 
WHERE email = 'test-customer@beautyclinic.com';
