-- ============================================================================ 
-- Pricing Unification Migration
-- Date: 2024-12-24
-- Purpose: Unify B2C and B2B pricing plans in database as source-of-truth
-- ============================================================================

-- Add plan_type column to distinguish B2C vs B2B
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS plan_type TEXT CHECK (plan_type IN ('b2c', 'b2b')) NOT NULL DEFAULT 'b2b';

-- Add slug column for unique identification (allow null first)
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add display order for UI sorting
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add metadata for additional plan information
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscription_plans_type ON public.subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON public.subscription_plans(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_type_order ON public.subscription_plans(plan_type, display_order);

-- Clear existing data to start fresh
DELETE FROM public.subscription_plans;

-- Now add constraints after clearing data
ALTER TABLE public.subscription_plans 
ALTER COLUMN slug SET NOT NULL,
ADD CONSTRAINT subscription_plans_slug_unique UNIQUE (slug);

-- ============================================================================ 
-- B2C Plans (Individual Customers)
-- ============================================================================

INSERT INTO public.subscription_plans (
  name,
  slug,
  plan_type,
  billing_interval,
  price_amount,
  currency,
  max_users,
  max_storage_gb,
  features,
  display_order,
  metadata
) VALUES
-- Free Plan (B2C)
(
  'Free',
  'free',
  'b2c',
  'monthly',
  0,
  'THB',
  1,
  1,
  '["Basic AI Skin Analysis", "8 VISIA Metrics", "Instant Results"]'::jsonb,
  1,
  '{
    "max_customers_per_month": 10,
    "max_analyses_per_month": 20,
    "trial_days": 0,
    "name_th": "ใช้ฟรี",
    "features_th": ["AI Skin Analysis พื้นฐาน", "8 ตัวชี้วัด VISIA", "ผลลัพธ์ทันที"]
  }'::jsonb
),
-- Premium Plan (B2C)
(
  'Premium',
  'premium',
  'b2c',
  'monthly',
  4900,
  'THB',
  10,
  50,
  '["Advanced AI Analysis", "AR Treatment Simulator", "Unlimited History", "Before/After Comparison", "AI Recommendations", "Sales Dashboard", "Reports & Analytics", "Email Support"]'::jsonb,
  2,
  '{
    "max_customers_per_month": 500,
    "max_analyses_per_month": -1,
    "trial_days": 14,
    "name_th": "พรีเมียม",
    "features_th": ["AI Analysis ขั้นสูง", "AR Treatment Simulator", "บันทึกประวัติไม่จำกัด", "เปรียบเทียบผลก่อน-หลัง", "คำแนะนำส่วนตัว AI", "Sales Dashboard", "รายงานและ Analytics", "Email Support"]
  }'::jsonb
),
-- Premium Plus Plan (B2C) - Renamed from Enterprise to avoid confusion
(
  'Premium Plus',
  'premium_plus',
  'b2c',
  'monthly',
  -1,
  'THB',
  -1,
  500,
  '["All Premium Features", "Multi-Clinic Management", "Custom Branding", "API Integration", "Dedicated Support 24/7", "Custom Development", "Training & Onboarding", "SLA Guarantee"]'::jsonb,
  3,
  '{
    "max_customers_per_month": -1,
    "max_analyses_per_month": -1,
    "trial_days": 30,
    "name_th": "พรีเมียม พลัส",
    "features_th": ["ฟีเจอร์ Premium ทั้งหมด", "Multi-Clinic Management", "Custom Branding", "API Integration", "Support 24/7", "Custom Development", "Training & Onboarding", "SLA Guarantee"]
  }'::jsonb
);

-- ============================================================================ 
-- B2B Plans (Clinics)
-- ============================================================================

INSERT INTO public.subscription_plans (
  name,
  slug,
  plan_type,
  billing_interval,
  price_amount,
  currency,
  max_users,
  max_storage_gb,
  features,
  display_order,
  metadata
) VALUES
-- Starter Plan (B2B)
(
  'Starter',
  'starter',
  'b2b',
  'monthly',
  2900,
  'THB',
  5,
  10,
  '["AI Skin Analysis", "Sales Dashboard", "Basic Reports"]'::jsonb,
  1,
  '{
    "max_customers_per_month": 100,
    "max_analyses_per_month": 100,
    "trial_days": 14,
    "name_th": "เริ่มต้น",
    "features_th": ["AI Skin Analysis", "Sales Dashboard", "รายงานพื้นฐาน"]
  }'::jsonb
),
-- Professional Plan (B2B)
(
  'Professional',
  'professional',
  'b2b',
  'monthly',
  9900,
  'THB',
  20,
  50,
  '["AI Skin Analysis", "Sales Dashboard", "Advanced Reports", "AR Treatment Simulator"]'::jsonb,
  2,
  '{
    "max_customers_per_month": 500,
    "max_analyses_per_month": 500,
    "trial_days": 14,
    "name_th": "มืออาชีพ",
    "features_th": ["AI Skin Analysis", "Sales Dashboard", "รายงานขั้นสูง", "AR Treatment Simulator"]
  }'::jsonb
),
-- Enterprise Plan (B2B)
(
  'Enterprise',
  'enterprise',
  'b2b',
  'monthly',
  29900,
  'THB',
  -1,
  500,
  '["All Professional Features", "Multi-Clinic Management", "Priority Support"]'::jsonb,
  3,
  '{
    "max_customers_per_month": -1,
    "max_analyses_per_month": -1,
    "trial_days": 14,
    "name_th": "องค์กร",
    "features_th": ["ฟีเจอร์ Professional ทั้งหมด", "Multi-Clinic Management", "Support แบบ Priority"]
  }'::jsonb
);

-- ============================================================================ 
-- Update existing clinic_subscriptions to use new plan IDs
-- ============================================================================

-- Create a temporary mapping table
CREATE TEMPORARY TABLE plan_mapping AS
SELECT 
  slug,
  id as plan_id,
  plan_type
FROM public.subscription_plans;

-- Update clinic subscriptions (assuming they use B2B plans)
UPDATE public.clinic_subscriptions cs
SET plan_id = pm.plan_id
FROM plan_mapping pm
WHERE pm.plan_type = 'b2b'
AND (
  -- You may need to adjust these conditions based on your current data
  cs.plan_id IS NULL OR 
  cs.plan_id NOT IN (SELECT id FROM public.subscription_plans)
);

-- ============================================================================ 
-- Create view for easy plan access
-- ============================================================================

CREATE OR REPLACE VIEW public.subscription_plans_view AS
SELECT 
  sp.*,
  -- Extract common fields from metadata for easier access
  (sp.metadata->>'max_customers_per_month')::INTEGER as max_customers_per_month,
  (sp.metadata->>'max_analyses_per_month')::INTEGER as max_analyses_per_month,
  (sp.metadata->>'trial_days')::INTEGER as trial_days,
  sp.metadata->>'name_th' as name_th,
  sp.metadata->>'features_th' as features_th
FROM public.subscription_plans sp
WHERE sp.is_active = true
ORDER BY sp.plan_type, sp.display_order;

-- Grant access to the view
GRANT SELECT ON public.subscription_plans_view TO authenticated, anon;

-- ============================================================================ 
-- Add RLS policies for the new structure
-- ============================================================================

-- Everyone can read active plans
CREATE POLICY "Active plans are viewable by everyone" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Only super_admin can modify plans
CREATE POLICY "Super admins can manage plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      JOIN public.users pu ON u.id = pu.id
      WHERE u.id = auth.uid()
      AND pu.role = 'super_admin'
    )
  );

-- ============================================================================ 
-- Create function to get plans by type
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_plans_by_type(plan_type_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  price_amount DECIMAL,
  currency TEXT,
  max_users INTEGER,
  max_storage_gb INTEGER,
  features JSONB,
  metadata JSONB,
  max_customers_per_month INTEGER,
  max_analyses_per_month INTEGER,
  trial_days INTEGER,
  name_th TEXT,
  features_th JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    sp.slug,
    sp.price_amount,
    sp.currency,
    sp.max_users,
    sp.max_storage_gb,
    sp.features,
    sp.metadata,
    (sp.metadata->>'max_customers_per_month')::INTEGER,
    (sp.metadata->>'max_analyses_per_month')::INTEGER,
    (sp.metadata->>'trial_days')::INTEGER,
    sp.metadata->>'name_th',
    sp.metadata->>'features_th'
  FROM public.subscription_plans sp
  WHERE sp.plan_type = plan_type_param
    AND sp.is_active = true
  ORDER BY sp.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_plans_by_type TO authenticated, anon;

-- ============================================================================ 
-- Create function to check feature access
-- ============================================================================

CREATE OR REPLACE FUNCTION public.can_access_plan_feature(plan_slug_param TEXT, feature_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  plan_features JSONB;
BEGIN
  SELECT features INTO plan_features
  FROM public.subscription_plans
  WHERE slug = plan_slug_param AND is_active = true;
  
  IF plan_features IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN feature_param = ANY(SELECT value FROM jsonb_array_elements_text(plan_features));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.can_access_plan_feature TO authenticated, anon;

COMMIT;
