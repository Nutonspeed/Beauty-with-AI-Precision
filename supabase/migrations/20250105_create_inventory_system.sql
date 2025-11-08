-- Inventory Management System Database Schema
-- สร้างระบบจัดการคลังสินค้าสำหรับคลินิก

-- ===================================
-- 1. INVENTORY CATEGORIES TABLE
-- ===================================
DROP TABLE IF EXISTS inventory_categories CASCADE;

CREATE TABLE inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_category_name UNIQUE (name)
);

-- Insert default categories
INSERT INTO inventory_categories (name, description) VALUES
('Medical Supplies', 'เวชภัณฑ์และอุปกรณ์ทางการแพทย์'),
('Cosmetics', 'เครื่องสำอาง ครีม เซรั่ม'),
('Medications', 'ยาและอาหารเสริม'),
('Equipment', 'อุปกรณ์และเครื่องมือ'),
('Consumables', 'วัสดุสิ้นเปลือง'),
('Office Supplies', 'อุปกรณ์สำนักงาน')
ON CONFLICT (name) DO NOTHING;

-- ===================================
-- 2. SUPPLIERS TABLE
-- ===================================
DROP TABLE IF EXISTS inventory_suppliers CASCADE;

CREATE TABLE inventory_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  tax_id VARCHAR(50),
  payment_terms VARCHAR(50),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_supplier_name UNIQUE (name)
);

-- Insert sample suppliers
INSERT INTO inventory_suppliers (name, contact_person, email, phone, payment_terms) VALUES
('MediSupply Co., Ltd.', 'คุณสมชาย', 'somchai@medisupply.co.th', '02-123-4567', 'Net 30'),
('Beauty Products Thailand', 'คุณสมหญิง', 'info@beautyproducts.th', '02-234-5678', 'Net 15'),
('Thai Pharma Wholesale', 'คุณวิทย์', 'sales@thaipharma.com', '02-345-6789', 'Net 45')
ON CONFLICT (name) DO NOTHING;

-- ===================================
-- 3. INVENTORY ITEMS TABLE
-- ===================================
DROP TABLE IF EXISTS inventory_items CASCADE;

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
  
  -- Stock information
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL DEFAULT 10,
  reorder_quantity INTEGER NOT NULL DEFAULT 50,
  
  -- Pricing
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'units',
  
  -- Additional info
  barcode VARCHAR(100),
  location VARCHAR(100),
  expiry_tracking BOOLEAN DEFAULT FALSE,
  batch_tracking BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_sku UNIQUE (sku),
  CONSTRAINT chk_quantity_positive CHECK (quantity_in_stock >= 0),
  CONSTRAINT chk_min_stock_positive CHECK (min_stock_level >= 0),
  CONSTRAINT chk_prices_positive CHECK (unit_price >= 0 AND cost_price >= 0)
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX idx_inventory_items_stock_level ON inventory_items(quantity_in_stock);
CREATE INDEX idx_inventory_items_active ON inventory_items(is_active);

-- ===================================
-- 4. STOCK MOVEMENTS TABLE
-- ===================================
DROP TABLE IF EXISTS inventory_stock_movements CASCADE;

CREATE TABLE inventory_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  
  -- Movement details
  movement_type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  reference_number VARCHAR(50),
  
  -- Tracking
  user_id TEXT,
  notes TEXT,
  
  -- Pricing (for stock in)
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),
  
  -- Timestamps
  movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT chk_movement_type CHECK (movement_type IN (
    'purchase', 'sale', 'adjustment', 'return', 'transfer', 'damaged', 'expired'
  )),
  CONSTRAINT chk_quantity_not_zero CHECK (quantity != 0)
);

-- Create indexes
CREATE INDEX idx_stock_movements_item ON inventory_stock_movements(item_id);
CREATE INDEX idx_stock_movements_type ON inventory_stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON inventory_stock_movements(movement_date);
CREATE INDEX idx_stock_movements_user ON inventory_stock_movements(user_id);

-- ===================================
-- 5. PURCHASE ORDERS TABLE
-- ===================================
DROP TABLE IF EXISTS inventory_purchase_orders CASCADE;

CREATE TABLE inventory_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) NOT NULL,
  supplier_id UUID REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
  
  -- Order details
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  
  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Tracking
  created_by TEXT,
  approved_by TEXT,
  received_by TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_po_number UNIQUE (po_number),
  CONSTRAINT chk_po_status CHECK (status IN (
    'draft', 'pending', 'approved', 'ordered', 'partially_received', 'received', 'cancelled'
  ))
);

-- Create indexes
CREATE INDEX idx_po_number ON inventory_purchase_orders(po_number);
CREATE INDEX idx_po_supplier ON inventory_purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON inventory_purchase_orders(status);
CREATE INDEX idx_po_order_date ON inventory_purchase_orders(order_date);

-- ===================================
-- 6. PURCHASE ORDER ITEMS TABLE
-- ===================================
DROP TABLE IF EXISTS inventory_purchase_order_items CASCADE;

CREATE TABLE inventory_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES inventory_purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  
  -- Order details
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL,
  
  -- Calculated
  line_total DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_ordered * unit_price) STORED,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT chk_po_item_quantity_positive CHECK (quantity_ordered > 0),
  CONSTRAINT chk_po_item_received_valid CHECK (quantity_received >= 0 AND quantity_received <= quantity_ordered)
);

-- Create indexes
CREATE INDEX idx_po_items_po ON inventory_purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_item ON inventory_purchase_order_items(item_id);

-- ===================================
-- 7. STOCK ALERTS TABLE
-- ===================================
DROP TABLE IF EXISTS inventory_stock_alerts CASCADE;

CREATE TABLE inventory_stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL,
  alert_level VARCHAR(20) NOT NULL DEFAULT 'warning',
  message TEXT NOT NULL,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT chk_alert_type CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring', 'expired')),
  CONSTRAINT chk_alert_level CHECK (alert_level IN ('info', 'warning', 'critical'))
);

-- Create indexes
CREATE INDEX idx_stock_alerts_item ON inventory_stock_alerts(item_id);
CREATE INDEX idx_stock_alerts_type ON inventory_stock_alerts(alert_type);
CREATE INDEX idx_stock_alerts_acknowledged ON inventory_stock_alerts(is_acknowledged);

-- ===================================
-- FUNCTIONS AND TRIGGERS
-- ===================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_inventory_categories_updated_at
  BEFORE UPDATE ON inventory_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_suppliers_updated_at
  BEFORE UPDATE ON inventory_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON inventory_purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create stock alerts
CREATE OR REPLACE FUNCTION check_stock_levels()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete existing alerts for this item
  DELETE FROM inventory_stock_alerts 
  WHERE item_id = NEW.id 
    AND alert_type IN ('low_stock', 'out_of_stock')
    AND is_acknowledged = FALSE;
  
  -- Check if out of stock
  IF NEW.quantity_in_stock = 0 THEN
    INSERT INTO inventory_stock_alerts (item_id, alert_type, alert_level, message)
    VALUES (
      NEW.id,
      'out_of_stock',
      'critical',
      'Item is out of stock: ' || NEW.name
    );
  -- Check if below minimum stock level
  ELSIF NEW.quantity_in_stock <= NEW.min_stock_level THEN
    INSERT INTO inventory_stock_alerts (item_id, alert_type, alert_level, message)
    VALUES (
      NEW.id,
      'low_stock',
      'warning',
      'Item is below minimum stock level: ' || NEW.name || ' (Current: ' || NEW.quantity_in_stock || ', Min: ' || NEW.min_stock_level || ')'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check stock levels after updates
CREATE TRIGGER trigger_check_stock_levels
  AFTER INSERT OR UPDATE OF quantity_in_stock, min_stock_level
  ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_levels();

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS on all tables
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Policies: Clinic staff can view and manage inventory
CREATE POLICY "Clinic staff can view categories"
  ON inventory_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

CREATE POLICY "Clinic staff can view suppliers"
  ON inventory_suppliers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

CREATE POLICY "Clinic staff can view inventory items"
  ON inventory_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

CREATE POLICY "Clinic staff can manage inventory items"
  ON inventory_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

CREATE POLICY "Clinic staff can view stock movements"
  ON inventory_stock_movements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

CREATE POLICY "Clinic staff can create stock movements"
  ON inventory_stock_movements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

CREATE POLICY "Clinic staff can view purchase orders"
  ON inventory_purchase_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

CREATE POLICY "Clinic staff can manage purchase orders"
  ON inventory_purchase_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

CREATE POLICY "Clinic staff can view stock alerts"
  ON inventory_stock_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

CREATE POLICY "Clinic staff can acknowledge alerts"
  ON inventory_stock_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'clinic_owner', 'clinic_staff')
    )
  );

-- ===================================
-- SAMPLE DATA FOR TESTING
-- ===================================

-- Insert sample inventory items
DO $$
DECLARE
  cat_medical UUID;
  cat_cosmetics UUID;
  cat_medications UUID;
  sup_medisupply UUID;
  sup_beauty UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_medical FROM inventory_categories WHERE name = 'Medical Supplies';
  SELECT id INTO cat_cosmetics FROM inventory_categories WHERE name = 'Cosmetics';
  SELECT id INTO cat_medications FROM inventory_categories WHERE name = 'Medications';
  
  -- Get supplier IDs
  SELECT id INTO sup_medisupply FROM inventory_suppliers WHERE name = 'MediSupply Co., Ltd.';
  SELECT id INTO sup_beauty FROM inventory_suppliers WHERE name = 'Beauty Products Thailand';
  
  -- Insert sample items
  INSERT INTO inventory_items (sku, name, description, category_id, supplier_id, quantity_in_stock, min_stock_level, unit_price, cost_price, unit_of_measure)
  VALUES
    ('MED001', 'Botox 100U', 'Botulinum Toxin Type A', cat_medical, sup_medisupply, 15, 5, 12000, 9000, 'vial'),
    ('MED002', 'Hyaluronic Acid Filler 1ml', 'Dermal Filler', cat_medical, sup_medisupply, 25, 10, 8000, 6000, 'syringe'),
    ('COS001', 'Vitamin C Serum', 'Anti-aging serum', cat_cosmetics, sup_beauty, 50, 20, 1200, 800, 'bottle'),
    ('COS002', 'Sunscreen SPF50', 'UV Protection', cat_cosmetics, sup_beauty, 100, 30, 800, 500, 'bottle'),
    ('MED003', 'Numbing Cream 30g', 'Topical anesthetic', cat_medications, sup_medisupply, 40, 15, 350, 250, 'tube'),
    ('MED004', 'Sterile Gauze Pads', 'Medical gauze 4x4"', cat_medical, sup_medisupply, 200, 50, 50, 30, 'pack'),
    ('COS003', 'Collagen Cream', 'Anti-wrinkle cream', cat_cosmetics, sup_beauty, 3, 10, 1500, 1000, 'jar'),
    ('MED005', 'Disposable Syringes 1ml', 'Single-use syringes', cat_medical, sup_medisupply, 500, 100, 15, 10, 'piece')
  ON CONFLICT (sku) DO NOTHING;
END $$;

-- Comments
COMMENT ON TABLE inventory_categories IS 'Product categories for inventory classification';
COMMENT ON TABLE inventory_suppliers IS 'Supplier information for procurement';
COMMENT ON TABLE inventory_items IS 'Main inventory items with stock levels and pricing';
COMMENT ON TABLE inventory_stock_movements IS 'All stock movements (in/out/adjustments)';
COMMENT ON TABLE inventory_purchase_orders IS 'Purchase orders for inventory procurement';
COMMENT ON TABLE inventory_purchase_order_items IS 'Line items for purchase orders';
COMMENT ON TABLE inventory_stock_alerts IS 'Automated stock level alerts';
