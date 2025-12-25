-- Add customer self-update RLS policy
-- Allows customers to update their own profile

-- Add user_id column to customers table if not exists
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Add customer self-update policy
DROP POLICY IF EXISTS "Customers can update own profile" ON public.customers;
CREATE POLICY "Customers can update own profile"
  ON public.customers
  FOR UPDATE
  USING (
    auth.uid() = user_id
  );

-- Add customer self-select policy
DROP POLICY IF EXISTS "Customers can view own profile" ON public.customers;
CREATE POLICY "Customers can view own profile"
  ON public.customers
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    clinic_id = get_user_clinic_id()
    OR
    is_super_admin()
  );

-- Update existing customers to link with their user_id
UPDATE public.customers
SET user_id = u.id
FROM auth.users u
WHERE customers.email = u.email
AND customers.user_id IS NULL;
