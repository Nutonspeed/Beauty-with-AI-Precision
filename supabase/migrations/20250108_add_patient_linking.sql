-- Migration: Add Patient Linking for Before/After Comparison
-- Date: 2025-01-08
-- Purpose: Enable linking multiple analyses for the same patient to track progress over time

-- Add patient identification fields to skin_analyses
-- Note: user_id already exists, but we add explicit patient fields for better tracking

-- Add columns for patient linking
ALTER TABLE skin_analyses 
ADD COLUMN IF NOT EXISTS patient_name TEXT,
ADD COLUMN IF NOT EXISTS patient_email TEXT,
ADD COLUMN IF NOT EXISTS patient_phone TEXT,
ADD COLUMN IF NOT EXISTS patient_age INTEGER,
ADD COLUMN IF NOT EXISTS patient_gender TEXT,
ADD COLUMN IF NOT EXISTS session_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS treatment_phase TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_baseline BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS previous_analysis_id TEXT,
ADD COLUMN IF NOT EXISTS comparison_group_id UUID;

-- Add index for faster patient queries
CREATE INDEX IF NOT EXISTS idx_skin_analyses_user_id ON skin_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_patient_email ON skin_analyses(patient_email);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_comparison_group ON skin_analyses(comparison_group_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_created_at ON skin_analyses(created_at DESC);

-- Add foreign key for previous_analysis_id
ALTER TABLE skin_analyses 
ADD CONSTRAINT fk_previous_analysis 
FOREIGN KEY (previous_analysis_id) 
REFERENCES skin_analyses(id) 
ON DELETE SET NULL;

-- Create comparison_groups table for grouping related analyses
CREATE TABLE IF NOT EXISTS comparison_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  baseline_analysis_id TEXT REFERENCES skin_analyses(id) ON DELETE SET NULL,
  treatment_goal TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for comparison_groups
CREATE INDEX IF NOT EXISTS idx_comparison_groups_user_id ON comparison_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_comparison_groups_status ON comparison_groups(status);
CREATE INDEX IF NOT EXISTS idx_comparison_groups_patient_email ON comparison_groups(patient_email);

-- Create analysis_comparisons table for tracking specific comparisons
CREATE TABLE IF NOT EXISTS analysis_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_group_id UUID NOT NULL REFERENCES comparison_groups(id) ON DELETE CASCADE,
  before_analysis_id TEXT NOT NULL REFERENCES skin_analyses(id) ON DELETE CASCADE,
  after_analysis_id TEXT NOT NULL REFERENCES skin_analyses(id) ON DELETE CASCADE,
  improvement_percentage DECIMAL(5,2),
  key_improvements JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_comparison UNIQUE (before_analysis_id, after_analysis_id)
);

-- Add indexes for analysis_comparisons
CREATE INDEX IF NOT EXISTS idx_analysis_comparisons_group ON analysis_comparisons(comparison_group_id);
CREATE INDEX IF NOT EXISTS idx_analysis_comparisons_before ON analysis_comparisons(before_analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_comparisons_after ON analysis_comparisons(after_analysis_id);

-- Create analysis_milestones table for tracking treatment progress
CREATE TABLE IF NOT EXISTS analysis_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_group_id UUID NOT NULL REFERENCES comparison_groups(id) ON DELETE CASCADE,
  analysis_id TEXT NOT NULL REFERENCES skin_analyses(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('baseline', 'progress', 'final', 'follow_up')),
  session_number INTEGER NOT NULL,
  treatment_received TEXT,
  practitioner_notes TEXT,
  patient_feedback TEXT,
  milestone_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_group_session UNIQUE (comparison_group_id, session_number)
);

-- Add indexes for analysis_milestones
CREATE INDEX IF NOT EXISTS idx_analysis_milestones_group ON analysis_milestones(comparison_group_id);
CREATE INDEX IF NOT EXISTS idx_analysis_milestones_analysis ON analysis_milestones(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_milestones_date ON analysis_milestones(milestone_date DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_milestones_type ON analysis_milestones(milestone_type);

-- Create function to calculate improvement metrics
CREATE OR REPLACE FUNCTION calculate_improvement_metrics(
  before_analysis_id TEXT,
  after_analysis_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  before_metrics JSONB;
  after_metrics JSONB;
  improvement JSONB;
BEGIN
  -- Get metrics from both analyses
  SELECT metrics INTO before_metrics FROM skin_analyses WHERE id = before_analysis_id;
  SELECT metrics INTO after_metrics FROM skin_analyses WHERE id = after_analysis_id;
  
  -- Calculate improvements (simple subtraction for now)
  improvement := jsonb_build_object(
    'spots', (COALESCE((after_metrics->>'spots')::numeric, 0) - COALESCE((before_metrics->>'spots')::numeric, 0)),
    'pores', (COALESCE((after_metrics->>'pores')::numeric, 0) - COALESCE((before_metrics->>'pores')::numeric, 0)),
    'wrinkles', (COALESCE((after_metrics->>'wrinkles')::numeric, 0) - COALESCE((before_metrics->>'wrinkles')::numeric, 0)),
    'texture', (COALESCE((after_metrics->>'texture')::numeric, 0) - COALESCE((before_metrics->>'texture')::numeric, 0)),
    'redness', (COALESCE((after_metrics->>'redness')::numeric, 0) - COALESCE((before_metrics->>'redness')::numeric, 0))
  );
  
  RETURN improvement;
END;
$$ LANGUAGE plpgsql;

-- Create function to get patient analysis timeline
CREATE OR REPLACE FUNCTION get_patient_timeline(p_user_id TEXT, p_patient_email TEXT DEFAULT NULL)
RETURNS TABLE (
  analysis_id TEXT,
  created_at TIMESTAMPTZ,
  session_number INTEGER,
  milestone_type TEXT,
  overall_score NUMERIC,
  improvement_from_previous NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.id,
    sa.created_at,
    sa.session_number,
    COALESCE(am.milestone_type, 'progress'),
    COALESCE((sa.metrics->>'overall_score')::numeric, 0),
    -- Calculate improvement from previous session
    CASE 
      WHEN LAG(sa.metrics->>'overall_score') OVER (ORDER BY sa.created_at) IS NOT NULL
      THEN (sa.metrics->>'overall_score')::numeric - LAG((sa.metrics->>'overall_score')::numeric) OVER (ORDER BY sa.created_at)
      ELSE 0
    END as improvement
  FROM skin_analyses sa
  LEFT JOIN analysis_milestones am ON am.analysis_id = sa.id
  WHERE sa.user_id = p_user_id
    AND (p_patient_email IS NULL OR sa.patient_email = p_patient_email)
  ORDER BY sa.created_at;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for new tables

-- comparison_groups policies
ALTER TABLE comparison_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own comparison groups" 
  ON comparison_groups FOR SELECT 
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can create comparison groups" 
  ON comparison_groups FOR INSERT 
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own comparison groups" 
  ON comparison_groups FOR UPDATE 
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete their own comparison groups" 
  ON comparison_groups FOR DELETE 
  USING (auth.uid()::TEXT = user_id);

-- analysis_comparisons policies
ALTER TABLE analysis_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comparisons for their groups" 
  ON analysis_comparisons FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM comparison_groups 
      WHERE id = analysis_comparisons.comparison_group_id 
      AND user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can create comparisons for their groups" 
  ON analysis_comparisons FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comparison_groups 
      WHERE id = analysis_comparisons.comparison_group_id 
      AND user_id = auth.uid()::TEXT
    )
  );

-- analysis_milestones policies
ALTER TABLE analysis_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestones for their groups" 
  ON analysis_milestones FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM comparison_groups 
      WHERE id = analysis_milestones.comparison_group_id 
      AND user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can create milestones for their groups" 
  ON analysis_milestones FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comparison_groups 
      WHERE id = analysis_milestones.comparison_group_id 
      AND user_id = auth.uid()::TEXT
    )
  );

-- Add comments for documentation
COMMENT ON TABLE comparison_groups IS 'Groups related analyses for the same patient to track treatment progress';
COMMENT ON TABLE analysis_comparisons IS 'Stores specific before/after comparisons with improvement metrics';
COMMENT ON TABLE analysis_milestones IS 'Tracks treatment milestones and session progress';
COMMENT ON COLUMN skin_analyses.patient_name IS 'Patient name for easier identification';
COMMENT ON COLUMN skin_analyses.session_number IS 'Treatment session number for this analysis';
COMMENT ON COLUMN skin_analyses.is_baseline IS 'Marks if this is the baseline (first) analysis for comparison';
COMMENT ON COLUMN skin_analyses.comparison_group_id IS 'Links to comparison group for multi-analysis tracking';

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comparison_groups_updated_at BEFORE UPDATE ON comparison_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_comparisons_updated_at BEFORE UPDATE ON analysis_comparisons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
