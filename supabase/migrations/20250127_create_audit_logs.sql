-- ============================================================================ 
-- Audit Logs Table for Compliance and Security
-- Date: 2025-01-27
-- Purpose: Track all admin actions for audit and compliance
-- ============================================================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.auth.users(id) ON DELETE SET NULL NOT NULL,
  action TEXT NOT NULL, -- e.g., 'created', 'updated', 'deleted', 'login', 'subscription_updated'
  resource_type TEXT NOT NULL, -- e.g., 'clinic', 'user', 'subscription', 'payment'
  resource_id UUID, -- ID of the resource that was acted upon
  metadata JSONB DEFAULT '{}', -- Additional data (old values, new values, etc.)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON public.audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- RLS Policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs" ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- No one can delete audit logs (preserve integrity)
CREATE POLICY "No one can delete audit logs" ON public.audit_logs
  FOR DELETE
  USING (false);

-- Only system can insert audit logs (via API)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (false); -- Will be bypassed by service role

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO service_role;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata,
    p_ip_address,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for recent audit activity
CREATE OR REPLACE VIEW public.recent_audit_logs AS
SELECT 
  al.id,
  al.action,
  al.resource_type,
  al.resource_id,
  al.metadata,
  al.ip_address,
  al.created_at,
  u.email as user_email,
  u.raw_user_meta_data->>'name' as user_name
FROM public.audit_logs al
LEFT JOIN public.auth.users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 100;

-- Grant access to view
GRANT SELECT ON public.recent_audit_logs TO authenticated;
