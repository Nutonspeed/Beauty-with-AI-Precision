-- =====================================================
-- Create Clinic Staff Table
-- =====================================================
-- Table: clinic_staff
-- Date: 2025-01-05
-- =====================================================

-- 1. Create ENUM type for staff roles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
    CREATE TYPE staff_role AS ENUM (
      'doctor',
      'nurse',
      'therapist',
      'receptionist',
      'admin',
      'manager'
    );
    RAISE NOTICE '✅ Created ENUM type: staff_role';
  END IF;
END $$;

-- 2. Create ENUM type for staff status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_status') THEN
    CREATE TYPE staff_status AS ENUM (
      'active',
      'on_leave',
      'busy',
      'available',
      'offline'
    );
    RAISE NOTICE '✅ Created ENUM type: staff_status';
  END IF;
END $$;

-- 3. Create clinic_staff table
CREATE TABLE IF NOT EXISTS public.clinic_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  
  -- Staff Information
  role staff_role NOT NULL DEFAULT 'receptionist',
  specialty TEXT, -- e.g., "Dermatology", "Laser Treatments"
  status staff_status NOT NULL DEFAULT 'active',
  
  -- Profile
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  
  -- Performance Metrics
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_patients INTEGER DEFAULT 0,
  total_appointments INTEGER DEFAULT 0,
  
  -- Today's Workload (reset daily)
  patients_today INTEGER DEFAULT 0,
  appointments_today INTEGER DEFAULT 0,
  
  -- Schedule
  working_hours JSONB DEFAULT '{}'::jsonb, -- {monday: {start: "09:00", end: "17:00"}, ...}
  days_off TEXT[], -- e.g., ['saturday', 'sunday']
  
  -- Employment
  hired_date DATE,
  terminated_date DATE,
  
  -- Metadata
  bio TEXT,
  certifications TEXT[],
  languages TEXT[] DEFAULT ARRAY['th'],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT unique_user_clinic UNIQUE(user_id, clinic_id)
);

-- Indexes for clinic_staff
CREATE INDEX IF NOT EXISTS clinic_staff_user_id_idx ON public.clinic_staff(user_id);
CREATE INDEX IF NOT EXISTS clinic_staff_clinic_id_idx ON public.clinic_staff(clinic_id);
CREATE INDEX IF NOT EXISTS clinic_staff_role_idx ON public.clinic_staff(role);
CREATE INDEX IF NOT EXISTS clinic_staff_status_idx ON public.clinic_staff(status);
CREATE INDEX IF NOT EXISTS clinic_staff_rating_idx ON public.clinic_staff(rating DESC);
CREATE INDEX IF NOT EXISTS clinic_staff_created_at_idx ON public.clinic_staff(created_at DESC);

-- Full-text search on staff
CREATE INDEX IF NOT EXISTS clinic_staff_search_idx ON public.clinic_staff 
  USING gin(to_tsvector('english', full_name || ' ' || COALESCE(specialty, '') || ' ' || COALESCE(bio, '')));

COMMENT ON TABLE public.clinic_staff IS 'Clinic staff members and their information';

-- 4. Enable RLS
ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Clinic admin can view their clinic staff
CREATE POLICY "clinic_staff_select_clinic_admin"
  ON public.clinic_staff
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c
      WHERE c.id = clinic_staff.clinic_id
      AND c.owner_id = auth.uid()
    )
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Staff can view their own profile
CREATE POLICY "clinic_staff_select_own"
  ON public.clinic_staff
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Clinic admin can insert staff
CREATE POLICY "clinic_staff_insert_clinic_admin"
  ON public.clinic_staff
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinics c
      WHERE c.id = clinic_staff.clinic_id
      AND c.owner_id = auth.uid()
    )
    OR (auth.jwt()->>'user_role')::text IN ('clinic_admin', 'super_admin')
  );

-- Clinic admin can update their clinic staff
CREATE POLICY "clinic_staff_update_clinic_admin"
  ON public.clinic_staff
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c
      WHERE c.id = clinic_staff.clinic_id
      AND c.owner_id = auth.uid()
    )
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Staff can update their own profile
CREATE POLICY "clinic_staff_update_own"
  ON public.clinic_staff
  FOR UPDATE
  USING (
    user_id = auth.uid()
  );

-- Clinic admin can delete staff
CREATE POLICY "clinic_staff_delete_clinic_admin"
  ON public.clinic_staff
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c
      WHERE c.id = clinic_staff.clinic_id
      AND c.owner_id = auth.uid()
    )
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- 6. Create trigger for updated_at
CREATE TRIGGER update_clinic_staff_updated_at
  BEFORE UPDATE ON public.clinic_staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 7. Create function to calculate staff performance
CREATE OR REPLACE FUNCTION public.update_staff_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a placeholder for rating calculation
  -- In production, this would calculate rating from appointments/feedback
  -- For now, we just ensure rating stays within bounds
  IF NEW.rating < 0 THEN
    NEW.rating := 0;
  ELSIF NEW.rating > 5 THEN
    NEW.rating := 5;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating validation
DROP TRIGGER IF EXISTS update_staff_rating_trigger ON public.clinic_staff;
CREATE TRIGGER update_staff_rating_trigger
  BEFORE INSERT OR UPDATE OF rating ON public.clinic_staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_staff_rating();

-- 8. Create function to reset daily workload (to be called by cron job)
CREATE OR REPLACE FUNCTION public.reset_staff_daily_workload()
RETURNS void AS $$
BEGIN
  UPDATE public.clinic_staff
  SET 
    patients_today = 0,
    appointments_today = 0,
    updated_at = NOW();
  
  RAISE NOTICE 'Reset daily workload for all staff';
END;
$$ LANGUAGE plpgsql;

-- Note: In production, set up a cron job to run this function daily at midnight:
-- SELECT cron.schedule('reset-staff-workload', '0 0 * * *', 'SELECT public.reset_staff_daily_workload()');

-- =====================================================
-- SEED DATA (Demo/Testing)
-- =====================================================

-- Insert demo clinic staff
DO $$
DECLARE
  clinic_user UUID;
  clinic_rec RECORD;
  doctor_user UUID;
  nurse_user UUID;
  therapist_user UUID;
BEGIN
  -- Get clinic admin user
  SELECT id INTO clinic_user FROM public.users WHERE role = 'clinic_admin' LIMIT 1;
  
  -- Get clinic
  SELECT id INTO clinic_rec FROM public.clinics WHERE owner_id = clinic_user LIMIT 1;
  
  IF clinic_rec IS NOT NULL THEN
    -- Create demo users for staff (if not exists)
    -- Doctor
    INSERT INTO public.users (email, role, encrypted_password)
    VALUES ('doctor@clinic.com', 'clinic_staff', crypt('password123', gen_salt('bf')))
    ON CONFLICT (email) DO UPDATE SET role = 'clinic_staff'
    RETURNING id INTO doctor_user;
    
    -- Nurse
    INSERT INTO public.users (email, role, encrypted_password)
    VALUES ('nurse@clinic.com', 'clinic_staff', crypt('password123', gen_salt('bf')))
    ON CONFLICT (email) DO UPDATE SET role = 'clinic_staff'
    RETURNING id INTO nurse_user;
    
    -- Therapist
    INSERT INTO public.users (email, role, encrypted_password)
    VALUES ('therapist@clinic.com', 'clinic_staff', crypt('password123', gen_salt('bf')))
    ON CONFLICT (email) DO UPDATE SET role = 'clinic_staff'
    RETURNING id INTO therapist_user;
    
    -- Insert clinic staff records
    INSERT INTO public.clinic_staff 
      (user_id, clinic_id, role, specialty, status, full_name, email, phone, rating, total_patients, total_appointments, patients_today, appointments_today, hired_date)
    VALUES
      (doctor_user, clinic_rec, 'doctor', 'Dermatology & Laser', 'active', 'นพ. สมชาย ใจดี', 'doctor@clinic.com', '081-111-2222', 4.8, 245, 312, 8, 12, '2023-01-15'),
      (nurse_user, clinic_rec, 'nurse', 'Skin Care', 'available', 'พยาบาล วิภา สุขใจ', 'nurse@clinic.com', '081-222-3333', 4.9, 180, 256, 5, 8, '2023-03-20'),
      (therapist_user, clinic_rec, 'therapist', 'Facial Treatments', 'busy', 'นางสาว มาลี รักงาม', 'therapist@clinic.com', '081-333-4444', 4.7, 156, 198, 6, 9, '2023-06-10')
    ON CONFLICT (user_id, clinic_id) DO NOTHING;
    
    -- Insert some staff without user_id (pending accounts)
    INSERT INTO public.clinic_staff 
      (user_id, clinic_id, role, specialty, status, full_name, email, phone, rating, total_patients, total_appointments, patients_today, appointments_today, hired_date)
    VALUES
      (gen_random_uuid(), clinic_rec, 'receptionist', NULL, 'active', 'คุณสุดา ยิ้มแย้ม', 'receptionist@clinic.com', '081-444-5555', 4.5, 0, 0, 0, 0, '2024-01-10'),
      (gen_random_uuid(), clinic_rec, 'admin', NULL, 'available', 'คุณประเสริฐ จัดการดี', 'admin@clinic.com', '081-555-6666', 4.6, 0, 0, 0, 0, '2024-02-15'),
      (gen_random_uuid(), clinic_rec, 'therapist', 'Acne Treatment', 'on_leave', 'นางสาว จันทร์เพ็ญ พักผ่อน', 'therapist2@clinic.com', '081-666-7777', 4.4, 89, 112, 0, 0, '2024-03-01')
    ON CONFLICT (user_id, clinic_id) DO NOTHING;
    
    RAISE NOTICE '✅ Inserted demo clinic staff';
  ELSE
    RAISE NOTICE 'ℹ️  No clinic found, skipping demo data';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check table exists
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clinic_staff';

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'clinic_staff'
-- ORDER BY policyname;

-- Count staff by role
-- SELECT role, COUNT(*) FROM public.clinic_staff GROUP BY role;

-- Count staff by status
-- SELECT status, COUNT(*) FROM public.clinic_staff GROUP BY status;

-- View all staff with their clinic
-- SELECT 
--   cs.full_name,
--   cs.role,
--   cs.specialty,
--   cs.status,
--   cs.rating,
--   cs.patients_today,
--   c.name AS clinic_name
-- FROM public.clinic_staff cs
-- LEFT JOIN public.clinics c ON cs.clinic_id = c.id
-- ORDER BY cs.rating DESC;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
/*
DROP TRIGGER IF EXISTS update_staff_rating_trigger ON public.clinic_staff;
DROP TRIGGER IF EXISTS update_clinic_staff_updated_at ON public.clinic_staff;

DROP FUNCTION IF EXISTS public.reset_staff_daily_workload();
DROP FUNCTION IF EXISTS public.update_staff_rating();

DROP TABLE IF EXISTS public.clinic_staff;

DROP TYPE IF EXISTS staff_status;
DROP TYPE IF EXISTS staff_role;
*/
