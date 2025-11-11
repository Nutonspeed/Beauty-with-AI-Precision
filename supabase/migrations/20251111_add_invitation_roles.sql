-- ============================================================================
-- Add new roles to user_role enum for invitation system
-- Run this BEFORE 20251111_invitation_system.sql
-- ============================================================================

-- Check current enum values
DO $$
BEGIN
  -- Add clinic_manager if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'clinic_manager' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'clinic_manager';
    RAISE NOTICE '✅ Added clinic_manager to user_role enum';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_manager already exists in user_role enum';
  END IF;

  -- Add clinic_staff if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'clinic_staff' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'clinic_staff';
    RAISE NOTICE '✅ Added clinic_staff to user_role enum';
  ELSE
    RAISE NOTICE 'ℹ️  clinic_staff already exists in user_role enum';
  END IF;
END $$;

-- Verify all roles
DO $$
DECLARE
  role_list TEXT;
BEGIN
  SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
  INTO role_list
  FROM pg_enum
  WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role');
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ User Role Enum Updated!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Available roles: %', role_list;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Ready for invitation system migration';
END $$;
