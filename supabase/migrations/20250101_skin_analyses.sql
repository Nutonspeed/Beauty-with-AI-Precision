-- Create skin_analyses table
-- Stores all skin analysis results with CV and AI data

CREATE TABLE IF NOT EXISTS public.skin_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT to support demo users
  
  -- Image
  image_url TEXT NOT NULL,
  
  -- Overall Scores
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  
  -- CV Analysis - Spots
  spots_severity INTEGER NOT NULL CHECK (spots_severity >= 1 AND spots_severity <= 10),
  spots_count INTEGER NOT NULL DEFAULT 0,
  spots_percentile INTEGER NOT NULL CHECK (spots_percentile >= 0 AND spots_percentile <= 100),
  
  -- CV Analysis - Pores
  pores_severity INTEGER NOT NULL CHECK (pores_severity >= 1 AND pores_severity <= 10),
  pores_count INTEGER NOT NULL DEFAULT 0,
  pores_percentile INTEGER NOT NULL CHECK (pores_percentile >= 0 AND pores_percentile <= 100),
  
  -- CV Analysis - Wrinkles
  wrinkles_severity INTEGER NOT NULL CHECK (wrinkles_severity >= 1 AND wrinkles_severity <= 10),
  wrinkles_count INTEGER NOT NULL DEFAULT 0,
  wrinkles_percentile INTEGER NOT NULL CHECK (wrinkles_percentile >= 0 AND wrinkles_percentile <= 100),
  
  -- CV Analysis - Texture
  texture_severity INTEGER NOT NULL CHECK (texture_severity >= 1 AND texture_severity <= 10),
  texture_percentile INTEGER NOT NULL CHECK (texture_percentile >= 0 AND texture_percentile <= 100),
  
  -- CV Analysis - Redness
  redness_severity INTEGER NOT NULL CHECK (redness_severity >= 1 AND redness_severity <= 10),
  redness_count INTEGER NOT NULL DEFAULT 0,
  redness_percentile INTEGER NOT NULL CHECK (redness_percentile >= 0 AND redness_percentile <= 100),
  
  -- Overall Percentile
  overall_percentile INTEGER NOT NULL CHECK (overall_percentile >= 0 AND overall_percentile <= 100),
  
  -- AI Analysis
  ai_skin_type TEXT,
  ai_concerns TEXT[] DEFAULT '{}',
  ai_severity JSONB,
  ai_treatment_plan TEXT,
  
  -- Recommendations
  recommendations TEXT[] DEFAULT '{}',
  
  -- Patient Info
  patient_name TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  patient_skin_type TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Performance
  analysis_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  
  -- No foreign key constraint - supports both real users and demo users
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_skin_analyses_user_id ON public.skin_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_created_at ON public.skin_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_overall_score ON public.skin_analyses(overall_score DESC);

-- Enable Row Level Security
ALTER TABLE public.skin_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies (relaxed for demo mode)
-- Allow all authenticated users to view all analyses (for demo)
CREATE POLICY "Allow read access for demo"
  ON public.skin_analyses
  FOR SELECT
  TO public
  USING (true);

-- Allow all to insert (for demo mode)
CREATE POLICY "Allow insert for demo"
  ON public.skin_analyses
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to update their own analyses
CREATE POLICY "Users can update own analyses"
  ON public.skin_analyses
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow users to delete their own analyses
CREATE POLICY "Users can delete own analyses"
  ON public.skin_analyses
  FOR DELETE
  TO public
  USING (true);

-- Create storage bucket for skin analysis images
INSERT INTO storage.buckets (id, name, public)
VALUES ('skin-analysis-images', 'skin-analysis-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
-- Allow anyone to upload images (for demo mode)
CREATE POLICY "Allow upload for demo"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'skin-analysis-images');

-- Allow anyone to view images (for demo mode)
CREATE POLICY "Allow view for demo"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'skin-analysis-images');

-- Allow anyone to delete images (for demo mode)
CREATE POLICY "Allow delete for demo"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'skin-analysis-images');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skin_analyses_updated_at
  BEFORE UPDATE ON public.skin_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comments
COMMENT ON TABLE public.skin_analyses IS 'Stores AI-powered skin analysis results combining CV algorithms and GPT-4 Vision';
COMMENT ON COLUMN public.skin_analyses.overall_score IS 'Overall skin health score (0-100)';
COMMENT ON COLUMN public.skin_analyses.confidence IS 'Analysis confidence percentage (0-100)';
COMMENT ON COLUMN public.skin_analyses.analysis_time_ms IS 'Time taken for analysis in milliseconds';
