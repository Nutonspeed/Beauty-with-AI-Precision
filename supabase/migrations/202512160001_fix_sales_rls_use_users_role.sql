BEGIN;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'super_admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO service_role;

CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_clinic_id UUID;
BEGIN
  SELECT clinic_id INTO user_clinic_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN user_clinic_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_clinic_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_clinic_id() TO service_role;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role_name TEXT;
BEGIN
  SELECT role::TEXT INTO user_role_name
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN user_role_name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO service_role;

ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_activities ENABLE ROW LEVEL SECURITY;

UPDATE public.sales_leads sl
SET clinic_id = u.clinic_id
FROM public.users u
WHERE sl.clinic_id IS NULL
  AND sl.sales_user_id = u.id
  AND u.clinic_id IS NOT NULL;

UPDATE public.sales_proposals sp
SET clinic_id = sl.clinic_id
FROM public.sales_leads sl
WHERE sp.clinic_id IS NULL
  AND sp.lead_id = sl.id
  AND sl.clinic_id IS NOT NULL;

DROP POLICY IF EXISTS "sales_leads_select_own" ON public.sales_leads;
DROP POLICY IF EXISTS "sales_leads_insert_own" ON public.sales_leads;
DROP POLICY IF EXISTS "sales_leads_update_own" ON public.sales_leads;
DROP POLICY IF EXISTS "sales_leads_delete_own" ON public.sales_leads;
DROP POLICY IF EXISTS "Sales can view own clinic leads" ON public.sales_leads;
DROP POLICY IF EXISTS "Sales can create leads" ON public.sales_leads;

CREATE POLICY "sales_leads_select_sales_roles"
  ON public.sales_leads
  FOR SELECT
  USING (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND clinic_id = public.get_user_clinic_id()
    )
  );

CREATE POLICY "sales_leads_insert_sales_roles"
  ON public.sales_leads
  FOR INSERT
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND clinic_id = public.get_user_clinic_id()
    )
  );

CREATE POLICY "sales_leads_update_sales_roles"
  ON public.sales_leads
  FOR UPDATE
  USING (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND clinic_id = public.get_user_clinic_id()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND clinic_id = public.get_user_clinic_id()
    )
  );

CREATE POLICY "sales_leads_delete_sales_roles"
  ON public.sales_leads
  FOR DELETE
  USING (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND clinic_id = public.get_user_clinic_id()
    )
  );

DROP POLICY IF EXISTS "sales_proposals_select_own" ON public.sales_proposals;
DROP POLICY IF EXISTS "sales_proposals_insert_own" ON public.sales_proposals;
DROP POLICY IF EXISTS "sales_proposals_update_own" ON public.sales_proposals;
DROP POLICY IF EXISTS "sales_proposals_delete_own" ON public.sales_proposals;

CREATE POLICY "sales_proposals_select_sales_roles"
  ON public.sales_proposals
  FOR SELECT
  USING (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND clinic_id = public.get_user_clinic_id()
    )
  );

CREATE POLICY "sales_proposals_insert_sales_roles"
  ON public.sales_proposals
  FOR INSERT
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND clinic_id = public.get_user_clinic_id()
    )
  );

CREATE POLICY "sales_proposals_update_sales_roles"
  ON public.sales_proposals
  FOR UPDATE
  USING (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND clinic_id = public.get_user_clinic_id()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND clinic_id = public.get_user_clinic_id()
    )
  );

CREATE POLICY "sales_proposals_delete_sales_roles"
  ON public.sales_proposals
  FOR DELETE
  USING (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND clinic_id = public.get_user_clinic_id()
    )
  );

DROP POLICY IF EXISTS "sales_activities_select_own" ON public.sales_activities;
DROP POLICY IF EXISTS "sales_activities_insert_own" ON public.sales_activities;
DROP POLICY IF EXISTS "sales_activities_update_own" ON public.sales_activities;
DROP POLICY IF EXISTS "sales_activities_delete_own" ON public.sales_activities;

CREATE POLICY "sales_activities_select_sales_roles"
  ON public.sales_activities
  FOR SELECT
  USING (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.sales_leads sl
        WHERE sl.id = lead_id
          AND sl.clinic_id = public.get_user_clinic_id()
      )
    )
  );

CREATE POLICY "sales_activities_insert_sales_roles"
  ON public.sales_activities
  FOR INSERT
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.sales_leads sl
        WHERE sl.id = lead_id
          AND sl.clinic_id = public.get_user_clinic_id()
      )
    )
  );

CREATE POLICY "sales_activities_update_sales_roles"
  ON public.sales_activities
  FOR UPDATE
  USING (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.sales_leads sl
        WHERE sl.id = lead_id
          AND sl.clinic_id = public.get_user_clinic_id()
      )
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.sales_leads sl
        WHERE sl.id = lead_id
          AND sl.clinic_id = public.get_user_clinic_id()
      )
    )
  );

CREATE POLICY "sales_activities_delete_sales_roles"
  ON public.sales_activities
  FOR DELETE
  USING (
    public.is_super_admin()
    OR (
      public.get_user_role() IN ('sales_staff', 'clinic_owner', 'clinic_admin')
      AND sales_user_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.sales_leads sl
        WHERE sl.id = lead_id
          AND sl.clinic_id = public.get_user_clinic_id()
      )
    )
  );

COMMIT;
