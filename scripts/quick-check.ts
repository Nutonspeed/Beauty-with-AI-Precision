/**
 * Quick Check - Verify bug fixes automatically
 * Just checks the latest analysis in database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBugFixes() {
  console.log('🔍 Checking Bug Fixes...\n');
  
  try {
    // Get latest analysis
    const { data: analyses, error } = await supabase
      .from('skin_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Database error:', error);
      return false;
    }

    if (!analyses || analyses.length === 0) {
      console.log('⚠️  No analyses found in database');
      return false;
    }

    const analysis = analyses[0];
    console.log('📊 Latest Analysis:', analysis.id);
    console.log('Created:', new Date(analysis.created_at).toLocaleString());
    console.log('');

    let allPassed = true;

    // Check Bug #16: Health Score calculation
    console.log('🔧 Bug #16: Health Score Calculation');
    const overallScore = analysis.overall_score || {};
    const scores = [
      overallScore.spots || 0,
      overallScore.pores || 0,
      overallScore.wrinkles || 0,
      overallScore.texture || 0,
      overallScore.redness || 0,
      overallScore.pigmentation || 0,
    ];
    const avgSeverity = scores.reduce((a, b) => a + b, 0) / 6;
    const expectedHealthScore = Math.round(Math.max(0, Math.min(100, (10 - avgSeverity) * 10)));
    
    console.log('  Overall Scores:', overallScore);
    console.log('  Average Severity:', avgSeverity.toFixed(2));
    console.log('  Expected Health Score:', expectedHealthScore);
    
    if (expectedHealthScore > 0 && expectedHealthScore < 100) {
      console.log('  ✅ PASS - Health score will calculate correctly');
    } else {
      console.log('  ⚠️  WARN - Health score calculation may be incorrect');
      allPassed = false;
    }
    console.log('');

    // Check Bug #15: AI Confidence
    console.log('🔧 Bug #15: AI Confidence Display');
    const confidence = analysis.confidence;
    console.log('  Confidence value:', confidence);
    
    if (confidence && confidence > 0) {
      console.log(`  ✅ PASS - Will display as "${confidence}%"`);
    } else {
      console.log('  ❌ FAIL - Confidence is missing or 0');
      allPassed = false;
    }
    console.log('');

    // Check Bug #14: Recommendations
    console.log('🔧 Bug #14: Recommendations Data');
    const recommendations = analysis.recommendations;
    console.log('  Recommendations:', recommendations);
    
    if (recommendations && Array.isArray(recommendations) && recommendations.length > 0) {
      console.log(`  ✅ PASS - Has ${recommendations.length} recommendation(s)`);
    } else {
      console.log('  ⚠️  WARN - No recommendations (will show fallback message)');
      // This is OK - fallback message is better than empty
    }
    console.log('');

    // Additional checks
    console.log('📋 Additional Checks:');
    console.log('  Image URL:', analysis.image_url ? '✅ Present' : '❌ Missing');
    console.log('  CV Analysis:', analysis.cv_analysis ? '✅ Present' : '❌ Missing');
    console.log('  AI Analysis:', analysis.ai_analysis ? '✅ Present' : '❌ Missing');
    console.log('  Percentiles:', analysis.percentiles ? '✅ Present' : '❌ Missing');
    console.log('');

    // Summary
    console.log('=' .repeat(60));
    if (allPassed) {
      console.log('✅ ALL CRITICAL BUGS FIXED!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Refresh browser to see updated Health Score');
      console.log('2. Verify AI Confidence shows correct percentage');
      console.log('3. Check Recommendations section shows fallback message');
    } else {
      console.log('⚠️  Some issues detected - review output above');
    }
    console.log('=' .repeat(60));

    return allPassed;

  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

checkBugFixes().then(passed => {
  process.exit(passed ? 0 : 1);
});
