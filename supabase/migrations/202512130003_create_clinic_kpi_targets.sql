CREATE TABLE IF NOT EXISTS public.clinic_kpi_targets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL UNIQUE REFERENCES public.clinics(id) ON DELETE CASCADE,
  targets jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT clinic_kpi_targets_pkey PRIMARY KEY (id)
);

DROP TRIGGER IF EXISTS update_clinic_kpi_targets_updated_at ON public.clinic_kpi_targets;
CREATE TRIGGER update_clinic_kpi_targets_updated_at
  BEFORE UPDATE ON public.clinic_kpi_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.clinic_kpi_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic can view own kpi targets" ON public.clinic_kpi_targets;
CREATE POLICY "Clinic can view own kpi targets"
  ON public.clinic_kpi_targets
  FOR SELECT
  USING (
    public.is_super_admin()
    OR clinic_id = public.get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can insert own kpi targets" ON public.clinic_kpi_targets;
CREATE POLICY "Clinic can insert own kpi targets"
  ON public.clinic_kpi_targets
  FOR INSERT
  WITH CHECK (
    public.is_super_admin()
    OR clinic_id = public.get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can update own kpi targets" ON public.clinic_kpi_targets;
CREATE POLICY "Clinic can update own kpi targets"
  ON public.clinic_kpi_targets
  FOR UPDATE
  USING (
    public.is_super_admin()
    OR clinic_id = public.get_user_clinic_id()
  )
  WITH CHECK (
    public.is_super_admin()
    OR clinic_id = public.get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Clinic can delete own kpi targets" ON public.clinic_kpi_targets;
CREATE POLICY "Clinic can delete own kpi targets"
  ON public.clinic_kpi_targets
  FOR DELETE
  USING (
    public.is_super_admin()
    OR clinic_id = public.get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Service role can manage kpi targets" ON public.clinic_kpi_targets;
CREATE POLICY "Service role can manage kpi targets"
  ON public.clinic_kpi_targets
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
