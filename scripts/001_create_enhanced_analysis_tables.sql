-- Enhanced Analysis Tables for Phase 2A-2D Implementation
-- Stores multi-spectral imaging simulation and depth estimation results

-- Enhanced skin analyses table with Phase 2 features
CREATE TABLE IF NOT EXISTS enhanced_skin_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES skin_analyses(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Phase 2A: Lighting Simulation Results
  lighting_simulation JSONB DEFAULT '{}'::jsonb, -- UV, polarized, RBX simulated images
  spectral_analysis JSONB DEFAULT '{}'::jsonb,   -- Multi-spectral decomposition
  
  -- Phase 2B: Depth Estimation Results
  depth_map JSONB DEFAULT '{}'::jsonb,           -- Monocular depth estimation
  metrics_3d JSONB DEFAULT '{}'::jsonb,          -- Wrinkle depth, firmness, volume
  
  -- Phase 2C: Dermatology Model Results
  dermatology_analysis JSONB DEFAULT '{}'::jsonb, -- Specialist model predictions
  skin_type_classification JSONB DEFAULT '{}'::jsonb, -- Fitzpatrick I-VI
  
  -- Phase 2D: Hardware Sensor Data (optional)
  sensor_data JSONB DEFAULT '{}'::jsonb,         -- Hydration sensor, etc.
  
  -- Accuracy tracking
  accuracy_metrics JSONB DEFAULT '{}'::jsonb,    -- Per-metric accuracy estimates
  phase_completed TEXT DEFAULT 'phase_1',        -- phase_1, phase_2a, phase_2b, phase_2c, phase_2d
  visia_equivalent_score NUMERIC(5,2),           -- 0-100 VISIA parity score
  
  -- Metadata
  processing_time_ms INTEGER,
  model_versions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enhanced_analyses_analysis_id ON enhanced_skin_analyses(analysis_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_analyses_clinic_id ON enhanced_skin_analyses(clinic_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_analyses_customer_id ON enhanced_skin_analyses(customer_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_analyses_phase ON enhanced_skin_analyses(phase_completed);
CREATE INDEX IF NOT EXISTS idx_enhanced_analyses_created_at ON enhanced_skin_analyses(created_at DESC);

-- Model training data collection (for Phase 2C)
CREATE TABLE IF NOT EXISTS training_data_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES skin_analyses(id) ON DELETE CASCADE,
  
  -- Original analysis data
  image_url TEXT,
  standard_metrics JSONB,
  
  -- Expert annotations (dermatologist review)
  expert_annotations JSONB,
  expert_id UUID REFERENCES users(id),
  annotation_date TIMESTAMP WITH TIME ZONE,
  
  -- VISIA comparison data (if available from clinic partnership)
  visia_metrics JSONB,
  visia_images JSONB,
  
  -- Quality flags
  is_validated BOOLEAN DEFAULT FALSE,
  quality_score NUMERIC(3,2), -- 0-1
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_data_validated ON training_data_collection(is_validated);
CREATE INDEX IF NOT EXISTS idx_training_data_quality ON training_data_collection(quality_score DESC);

-- Analysis accuracy tracking
CREATE TABLE IF NOT EXISTS analysis_accuracy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES skin_analyses(id) ON DELETE CASCADE,
  
  -- Accuracy by metric
  wrinkles_accuracy NUMERIC(5,2),
  spots_accuracy NUMERIC(5,2),
  pores_accuracy NUMERIC(5,2),
  texture_accuracy NUMERIC(5,2),
  evenness_accuracy NUMERIC(5,2),
  firmness_accuracy NUMERIC(5,2),
  radiance_accuracy NUMERIC(5,2),
  hydration_accuracy NUMERIC(5,2),
  
  -- Overall accuracy
  overall_accuracy NUMERIC(5,2),
  
  -- Comparison source
  comparison_source TEXT, -- 'visia', 'expert', 'user_feedback'
  comparison_data JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accuracy_logs_analysis_id ON analysis_accuracy_logs(analysis_id);
CREATE INDEX IF NOT EXISTS idx_accuracy_logs_overall ON analysis_accuracy_logs(overall_accuracy DESC);

COMMENT ON TABLE enhanced_skin_analyses IS 'Phase 2 enhanced analysis results with lighting simulation, depth estimation, and dermatology models';
COMMENT ON TABLE training_data_collection IS 'Collect training data for Phase 2C dermatology model fine-tuning';
COMMENT ON TABLE analysis_accuracy_logs IS 'Track accuracy improvements across phases';
