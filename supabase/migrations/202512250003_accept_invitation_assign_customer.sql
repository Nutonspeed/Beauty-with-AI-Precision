-- ============================================================================
-- Invitation accept: assign customer to inviting sales staff
-- Date: 2025-12-25
-- Purpose:
--   When a customer is invited/created by sales_staff, automatically set
--   public.users.assigned_sales_user_id = invitations.invited_by
-- ============================================================================

CREATE OR REPLACE FUNCTION accept_invitation(
  invitation_token TEXT,
  user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Get invitation with validation
  SELECT * INTO invitation_record
  FROM validate_invitation(invitation_token);

  IF invitation_record.id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF NOT invitation_record.is_valid THEN
    RAISE EXCEPTION '%', invitation_record.error_message;
  END IF;

  -- Mark as accepted
  UPDATE public.invitations
  SET
    status = 'accepted',
    accepted_at = NOW()
  WHERE id = invitation_record.id;

  -- Update user's clinic_id and role
  UPDATE public.users
  SET
    clinic_id = invitation_record.clinic_id,
    role = invitation_record.invited_role,
    assigned_sales_user_id = CASE
      WHEN invitation_record.invited_role = 'customer' THEN
        (SELECT invited_by FROM public.invitations WHERE id = invitation_record.id)
      ELSE assigned_sales_user_id
    END
  WHERE id = user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
