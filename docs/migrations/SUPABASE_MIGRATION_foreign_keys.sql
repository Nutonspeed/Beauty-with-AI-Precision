-- ============================================================================
-- SUPABASE MIGRATION: Add Missing Foreign Key Constraints
-- ============================================================================
-- Description: Adds missing foreign key constraints between tables
-- Date: 2024-12-31
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================================

-- Step 1: Add foreign key constraint for users.clinic_id
-- ----------------------------------------------------------------------------
-- Check if constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_clinic_id_fkey'
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_clinic_id_fkey
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added foreign key constraint: users.clinic_id → clinics.id';
  ELSE
    RAISE NOTICE 'ℹ️  Foreign key constraint users_clinic_id_fkey already exists';
  END IF;
END $$;

-- Step 2: Verify all foreign key relationships
-- ----------------------------------------------------------------------------
-- This query will show all foreign key constraints
DO $$
DECLARE
  fk_record RECORD;
BEGIN
  RAISE NOTICE '=== FOREIGN KEY CONSTRAINTS VERIFICATION ===';

  FOR fk_record IN
    SELECT
      tc.table_name,
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM
      information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE
      tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('users', 'customers', 'services', 'bookings', 'skin_analyses', 'user_preferences')
    ORDER BY tc.table_name, tc.constraint_name
  LOOP
    RAISE NOTICE '%: %.% → %.%',
      fk_record.constraint_name,
      fk_record.table_name,
      fk_record.column_name,
      fk_record.foreign_table_name,
      fk_record.foreign_column_name;
  END LOOP;

  RAISE NOTICE '=== VERIFICATION COMPLETE ===';
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify)
-- ============================================================================

-- Check all foreign key constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE
  tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('users', 'customers', 'services', 'bookings', 'skin_analyses', 'user_preferences')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
