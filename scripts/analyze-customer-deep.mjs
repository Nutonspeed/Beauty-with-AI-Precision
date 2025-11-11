#!/usr/bin/env node

/**
 * Deep Analysis of Customer Data & System Performance
 * Focus: Skin Analysis Accuracy & Quality
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeCustomerData() {
  console.log('\n🔬 Deep Analysis: customer@example.com\n');
  console.log('='.repeat(60));
  
  // 1. Get customer user
  const { data: customer } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'customer@example.com')
    .single();
  
  if (!customer) {
    console.log('❌ Customer not found');
    return;
  }
  
  console.log('\n👤 Customer Profile:');
  console.log(`   ID: ${customer.id}`);
  console.log(`   Email: ${customer.email}`);
  console.log(`   Role: ${customer.role}`);
  console.log(`   Created: ${customer.created_at}`);
  
  // 2. Get all analyses
  const { data: analyses, count } = await supabase
    .from('skin_analyses')
    .select('*', { count: 'exact' })
    .eq('user_id', customer.id)
    .order('created_at', { ascending: false });
  
  console.log(`\n📊 Total Analyses: ${count || 0}`);
  
  if (!analyses || analyses.length === 0) {
    console.log('   ⚠️  No analyses found');
    return;
  }
  
  // 3. Analyze data quality
  console.log('\n🎯 Analysis Quality Assessment:\n');
  
  let hasQualityData = 0;
  let hasPatientInfo = 0;
  let hasRecommendations = 0;
  let hasAISkinType = 0;
  let hasConcerns = 0;
  let hasTreatmentPlan = 0;
  
  const scores = {
    overall: [],
    spots: [],
    pores: [],
    wrinkles: [],
    texture: [],
    redness: []
  };
  
  analyses.forEach((a) => {
    // Quality metrics
    if (a.quality_overall !== null) hasQualityData++;
    if (a.patient_name !== null) hasPatientInfo++;
    if (a.recommendations && Object.keys(a.recommendations).length > 0) hasRecommendations++;
    if (a.ai_skin_type) hasAISkinType++;
    if (a.ai_concerns && Object.keys(a.ai_concerns).length > 0) hasConcerns++;
    if (a.ai_treatment_plan) hasTreatmentPlan++;
    
    // Collect scores
    if (a.overall_score) scores.overall.push(a.overall_score);
    if (a.spots_severity) scores.spots.push(a.spots_severity);
    if (a.pores_severity) scores.pores.push(a.pores_severity);
    if (a.wrinkles_severity) scores.wrinkles.push(a.wrinkles_severity);
    if (a.texture_severity) scores.texture.push(a.texture_severity);
    if (a.redness_severity) scores.redness.push(a.redness_severity);
  });
  
  const total = analyses.length;
  
  console.log('Data Completeness:');
  console.log(`   Quality Scores: ${hasQualityData}/${total} (${Math.round(hasQualityData/total*100)}%)`);
  console.log(`   Patient Info: ${hasPatientInfo}/${total} (${Math.round(hasPatientInfo/total*100)}%)`);
  console.log(`   AI Skin Type: ${hasAISkinType}/${total} (${Math.round(hasAISkinType/total*100)}%)`);
  console.log(`   AI Concerns: ${hasConcerns}/${total} (${Math.round(hasConcerns/total*100)}%)`);
  console.log(`   Treatment Plan: ${hasTreatmentPlan}/${total} (${Math.round(hasTreatmentPlan/total*100)}%)`);
  console.log(`   Recommendations: ${hasRecommendations}/${total} (${Math.round(hasRecommendations/total*100)}%)`);
  
  // 4. Score analysis
  console.log('\n📈 Score Statistics:\n');
  
  for (const [metric, values] of Object.entries(scores)) {
    if (values.length === 0) {
      console.log(`   ${metric.padEnd(15)}: ❌ No data`);
      continue;
    }
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    console.log(`   ${metric.padEnd(15)}: avg=${avg.toFixed(1)}, min=${min}, max=${max}, range=${range}`);
  }
  
  // 5. Latest analysis deep dive
  console.log('\n🔍 Latest Analysis Deep Dive:\n');
  const latest = analyses[0];
  
  console.log(`   ID: ${latest.id}`);
  console.log(`   Date: ${latest.created_at}`);
  console.log(`   Processing Time: ${latest.analysis_time_ms || 'N/A'}ms`);
  console.log(`   Image URL: ${latest.image_url ? '✅ Yes' : '❌ No'}`);
  
  console.log('\n   Scores:');
  console.log(`      Overall: ${latest.overall_score || 'null'}`);
  console.log(`      Spots: ${latest.spots_severity || 'null'} (count: ${latest.spots_count || 0})`);
  console.log(`      Pores: ${latest.pores_severity || 'null'} (count: ${latest.pores_count || 0})`);
  console.log(`      Wrinkles: ${latest.wrinkles_severity || 'null'} (count: ${latest.wrinkles_count || 0})`);
  console.log(`      Texture: ${latest.texture_severity || 'null'}`);
  console.log(`      Redness: ${latest.redness_severity || 'null'} (count: ${latest.redness_count || 0})`);
  
  console.log('\n   Quality Metrics:');
  console.log(`      Lighting: ${latest.quality_lighting || 'null'}`);
  console.log(`      Blur: ${latest.quality_blur || 'null'}`);
  console.log(`      Face Size: ${latest.quality_face_size || 'null'}`);
  console.log(`      Overall Quality: ${latest.quality_overall || 'null'}`);
  
  console.log('\n   AI Analysis:');
  console.log(`      Skin Type: ${latest.ai_skin_type || 'null'}`);
  console.log(`      Concerns: ${latest.ai_concerns ? JSON.stringify(latest.ai_concerns) : 'null'}`);
  console.log(`      Severity: ${latest.ai_severity || 'null'}`);
  console.log(`      Treatment Plan: ${latest.ai_treatment_plan ? latest.ai_treatment_plan.substring(0, 100) + '...' : 'null'}`);
  
  // 6. Problem identification
  console.log('\n⚠️  CRITICAL ISSUES FOUND:\n');
  
  const issues = [];
  
  if (hasQualityData / total < 0.5) {
    issues.push('🔴 Quality scores missing in >50% of analyses');
  }
  
  if (scores.overall.length === 0) {
    issues.push('🔴 No overall scores - core metric missing!');
  }
  
  if (hasAISkinType / total < 0.8) {
    issues.push('🟡 AI skin type detection incomplete');
  }
  
  if (hasConcerns / total < 0.8) {
    issues.push('🟡 AI concerns detection incomplete');
  }
  
  if (hasTreatmentPlan / total < 0.5) {
    issues.push('🟡 Treatment plans missing in >50% of analyses');
  }
  
  if (latest.quality_overall === null) {
    issues.push('🔴 Latest analysis has no quality score!');
  }
  
  if (issues.length === 0) {
    console.log('   ✅ No critical issues found');
  } else {
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  
  console.log('\n' + '='.repeat(60));
}

async function analyzeSystemCapabilities() {
  console.log('\n🏥 System Capabilities Analysis\n');
  console.log('='.repeat(60));
  
  // Check what analysis features exist in the codebase
  console.log('\n📦 Checking Analysis Implementation...\n');
  
  console.log('Current System Should Have:');
  console.log('   ✅ Image upload & storage');
  console.log('   ✅ Face detection');
  console.log('   ✅ Skin concern detection (spots, pores, wrinkles)');
  console.log('   ✅ Score calculation');
  console.log('   ✅ AI recommendations');
  console.log('   ✅ Treatment plan generation');
  
  console.log('\n❓ Questions to Answer:');
  console.log('   1. Are scores calculated accurately?');
  console.log('   2. Do percentiles match real medical standards?');
  console.log('   3. Is AI model trained on real skin data?');
  console.log('   4. Do recommendations actually help?');
  console.log('   5. Can system detect subtle skin issues?');
  
  console.log('\n' + '='.repeat(60));
}

async function generateImprovementPlan() {
  console.log('\n📋 IMPROVEMENT PLAN - Critical Path to Success\n');
  console.log('='.repeat(60));
  
  console.log('\n🎯 PHASE 0: CRITICAL FIXES (Week 1) - Must Do First!\n');
  
  console.log('Priority 1: Fix Analysis Accuracy');
  console.log('   Problem: Scores might not reflect real skin condition');
  console.log('   Solution:');
  console.log('      - Validate scoring algorithm against dermatology standards');
  console.log('      - Compare with professional skin analyzers');
  console.log('      - Calibrate percentiles using real patient data');
  console.log('      - Test with diverse skin types and conditions');
  console.log('   Effort: 40 hours');
  console.log('   Impact: 🔴 CRITICAL - This is your selling point!\n');
  
  console.log('Priority 2: Improve AI Model Quality');
  console.log('   Problem: Generic AI might miss subtle issues');
  console.log('   Solution:');
  console.log('      - Fine-tune model on Asian skin tones');
  console.log('      - Add specialized acne/melasma detection');
  console.log('      - Improve wrinkle severity classification');
  console.log('      - Validate against dermatologist annotations');
  console.log('   Effort: 60 hours');
  console.log('   Impact: 🔴 CRITICAL - Accuracy is everything!\n');
  
  console.log('Priority 3: Complete Data Collection');
  console.log('   Problem: Missing quality scores & metrics');
  console.log('   Solution:');
  console.log('      - Ensure ALL analyses have quality scores');
  console.log('      - Add confidence levels for each metric');
  console.log('      - Track analysis consistency over time');
  console.log('      - Log all AI decisions for review');
  console.log('   Effort: 20 hours');
  console.log('   Impact: 🟡 HIGH - Needed for trust & improvement\n');
  
  console.log('Priority 4: Validation Dashboard');
  console.log('   Problem: No way to verify accuracy');
  console.log('   Solution:');
  console.log('      - Build admin dashboard to compare AI vs human expert');
  console.log('      - Show confidence scores for each detection');
  console.log('      - Track false positive/negative rates');
  console.log('      - A/B test different models');
  console.log('   Effort: 30 hours');
  console.log('   Impact: 🟡 HIGH - Proves system works!\n');
  
  console.log('\n🚀 PHASE 1: Enhanced Features (Week 2-3)\n');
  
  console.log('Feature 1: Multi-angle Analysis');
  console.log('   - Accept 3+ photos (front, left, right)');
  console.log('   - Detect issues missed in single view');
  console.log('   - 3D face mapping for better assessment');
  console.log('   Effort: 40 hours\n');
  
  console.log('Feature 2: Before/After Comparison');
  console.log('   - Track progress over time');
  console.log('   - Show improvement percentages');
  console.log('   - Validate treatment effectiveness');
  console.log('   Effort: 24 hours\n');
  
  console.log('Feature 3: Real-time Quality Feedback');
  console.log('   - Guide user to take better photos');
  console.log('   - Check lighting, angle, distance in real-time');
  console.log('   - Prevent poor quality submissions');
  console.log('   Effort: 20 hours\n');
  
  console.log('\n📊 Success Metrics:\n');
  console.log('   ✅ Accuracy vs dermatologist: >85% agreement');
  console.log('   ✅ Detection rate: >95% for obvious issues');
  console.log('   ✅ False positive rate: <5%');
  console.log('   ✅ User trust score: >4.5/5');
  console.log('   ✅ Recommendation follow-through: >70%');
  
  console.log('\n💰 Business Impact:\n');
  console.log('   - Can confidently demo to clinics');
  console.log('   - Show real accuracy numbers');
  console.log('   - Compare favorably with competitors');
  console.log('   - Build doctor trust & endorsement');
  console.log('   - Premium pricing justified');
  
  console.log('\n' + '='.repeat(60));
}

async function main() {
  await analyzeCustomerData();
  await analyzeSystemCapabilities();
  await generateImprovementPlan();
  
  console.log('\n📝 NEXT STEPS:\n');
  console.log('1. Review current analysis code in lib/ai/');
  console.log('2. Test analysis accuracy with known cases');
  console.log('3. Compare with professional device results');
  console.log('4. Implement critical fixes first');
  console.log('5. Validate improvements before other features\n');
}

main().catch(console.error);
