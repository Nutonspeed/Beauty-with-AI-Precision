-- Migration: Add user management tables
-- Created: 2025-11-09
-- Purpose: Support hierarchical user creation (Super Admin → Clinic Owner → Sales Staff)

-- Table: invitations
-- Stores invitation records when users are created
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setup_token TEXT NOT NULL UNIQUE,
  temp_password TEXT, -- Encrypted in production
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_setup_token ON invitations(setup_token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- Table: user_activity_log
-- Audit trail for user management actions
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- create_user, delete_user, update_role, etc.
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);

-- RLS Policies for invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Super admin can see all invitations
CREATE POLICY "super_admin_view_all_invitations" ON invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Clinic owner can see invitations in their clinic
CREATE POLICY "clinic_owner_view_own_clinic_invitations" ON invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p1
      WHERE p1.id = auth.uid()
      AND p1.role = 'clinic_owner'
      AND EXISTS (
        SELECT 1 FROM profiles AS p2
        WHERE p2.id = invitations.user_id
        AND p2.clinic_id = p1.clinic_id
      )
    )
  );

-- Users can see their own invitation
CREATE POLICY "user_view_own_invitation" ON invitations
  FOR SELECT
  USING (user_id = auth.uid());

-- Super admin and clinic owner can insert invitations
CREATE POLICY "admin_insert_invitations" ON invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'clinic_owner')
    )
  );

-- Users can update their own invitation status (when accepting)
CREATE POLICY "user_update_own_invitation" ON invitations
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_activity_log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Super admin can see all logs
CREATE POLICY "super_admin_view_all_logs" ON user_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Clinic owner can see logs in their clinic
CREATE POLICY "clinic_owner_view_own_clinic_logs" ON user_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p1
      WHERE p1.id = auth.uid()
      AND p1.role = 'clinic_owner'
      AND EXISTS (
        SELECT 1 FROM profiles AS p2
        WHERE p2.id = user_activity_log.user_id
        AND p2.clinic_id = p1.clinic_id
      )
    )
  );

-- Users can see their own activity logs
CREATE POLICY "user_view_own_logs" ON user_activity_log
  FOR SELECT
  USING (user_id = auth.uid());

-- Anyone authenticated can insert logs (for audit trail)
CREATE POLICY "authenticated_insert_logs" ON user_activity_log
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update invitations.updated_at
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE invitations IS 'Stores user invitation records for hierarchical user creation';
COMMENT ON TABLE user_activity_log IS 'Audit trail for user management actions';
COMMENT ON COLUMN invitations.setup_token IS 'Unique token for one-time setup link (valid 7 days)';
COMMENT ON COLUMN invitations.temp_password IS 'Temporary password (should be encrypted in production)';
COMMENT ON COLUMN user_activity_log.details IS 'JSON object with action-specific details';
