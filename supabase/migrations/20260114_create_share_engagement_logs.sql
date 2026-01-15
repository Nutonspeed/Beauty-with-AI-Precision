-- Create share_engagement_logs table for advanced telemetry tracking
-- This table records detailed interaction data from shared report pages

CREATE TABLE IF NOT EXISTS share_engagement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_token TEXT NOT NULL,
  analysis_id UUID REFERENCES skin_analyses(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  scroll_depth INTEGER NOT NULL DEFAULT 0,
  interactions INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE share_engagement_logs IS 'Detailed telemetry for shared analysis report engagement';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_engagement_token ON share_engagement_logs(share_token);
CREATE INDEX IF NOT EXISTS idx_engagement_analysis ON share_engagement_logs(analysis_id);
CREATE INDEX IF NOT EXISTS idx_engagement_recorded_at ON share_engagement_logs(recorded_at DESC);

-- Enable RLS
ALTER TABLE share_engagement_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Anonymous/Public can INSERT (to record telemetry from share pages)
CREATE POLICY "Allow public engagement logging"
  ON share_engagement_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Staff can view engagement logs for leads they manage
CREATE POLICY "Staff can view managed engagement logs"
  ON share_engagement_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM skin_analyses sa
      WHERE sa.id = share_engagement_logs.analysis_id
      AND (
        sa.sales_staff_id = (SELECT id FROM sales_staff WHERE user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM sales_staff ss
          WHERE ss.user_id = auth.uid()
          AND (ss.role = 'super_admin' OR ss.role = 'center_admin')
        )
      )
    )
  );
