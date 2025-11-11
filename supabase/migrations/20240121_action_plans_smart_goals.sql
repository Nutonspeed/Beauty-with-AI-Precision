-- Migration: Action Plans & Smart Goals System
-- Description: Creates tables for personalized action plans and SMART goal tracking
-- Author: Beauty with AI Precision
-- Date: 2024-01-21

-- =============================================
-- Action Plans Tables
-- =============================================

-- Main action plans table
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES skin_analyses(id) ON DELETE SET NULL,
  
  -- Plan metadata
  skin_health_score INTEGER CHECK (skin_health_score >= 0 AND skin_health_score <= 100),
  primary_concerns TEXT[] NOT NULL DEFAULT '{}',
  total_actions INTEGER NOT NULL DEFAULT 0,
  estimated_cost_min DECIMAL(10, 2),
  estimated_cost_max DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  progress_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Action items table
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  
  -- Action details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('daily', 'weekly', 'monthly', 'professional', 'lifestyle')),
  priority VARCHAR(50) NOT NULL CHECK (priority IN ('immediate', 'short-term', 'long-term')),
  concern_types TEXT[] NOT NULL DEFAULT '{}',
  
  -- Scheduling
  frequency VARCHAR(100),
  estimated_duration VARCHAR(100),
  
  -- Cost
  cost_min DECIMAL(10, 2),
  cost_max DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Difficulty and status
  difficulty VARCHAR(50) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status VARCHAR(50) NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'skipped')),
  
  -- Progress tracking
  start_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  notes TEXT,
  
  -- Display order
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Smart Goals Tables
-- =============================================

-- Main smart goals table
CREATE TABLE IF NOT EXISTS smart_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES action_plans(id) ON DELETE SET NULL,
  
  -- Goal type and status
  type VARCHAR(50) NOT NULL CHECK (type IN ('improvement', 'maintenance', 'prevention', 'habit')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  
  -- SMART: Specific
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  concern_types TEXT[] NOT NULL DEFAULT '{}',
  
  -- SMART: Measurable
  metric VARCHAR(100) NOT NULL,
  baseline DECIMAL(10, 2) NOT NULL,
  target DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2),
  unit VARCHAR(50) NOT NULL,
  
  -- SMART: Achievable
  difficulty VARCHAR(50) CHECK (difficulty IN ('easy', 'moderate', 'challenging')),
  required_actions TEXT[] DEFAULT '{}', -- Action item IDs
  prerequisites TEXT[] DEFAULT '{}',
  
  -- SMART: Relevant
  importance INTEGER CHECK (importance >= 1 AND importance <= 5),
  motivations TEXT[] DEFAULT '{}',
  related_goals TEXT[] DEFAULT '{}', -- Other goal IDs
  
  -- SMART: Time-bound
  time_frame VARCHAR(50) CHECK (time_frame IN ('2-weeks', '1-month', '3-months', '6-months', '1-year')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  check_in_frequency VARCHAR(50) CHECK (check_in_frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly')),
  
  -- Progress tracking
  progress_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT
);

-- Goal milestones table
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES smart_goals(id) ON DELETE CASCADE,
  
  -- Milestone details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date TIMESTAMPTZ NOT NULL,
  target_value DECIMAL(10, 2),
  
  -- Completion tracking
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_date TIMESTAMPTZ,
  
  -- Reward
  reward VARCHAR(255),
  
  -- Display order
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goal check-ins table
CREATE TABLE IF NOT EXISTS goal_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES smart_goals(id) ON DELETE CASCADE,
  
  -- Check-in data
  date TIMESTAMPTZ NOT NULL,
  current_value DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  photo_url TEXT,
  
  -- Mood and adherence
  mood VARCHAR(50) CHECK (mood IN ('great', 'good', 'okay', 'struggling')),
  adherence INTEGER CHECK (adherence >= 0 AND adherence <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goal photos table (for before/after tracking)
CREATE TABLE IF NOT EXISTS goal_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES smart_goals(id) ON DELETE CASCADE,
  
  -- Photo details
  photo_type VARCHAR(50) NOT NULL CHECK (photo_type IN ('before', 'progress', 'after')),
  url TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Action plans indexes
CREATE INDEX IF NOT EXISTS idx_action_plans_user_id ON action_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_analysis_id ON action_plans(analysis_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_created_at ON action_plans(created_at DESC);

-- Action items indexes
CREATE INDEX IF NOT EXISTS idx_action_items_plan_id ON action_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_priority ON action_items(priority);
CREATE INDEX IF NOT EXISTS idx_action_items_category ON action_items(category);
CREATE INDEX IF NOT EXISTS idx_action_items_display_order ON action_items(plan_id, display_order);

-- Smart goals indexes
CREATE INDEX IF NOT EXISTS idx_smart_goals_user_id ON smart_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_goals_plan_id ON smart_goals(plan_id);
CREATE INDEX IF NOT EXISTS idx_smart_goals_status ON smart_goals(status);
CREATE INDEX IF NOT EXISTS idx_smart_goals_type ON smart_goals(type);
CREATE INDEX IF NOT EXISTS idx_smart_goals_end_date ON smart_goals(end_date);

-- Goal milestones indexes
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_target_date ON goal_milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_completed ON goal_milestones(completed);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_display_order ON goal_milestones(goal_id, display_order);

-- Goal check-ins indexes
CREATE INDEX IF NOT EXISTS idx_goal_check_ins_goal_id ON goal_check_ins(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_check_ins_date ON goal_check_ins(date DESC);

-- Goal photos indexes
CREATE INDEX IF NOT EXISTS idx_goal_photos_goal_id ON goal_photos(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_photos_photo_type ON goal_photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_goal_photos_date ON goal_photos(date DESC);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_photos ENABLE ROW LEVEL SECURITY;

-- Action plans policies
CREATE POLICY "Users can view their own action plans"
  ON action_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own action plans"
  ON action_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own action plans"
  ON action_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own action plans"
  ON action_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Action items policies
CREATE POLICY "Users can view action items from their plans"
  ON action_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM action_plans
      WHERE action_plans.id = action_items.plan_id
      AND action_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create action items in their plans"
  ON action_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM action_plans
      WHERE action_plans.id = action_items.plan_id
      AND action_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update action items in their plans"
  ON action_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM action_plans
      WHERE action_plans.id = action_items.plan_id
      AND action_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete action items in their plans"
  ON action_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM action_plans
      WHERE action_plans.id = action_items.plan_id
      AND action_plans.user_id = auth.uid()
    )
  );

-- Smart goals policies
CREATE POLICY "Users can view their own goals"
  ON smart_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON smart_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON smart_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON smart_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Goal milestones policies
CREATE POLICY "Users can view milestones from their goals"
  ON goal_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_milestones.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create milestones in their goals"
  ON goal_milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_milestones.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update milestones in their goals"
  ON goal_milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_milestones.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete milestones in their goals"
  ON goal_milestones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_milestones.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

-- Goal check-ins policies
CREATE POLICY "Users can view check-ins from their goals"
  ON goal_check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_check_ins.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create check-ins in their goals"
  ON goal_check_ins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_check_ins.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update check-ins in their goals"
  ON goal_check_ins FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_check_ins.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete check-ins in their goals"
  ON goal_check_ins FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_check_ins.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

-- Goal photos policies
CREATE POLICY "Users can view photos from their goals"
  ON goal_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_photos.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create photos in their goals"
  ON goal_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_photos.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos in their goals"
  ON goal_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_photos.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos in their goals"
  ON goal_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM smart_goals
      WHERE smart_goals.id = goal_photos.goal_id
      AND smart_goals.user_id = auth.uid()
    )
  );

-- =============================================
-- Triggers for Updated At
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to action_plans
CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON action_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to action_items
CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to smart_goals
CREATE TRIGGER update_smart_goals_updated_at
  BEFORE UPDATE ON smart_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Helper Functions
-- =============================================

-- Function to calculate action plan progress
CREATE OR REPLACE FUNCTION calculate_action_plan_progress(plan_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_actions INTEGER;
  completed_actions INTEGER;
  progress DECIMAL;
BEGIN
  -- Count total actions
  SELECT COUNT(*) INTO total_actions
  FROM action_items
  WHERE plan_id = plan_id_param;
  
  -- Count completed actions
  SELECT COUNT(*) INTO completed_actions
  FROM action_items
  WHERE plan_id = plan_id_param
  AND status = 'completed';
  
  -- Calculate progress
  IF total_actions = 0 THEN
    progress := 0;
  ELSE
    progress := (completed_actions::DECIMAL / total_actions::DECIMAL) * 100;
  END IF;
  
  RETURN ROUND(progress, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate goal progress
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  baseline_val DECIMAL;
  target_val DECIMAL;
  current_val DECIMAL;
  total_change DECIMAL;
  current_change DECIMAL;
  progress DECIMAL;
BEGIN
  -- Get goal values
  SELECT baseline, target, current_value
  INTO baseline_val, target_val, current_val
  FROM smart_goals
  WHERE id = goal_id_param;
  
  -- If no current value, return 0
  IF current_val IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate progress
  total_change := ABS(target_val - baseline_val);
  current_change := ABS(current_val - baseline_val);
  
  IF total_change = 0 THEN
    progress := 0;
  ELSE
    progress := LEAST(100, (current_change / total_change) * 100);
  END IF;
  
  RETURN ROUND(progress, 2);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Comments for Documentation
-- =============================================

COMMENT ON TABLE action_plans IS 'Personalized skincare action plans generated from AI analysis';
COMMENT ON TABLE action_items IS 'Individual actionable steps within an action plan';
COMMENT ON TABLE smart_goals IS 'SMART goals for tracking skincare improvements';
COMMENT ON TABLE goal_milestones IS 'Milestones and checkpoints for SMART goals';
COMMENT ON TABLE goal_check_ins IS 'Regular progress check-ins for goals';
COMMENT ON TABLE goal_photos IS 'Before/after and progress photos for goals';

COMMENT ON FUNCTION calculate_action_plan_progress IS 'Calculates the percentage of completed actions in a plan';
COMMENT ON FUNCTION calculate_goal_progress IS 'Calculates the percentage progress towards a goal based on current vs target values';
