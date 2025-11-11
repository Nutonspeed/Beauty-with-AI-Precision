-- ============================================================================
-- Clean up existing invitations table before running new migration
-- Run this FIRST if invitations table already exists
-- ============================================================================

-- Drop existing table and related objects
DROP VIEW IF EXISTS public.active_invitations;
DROP TRIGGER IF EXISTS generate_invitation_token ON public.invitations;
DROP TRIGGER IF EXISTS update_invitations_updated_at ON public.invitations;
DROP TABLE IF EXISTS public.invitations CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS generate_token_on_insert();
DROP FUNCTION IF EXISTS accept_invitation(TEXT, UUID);
DROP FUNCTION IF EXISTS validate_invitation(TEXT);
DROP FUNCTION IF EXISTS generate_invitation_token();
DROP FUNCTION IF EXISTS expire_old_invitations();

-- Now you can run 20251111_invitation_system.sql
