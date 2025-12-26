-- ============================================================================
-- Role Model Normalization: introduce role 'customer' and move package into tier
-- Date: 2025-12-25
-- Purpose:
--  - Separate role (RBAC) from tier (subscription/entitlement)
--  - Migrate legacy roles (free_user / premium_customer) into role=customer
--  - Keep backward compatibility (do not remove old enum values)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1) Backfill existing users: normalize customer roles
-- IMPORTANT:
--   The enum value user_role.customer MUST already exist and be committed.
--   Run migration 202512250002_add_user_role_customer_enum.sql first.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='users') THEN
    -- Premium customers -> customer role + premium tier
    UPDATE public.users
    SET role = 'customer'::user_role,
        tier = 'premium'::analysis_tier
    WHERE role::text = 'premium_customer';

    -- Free users -> customer role + free tier
    UPDATE public.users
    SET role = 'customer'::user_role,
        tier = 'free'::analysis_tier
    WHERE role::text = 'free_user';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2) Update handle_new_user trigger function to create role=customer
-- -----------------------------------------------------------------------------
-- Note: This sets default to customer/free. Clinic admins can later elevate roles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    role,
    tier,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    'customer'::user_role,
    'free'::analysis_tier,
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    -- keep existing trigger
    NULL;
  ELSE
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
