-- Fix Payments Schema - Add missing columns
-- Run this in Supabase SQL Editor to update the payments table

-- First, check if table exists and what columns it has
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'payments' AND table_schema = 'public';

-- Add missing columns if they don't exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_number VARCHAR(50) UNIQUE;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'transfer', 'online', 'other'));

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_date DATE NOT NULL DEFAULT CURRENT_DATE;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_time TIME NOT NULL DEFAULT CURRENT_TIME;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Enable RLS if not already enabled
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create/update RLS policies
DROP POLICY IF EXISTS "Clinic can view own payments" ON payments;
CREATE POLICY "Clinic can view own payments"
  ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = payments.invoice_id 
      AND invoices.clinic_id = get_user_clinic_id()
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Clinic can create payments" ON payments;
CREATE POLICY "Clinic can create payments"
  ON payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_id 
      AND invoices.clinic_id = get_user_clinic_id()
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Clinic can update payments" ON payments;
CREATE POLICY "Clinic can update payments"
  ON payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = payments.invoice_id 
      AND invoices.clinic_id = get_user_clinic_id()
    )
    OR is_super_admin()
  );

-- Create tax_receipts table if it doesn't exist
CREATE TABLE IF NOT EXISTS tax_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Receipt details
  receipt_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  taxable_amount DECIMAL(10,2) NOT NULL CHECK (taxable_amount >= 0),
  tax_rate DECIMAL(5,2) DEFAULT 7 CHECK (tax_rate >= 0),
  tax_amount DECIMAL(10,2) NOT NULL CHECK (tax_amount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  
  -- Payment info
  payment_method VARCHAR(20) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tax_receipts
CREATE INDEX IF NOT EXISTS idx_tax_receipts_invoice ON tax_receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_clinic ON tax_receipts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_date ON tax_receipts(receipt_date);

-- Enable RLS for tax_receipts
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

-- Add invoice_id column to appointments if it doesn't exist
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Payments and tax receipts schema updated successfully!';
END $$;
