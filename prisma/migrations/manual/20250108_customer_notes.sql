-- Customer Notes System
-- บันทึกโน้ตสำหรับลูกค้าแต่ละคน แบบ timeline (หลาย entries)

-- Create customer_notes table
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sales_staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN ('call', 'meeting', 'followup', 'general', 'important')),
  
  -- Tags & categorization
  tags TEXT[] DEFAULT '{}',
  
  -- Context (optional - เชื่อมกับข้อมูลอื่น)
  related_scan_id UUID REFERENCES skin_analyses(id) ON DELETE SET NULL,
  related_proposal_id UUID,
  
  -- Attachments (JSON)
  attachments JSONB DEFAULT '[]',
  
  -- Reminder
  followup_date TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  is_private BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Audit
  created_by_name TEXT NOT NULL,
  updated_by_name TEXT
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer 
  ON customer_notes(customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_notes_staff 
  ON customer_notes(sales_staff_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_notes_clinic 
  ON customer_notes(clinic_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_notes_followup 
  ON customer_notes(followup_date) 
  WHERE followup_date IS NOT NULL AND reminder_sent = FALSE;

CREATE INDEX IF NOT EXISTS idx_customer_notes_pinned 
  ON customer_notes(customer_id, is_pinned, created_at DESC) 
  WHERE is_pinned = TRUE;

-- Enable RLS
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view notes for customers in their clinic
CREATE POLICY "customer_notes_select_policy" ON customer_notes
  FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Sales staff can insert notes
CREATE POLICY "customer_notes_insert_policy" ON customer_notes
  FOR INSERT
  WITH CHECK (
    sales_staff_id = auth.uid() AND
    clinic_id IN (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Sales staff can update their own notes
CREATE POLICY "customer_notes_update_policy" ON customer_notes
  FOR UPDATE
  USING (
    sales_staff_id = auth.uid()
  )
  WITH CHECK (
    sales_staff_id = auth.uid()
  );

-- Policy: Sales staff can delete their own notes
CREATE POLICY "customer_notes_delete_policy" ON customer_notes
  FOR DELETE
  USING (
    sales_staff_id = auth.uid()
  );

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER customer_notes_updated_at
  BEFORE UPDATE ON customer_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_notes_updated_at();

-- Add comment
COMMENT ON TABLE customer_notes IS 'Customer notes for sales staff - timeline based multiple entries';
COMMENT ON COLUMN customer_notes.content IS 'Note content - can be anything sales staff wants to remember';
COMMENT ON COLUMN customer_notes.note_type IS 'Type of note: call, meeting, followup, general, important';
COMMENT ON COLUMN customer_notes.tags IS 'Tags for categorization (e.g. hot-lead, budget-30k, interested-botox)';
COMMENT ON COLUMN customer_notes.followup_date IS 'Date to follow up with customer (for reminders)';
COMMENT ON COLUMN customer_notes.is_pinned IS 'Pin important notes to top of list';
