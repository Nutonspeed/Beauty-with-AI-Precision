-- Staging Migration Script for Super Admin Dashboard
-- Run this script in Supabase SQL Editor for the staging environment

-- ========================================
-- 1. Create audit_logs table
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- 2. Create feature_flags table
-- ========================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  is_enabled boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(clinic_id, feature_key)
);

-- ========================================
-- 3. Enable Row Level Security
-- ========================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. Create RLS Policies for audit_logs
-- ========================================
-- Only super admins can view all audit logs
CREATE POLICY "Super admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Only system can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- No one can update audit logs (immutable)
CREATE POLICY "No updates on audit logs" ON audit_logs
  FOR UPDATE USING (false);

-- Only super admins can delete audit logs
CREATE POLICY "Super admins can delete audit logs" ON audit_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- ========================================
-- 5. Create RLS Policies for feature_flags
-- ========================================
-- Super admins can view all feature flags
CREATE POLICY "Super admins can view all feature flags" ON feature_flags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Clinic admins can view their own clinic's feature flags
CREATE POLICY "Clinic admins can view own feature flags" ON feature_flags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('clinic_admin', 'clinic_owner')
      AND clinic_id = users.clinic_id
    )
  );

-- Only super admins can manage feature flags
CREATE POLICY "Super admins can manage feature flags" ON feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- ========================================
-- 6. Create Indexes
-- ========================================
-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);

-- Feature flags indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_clinic_id ON feature_flags(clinic_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_feature_key ON feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_enabled ON feature_flags(is_enabled);

-- ========================================
-- 7. Create Functions and Triggers
-- ========================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for feature_flags
CREATE TRIGGER update_feature_flags_updated_at 
    BEFORE UPDATE ON feature_flags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 8. Create Helper Functions
-- ========================================
-- Function to check if a feature is enabled for a clinic
CREATE OR REPLACE FUNCTION is_feature_enabled(p_clinic_id uuid, p_feature_key text)
RETURNS boolean AS $$
BEGIN
    RETURN COALESCE(
        (SELECT is_enabled FROM feature_flags 
         WHERE clinic_id = p_clinic_id 
         AND feature_key = p_feature_key),
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all enabled features for a clinic
CREATE OR REPLACE FUNCTION get_clinic_features(p_clinic_id uuid)
RETURNS TABLE(feature_key text, is_enabled boolean, metadata jsonb) AS $$
BEGIN
    RETURN QUERY
    SELECT ff.feature_key, ff.is_enabled, ff.metadata
    FROM feature_flags ff
    WHERE ff.clinic_id = p_clinic_id 
    AND ff.is_enabled = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 9. Seed Default Feature Flags
-- ========================================
-- Get all clinics and seed default features
DO $$
DECLARE
    clinic_record RECORD;
    default_features text[] := ARRAY[
        'ai_skin_analysis',
        'ar_visualization', 
        'online_booking',
        'payment_gateway',
        'loyalty_program',
        'email_notifications',
        'sms_notifications',
        'advanced_analytics',
        'api_access',
        'multi_language',
        'custom_branding',
        'export_reports'
    ];
BEGIN
    FOR clinic_record IN SELECT id FROM clinics LOOP
        FOR i IN 1..array_length(default_features, 1) LOOP
            INSERT INTO feature_flags (clinic_id, feature_key, is_enabled, metadata)
            VALUES (
                clinic_record.id,
                default_features[i],
                CASE 
                    WHEN default_features[i] IN ('online_booking', 'payment_gateway', 'email_notifications', 'multi_language', 'export_reports') 
                    THEN true 
                    ELSE false 
                END,
                '{}'::jsonb
            )
            ON CONFLICT (clinic_id, feature_key) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- ========================================
-- 10. Create Views for Easy Access
-- ========================================
-- View for audit logs with user info
CREATE OR REPLACE VIEW audit_logs_with_users AS
SELECT 
    al.*,
    u.email as user_email,
    u.role as user_role
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id;

-- View for feature flags with clinic info
CREATE OR REPLACE VIEW clinic_feature_flags AS
SELECT 
    ff.*,
    c.name as clinic_name,
    c.status as clinic_status
FROM feature_flags ff
JOIN clinics c ON ff.clinic_id = c.id;

-- ========================================
-- 11. Grant Permissions
-- ========================================
-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant permissions on tables
GRANT SELECT, INSERT ON audit_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON feature_flags TO service_role;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON feature_flags TO authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION is_feature_enabled TO authenticated;
GRANT EXECUTE ON FUNCTION get_clinic_features TO authenticated;

-- Grant permissions on views
GRANT SELECT ON audit_logs_with_users TO authenticated;
GRANT SELECT ON clinic_feature_flags TO authenticated;

-- ========================================
-- 12. Verification Queries
-- ========================================
-- Verify tables were created
SELECT 'audit_logs table exists' as status 
FROM information_schema.tables 
WHERE table_name = 'audit_logs' AND table_schema = 'public'
UNION ALL
SELECT 'feature_flags table exists' as status 
FROM information_schema.tables 
WHERE table_name = 'feature_flags' AND table_schema = 'public'
UNION ALL
SELECT 'Total clinics with feature flags: ' || COUNT(DISTINCT clinic_id) as status
FROM feature_flags;

-- Show migration completion
SELECT 'Super Admin Dashboard migration completed successfully!' as result;
