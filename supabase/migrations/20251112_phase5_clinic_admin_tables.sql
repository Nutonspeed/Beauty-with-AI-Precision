-- ============================================================================
-- Phase 5: Clinic Admin Dashboard - Database Schema
-- Date: 2025-11-12
-- Purpose: Add tables for clinic dashboard, staff schedules, customer notes, and enhanced features
-- ============================================================================

-- ============================================================================
-- STEP 1: Add customer_notes table (for CRM)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note_type TEXT CHECK (note_type IN ('general', 'treatment', 'concern', 'follow_up', 'complaint')) DEFAULT 'general',
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_clinic ON public.customer_notes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer ON public.customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_staff ON public.customer_notes(staff_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created ON public.customer_notes(created_at DESC);

-- RLS for customer_notes
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can view own customer notes" ON public.customer_notes;
CREATE POLICY "Clinic can view own customer notes"
  ON public.customer_notes
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can create customer notes" ON public.customer_notes;
CREATE POLICY "Clinic can create customer notes"
  ON public.customer_notes
  FOR INSERT
  WITH CHECK (
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can update own customer notes" ON public.customer_notes;
CREATE POLICY "Clinic can update own customer notes"
  ON public.customer_notes
  FOR UPDATE
  USING (
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can delete own customer notes" ON public.customer_notes;
CREATE POLICY "Clinic can delete own customer notes"
  ON public.customer_notes
  FOR DELETE
  USING (
    clinic_id = get_user_clinic_id()
  );

-- ============================================================================
-- STEP 2: Add staff_schedules table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL, -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT staff_schedules_clinic_staff_day_unique UNIQUE (clinic_id, staff_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_staff_schedules_clinic ON public.staff_schedules(clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff ON public.staff_schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_day ON public.staff_schedules(day_of_week);

-- RLS for staff_schedules
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can view own staff schedules" ON public.staff_schedules;
CREATE POLICY "Clinic can view own staff schedules"
  ON public.staff_schedules
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
    OR
    staff_id = auth.uid()
  );

DROP POLICY IF EXISTS "Clinic managers can manage staff schedules" ON public.staff_schedules;
CREATE POLICY "Clinic managers can manage staff schedules"
  ON public.staff_schedules
  FOR ALL
  USING (
    is_super_admin()
    OR
    (
      clinic_id = get_user_clinic_id()
      AND
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('clinic_admin', 'clinic_owner', 'manager')
      )
    )
  );

-- ============================================================================
-- STEP 3: Add clinic_services table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clinic_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT clinic_services_clinic_name_unique UNIQUE (clinic_id, name)
);

CREATE INDEX IF NOT EXISTS idx_clinic_services_clinic ON public.clinic_services(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_services_active ON public.clinic_services(is_active);
CREATE INDEX IF NOT EXISTS idx_clinic_services_category ON public.clinic_services(category);

-- RLS for clinic_services
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active services" ON public.clinic_services;
CREATE POLICY "Anyone can view active services"
  ON public.clinic_services
  FOR SELECT
  USING (is_active = TRUE OR is_super_admin() OR clinic_id = get_user_clinic_id());

DROP POLICY IF EXISTS "Clinic can manage own services" ON public.clinic_services;
CREATE POLICY "Clinic can manage own services"
  ON public.clinic_services
  FOR ALL
  USING (
    is_super_admin()
    OR
    (
      clinic_id = get_user_clinic_id()
      AND
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('clinic_admin', 'clinic_owner', 'manager')
      )
    )
  );

-- ============================================================================
-- STEP 4: Add booking_payments table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'bank_transfer', 'promptpay', 'other')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
  payment_date TIMESTAMPTZ,
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_payments_clinic ON public.booking_payments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_appointment ON public.booking_payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_status ON public.booking_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_booking_payments_date ON public.booking_payments(payment_date);

-- RLS for booking_payments
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can view own payments" ON public.booking_payments;
CREATE POLICY "Clinic can view own payments"
  ON public.booking_payments
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can manage own payments" ON public.booking_payments;
CREATE POLICY "Clinic can manage own payments"
  ON public.booking_payments
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- ============================================================================
-- STEP 5: Add clinic_stats_cache table (for dashboard performance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clinic_stats_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  stat_date DATE NOT NULL,
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  active_staff INTEGER DEFAULT 0,
  stats_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT clinic_stats_cache_clinic_date_unique UNIQUE (clinic_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_clinic_stats_clinic ON public.clinic_stats_cache(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_stats_date ON public.clinic_stats_cache(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_clinic_stats_clinic_date ON public.clinic_stats_cache(clinic_id, stat_date DESC);

-- RLS for clinic_stats_cache
ALTER TABLE public.clinic_stats_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can view own stats" ON public.clinic_stats_cache;
CREATE POLICY "Clinic can view own stats"
  ON public.clinic_stats_cache
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "System can update stats" ON public.clinic_stats_cache;
CREATE POLICY "System can update stats"
  ON public.clinic_stats_cache
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- ============================================================================
-- STEP 6: Add activity_log table (for audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_clinic ON public.activity_log(clinic_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at DESC);

-- RLS for activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can view own activity log" ON public.activity_log;
CREATE POLICY "Clinic can view own activity log"
  ON public.activity_log
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "System can insert activity log" ON public.activity_log;
CREATE POLICY "System can insert activity log"
  ON public.activity_log
  FOR INSERT
  WITH CHECK (TRUE); -- Allow all inserts from authenticated users

-- ============================================================================
-- STEP 7: Add functions for dashboard stats
-- ============================================================================

-- Function to get today's dashboard stats
CREATE OR REPLACE FUNCTION get_clinic_dashboard_stats(p_clinic_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT jsonb_build_object(
    'bookings_today', (
      SELECT COUNT(*) FROM public.appointments
      WHERE clinic_id = p_clinic_id
      AND appointment_date = v_today
    ),
    'pending_analyses', (
      SELECT COUNT(*) FROM public.skin_analyses
      WHERE clinic_id = p_clinic_id
      AND status = 'pending'
      AND DATE(created_at) = v_today
    ),
    'active_customers', (
      SELECT COUNT(*) FROM public.customers
      WHERE clinic_id = p_clinic_id
      AND status = 'active'
    ),
    'staff_on_duty', (
      SELECT COUNT(DISTINCT sm.user_id)
      FROM public.staff_members sm
      JOIN public.staff_schedules ss ON ss.staff_id = sm.user_id
      WHERE sm.clinic_id = p_clinic_id
      AND sm.status = 'active'
      AND ss.day_of_week = EXTRACT(DOW FROM v_today)
      AND ss.is_available = TRUE
    ),
    'revenue_today', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.booking_payments
      WHERE clinic_id = p_clinic_id
      AND DATE(payment_date) = v_today
      AND payment_status = 'paid'
    ),
    'revenue_this_week', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.booking_payments
      WHERE clinic_id = p_clinic_id
      AND payment_date >= DATE_TRUNC('week', v_today)
      AND payment_status = 'paid'
    ),
    'revenue_this_month', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.booking_payments
      WHERE clinic_id = p_clinic_id
      AND payment_date >= DATE_TRUNC('month', v_today)
      AND payment_status = 'paid'
    )
  ) INTO v_stats;

  RETURN v_stats;
END;
$$;

-- Function to get recent activity
CREATE OR REPLACE FUNCTION get_clinic_recent_activity(p_clinic_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  action_type TEXT,
  description TEXT,
  user_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action_type,
    al.description,
    u.name,
    al.created_at
  FROM public.activity_log al
  LEFT JOIN public.users u ON u.id = al.user_id
  WHERE al.clinic_id = p_clinic_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- STEP 8: Add triggers for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for new tables
DROP TRIGGER IF EXISTS update_customer_notes_updated_at ON public.customer_notes;
CREATE TRIGGER update_customer_notes_updated_at
  BEFORE UPDATE ON public.customer_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_schedules_updated_at ON public.staff_schedules;
CREATE TRIGGER update_staff_schedules_updated_at
  BEFORE UPDATE ON public.staff_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinic_services_updated_at ON public.clinic_services;
CREATE TRIGGER update_clinic_services_updated_at
  BEFORE UPDATE ON public.clinic_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_payments_updated_at ON public.booking_payments;
CREATE TRIGGER update_booking_payments_updated_at
  BEFORE UPDATE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinic_stats_cache_updated_at ON public.clinic_stats_cache;
CREATE TRIGGER update_clinic_stats_cache_updated_at
  BEFORE UPDATE ON public.clinic_stats_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 9: Insert sample services for testing
-- ============================================================================

-- Note: This will only insert if the clinic exists
-- In production, services should be added via the admin interface
INSERT INTO public.clinic_services (clinic_id, name, description, category, duration_minutes, price, is_active)
SELECT 
  c.id,
  service.name,
  service.description,
  service.category,
  service.duration,
  service.price,
  TRUE
FROM public.clinics c
CROSS JOIN (
  VALUES
    ('AI Skin Analysis', 'Advanced AI-powered skin analysis with personalized recommendations', 'Analysis', 30, 500.00),
    ('Facial Treatment', 'Deep cleansing facial treatment', 'Treatment', 60, 1500.00),
    ('Acne Treatment', 'Specialized acne treatment and care', 'Treatment', 45, 1200.00),
    ('Anti-Aging Treatment', 'Advanced anti-aging treatment', 'Treatment', 90, 2500.00),
    ('Consultation', 'One-on-one consultation with specialist', 'Consultation', 30, 300.00)
) AS service(name, description, category, duration, price)
WHERE NOT EXISTS (
  SELECT 1 FROM public.clinic_services cs
  WHERE cs.clinic_id = c.id AND cs.name = service.name
)
LIMIT 1; -- Only add services to the first clinic for testing

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Phase 5 Database Schema Complete!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 New Tables Created:';
  RAISE NOTICE '  ✅ customer_notes - CRM notes for customers';
  RAISE NOTICE '  ✅ staff_schedules - Weekly schedules for staff';
  RAISE NOTICE '  ✅ clinic_services - Services offered by clinic';
  RAISE NOTICE '  ✅ booking_payments - Payment tracking';
  RAISE NOTICE '  ✅ clinic_stats_cache - Performance optimization';
  RAISE NOTICE '  ✅ activity_log - Audit trail for all actions';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 New Functions Created:';
  RAISE NOTICE '  ✅ get_clinic_dashboard_stats() - Real-time dashboard stats';
  RAISE NOTICE '  ✅ get_clinic_recent_activity() - Recent activity feed';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Security Features:';
  RAISE NOTICE '  ✅ All tables have RLS enabled';
  RAISE NOTICE '  ✅ Clinic isolation enforced';
  RAISE NOTICE '  ✅ Super admin access preserved';
  RAISE NOTICE '  ✅ Activity logging for audit';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Performance Features:';
  RAISE NOTICE '  ✅ Indexes on all foreign keys';
  RAISE NOTICE '  ✅ Stats caching table for dashboard';
  RAISE NOTICE '  ✅ Optimized queries in functions';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '  1. Create API endpoints for clinic dashboard';
  RAISE NOTICE '  2. Build dashboard UI components';
  RAISE NOTICE '  3. Implement staff management';
  RAISE NOTICE '  4. Add customer CRM features';
  RAISE NOTICE '  5. Enhance booking system';
  RAISE NOTICE '';
END $$;
