-- Demo Environment Seed Script
-- Creates realistic sample data for B2B sales demonstrations
-- Run with: psql -h localhost -U postgres -d beauty_with_ai_precision -f scripts/seed-demo-data.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create demo clinic
INSERT INTO public.clinics (
    id,
    name,
    name_th,
    email,
    phone,
    address,
    province,
    postal_code,
    tax_id,
    license_number,
    status,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Bangkok Beauty Clinic',
    'คลินิกความงามกรุงเทพ',
    'demo@cliniciq.com',
    '+66 2 123 4567',
    '123 Sukhumvit Road, Bangkok',
    'Bangkok',
    '10110',
    '1234567890123',
    'CLN-2024-001',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Get demo clinic ID
DO $$
DECLARE
    demo_clinic_id UUID;
BEGIN
    SELECT id INTO demo_clinic_id FROM public.clinics WHERE email = 'demo@cliniciq.com';
    
    -- Create demo subscription (Professional plan)
    INSERT INTO public.subscriptions (
        id,
        clinic_id,
        plan_id,
        status,
        start_date,
        end_date,
        created_at,
        updated_at
    ) VALUES (
        uuid_generate_v4(),
        demo_clinic_id,
        (SELECT id FROM public.pricing_plans WHERE name = 'Professional'),
        'active',
        NOW() - INTERVAL '30 days',
        NOW() + INTERVAL '335 days',
        NOW(),
        NOW()
    ) ON CONFLICT (clinic_id) DO NOTHING;
    
    -- Create demo users
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        clinic_id,
        phone,
        status,
        created_at,
        updated_at
    ) VALUES 
    (
        uuid_generate_v4(),
        'demo@cliniciq.com',
        'Demo Admin',
        'clinic_owner',
        demo_clinic_id,
        '+66 81 234 5678',
        'active',
        NOW(),
        NOW()
    ),
    (
        uuid_generate_v4(),
        'staff.demo@cliniciq.com',
        'Demo Staff',
        'clinic_staff',
        demo_clinic_id,
        '+66 82 345 6789',
        'active',
        NOW(),
        NOW()
    ),
    (
        uuid_generate_v4(),
        'sales.demo@cliniciq.com',
        'Demo Sales',
        'sales_staff',
        demo_clinic_id,
        '+66 83 456 7890',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Create demo customers
    INSERT INTO public.customers (
        id,
        clinic_id,
        name,
        email,
        phone,
        date_of_birth,
        gender,
        address,
        city,
        postal_code,
        notes,
        created_at,
        updated_at
    ) VALUES 
    (
        uuid_generate_v4(),
        demo_clinic_id,
        'สมศรี ใจดี',
        'somsri@example.com',
        '+66 81 111 2222',
        '1990-05-15',
        'female',
        '456 Silom Road',
        'Bangkok',
        '10500',
        'Regular customer, prefers facial treatments',
        NOW(),
        NOW()
    ),
    (
        uuid_generate_v4(),
        demo_clinic_id,
        'วิชัย รักสวย',
        'wichai@example.com',
        '+66 82 333 4444',
        '1985-08-20',
        'male',
        '789 Siam Square',
        'Bangkok',
        '10330',
        'Interested in anti-aging treatments',
        NOW(),
        NOW()
    ),
    (
        uuid_generate_v4(),
        demo_clinic_id,
        'มานี สุขใจ',
        'manee@example.com',
        '+66 83 555 6666',
        '1992-12-10',
        'female',
        '321 Thonglor Road',
        'Bangkok',
        '10110',
        'Sensitive skin, needs gentle treatments',
        NOW(),
        NOW()
    ) ON CONFLICT DO NOTHING;
    
    -- Create demo appointments
    INSERT INTO public.appointments (
        id,
        clinic_id,
        customer_id,
        staff_id,
        date,
        time,
        duration,
        status,
        treatment,
        room,
        notes,
        created_at,
        updated_at
    ) SELECT 
        uuid_generate_v4(),
        demo_clinic_id,
        c.id,
        u.id,
        CURRENT_DATE + CASE WHEN rn <= 3 THEN '0 days' ELSE '1 days' END,
        CASE rn 
            WHEN 1 THEN '09:00'
            WHEN 2 THEN '10:30'
            WHEN 3 THEN '14:00'
            WHEN 4 THEN '15:30'
            WHEN 5 THEN '16:00'
            ELSE '11:00'
        END,
        CASE WHEN rn <= 3 THEN 60 ELSE 90 END,
        CASE WHEN rn <= 3 THEN 'completed' ELSE 'scheduled' END,
        CASE rn 
            WHEN 1 THEN 'HydraFacial Treatment'
            WHEN 2 THEN 'Chemical Peel'
            WHEN 3 THEN 'Laser Hair Removal'
            WHEN 4 THEN 'Botox Injection'
            WHEN 5 THEN 'Microdermabrasion'
            ELSE 'Facial Treatment'
        END,
        'Room ' || (rn % 3 + 1),
        CASE WHEN rn <= 3 THEN 'Customer satisfied' ELSE 'First time visit' END,
        NOW(),
        NOW()
    FROM (
        SELECT c.id, u.id, ROW_NUMBER() OVER () as rn
        FROM public.customers c
        CROSS JOIN (SELECT id FROM public.users WHERE role = 'clinic_staff' LIMIT 1) u
        WHERE c.clinic_id = demo_clinic_id
        LIMIT 5
    ) t;
    
    -- Create demo sales leads
    INSERT INTO public.sales_leads (
        id,
        clinic_id,
        customer_id,
        source,
        status,
        value,
        notes,
        created_at,
        updated_at
    ) SELECT 
        uuid_generate_v4(),
        demo_clinic_id,
        c.id,
        CASE rn 
            WHEN 1 THEN 'website'
            WHEN 2 THEN 'social_media'
            WHEN 3 THEN 'referral'
            ELSE 'walk_in'
        END,
        CASE WHEN rn <= 2 THEN 'qualified' ELSE 'new' END,
        CASE rn 
            WHEN 1 THEN 15000
            WHEN 2 THEN 25000
            WHEN 3 THEN 8000
            ELSE 12000
        END,
        CASE rn 
            WHEN 1 THEN 'Interested in premium package'
            WHEN 2 THEN 'Follow up needed'
            WHEN 3 THEN 'Ready to book'
            ELSE 'Initial consultation'
        END,
        NOW() - INTERVAL (rn * 2 || ' days'),
        NOW()
    FROM (
        SELECT id, ROW_NUMBER() OVER () as rn
        FROM public.customers
        WHERE clinic_id = demo_clinic_id
        LIMIT 4
    ) t;
    
    -- Create demo sales proposals
    INSERT INTO public.sales_proposals (
        id,
        lead_id,
        clinic_id,
        title,
        description,
        total_amount,
        status,
        valid_until,
        created_at,
        updated_at
    ) SELECT 
        uuid_generate_v4(),
        l.id,
        demo_clinic_id,
        CASE rn 
            WHEN 1 THEN 'Premium Anti-Aging Package'
            WHEN 2 THEN 'Acne Treatment Program'
            ELSE 'Skin Brightening Package'
        END,
        CASE rn 
            WHEN 1 THEN '6 sessions of advanced anti-aging treatments'
            WHEN 2 THEN 'Complete acne solution with follow-up'
            ELSE '4 sessions for radiant skin'
        END,
        CASE rn 
            WHEN 1 THEN 45000
            WHEN 2 THEN 30000
            ELSE 20000
        END,
        CASE WHEN rn = 1 THEN 'accepted' ELSE 'pending' END,
        NOW() + INTERVAL '30 days',
        NOW() - INTERVAL (rn || ' days'),
        NOW()
    FROM (
        SELECT id, ROW_NUMBER() OVER () as rn
        FROM public.sales_leads
        WHERE clinic_id = demo_clinic_id AND status = 'qualified'
        LIMIT 3
    ) t;
    
    -- Create demo skin analyses
    INSERT INTO public.skin_analyses (
        id,
        user_id,
        image_url,
        visia_scores,
        concerns,
        recommendations,
        overall_score,
        created_at,
        updated_at
    ) SELECT 
        uuid_generate_v4(),
        u.id,
        'https://storage.googleapis.com/demo/skin-analysis-' || rn || '.jpg',
        json_build_object(
            'wrinkles', 65 + (rn * 5),
            'spots', 45 + (rn * 10),
            'pores', 70 + (rn * 3),
            'texture', 60 + (rn * 8),
            'evenness', 55 + (rn * 7),
            'firmness', 68 + (rn * 4),
            'radiance', 62 + (rn * 6),
            'hydration', 75 + (rn * 2)
        ),
        json_build_array(
            json_build_object('type', CASE WHEN rn = 1 THEN 'wrinkles' WHEN rn = 2 THEN 'pigmentation' ELSE 'pores' END, 'severity', 'moderate')
        ),
        json_build_array(
            'Use anti-aging serum daily',
            'Apply SPF 50+ sunscreen',
            'Schedule monthly facial'
        ),
        65 + (rn * 3),
        NOW() - INTERVAL (rn * 3 || ' days'),
        NOW()
    FROM (
        SELECT id, ROW_NUMBER() OVER () as rn
        FROM public.users
        WHERE clinic_id = demo_clinic_id AND role = 'customer'
        LIMIT 3
    ) t;
    
    -- Create demo booking payments
    INSERT INTO public.booking_payments (
        id,
        clinic_id,
        appointment_id,
        customer_id,
        amount,
        payment_method,
        status,
        transaction_id,
        created_at,
        updated_at
    ) SELECT 
        uuid_generate_v4(),
        demo_clinic_id,
        a.id,
        a.customer_id,
        CASE rn 
            WHEN 1 THEN 3000
            WHEN 2 THEN 2500
            ELSE 4000
        END,
        CASE rn 
            WHEN 1 THEN 'credit_card'
            WHEN 2 THEN 'bank_transfer'
            ELSE 'cash'
        END,
        'completed',
        'TXN' || LPAD((rn * 1000)::text, 8, '0'),
        NOW() - INTERVAL (rn || ' days'),
        NOW()
    FROM (
        SELECT id, customer_id, ROW_NUMBER() OVER () as rn
        FROM public.appointments
        WHERE clinic_id = demo_clinic_id AND status = 'completed'
        LIMIT 3
    ) t;
    
    -- Create demo AI usage tracking
    INSERT INTO public.ai_usage (
        id,
        clinic_id,
        user_id,
        date,
        provider,
        model,
        usage_type,
        request_count,
        tokens_used,
        cost_usd,
        created_at,
        updated_at
    ) SELECT 
        uuid_generate_v4(),
        demo_clinic_id,
        u.id,
        CURRENT_DATE - (rn - 1),
        'gemini',
        'gemini-1.5-flash',
        'skin_analysis',
        10 + rn,
        5000 + (rn * 1000),
        0.0000,
        NOW(),
        NOW()
    FROM (
        SELECT id, ROW_NUMBER() OVER () as rn
        FROM public.users
        WHERE clinic_id = demo_clinic_id
        LIMIT 5
    ) t;
    
    RAISE NOTICE 'Demo environment seeded successfully!';
    RAISE NOTICE 'Login with: demo@cliniciq.com / demo123';
END $$;
