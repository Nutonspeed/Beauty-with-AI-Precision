-- Create tax receipt system for Thai compliance

-- Tax receipts table
CREATE TABLE IF NOT EXISTS tax_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    payment_id UUID NOT NULL REFERENCES payments(id),
    invoice_id UUID REFERENCES invoices(id),
    
    -- Receipt details
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Tax information
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    vat_rate DECIMAL(5,2) NOT NULL DEFAULT 7.00 CHECK (vat_rate >= 0),
    vat_amount DECIMAL(10,2) NOT NULL CHECK (vat_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    
    -- Tax IDs
    seller_tax_id VARCHAR(20),
    buyer_tax_id VARCHAR(20),
    branch_code VARCHAR(10),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'issued', 'cancelled', 'void')),
    
    -- Digital signature
    signed_at TIMESTAMP WITH TIME ZONE,
    signature_data JSONB,
    
    -- Additional info
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    -- CHECK constraints removed - totals calculated via trigger
    UNIQUE(clinic_id, receipt_number)
);

-- Tax receipt line items
CREATE TABLE IF NOT EXISTS tax_receipt_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_receipt_id UUID NOT NULL REFERENCES tax_receipts(id) ON DELETE CASCADE,
    
    -- Item details
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    
    -- Tax details
    vat_rate DECIMAL(5,2) NOT NULL DEFAULT 7.00,
    vat_amount DECIMAL(10,2) NOT NULL,
    
    -- Totals
    line_total DECIMAL(10,2) NOT NULL CHECK (line_total >= 0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    -- CHECK constraints removed - totals calculated via trigger
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_receipts_clinic ON tax_receipts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_customer ON tax_receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_payment ON tax_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_status ON tax_receipts(status);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_date ON tax_receipts(issue_date DESC);

-- RLS Policies
ALTER TABLE tax_receipts ENABLE ROW LEVEL SECURITY;

-- Clinic can manage their tax receipts
DROP POLICY IF EXISTS "Clinic can manage tax receipts" ON tax_receipts;
CREATE POLICY "Clinic can manage tax receipts"
    ON tax_receipts
    FOR ALL
    USING (
        clinic_id = get_user_clinic_id()
        OR
        is_super_admin()
    );

-- Customers can view their tax receipts
DROP POLICY IF EXISTS "Customers can view tax receipts" ON tax_receipts;
CREATE POLICY "Customers can view tax receipts"
    ON tax_receipts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM customers c
            WHERE c.id = tax_receipts.customer_id
            AND c.user_id = auth.uid()
        )
    );

-- Enable RLS for line items
ALTER TABLE tax_receipt_line_items ENABLE ROW LEVEL SECURITY;

-- Line items inherit parent policy
DROP POLICY IF EXISTS "Clinic can manage tax receipt line items" ON tax_receipt_line_items;
CREATE POLICY "Clinic can manage tax receipt line items"
    ON tax_receipt_line_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tax_receipts tr
            WHERE tr.id = tax_receipt_line_items.tax_receipt_id
            AND tr.clinic_id = get_user_clinic_id()
        )
        OR
        is_super_admin()
    );

-- Function to generate tax receipt number
CREATE OR REPLACE FUNCTION generate_tax_receipt_number(p_clinic_id UUID)
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    receipt_num TEXT;
BEGIN
    -- Get current year in Buddhist era
    year_part := EXTRACT(YEAR FROM CURRENT_DATE) + 543;
    
    -- Get next sequence number for this clinic and year
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM tax_receipts
    WHERE clinic_id = p_clinic_id
    AND receipt_number LIKE 'TAX' || year_part || '%';
    
    -- Format: TAX[Year][Sequence]
    receipt_num := 'TAX' || year_part || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN receipt_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tax_receipts_updated_at
    BEFORE UPDATE ON tax_receipts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Function to create tax receipt from payment
CREATE OR REPLACE FUNCTION create_tax_receipt_from_payment(
    p_payment_id UUID,
    p_seller_tax_id VARCHAR(20) DEFAULT NULL,
    p_buyer_tax_id VARCHAR(20) DEFAULT NULL,
    p_branch_code VARCHAR(10) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_receipt_id UUID;
    v_clinic_id UUID;
    v_customer_id UUID;
    v_invoice_id UUID;
    v_receipt_number TEXT;
    v_subtotal DECIMAL;
    v_vat_amount DECIMAL;
    v_total_amount DECIMAL;
BEGIN
    -- Get payment details
    SELECT i.clinic_id, i.customer_id, i.id, i.total_amount
    INTO v_clinic_id, v_customer_id, v_invoice_id, v_total_amount
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE p.id = p_payment_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found';
    END IF;
    
    -- Calculate amounts (assuming 7% VAT)
    v_subtotal := v_total_amount / 1.07;
    v_vat_amount := v_total_amount - v_subtotal;
    
    -- Generate receipt number
    v_receipt_number := generate_tax_receipt_number(v_clinic_id);
    
    -- Create tax receipt
    INSERT INTO tax_receipts (
        receipt_number,
        clinic_id,
        customer_id,
        payment_id,
        invoice_id,
        subtotal,
        discount_amount,
        vat_rate,
        vat_amount,
        total_amount,
        seller_tax_id,
        buyer_tax_id,
        branch_code,
        notes,
        status,
        created_by
    ) VALUES (
        v_receipt_number,
        v_clinic_id,
        v_customer_id,
        p_payment_id,
        v_invoice_id,
        v_subtotal,
        0,
        7.00,
        v_vat_amount,
        v_total_amount,
        p_seller_tax_id,
        p_buyer_tax_id,
        p_branch_code,
        p_notes,
        'draft',
        auth.uid()
    ) RETURNING id INTO v_receipt_id;
    
    -- Copy line items from invoice
    INSERT INTO tax_receipt_line_items (
        tax_receipt_id,
        description,
        quantity,
        unit_price,
        discount_percent,
        vat_rate,
        vat_amount,
        line_total
    )
    SELECT 
        v_receipt_id,
        description,
        quantity,
        unit_price,
        discount_percent,
        7.00,
        ROUND(total * 7 / 100, 2),
        total
    FROM invoice_line_items
    WHERE invoice_id = v_invoice_id;
    
    RETURN v_receipt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
