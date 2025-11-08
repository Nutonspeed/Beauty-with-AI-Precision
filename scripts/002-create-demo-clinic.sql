-- Create Demo Clinic for Testing
-- This clinic will be used by demo accounts

-- Ensure clinics table exists
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#8b5cf6',
  subdomain TEXT UNIQUE,
  custom_domain TEXT,
  plan_tier TEXT CHECK (plan_tier IN ('starter', 'professional', 'enterprise')) DEFAULT 'professional',
  plan_status TEXT CHECK (plan_status IN ('trial', 'active', 'cancelled', 'expired')) DEFAULT 'active',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  monthly_price NUMERIC(10, 2),
  billing_cycle TEXT,
  billing_email TEXT,
  features JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  max_users INTEGER DEFAULT 10,
  max_storage_gb INTEGER DEFAULT 5,
  onboarding_completed BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clinics
DROP POLICY IF EXISTS "Clinic owners can view their clinic" ON public.clinics;
CREATE POLICY "Clinic owners can view their clinic"
  ON public.clinics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.clinic_id = clinics.id
      AND users.role IN ('clinic_owner', 'sales_staff')
    )
  );

DROP POLICY IF EXISTS "Super admins can view all clinics" ON public.clinics;
CREATE POLICY "Super admins can view all clinics"
  ON public.clinics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Insert demo clinic
INSERT INTO public.clinics (
  id,
  name,
  slug,
  email,
  phone,
  primary_color,
  secondary_color,
  plan_tier,
  plan_status,
  monthly_price,
  billing_cycle,
  features,
  settings,
  max_users,
  max_storage_gb,
  onboarding_completed,
  is_active
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Demo Beauty Clinic',
  'demo-clinic',
  'contact@demo-clinic.com',
  '+66-2-123-4567',
  '#3b82f6',
  '#8b5cf6',
  'professional',
  'active',
  9900.00,
  'monthly',
  '{
    "aiAnalysisEnabled": true,
    "advancedReporting": true,
    "multiLocationSupport": false,
    "apiAccess": true,
    "customBranding": true,
    "prioritySupport": true
  }'::JSONB,
  '{
    "timezone": "Asia/Bangkok",
    "defaultLanguage": "th",
    "supportedLanguages": ["th", "en"],
    "currency": "THB",
    "businessHours": {
      "monday": {"open": "09:00", "close": "18:00", "closed": false},
      "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
      "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
      "thursday": {"open": "09:00", "close": "18:00", "closed": false},
      "friday": {"open": "09:00", "close": "18:00", "closed": false},
      "saturday": {"open": "10:00", "close": "16:00", "closed": false},
      "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }
  }'::JSONB,
  10,
  5,
  true,
  true
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = NOW();
