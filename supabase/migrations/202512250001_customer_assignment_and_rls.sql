-- ============================================================================
-- Customer Assignment + Multi-Clinic RLS Hardening
-- Date: 2025-12-25
-- Purpose:
--  - Sales of each clinic manages only their own customers
--  - Sales can create customer users (auth.users + public.users)
--  - Clinic admin/owner can manage users within their clinic
--  - Super admin can access everything
--
-- Notes:
--  - This migration is written to be safe on existing schemas.
--  - It does NOT delete comments/docs.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1) Add assigned_sales_user_id to public.users (customer ownership)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'assigned_sales_user_id'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN assigned_sales_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_assigned_sales_user_id
  ON public.users(assigned_sales_user_id);

CREATE INDEX IF NOT EXISTS idx_users_clinic_role_assigned
  ON public.users(clinic_id, role, assigned_sales_user_id);

-- -----------------------------------------------------------------------------
-- 2) Helper functions (avoid relying on JWT custom claims)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.users u
    WHERE u.id = uid
      AND u.role::text = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_clinic_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.users u
    WHERE u.id = uid
      AND u.role::text IN ('clinic_admin', 'clinic_owner')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_sales_staff(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.users u
    WHERE u.id = uid
      AND u.role::text = 'sales_staff'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_clinic(uid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT clinic_id
  FROM public.users
  WHERE id = uid;
$$;

-- -----------------------------------------------------------------------------
-- 3) Harden RLS on public.users for multi-tenant and customer assignment
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop policies we are replacing (safe)
DO $$
BEGIN
  -- Policy names may differ across environments; best-effort cleanup.
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_super_admin_all'
  ) THEN
    EXECUTE 'DROP POLICY "users_select_super_admin_all" ON public.users';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_self'
  ) THEN
    EXECUTE 'DROP POLICY "users_select_self" ON public.users';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_clinic_scope'
  ) THEN
    EXECUTE 'DROP POLICY "users_select_clinic_scope" ON public.users';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_sales_assigned_customers'
  ) THEN
    EXECUTE 'DROP POLICY "users_select_sales_assigned_customers" ON public.users';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_insert_clinic_admin'
  ) THEN
    EXECUTE 'DROP POLICY "users_insert_clinic_admin" ON public.users';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_update_clinic_admin'
  ) THEN
    EXECUTE 'DROP POLICY "users_update_clinic_admin" ON public.users';
  END IF;
END $$;

-- (A) Super admin can read everything
CREATE POLICY users_select_super_admin_all
  ON public.users
  FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- (B) Everyone can read own profile
CREATE POLICY users_select_self
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- (C) Clinic owner/admin can read users in their clinic
CREATE POLICY users_select_clinic_scope
  ON public.users
  FOR SELECT
  USING (
    public.is_clinic_admin(auth.uid())
    AND clinic_id IS NOT NULL
    AND clinic_id = public.get_user_clinic(auth.uid())
  );

-- (D) Sales staff can read assigned customers within same clinic
CREATE POLICY users_select_sales_assigned_customers
  ON public.users
  FOR SELECT
  USING (
    public.is_sales_staff(auth.uid())
    AND clinic_id IS NOT NULL
    AND clinic_id = public.get_user_clinic(auth.uid())
    AND assigned_sales_user_id = auth.uid()
  );

-- (E) Clinic owner/admin can insert users in their clinic (used when creating sales/customer accounts)
CREATE POLICY users_insert_clinic_admin
  ON public.users
  FOR INSERT
  WITH CHECK (
    public.is_clinic_admin(auth.uid())
    AND clinic_id IS NOT NULL
    AND clinic_id = public.get_user_clinic(auth.uid())
  );

-- (F) Clinic owner/admin can update users in their clinic
CREATE POLICY users_update_clinic_admin
  ON public.users
  FOR UPDATE
  USING (
    public.is_clinic_admin(auth.uid())
    AND clinic_id IS NOT NULL
    AND clinic_id = public.get_user_clinic(auth.uid())
  )
  WITH CHECK (
    public.is_clinic_admin(auth.uid())
    AND clinic_id IS NOT NULL
    AND clinic_id = public.get_user_clinic(auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 4) Ensure sales_leads has clinic_id and tighten RLS model (optional safety)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sales_leads'
      AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE public.sales_leads
      ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sales_leads_clinic_sales_created
  ON public.sales_leads(clinic_id, sales_user_id, created_at DESC);

ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;

-- Drop old policy if present (we don't assume its exact name)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sales_leads' AND policyname = 'sales_leads_select_own'
  ) THEN
    EXECUTE 'DROP POLICY "sales_leads_select_own" ON public.sales_leads';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sales_leads' AND policyname = 'sales_leads_insert_own'
  ) THEN
    EXECUTE 'DROP POLICY "sales_leads_insert_own" ON public.sales_leads';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sales_leads' AND policyname = 'sales_leads_update_own'
  ) THEN
    EXECUTE 'DROP POLICY "sales_leads_update_own" ON public.sales_leads';
  END IF;
END $$;

-- Sales can read own leads; clinic admin/owner read clinic leads; super admin read all
CREATE POLICY sales_leads_select
  ON public.sales_leads
  FOR SELECT
  USING (
    public.is_super_admin(auth.uid())
    OR sales_user_id = auth.uid()
    OR (
      public.is_clinic_admin(auth.uid())
      AND clinic_id IS NOT NULL
      AND clinic_id = public.get_user_clinic(auth.uid())
    )
  );

CREATE POLICY sales_leads_insert
  ON public.sales_leads
  FOR INSERT
  WITH CHECK (
    public.is_super_admin(auth.uid())
    OR (
      public.is_sales_staff(auth.uid())
      AND sales_user_id = auth.uid()
      AND clinic_id = public.get_user_clinic(auth.uid())
    )
    OR (
      public.is_clinic_admin(auth.uid())
      AND clinic_id = public.get_user_clinic(auth.uid())
    )
  );

CREATE POLICY sales_leads_update
  ON public.sales_leads
  FOR UPDATE
  USING (
    public.is_super_admin(auth.uid())
    OR sales_user_id = auth.uid()
    OR (
      public.is_clinic_admin(auth.uid())
      AND clinic_id IS NOT NULL
      AND clinic_id = public.get_user_clinic(auth.uid())
    )
  )
  WITH CHECK (
    public.is_super_admin(auth.uid())
    OR (
      public.is_sales_staff(auth.uid())
      AND sales_user_id = auth.uid()
      AND clinic_id = public.get_user_clinic(auth.uid())
    )
    OR (
      public.is_clinic_admin(auth.uid())
      AND clinic_id = public.get_user_clinic(auth.uid())
    )
  );
