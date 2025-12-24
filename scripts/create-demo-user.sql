-- Create Demo User for B2B Presentations
-- This script creates the demo user with known credentials
-- Run after seeding demo data

-- Create demo user in Supabase Auth
-- Note: This needs to be run via Supabase Dashboard or using service role key

-- For Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Create new user with email: demo@cliniciq.com
-- 3. Set temporary password: demo123
-- 4. Mark email as verified
-- 5. Assign to demo clinic created by seed script

-- Alternative: Using SQL with service role
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Create auth user (requires service role)
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        phone,
        phone_confirmed_at,
        sign_up_method,
        created_at,
        updated_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'demo@cliniciq.com',
        crypt('demo123', gen_salt('bf')),
        NOW(),
        NULL,
        NULL,
        'email',
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Demo Admin"}',
        false,
        NULL,
        NULL,
        NULL
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Get the created user ID
    SELECT id INTO demo_user_id 
    FROM auth.users 
    WHERE email = 'demo@cliniciq.com';
    
    -- Update public.users table with auth user ID
    UPDATE public.users 
    SET id = demo_user_id 
    WHERE email = 'demo@cliniciq.com';
    
    RAISE NOTICE 'Demo user created successfully!';
    RAISE NOTICE 'Email: demo@cliniciq.com';
    RAISE NOTICE 'Password: demo123';
    RAISE NOTICE 'User ID: %', demo_user_id;
END $$;
