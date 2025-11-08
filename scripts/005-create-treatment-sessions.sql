-- Create treatment_sessions table for tracking progress
CREATE TABLE IF NOT EXISTS treatment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_plan_id TEXT NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  scheduled_date DATE,
  completed_date DATE,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  before_photos JSONB,
  after_photos JSONB,
  staff_id UUID REFERENCES users(id),
  customer_feedback TEXT,
  staff_observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_photos table
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_plan_id TEXT NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
  session_id UUID REFERENCES treatment_sessions(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type VARCHAR(50) CHECK (photo_type IN ('before', 'after', 'progress')),
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_plan ON treatment_sessions(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_status ON treatment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_progress_photos_plan ON progress_photos(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_session ON progress_photos(session_id);

-- Enable RLS
ALTER TABLE treatment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for treatment_sessions
CREATE POLICY "Users can view their own treatment sessions"
  ON treatment_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM treatment_plans
      WHERE treatment_plans.id = treatment_sessions.treatment_plan_id
      AND treatment_plans.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Staff can view all treatment sessions"
  ON treatment_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'clinic_staff')
    )
  );

CREATE POLICY "Staff can manage treatment sessions"
  ON treatment_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'clinic_staff')
    )
  );

-- RLS Policies for progress_photos
CREATE POLICY "Users can view their own progress photos"
  ON progress_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM treatment_plans
      WHERE treatment_plans.id = progress_photos.treatment_plan_id
      AND treatment_plans.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Staff can manage progress photos"
  ON progress_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'clinic_staff')
    )
  );
