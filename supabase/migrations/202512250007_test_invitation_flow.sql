-- ============================================================================
-- Test Script for Invitation Flow
-- Date: 2025-12-25
-- Purpose:
--   - Test the complete invitation flow
--   - Verify customer assignment to sales staff
--   - Test RLS policies
-- ============================================================================

-- Test data setup
DO $$
DECLARE
  v_super_admin_id UUID;
  v_clinic_id UUID;
  v_sales_staff_id UUID;
  v_invitation_id UUID;
  v_customer_id UUID;
  v_test_email TEXT := 'test-customer-' || EXTRACT(EPOCH FROM NOW())::bigint || '@example.com';
BEGIN
  -- Create test super admin
  INSERT INTO auth.users (id, email, created_at)
  VALUES (
    gen_random_uuid(),
    'super-admin-test@example.com',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO v_super_admin_id;

  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name, role, clinic_id)
  VALUES (
    v_super_admin_id,
    'super-admin-test@example.com',
    'Super Admin Test',
    'super_admin',
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create test clinic
  INSERT INTO public.clinics (id, name, owner_user_id)
  VALUES (
    gen_random_uuid(),
    'Test Clinic for Invitation Flow',
    v_super_admin_id
  )
  RETURNING id INTO v_clinic_id;

  -- Create test sales staff
  INSERT INTO auth.users (id, email, created_at)
  VALUES (
    gen_random_uuid(),
    'sales-staff-test@example.com',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO v_sales_staff_id;

  -- Insert sales staff into public.users
  INSERT INTO public.users (id, email, full_name, role, clinic_id)
  VALUES (
    v_sales_staff_id,
    'sales-staff-test@example.com',
    'Sales Staff Test',
    'sales_staff',
    v_clinic_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- Test 1: Create invitation as sales staff
  PERFORM set_config('request.jwt.claims', '{"sub": "' || v_sales_staff_id || '"}', true);
  PERFORM set_config('request.role', 'authenticated', true);

  SELECT * INTO v_invitation_id
  FROM create_invitation(
    v_test_email,
    'customer',
    v_clinic_id,
    '{"source": "test_script"}'::jsonb
  );

  IF (v_invitation_id->>'success')::boolean THEN
    RAISE NOTICE '✅ Test 1 PASSED: Sales staff can create customer invitation';
  ELSE
    RAISE NOTICE '❌ Test 1 FAILED: %', v_invitation_id->>'error';
  END IF;

  -- Test 2: Try to create invitation for wrong role (should fail)
  PERFORM set_config('request.jwt.claims', '{"sub": "' || v_sales_staff_id || '"}', true);
  PERFORM set_config('request.role', 'authenticated', true);

  SELECT * INTO v_invitation_id
  FROM create_invitation(
    'wrong-role-test@example.com',
    'clinic_admin',
    v_clinic_id,
    '{}'::jsonb
  );

  IF NOT (v_invitation_id->>'success')::boolean THEN
    RAISE NOTICE '✅ Test 2 PASSED: Sales staff cannot invite non-customer roles';
  ELSE
    RAISE NOTICE '❌ Test 2 FAILED: Sales staff should not be able to invite clinic_admin';
  END IF;

  -- Test 3: Simulate customer accepting invitation
  -- First create the auth user
  INSERT INTO auth.users (id, email, created_at)
  VALUES (
    gen_random_uuid(),
    v_test_email,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO v_customer_id;

  -- Get the invitation token
  SELECT token INTO v_invitation_id
  FROM public.invitations
  WHERE email = v_test_email
  AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Accept the invitation
  PERFORM set_config('request.jwt.claims', '{"sub": "' || v_customer_id || '"}', true);
  PERFORM set_config('request.role', 'authenticated', true);

  SELECT * INTO v_invitation_id
  FROM accept_invitation(v_invitation_id, v_customer_id);

  IF (v_invitation_id->>'success')::boolean THEN
    RAISE NOTICE '✅ Test 3 PASSED: Customer can accept invitation';
  ELSE
    RAISE NOTICE '❌ Test 3 FAILED: %', v_invitation_id->>'error';
  END IF;

  -- Test 4: Verify customer assignment
  SELECT assigned_sales_user_id INTO v_invitation_id
  FROM public.users
  WHERE email = v_test_email;

  IF v_invitation_id = v_sales_staff_id THEN
    RAISE NOTICE '✅ Test 4 PASSED: Customer is assigned to correct sales staff';
  ELSE
    RAISE NOTICE '❌ Test 4 FAILED: Customer assignment incorrect';
  END IF;

  -- Test 5: Test RLS - Sales staff can see their own customers
  PERFORM set_config('request.jwt.claims', '{"sub": "' || v_sales_staff_id || '"}', true);
  PERFORM set_config('request.role', 'authenticated', true);

  -- This should return the customer
  SELECT COUNT(*) INTO v_invitation_id
  FROM public.users
  WHERE role = 'customer'
  AND assigned_sales_user_id = v_sales_staff_id;

  IF v_invitation_id > 0 THEN
    RAISE NOTICE '✅ Test 5 PASSED: Sales staff can see their assigned customers';
  ELSE
    RAISE NOTICE '❌ Test 5 FAILED: Sales staff cannot see their customers';
  END IF;

  -- Test 6: Test RLS - Sales staff cannot see other clinic's customers
  -- Create another clinic and sales staff
  DECLARE
    v_other_clinic_id UUID;
    v_other_sales_id UUID;
  BEGIN
    INSERT INTO public.clinics (id, name, owner_user_id)
    VALUES (
      gen_random_uuid(),
      'Other Test Clinic',
      v_super_admin_id
    )
    RETURNING id INTO v_other_clinic_id;

    INSERT INTO auth.users (id, email, created_at)
    VALUES (
      gen_random_uuid(),
      'other-sales@example.com',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO v_other_sales_id;

    INSERT INTO public.users (id, email, full_name, role, clinic_id)
    VALUES (
      v_other_sales_id,
      'other-sales@example.com',
      'Other Sales Staff',
      'sales_staff',
      v_other_clinic_id
    )
    ON CONFLICT (id) DO NOTHING;

    -- Try to see first customer as other sales staff
    PERFORM set_config('request.jwt.claims', '{"sub": "' || v_other_sales_id || '"}', true);
    PERFORM set_config('request.role', 'authenticated', true);

    SELECT COUNT(*) INTO v_invitation_id
    FROM public.users
    WHERE role = 'customer'
    AND assigned_sales_user_id = v_sales_staff_id;

    IF v_invitation_id = 0 THEN
      RAISE NOTICE '✅ Test 6 PASSED: Sales staff cannot see other clinic customers';
    ELSE
      RAISE NOTICE '❌ Test 6 FAILED: RLS leak detected';
    END IF;
  END;

  RAISE NOTICE '';
  RAISE NOTICE '=== INVITATION FLOW TEST SUMMARY ===';
  RAISE NOTICE 'Test Email: %', v_test_email;
  RAISE NOTICE 'Clinic ID: %', v_clinic_id;
  RAISE NOTICE 'Sales Staff ID: %', v_sales_staff_id;
  RAISE NOTICE 'Customer ID: %', v_customer_id;
  RAISE NOTICE '';
  RAISE NOTICE 'Run these queries to verify:';
  RAISE NOTICE 'SELECT * FROM public.users WHERE email = ''%'';', v_test_email;
  RAISE NOTICE 'SELECT * FROM public.invitations WHERE email = ''%'';', v_test_email;
  RAISE NOTICE 'SELECT * FROM public.accepted_invitations;';

END $$;

-- Cleanup function (run after testing)
CREATE OR REPLACE FUNCTION cleanup_invitation_test()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.users WHERE email LIKE '%-test@example.com';
  DELETE FROM public.invitations WHERE email LIKE '%-test@example.com';
  DELETE FROM auth.users WHERE email LIKE '%-test@example.com';
  DELETE FROM public.clinics WHERE name LIKE 'Test Clinic%';
  RAISE NOTICE 'Test data cleaned up';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_invitation_test() IS 'Cleans up test data from invitation flow tests';
