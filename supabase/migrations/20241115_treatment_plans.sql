-- Treatment Plans Table
-- Phase 2 Week 6-7 Task 6.2

-- Create treatment_plans table
CREATE TABLE IF NOT EXISTS public.treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL REFERENCES public.skin_analyses(id) ON DELETE CASCADE,
  
  -- Plan overview
  title TEXT NOT NULL,
  title_th TEXT NOT NULL,
  summary TEXT NOT NULL,
  summary_th TEXT NOT NULL,
  
  -- Timeline
  duration TEXT NOT NULL,
  duration_th TEXT NOT NULL,
  review_milestones TEXT[] NOT NULL DEFAULT '{}',
  
  -- Steps (stored as JSONB)
  morning_routine JSONB NOT NULL DEFAULT '[]',
  evening_routine JSONB NOT NULL DEFAULT '[]',
  weekly_treatments JSONB NOT NULL DEFAULT '[]',
  
  -- Expectations
  expected_results TEXT[] NOT NULL DEFAULT '{}',
  expected_results_th TEXT[] NOT NULL DEFAULT '{}',
  warnings TEXT[] NOT NULL DEFAULT '{}',
  warnings_th TEXT[] NOT NULL DEFAULT '{}',
  
  -- Costs
  estimated_cost JSONB NOT NULL DEFAULT '{"min": 0, "max": 0, "currency": "THB"}',
  
  -- Metadata
  generated_by TEXT NOT NULL CHECK (generated_by IN ('ai', 'staff', 'doctor')),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_treatment_plans_user_id 
  ON public.treatment_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_analysis_id 
  ON public.treatment_plans(analysis_id);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_created_at 
  ON public.treatment_plans(created_at DESC);

-- Add unique constraint (one plan per analysis)
CREATE UNIQUE INDEX IF NOT EXISTS idx_treatment_plans_analysis_unique 
  ON public.treatment_plans(analysis_id);

-- Enable RLS
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own treatment plans"
  ON public.treatment_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own treatment plans"
  ON public.treatment_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own treatment plans"
  ON public.treatment_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own treatment plans"
  ON public.treatment_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update trigger
CREATE OR REPLACE FUNCTION update_treatment_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER treatment_plans_updated_at
  BEFORE UPDATE ON public.treatment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_treatment_plans_updated_at();

-- Comments
COMMENT ON TABLE public.treatment_plans IS 'AI-generated personalized treatment plans based on skin analysis';
COMMENT ON COLUMN public.treatment_plans.generated_by IS 'Source of plan generation: ai, staff, or doctor';
COMMENT ON COLUMN public.treatment_plans.morning_routine IS 'Array of treatment steps for morning routine';
COMMENT ON COLUMN public.treatment_plans.evening_routine IS 'Array of treatment steps for evening routine';
COMMENT ON COLUMN public.treatment_plans.weekly_treatments IS 'Array of treatment steps for weekly treatments';
