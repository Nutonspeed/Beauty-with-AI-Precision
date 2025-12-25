-- Create payment system tables for Beauty AI Precision

-- Payment methods table (stores clinic payment configurations)
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('stripe', 'cash', 'bank_transfer', 'promptpay')),
    provider VARCHAR(100),
    config JSONB NOT NULL DEFAULT '{}', -- Encrypted provider-specific config
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(clinic_id, type)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Invoice details
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    tax_rate DECIMAL(5,2) DEFAULT 7 CHECK (tax_rate >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded')),
    
    -- Dates
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional info
    notes TEXT,
    payment_terms TEXT DEFAULT 'Payment due within 30 days',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    -- CHECK constraint removed - totals calculated via trigger,
    CHECK(due_date >= issue_date)
);

-- Payments table
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
    transaction_id VARCHAR(255), -- Gateway transaction ID
    gateway_response JSONB, -- Full response from payment gateway
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK(amount > 0 OR payment_type = 'refund')
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    reason TEXT,
    refund_id VARCHAR(255), -- Gateway refund ID
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    processed_by UUID REFERENCES users(id)
);

-- Update appointments table to include payment status
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_clinic_id ON invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_appointment_id ON invoices(appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

CREATE INDEX IF NOT EXISTS idx_payment_methods_clinic_id ON payment_methods(clinic_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);

-- Row Level Security
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods
CREATE POLICY "Clinic users can view their payment methods" ON payment_methods
    FOR SELECT USING (clinic_id = get_user_clinic_id() OR is_super_admin());

CREATE POLICY "Clinic admins can manage payment methods" ON payment_methods
    FOR ALL USING (clinic_id = get_user_clinic_id() OR is_super_admin());

-- RLS Policies for invoices
CREATE POLICY "Clinic users can view their invoices" ON invoices
    FOR SELECT USING (clinic_id = get_user_clinic_id() OR is_super_admin());

CREATE POLICY "Clinic staff can manage invoices" ON invoices
    FOR ALL USING (
        clinic_id = get_user_clinic_id() 
        AND get_user_role() IN ('clinic_owner', 'clinic_admin', 'super_admin')
    );

-- RLS Policies for invoice_line_items (inherits from invoices)
CREATE POLICY "Clinic users can view invoice items" ON invoice_line_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = invoice_line_items.invoice_id 
            AND (invoices.clinic_id = get_user_clinic_id() OR is_super_admin())
        )
    );

CREATE POLICY "Clinic staff can manage invoice items" ON invoice_line_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = invoice_line_items.invoice_id 
            AND invoices.clinic_id = get_user_clinic_id()
            AND get_user_role() IN ('clinic_owner', 'clinic_admin', 'super_admin')
        )
    );

-- RLS Policies for payments
CREATE POLICY "Clinic users can view payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = payments.invoice_id 
            AND (invoices.clinic_id = get_user_clinic_id() OR is_super_admin())
        )
    );

CREATE POLICY "Clinic staff can manage payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = payments.invoice_id 
            AND invoices.clinic_id = get_user_clinic_id()
            AND get_user_role() IN ('clinic_owner', 'clinic_admin', 'super_admin')
        )
    );

-- RLS Policies for refunds
CREATE POLICY "Clinic users can view refunds" ON refunds
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM payments 
            JOIN invoices ON invoices.id = payments.invoice_id
            WHERE payments.id = refunds.payment_id 
            AND (invoices.clinic_id = get_user_clinic_id() OR is_super_admin())
        )
    );

CREATE POLICY "Clinic staff can manage refunds" ON refunds
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM payments 
            JOIN invoices ON invoices.id = payments.invoice_id
            WHERE payments.id = refunds.payment_id 
            AND invoices.clinic_id = get_user_clinic_id()
            AND get_user_role() IN ('clinic_owner', 'clinic_admin', 'super_admin')
        )
    );

-- Functions for invoice numbering
CREATE OR REPLACE FUNCTION generate_invoice_number(clinic_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    seq_num INTEGER;
    invoice_num TEXT;
BEGIN
    year_part := EXTRACT(year FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM invoices
    WHERE clinic_id = clinic_id_param
    AND invoice_number LIKE 'INV-' || year_part || '-%';
    
    invoice_num := 'INV-' || year_part || '-' || LPAD(seq_num::TEXT, 5, '0');
    
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices SET
        subtotal = (
            SELECT COALESCE(SUM(total), 0) 
            FROM invoice_line_items 
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ),
        tax_amount = ROUND((
            SELECT COALESCE(SUM(total), 0) 
            FROM invoice_line_items 
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ) * tax_rate / 100, 2),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_invoice_totals_on_line_item
    AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
    FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

CREATE TRIGGER update_invoice_totals_on_invoice_change
    AFTER UPDATE OF discount_amount, tax_rate ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

-- Function to update appointment payment status
CREATE OR REPLACE FUNCTION update_appointment_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    invoice_total DECIMAL;
    paid_total DECIMAL;
    new_status TEXT;
BEGIN
    -- Get invoice and paid amounts
    SELECT 
        i.total_amount,
        COALESCE(SUM(p.amount), 0)
    INTO invoice_total, paid_total
    FROM invoices i
    LEFT JOIN payments p ON p.invoice_id = i.id AND p.status = 'completed'
    WHERE i.id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    -- Determine payment status
    IF paid_total >= invoice_total THEN
        new_status := 'paid';
    ELSIF paid_total > 0 THEN
        new_status := 'partial';
    ELSE
        new_status := 'unpaid';
    END IF;
    
    -- Update appointment
    UPDATE appointments 
    SET payment_status = new_status,
        updated_at = NOW()
    WHERE id = (
        SELECT appointment_id 
        FROM invoices 
        WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for payment status
CREATE TRIGGER update_appointment_payment_on_payment
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_appointment_payment_status();

CREATE TRIGGER update_appointment_payment_on_invoice
    AFTER UPDATE OF invoice_id ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_appointment_payment_status();

-- Comments
COMMENT ON TABLE payment_methods IS 'Stores payment configuration for each clinic';
COMMENT ON TABLE invoices IS 'Main invoices table with multi-tenant support';
COMMENT ON TABLE invoice_line_items IS 'Itemized line items for invoices';
COMMENT ON TABLE payments IS 'Payment transactions linked to invoices';
COMMENT ON TABLE refunds IS 'Refund records for payments';
