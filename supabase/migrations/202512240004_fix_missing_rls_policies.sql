-- Fix Missing RLS Policies for Production
-- Add RLS to tables that are missing it

BEGIN;

-- 1. Enable RLS on critical tables
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sales_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.skin_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.treatment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "sales_leads_select_own" ON public.sales_leads;
DROP POLICY IF EXISTS "sales_leads_insert_sales_roles" ON public.sales_leads;
DROP POLICY IF EXISTS "sales_leads_update_sales_roles" ON public.sales_leads;
DROP POLICY IF EXISTS "sales_leads_delete_sales_roles" ON public.sales_leads;
DROP POLICY IF EXISTS "sales_proposals_select_own" ON public.sales_proposals;
DROP POLICY IF EXISTS "sales_proposals_insert_own" ON public.sales_proposals;
DROP POLICY IF EXISTS "sales_proposals_update_own" ON public.sales_proposals;
DROP POLICY IF EXISTS "sales_proposals_delete_own" ON public.sales_proposals;

-- 3. Create RLS policies for appointments
CREATE POLICY "Users can view own clinic appointments" ON public.appointments
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Clinics can manage own appointments" ON public.appointments
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- 4. Create RLS policies for customers
CREATE POLICY "Users can view own clinic customers" ON public.customers
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Clinics can manage own customers" ON public.customers
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- 5. Create RLS policies for sales_leads
CREATE POLICY "Users can view own clinic sales leads" ON public.sales_leads
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Sales staff can manage own leads" ON public.sales_leads
  FOR ALL
  USING (
    is_super_admin()
    OR
    (clinic_id = get_user_clinic_id() AND get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin'))
  )
  WITH CHECK (
    is_super_admin()
    OR
    (clinic_id = get_user_clinic_id() AND get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin'))
  );

-- 6. Create RLS policies for sales_proposals
CREATE POLICY "Users can view own clinic sales proposals" ON public.sales_proposals
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Sales staff can manage own proposals" ON public.sales_proposals
  FOR ALL
  USING (
    is_super_admin()
    OR
    (clinic_id = get_user_clinic_id() AND get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin'))
  )
  WITH CHECK (
    is_super_admin()
    OR
    (clinic_id = get_user_clinic_id() AND get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin'))
  );

-- 7. Create RLS policies for skin_analyses
CREATE POLICY "Users can view own clinic skin analyses" ON public.skin_analyses
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Clinics can manage own skin analyses" ON public.skin_analyses
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- 8. Create RLS policies for treatment_records
CREATE POLICY "Users can view own clinic treatment records" ON public.treatment_records
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Clinics can manage own treatment records" ON public.treatment_records
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- 9. Create RLS policies for treatment_plans
CREATE POLICY "Users can view own clinic treatment plans" ON public.treatment_plans
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Clinics can manage own treatment plans" ON public.treatment_plans
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- 10. Create RLS policies for queue_entries
CREATE POLICY "Users can view own clinic queue entries" ON public.queue_entries
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Clinics can manage own queue entries" ON public.queue_entries
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- 11. Create RLS policies for branches
CREATE POLICY "Users can view own clinic branches" ON public.branches
  FOR SELECT
  USING (
    is_super_admin()
    OR
    manager_id = auth.uid()
    OR
    (
      SELECT clinic_id FROM public.users WHERE id = auth.uid()
    ) IN (
      SELECT id FROM public.branches WHERE manager_id = auth.uid()
    )
  );

CREATE POLICY "Clinics can manage own branches" ON public.branches
  FOR ALL
  USING (
    is_super_admin()
    OR
    manager_id = auth.uid()
  )
  WITH CHECK (
    is_super_admin()
    OR
    manager_id = auth.uid()
  );

-- 12. Create RLS policies for services
CREATE POLICY "Users can view own clinic services" ON public.services
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

CREATE POLICY "Clinics can manage own services" ON public.services
  FOR ALL
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  )
  WITH CHECK (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

-- 13. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON public.appointments(clinic_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_clinic_created ON public.customers(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_leads_clinic_status ON public.sales_leads(clinic_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_proposals_clinic_status ON public.sales_proposals(clinic_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_clinic_created ON public.skin_analyses(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_treatment_records_clinic_date ON public.treatment_records(clinic_id, treatment_date DESC);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_clinic_status ON public.treatment_plans(clinic_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queue_entries_clinic_status ON public.queue_entries(clinic_id, status, check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_services_clinic_active ON public.services(clinic_id, is_active);

-- 14. Add clinic_id to user_preferences if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'clinic_id') THEN
    ALTER TABLE public.user_preferences ADD COLUMN clinic_id UUID REFERENCES public.clinics(id);
    CREATE INDEX IF NOT EXISTS idx_user_preferences_clinic ON public.user_preferences(clinic_id);
    
    -- Update existing records with clinic_id from users table
    UPDATE public.user_preferences 
    SET clinic_id = u.clinic_id 
    FROM public.users u 
    WHERE user_preferences.user_id = u.id;
  END IF;
END $$;

-- 15. Add RLS to user_preferences if clinic_id was added
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'clinic_id') THEN
    ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own clinic preferences" ON public.user_preferences;
    CREATE POLICY "Users can view own clinic preferences" ON public.user_preferences
      FOR SELECT
      USING (
        is_super_admin()
        OR
        clinic_id = get_user_clinic_id()
      );
      
    DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
    CREATE POLICY "Users can manage own preferences" ON public.user_preferences
      FOR ALL
      USING (
        is_super_admin()
        OR
        user_id = auth.uid()
      )
      WITH CHECK (
        is_super_admin()
        OR
        (user_id = auth.uid() AND clinic_id = get_user_clinic_id())
      );
  END IF;
END $$;

COMMIT;
