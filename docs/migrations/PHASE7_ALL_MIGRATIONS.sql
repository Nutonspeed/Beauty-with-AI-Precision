-- ============================================================================
-- 🚀 PHASE 7: COMPLETE DATABASE MIGRATION - ALL IN ONE
-- ============================================================================
-- วันที่: 3 พฤศจิกายน 2025
-- วิธีรัน: Supabase Dashboard → SQL Editor → New Query → Copy ทั้งหมด → Run
-- เวลา: ~2-3 นาที
-- ============================================================================

-- ⚠️ IMPORTANT: รัน script นี้ครั้งเดียวเท่านั้น!
-- ถ้ามี error "already exists" = ปกติ (ข้ามไปได้)

BEGIN;

-- ============================================================================
-- STEP 1: CREATE CLINICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),

  -- Business settings
  business_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "09:00", "close": "17:00", "closed": false},
    "sunday": {"open": null, "close": null, "closed": true}
  }'::jsonb,

  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#1F2937',

  -- Settings
  timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
  currency VARCHAR(3) DEFAULT 'THB',
  language VARCHAR(5) DEFAULT 'th',

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Owner
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clinics
DROP POLICY IF EXISTS "Clinic staff can view their clinic" ON clinics;
CREATE POLICY "Clinic staff can view their clinic"
  ON clinics FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.clinic_id = clinics.id)
  );

DROP POLICY IF EXISTS "Super admins can manage all clinics" ON clinics;
CREATE POLICY "Super admins can manage all clinics"
  ON clinics FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinics_owner_id ON clinics(owner_id);
CREATE INDEX IF NOT EXISTS idx_clinics_slug ON clinics(slug);


-- ============================================================================
-- STEP 2: CREATE CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,

  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),

  -- Skin Profile
  skin_type VARCHAR(50),
  skin_concerns TEXT[],
  allergies TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,

  -- Lead Management
  lead_status VARCHAR(50) DEFAULT 'new',
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_source VARCHAR(100),
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  next_follow_up_at TIMESTAMP WITH TIME ZONE,

  -- Marketing
  email_subscribed BOOLEAN NOT NULL DEFAULT true,
  sms_subscribed BOOLEAN NOT NULL DEFAULT true,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT customers_clinic_email_unique UNIQUE (clinic_id, email)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
DROP POLICY IF EXISTS "Clinic staff can manage their clinic customers" ON customers;
CREATE POLICY "Clinic staff can manage their clinic customers"
  ON customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = customers.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff')
    )
  );

DROP POLICY IF EXISTS "Super admins can manage all customers" ON customers;
CREATE POLICY "Super admins can manage all customers"
  ON customers FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_clinic_id ON customers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);


-- ============================================================================
-- STEP 3: CREATE SERVICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,

  -- Service Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  service_type VARCHAR(100),

  -- Pricing and Duration
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  currency VARCHAR(3) DEFAULT 'THB',

  -- Service Settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  max_bookings_per_day INTEGER,
  requires_consultation BOOLEAN NOT NULL DEFAULT false,

  -- Images
  image_url TEXT,
  thumbnail_url TEXT,

  -- Additional Information
  benefits TEXT[],
  contraindications TEXT,
  preparation_instructions TEXT,
  aftercare_instructions TEXT,

  -- Metadata
  internal_notes TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT services_clinic_name_unique UNIQUE (clinic_id, name)
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
DROP POLICY IF EXISTS "Clinic staff can manage their clinic services" ON services;
CREATE POLICY "Clinic staff can manage their clinic services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = services.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin')
    )
  );

DROP POLICY IF EXISTS "Public can view active services" ON services;
CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  USING (is_active = true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_services_clinic_id ON services(clinic_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);


-- ============================================================================
-- STEP 4: CREATE BOOKING STATUS ENUM & BOOKINGS TABLE
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Booking Details
  treatment_type VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),

  -- Status and Lifecycle
  status booking_status NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,

  -- Staff Assignment
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,

  -- Communication
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  follow_up_sent BOOLEAN NOT NULL DEFAULT false,
  follow_up_sent_at TIMESTAMP WITH TIME ZONE,

  -- Cancellation
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
DROP POLICY IF EXISTS "Clinic staff can manage their clinic bookings" ON bookings;
CREATE POLICY "Clinic staff can manage their clinic bookings"
  ON bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = bookings.clinic_id
      AND users.role IN ('clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff')
    )
  );

DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
CREATE POLICY "Customers can view their own bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = bookings.customer_id
      AND customers.email IN (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_clinic_id ON bookings(clinic_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);


-- ============================================================================
-- STEP 5: CREATE USER_PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification settings
  notification_settings JSONB DEFAULT '{
    "email_bookings": true,
    "email_analyses": true,
    "email_promotions": false,
    "email_updates": true,
    "sms_reminders": true,
    "push_notifications": false
  }'::jsonb,

  -- User preferences
  language VARCHAR(10) DEFAULT 'th',
  theme VARCHAR(20) DEFAULT 'system',
  timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  currency VARCHAR(10) DEFAULT 'THB',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);


-- ============================================================================
-- STEP 6: INSERT DEFAULT CLINIC FOR EXISTING USERS
-- ============================================================================
-- เพิ่ม default clinic สำหรับ users ที่มี clinic_id อยู่แล้ว
INSERT INTO clinics (
  id,
  name,
  slug,
  description,
  is_active,
  is_verified,
  owner_id
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Default Clinic',
  'default-clinic',
  'Default clinic for existing users',
  true,
  true,
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- STEP 7: ADD MISSING FOREIGN KEY CONSTRAINTS
-- ============================================================================
-- Add foreign key for users.clinic_id (ตอนนี้ clinics มีแล้ว จะไม่ error)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_clinic_id_fkey' AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_clinic_id_fkey
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ============================================================================
-- STEP 8: CREATE UPDATED_AT TRIGGERS
-- ============================================================================
-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS trigger_clinics_updated_at ON clinics;
CREATE TRIGGER trigger_clinics_updated_at
  BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_customers_updated_at ON customers;
CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_services_updated_at ON services;
CREATE TRIGGER trigger_services_updated_at
  BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON bookings;
CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trigger_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- STEP 9: FIX RLS POLICIES (users table)
-- ============================================================================
-- ข้าม step นี้เพราะ user_profiles table ไม่มี
-- RLS policies สำหรับ users table จะใช้แบบง่ายๆ แทน
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

-- Users can view and update their own data only
CREATE POLICY "users_select_policy"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "users_update_policy"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ============================================================================
-- STEP 10: CREATE PERFORMANCE INDEXES
-- ============================================================================
-- Skin analyses indexes (if table exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skin_analyses') THEN
    CREATE INDEX IF NOT EXISTS idx_skin_analyses_user_id ON skin_analyses(user_id);
    CREATE INDEX IF NOT EXISTS idx_skin_analyses_created_at ON skin_analyses(created_at DESC);
  END IF;
END $$;

-- Chat history indexes (already created in Phase 6, but safe to re-run)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_history') THEN
    CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);
  END IF;
END $$;


COMMIT;

-- ============================================================================
-- ✅ MIGRATION COMPLETE!
-- ============================================================================
-- ตรวจสอบผลลัพธ์:
-- 1. ไป Table Editor → ดู tables ทั้งหมด (clinics, customers, services, bookings, user_preferences)
-- 2. คลิกแต่ละ table → ดู Columns, Indexes, Policies
-- 3. ถ้ามี error "already exists" = ปกติ (table มีอยู่แล้ว)
-- 4. ถ้ามี error อื่น → copy error message มาให้ agent ดู

-- Next: Phase 7 Testing (เบสิค)
-- - Login Supabase Dashboard
-- - ดู Table Editor ว่ามี 9 tables
-- - ลองสร้าง clinic 1 clinic (optional)
-- - เสร็จ!
