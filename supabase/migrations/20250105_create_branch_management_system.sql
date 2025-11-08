-- ============================================================================
-- Branch Management System Migration
-- Beauty Clinic Management System
-- 
-- Context: This is for a BEAUTY/AESTHETICS CLINIC (คลินิกเสริมความงาม)
-- IMPORTANT: Use "customer" (ลูกค้า) NOT "patient" (ผู้ป่วย)
-- Customers seek beauty enhancement services, NOT medical treatment
-- ============================================================================

-- Table: branches
-- Purpose: Individual branch/location information for multi-location clinics
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Branch information
    branch_code VARCHAR(50) UNIQUE NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    branch_name_en VARCHAR(255),
    
    -- Location
    address TEXT NOT NULL,
    district VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Thailand',
    
    -- Geo coordinates for maps
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact information
    phone VARCHAR(50),
    email VARCHAR(255),
    line_id VARCHAR(100),
    
    -- Operating hours (JSONB for flexibility)
    business_hours JSONB DEFAULT '{}', -- {monday: {open: "09:00", close: "18:00"}, ...}
    
    -- Branch settings
    is_main_branch BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    accepts_appointments BOOLEAN DEFAULT true,
    accepts_walk_ins BOOLEAN DEFAULT true,
    
    -- Capacity settings
    max_daily_customers INTEGER,
    max_concurrent_appointments INTEGER,
    
    -- Staff information
    branch_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_staff_count INTEGER DEFAULT 0,
    
    -- Facilities (JSONB array of available facilities)
    facilities JSONB DEFAULT '[]', -- ["parking", "wifi", "wheelchair_access", "private_rooms"]
    
    -- Services available at this branch
    available_services JSONB DEFAULT '[]', -- Array of service IDs
    
    -- Inventory management
    manages_own_inventory BOOLEAN DEFAULT true,
    
    -- Financial settings
    separate_accounting BOOLEAN DEFAULT false,
    tax_id VARCHAR(50),
    
    -- Metadata
    description TEXT,
    notes TEXT,
    
    -- Status
    opening_date DATE,
    closing_date DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_branches_clinic ON branches(clinic_id);
CREATE INDEX idx_branches_code ON branches(branch_code);
CREATE INDEX idx_branches_active ON branches(is_active) WHERE is_active = true;
CREATE INDEX idx_branches_manager ON branches(branch_manager_id);
CREATE INDEX idx_branches_province ON branches(province);

COMMENT ON TABLE branches IS 'Branch locations for multi-location beauty clinics';
COMMENT ON COLUMN branches.max_daily_customers IS 'Maximum beauty clinic customers per day';

-- Table: branch_staff_assignments
-- Purpose: Assign staff members to specific branches
CREATE TABLE IF NOT EXISTS branch_staff_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Assignment details
    role VARCHAR(100), -- branch_manager, doctor, beautician, receptionist, etc.
    is_primary_branch BOOLEAN DEFAULT true,
    
    -- Schedule
    working_days JSONB DEFAULT '[]', -- Array of day names: ["monday", "tuesday", ...]
    working_hours JSONB DEFAULT '{}', -- {start: "09:00", end: "18:00"}
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    assignment_start_date DATE NOT NULL,
    assignment_end_date DATE,
    
    -- Permissions at this branch
    permissions JSONB DEFAULT '[]', -- Array of permission strings
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one primary assignment per user
    CONSTRAINT unique_staff_branch UNIQUE (branch_id, user_id)
);

CREATE INDEX idx_branch_staff_branch ON branch_staff_assignments(branch_id);
CREATE INDEX idx_branch_staff_user ON branch_staff_assignments(user_id);
CREATE INDEX idx_branch_staff_active ON branch_staff_assignments(is_active) WHERE is_active = true;
CREATE INDEX idx_branch_staff_primary ON branch_staff_assignments(is_primary_branch) WHERE is_primary_branch = true;

COMMENT ON TABLE branch_staff_assignments IS 'Staff assignments to branch locations';

-- Table: branch_inventory
-- Purpose: Track inventory levels at each branch
CREATE TABLE IF NOT EXISTS branch_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE CASCADE,
    
    -- Stock levels
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    
    -- Location in branch
    storage_location VARCHAR(255),
    bin_location VARCHAR(100),
    
    -- Stock status
    is_available BOOLEAN DEFAULT true,
    last_stock_count INTEGER,
    last_stock_count_date TIMESTAMPTZ,
    
    -- Auto-reorder settings
    auto_reorder_enabled BOOLEAN DEFAULT false,
    reorder_quantity INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one inventory record per product per branch
    CONSTRAINT unique_branch_product UNIQUE (branch_id, product_id)
);

CREATE INDEX idx_branch_inventory_branch ON branch_inventory(branch_id);
CREATE INDEX idx_branch_inventory_product ON branch_inventory(product_id);
CREATE INDEX idx_branch_inventory_low_stock ON branch_inventory(branch_id, current_stock) 
    WHERE current_stock <= reorder_point;

COMMENT ON TABLE branch_inventory IS 'Inventory stock levels per branch location';

-- Table: branch_transfers
-- Purpose: Track inventory transfers between branches
CREATE TABLE IF NOT EXISTS branch_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Transfer details
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    from_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    to_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    
    -- Transfer metadata
    transfer_type VARCHAR(50) DEFAULT 'manual', -- manual, auto_reorder, emergency
    priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, in_transit, completed, cancelled
    
    -- Requestor and approver
    requested_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Shipment details
    shipped_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    received_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Dates
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    expected_delivery_date DATE,
    
    -- Shipping information
    tracking_number VARCHAR(100),
    shipping_method VARCHAR(100),
    shipping_cost DECIMAL(10, 2),
    
    -- Notes
    reason TEXT,
    notes TEXT,
    receiving_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_branch_transfers_clinic ON branch_transfers(clinic_id);
CREATE INDEX idx_branch_transfers_from ON branch_transfers(from_branch_id);
CREATE INDEX idx_branch_transfers_to ON branch_transfers(to_branch_id);
CREATE INDEX idx_branch_transfers_status ON branch_transfers(status);
CREATE INDEX idx_branch_transfers_number ON branch_transfers(transfer_number);
CREATE INDEX idx_branch_transfers_requested ON branch_transfers(requested_at DESC);

COMMENT ON TABLE branch_transfers IS 'Inventory transfers between branch locations';

-- Table: branch_transfer_items
-- Purpose: Individual items in a branch transfer
CREATE TABLE IF NOT EXISTS branch_transfer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_id UUID NOT NULL REFERENCES branch_transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE RESTRICT,
    
    -- Quantities
    quantity_requested INTEGER NOT NULL,
    quantity_approved INTEGER,
    quantity_shipped INTEGER,
    quantity_received INTEGER,
    
    -- Item condition
    condition_on_receipt VARCHAR(50), -- good, damaged, expired
    
    -- Unit information
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_branch_transfer_items_transfer ON branch_transfer_items(transfer_id);
CREATE INDEX idx_branch_transfer_items_product ON branch_transfer_items(product_id);

COMMENT ON TABLE branch_transfer_items IS 'Items included in branch transfers';

-- Table: branch_services
-- Purpose: Services offered at specific branches (some branches may not offer all services)
CREATE TABLE IF NOT EXISTS branch_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    
    -- Pricing (can override clinic-wide pricing)
    branch_price DECIMAL(10, 2),
    use_clinic_price BOOLEAN DEFAULT true,
    
    -- Capacity
    daily_capacity INTEGER,
    slots_per_day INTEGER,
    
    -- Requirements
    requires_specialist BOOLEAN DEFAULT false,
    required_equipment JSONB DEFAULT '[]',
    
    -- Scheduling
    available_days JSONB DEFAULT '[]', -- ["monday", "tuesday", ...]
    available_time_slots JSONB DEFAULT '[]',
    
    -- Popularity at this branch
    booking_count INTEGER DEFAULT 0,
    last_booked_at TIMESTAMPTZ,
    
    -- Status
    available_from_date DATE,
    available_until_date DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint
    CONSTRAINT unique_branch_service UNIQUE (branch_id, service_id)
);

CREATE INDEX idx_branch_services_branch ON branch_services(branch_id);
CREATE INDEX idx_branch_services_service ON branch_services(service_id);
CREATE INDEX idx_branch_services_available ON branch_services(is_available) WHERE is_available = true;

COMMENT ON TABLE branch_services IS 'Services available at each branch location';
COMMENT ON COLUMN branch_services.booking_count IS 'Number of customer bookings for this service at this branch';

-- Table: branch_revenue
-- Purpose: Track revenue per branch for financial reporting
CREATE TABLE IF NOT EXISTS branch_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    
    -- Time period
    period_date DATE NOT NULL,
    period_type VARCHAR(50) DEFAULT 'daily', -- daily, weekly, monthly, yearly
    
    -- Revenue metrics
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    service_revenue DECIMAL(12, 2) DEFAULT 0,
    product_revenue DECIMAL(12, 2) DEFAULT 0,
    
    -- Transaction counts
    total_transactions INTEGER DEFAULT 0,
    service_transactions INTEGER DEFAULT 0,
    product_transactions INTEGER DEFAULT 0,
    
    -- Customer metrics (beauty clinic clients)
    total_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    
    -- Payment methods
    cash_revenue DECIMAL(12, 2) DEFAULT 0,
    card_revenue DECIMAL(12, 2) DEFAULT 0,
    transfer_revenue DECIMAL(12, 2) DEFAULT 0,
    other_revenue DECIMAL(12, 2) DEFAULT 0,
    
    -- Expenses
    total_expenses DECIMAL(12, 2) DEFAULT 0,
    staff_expenses DECIMAL(12, 2) DEFAULT 0,
    inventory_expenses DECIMAL(12, 2) DEFAULT 0,
    
    -- Net profit
    net_profit DECIMAL(12, 2) DEFAULT 0,
    profit_margin DECIMAL(5, 2) DEFAULT 0, -- Percentage
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint
    CONSTRAINT unique_branch_period UNIQUE (branch_id, period_date, period_type)
);

CREATE INDEX idx_branch_revenue_branch ON branch_revenue(branch_id);
CREATE INDEX idx_branch_revenue_date ON branch_revenue(period_date DESC);
CREATE INDEX idx_branch_revenue_type ON branch_revenue(period_type);
CREATE INDEX idx_branch_revenue_branch_date ON branch_revenue(branch_id, period_date DESC);

COMMENT ON TABLE branch_revenue IS 'Revenue tracking per branch for financial reporting';
COMMENT ON COLUMN branch_revenue.total_customers IS 'Total beauty clinic customers for this period';

-- ============================================================================
-- Functions
-- ============================================================================

-- Function: Get branch inventory summary
CREATE OR REPLACE FUNCTION get_branch_inventory_summary(
    p_branch_id UUID
)
RETURNS TABLE(
    total_products BIGINT,
    low_stock_products BIGINT,
    out_of_stock_products BIGINT,
    total_inventory_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_products,
        COUNT(*) FILTER (WHERE bi.current_stock <= bi.reorder_point AND bi.current_stock > 0)::BIGINT as low_stock_products,
        COUNT(*) FILTER (WHERE bi.current_stock = 0)::BIGINT as out_of_stock_products,
        COALESCE(SUM(bi.current_stock * ip.cost_price), 0)::NUMERIC as total_inventory_value
    FROM branch_inventory bi
    JOIN inventory_products ip ON ip.id = bi.product_id
    WHERE bi.branch_id = p_branch_id
    AND bi.is_available = true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_branch_inventory_summary IS 'Get inventory summary for a branch';

-- Function: Check if transfer is valid
CREATE OR REPLACE FUNCTION validate_branch_transfer(
    p_from_branch_id UUID,
    p_to_branch_id UUID,
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_available_stock INTEGER;
BEGIN
    -- Cannot transfer to same branch
    IF p_from_branch_id = p_to_branch_id THEN
        RETURN false;
    END IF;
    
    -- Check if source branch has enough stock
    SELECT current_stock INTO v_available_stock
    FROM branch_inventory
    WHERE branch_id = p_from_branch_id
    AND product_id = p_product_id;
    
    IF v_available_stock IS NULL OR v_available_stock < p_quantity THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_branch_transfer IS 'Validate if a branch transfer is possible';

-- Function: Complete branch transfer (update inventory)
CREATE OR REPLACE FUNCTION complete_branch_transfer(
    p_transfer_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_transfer RECORD;
    v_item RECORD;
BEGIN
    -- Get transfer details
    SELECT * INTO v_transfer
    FROM branch_transfers
    WHERE id = p_transfer_id;
    
    IF v_transfer.status != 'in_transit' THEN
        RAISE EXCEPTION 'Transfer must be in transit status';
    END IF;
    
    -- Process each item
    FOR v_item IN 
        SELECT * FROM branch_transfer_items
        WHERE transfer_id = p_transfer_id
    LOOP
        -- Deduct from source branch
        UPDATE branch_inventory
        SET current_stock = current_stock - v_item.quantity_shipped
        WHERE branch_id = v_transfer.from_branch_id
        AND product_id = v_item.product_id;
        
        -- Add to destination branch
        INSERT INTO branch_inventory (branch_id, product_id, current_stock)
        VALUES (v_transfer.to_branch_id, v_item.product_id, v_item.quantity_received)
        ON CONFLICT (branch_id, product_id) DO UPDATE
        SET current_stock = branch_inventory.current_stock + v_item.quantity_received;
        
        -- Log stock movement for source
        INSERT INTO inventory_stock_movements (
            product_id,
            movement_type,
            quantity,
            reference_type,
            reference_id,
            notes
        ) VALUES (
            v_item.product_id,
            'transfer_out',
            -v_item.quantity_shipped,
            'branch_transfer',
            p_transfer_id,
            'Transfer to branch: ' || v_transfer.to_branch_id::TEXT
        );
        
        -- Log stock movement for destination
        INSERT INTO inventory_stock_movements (
            product_id,
            movement_type,
            quantity,
            reference_type,
            reference_id,
            notes
        ) VALUES (
            v_item.product_id,
            'transfer_in',
            v_item.quantity_received,
            'branch_transfer',
            p_transfer_id,
            'Transfer from branch: ' || v_transfer.from_branch_id::TEXT
        );
    END LOOP;
    
    -- Update transfer status
    UPDATE branch_transfers
    SET 
        status = 'completed',
        received_at = NOW()
    WHERE id = p_transfer_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION complete_branch_transfer IS 'Complete a branch transfer and update inventory';

-- ============================================================================
-- Triggers
-- ============================================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_branch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_branches_updated_at
    BEFORE UPDATE ON branches
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_updated_at();

CREATE TRIGGER update_branch_staff_assignments_updated_at
    BEFORE UPDATE ON branch_staff_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_updated_at();

CREATE TRIGGER update_branch_inventory_updated_at
    BEFORE UPDATE ON branch_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_updated_at();

CREATE TRIGGER update_branch_transfers_updated_at
    BEFORE UPDATE ON branch_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_updated_at();

CREATE TRIGGER update_branch_transfer_items_updated_at
    BEFORE UPDATE ON branch_transfer_items
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_updated_at();

CREATE TRIGGER update_branch_services_updated_at
    BEFORE UPDATE ON branch_services
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_updated_at();

CREATE TRIGGER update_branch_revenue_updated_at
    BEFORE UPDATE ON branch_revenue
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_updated_at();

-- Trigger: Update staff count when staff is assigned/unassigned
CREATE OR REPLACE FUNCTION update_branch_staff_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
        UPDATE branches
        SET total_staff_count = total_staff_count + 1
        WHERE id = NEW.branch_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_active = true AND NEW.is_active = false THEN
            UPDATE branches
            SET total_staff_count = GREATEST(total_staff_count - 1, 0)
            WHERE id = NEW.branch_id;
        ELSIF OLD.is_active = false AND NEW.is_active = true THEN
            UPDATE branches
            SET total_staff_count = total_staff_count + 1
            WHERE id = NEW.branch_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.is_active = true THEN
        UPDATE branches
        SET total_staff_count = GREATEST(total_staff_count - 1, 0)
        WHERE id = OLD.branch_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_branch_staff_count
    AFTER INSERT OR UPDATE OR DELETE ON branch_staff_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_staff_count();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_revenue ENABLE ROW LEVEL SECURITY;

-- Policies for branches
CREATE POLICY "Clinic staff can view their clinic branches"
    ON branches FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Clinic admins can manage branches"
    ON branches FOR ALL
    USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
            AND is_active = true
        )
    );

-- Policies for branch_staff_assignments
CREATE POLICY "Staff can view their branch assignments"
    ON branch_staff_assignments FOR SELECT
    USING (
        user_id = auth.uid()
        OR branch_id IN (
            SELECT b.id FROM branches b
            JOIN clinic_staff cs ON cs.clinic_id = b.clinic_id
            WHERE cs.user_id = auth.uid() AND cs.is_active = true
        )
    );

CREATE POLICY "Branch managers can manage staff assignments"
    ON branch_staff_assignments FOR ALL
    USING (
        branch_id IN (
            SELECT b.id FROM branches b
            JOIN clinic_staff cs ON cs.clinic_id = b.clinic_id
            WHERE cs.user_id = auth.uid() 
            AND cs.role IN ('admin', 'owner', 'manager')
            AND cs.is_active = true
        )
    );

-- Policies for branch_inventory
CREATE POLICY "Branch staff can view their branch inventory"
    ON branch_inventory FOR SELECT
    USING (
        branch_id IN (
            SELECT branch_id FROM branch_staff_assignments
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Branch staff can manage their branch inventory"
    ON branch_inventory FOR ALL
    USING (
        branch_id IN (
            SELECT branch_id FROM branch_staff_assignments
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policies for branch_transfers
CREATE POLICY "Staff can view transfers involving their branches"
    ON branch_transfers FOR SELECT
    USING (
        from_branch_id IN (
            SELECT branch_id FROM branch_staff_assignments
            WHERE user_id = auth.uid() AND is_active = true
        )
        OR to_branch_id IN (
            SELECT branch_id FROM branch_staff_assignments
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Staff can create transfers from their branches"
    ON branch_transfers FOR INSERT
    WITH CHECK (
        from_branch_id IN (
            SELECT branch_id FROM branch_staff_assignments
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policies for branch_services
CREATE POLICY "Users can view available branch services"
    ON branch_services FOR SELECT
    USING (is_available = true);

CREATE POLICY "Branch managers can manage branch services"
    ON branch_services FOR ALL
    USING (
        branch_id IN (
            SELECT b.id FROM branches b
            JOIN clinic_staff cs ON cs.clinic_id = b.clinic_id
            WHERE cs.user_id = auth.uid() 
            AND cs.role IN ('admin', 'owner', 'manager')
            AND cs.is_active = true
        )
    );

-- ============================================================================
-- Sample Data (Optional - for development/testing)
-- ============================================================================

-- Sample branch (only if clinic exists)
INSERT INTO branches (
    clinic_id,
    branch_code,
    branch_name,
    address,
    city,
    province,
    postal_code,
    phone,
    is_main_branch,
    is_active
)
SELECT 
    c.id,
    'MAIN001',
    'สาขาหลัก - Main Branch',
    '123 ถนนสุขุมวิท แขวงคลองเตย',
    'กรุงเทพมหานคร',
    'กรุงเทพมหานคร',
    '10110',
    '02-123-4567',
    true,
    true
FROM clinics c
LIMIT 1
ON CONFLICT (branch_code) DO NOTHING;
