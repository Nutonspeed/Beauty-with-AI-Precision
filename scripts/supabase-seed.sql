-- Seed data for AI Beauty Platform
-- Creates initial test data for development and testing

-- Insert demo tenant
INSERT INTO tenants (id, slug, created_by, settings, branding, features, subscription)
VALUES (
  'tenant_demo',
  'demo-clinic',
  'system',
  '{"name": "Demo Beauty Clinic", "address": "123 Beauty Street, Bangkok", "phone": "+66-2-123-4567"}',
  '{"primaryColor": "#3b82f6", "secondaryColor": "#1e40af", "logo": "/logo.png"}',
  '{"aiAnalysis": true, "arSimulator": true, "booking": true, "multiTenant": false}',
  '{"plan": "premium", "status": "active", "expiresAt": "2025-12-31"}'
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo users
INSERT INTO users (id, email, password, name, role, tenant_id)
VALUES
  (
    'user_admin',
    'admin@demo.com',
    '$2a$10$rKvVPZqGvXqKqVXqKqVXqOqVXqKqVXqKqVXqKqVXqKqVXqKqVXqK', -- password: admin123
    'Admin User',
    'super_admin',
    NULL
  ),
  (
    'user_clinic',
    'clinic@demo.com',
    '$2a$10$rKvVPZqGvXqKqVXqKqVXqOqVXqKqVXqKqVXqKqVXqKqVXqKqVXqK', -- password: clinic123
    'Clinic Owner',
    'clinic_owner',
    'tenant_demo'
  ),
  (
    'user_customer',
    'customer@demo.com',
    '$2a$10$rKvVPZqGvXqKqVXqKqVXqOqVXqKqVXqKqVXqKqVXqKqVXqKqVXqK', -- password: customer123
    'Demo Customer',
    'customer_premium',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Insert demo user profile
INSERT INTO user_profiles (user_id, skin_type, primary_concerns, preferences)
VALUES (
  'user_customer',
  'combination',
  '["acne", "pigmentation", "pore"]',
  '{"language": "th", "notifications": true, "theme": "light"}'
)
ON CONFLICT (user_id) DO NOTHING;

-- Note: Actual password hashes should be generated using bcrypt
-- The hashes above are placeholders and won't work for authentication
