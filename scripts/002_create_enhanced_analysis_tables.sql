-- Phase 2: Enhanced Analysis Tables for VISIA-equivalent system
-- This creates tables to store advanced skin analysis with lighting simulation and depth estimation

-- Enhanced skin analyses table (Phase 2A-2D results)
CREATE TABLE IF NOT EXISTS enhanced_skin_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES skin_analyses(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Phase 2A: Lighting Simulation Results
  uv_simulation JSONB, -- Subsurface pigmentation detection
  polarized_simulation JSONB, -- Surface reflection removal
  rbx_decomposition JSONB, -- Red/Brown pigmentation separation
  
  -- Phase 2B: Depth Estimation Results
  depth_map JSONB, -- 3D depth information
  wrinkle_depth_metrics JSONB, -- Detailed wrinkle measurements
  firmness_score NUMERIC(5,2), -- Skin firmness (0-100)
  volume_metrics JSONB, -- 3D volume calculations
  
  -- Phase 2C: Dermatology Model Results (future)
  dermatology_model_version TEXT,
  specialized_metrics JSONB,
  
  -- Phase 2D: Sensor Integration (future)
  sensor_data JSONB,
  calibration_data JSONB,
  
  -- Accuracy tracking
  confidence_scores JSONB, -- Per-feature confidence
  accuracy_tier TEXT CHECK (accuracy_tier IN ('free', 'premium', 'clinical')),
  estimated_accuracy NUMERIC(5,2), -- Estimated accuracy percentage
  
  -- Processing metadata
  processing_time_ms INTEGER,
  ai_model_versions JSONB, -- Track which models were used
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training data collection for future ML improvements
CREATE TABLE IF NOT EXISTS training_data_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enhanced_analysis_id UUID REFERENCES enhanced_skin_analyses(id) ON DELETE CASCADE,
  
  -- Ground truth data (from dermatologist review)
  expert_review JSONB,
  expert_reviewer_id UUID REFERENCES users(id),
  review_date TIMESTAMPTZ,
  
  -- Comparison metrics
  ai_vs_expert_diff JSONB,
  accuracy_score NUMERIC(5,2),
  
  -- Feedback for model improvement
  correction_notes TEXT,
  flagged_for_retraining BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis accuracy logs for tracking improvements
CREATE TABLE IF NOT EXISTS analysis_accuracy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Accuracy metrics by phase
  phase TEXT CHECK (phase IN ('baseline', '2a', '2b', '2c', '2d')),
  average_accuracy NUMERIC(5,2),
  sample_size INTEGER,
  
  -- Performance metrics
  avg_processing_time_ms INTEGER,
  success_rate NUMERIC(5,2),
  
  -- Date range
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE enhanced_skin_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_data_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_accuracy_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enhanced_skin_analyses
CREATE POLICY "Users can view their own enhanced analyses"
  ON enhanced_skin_analyses FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE id = auth.uid()
    )
    OR
    clinic_id IN (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Clinics can insert enhanced analyses"
  ON enhanced_skin_analyses FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Clinics can update their enhanced analyses"
  ON enhanced_skin_analyses FOR UPDATE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for training_data_collection
CREATE POLICY "Only experts can view training data"
  ON training_data_collection FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('clinic_owner', 'sales_staff')
    )
  );

CREATE POLICY "Only experts can insert training data"
  ON training_data_collection FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('clinic_owner', 'sales_staff')
    )
  );

-- RLS Policies for analysis_accuracy_logs
CREATE POLICY "Clinics can view their accuracy logs"
  ON analysis_accuracy_logs FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert accuracy logs"
  ON analysis_accuracy_logs FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_enhanced_analyses_analysis_id ON enhanced_skin_analyses(analysis_id);
CREATE INDEX idx_enhanced_analyses_customer_id ON enhanced_skin_analyses(customer_id);
CREATE INDEX idx_enhanced_analyses_clinic_id ON enhanced_skin_analyses(clinic_id);
CREATE INDEX idx_enhanced_analyses_created_at ON enhanced_skin_analyses(created_at DESC);
CREATE INDEX idx_training_data_enhanced_analysis_id ON training_data_collection(enhanced_analysis_id);
CREATE INDEX idx_accuracy_logs_clinic_phase ON analysis_accuracy_logs(clinic_id, phase);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enhanced_skin_analyses_updated_at
  BEFORE UPDATE ON enhanced_skin_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
