-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  description TEXT,
  unit_price NUMERIC(10, 2),
  quantity_in_stock INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER,
  unit_of_measure VARCHAR(50),
  supplier_name VARCHAR(255),
  supplier_contact TEXT,
  last_restock_date DATE,
  expiry_date DATE,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('purchase', 'usage', 'adjustment', 'return', 'waste')),
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(10, 2),
  total_cost NUMERIC(10, 2),
  reference_id UUID,
  reference_type VARCHAR(50),
  notes TEXT,
  performed_by UUID REFERENCES users(id),
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create low_stock_alerts table
CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  alert_level VARCHAR(50) CHECK (alert_level IN ('low', 'critical', 'out_of_stock')),
  notified_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_clinic ON inventory_items(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(quantity_in_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_item ON low_stock_alerts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_resolved ON low_stock_alerts(is_resolved);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clinic staff can view inventory"
  ON inventory_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = inventory_items.clinic_id
    )
  );

CREATE POLICY "Clinic staff can manage inventory"
  ON inventory_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.clinic_id = inventory_items.clinic_id
      AND users.role IN ('admin', 'clinic_staff')
    )
  );

CREATE POLICY "Clinic staff can view transactions"
  ON inventory_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inventory_items
      JOIN users ON users.clinic_id = inventory_items.clinic_id
      WHERE inventory_items.id = inventory_transactions.inventory_item_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Clinic staff can create transactions"
  ON inventory_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inventory_items
      JOIN users ON users.clinic_id = inventory_items.clinic_id
      WHERE inventory_items.id = inventory_transactions.inventory_item_id
      AND users.id = auth.uid()
      AND users.role IN ('admin', 'clinic_staff')
    )
  );

-- Trigger to update inventory quantity on transaction
CREATE OR REPLACE FUNCTION update_inventory_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type IN ('purchase', 'return') THEN
    UPDATE inventory_items
    SET quantity_in_stock = quantity_in_stock + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.inventory_item_id;
  ELSIF NEW.transaction_type IN ('usage', 'waste') THEN
    UPDATE inventory_items
    SET quantity_in_stock = quantity_in_stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.inventory_item_id;
  ELSIF NEW.transaction_type = 'adjustment' THEN
    UPDATE inventory_items
    SET quantity_in_stock = NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.inventory_item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_transaction_trigger
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_quantity();

-- Trigger to create low stock alerts
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_in_stock <= NEW.min_stock_level AND NEW.quantity_in_stock > 0 THEN
    INSERT INTO low_stock_alerts (inventory_item_id, alert_level)
    VALUES (NEW.id, 'low')
    ON CONFLICT DO NOTHING;
  ELSIF NEW.quantity_in_stock = 0 THEN
    INSERT INTO low_stock_alerts (inventory_item_id, alert_level)
    VALUES (NEW.id, 'out_of_stock')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER low_stock_alert_trigger
  AFTER UPDATE OF quantity_in_stock ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock();
