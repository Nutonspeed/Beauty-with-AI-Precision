-- ============================================================================
-- Harden Invitation Flow
-- Date: 2025-12-25
-- Purpose:
--   - Force clinic_id to match inviter's clinic for non-super_admins
--   - Ensure sales_staff can only invite customers
--   - Add validation for clinic_id based on role
-- ============================================================================

-- Drop and recreate the invitations API function with enhanced security
CREATE OR REPLACE FUNCTION create_invitation(
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
  v_inviter_id UUID := auth.uid();
  v_inviter_role TEXT;
  v_inviter_clinic_id UUID;
  v_invitation_id UUID;
  v_token TEXT;
  v_expires_at TIMESTAMPTZ := NOW() + INTERVAL '7 days';
  v_result JSONB;
  v_clinic_exists BOOLEAN;
  v_error_message TEXT;
  v_error_detail TEXT;
  v_error_hint TEXT;
  v_is_super_admin BOOLEAN;
  v_clinic_owner_id UUID;
BEGIN
  -- Get inviter's role and clinic
  SELECT 
    u.role, 
    u.clinic_id,
    EXISTS(SELECT 1 FROM public.users WHERE id = v_inviter_id AND role = 'super_admin')
  INTO v_inviter_role, v_inviter_clinic_id, v_is_super_admin
  FROM public.users u
  WHERE u.id = v_inviter_id;

  -- Check if inviter exists and is active
  IF v_inviter_role IS NULL THEN
    RAISE EXCEPTION 'Inviter not found or inactive';
  END IF;

  -- Role-based validation
  IF v_inviter_role = 'sales_staff' AND p_invited_role != 'customer' THEN
    RAISE EXCEPTION 'Sales staff can only invite customers';
  END IF;

  IF v_inviter_role = 'clinic_admin' AND 
     NOT (p_invited_role IN ('clinic_staff', 'sales_staff', 'customer')) THEN
    RAISE EXCEPTION 'Clinic admin can only invite clinic_staff, sales_staff, or customers';
  END IF;

  -- Clinic validation
  IF v_is_super_admin THEN
    -- Super admin can specify any clinic or NULL (for clinic_owner)
    IF p_invited_role != 'clinic_owner' AND p_clinic_id IS NULL THEN
      RAISE EXCEPTION 'clinic_id is required for non-clinic_owner invitations';
    END IF;
    
    IF p_clinic_id IS NOT NULL THEN
      -- Verify clinic exists
      SELECT EXISTS(SELECT 1 FROM public.clinics WHERE id = p_clinic_id)
      INTO v_clinic_exists;
      
      IF NOT v_clinic_exists THEN
        RAISE EXCEPTION 'Specified clinic does not exist';
      END IF;
    END IF;
  ELSE
    -- Non-super admins must use their own clinic
    IF v_inviter_clinic_id IS NULL THEN
      RAISE EXCEPTION 'Your account is not associated with a clinic';
    END IF;
    
    -- Override any provided clinic_id with the inviter's clinic
    p_clinic_id := v_inviter_clinic_id;
  END IF;

  -- Check for existing user with this email
  IF EXISTS (SELECT 1 FROM public.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'User with this email already exists';
  END IF;

  -- Check for existing pending invitation
  IF EXISTS (
    SELECT 1 
    FROM public.invitations 
    WHERE email = p_email 
    AND status = 'pending' 
    AND expires_at > NOW()
  ) THEN
    RAISE EXCEPTION 'A pending invitation already exists for this email';
  END IF;

  -- Generate a unique token
  v_token := encode(gen_random_bytes(32), 'hex');

  -- Create the invitation
  INSERT INTO public.invitations (
    email,
    invited_role,
    clinic_id,
    token,
    invited_by,
    expires_at,
    status,
    metadata
  ) VALUES (
    p_email,
    p_invited_role,
    p_clinic_id,
    v_token,
    v_inviter_id,
    v_expires_at,
    'pending',
    p_metadata
  )
  RETURNING id INTO v_invitation_id;

  -- Get the full invitation details
  SELECT to_jsonb(i) - 'token' - 'updated_at' - 'created_at' - 'deleted_at'
  INTO v_result
  FROM public.invitations i
  WHERE i.id = v_invitation_id;

  -- Add the invitation link
  v_result := jsonb_set(v_result, '{invitation_link}', 
    to_jsonb(format('%s/invite/accept?token=%s', 
      COALESCE(current_setting('app.settings.app_url', true), 'https://yourapp.com'),
      v_token
    ))
  );

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result
  );

EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS 
    v_error_message = MESSAGE_TEXT,
    v_error_detail = PG_EXCEPTION_DETAIL,
    v_error_hint = PG_EXCEPTION_HINT;
    
  RETURN jsonb_build_object(
    'success', false,
    'error', v_error_message,
    'detail', v_error_detail,
    'hint', v_error_hint
  );
END;
$$;

-- Update RLS policies for invitations table
DROP POLICY IF EXISTS "Users can view invitations they created" ON public.invitations;
CREATE POLICY "Users can view invitations they created"
  ON public.invitations
  FOR SELECT
  USING (invited_by = auth.uid() OR is_super_admin());

DROP POLICY IF EXISTS "Users can create invitations" ON public.invitations;
CREATE POLICY "Users can create invitations"
  ON public.invitations
  FOR INSERT
  WITH CHECK (true);  -- Actual validation happens in the function

-- Create a view for pending invitations with clinic info
CREATE OR REPLACE VIEW public.pending_invitations AS
SELECT 
  i.id,
  i.email,
  i.invited_role,
  i.status,
  i.expires_at,
  i.created_at,
  i.invited_by,
  i.clinic_id,
  c.name AS clinic_name,
  u.email AS invited_by_email,
  u.full_name AS invited_by_name
FROM public.invitations i
LEFT JOIN public.clinics c ON i.clinic_id = c.id
LEFT JOIN public.users u ON i.invited_by = u.id
WHERE i.status = 'pending'
AND i.expires_at > NOW();

-- Grant permissions
GRANT SELECT ON public.pending_invitations TO authenticated;

-- Log invitation creation
CREATE OR REPLACE FUNCTION log_invitation_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    NEW.invited_by,
    'create',
    'invitations',
    NEW.id,
    NULL,
    jsonb_build_object(
      'email', NEW.email,
      'role', NEW.invited_role,
      'clinic_id', NEW.clinic_id,
      'expires_at', NEW.expires_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invitation logging
DROP TRIGGER IF EXISTS log_invitation_created ON public.invitations;
CREATE TRIGGER log_invitation_created
  AFTER INSERT ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION log_invitation_creation();

-- Update the API endpoint to use the new function
COMMENT ON FUNCTION create_invitation IS 'Creates a new invitation with proper validation and security checks. Super admins can invite to any clinic, others are restricted to their own clinic.';
