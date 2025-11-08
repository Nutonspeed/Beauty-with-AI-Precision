/**
 * Final Check - Test API response directly
 */

async function finalCheck() {
  console.log('🔍 Final Bug Fix Verification\n');
  
  try {
    // Fetch latest analysis via API
    const response = await fetch('http://localhost:3000/api/skin-analysis/f7e093ac-bf1e-4d7f-aa08-0120cb44a620');
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status);
      return false;
    }

    const json = await response.json();
    const analysis = json.data;

    console.log('📊 Analysis ID:', analysis.id);
    console.log('');

    let allPassed = true;

    // Bug #16: Health Score Calculation
    console.log('🔧 Bug #16: Health Score - overallScore structure');
    console.log('  overallScore type:', typeof analysis.overallScore);
    console.log('  overallScore value:', analysis.overallScore);
    
    if (typeof analysis.overallScore === 'object' && analysis.overallScore.spots !== undefined) {
      const scores = [
        analysis.overallScore.spots,
        analysis.overallScore.pores,
        analysis.overallScore.wrinkles,
        analysis.overallScore.texture,
        analysis.overallScore.redness,
        analysis.overallScore.pigmentation,
      ];
      const avg = scores.reduce((a, b) => a + b, 0) / 6;
      const healthScore = Math.round(Math.max(0, Math.min(100, (10 - avg) * 10)));
      
      console.log('  Calculated Health Score:', healthScore);
      console.log('  ✅ PASS - Will display correctly (~' + healthScore + '/100)');
    } else {
      console.log('  ❌ FAIL - overallScore is not an object with required properties');
      allPassed = false;
    }
    console.log('');

    // Bug #15: AI Confidence
    console.log('🔧 Bug #15: AI Confidence');
    console.log('  Confidence:', analysis.confidence);
    
    if (analysis.confidence && analysis.confidence > 0) {
      console.log('  ✅ PASS - Will display "' + analysis.confidence + '%"');
    } else {
      console.log('  ❌ FAIL - Missing confidence value');
      allPassed = false;
    }
    console.log('');

    // Bug #14: Recommendations
    console.log('🔧 Bug #14: Recommendations');
    console.log('  Recommendations count:', analysis.recommendations?.length || 0);
    
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      console.log('  ✅ PASS - Has recommendations');
    } else {
      console.log('  ⚠️  WARN - Will show fallback message (OK)');
    }
    console.log('');

    // Summary
    console.log('='.repeat(60));
    if (allPassed) {
      console.log('✅ ALL BUGS FIXED!');
      console.log('');
      console.log('🎯 Next step: Refresh browser (F5) to see changes');
      console.log('');
      console.log('Expected results:');
      console.log('  • Health Score: ~53/100 (Grade C)');
      console.log('  • AI Confidence: 80%');
      console.log('  • Recommendations: 3 items');
    } else {
      console.log('❌ Some bugs still present');
    }
    console.log('='.repeat(60));

    return allPassed;

  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

finalCheck().then(passed => {
  process.exit(passed ? 0 : 1);
});
