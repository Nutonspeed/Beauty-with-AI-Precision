-- ===================================
-- Admin Dashboard Database Schema
-- ===================================

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')) NOT NULL,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  skin_type TEXT CHECK (skin_type IN ('oily', 'dry', 'combination', 'sensitive', 'normal')),
  allergies TEXT[],
  current_medications TEXT[],
  medical_history TEXT,
  skin_concerns TEXT[],
  previous_treatments TEXT[],
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  last_visit_date TIMESTAMP,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  role TEXT CHECK (role IN ('doctor', 'nurse', 'receptionist', 'admin')) NOT NULL,
  specialization TEXT,
  license_number TEXT,
  date_of_birth DATE,
  hire_date DATE DEFAULT CURRENT_DATE,
  salary DECIMAL(10, 2),
  working_hours JSONB, -- {monday: {start: "09:00", end: "18:00"}, ...}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT CHECK (category IN ('product', 'equipment', 'medicine', 'supply')) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 10,
  unit_price DECIMAL(10, 2) NOT NULL,
  supplier TEXT,
  expiry_date DATE,
  status TEXT CHECK (status IN ('in-stock', 'low-stock', 'out-of-stock')) DEFAULT 'in-stock',
  last_restocked TIMESTAMP,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_last_visit ON patients(last_visit_date DESC);

CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_is_active ON staff(is_active);

CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);

-- Triggers for Auto-Update Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Patients RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own data"
  ON patients FOR SELECT
  USING (auth.uid()::text = id OR EXISTS (
    SELECT 1 FROM staff WHERE email = auth.jwt()->>'email' AND is_active = true
  ));

CREATE POLICY "Admins can manage all patients"
  ON patients FOR ALL
  USING (EXISTS (
    SELECT 1 FROM staff WHERE email = auth.jwt()->>'email' AND role = 'admin' AND is_active = true
  ));

CREATE POLICY "Doctors can view all patients"
  ON patients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM staff WHERE email = auth.jwt()->>'email' AND role IN ('doctor', 'nurse') AND is_active = true
  ));

-- Staff RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their own data"
  ON staff FOR SELECT
  USING (email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage all staff"
  ON staff FOR ALL
  USING (EXISTS (
    SELECT 1 FROM staff WHERE email = auth.jwt()->>'email' AND role = 'admin' AND is_active = true
  ));

-- Inventory RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All staff can view inventory"
  ON inventory FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM staff WHERE email = auth.jwt()->>'email' AND is_active = true
  ));

CREATE POLICY "Admins can manage inventory"
  ON inventory FOR ALL
  USING (EXISTS (
    SELECT 1 FROM staff WHERE email = auth.jwt()->>'email' AND role = 'admin' AND is_active = true
  ));

-- Sample Data for Demo

-- Sample Patients
INSERT INTO patients (id, name, email, phone, date_of_birth, gender, skin_type, total_visits, total_spent, status) VALUES
('PAT1704326400000', 'สมหญิง ใจดี', 'somying@email.com', '081-234-5678', '1990-05-15', 'female', 'combination', 5, 75000, 'active'),
('PAT1704326401000', 'ชาตรี วงษ์ทอง', 'chatri@email.com', '082-345-6789', '1985-08-20', 'male', 'oily', 3, 45000, 'active'),
('PAT1704326402000', 'วรรณา สุขสวัสดิ์', 'wanna@email.com', '083-456-7890', '1992-11-30', 'female', 'dry', 8, 120000, 'active'),
('PAT1704326403000', 'ประเสริฐ ทองดี', 'prasert@email.com', '084-567-8901', '1988-03-25', 'male', 'normal', 2, 30000, 'active'),
('PAT1704326404000', 'สุดารัตน์ แก้วสว่าง', 'sudarat@email.com', '085-678-9012', '1995-07-10', 'female', 'sensitive', 6, 90000, 'active');

-- Sample Staff
INSERT INTO staff (id, name, email, phone, role, specialization, license_number, salary, is_active) VALUES
('STF1704326400000', 'นพ. วิทยา สุขใจ', 'dr.wittaya@clinic.com', '091-234-5678', 'doctor', 'Dermatology', 'DOC-12345', 80000, true),
('STF1704326401000', 'นพ. สุรชัย มั่งมี', 'dr.surachai@clinic.com', '092-345-6789', 'doctor', 'Aesthetic Medicine', 'DOC-12346', 85000, true),
('STF1704326402000', 'พญ. ปราณี ใจดี', 'dr.pranee@clinic.com', '093-456-7890', 'doctor', 'Laser & Anti-aging', 'DOC-12347', 90000, true),
('STF1704326403000', 'พยาบาล สมใจ ดีงาม', 'nurse.somjai@clinic.com', '094-567-8901', 'nurse', 'Clinical Nursing', 'NUR-56789', 35000, true),
('STF1704326404000', 'เจ้าหน้าที่ วิไล สวยงาม', 'wilai@clinic.com', '095-678-9012', 'receptionist', NULL, NULL, 25000, true),
('STF1704326405000', 'ผู้จัดการ ประภาส มั่งคั่ง', 'prapas@clinic.com', '096-789-0123', 'admin', 'Business Management', NULL, 60000, true);

-- Sample Inventory
INSERT INTO inventory (id, name, sku, category, quantity, min_quantity, unit_price, supplier, status) VALUES
('INV1704326400000', 'Botox 100 Units', 'SKU1704326400000', 'medicine', 50, 10, 12000, 'Allergan', 'in-stock'),
('INV1704326401000', 'Hyaluronic Acid Filler 1ml', 'SKU1704326401000', 'medicine', 30, 5, 15000, 'Juvederm', 'in-stock'),
('INV1704326402000', 'Laser Equipment Q-Switch', 'SKU1704326402000', 'equipment', 2, 1, 500000, 'Lutronic', 'in-stock'),
('INV1704326403000', 'Vitamin C Serum', 'SKU1704326403000', 'product', 8, 15, 2500, 'SkinCeuticals', 'low-stock'),
('INV1704326404000', 'Retinol Cream', 'SKU1704326404000', 'product', 5, 10, 3200, 'La Roche-Posay', 'low-stock'),
('INV1704326405000', 'Surgical Gloves (Box)', 'SKU1704326405000', 'supply', 0, 20, 350, 'Medline', 'out-of-stock'),
('INV1704326406000', 'Alcohol Swabs (Pack)', 'SKU1704326406000', 'supply', 45, 30, 120, 'BD', 'in-stock'),
('INV1704326407000', 'Needles 30G (Box)', 'SKU1704326407000', 'supply', 12, 15, 450, '3M', 'low-stock');

-- Grant Permissions
GRANT ALL ON patients TO authenticated;
GRANT ALL ON staff TO authenticated;
GRANT ALL ON inventory TO authenticated;
