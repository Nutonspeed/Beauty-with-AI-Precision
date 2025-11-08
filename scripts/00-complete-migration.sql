-- ============================================================================
-- AI Beauty Platform - Complete Database Migration
-- ============================================================================
-- Run this script in Supabase SQL Editor to set up the entire database
-- 
-- Order of execution:
-- 1. Create extensions and types
-- 2. Create tables with relationships
-- 3. Create indexes for performance
-- 4. Enable Row Level Security (RLS)
-- 5. Create RLS policies
-- 6. Insert seed data (optional)
-- ============================================================================

-- ============================================================================
-- PART 1: Extensions and Types
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin',
    'clinic_owner',
    'sales_staff',
    'customer_free',
    'customer_premium'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE skin_type AS ENUM (
    'oily',
    'dry',
    'combination',
    'normal',
    'sensitive'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE concern_type AS ENUM (
    'wrinkle',
    'pigmentation',
    'pore',
    'redness',
    'acne',
    'dark_circle'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PART 2: Create Tables
-- ============================================================================

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY DEFAULT ('tenant_' || gen_random_uuid()::text),
  slug TEXT UNIQUE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  branding JSONB NOT NULL DEFAULT '{}',
  features JSONB NOT NULL DEFAULT '{}',
  subscription JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_trial BOOLEAN NOT NULL DEFAULT false,
  isolation_strategy TEXT NOT NULL DEFAULT 'shared_schema',
  usage JSONB NOT NULL DEFAULT '{}'
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT ('user_' || gen_random_uuid()::text),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY DEFAULT ('profile_' || gen_random_uuid()::text),
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skin_type skin_type,
  primary_concerns JSONB NOT NULL DEFAULT '[]',
  allergies TEXT,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create skin_analyses table
CREATE TABLE IF NOT EXISTS skin_analyses (
  id TEXT PRIMARY KEY DEFAULT ('analysis_' || gen_random_uuid()::text),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  concerns JSONB NOT NULL DEFAULT '{}',
  heatmap_data JSONB,
  metrics JSONB NOT NULL DEFAULT '{}',
  ai_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create treatment_plans table
CREATE TABLE IF NOT EXISTS treatment_plans (
  id TEXT PRIMARY KEY DEFAULT ('plan_' || gen_random_uuid()::text),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_id TEXT,
  concern_type TEXT NOT NULL,
  treatments JSONB NOT NULL DEFAULT '[]',
  schedule JSONB NOT NULL DEFAULT '{}',
  estimated_cost DECIMAL(10,2),
  estimated_duration TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT ('booking_' || gen_random_uuid()::text),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  treatment_type TEXT NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PART 3: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_skin_analyses_user_id ON skin_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_created_at ON skin_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_user_created ON skin_analyses(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_user_id ON treatment_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_active ON treatment_plans(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_appointment ON bookings(user_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_appointment ON bookings(tenant_id, appointment_date);

-- ============================================================================
-- PART 4: Create Triggers
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_treatment_plans_updated_at ON treatment_plans;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;

-- Add updated_at triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_plans_updated_at BEFORE UPDATE ON treatment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 5: Enable Row Level Security
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 6: Create RLS Policies
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Clinic owners can view their tenant" ON tenants;
DROP POLICY IF EXISTS "Super admins can view all tenants" ON tenants;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own analyses" ON skin_analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON skin_analyses;
DROP POLICY IF EXISTS "Clinic staff can view analyses in their tenant" ON skin_analyses;
DROP POLICY IF EXISTS "Users can view their own treatment plans" ON treatment_plans;
DROP POLICY IF EXISTS "Users can insert their own treatment plans" ON treatment_plans;
DROP POLICY IF EXISTS "Users can update their own treatment plans" ON treatment_plans;
DROP POLICY IF EXISTS "Clinic staff can manage treatment plans in their tenant" ON treatment_plans;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Clinic staff can manage bookings in their tenant" ON bookings;

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

-- ============================================================================
-- PART 7: Add Comments
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts with authentication and role information';
COMMENT ON TABLE tenants IS 'Multi-tenant clinic organizations';
COMMENT ON TABLE user_profiles IS 'Extended user profile information including skin type and preferences';
COMMENT ON TABLE skin_analyses IS 'AI-powered skin analysis results with detection data';
COMMENT ON TABLE treatment_plans IS 'Personalized treatment recommendations';
COMMENT ON TABLE bookings IS 'Appointment bookings for treatments';

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Next steps:
-- 1. Verify tables were created: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- 2. Check RLS is enabled: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- 3. Optionally run seed data script: scripts/supabase-seed.sql
-- ============================================================================
