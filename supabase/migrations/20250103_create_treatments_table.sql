-- Treatment Recommendation Engine Database Schema
-- Phase 3: Create treatments table with pricing and effectiveness data

-- Create treatments table
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_th VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'injectable', 'laser', 'skincare', 'surgery', 'device'
  subcategory VARCHAR(50), -- 'botox', 'filler', 'co2_laser', 'ipl', etc.
  
  -- Pricing
  price_min NUMERIC(10, 2) NOT NULL,
  price_max NUMERIC(10, 2) NOT NULL,
  price_unit VARCHAR(20) DEFAULT 'THB', -- 'THB', 'unit', 'area', 'session'
  price_per VARCHAR(20), -- 'unit', 'area', 'session', 'syringe'
  
  -- Treatment details
  duration_minutes INTEGER, -- Treatment duration
  sessions_min INTEGER DEFAULT 1,
  sessions_max INTEGER DEFAULT 1,
  interval_days INTEGER, -- Days between sessions
  
  -- Recovery
  downtime_days INTEGER DEFAULT 0,
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  
  -- Effectiveness
  effectiveness_spots INTEGER CHECK (effectiveness_spots BETWEEN 0 AND 100),
  effectiveness_pores INTEGER CHECK (effectiveness_pores BETWEEN 0 AND 100),
  effectiveness_wrinkles INTEGER CHECK (effectiveness_wrinkles BETWEEN 0 AND 100),
  effectiveness_texture INTEGER CHECK (effectiveness_texture BETWEEN 0 AND 100),
  effectiveness_redness INTEGER CHECK (effectiveness_redness BETWEEN 0 AND 100),
  effectiveness_overall INTEGER CHECK (effectiveness_overall BETWEEN 0 AND 100),
  
  -- Eligibility
  min_age INTEGER DEFAULT 18,
  max_age INTEGER,
  contraindications TEXT[], -- ['pregnancy', 'active_acne', 'keloid_prone']
  suitable_skin_types TEXT[], -- ['all', 'oily', 'dry', 'sensitive', 'combination']
  
  -- Results
  results_visible_days INTEGER, -- When results become visible
  results_duration_months INTEGER, -- How long results last
  improvement_percentage_min INTEGER,
  improvement_percentage_max INTEGER,
  
  -- Media
  before_after_images TEXT[], -- URLs to before/after photos
  video_url TEXT,
  
  -- Content
  description TEXT,
  description_th TEXT,
  benefits TEXT[],
  risks TEXT[],
  aftercare TEXT[],
  
  -- Metadata
  popularity_score INTEGER DEFAULT 0, -- For sorting recommendations
  is_active BOOLEAN DEFAULT true,
  requires_doctor BOOLEAN DEFAULT true,
  requires_consultation BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create treatment recommendations table
CREATE TABLE IF NOT EXISTS treatment_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES skin_analyses(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  
  -- Recommendation details
  priority INTEGER DEFAULT 1, -- 1 = highest priority
  confidence_score NUMERIC(3, 2) CHECK (confidence_score BETWEEN 0 AND 1),
  
  -- Personalized pricing
  estimated_cost_min NUMERIC(10, 2),
  estimated_cost_max NUMERIC(10, 2),
  estimated_sessions INTEGER,
  
  -- Predicted results
  predicted_improvement INTEGER CHECK (predicted_improvement BETWEEN 0 AND 100),
  timeline_weeks INTEGER,
  
  -- Reasoning
  recommendation_reason TEXT,
  target_concerns TEXT[], -- ['spots', 'pores', 'wrinkles']
  
  -- Status
  status VARCHAR(20) DEFAULT 'suggested', -- 'suggested', 'viewed', 'interested', 'booked', 'completed'
  viewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create treatment packages table (bundle multiple treatments)
CREATE TABLE IF NOT EXISTS treatment_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_th VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Package details
  treatment_ids UUID[] NOT NULL, -- Array of treatment IDs
  package_price NUMERIC(10, 2) NOT NULL,
  discount_percentage INTEGER,
  
  -- Timeline
  total_duration_weeks INTEGER,
  total_sessions INTEGER,
  
  -- Effectiveness (combined)
  effectiveness_overall INTEGER CHECK (effectiveness_overall BETWEEN 0 AND 100),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_treatments_category ON treatments(category);
CREATE INDEX idx_treatments_popularity ON treatments(popularity_score DESC);
CREATE INDEX idx_treatments_active ON treatments(is_active) WHERE is_active = true;
CREATE INDEX idx_recommendations_analysis ON treatment_recommendations(analysis_id);
CREATE INDEX idx_recommendations_priority ON treatment_recommendations(priority);

-- Add comments
COMMENT ON TABLE treatments IS 'Catalog of available aesthetic treatments with pricing and effectiveness data';
COMMENT ON TABLE treatment_recommendations IS 'AI-generated treatment recommendations based on skin analysis';
COMMENT ON TABLE treatment_packages IS 'Pre-configured treatment bundles with discounted pricing';

COMMENT ON COLUMN treatments.category IS 'Main category: injectable, laser, skincare, surgery, device';
COMMENT ON COLUMN treatments.effectiveness_overall IS 'Overall effectiveness score 0-100%';
COMMENT ON COLUMN treatment_recommendations.confidence_score IS 'AI confidence in this recommendation (0-1)';
COMMENT ON COLUMN treatment_recommendations.predicted_improvement IS 'Expected improvement percentage';
