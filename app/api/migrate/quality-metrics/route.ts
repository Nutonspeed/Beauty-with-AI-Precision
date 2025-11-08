import { NextResponse } from 'next/server'
// import postgres from 'postgres' // Disabled: Use Supabase Dashboard for migrations

export async function POST() {
  // Return SQL for manual execution - safer than automated migrations
  return NextResponse.json({
    success: false,
    message: 'Automated migrations are disabled. Please run migrations manually in Supabase Dashboard.',
    instruction: 'Go to Supabase Dashboard > SQL Editor and run this SQL:',
    sql: `
-- Phase 1 Enhancement: Add image quality metrics columns
ALTER TABLE public.skin_analyses
ADD COLUMN IF NOT EXISTS quality_lighting NUMERIC(5,2) CHECK (quality_lighting >= 0 AND quality_lighting <= 100),
ADD COLUMN IF NOT EXISTS quality_blur NUMERIC(5,2) CHECK (quality_blur >= 0 AND quality_blur <= 100),
ADD COLUMN IF NOT EXISTS quality_face_size NUMERIC(4,3) CHECK (quality_face_size >= 0 AND quality_face_size <= 1),
ADD COLUMN IF NOT EXISTS quality_overall NUMERIC(5,2) CHECK (quality_overall >= 0 AND quality_overall <= 100);

CREATE INDEX IF NOT EXISTS idx_skin_analyses_quality_overall ON public.skin_analyses(quality_overall DESC);

COMMENT ON COLUMN public.skin_analyses.quality_lighting IS 'Image lighting quality score (0-100), higher is better';
COMMENT ON COLUMN public.skin_analyses.quality_blur IS 'Image sharpness score (0-100), higher is sharper';
COMMENT ON COLUMN public.skin_analyses.quality_face_size IS 'Face coverage ratio (0-1), optimal 0.15-0.45';
COMMENT ON COLUMN public.skin_analyses.quality_overall IS 'Composite quality score (0-100), >= 70 is excellent';
    `.trim()
  })
}
