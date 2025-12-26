-- ============================================================================
-- Update API Endpoints to Use New Invitation Functions
-- Date: 2025-12-25
-- Purpose:
--   - Create RPC functions for API endpoints
--   - Ensure consistent security and validation
-- ============================================================================

-- Create RPC function for POST /api/invitations
CREATE OR REPLACE FUNCTION api_create_invitation(
  p_email TEXT,
  p_invited_role TEXT,
  p_clinic_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Use the hardened create_invitation function
  v_result := create_invitation(p_email, p_invited_role, p_clinic_id, p_metadata);
  
  -- If successful, add invitation link for frontend
  IF (v_result->>'success')::boolean THEN
    v_result := jsonb_set(
      v_result,
      '{data,invitation_link}',
      to_jsonb(format('%s/invite/accept?token=%s', 
        COALESCE(current_setting('app.settings.app_url', true), 'https://yourapp.com'),
        (v_result->'data'->>'id')::uuid
      ))
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Create RPC function for GET /api/invitations (list pending invitations)
CREATE OR REPLACE FUNCTION api_list_invitations(
  p_status TEXT DEFAULT NULL,
  p_clinic_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_role TEXT;
  v_user_clinic_id UUID;
  v_invitations JSONB;
BEGIN
  -- Get user info
  SELECT role, clinic_id
  INTO v_user_role, v_user_clinic_id
  FROM public.users
  WHERE id = v_user_id;
  
  -- Security check
  IF v_user_role IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Build query based on role
  IF v_user_role = 'super_admin' THEN
    -- Can see all invitations
    SELECT jsonb_agg(i)
    INTO v_invitations
    FROM (
      SELECT 
        id,
        email,
        invited_role,
        status,
        clinic_id,
        created_at,
        expires_at,
        invited_by
      FROM public.invitations
      WHERE (p_status IS NULL OR status = p_status)
        AND (p_clinic_id IS NULL OR clinic_id = p_clinic_id)
      ORDER BY created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) i;
  ELSE
    -- Can only see invitations for their clinic or that they sent
    SELECT jsonb_agg(i)
    INTO v_invitations
    FROM (
      SELECT 
        id,
        email,
        invited_role,
        status,
        clinic_id,
        created_at,
        expires_at,
        invited_by
      FROM public.invitations
      WHERE (p_status IS NULL OR status = p_status)
        AND (p_clinic_id IS NULL OR clinic_id = p_clinic_id)
        AND (
          invited_by = v_user_id
          OR clinic_id = v_user_clinic_id
        )
      ORDER BY created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) i;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', v_invitations,
    'pagination', jsonb_build_object(
      'limit', p_limit,
      'offset', p_offset,
      'total', COALESCE(jsonb_array_length(v_invitations), 0)
    )
  );
END;
$$;

-- Create RPC function for POST /api/invitations/[token]/accept
CREATE OR REPLACE FUNCTION api_accept_invitation(
  p_token TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_current_user_id UUID := auth.uid();
BEGIN
  -- Use provided user_id or current authenticated user
  v_result := accept_invitation(p_token, COALESCE(p_user_id, v_current_user_id));
  
  -- If successful, add session info
  IF (v_result->>'success')::boolean THEN
    -- Get user session data
    v_result := jsonb_set(
      v_result,
      '{session}',
      jsonb_build_object(
        'user_id', v_current_user_id,
        'role', (SELECT role FROM public.users WHERE id = v_current_user_id),
        'clinic_id', (SELECT clinic_id FROM public.users WHERE id = v_current_user_id)
      )
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Create RPC function for GET /api/invitations/[token]/validate
CREATE OR REPLACE FUNCTION api_validate_invitation(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_validation JSONB;
BEGIN
  SELECT jsonb_agg(i)
  INTO v_validation
  FROM validate_invitation(p_token) i;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', v_validation
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION api_create_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION api_list_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION api_accept_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION api_validate_invitation TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION api_create_invitation IS 'RPC wrapper for creating invitations via API';
COMMENT ON FUNCTION api_list_invitations IS 'RPC wrapper for listing invitations via API';
COMMENT ON FUNCTION api_accept_invitation IS 'RPC wrapper for accepting invitations via API';
COMMENT ON FUNCTION api_validate_invitation IS 'RPC wrapper for validating invitation tokens via API';

-- Create a comprehensive view for dashboard analytics
CREATE OR REPLACE VIEW public.invitation_analytics AS
SELECT 
  c.id AS clinic_id,
  c.name AS clinic_name,
  COUNT(i.id) FILTER (WHERE i.status = 'pending') AS pending_invitations,
  COUNT(i.id) FILTER (WHERE i.status = 'accepted') AS accepted_invitations,
  COUNT(i.id) FILTER (WHERE i.status = 'expired') AS expired_invitations,
  COUNT(i.id) FILTER (WHERE i.created_at >= CURRENT_DATE - INTERVAL '7 days') AS invitations_last_7_days,
  COUNT(i.id) FILTER (WHERE i.created_at >= CURRENT_DATE - INTERVAL '30 days') AS invitations_last_30_days,
  COUNT(i.id) FILTER (WHERE i.invited_role = 'customer') AS customer_invitations,
  COUNT(i.id) FILTER (WHERE i.invited_role = 'sales_staff') AS sales_invitations,
  COUNT(i.id) FILTER (WHERE i.invited_role = 'clinic_staff') AS staff_invitations
FROM public.clinics c
LEFT JOIN public.invitations i ON c.id = i.clinic_id
GROUP BY c.id, c.name;

GRANT SELECT ON public.invitation_analytics TO authenticated;

-- Add indexes for better API performance
CREATE INDEX IF NOT EXISTS idx_invitations_created_at_desc ON public.invitations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_status_clinic ON public.invitations(status, clinic_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by_status ON public.invitations(invited_by, status);
