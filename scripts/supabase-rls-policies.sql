-- Row Level Security (RLS) Policies for AI Beauty Platform
-- These policies ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id);

-- Tenants table policies
CREATE POLICY "Clinic owners can view their tenant"
  ON tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.tenant_id = tenants.id
      AND users.role IN ('clinic_owner', 'sales_staff')
    )
  );

CREATE POLICY "Super admins can view all tenants"
  ON tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role = 'super_admin'
    )
  );

-- User profiles table policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Skin analyses table policies
CREATE POLICY "Users can view their own analyses"
  ON skin_analyses FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own analyses"
  ON skin_analyses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Clinic staff can view analyses in their tenant"
  ON skin_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u1
      JOIN users u2 ON u1.tenant_id = u2.tenant_id
      WHERE u1.id = auth.uid()::text
      AND u2.id = skin_analyses.user_id
      AND u1.role IN ('clinic_owner', 'sales_staff')
    )
  );

-- Treatment plans table policies
CREATE POLICY "Users can view their own treatment plans"
  ON treatment_plans FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own treatment plans"
  ON treatment_plans FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own treatment plans"
  ON treatment_plans FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Clinic staff can manage treatment plans in their tenant"
  ON treatment_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u1
      JOIN users u2 ON u1.tenant_id = u2.tenant_id
      WHERE u1.id = auth.uid()::text
      AND u2.id = treatment_plans.user_id
      AND u1.role IN ('clinic_owner', 'sales_staff')
    )
  );

-- Bookings table policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Clinic staff can manage bookings in their tenant"
  ON bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.tenant_id = bookings.tenant_id
      AND users.role IN ('clinic_owner', 'sales_staff')
    )
  );

-- Service role bypass (for server-side operations)
-- The service role key bypasses RLS, so be careful with it
