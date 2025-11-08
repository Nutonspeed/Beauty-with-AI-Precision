-- AI Beauty Platform - Supabase Migration Script
-- This script creates all tables from the Prisma schema in Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'clinic_owner',
  'sales_staff',
  'customer_free',
  'customer_premium'
);

CREATE TYPE skin_type AS ENUM (
  'oily',
  'dry',
  'combination',
  'normal',
  'sensitive'
);

CREATE TYPE concern_type AS ENUM (
  'wrinkle',
  'pigmentation',
  'pore',
  'redness',
  'acne',
  'dark_circle'
);

CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled'
);

-- Create tenants table
CREATE TABLE tenants (
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
CREATE TABLE users (
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
CREATE TABLE user_profiles (
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
CREATE TABLE skin_analyses (
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
CREATE TABLE treatment_plans (
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
CREATE TABLE bookings (
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

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_skin_analyses_user_id ON skin_analyses(user_id);
CREATE INDEX idx_skin_analyses_created_at ON skin_analyses(created_at DESC);
CREATE INDEX idx_skin_analyses_user_created ON skin_analyses(user_id, created_at DESC);

CREATE INDEX idx_treatment_plans_user_id ON treatment_plans(user_id);
CREATE INDEX idx_treatment_plans_active ON treatment_plans(user_id, is_active);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX idx_bookings_user_appointment ON bookings(user_id, appointment_date);
CREATE INDEX idx_bookings_tenant_appointment ON bookings(tenant_id, appointment_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts with authentication and role information';
COMMENT ON TABLE tenants IS 'Multi-tenant clinic organizations';
COMMENT ON TABLE user_profiles IS 'Extended user profile information including skin type and preferences';
COMMENT ON TABLE skin_analyses IS 'AI-powered skin analysis results with detection data';
COMMENT ON TABLE treatment_plans IS 'Personalized treatment recommendations';
COMMENT ON TABLE bookings IS 'Appointment bookings for treatments';
