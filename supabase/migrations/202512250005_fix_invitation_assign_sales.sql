-- ============================================================================
-- Fix: Ensure assigned_sales_user_id is set for customer invitations
-- Date: 2025-12-25
-- Purpose:
--   - Update the accept_invitation function to properly set assigned_sales_user_id
--   - Ensure sales staff who invite customers are assigned as the responsible sales
-- ============================================================================

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS accept_invitation(TEXT, UUID);

-- Recreate the function with proper sales assignment
CREATE OR REPLACE FUNCTION accept_invitation(
  invitation_token TEXT,
  user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
  v_user_email TEXT;
  v_user_data JSONB;
  v_clinic_data JSONB;
  v_sales_data JSONB;
  v_is_valid BOOLEAN;
BEGIN
  -- Get and validate the invitation
  SELECT * INTO v_invitation
  FROM validate_invitation(invitation_token)
  LIMIT 1;

  IF v_invitation IS NULL OR v_invitation.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired invitation',
      'code', 'INVITATION_INVALID'
    );
  END IF;

  -- Check if invitation is valid
  IF NOT v_invitation.is_valid THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', COALESCE(v_invitation.error_message, 'Invitation is not valid'),
      'code', 'INVITATION_INVALID_STATUS'
    );
  END IF;

  -- Get user email for verification
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = user_id;

  IF v_user_email IS NULL OR v_user_email != v_invitation.email THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email does not match invitation',
      'code', 'EMAIL_MISMATCH'
    );
  END IF;

  -- Begin transaction
  BEGIN
    -- Mark invitation as accepted
    UPDATE public.invitations
    SET 
      status = 'accepted',
      accepted_at = NOW(),
      updated_at = NOW()
    WHERE id = v_invitation.id;

    -- Update user's profile with role and clinic
    UPDATE public.users
    SET 
      role = v_invitation.invited_role,
      clinic_id = v_invitation.clinic_id,
      assigned_sales_user_id = CASE 
        WHEN v_invitation.invited_role = 'customer' AND v_invitation.invited_by IS NOT NULL THEN 
          v_invitation.invited_by
        ELSE 
          assigned_sales_user_id
      END,
      updated_at = NOW()
    WHERE id = user_id
    RETURNING 
      id, 
      email, 
      role, 
      clinic_id, 
      assigned_sales_user_id 
    INTO v_user_data;

    -- If this is a clinic_owner, update the clinic's owner_user_id
    IF v_invitation.invited_role = 'clinic_owner' AND v_invitation.clinic_id IS NOT NULL THEN
      UPDATE public.clinics
      SET owner_user_id = user_id,
          updated_at = NOW()
      WHERE id = v_invitation.clinic_id
      RETURNING to_jsonb(clinics) - 'created_at' - 'updated_at' - 'deleted_at' INTO v_clinic_data;
    END IF;

    -- Log the acceptance
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data
    ) VALUES (
      user_id,
      'accept_invitation',
      'invitations',
      v_invitation.id,
      jsonb_build_object('status', 'pending'),
      jsonb_build_object(
        'status', 'accepted',
        'accepted_at', NOW(),
        'user_id', user_id,
        'role', v_invitation.invited_role,
        'clinic_id', v_invitation.clinic_id,
        'assigned_sales_user_id', CASE WHEN v_invitation.invited_role = 'customer' THEN v_invitation.invited_by ELSE NULL END
      )
    );

    -- Get sales user data if assigned
    IF v_invitation.invited_role = 'customer' AND v_invitation.invited_by IS NOT NULL THEN
      SELECT jsonb_build_object(
        'id', id,
        'email', email,
        'full_name', full_name
      ) INTO v_sales_data
      FROM public.users
      WHERE id = v_invitation.invited_by;
    END IF;

    -- Return success with user and clinic data
    RETURN jsonb_build_object(
      'success', true,
      'user', v_user_data,
      'clinic', COALESCE(v_clinic_data, 'null'::jsonb),
      'assigned_sales', COALESCE(v_sales_data, 'null'::jsonb),
      'invitation_id', v_invitation.id
    );

  EXCEPTION WHEN OTHERS THEN
    -- Rollback on error
    GET STACKED DIAGNOSTICS 
      v_error_message = MESSAGE_TEXT,
      v_error_detail = PG_EXCEPTION_DETAIL,
      v_error_hint = PG_EXCEPTION_HINT;
      
    -- Log the error
    INSERT INTO public.error_logs (
      user_id,
      error_message,
      error_detail,
      error_hint,
      context
    ) VALUES (
      user_id,
      v_error_message,
      v_error_detail,
      v_error_hint,
      jsonb_build_object(
        'function', 'accept_invitation',
        'invitation_id', v_invitation.id,
        'user_id', user_id
      )
    );

    -- Return error
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to accept invitation',
      'detail', v_error_message,
      'code', 'ACCEPTANCE_FAILED'
    );
  END;
END;
$$;

-- Update comment
COMMENT ON FUNCTION accept_invitation IS 'Accepts an invitation, assigns the user to the specified clinic with role, and handles sales assignment for customers';

-- Create a view for accepted invitations with user and clinic info
CREATE OR REPLACE VIEW public.accepted_invitations AS
SELECT 
  i.id,
  i.email,
  i.invited_role,
  i.status,
  i.accepted_at,
  i.invited_by,
  i.clinic_id,
  c.name AS clinic_name,
  u.id AS user_id,
  u.full_name AS user_name,
  u.assigned_sales_user_id,
  s.full_name AS assigned_sales_name
FROM public.invitations i
LEFT JOIN public.clinics c ON i.clinic_id = c.id
LEFT JOIN public.users u ON u.email = i.email
LEFT JOIN public.users s ON s.id = u.assigned_sales_user_id
WHERE i.status = 'accepted';

-- Grant permissions
GRANT SELECT ON public.accepted_invitations TO authenticated;

-- Update RLS policies to ensure proper access to accepted invitations
DROP POLICY IF EXISTS "Users can view their own accepted invitations" ON public.invitations;
CREATE POLICY "Users can view their own accepted invitations"
  ON public.invitations
  FOR SELECT
  USING (
    status = 'accepted' AND 
    (email = (SELECT email FROM auth.users WHERE id = auth.uid())
     OR 
     invited_by = auth.uid()
     OR
     EXISTS (
       SELECT 1 FROM public.users u 
       WHERE u.id = auth.uid() 
       AND (u.role = 'super_admin' OR 
            (u.role = 'clinic_admin' AND u.clinic_id = invitations.clinic_id))
     )
    )
  );

-- Add index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_invitations_email_status ON public.invitations(email, status);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by ON public.invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_invitations_clinic_status ON public.invitations(clinic_id, status);
