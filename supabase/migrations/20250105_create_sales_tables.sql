-- =====================================================
-- Create Sales Management Tables
-- =====================================================
-- Tables: sales_leads, sales_proposals, sales_activities
-- Date: 2025-11-05
-- =====================================================

-- 1. Create ENUM types for sales
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    CREATE TYPE lead_status AS ENUM (
      'new',
      'contacted',
      'qualified',
      'proposal_sent',
      'negotiation',
      'won',
      'lost',
      'cold',
      'warm',
      'hot'
    );
    RAISE NOTICE '✅ Created ENUM type: lead_status';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source') THEN
    CREATE TYPE lead_source AS ENUM (
      'website',
      'facebook',
      'instagram',
      'google_ads',
      'referral',
      'walk_in',
      'phone',
      'email',
      'other'
    );
    RAISE NOTICE '✅ Created ENUM type: lead_source';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proposal_status') THEN
    CREATE TYPE proposal_status AS ENUM (
      'draft',
      'sent',
      'viewed',
      'accepted',
      'rejected',
      'expired'
    );
    RAISE NOTICE '✅ Created ENUM type: proposal_status';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE activity_type AS ENUM (
      'call',
      'email',
      'meeting',
      'note',
      'task',
      'proposal_sent',
      'status_change'
    );
    RAISE NOTICE '✅ Created ENUM type: activity_type';
  END IF;
END $$;

-- 2. Create sales_leads table
CREATE TABLE IF NOT EXISTS public.sales_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership
  sales_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  customer_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Contact Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  line_id TEXT,
  
  -- Lead Details
  status lead_status NOT NULL DEFAULT 'new',
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  source lead_source NOT NULL DEFAULT 'website',
  
  -- Concerns & Interests
  primary_concern TEXT,
  secondary_concerns TEXT[],
  interested_treatments TEXT[],
  
  -- Financial
  estimated_value DECIMAL(10, 2) DEFAULT 0,
  budget_range_min DECIMAL(10, 2),
  budget_range_max DECIMAL(10, 2),
  
  -- Tracking
  first_contact_at TIMESTAMPTZ,
  last_contact_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes for sales_leads
CREATE INDEX IF NOT EXISTS sales_leads_sales_user_id_idx ON public.sales_leads(sales_user_id);
CREATE INDEX IF NOT EXISTS sales_leads_customer_user_id_idx ON public.sales_leads(customer_user_id);
CREATE INDEX IF NOT EXISTS sales_leads_status_idx ON public.sales_leads(status);
CREATE INDEX IF NOT EXISTS sales_leads_source_idx ON public.sales_leads(source);
CREATE INDEX IF NOT EXISTS sales_leads_score_idx ON public.sales_leads(score DESC);
CREATE INDEX IF NOT EXISTS sales_leads_created_at_idx ON public.sales_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS sales_leads_next_follow_up_idx ON public.sales_leads(next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;

-- Full-text search on leads
CREATE INDEX IF NOT EXISTS sales_leads_search_idx ON public.sales_leads 
  USING gin(to_tsvector('english', name || ' ' || email || ' ' || COALESCE(phone, '') || ' ' || COALESCE(primary_concern, '')));

COMMENT ON TABLE public.sales_leads IS 'Sales leads and prospects management';

-- 3. Create sales_proposals table
CREATE TABLE IF NOT EXISTS public.sales_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  lead_id UUID NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  sales_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  
  -- Proposal Details
  title TEXT NOT NULL,
  description TEXT,
  status proposal_status NOT NULL DEFAULT 'draft',
  
  -- Treatments
  treatments JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {name, price, sessions, description}
  
  -- Financial
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Terms
  valid_until TIMESTAMPTZ,
  payment_terms TEXT,
  terms_and_conditions TEXT,
  
  -- Tracking
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  first_viewed_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Win/Loss Analysis
  win_probability DECIMAL(5, 2) DEFAULT 0 CHECK (win_probability >= 0 AND win_probability <= 100),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for sales_proposals
CREATE INDEX IF NOT EXISTS sales_proposals_lead_id_idx ON public.sales_proposals(lead_id);
CREATE INDEX IF NOT EXISTS sales_proposals_sales_user_id_idx ON public.sales_proposals(sales_user_id);
CREATE INDEX IF NOT EXISTS sales_proposals_clinic_id_idx ON public.sales_proposals(clinic_id);
CREATE INDEX IF NOT EXISTS sales_proposals_status_idx ON public.sales_proposals(status);
CREATE INDEX IF NOT EXISTS sales_proposals_created_at_idx ON public.sales_proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS sales_proposals_valid_until_idx ON public.sales_proposals(valid_until) WHERE valid_until IS NOT NULL;

COMMENT ON TABLE public.sales_proposals IS 'Sales proposals and quotations';

-- 4. Create sales_activities table
CREATE TABLE IF NOT EXISTS public.sales_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  lead_id UUID NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  sales_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES public.sales_proposals(id) ON DELETE SET NULL,
  
  -- Activity Details
  type activity_type NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  
  -- Contact Information (for calls/emails)
  contact_method TEXT, -- 'phone', 'email', 'line', 'whatsapp', etc.
  duration_minutes INTEGER,
  
  -- Task Management (for tasks)
  is_task BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for sales_activities
CREATE INDEX IF NOT EXISTS sales_activities_lead_id_idx ON public.sales_activities(lead_id);
CREATE INDEX IF NOT EXISTS sales_activities_sales_user_id_idx ON public.sales_activities(sales_user_id);
CREATE INDEX IF NOT EXISTS sales_activities_proposal_id_idx ON public.sales_activities(proposal_id);
CREATE INDEX IF NOT EXISTS sales_activities_type_idx ON public.sales_activities(type);
CREATE INDEX IF NOT EXISTS sales_activities_created_at_idx ON public.sales_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS sales_activities_due_date_idx ON public.sales_activities(due_date) WHERE is_task = TRUE AND completed_at IS NULL;

COMMENT ON TABLE public.sales_activities IS 'Activity log for sales interactions';

-- 5. Enable RLS on all tables
ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_activities ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for sales_leads

-- Sales staff can view their own leads
CREATE POLICY "sales_leads_select_own"
  ON public.sales_leads
  FOR SELECT
  USING (
    sales_user_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Sales staff can insert leads
CREATE POLICY "sales_leads_insert_own"
  ON public.sales_leads
  FOR INSERT
  WITH CHECK (
    sales_user_id = auth.uid()
    AND (auth.jwt()->>'user_role')::text IN ('sales_staff', 'super_admin')
  );

-- Sales staff can update their own leads
CREATE POLICY "sales_leads_update_own"
  ON public.sales_leads
  FOR UPDATE
  USING (
    sales_user_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Sales staff can delete their own leads (soft delete recommended in production)
CREATE POLICY "sales_leads_delete_own"
  ON public.sales_leads
  FOR DELETE
  USING (
    sales_user_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- 7. RLS Policies for sales_proposals

-- Sales staff can view their own proposals
CREATE POLICY "sales_proposals_select_own"
  ON public.sales_proposals
  FOR SELECT
  USING (
    sales_user_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Sales staff can insert proposals
CREATE POLICY "sales_proposals_insert_own"
  ON public.sales_proposals
  FOR INSERT
  WITH CHECK (
    sales_user_id = auth.uid()
    AND (auth.jwt()->>'user_role')::text IN ('sales_staff', 'super_admin')
  );

-- Sales staff can update their own proposals
CREATE POLICY "sales_proposals_update_own"
  ON public.sales_proposals
  FOR UPDATE
  USING (
    sales_user_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Sales staff can delete their own proposals
CREATE POLICY "sales_proposals_delete_own"
  ON public.sales_proposals
  FOR DELETE
  USING (
    sales_user_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- 8. RLS Policies for sales_activities

-- Sales staff can view their own activities
CREATE POLICY "sales_activities_select_own"
  ON public.sales_activities
  FOR SELECT
  USING (
    sales_user_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Sales staff can insert activities
CREATE POLICY "sales_activities_insert_own"
  ON public.sales_activities
  FOR INSERT
  WITH CHECK (
    sales_user_id = auth.uid()
    AND (auth.jwt()->>'user_role')::text IN ('sales_staff', 'super_admin')
  );

-- Sales staff can update their own activities
CREATE POLICY "sales_activities_update_own"
  ON public.sales_activities
  FOR UPDATE
  USING (
    sales_user_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Sales staff can delete their own activities
CREATE POLICY "sales_activities_delete_own"
  ON public.sales_activities
  FOR DELETE
  USING (
    sales_user_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- 9. Create triggers for updated_at
CREATE TRIGGER update_sales_leads_updated_at
  BEFORE UPDATE ON public.sales_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_sales_proposals_updated_at
  BEFORE UPDATE ON public.sales_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 10. Create function to calculate proposal total
CREATE OR REPLACE FUNCTION public.calculate_proposal_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate subtotal from treatments
  NEW.subtotal := (
    SELECT COALESCE(SUM((treatment->>'price')::decimal), 0)
    FROM jsonb_array_elements(NEW.treatments) AS treatment
  );
  
  -- Calculate discount amount
  IF NEW.discount_percent > 0 THEN
    NEW.discount_amount := NEW.subtotal * (NEW.discount_percent / 100);
  END IF;
  
  -- Calculate total
  NEW.total_value := NEW.subtotal - NEW.discount_amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate proposal totals
DROP TRIGGER IF EXISTS calculate_proposal_total_trigger ON public.sales_proposals;
CREATE TRIGGER calculate_proposal_total_trigger
  BEFORE INSERT OR UPDATE OF treatments, discount_percent, discount_amount ON public.sales_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_proposal_total();

-- 11. Create function to auto-update lead last_contact_at
CREATE OR REPLACE FUNCTION public.update_lead_last_contact()
RETURNS TRIGGER AS $$
BEGIN
  -- Update lead's last_contact_at when activity is created
  UPDATE public.sales_leads
  SET last_contact_at = NEW.created_at
  WHERE id = NEW.lead_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last contact time
DROP TRIGGER IF EXISTS update_lead_last_contact_trigger ON public.sales_activities;
CREATE TRIGGER update_lead_last_contact_trigger
  AFTER INSERT ON public.sales_activities
  FOR EACH ROW
  WHEN (NEW.type IN ('call', 'email', 'meeting'))
  EXECUTE FUNCTION public.update_lead_last_contact();

-- 12. Create function to update proposal view tracking
CREATE OR REPLACE FUNCTION public.track_proposal_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if status changes to 'viewed'
  IF OLD.status != 'viewed' AND NEW.status = 'viewed' THEN
    NEW.view_count := COALESCE(NEW.view_count, 0) + 1;
    NEW.viewed_at := NOW();
    
    -- Set first_viewed_at if not set
    IF NEW.first_viewed_at IS NULL THEN
      NEW.first_viewed_at := NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for proposal view tracking
DROP TRIGGER IF EXISTS track_proposal_view_trigger ON public.sales_proposals;
CREATE TRIGGER track_proposal_view_trigger
  BEFORE UPDATE OF status ON public.sales_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.track_proposal_view();

-- =====================================================
-- SEED DATA (Demo/Testing)
-- =====================================================

-- Insert demo leads (requires sales user to exist)
-- Find sales user ID first
DO $$
DECLARE
  sales_user UUID;
BEGIN
  -- Get sales user ID
  SELECT id INTO sales_user FROM public.users WHERE role = 'sales_staff' LIMIT 1;
  
  IF sales_user IS NOT NULL THEN
    -- Insert demo leads
    INSERT INTO public.sales_leads 
      (sales_user_id, name, email, phone, status, score, source, primary_concern, estimated_value, first_contact_at, last_contact_at)
    VALUES
      (sales_user, 'นางสาวสมหญิง ใจดี', 'somying@example.com', NULL, 'hot', 85, 'website', 'สิวอักเสบ', 15000, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
      (sales_user, 'คุณวิชัย มั่งมี', 'wichai@example.com', NULL, 'warm', 65, 'facebook', 'ฝ้า กระ จุดด่างดำ', 25000, NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'),
      (sales_user, 'นายประเสริฐ รุ่งเรือง', 'prasert@example.com', NULL, 'warm', 60, 'google_ads', 'ริ้วรอยแห่งวัย', 35000, NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 days'),
      (sales_user, 'คุณสุดา สวยงาม', 'suda@example.com', NULL, 'cold', 30, 'referral', 'รูขุมขนกว้าง', 8000, NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days'),
      (sales_user, 'นางจิรา เจริญสุข', 'jira@example.com', NULL, 'new', 50, 'instagram', 'ผิวไม่เรียบเนียน', 12000, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Inserted demo sales leads';
  ELSE
    RAISE NOTICE 'ℹ️  No sales user found, skipping demo data';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'sales_%' ORDER BY tablename;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename LIKE 'sales_%'
-- ORDER BY tablename, policyname;

-- Count leads by status
-- SELECT status, COUNT(*) FROM public.sales_leads GROUP BY status;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
/*
DROP TRIGGER IF EXISTS track_proposal_view_trigger ON public.sales_proposals;
DROP TRIGGER IF EXISTS update_lead_last_contact_trigger ON public.sales_activities;
DROP TRIGGER IF EXISTS calculate_proposal_total_trigger ON public.sales_proposals;
DROP TRIGGER IF EXISTS update_sales_proposals_updated_at ON public.sales_proposals;
DROP TRIGGER IF EXISTS update_sales_leads_updated_at ON public.sales_leads;

DROP FUNCTION IF EXISTS public.track_proposal_view();
DROP FUNCTION IF EXISTS public.update_lead_last_contact();
DROP FUNCTION IF EXISTS public.calculate_proposal_total();

DROP TABLE IF EXISTS public.sales_activities;
DROP TABLE IF EXISTS public.sales_proposals;
DROP TABLE IF EXISTS public.sales_leads;

DROP TYPE IF EXISTS activity_type;
DROP TYPE IF EXISTS proposal_status;
DROP TYPE IF EXISTS lead_source;
DROP TYPE IF EXISTS lead_status;
*/
