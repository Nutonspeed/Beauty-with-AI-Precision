-- Create share_views table for tracking analysis report views
-- This supports analytics for shared reports (unique IPs, view timestamps, etc.)

CREATE TABLE IF NOT EXISTS share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_token TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE share_views IS 'Tracks views of shared analysis reports for analytics';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_share_views_token ON share_views(share_token);
CREATE INDEX IF NOT EXISTS idx_share_views_viewed_at ON share_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_share_views_ip ON share_views(ip_address);

-- Add foreign key constraint (on delete cascade to clean up views when analysis is deleted)
-- Note: We reference share_token directly rather than analysis id for flexibility
-- The share_token column in skin_analyses has a UNIQUE constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_share_views_token'
  ) THEN
    ALTER TABLE share_views 
    ADD CONSTRAINT fk_share_views_token 
    FOREIGN KEY (share_token) 
    REFERENCES skin_analyses(share_token) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- RLS Policies
-- No RLS needed since this is a tracking table accessed via API only
ALTER TABLE share_views ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access directly
CREATE POLICY "Service role can access share_views"
  ON share_views
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view stats for their own shared analyses
CREATE POLICY "Users can view stats for own shares"
  ON share_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM skin_analyses sa
      WHERE sa.share_token = share_views.share_token
      AND (
        sa.user_id = auth.uid()
        OR sa.sales_staff_id = (
          SELECT id FROM sales_staff WHERE user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM sales_staff ss
          WHERE ss.user_id = auth.uid()
          AND (
            ss.role = 'super_admin'
            OR (ss.role = 'clinic_admin' AND ss.clinic_id = sa.clinic_id)
          )
        )
      )
    )
  );
