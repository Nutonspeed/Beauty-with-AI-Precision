-- Add missing lead_source enum values for sales pipelines
-- Purpose: align codebase usage (ai_scan/quick_scan) with DB enum lead_source
-- Date: 2025-12-13

DO $$
BEGIN
  -- Add ai_scan if missing
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source') THEN
    BEGIN
      ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'ai_scan';
    EXCEPTION
      WHEN duplicate_object THEN
        -- noop
        NULL;
    END;

    BEGIN
      ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'quick_scan';
    EXCEPTION
      WHEN duplicate_object THEN
        -- noop
        NULL;
    END;
  END IF;
END $$;
