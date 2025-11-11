-- =====================================================
-- Migration: Create profiles view for backward compatibility
-- =====================================================
-- The codebase uses "profiles" but database has "users"
-- This creates a view to make them compatible
-- =====================================================

-- Create profiles view that maps to users table
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
  id,
  email,
  role,
  tier AS subscription_tier,
  full_name,
  avatar_url,
  phone,
  created_at,
  updated_at,
  last_login_at,
  email_verified,
  metadata
FROM public.users;

-- Grant permissions on the view
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Create instead of triggers to make the view updatable
CREATE OR REPLACE FUNCTION public.profiles_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, tier, full_name, avatar_url, phone, metadata)
  VALUES (NEW.id, NEW.email, NEW.role, NEW.subscription_tier, NEW.full_name, NEW.avatar_url, NEW.phone, COALESCE(NEW.metadata, '{}'::jsonb));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.profiles_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    role = NEW.role,
    tier = NEW.subscription_tier,
    full_name = NEW.full_name,
    avatar_url = NEW.avatar_url,
    phone = NEW.phone,
    metadata = COALESCE(NEW.metadata, metadata),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.profiles_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS profiles_insert_trigger ON public.profiles;
DROP TRIGGER IF EXISTS profiles_update_trigger ON public.profiles;
DROP TRIGGER IF EXISTS profiles_delete_trigger ON public.profiles;

-- Create triggers
CREATE TRIGGER profiles_insert_trigger
  INSTEAD OF INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_insert();

CREATE TRIGGER profiles_update_trigger
  INSTEAD OF UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_update();

CREATE TRIGGER profiles_delete_trigger
  INSTEAD OF DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_delete();

-- Add comment
COMMENT ON VIEW public.profiles IS 'Backward compatibility view for users table. Maps users to profiles for legacy code.';
