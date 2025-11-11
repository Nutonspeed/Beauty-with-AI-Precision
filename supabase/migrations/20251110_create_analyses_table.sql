-- Migration: Create analyses table for multi-tier storage integration
-- Date: November 10, 2025
-- Purpose: Store analysis results with multi-tier image URLs

-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('single', 'multi-angle')),
  storage_paths JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_urls JSONB NOT NULL DEFAULT '{}'::jsonb,
  analysis_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE analyses IS 'Stores skin analysis results with multi-tier image storage';
COMMENT ON COLUMN analyses.id IS 'Unique analysis ID (format: analysis_{timestamp})';
COMMENT ON COLUMN analyses.user_id IS 'User who performed the analysis';
COMMENT ON COLUMN analyses.type IS 'Analysis type: single or multi-angle';
COMMENT ON COLUMN analyses.storage_paths IS 'Storage paths for each view (front/left/right)';
COMMENT ON COLUMN analyses.image_urls IS 'CDN URLs for all tiers (original/display/thumbnail)';
COMMENT ON COLUMN analyses.analysis_data IS 'AI analysis results (MediaPipe, TensorFlow, HuggingFace)';
COMMENT ON COLUMN analyses.metadata IS 'Additional metadata (timestamp, device info, etc.)';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_type ON analyses(type);
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON analyses(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON analyses;

-- RLS Policy: Users can only view their own analyses
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own analyses
CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own analyses
CREATE POLICY "Users can update own analyses"
  ON analyses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own analyses
CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_analyses_updated_at ON analyses;
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional, for testing)
-- Uncomment to insert test data:
-- INSERT INTO analyses (id, user_id, type, storage_paths, image_urls, analysis_data, metadata)
-- VALUES (
--   'analysis_test_1',
--   auth.uid(), -- Current user
--   'multi-angle',
--   '{"front": "analysis/user123/1699632000_front.jpg", "left": "analysis/user123/1699632000_left.jpg", "right": "analysis/user123/1699632000_right.jpg"}'::jsonb,
--   '{"front": {"original": "https://...", "display": "https://...", "thumbnail": "https://..."}, "left": {...}, "right": {...}}'::jsonb,
--   '{"concerns": [{"type": "acne", "confidence": 0.85}], "combinedScore": 7.2}'::jsonb,
--   '{"device": "iPhone 15 Pro", "timestamp": "2025-11-10T10:00:00Z"}'::jsonb
-- );

-- Verify table structure
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'analyses'
ORDER BY ordinal_position;

-- Verify indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'analyses';

-- Verify RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'analyses';
