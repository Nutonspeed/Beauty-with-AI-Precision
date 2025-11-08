// Quick migration script using Supabase client
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bgejeqqngzvuokdffadu.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZWplcXFuZ3p2dW9rZGZmYWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTYzMzc1NCwiZXhwIjoyMDc3MjA5NzU0fQ.e6QXg-KmZpihUyuD81qeyORTgJtAzoaLTqAbIyamJ0o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Running Phase 1 Quality Metrics Migration...\n')

  const sql = `
-- Phase 1 Enhancement: Add image quality metrics columns
ALTER TABLE public.skin_analyses
ADD COLUMN IF NOT EXISTS quality_lighting NUMERIC(5,2) CHECK (quality_lighting >= 0 AND quality_lighting <= 100),
ADD COLUMN IF NOT EXISTS quality_blur NUMERIC(5,2) CHECK (quality_blur >= 0 AND quality_blur <= 100),
ADD COLUMN IF NOT EXISTS quality_face_size NUMERIC(4,3) CHECK (quality_face_size >= 0 AND quality_face_size <= 1),
ADD COLUMN IF NOT EXISTS quality_overall NUMERIC(5,2) CHECK (quality_overall >= 0 AND quality_overall <= 100);

-- Add index for querying by quality
CREATE INDEX IF NOT EXISTS idx_skin_analyses_quality_overall ON public.skin_analyses(quality_overall DESC);

-- Add comments for documentation
COMMENT ON COLUMN public.skin_analyses.quality_lighting IS 'Image lighting quality score (0-100), higher is better';
COMMENT ON COLUMN public.skin_analyses.quality_blur IS 'Image sharpness score (0-100), higher is sharper';
COMMENT ON COLUMN public.skin_analyses.quality_face_size IS 'Face coverage ratio (0-1), optimal 0.15-0.45';
COMMENT ON COLUMN public.skin_analyses.quality_overall IS 'Composite quality score (0-100), >= 70 is excellent';
  `.trim()

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('❌ Migration failed:', error.message)
      console.log('\n📝 Trying alternative method...\n')
      
      // Alternative: Use REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }
      
      console.log('✅ Migration completed via REST API!')
    } else {
      console.log('✅ Migration completed successfully!')
      console.log('📊 Result:', data)
    }

    // Verify columns exist
    console.log('\n🔍 Verifying new columns...')
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'skin_analyses')
      .like('column_name', 'quality_%')
      .order('column_name')

    if (verifyError) {
      console.error('⚠️  Could not verify columns:', verifyError.message)
    } else {
      console.log('✅ Columns created:')
      columns?.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n📋 Please run this SQL manually in Supabase Dashboard > SQL Editor:\n')
    console.log(sql)
    process.exit(1)
  }
}

runMigration()
