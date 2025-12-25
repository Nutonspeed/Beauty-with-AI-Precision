-- สร้างตารางที่ยังไม่มีใน Database
-- วาง SQL นี้ใน Supabase SQL Editor แล้วรัน

-- 1. Invoice System
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    appointment_id UUID REFERENCES appointments(id),
    
    -- Invoice details
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'void')),
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 7.00 CHECK (tax_rate >= 0),
    tax_amount DECIMAL(10,2) NOT NULL CHECK (tax_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    
    -- Additional info
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(clinic_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id),
    
    -- Item details
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    
    -- Totals
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Payment System
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL 
        CHECK (type IN ('credit_card', 'debit_card', 'bank_transfer', 'promptpay', 'cash', 'other')),
    provider VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_method_id UUID REFERENCES payment_methods(id),
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'THB',
    payment_type VARCHAR(20) NOT NULL 
        CHECK (payment_type IN ('full', 'partial', 'refund')),
    
    -- Gateway info
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    reason TEXT,
    refund_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tax Receipt System
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
    
    UNIQUE(clinic_id, receipt_number)
);

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
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_clinic ON invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(issue_date DESC);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tax_receipts_clinic ON tax_receipts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_customer ON tax_receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_payment ON tax_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_status ON tax_receipts(status);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_date ON tax_receipts(issue_date DESC);

-- 5. Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_receipt_line_items ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Invoices
CREATE POLICY "Clinic can manage invoices" ON invoices
    FOR ALL
    USING (
        clinic_id = get_user_clinic_id()
        OR
        is_super_admin()
    );

-- Payments
CREATE POLICY "Clinic can manage payments" ON payments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = payments.invoice_id
            AND i.clinic_id = get_user_clinic_id()
        )
        OR
        is_super_admin()
    );

-- Tax Receipts
CREATE POLICY "Clinic can manage tax receipts" ON tax_receipts
    FOR ALL
    USING (
        clinic_id = get_user_clinic_id()
        OR
        is_super_admin()
    );

-- Line items inherit parent policies
CREATE POLICY "Clinic can manage invoice line items" ON invoice_line_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = invoice_line_items.invoice_id
            AND i.clinic_id = get_user_clinic_id()
        )
        OR
        is_super_admin()
    );

CREATE POLICY "Clinic can manage tax receipt line items" ON tax_receipt_line_items
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

-- 7. Functions
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

-- 8. Triggers for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_refunds_updated_at
    BEFORE UPDATE ON refunds
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_tax_receipts_updated_at
    BEFORE UPDATE ON tax_receipts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
