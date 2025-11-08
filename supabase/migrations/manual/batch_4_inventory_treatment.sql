-- ===================================
-- BATCH 4: INVENTORY V2 + TREATMENT HISTORY
-- Tasks 12 + 20
-- Note: This drops old inventory table first
-- ===================================

BEGIN;

-- ===================================
-- TASK 12: INVENTORY SYSTEM V2
-- ===================================

-- Drop old inventory table from 20250104_create_admin_tables.sql
DROP TABLE IF EXISTS inventory CASCADE;

-- Drop new inventory tables if they exist
DROP TABLE IF EXISTS inventory_stock_alerts CASCADE;
DROP TABLE IF EXISTS inventory_purchase_order_items CASCADE;
DROP TABLE IF EXISTS inventory_purchase_orders CASCADE;
DROP TABLE IF EXISTS inventory_stock_movements CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS inventory_suppliers CASCADE;
DROP TABLE IF EXISTS inventory_categories CASCADE;

-- 1. Inventory Categories Table
CREATE TABLE inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_category_name UNIQUE (name)
);

INSERT INTO inventory_categories (name, description) VALUES
('Medical Supplies', 'เวชภัณฑ์และอุปกรณ์ทางการแพทย์'),
('Cosmetics', 'เครื่องสำอาง ครีม เซรั่ม'),
('Medications', 'ยาและอาหารเสริม'),
('Equipment', 'อุปกรณ์และเครื่องมือ'),
('Consumables', 'วัสดุสิ้นเปลือง')
ON CONFLICT (name) DO NOTHING;

-- 2. Suppliers Table
CREATE TABLE inventory_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_supplier_name UNIQUE (name)
);

-- 3. Inventory Items Table
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 10,
  max_quantity INTEGER,
  unit_of_measure VARCHAR(50) DEFAULT 'piece',
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10, 2),
  location VARCHAR(100),
  expiry_date DATE,
  stock_status VARCHAR(20) DEFAULT 'in-stock',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_stock_status CHECK (stock_status IN ('in-stock', 'low-stock', 'out-of-stock', 'overstock'))
);

CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_stock_status ON inventory_items(stock_status);

-- 4. Stock Movements Table
CREATE TABLE inventory_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2),
  reference_type VARCHAR(50),
  reference_id UUID,
  reason TEXT,
  performed_by UUID REFERENCES auth.users(id),
  movement_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_movement_type CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer', 'return', 'waste'))
);

CREATE INDEX idx_stock_movements_item ON inventory_stock_movements(item_id);
CREATE INDEX idx_stock_movements_date ON inventory_stock_movements(movement_date DESC);

-- 5. Purchase Orders Table
CREATE TABLE inventory_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) NOT NULL UNIQUE,
  supplier_id UUID REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status VARCHAR(20) DEFAULT 'draft',
  subtotal DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_po_status CHECK (status IN ('draft', 'submitted', 'approved', 'ordered', 'received', 'cancelled')),
  CONSTRAINT check_payment_status CHECK (payment_status IN ('unpaid', 'partial', 'paid'))
);

CREATE INDEX idx_purchase_orders_number ON inventory_purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_status ON inventory_purchase_orders(status);

-- 6. Purchase Order Items Table
CREATE TABLE inventory_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES inventory_purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_quantities CHECK (quantity_received <= quantity_ordered)
);

-- 7. Stock Alerts Table
CREATE TABLE inventory_stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL,
  severity VARCHAR(20) DEFAULT 'warning',
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_alert_type CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring_soon', 'expired', 'overstock')),
  CONSTRAINT check_severity CHECK (severity IN ('info', 'warning', 'critical'))
);

-- Enable RLS
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access inventory_categories" ON inventory_categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access inventory_suppliers" ON inventory_suppliers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access inventory_items" ON inventory_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access inventory_stock_movements" ON inventory_stock_movements FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access inventory_purchase_orders" ON inventory_purchase_orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access inventory_purchase_order_items" ON inventory_purchase_order_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access inventory_stock_alerts" ON inventory_stock_alerts FOR ALL USING (auth.role() = 'service_role');

-- ===================================
-- TASK 20: TREATMENT HISTORY SYSTEM
-- ===================================

DROP TABLE IF EXISTS treatment_comparisons CASCADE;
DROP TABLE IF EXISTS treatment_outcomes CASCADE;
DROP TABLE IF EXISTS treatment_progress_notes CASCADE;
DROP TABLE IF EXISTS treatment_photos CASCADE;
DROP TABLE IF EXISTS treatment_records CASCADE;

-- 1. Treatment Records Table
CREATE TABLE treatment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  treatment_id UUID,
  treatment_name VARCHAR(255) NOT NULL,
  staff_id UUID REFERENCES auth.users(id),
  treatment_date DATE NOT NULL,
  duration INTEGER,
  status VARCHAR(20) DEFAULT 'completed',
  pre_treatment_notes TEXT,
  post_treatment_notes TEXT,
  products_used JSONB,
  equipment_used JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_treatment_status CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled'))
);

CREATE INDEX idx_treatment_records_customer ON treatment_records(customer_id);
CREATE INDEX idx_treatment_records_date ON treatment_records(treatment_date DESC);

-- 2. Treatment Photos Table
CREATE TABLE treatment_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_record_id UUID NOT NULL REFERENCES treatment_records(id) ON DELETE CASCADE,
  photo_type VARCHAR(20) NOT NULL,
  photo_url TEXT NOT NULL,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  angle VARCHAR(50),
  lighting_condition VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_photo_type CHECK (photo_type IN ('before', 'during', 'after', 'progress'))
);

-- 3. Treatment Progress Notes Table
CREATE TABLE treatment_progress_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_record_id UUID NOT NULL REFERENCES treatment_records(id) ON DELETE CASCADE,
  note_date TIMESTAMPTZ DEFAULT NOW(),
  observation TEXT NOT NULL,
  customer_feedback TEXT,
  staff_assessment TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Treatment Outcomes Table
CREATE TABLE treatment_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_record_id UUID NOT NULL REFERENCES treatment_records(id) ON DELETE CASCADE,
  outcome_date DATE NOT NULL,
  satisfaction_score INTEGER,
  effectiveness_score INTEGER,
  side_effects TEXT,
  improvements_noted TEXT,
  recommendations TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_satisfaction_score CHECK (satisfaction_score BETWEEN 1 AND 10),
  CONSTRAINT check_effectiveness_score CHECK (effectiveness_score BETWEEN 1 AND 10)
);

-- 5. Treatment Comparisons Table
CREATE TABLE treatment_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  before_photo_id UUID REFERENCES treatment_photos(id),
  after_photo_id UUID REFERENCES treatment_photos(id),
  comparison_date DATE DEFAULT CURRENT_DATE,
  time_period_days INTEGER,
  improvement_percentage DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE treatment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_progress_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access treatment_records" ON treatment_records FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access treatment_photos" ON treatment_photos FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access treatment_progress_notes" ON treatment_progress_notes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access treatment_outcomes" ON treatment_outcomes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access treatment_comparisons" ON treatment_comparisons FOR ALL USING (auth.role() = 'service_role');

COMMIT;

SELECT 'Inventory System V2: 7 tables created (old inventory table dropped)' as status
UNION ALL
SELECT 'Treatment History System: 5 tables created'
UNION ALL
SELECT 'Total: 12 tables created in this batch';
