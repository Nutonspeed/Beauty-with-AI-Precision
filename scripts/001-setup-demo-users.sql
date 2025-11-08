-- Setup Demo Users for AI Beauty Platform
-- This script creates demo accounts with proper authentication in Supabase

-- First, ensure the users table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'clinic_owner', 'sales_staff', 'customer_free', 'customer_premium')),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}',
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
CREATE POLICY "Super admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Create a function to sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, clinic_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer_free'),
    (NEW.raw_user_meta_data->>'clinic_id')::UUID
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    role = COALESCE(EXCLUDED.role, users.role),
    clinic_id = COALESCE(EXCLUDED.clinic_id, users.clinic_id),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Note: Demo users must be created through Supabase Auth API or Dashboard
-- The following are the demo accounts that should exist:
-- 
-- 1. clinic-owner@example.com (password: password123)
--    Role: clinic_owner
--    Clinic: Demo Clinic
--
-- 2. sales@example.com (password: password123)
--    Role: sales_staff
--    Clinic: Demo Clinic
--
-- 3. customer@example.com (password: password123)
--    Role: customer_free
--
-- 4. admin@ai367bar.com (password: password123)
--    Role: super_admin
--
-- These users should be created via the Supabase Dashboard or Auth API
-- with the appropriate user_metadata fields set.
