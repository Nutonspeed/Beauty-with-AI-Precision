-- Fix RLS policies on users table to allow helper functions to work
-- The helper functions need to read from users table to get clinic_id and role
-- But RLS was blocking this access

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Service role should be able to manage all users (for admin operations)
CREATE POLICY "Service role can manage users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
