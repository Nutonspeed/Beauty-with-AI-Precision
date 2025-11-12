-- Enable RLS on analytics_events table
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous INSERT for analytics events
-- This allows the API to track usage without authentication
CREATE POLICY "Allow anonymous analytics insert"
ON analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to read their own events
CREATE POLICY "Users can read own analytics"
ON analytics_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Allow admins to read all analytics
CREATE POLICY "Admins can read all analytics"
ON analytics_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'clinic_admin')
  )
);

-- Add comment
COMMENT ON TABLE analytics_events IS 'Stores usage analytics and tracking events with permissive INSERT policy for anonymous tracking';
