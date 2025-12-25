-- ============================================================================ 
-- Feature Flags Table for Clinic-Level Feature Control
-- Date: 2025-01-27
-- Purpose: Enable/disable features per clinic for granular control
-- ============================================================================

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(clinic_id, feature_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_clinic ON public.feature_flags(clinic_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_feature ON public.feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON public.feature_flags(is_enabled);

-- RLS Policies
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all feature flags
CREATE POLICY "Super admins can manage feature flags" ON public.feature_flags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Clinic admins can view their clinic's feature flags
CREATE POLICY "Clinic admins can view own feature flags" ON public.feature_flags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('clinic_admin', 'clinic_owner')
      AND clinic_id = public.feature_flags.clinic_id
    )
  );

-- Insert default features for all existing clinics
INSERT INTO public.feature_flags (clinic_id, feature_key, is_enabled, metadata)
SELECT 
  id as clinic_id,
  feature.key,
  feature.default_enabled,
  '{}'::jsonb
FROM public.clinics
CROSS JOIN (VALUES 
  ('ai_skin_analysis', true, 'AI-powered skin analysis feature'),
  ('ar_visualization', false, 'AR visualization for treatments'),
  ('online_booking', true, 'Online appointment booking'),
  ('payment_gateway', true, 'Payment processing'),
  ('loyalty_program', false, 'Customer loyalty points system'),
  ('email_notifications', true, 'Email notifications'),
  ('sms_notifications', false, 'SMS notifications'),
  ('advanced_analytics', false, 'Advanced analytics dashboard'),
  ('api_access', false, 'API access for integrations'),
  ('multi_language', true, 'Multi-language support'),
  ('custom_branding', false, 'Custom branding options'),
  ('export_reports', true, 'Export reports functionality')
) AS feature(key, default_enabled, description)
ON CONFLICT (clinic_id, feature_key) DO NOTHING;

-- Create function to check if feature is enabled for clinic
CREATE OR REPLACE FUNCTION public.is_feature_enabled(
  p_clinic_id UUID,
  p_feature_key TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_enabled BOOLEAN;
BEGIN
  SELECT is_enabled INTO v_is_enabled
  FROM public.feature_flags
  WHERE clinic_id = p_clinic_id AND feature_key = p_feature_key;
  
  RETURN COALESCE(v_is_enabled, false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all enabled features for a clinic
CREATE OR REPLACE FUNCTION public.get_clinic_features(
  p_clinic_id UUID
)
RETURNS TABLE(feature_key TEXT, is_enabled BOOLEAN, metadata JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT ff.feature_key, ff.is_enabled, ff.metadata
  FROM public.feature_flags ff
  WHERE ff.clinic_id = p_clinic_id AND ff.is_enabled = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for feature flag management
CREATE OR REPLACE VIEW public.clinic_feature_flags AS
SELECT 
  ff.id,
  ff.clinic_id,
  c.name as clinic_name,
  ff.feature_key,
  ff.is_enabled,
  ff.metadata,
  ff.created_at,
  ff.updated_at
FROM public.feature_flags ff
JOIN public.clinics c ON ff.clinic_id = c.id
ORDER BY c.name, ff.feature_key;

-- Grant permissions
GRANT SELECT ON public.feature_flags TO authenticated;
GRANT SELECT ON public.clinic_feature_flags TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_feature_enabled TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_clinic_features TO authenticated;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_feature_flags_updated_at();
