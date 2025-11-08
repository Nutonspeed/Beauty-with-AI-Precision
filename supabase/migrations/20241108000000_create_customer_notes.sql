-- Create customer_notes table for sales staff to track customer interactions
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  customer_id UUID NOT NULL,
  sales_staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL,
  
  -- Note content
  content TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('call', 'meeting', 'followup', 'general', 'important')),
  tags TEXT[] DEFAULT '{}',
  
  -- Flags
  is_private BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Related records
  followup_date TIMESTAMPTZ,
  related_scan_id UUID,
  related_proposal_id UUID,
  
  -- Attachments (JSON array of file metadata)
  attachments JSONB DEFAULT '[]',
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_name TEXT,
  updated_by_name TEXT
);

-- Indexes for performance
CREATE INDEX idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX idx_customer_notes_sales_staff_id ON customer_notes(sales_staff_id);
CREATE INDEX idx_customer_notes_clinic_id ON customer_notes(clinic_id);
CREATE INDEX idx_customer_notes_note_type ON customer_notes(note_type);
CREATE INDEX idx_customer_notes_is_pinned ON customer_notes(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_customer_notes_followup_date ON customer_notes(followup_date) WHERE followup_date IS NOT NULL;
CREATE INDEX idx_customer_notes_created_at ON customer_notes(created_at DESC);

-- Full text search index on content
CREATE INDEX idx_customer_notes_content_fts ON customer_notes USING gin(to_tsvector('english', content));

-- RLS Policies
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Sales staff can view their own notes
CREATE POLICY "Sales staff can view their own notes"
  ON customer_notes
  FOR SELECT
  USING (auth.uid() = sales_staff_id);

-- Policy: Sales staff can create notes
CREATE POLICY "Sales staff can create notes"
  ON customer_notes
  FOR INSERT
  WITH CHECK (auth.uid() = sales_staff_id);

-- Policy: Sales staff can update their own notes
CREATE POLICY "Sales staff can update their own notes"
  ON customer_notes
  FOR UPDATE
  USING (auth.uid() = sales_staff_id);

-- Policy: Sales staff can delete their own notes
CREATE POLICY "Sales staff can delete their own notes"
  ON customer_notes
  FOR DELETE
  USING (auth.uid() = sales_staff_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_customer_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_notes_updated_at
  BEFORE UPDATE ON customer_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_notes_updated_at();

-- Comments
COMMENT ON TABLE customer_notes IS 'Customer interaction notes for sales staff';
COMMENT ON COLUMN customer_notes.note_type IS 'Type of note: call, meeting, followup, general, important';
COMMENT ON COLUMN customer_notes.is_private IS 'Private notes only visible to creator';
COMMENT ON COLUMN customer_notes.is_pinned IS 'Pinned notes appear at top of list';
COMMENT ON COLUMN customer_notes.tags IS 'Searchable tags for categorization';
