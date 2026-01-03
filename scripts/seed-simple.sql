-- Simple seed script for test users
-- Run this directly in Supabase SQL Editor

-- Enable RLS and create test users
-- This script creates the minimal test data needed for E2E testing

-- Insert test clinic
INSERT INTO clinics (
  id, 
  name, 
  email, 
  phone, 
  address, 
  description,
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(),
  'Test Beauty Clinic',
  'clinic@test.com',
  '+6621234567',
  '123 Test Street, Bangkok',
  'Test clinic for E2E testing',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Get clinic ID
DO $$
DECLARE
  clinic_id UUID;
BEGIN
  SELECT id INTO clinic_id FROM clinics WHERE name = 'Test Beauty Clinic' LIMIT 1;
  
  -- Insert test users with basic profiles
  INSERT INTO users (
    id,
    email,
    role,
    clinic_id,
    created_at,
    updated_at
  ) VALUES 
    (
      gen_random_uuid(),
      'superadmin@test.com',
      'super_admin',
      NULL,
      NOW(),
      NOW()
    ),
    (
      gen_random_uuid(),
      'clinicowner@test.com',
      'clinic_owner',
      clinic_id,
      NOW(),
      NOW()
    ),
    (
      gen_random_uuid(),
      'sales@test.com',
      'sales_staff',
      clinic_id,
      NOW(),
      NOW()
    ),
    (
      gen_random_uuid(),
      'customer@test.com',
      'customer',
      clinic_id,
      NOW(),
      NOW()
    ),
    (
      gen_random_uuid(),
      'clinicadmin@test.com',
      'clinic_admin',
      clinic_id,
      NOW(),
      NOW()
    )
  ON CONFLICT (email) DO NOTHING;
  
  -- Insert user profiles
  INSERT INTO user_profiles (
    user_id,
    first_name,
    last_name,
    phone,
    created_at,
    updated_at
  )
  SELECT 
    u.id,
    CASE 
      WHEN u.email = 'superadmin@test.com' THEN 'Super'
      WHEN u.email = 'clinicowner@test.com' THEN 'Clinic'
      WHEN u.email = 'sales@test.com' THEN 'Sales'
      WHEN u.email = 'customer@test.com' THEN 'Test'
      WHEN u.email = 'clinicadmin@test.com' THEN 'Clinic'
    END,
    CASE 
      WHEN u.email = 'superadmin@test.com' THEN 'Admin'
      WHEN u.email = 'clinicowner@test.com' THEN 'Owner'
      WHEN u.email = 'sales@test.com' THEN 'Staff'
      WHEN u.email = 'customer@test.com' THEN 'Customer'
      WHEN u.email = 'clinicadmin@test.com' THEN 'Admin'
    END,
    CASE 
      WHEN u.email = 'superadmin@test.com' THEN '+6612345678'
      WHEN u.email = 'clinicowner@test.com' THEN '+6623456789'
      WHEN u.email = 'sales@test.com' THEN '+6634567890'
      WHEN u.email = 'customer@test.com' THEN '+6645678901'
      WHEN u.email = 'clinicadmin@test.com' THEN '+6656789012'
    END,
    NOW(),
    NOW()
  FROM users u 
  WHERE u.email IN (
    'superadmin@test.com',
    'clinicowner@test.com', 
    'sales@test.com',
    'customer@test.com',
    'clinicadmin@test.com'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert clinic staff assignments
  INSERT INTO clinic_staff (
    clinic_id,
    user_id,
    role,
    status,
    created_at,
    updated_at
  )
  SELECT 
    clinic_id,
    u.id,
    CASE 
      WHEN u.email = 'clinicowner@test.com' THEN 'owner'
      WHEN u.email = 'sales@test.com' THEN 'sales_staff'
      WHEN u.email = 'clinicadmin@test.com' THEN 'clinic_admin'
    END,
    'active',
    NOW(),
    NOW()
  FROM users u, clinics c
  WHERE u.email IN (
    'clinicowner@test.com', 
    'sales@test.com',
    'clinicadmin@test.com'
  )
  AND c.name = 'Test Beauty Clinic'
  ON CONFLICT (clinic_id, user_id) DO NOTHING;
  
  -- Insert customers
  INSERT INTO customers (
    clinic_id,
    user_id,
    status,
    created_at,
    updated_at
  )
  SELECT 
    clinic_id,
    u.id,
    'active',
    NOW(),
    NOW()
  FROM users u, clinics c
  WHERE u.email = 'customer@test.com'
  AND c.name = 'Test Beauty Clinic'
  ON CONFLICT (clinic_id, user_id) DO NOTHING;
  
  -- Insert sample services
  INSERT INTO clinic_services (
    clinic_id,
    name,
    description,
    price,
    duration,
    category,
    created_at,
    updated_at
  )
  SELECT 
    clinic_id,
    unnest(ARRAY['Skin Analysis', 'Botox Treatment', 'Chemical Peel']),
    unnest(ARRAY['AI-powered skin analysis and consultation', 'Anti-wrinkle botox injections', 'Professional chemical peel treatment']),
    unnest(ARRAY[1500, 8000, 3500]),
    unnest(ARRAY[60, 30, 45]),
    unnest(ARRAY['analysis', 'treatment', 'treatment']),
    NOW(),
    NOW()
  FROM clinics c
  WHERE c.name = 'Test Beauty Clinic'
  ON CONFLICT (clinic_id, name) DO NOTHING;
  
  -- Insert sample leads
  INSERT INTO sales_leads (
    clinic_id,
    sales_staff_id,
    first_name,
    last_name,
    email,
    phone,
    source,
    status,
    notes,
    created_at,
    updated_at
  )
  SELECT 
    clinic_id,
    u.id,
    unnest(ARRAY['John', 'Jane']),
    unnest(ARRAY['Doe', 'Smith']),
    unnest(ARRAY['john.doe@example.com', 'jane.smith@example.com']),
    unnest(ARRAY['+6612345678', '+6623456789']),
    unnest(ARRAY['website', 'referral']),
    unnest(ARRAY['new', 'contacted']),
    unnest(ARRAY['Interested in skin analysis', 'Referred by existing customer']),
    NOW(),
    NOW()
  FROM users u, clinics c
  WHERE u.email = 'sales@test.com'
  AND c.name = 'Test Beauty Clinic'
  ON CONFLICT (clinic_id, email) DO NOTHING;
  
  RAISE NOTICE 'Test data seeded successfully';
END $$;
