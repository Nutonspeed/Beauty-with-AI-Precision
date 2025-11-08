-- AI Beauty Platform - Supabase Migration Script
-- This script creates all necessary tables in Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'clinic_owner', 'sales_staff', 'customer_free', 'customer_premium')),
  tenant_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tenants table
CREATE TABLE tenants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  branding JSONB NOT NULL DEFAULT '{}',
  features JSONB NOT NULL DEFAULT '{}',
  subscription JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_trial BOOLEAN DEFAULT false,
  isolation_strategy TEXT DEFAULT 'shared_schema',
  usage JSONB NOT NULL DEFAULT '{}'
);

-- User profiles table
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skin_type TEXT CHECK (skin_type IN ('oily', 'dry', 'combination', 'normal', 'sensitive')),
  primary_concerns JSONB DEFAULT '[]',
  allergies TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Skin analyses table
CREATE TABLE skin_analyses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  concerns JSONB NOT NULL,
  heatmap_data JSONB,
  metrics JSONB NOT NULL,
  ai_version TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Treatment plans table
CREATE TABLE treatment_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_id TEXT,
  concern_type TEXT NOT NULL,
  treatments JSONB NOT NULL,
  schedule JSONB NOT NULL,
  estimated_cost DECIMAL(10, 2),
  estimated_duration TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  treatment_type TEXT NOT NULL,
  appointment_date TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_skin_analyses_user_id_created_at ON skin_analyses(user_id, created_at DESC);
CREATE INDEX idx_treatment_plans_user_id_active ON treatment_plans(user_id, is_active);
CREATE INDEX idx_bookings_user_id_date ON bookings(user_id, appointment_date);
CREATE INDEX idx_bookings_tenant_id_date ON bookings(tenant_id, appointment_date);

-- Add foreign key constraint for tenants
ALTER TABLE users ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_plans_updated_at BEFORE UPDATE ON treatment_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default super admin user (password: admin123)
INSERT INTO users (id, email, password, name, role, is_active)
VALUES (
  'user_superadmin_001',
  'admin@ai367bar.com',
  '$2a$10$rOzJQjKvXGKZXQKXQKXQKe.vKvXGKZXQKXQKXQKXQKXQKXQKXQKXQ',
  'Super Admin',
  'super_admin',
  true
);

COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON TABLE tenants IS 'Multi-tenant clinic organizations';
COMMENT ON TABLE user_profiles IS 'User skin profiles and preferences';
COMMENT ON TABLE skin_analyses IS 'AI-powered skin analysis results';
COMMENT ON TABLE treatment_plans IS 'Personalized treatment recommendations';
COMMENT ON TABLE bookings IS 'Appointment bookings for clinic visits';
