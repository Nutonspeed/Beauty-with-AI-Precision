-- ============================================================================
-- Invitation System Migration
-- Version: 1.0.0
-- Date: 2025-11-11
-- 
-- Purpose: Create invitation system for multi-tenant onboarding
-- - Clinic owners get invited by Super Admin
-- - Staff get invited by Clinic Owner/Manager
-- - Customers get invited by Sales Staff
-- ============================================================================

-- ============================================================================
-- STEP 1: Create invitations table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who is being invited
  email TEXT NOT NULL,
  invited_role TEXT NOT NULL CHECK (invited_role IN ('clinic_owner', 'clinic_manager', 'sales_staff', 'clinic_staff', 'customer')),
  
  -- Which clinic (NULL for clinic_owner invitations)
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Invitation token (will be set by trigger)
  token TEXT UNIQUE NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  
  -- Invitation metadata
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  
  -- Who sent the invitation
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Additional data (JSON for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_clinic ON public.invitations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires ON public.invitations(expires_at) WHERE status = 'pending';

-- Add comment
COMMENT ON TABLE public.invitations IS 'Stores invitation tokens for new users to join clinics';

-- ============================================================================
-- STEP 2: Create function to auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_invitations_updated_at ON public.invitations;
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 2B: Create function to auto-generate token on insert
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_token_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if token is NULL or empty
  IF NEW.token IS NULL OR NEW.token = '' THEN
    NEW.token := encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate token
DROP TRIGGER IF EXISTS generate_invitation_token ON public.invitations;
CREATE TRIGGER generate_invitation_token
  BEFORE INSERT ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION generate_token_on_insert();

-- ============================================================================
-- STEP 3: Create function to auto-expire old invitations
-- ============================================================================

CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.invitations
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION expire_old_invitations() IS 'Marks pending invitations as expired if past expiry date';

-- ============================================================================
-- STEP 4: Create function to generate unique invitation token
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 32-byte hex token
    new_token := encode(gen_random_bytes(32), 'hex');
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM public.invitations WHERE token = new_token)
    INTO token_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: Create function to validate invitation
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_invitation(invitation_token TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  invited_role TEXT,
  clinic_id UUID,
  status TEXT,
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.email,
    i.invited_role,
    i.clinic_id,
    i.status,
    CASE
      WHEN i.status = 'accepted' THEN FALSE
      WHEN i.status = 'revoked' THEN FALSE
      WHEN i.status = 'expired' THEN FALSE
      WHEN i.expires_at < NOW() THEN FALSE
      ELSE TRUE
    END AS is_valid,
    CASE
      WHEN i.status = 'accepted' THEN 'Invitation already accepted'
      WHEN i.status = 'revoked' THEN 'Invitation has been revoked'
      WHEN i.status = 'expired' THEN 'Invitation has expired'
      WHEN i.expires_at < NOW() THEN 'Invitation has expired'
      ELSE NULL
    END AS error_message
  FROM public.invitations i
  WHERE i.token = invitation_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION validate_invitation IS 'Checks if an invitation token is valid and returns status';

-- ============================================================================
-- STEP 6: Create function to accept invitation
-- ============================================================================

CREATE OR REPLACE FUNCTION accept_invitation(
  invitation_token TEXT,
  user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  invitation_record RECORD;
  is_valid BOOLEAN;
BEGIN
  -- Get invitation with validation
  SELECT * INTO invitation_record
  FROM validate_invitation(invitation_token);
  
  -- Check if invitation exists
  IF invitation_record.id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;
  
  -- Check if valid
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
    role = invitation_record.invited_role
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION accept_invitation IS 'Accepts an invitation and assigns user to clinic with role';

-- ============================================================================
-- STEP 7: Enable RLS on invitations
-- ============================================================================

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Super admin can view all invitations
DROP POLICY IF EXISTS "Super admin can view all invitations" ON public.invitations;
CREATE POLICY "Super admin can view all invitations"
  ON public.invitations
  FOR SELECT
  USING (is_super_admin());

-- Policy: Clinic staff can view own clinic invitations
DROP POLICY IF EXISTS "Clinic staff can view own clinic invitations" ON public.invitations;
CREATE POLICY "Clinic staff can view own clinic invitations"
  ON public.invitations
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- Policy: Users who sent invitation can view it
DROP POLICY IF EXISTS "Users can view invitations they sent" ON public.invitations;
CREATE POLICY "Users can view invitations they sent"
  ON public.invitations
  FOR SELECT
  USING (
    is_super_admin()
    OR
    invited_by = auth.uid()
  );

-- Policy: Super admin can create any invitation
DROP POLICY IF EXISTS "Super admin can create any invitation" ON public.invitations;
CREATE POLICY "Super admin can create any invitation"
  ON public.invitations
  FOR INSERT
  WITH CHECK (is_super_admin());

-- Policy: Clinic owners can invite to their clinic
DROP POLICY IF EXISTS "Clinic owners can invite to their clinic" ON public.invitations;
CREATE POLICY "Clinic owners can invite to their clinic"
  ON public.invitations
  FOR INSERT
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND invited_role IN ('clinic_manager', 'clinic_staff', 'sales_staff', 'customer')
    AND (
      SELECT role FROM public.users WHERE id = auth.uid()
    ) IN ('clinic_owner', 'clinic_manager')
  );

-- Policy: Sales staff can invite customers
DROP POLICY IF EXISTS "Sales staff can invite customers" ON public.invitations;
CREATE POLICY "Sales staff can invite customers"
  ON public.invitations
  FOR INSERT
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND invited_role = 'customer'
    AND (
      SELECT role FROM public.users WHERE id = auth.uid()
    ) = 'sales_staff'
  );

-- Policy: Users can update invitations they sent
DROP POLICY IF EXISTS "Users can update own invitations" ON public.invitations;
CREATE POLICY "Users can update own invitations"
  ON public.invitations
  FOR UPDATE
  USING (
    is_super_admin()
    OR
    invited_by = auth.uid()
  );

-- ============================================================================
-- STEP 8: Create view for active invitations
-- ============================================================================

CREATE OR REPLACE VIEW public.active_invitations AS
SELECT 
  i.*,
  u.email AS invited_by_email,
  u.full_name AS invited_by_name,
  c.name AS clinic_name,
  CASE
    WHEN i.expires_at < NOW() THEN 'expired'
    WHEN i.status = 'pending' THEN 'active'
    ELSE i.status
  END AS computed_status
FROM public.invitations i
LEFT JOIN public.users u ON i.invited_by = u.id
LEFT JOIN public.clinics c ON i.clinic_id = c.id
WHERE i.status = 'pending'
AND i.expires_at > NOW();

COMMENT ON VIEW public.active_invitations IS 'Shows only active (pending and not expired) invitations with related data';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Invitation System Migration Complete!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Created:';
  RAISE NOTICE '  ✅ invitations table';
  RAISE NOTICE '  ✅ Auto-expire function';
  RAISE NOTICE '  ✅ Validate invitation function';
  RAISE NOTICE '  ✅ Accept invitation function';
  RAISE NOTICE '  ✅ RLS policies (7 policies)';
  RAISE NOTICE '  ✅ active_invitations view';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Invitation Roles Supported:';
  RAISE NOTICE '  • clinic_owner (invited by Super Admin)';
  RAISE NOTICE '  • clinic_manager (invited by Clinic Owner)';
  RAISE NOTICE '  • clinic_staff (invited by Owner/Manager)';
  RAISE NOTICE '  • sales_staff (invited by Owner/Manager)';
  RAISE NOTICE '  • customer (invited by Sales Staff)';
  RAISE NOTICE '';
  RAISE NOTICE '⏰ Token Expiry: 7 days';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Next Steps:';
  RAISE NOTICE '1. Create API routes for invitation management';
  RAISE NOTICE '2. Create accept invitation page UI';
  RAISE NOTICE '3. Setup email sending (Resend/SendGrid)';
  RAISE NOTICE '4. Test invitation flow end-to-end';
END $$;
