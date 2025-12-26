-- ============================================================================
-- Add enum value: user_role.customer
-- Date: 2025-12-25
-- Purpose:
--   PostgreSQL requires a commit after adding new enum values before they can be used.
--   This migration must run BEFORE any migration that updates rows to role='customer'.
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum
      WHERE enumlabel = 'customer'
        AND enumtypid = 'user_role'::regtype
    ) THEN
      ALTER TYPE user_role ADD VALUE 'customer';
    END IF;
  END IF;
END $$;
