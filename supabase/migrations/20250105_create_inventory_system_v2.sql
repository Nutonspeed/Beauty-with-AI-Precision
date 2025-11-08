-- Fix Inventory System Migration
-- แก้ไข migration เพื่อไม่ให้ conflict กับ existing inventory table
-- วิธีการ: ลบ old inventory table ก่อน แล้วสร้างระบบใหม่

-- ===================================
-- 0. DROP OLD INVENTORY TABLE
-- ===================================
-- ลบ old inventory table ที่สร้างจาก 20250104_create_admin_tables.sql
DROP TABLE IF EXISTS inventory CASCADE;

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

-- ===================================
-- 3. INVENTORY ITEMS TABLE (Enhanced)
-- ===================================
DROP TABLE IF EXISTS inventory_items CASCADE;

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
  
  -- Basic Information
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  barcode VARCHAR(100),
  
  -- Inventory Details
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 10,
  max_quantity INTEGER,
  reorder_point INTEGER,
  unit_of_measure VARCHAR(50) DEFAULT 'piece',
  
  -- Pricing
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10, 2),
  markup_percentage DECIMAL(5, 2),
  
  -- Location & Storage
  location VARCHAR(100),
  shelf_number VARCHAR(50),
  storage_conditions TEXT,
  
  -- Dates
  manufacture_date DATE,
  expiry_date DATE,
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  
  -- Status & Metadata
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'discontinued')) DEFAULT 'active',
  stock_status VARCHAR(20) CHECK (stock_status IN ('in-stock', 'low-stock', 'out-of-stock', 'overstock')) DEFAULT 'in-stock',
  notes TEXT,
  image_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX idx_inventory_items_stock_status ON inventory_items(stock_status);
CREATE INDEX idx_inventory_items_expiry ON inventory_items(expiry_date) WHERE expiry_date IS NOT NULL;

-- ===================================
-- 4. STOCK MOVEMENTS TABLE
-- ===================================
DROP TABLE IF EXISTS inventory_stock_movements CASCADE;

CREATE TABLE inventory_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  
  -- Movement Details
  movement_type VARCHAR(20) CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer', 'return', 'waste')) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * COALESCE(unit_cost, 0)) STORED,
  
  -- Reference
  reference_type VARCHAR(50), -- 'purchase_order', 'sale', 'treatment', 'adjustment', etc.
  reference_id UUID,
  
  -- Details
  reason TEXT,
  notes TEXT,
  performed_by UUID REFERENCES auth.users(id),
  
  -- Location
  from_location VARCHAR(100),
  to_location VARCHAR(100),
  
  movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_stock_movements_item ON inventory_stock_movements(item_id);
CREATE INDEX idx_stock_movements_type ON inventory_stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON inventory_stock_movements(movement_date DESC);
CREATE INDEX idx_stock_movements_reference ON inventory_stock_movements(reference_type, reference_id);

-- ===================================
-- 5. PURCHASE ORDERS TABLE
-- ===================================
DROP TABLE IF EXISTS inventory_purchase_orders CASCADE;

CREATE TABLE inventory_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) NOT NULL UNIQUE,
  supplier_id UUID REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
  
  -- Order Details
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Status
  status VARCHAR(20) CHECK (status IN ('draft', 'submitted', 'approved', 'ordered', 'partial', 'received', 'cancelled')) DEFAULT 'draft',
  
  -- Amounts
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  shipping_cost DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  
  -- Payment
  payment_status VARCHAR(20) CHECK (payment_status IN ('unpaid', 'partial', 'paid')) DEFAULT 'unpaid',
  payment_terms VARCHAR(100),
  
  -- Additional Info
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_purchase_orders_number ON inventory_purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_supplier ON inventory_purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON inventory_purchase_orders(status);
CREATE INDEX idx_purchase_orders_date ON inventory_purchase_orders(order_date DESC);

-- ===================================
-- 6. PURCHASE ORDER ITEMS TABLE
-- ===================================
DROP TABLE IF EXISTS inventory_purchase_order_items CASCADE;

CREATE TABLE inventory_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES inventory_purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_cost DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_quantities CHECK (quantity_received <= quantity_ordered)
);

-- Create indexes
CREATE INDEX idx_po_items_order ON inventory_purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_item ON inventory_purchase_order_items(item_id);

-- ===================================
-- 7. STOCK ALERTS TABLE
-- ===================================
DROP TABLE IF EXISTS inventory_stock_alerts CASCADE;

CREATE TABLE inventory_stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  
  alert_type VARCHAR(20) CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring_soon', 'expired', 'overstock')) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'warning',
  
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_stock_alerts_item ON inventory_stock_alerts(item_id);
CREATE INDEX idx_stock_alerts_type ON inventory_stock_alerts(alert_type);
CREATE INDEX idx_stock_alerts_resolved ON inventory_stock_alerts(is_resolved);

-- ===================================
-- 8. FUNCTIONS & TRIGGERS
-- ===================================

-- Function to update stock status based on quantity
CREATE OR REPLACE FUNCTION update_inventory_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= 0 THEN
    NEW.stock_status := 'out-of-stock';
  ELSIF NEW.quantity <= NEW.min_quantity THEN
    NEW.stock_status := 'low-stock';
  ELSIF NEW.max_quantity IS NOT NULL AND NEW.quantity >= NEW.max_quantity THEN
    NEW.stock_status := 'overstock';
  ELSE
    NEW.stock_status := 'in-stock';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_status
  BEFORE INSERT OR UPDATE OF quantity, min_quantity, max_quantity ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_stock_status();

-- Function to create stock alerts automatically
CREATE OR REPLACE FUNCTION create_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Low stock alert
  IF NEW.stock_status = 'low-stock' AND (OLD IS NULL OR OLD.stock_status != 'low-stock') THEN
    INSERT INTO inventory_stock_alerts (item_id, alert_type, severity, message)
    VALUES (NEW.id, 'low_stock', 'warning', 
            format('สินค้า %s มีจำนวนคงเหลือต่ำ (%s %s)', NEW.name, NEW.quantity, NEW.unit_of_measure));
  END IF;
  
  -- Out of stock alert
  IF NEW.stock_status = 'out-of-stock' AND (OLD IS NULL OR OLD.stock_status != 'out-of-stock') THEN
    INSERT INTO inventory_stock_alerts (item_id, alert_type, severity, message)
    VALUES (NEW.id, 'out_of_stock', 'critical', 
            format('สินค้า %s หมดสต็อก', NEW.name));
  END IF;
  
  -- Expiring soon alert (30 days)
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' 
     AND NEW.expiry_date > CURRENT_DATE THEN
    INSERT INTO inventory_stock_alerts (item_id, alert_type, severity, message)
    VALUES (NEW.id, 'expiring_soon', 'warning', 
            format('สินค้า %s ใกล้หมดอายุ (วันที่ %s)', NEW.name, NEW.expiry_date))
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Expired alert
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date <= CURRENT_DATE THEN
    INSERT INTO inventory_stock_alerts (item_id, alert_type, severity, message)
    VALUES (NEW.id, 'expired', 'critical', 
            format('สินค้า %s หมดอายุแล้ว (วันที่ %s)', NEW.name, NEW.expiry_date))
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_stock_alert
  AFTER INSERT OR UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION create_stock_alert();

-- Function to update inventory quantity on stock movement
CREATE OR REPLACE FUNCTION update_inventory_on_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type IN ('in', 'return') THEN
    UPDATE inventory_items 
    SET quantity = quantity + NEW.quantity,
        last_restocked_at = NEW.movement_date
    WHERE id = NEW.item_id;
  ELSIF NEW.movement_type IN ('out', 'waste') THEN
    UPDATE inventory_items 
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.item_id;
  ELSIF NEW.movement_type = 'adjustment' THEN
    UPDATE inventory_items 
    SET quantity = NEW.quantity
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory
  AFTER INSERT ON inventory_stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_movement();

-- Function to update PO totals
CREATE OR REPLACE FUNCTION update_purchase_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_purchase_orders
  SET subtotal = (
    SELECT COALESCE(SUM(line_total), 0)
    FROM inventory_purchase_order_items
    WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
  ),
  total_amount = subtotal + tax_amount + shipping_cost
  WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_po_totals
  AFTER INSERT OR UPDATE OR DELETE ON inventory_purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_purchase_order_totals();

-- Updated at triggers
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

CREATE TRIGGER update_po_items_updated_at
  BEFORE UPDATE ON inventory_purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS on all tables
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies (temporarily allow all for service role)
CREATE POLICY "Service role has full access to inventory_categories"
  ON inventory_categories FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to inventory_suppliers"
  ON inventory_suppliers FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to inventory_items"
  ON inventory_items FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to inventory_stock_movements"
  ON inventory_stock_movements FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to inventory_purchase_orders"
  ON inventory_purchase_orders FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to inventory_purchase_order_items"
  ON inventory_purchase_order_items FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to inventory_stock_alerts"
  ON inventory_stock_alerts FOR ALL
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON inventory_categories TO service_role;
GRANT ALL ON inventory_suppliers TO service_role;
GRANT ALL ON inventory_items TO service_role;
GRANT ALL ON inventory_stock_movements TO service_role;
GRANT ALL ON inventory_purchase_orders TO service_role;
GRANT ALL ON inventory_purchase_order_items TO service_role;
GRANT ALL ON inventory_stock_alerts TO service_role;
