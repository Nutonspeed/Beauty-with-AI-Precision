-- =============================================
-- Customer Analytics Schema
-- Phase 2 Week 4 Task 4.1
-- =============================================

-- Create customer_analysis_metrics table for aggregated analytics
CREATE TABLE IF NOT EXISTS customer_analysis_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Aggregated scores (rolling average from recent analyses)
  avg_overall_score NUMERIC(4,1),
  avg_spots_score NUMERIC(4,1),
  avg_wrinkles_score NUMERIC(4,1),
  avg_texture_score NUMERIC(4,1),
  avg_pores_score NUMERIC(4,1),
  avg_hydration_score NUMERIC(4,1),
  
  -- Trend indicators (positive = improving, negative = worsening)
  trend_spots NUMERIC(4,1) DEFAULT 0,
  trend_wrinkles NUMERIC(4,1) DEFAULT 0,
  trend_texture NUMERIC(4,1) DEFAULT 0,
  trend_pores NUMERIC(4,1) DEFAULT 0,
  trend_hydration NUMERIC(4,1) DEFAULT 0,
  trend_overall NUMERIC(4,1) DEFAULT 0,
  
  -- Analysis frequency metrics
  total_analyses INTEGER DEFAULT 0,
  first_analysis_at TIMESTAMP WITH TIME ZONE,
  last_analysis_at TIMESTAMP WITH TIME ZONE,
  analyses_last_30_days INTEGER DEFAULT 0,
  analyses_last_90_days INTEGER DEFAULT 0,
  
  -- Treatment effectiveness metrics
  treatment_adherence_score NUMERIC(3,2) DEFAULT 0, -- 0-1 scale
  improvement_rate NUMERIC(4,2) DEFAULT 0, -- % improvement per month
  months_tracking INTEGER DEFAULT 0,
  
  -- Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per customer
  CONSTRAINT uk_customer_metrics UNIQUE(customer_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_metrics_customer 
  ON customer_analysis_metrics(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_metrics_score 
  ON customer_analysis_metrics(avg_overall_score DESC);

CREATE INDEX IF NOT EXISTS idx_customer_metrics_last_analysis 
  ON customer_analysis_metrics(last_analysis_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_metrics_improvement 
  ON customer_analysis_metrics(improvement_rate DESC);

-- Add comment to table
COMMENT ON TABLE customer_analysis_metrics IS 
'Aggregated analytics metrics for customer skin analysis history. Updated via trigger or scheduled job.';

-- Add comments to key columns
COMMENT ON COLUMN customer_analysis_metrics.trend_spots IS 
'Trend indicator for spots: positive = improving (fewer spots), negative = worsening';

COMMENT ON COLUMN customer_analysis_metrics.trend_wrinkles IS 
'Trend indicator for wrinkles: positive = improving (fewer wrinkles), negative = worsening';

COMMENT ON COLUMN customer_analysis_metrics.treatment_adherence_score IS 
'Score from 0-1 indicating how well customer follows treatment plan';

COMMENT ON COLUMN customer_analysis_metrics.improvement_rate IS 
'Average improvement percentage per month across all metrics';

-- =============================================
-- Create analysis_history table for tracking changes over time
-- =============================================

CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL REFERENCES skin_analyses(id) ON DELETE CASCADE,
  
  -- Snapshot of scores at time of analysis
  overall_score NUMERIC(4,1),
  spots_score NUMERIC(4,1),
  wrinkles_score NUMERIC(4,1),
  texture_score NUMERIC(4,1),
  pores_score NUMERIC(4,1),
  hydration_score NUMERIC(4,1),
  
  -- Analysis metadata
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_baseline BOOLEAN DEFAULT FALSE,
  
  -- Treatment tracking
  treatment_plan_id UUID REFERENCES treatment_plans(id),
  days_since_last_analysis INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one history entry per analysis
  CONSTRAINT uk_analysis_history UNIQUE(analysis_id)
);

-- Create indexes for analysis_history
CREATE INDEX IF NOT EXISTS idx_analysis_history_customer 
  ON analysis_history(customer_id, analysis_date DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_history_analysis 
  ON analysis_history(analysis_id);

CREATE INDEX IF NOT EXISTS idx_analysis_history_date 
  ON analysis_history(analysis_date DESC);

-- Add comment
COMMENT ON TABLE analysis_history IS 
'Historical record of all skin analyses for trend tracking and comparison';

-- =============================================
-- Function to calculate metrics
-- =============================================

CREATE OR REPLACE FUNCTION calculate_customer_metrics(p_customer_id UUID)
RETURNS void AS $$
DECLARE
  v_total_analyses INTEGER;
  v_first_analysis TIMESTAMP WITH TIME ZONE;
  v_last_analysis TIMESTAMP WITH TIME ZONE;
  v_avg_overall NUMERIC(4,1);
  v_avg_spots NUMERIC(4,1);
  v_avg_wrinkles NUMERIC(4,1);
  v_avg_texture NUMERIC(4,1);
  v_avg_pores NUMERIC(4,1);
  v_avg_hydration NUMERIC(4,1);
  v_trend_overall NUMERIC(4,1);
  v_trend_spots NUMERIC(4,1);
  v_trend_wrinkles NUMERIC(4,1);
  v_trend_texture NUMERIC(4,1);
  v_trend_pores NUMERIC(4,1);
  v_trend_hydration NUMERIC(4,1);
  v_analyses_30d INTEGER;
  v_analyses_90d INTEGER;
  v_months_tracking INTEGER;
  v_improvement_rate NUMERIC(4,2);
BEGIN
  -- Get basic counts and dates
  SELECT 
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  INTO 
    v_total_analyses,
    v_first_analysis,
    v_last_analysis
  FROM skin_analyses
  WHERE user_id = p_customer_id;
  
  -- Calculate if we have analyses
  IF v_total_analyses > 0 THEN
    -- Calculate average scores from recent 10 analyses
    SELECT 
      ROUND(AVG(overall_score)::numeric, 1),
      ROUND(AVG((ai_analysis->>'acne_score')::numeric)::numeric, 1),
      ROUND(AVG((ai_analysis->>'wrinkles_score')::numeric)::numeric, 1),
      ROUND(AVG((ai_analysis->>'texture_score')::numeric)::numeric, 1),
      ROUND(AVG((ai_analysis->>'pores_score')::numeric)::numeric, 1),
      ROUND(AVG((ai_analysis->>'hydration_score')::numeric)::numeric, 1)
    INTO
      v_avg_overall,
      v_avg_spots,
      v_avg_wrinkles,
      v_avg_texture,
      v_avg_pores,
      v_avg_hydration
    FROM (
      SELECT * FROM skin_analyses 
      WHERE user_id = p_customer_id 
      ORDER BY created_at DESC 
      LIMIT 10
    ) recent;
    
    -- Calculate trends (compare first 3 vs last 3 analyses)
    IF v_total_analyses >= 6 THEN
      WITH first_three AS (
        SELECT AVG(overall_score) as avg_score
        FROM (
          SELECT overall_score 
          FROM skin_analyses 
          WHERE user_id = p_customer_id 
          ORDER BY created_at ASC 
          LIMIT 3
        ) f
      ),
      last_three AS (
        SELECT AVG(overall_score) as avg_score
        FROM (
          SELECT overall_score 
          FROM skin_analyses 
          WHERE user_id = p_customer_id 
          ORDER BY created_at DESC 
          LIMIT 3
        ) l
      )
      SELECT 
        ROUND((l.avg_score - f.avg_score)::numeric, 1)
      INTO v_trend_overall
      FROM first_three f, last_three l;
    ELSE
      v_trend_overall := 0;
    END IF;
    
    -- Count recent analyses
    SELECT 
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END),
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '90 days' THEN 1 END)
    INTO
      v_analyses_30d,
      v_analyses_90d
    FROM skin_analyses
    WHERE user_id = p_customer_id;
    
    -- Calculate months tracking
    v_months_tracking := EXTRACT(EPOCH FROM (v_last_analysis - v_first_analysis)) / (30 * 24 * 60 * 60);
    
    -- Calculate improvement rate
    IF v_months_tracking > 0 AND v_trend_overall IS NOT NULL THEN
      v_improvement_rate := (v_trend_overall / v_months_tracking);
    ELSE
      v_improvement_rate := 0;
    END IF;
    
    -- Insert or update metrics
    INSERT INTO customer_analysis_metrics (
      customer_id,
      avg_overall_score,
      avg_spots_score,
      avg_wrinkles_score,
      avg_texture_score,
      avg_pores_score,
      avg_hydration_score,
      trend_overall,
      trend_spots,
      trend_wrinkles,
      trend_texture,
      trend_pores,
      trend_hydration,
      total_analyses,
      first_analysis_at,
      last_analysis_at,
      analyses_last_30_days,
      analyses_last_90_days,
      months_tracking,
      improvement_rate,
      calculated_at,
      updated_at
    ) VALUES (
      p_customer_id,
      v_avg_overall,
      v_avg_spots,
      v_avg_wrinkles,
      v_avg_texture,
      v_avg_pores,
      v_avg_hydration,
      v_trend_overall,
      0, -- trend_spots (TODO: calculate separately)
      0, -- trend_wrinkles (TODO: calculate separately)
      0, -- trend_texture (TODO: calculate separately)
      0, -- trend_pores (TODO: calculate separately)
      0, -- trend_hydration (TODO: calculate separately)
      v_total_analyses,
      v_first_analysis,
      v_last_analysis,
      v_analyses_30d,
      v_analyses_90d,
      v_months_tracking,
      v_improvement_rate,
      NOW(),
      NOW()
    )
    ON CONFLICT (customer_id) 
    DO UPDATE SET
      avg_overall_score = EXCLUDED.avg_overall_score,
      avg_spots_score = EXCLUDED.avg_spots_score,
      avg_wrinkles_score = EXCLUDED.avg_wrinkles_score,
      avg_texture_score = EXCLUDED.avg_texture_score,
      avg_pores_score = EXCLUDED.avg_pores_score,
      avg_hydration_score = EXCLUDED.avg_hydration_score,
      trend_overall = EXCLUDED.trend_overall,
      total_analyses = EXCLUDED.total_analyses,
      first_analysis_at = EXCLUDED.first_analysis_at,
      last_analysis_at = EXCLUDED.last_analysis_at,
      analyses_last_30_days = EXCLUDED.analyses_last_30_days,
      analyses_last_90_days = EXCLUDED.analyses_last_90_days,
      months_tracking = EXCLUDED.months_tracking,
      improvement_rate = EXCLUDED.improvement_rate,
      calculated_at = NOW(),
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comment to function
COMMENT ON FUNCTION calculate_customer_metrics IS 
'Calculates and updates aggregated analytics metrics for a customer based on their analysis history';

-- =============================================
-- Trigger to auto-update metrics after new analysis
-- =============================================

CREATE OR REPLACE FUNCTION trigger_update_customer_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate metrics for the user
  PERFORM calculate_customer_metrics(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metrics_after_analysis
AFTER INSERT ON skin_analyses
FOR EACH ROW
EXECUTE FUNCTION trigger_update_customer_metrics();

-- Add comment to trigger
COMMENT ON TRIGGER update_metrics_after_analysis ON skin_analyses IS 
'Automatically recalculates customer metrics after each new analysis';

-- =============================================
-- Grant permissions
-- =============================================

-- Allow authenticated users to read their own metrics
ALTER TABLE customer_analysis_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own metrics"
  ON customer_analysis_metrics
  FOR SELECT
  USING (auth.uid() = customer_id);

-- Allow authenticated users to read their own history
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history"
  ON analysis_history
  FOR SELECT
  USING (auth.uid() = customer_id);

-- =============================================
-- Sample data migration (optional)
-- =============================================

-- Uncomment to calculate metrics for all existing customers
-- DO $$
-- DECLARE
--   customer_record RECORD;
-- BEGIN
--   FOR customer_record IN 
--     SELECT DISTINCT user_id 
--     FROM skin_analyses 
--     WHERE user_id IS NOT NULL
--   LOOP
--     PERFORM calculate_customer_metrics(customer_record.user_id);
--   END LOOP;
-- END $$;
