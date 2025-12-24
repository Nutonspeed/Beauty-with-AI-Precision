# Database Setup Guide
## การตั้งค่าและตรวจสอบ Database สำหรับ Beauty AI Precision

## 📋 สถานะปัจจุบัน
- Dev server ทำงานที่ http://localhost:3004
- Database connection สำเร็จ
- Build ไม่มี errors
- API endpoints คืน 500 error (อาจเกิดจากตารางไม่มีใน database)

## 🔍 วิธีตรวจสอบว่าตารางมีอยู่ใน Database

### 1. เปิด Supabase Dashboard
1. ไปที่ https://supabase.co
2. Login ด้วยบัญชีของคุณ
3. เลือก project: bgejeqqngzvuokdffadu

### 2. ไปที่ SQL Editor
- ในแถบด้านซ้าย เลือก "SQL Editor"
- คลิก "New query"

### 3. รัน Query ตรวจสอบตาราง
```sql
-- คัดลอกและวางนี้ใน SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'tax_receipts', 'invoices', 'invoice_line_items', 'payment_methods', 'refunds', 'tax_receipt_line_items')
ORDER BY table_name;
```

## 🛠️ ถ้าตารางไม่มี - วิธีสร้างตาราง

### 1. สร้าง Payment System Tables
```sql
-- วางใน SQL Editor แล้วรัน
-- Migration: 202512250002_create_payment_system.sql

-- Payment methods table
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
```

### 2. สร้าง Tax Receipt System Tables
```sql
-- วางใน SQL Editor แล้วรัน
-- Migration: 202512250004_create_tax_receipt_system.sql

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
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_receipts_clinic ON tax_receipts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_customer ON tax_receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_payment ON tax_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_status ON tax_receipts(status);
CREATE INDEX IF NOT EXISTS idx_tax_receipts_date ON tax_receipts(issue_date DESC);
```

### 3. สร้าง Functions
```sql
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
```

### 4. เปิดใช้งาน RLS
```sql
-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_receipt_line_items ENABLE ROW LEVEL SECURITY;

-- Clinic can manage their payments
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

-- Clinic can manage tax receipts
CREATE POLICY "Clinic can manage tax receipts" ON tax_receipts
    FOR ALL
    USING (
        clinic_id = get_user_clinic_id()
        OR
        is_super_admin()
    );
```

## ✅ หลังจาก Setup Database

### 1. รีสตาร์ท Dev Server
```bash
# หยุด server (Ctrl+C)
# แล้วรันใหม่
pnpm dev
```

### 2. ทดสอบ API อีกครั้ง
```bash
# ทดสอบใน PowerShell
Invoke-WebRequest -Uri "http://localhost:3004/api/invoices" -UseBasicParsing
```

### 3. ทดสอบผ่าน Browser
- เปิด http://localhost:3004/auth/login
- ล็อกอินด้วยบัญชีทดสอบ
- ทดสอบ features ต่างๆ

## 🚨 ปัญหาที่อาจพบ

1. **Permission Denied**: ตรวจสอบว่า RLS policies ถูกต้อง
2. **Function Not Found**: ตรวจสอบว่า functions ถูกสร้างแล้ว
3. **Column Not Found**: ตรวจสอบว่าตารางมีคอลัมน์ที่จำเป็น

## 📞 ติดต่อ Support
หากพบปัญหา:
1. ตรวจสอบ console log ใน browser
2. ตรวจสอบ terminal output ของ dev server
3. ตรวจสอบ Supabase logs ใน dashboard
