-- Outcome Predictions Table
-- Phase 3 Week 8-9 Task 8.1

-- Create outcome_predictions table
CREATE TABLE IF NOT EXISTS public.outcome_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL REFERENCES public.skin_analyses(id) ON DELETE CASCADE,
  treatment_plan_id UUID REFERENCES public.treatment_plans(id) ON DELETE SET NULL,
  
  -- Predicted scores
  predicted_overall_score NUMERIC(4,1) NOT NULL,
  predicted_concerns JSONB NOT NULL DEFAULT '{}',
  
  -- Improvement metrics
  expected_improvement NUMERIC(5,2) NOT NULL,
  expected_improvement_percent NUMERIC(5,2) NOT NULL,
  
  -- Confidence
  confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('low', 'medium', 'high')),
  
  -- Factors
  key_factors JSONB NOT NULL DEFAULT '[]',
  
  -- Recommendations
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  recommendations_th TEXT[] NOT NULL DEFAULT '{}',
  
  -- Prediction details
  prediction_horizon TEXT NOT NULL DEFAULT '3 months',
  prediction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Actual outcome (to be filled later)
  actual_overall_score NUMERIC(4,1),
  actual_concerns JSONB,
  outcome_verified_at TIMESTAMP WITH TIME ZONE,
  prediction_accuracy NUMERIC(3,2), -- 0-1, calculated after verification
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_outcome_predictions_customer_id 
  ON public.outcome_predictions(customer_id);

CREATE INDEX IF NOT EXISTS idx_outcome_predictions_analysis_id 
  ON public.outcome_predictions(analysis_id);

CREATE INDEX IF NOT EXISTS idx_outcome_predictions_created_at 
  ON public.outcome_predictions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_outcome_predictions_prediction_date 
  ON public.outcome_predictions(prediction_date);

CREATE INDEX IF NOT EXISTS idx_outcome_predictions_unverified 
  ON public.outcome_predictions(customer_id, prediction_date)
  WHERE outcome_verified_at IS NULL;

-- Enable RLS
ALTER TABLE public.outcome_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own predictions"
  ON public.outcome_predictions
  FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert their own predictions"
  ON public.outcome_predictions
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own predictions"
  ON public.outcome_predictions
  FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own predictions"
  ON public.outcome_predictions
  FOR DELETE
  USING (auth.uid() = customer_id);

-- Update trigger
CREATE OR REPLACE FUNCTION update_outcome_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER outcome_predictions_updated_at
  BEFORE UPDATE ON public.outcome_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_outcome_predictions_updated_at();

-- Function to verify predictions (called when new analysis is created after prediction date)
CREATE OR REPLACE FUNCTION verify_prediction_accuracy()
RETURNS TRIGGER AS $$
DECLARE
  prediction_record RECORD;
  accuracy NUMERIC(3,2);
BEGIN
  -- Find predictions that should be verified
  FOR prediction_record IN
    SELECT id, predicted_overall_score, customer_id
    FROM public.outcome_predictions
    WHERE customer_id = NEW.user_id
      AND prediction_date <= NEW.created_at
      AND outcome_verified_at IS NULL
  LOOP
    -- Calculate accuracy (1 - normalized error)
    accuracy := 1.0 - LEAST(1.0, ABS(NEW.overall_score - prediction_record.predicted_overall_score) / 100.0);
    
    -- Update prediction with actual outcome
    UPDATE public.outcome_predictions
    SET 
      actual_overall_score = NEW.overall_score,
      actual_concerns = NEW.ai_analysis->'scores',
      outcome_verified_at = NEW.created_at,
      prediction_accuracy = accuracy
    WHERE id = prediction_record.id;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-verify predictions
CREATE TRIGGER auto_verify_predictions
  AFTER INSERT ON public.skin_analyses
  FOR EACH ROW
  EXECUTE FUNCTION verify_prediction_accuracy();

-- Comments
COMMENT ON TABLE public.outcome_predictions IS 'ML-based predictions of treatment outcomes';
COMMENT ON COLUMN public.outcome_predictions.predicted_concerns IS 'Predicted scores for individual concerns';
COMMENT ON COLUMN public.outcome_predictions.key_factors IS 'Factors influencing the prediction with weights';
COMMENT ON COLUMN public.outcome_predictions.confidence IS 'Model confidence score (0-1)';
COMMENT ON COLUMN public.outcome_predictions.prediction_accuracy IS 'Accuracy calculated after outcome verification';
COMMENT ON COLUMN public.outcome_predictions.outcome_verified_at IS 'When actual outcome was verified against prediction';
