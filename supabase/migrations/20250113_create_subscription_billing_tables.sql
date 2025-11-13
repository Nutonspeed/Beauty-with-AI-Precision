-- ============================================================================
-- Subscription and Billing Tables for Super Admin Dashboard
-- Date: 2025-01-13
-- Purpose: Track clinic subscriptions, billing, and revenue metrics
-- ============================================================================

-- ============================================================================
-- STEP 1: Add subscription_plans table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_interval TEXT CHECK (billing_interval IN ('monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
  price_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'THB',
  max_users INT,
  max_storage_gb INT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);

-- ============================================================================
-- STEP 2: Add clinic_subscriptions table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clinic_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'past_due', 'cancelled', 'trial', 'paused')) DEFAULT 'trial',
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  mrr DECIMAL(10,2) DEFAULT 0, -- Monthly Recurring Revenue
  arr DECIMAL(10,2) DEFAULT 0, -- Annual Recurring Revenue
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinic_subscriptions_clinic ON public.clinic_subscriptions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_subscriptions_status ON public.clinic_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_clinic_subscriptions_plan ON public.clinic_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_clinic_subscriptions_period_end ON public.clinic_subscriptions(current_period_end);

-- ============================================================================
-- STEP 3: Add billing_invoices table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.clinic_subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')) DEFAULT 'open',
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_clinic ON public.billing_invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_subscription ON public.billing_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON public.billing_invoices(status);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_due_date ON public.billing_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_invoice_number ON public.billing_invoices(invoice_number);

-- ============================================================================
-- STEP 4: Add payment_transactions table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES public.billing_invoices(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'THB',
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')) DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_clinic ON public.payment_transactions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice ON public.payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created ON public.payment_transactions(created_at DESC);

-- ============================================================================
-- STEP 5: Add RLS policies
-- ============================================================================

-- subscription_plans (read-only for all authenticated users)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Super admins can view subscription plans"
  ON public.subscription_plans
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Super admins can manage subscription plans" ON public.subscription_plans;
CREATE POLICY "Super admins can manage subscription plans"
  ON public.subscription_plans
  FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- clinic_subscriptions
ALTER TABLE public.clinic_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view all subscriptions" ON public.clinic_subscriptions;
CREATE POLICY "Super admins can view all subscriptions"
  ON public.clinic_subscriptions
  FOR SELECT
  USING (is_super_admin());

DROP POLICY IF EXISTS "Clinics can view own subscription" ON public.clinic_subscriptions;
CREATE POLICY "Clinics can view own subscription"
  ON public.clinic_subscriptions
  FOR SELECT
  USING (clinic_id = get_user_clinic_id());

DROP POLICY IF EXISTS "Super admins can manage subscriptions" ON public.clinic_subscriptions;
CREATE POLICY "Super admins can manage subscriptions"
  ON public.clinic_subscriptions
  FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- billing_invoices
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view all invoices" ON public.billing_invoices;
CREATE POLICY "Super admins can view all invoices"
  ON public.billing_invoices
  FOR SELECT
  USING (is_super_admin());

DROP POLICY IF EXISTS "Clinics can view own invoices" ON public.billing_invoices;
CREATE POLICY "Clinics can view own invoices"
  ON public.billing_invoices
  FOR SELECT
  USING (clinic_id = get_user_clinic_id());

DROP POLICY IF EXISTS "Super admins can manage invoices" ON public.billing_invoices;
CREATE POLICY "Super admins can manage invoices"
  ON public.billing_invoices
  FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view all transactions" ON public.payment_transactions;
CREATE POLICY "Super admins can view all transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (is_super_admin());

DROP POLICY IF EXISTS "Clinics can view own transactions" ON public.payment_transactions;
CREATE POLICY "Clinics can view own transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (clinic_id = get_user_clinic_id());

DROP POLICY IF EXISTS "Super admins can manage transactions" ON public.payment_transactions;
CREATE POLICY "Super admins can manage transactions"
  ON public.payment_transactions
  FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================================================
-- STEP 6: Insert default subscription plans
-- ============================================================================
INSERT INTO public.subscription_plans (name, billing_interval, price_amount, max_users, max_storage_gb, features)
VALUES 
  ('Starter', 'monthly', 1990.00, 3, 10, '["Basic Dashboard", "Customer Management", "Appointment Booking", "Email Support"]'::jsonb),
  ('Professional', 'monthly', 4990.00, 10, 50, '["Advanced Dashboard", "Customer Management", "Appointment Booking", "AI Analysis", "Priority Support", "Custom Reports"]'::jsonb),
  ('Enterprise', 'monthly', 9990.00, null, 200, '["Full Dashboard", "Customer Management", "Appointment Booking", "AI Analysis", "24/7 Support", "Custom Reports", "API Access", "White Label"]'::jsonb),
  ('Professional', 'yearly', 49900.00, 10, 50, '["Advanced Dashboard", "Customer Management", "Appointment Booking", "AI Analysis", "Priority Support", "Custom Reports"]'::jsonb),
  ('Enterprise', 'yearly', 99900.00, null, 200, '["Full Dashboard", "Customer Management", "Appointment Booking", "AI Analysis", "24/7 Support", "Custom Reports", "API Access", "White Label"]'::jsonb)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.subscription_plans IS 'Available subscription plans for clinics';
COMMENT ON TABLE public.clinic_subscriptions IS 'Active subscriptions for each clinic';
COMMENT ON TABLE public.billing_invoices IS 'Billing invoices for clinic subscriptions';
COMMENT ON TABLE public.payment_transactions IS 'Payment transactions for invoices';
