-- Staging Schema Fixes
-- This migration fixes schema mismatches found during testing

-- Fix appointments table - ensure required columns exist
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;

-- Fix payments table - ensure required columns exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_number VARCHAR(50) UNIQUE;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update payment_type constraint to allow common values
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_type_check;
ALTER TABLE payments 
ADD CONSTRAINT payments_payment_type_check 
CHECK (payment_type IN ('full', 'partial', 'refund'));

-- Fix invoices table - ensure status can be updated
ALTER TABLE invoices 
ALTER COLUMN status SET DEFAULT 'draft';

-- Ensure tax_receipts table exists with correct structure
CREATE TABLE IF NOT EXISTS tax_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Receipt details
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  vat_rate DECIMAL(5,2) DEFAULT 7 CHECK (vat_rate >= 0),
  vat_amount DECIMAL(10,2) NOT NULL CHECK (vat_amount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  
  -- Tax info
  seller_tax_id VARCHAR(20),
  buyer_tax_id VARCHAR(20),
  branch_code VARCHAR(20),
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'cancelled')),
  
  -- Signature
  signed_at TIMESTAMPTZ,
  signature_data JSONB,
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tax_receipts_clinic ON tax_receipts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_customer ON tax_receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_payment ON tax_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_invoice ON tax_receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_date ON tax_receipts(receipt_date);

-- Enable RLS
ALTER TABLE tax_receipts ENABLE ROW LEVEL SECURITY;

-- RLS policies for tax_receipts
DROP POLICY IF EXISTS "Clinic can view own tax receipts" ON tax_receipts;
CREATE POLICY "Clinic can view own tax receipts"
  ON tax_receipts
  FOR SELECT
  USING (
    clinic_id = get_user_clinic_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Clinic can create tax receipts" ON tax_receipts;
CREATE POLICY "Clinic can create tax receipts"
  ON tax_receipts
  FOR INSERT
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Clinic can update tax receipts" ON tax_receipts;
CREATE POLICY "Clinic can update tax receipts"
  ON tax_receipts
  FOR UPDATE
  USING (
    clinic_id = get_user_clinic_id()
    OR is_super_admin()
  );

-- Success
DO $$
BEGIN
  RAISE NOTICE '✅ Staging schema fixes applied successfully!';
END $$;
