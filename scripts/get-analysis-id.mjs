/**
 * Get Analysis ID from Database
 * Fetches latest analysis for testing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getLatestAnalysis() {
  try {
    console.log('🔍 Fetching latest analysis from database...\n');
    
    const { data, error } = await supabase
      .from('skin_analyses')
      .select('id, analyzed_at, overall_score, image_url')
      .order('analyzed_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Database error:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️  No analyses found in database');
      return;
    }
    
    console.log(`✅ Found ${data.length} recent analyses:\n`);
    
    data.forEach((analysis, index) => {
      console.log(`${index + 1}. ID: ${analysis.id}`);
      console.log(`   Date: ${new Date(analysis.analyzed_at).toLocaleString()}`);
      console.log(`   Score: ${analysis.overall_score}`);
      console.log(`   URL: http://localhost:3000/th/analysis/detail/${analysis.id}\n`);
    });
    
    console.log(`\n🚀 To test the Advanced Analysis tab:`);
    console.log(`   1. Open: http://localhost:3000/th/analysis/detail/${data[0].id}`);
    console.log(`   2. Click the "การวิเคราะห์ขั้นสูง" (Advanced Analysis) tab`);
    console.log(`   3. Verify all 8 modes display correctly\n`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

getLatestAnalysis();
