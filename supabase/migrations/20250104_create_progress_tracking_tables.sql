-- Treatment Progress Tracking Database Schema
-- Phase 5: Track treatment progress with before/after photos and metrics

-- Create progress photos table
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  
  -- Photo details
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Timeline
  photo_type VARCHAR(20) NOT NULL CHECK (photo_type IN ('baseline', 'progress', 'final')),
  session_number INTEGER, -- Which treatment session (1, 2, 3...)
  days_since_treatment INTEGER, -- Days after treatment started
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Analysis results (snapshot at time of photo)
  analysis_results JSONB,
  quality_metrics JSONB,
  
  -- Face alignment data (for comparison)
  face_landmarks JSONB, -- 478 MediaPipe landmarks
  alignment_matrix JSONB, -- Transformation matrix for alignment
  
  -- Metadata
  notes TEXT,
  is_verified BOOLEAN DEFAULT false, -- Verified by clinic/doctor
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress comparisons table
CREATE TABLE IF NOT EXISTS progress_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Photos being compared
  before_photo_id UUID NOT NULL REFERENCES progress_photos(id) ON DELETE CASCADE,
  after_photo_id UUID NOT NULL REFERENCES progress_photos(id) ON DELETE CASCADE,
  
  -- Calculated improvements
  improvement_spots NUMERIC(5, 2), -- % improvement
  improvement_pores NUMERIC(5, 2),
  improvement_wrinkles NUMERIC(5, 2),
  improvement_texture NUMERIC(5, 2),
  improvement_redness NUMERIC(5, 2),
  improvement_overall NUMERIC(5, 2),
  
  -- Delta metrics
  spots_delta INTEGER, -- Change in count
  pores_delta INTEGER,
  wrinkles_delta INTEGER,
  
  -- Comparison metadata
  comparison_type VARCHAR(20) DEFAULT 'manual', -- 'manual', 'auto_weekly', 'auto_monthly'
  alignment_score NUMERIC(3, 2), -- How well aligned (0-1)
  
  -- Report generation
  report_generated BOOLEAN DEFAULT false,
  report_url TEXT,
  report_generated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create treatment sessions table (link progress to actual treatments)
CREATE TABLE IF NOT EXISTS treatment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  
  -- Session details
  session_number INTEGER NOT NULL,
  session_date DATE NOT NULL,
  
  -- Treatment specifics
  areas_treated TEXT[],
  units_used INTEGER, -- For Botox
  syringes_used NUMERIC(3, 1), -- For fillers
  
  -- Cost
  actual_cost NUMERIC(10, 2),
  
  -- Provider
  provider_name VARCHAR(100),
  provider_notes TEXT,
  
  -- Next appointment
  next_session_date DATE,
  
  -- Photos taken
  before_photo_id UUID REFERENCES progress_photos(id),
  after_photo_id UUID REFERENCES progress_photos(id),
  
  -- Status
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress milestones table
CREATE TABLE IF NOT EXISTS progress_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Milestone details
  milestone_type VARCHAR(30) NOT NULL, -- 'first_session', 'halfway', 'completed', 'custom'
  title VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Achievement
  achieved_at TIMESTAMPTZ,
  photo_id UUID REFERENCES progress_photos(id),
  
  -- Metrics at milestone
  metrics_snapshot JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_progress_photos_user ON progress_photos(user_id);
CREATE INDEX idx_progress_photos_type ON progress_photos(photo_type);
CREATE INDEX idx_progress_photos_taken ON progress_photos(taken_at DESC);
CREATE INDEX idx_progress_comparisons_user ON progress_comparisons(user_id);
CREATE INDEX idx_treatment_sessions_user ON treatment_sessions(user_id);
CREATE INDEX idx_treatment_sessions_date ON treatment_sessions(session_date DESC);

-- Add comments
COMMENT ON TABLE progress_photos IS 'Before/during/after treatment photos with analysis results';
COMMENT ON TABLE progress_comparisons IS 'Calculated improvements between photo pairs';
COMMENT ON TABLE treatment_sessions IS 'Actual treatment session records from clinics';
COMMENT ON TABLE progress_milestones IS 'Achievement tracking for gamification';

COMMENT ON COLUMN progress_photos.photo_type IS 'baseline = before treatment, progress = during, final = after completion';
COMMENT ON COLUMN progress_comparisons.improvement_overall IS 'Overall improvement percentage (0-100)';
COMMENT ON COLUMN treatment_sessions.units_used IS 'For injectable treatments (Botox units)';
