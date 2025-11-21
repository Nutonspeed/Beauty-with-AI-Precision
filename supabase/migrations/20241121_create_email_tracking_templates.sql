-- =====================================================
-- Create Email Tracking and Templates for Sales
-- =====================================================
-- Tables: sales_email_templates, sales_email_tracking
-- Date: 2025-11-21
-- =====================================================

-- 1. Create ENUM for email status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_status') THEN
    CREATE TYPE email_status AS ENUM (
      'draft',
      'sent',
      'delivered',
      'opened',
      'clicked',
      'replied',
      'bounced',
      'failed'
    );
    RAISE NOTICE '✅ Created ENUM type: email_status';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_template_category') THEN
    CREATE TYPE email_template_category AS ENUM (
      'general',
      'follow_up',
      'proposal',
      'welcome',
      'thank_you',
      'reminder',
      'promotion'
    );
    RAISE NOTICE '✅ Created ENUM type: email_template_category';
  END IF;
END $$;

-- 2. Create sales_email_templates table
CREATE TABLE IF NOT EXISTS public.sales_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template Details
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL, -- HTML or plain text
  category email_template_category NOT NULL DEFAULT 'general',
  
  -- Template Variables
  variables TEXT[] DEFAULT '{}', -- List of available variables like {{customer_name}}, {{product_name}}
  
  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  
  -- Ownership
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for sales_email_templates
CREATE INDEX IF NOT EXISTS sales_email_templates_category_idx ON public.sales_email_templates(category);
CREATE INDEX IF NOT EXISTS sales_email_templates_is_active_idx ON public.sales_email_templates(is_active);
CREATE INDEX IF NOT EXISTS sales_email_templates_created_by_idx ON public.sales_email_templates(created_by);

COMMENT ON TABLE public.sales_email_templates IS 'Reusable email templates for sales communications';

-- 3. Create sales_email_tracking table
CREATE TABLE IF NOT EXISTS public.sales_email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  lead_id UUID NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.sales_email_templates(id) ON DELETE SET NULL,
  
  -- Email Details
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  cc TEXT[],
  bcc TEXT[],
  
  -- Status & Tracking
  status email_status NOT NULL DEFAULT 'sent',
  
  -- Timing
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  
  -- Engagement Metrics
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  clicked_links JSONB DEFAULT '[]'::jsonb, -- Array of {url, clicked_at}
  
  -- Metadata
  bounce_reason TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for sales_email_tracking
CREATE INDEX IF NOT EXISTS sales_email_tracking_lead_id_idx ON public.sales_email_tracking(lead_id);
CREATE INDEX IF NOT EXISTS sales_email_tracking_sender_id_idx ON public.sales_email_tracking(sender_id);
CREATE INDEX IF NOT EXISTS sales_email_tracking_template_id_idx ON public.sales_email_tracking(template_id);
CREATE INDEX IF NOT EXISTS sales_email_tracking_status_idx ON public.sales_email_tracking(status);
CREATE INDEX IF NOT EXISTS sales_email_tracking_sent_at_idx ON public.sales_email_tracking(sent_at DESC);
CREATE INDEX IF NOT EXISTS sales_email_tracking_recipient_idx ON public.sales_email_tracking(recipient_email);

COMMENT ON TABLE public.sales_email_tracking IS 'Email tracking and engagement analytics for sales emails';

-- 4. Enable RLS on all tables
ALTER TABLE public.sales_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_email_tracking ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for sales_email_templates

-- All authenticated users can view active templates
CREATE POLICY "sales_email_templates_select_active"
  ON public.sales_email_templates
  FOR SELECT
  USING (
    is_active = TRUE
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Sales staff can insert templates
CREATE POLICY "sales_email_templates_insert_own"
  ON public.sales_email_templates
  FOR INSERT
  WITH CHECK (
    (auth.jwt()->>'user_role')::text IN ('sales_staff', 'super_admin')
  );

-- Users can update their own templates
CREATE POLICY "sales_email_templates_update_own"
  ON public.sales_email_templates
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Users can delete their own templates
CREATE POLICY "sales_email_templates_delete_own"
  ON public.sales_email_templates
  FOR DELETE
  USING (
    created_by = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- 6. RLS Policies for sales_email_tracking

-- Users can view their own sent emails
CREATE POLICY "sales_email_tracking_select_own"
  ON public.sales_email_tracking
  FOR SELECT
  USING (
    sender_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Sales staff can insert email tracking
CREATE POLICY "sales_email_tracking_insert_own"
  ON public.sales_email_tracking
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (auth.jwt()->>'user_role')::text IN ('sales_staff', 'super_admin')
  );

-- Users can update their own email tracking
CREATE POLICY "sales_email_tracking_update_own"
  ON public.sales_email_tracking
  FOR UPDATE
  USING (
    sender_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Users can delete their own email tracking
CREATE POLICY "sales_email_tracking_delete_own"
  ON public.sales_email_tracking
  FOR DELETE
  USING (
    sender_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- 7. Create triggers for updated_at
CREATE TRIGGER update_sales_email_templates_updated_at
  BEFORE UPDATE ON public.sales_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_sales_email_tracking_updated_at
  BEFORE UPDATE ON public.sales_email_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 8. Create function to increment template usage count
CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment usage count when template is used
  IF NEW.template_id IS NOT NULL THEN
    UPDATE public.sales_email_templates
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment usage
DROP TRIGGER IF EXISTS increment_template_usage_trigger ON public.sales_email_tracking;
CREATE TRIGGER increment_template_usage_trigger
  AFTER INSERT ON public.sales_email_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_template_usage();

-- 9. Seed default email templates
INSERT INTO public.sales_email_templates (name, subject, content, category, variables)
VALUES
  (
    'Follow-up: First Contact',
    'Following up on your inquiry - {{clinic_name}}',
    '<p>สวัสดีค่ะคุณ {{customer_name}}</p>
    <p>ขอบคุณที่สนใจบริการของเรา ทางทีมงาน {{clinic_name}} ยินดีที่จะให้คำปรึกษาและแนะนำการดูแลผิวที่เหมาะสมกับคุณค่ะ</p>
    <p>หากมีข้อสงสัยเพิ่มเติม สามารถติดต่อกลับมาได้ตลอดเวลาค่ะ</p>
    <p>ด้วยความเคารพ<br>
    {{sales_name}}<br>
    {{clinic_name}}</p>',
    'follow_up',
    ARRAY['customer_name', 'clinic_name', 'sales_name']
  ),
  (
    'Proposal Sent',
    'แผนการดูแลผิวสำหรับคุณ {{customer_name}}',
    '<p>สวัสดีค่ะคุณ {{customer_name}}</p>
    <p>ทางเราได้จัดทำแผนการดูแลผิวที่เหมาะสมกับความต้องการของคุณแล้วค่ะ</p>
    <p>ราคารวม: {{total_price}} บาท</p>
    <p>กรุณาตรวจสอบรายละเอียดและติดต่อกลับเพื่อนัดหมาย</p>
    <p>ข้อเสนอนี้มีอายุถึง: {{valid_until}}</p>
    <p>ด้วยความเคารพ<br>
    {{sales_name}}<br>
    {{clinic_name}}</p>',
    'proposal',
    ARRAY['customer_name', 'total_price', 'valid_until', 'sales_name', 'clinic_name']
  ),
  (
    'Thank You - First Visit',
    'ขอบคุณที่มาใช้บริการ - {{clinic_name}}',
    '<p>สวัสดีค่ะคุณ {{customer_name}}</p>
    <p>ขอบคุณที่ไว้วางใจและมาใช้บริการของเรา เราหวังว่าคุณจะได้รับประสบการณ์ที่ดีค่ะ</p>
    <p>หากมีข้อสงสัยหรือต้องการคำปรึกษาเพิ่มเติม สามารถติดต่อเราได้ตลอดเวลา</p>
    <p>ด้วยความเคารพ<br>
    {{sales_name}}<br>
    {{clinic_name}}</p>',
    'thank_you',
    ARRAY['customer_name', 'sales_name', 'clinic_name']
  ),
  (
    'Appointment Reminder',
    'แจ้งเตือนนัดหมาย - {{appointment_date}}',
    '<p>สวัสดีค่ะคุณ {{customer_name}}</p>
    <p>ขอแจ้งเตือนการนัดหมายของคุณ</p>
    <p><strong>วันที่:</strong> {{appointment_date}}<br>
    <strong>เวลา:</strong> {{appointment_time}}<br>
    <strong>บริการ:</strong> {{service_name}}</p>
    <p>หากต้องการเปลี่ยนแปลงหรือยกเลิกนัดหมาย กรุณาแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมง</p>
    <p>ด้วยความเคารพ<br>
    {{sales_name}}<br>
    {{clinic_name}}</p>',
    'reminder',
    ARRAY['customer_name', 'appointment_date', 'appointment_time', 'service_name', 'sales_name', 'clinic_name']
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'sales_email%' ORDER BY tablename;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename LIKE 'sales_email%'
-- ORDER BY tablename, policyname;

-- View templates
-- SELECT * FROM public.sales_email_templates ORDER BY category, name;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
/*
DROP TRIGGER IF EXISTS increment_template_usage_trigger ON public.sales_email_tracking;
DROP TRIGGER IF EXISTS update_sales_email_tracking_updated_at ON public.sales_email_tracking;
DROP TRIGGER IF EXISTS update_sales_email_templates_updated_at ON public.sales_email_templates;

DROP FUNCTION IF EXISTS public.increment_template_usage();

DROP TABLE IF EXISTS public.sales_email_tracking;
DROP TABLE IF EXISTS public.sales_email_templates;

DROP TYPE IF EXISTS email_template_category;
DROP TYPE IF EXISTS email_status;
*/
