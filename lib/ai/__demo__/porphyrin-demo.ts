/**
 * Porphyrin Detector Demo
 * 
 * ตัวอย่างการใช้งาน analyzePorphyrins() ในสถานการณ์ต่างๆ
 * 
 * Run: npx ts-node lib/ai/__demo__/porphyrin-demo.ts
 */

import {
  analyzePorphyrins,
  formatPorphyrinSummary,
  getPorphyrinDescription,
  getTreatmentUrgencyDescription,
  type PorphyrinDetectorInput,
  type PorphyrinAnalysisResult,
} from '../porphyrin-detector';

// ========================= DEMO SCENARIOS =========================

/**
 * Demo 1: Clear skin - ผิวสะอาด ไม่มีปัญหาสิว
 */
function demoClearSkin() {
  console.log('\n========== DEMO 1: CLEAR SKIN ==========\n');
  
  const input: PorphyrinDetectorInput = {
    features: {
      acneCount: 0,
      acneClusterDensity: 0,
      poreDensity: 80,         // Normal pore density
      averagePoreSize: 25,      // Small pores
      congestedPoresPercent: 3, // Very minimal congestion
      redAreasScore: 5,         // Almost no redness
      inflammationSpots: 0,
    },
    userHistory: {
      age: 28,
      acneHistory: 'never',
      onTreatment: false,
      skincareRoutine: 'good',
    },
    imageConfidence: 0.9,
  };
  
  const result = analyzePorphyrins(input);
  
  console.log('Input:', JSON.stringify(input.features, null, 2));
  console.log('\nResult:');
  console.log(`- Porphyrin Score: ${result.porphyrinScore}/100 (${getPorphyrinDescription(result.porphyrinScore)})`);
  console.log(`- Acne Severity: ${result.acneSeverity}`);
  console.log(`- Pore Congestion: ${result.poreCongestion}`);
  console.log(`- Inflammation: ${result.inflammationLevel}`);
  console.log(`- Treatment: ${result.treatmentUrgency} (${getTreatmentUrgencyDescription(result.treatmentUrgency)})`);
  console.log(`- Bacterial Density: ${result.estimatedBacterialDensity} spots/cm²`);
  console.log(`- Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  console.log('\nTop 3 Recommendations:');
  result.recommendations.slice(0, 3).forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
}

/**
 * Demo 2: Mild acne - สิวเล็กน้อย (teenage acne)
 */
function demoMildAcne() {
  console.log('\n========== DEMO 2: MILD ACNE (Teenager) ==========\n');
  
  const input: PorphyrinDetectorInput = {
    features: {
      acneCount: 8,
      acneClusterDensity: 20,
      poreDensity: 140,         // Higher pore density (oily skin)
      averagePoreSize: 38,
      congestedPoresPercent: 12,
      redAreasScore: 18,
      inflammationSpots: 3,
    },
    userHistory: {
      age: 16,                  // Teenager = high sebum production
      acneHistory: 'occasional',
      onTreatment: false,
      skincareRoutine: 'basic',
    },
    imageConfidence: 0.85,
  };
  
  const result = analyzePorphyrins(input);
  
  console.log('Input:', JSON.stringify(input.features, null, 2));
  console.log('\nResult:');
  console.log(`- Porphyrin Score: ${result.porphyrinScore}/100 (${getPorphyrinDescription(result.porphyrinScore)})`);
  console.log(`- Acne Severity: ${result.acneSeverity}`);
  console.log(`- Treatment: ${result.treatmentUrgency} (${getTreatmentUrgencyDescription(result.treatmentUrgency)})`);
  console.log(`- Progression Risk: ${result.progressionRisk}`);
  console.log('\nFactor Breakdown:');
  console.log(`  - Acne Pattern: ${result.factors.acnePattern}/100`);
  console.log(`  - Pore Congestion: ${result.factors.poreCongestion}/100`);
  console.log(`  - Inflammation: ${result.factors.inflammation}/100`);
  console.log(`  - History Adjustment: ${result.factors.historyAdjustment >= 0 ? '+' : ''}${result.factors.historyAdjustment}`);
  console.log('\nTop 3 Recommendations:');
  result.recommendations.slice(0, 3).forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
}

/**
 * Demo 3: Moderate acne with poor skincare - สิวปานกลาง ดูแลผิวไม่ดี
 */
function demoModerateAcne() {
  console.log('\n========== DEMO 3: MODERATE ACNE (Poor Skincare) ==========\n');
  
  const input: PorphyrinDetectorInput = {
    features: {
      acneCount: 22,
      acneClusterDensity: 45,   // Clustered acne
      poreDensity: 160,
      averagePoreSize: 52,      // Enlarged pores
      congestedPoresPercent: 28,
      redAreasScore: 38,
      inflammationSpots: 12,
    },
    userHistory: {
      age: 24,
      acneHistory: 'frequent',
      onTreatment: false,
      skincareRoutine: 'poor',  // Poor hygiene = worse score
    },
    imageConfidence: 0.82,
  };
  
  const result = analyzePorphyrins(input);
  
  console.log('Input:', JSON.stringify(input.features, null, 2));
  console.log('\nResult:');
  console.log(`- Porphyrin Score: ${result.porphyrinScore}/100 (${getPorphyrinDescription(result.porphyrinScore)})`);
  console.log(`- Acne Severity: ${result.acneSeverity}`);
  console.log(`- Pore Congestion: ${result.poreCongestion}`);
  console.log(`- Treatment: ${result.treatmentUrgency} (${getTreatmentUrgencyDescription(result.treatmentUrgency)})`);
  console.log(`- Bacterial Density: ${result.estimatedBacterialDensity} spots/cm²`);
  console.log(`- Progression Risk: ${result.progressionRisk}`);
  console.log('\nTop 3 Recommendations:');
  result.recommendations.slice(0, 3).forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
}

/**
 * Demo 4: Severe acne with inflammation - สิวรุนแรง มีการอักเสบ
 */
function demoSevereAcne() {
  console.log('\n========== DEMO 4: SEVERE ACNE (High Inflammation) ==========\n');
  
  const input: PorphyrinDetectorInput = {
    features: {
      acneCount: 42,
      acneClusterDensity: 68,
      poreDensity: 180,
      averagePoreSize: 65,
      congestedPoresPercent: 48,
      redAreasScore: 72,        // Severe inflammation
      inflammationSpots: 28,
    },
    userHistory: {
      age: 21,
      acneHistory: 'chronic',   // Long-term acne
      onTreatment: false,
      skincareRoutine: 'basic',
    },
    imageConfidence: 0.88,
  };
  
  const result = analyzePorphyrins(input);
  
  console.log('Input:', JSON.stringify(input.features, null, 2));
  console.log('\nResult:');
  console.log(`- Porphyrin Score: ${result.porphyrinScore}/100 (${getPorphyrinDescription(result.porphyrinScore)})`);
  console.log(`- Acne Severity: ${result.acneSeverity}`);
  console.log(`- Inflammation: ${result.inflammationLevel}`);
  console.log(`- Treatment: ${result.treatmentUrgency} (${getTreatmentUrgencyDescription(result.treatmentUrgency)})`);
  console.log(`- Bacterial Density: ${result.estimatedBacterialDensity} spots/cm²`);
  console.log(`- Progression Risk: ${result.progressionRisk}`);
  console.log('\n⚠️ WARNING: Urgent treatment needed!');
  console.log('\nTop 3 Recommendations:');
  result.recommendations.slice(0, 3).forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
}

/**
 * Demo 5: Severe acne on treatment - สิวรุนแรง แต่กำลังรักษา
 */
function demoSevereAcneOnTreatment() {
  console.log('\n========== DEMO 5: SEVERE ACNE (On Treatment) ==========\n');
  
  const input: PorphyrinDetectorInput = {
    features: {
      acneCount: 35,            // Still high but improving
      acneClusterDensity: 55,
      poreDensity: 170,
      averagePoreSize: 58,
      congestedPoresPercent: 38,
      redAreasScore: 48,        // Moderate inflammation (reducing)
      inflammationSpots: 18,
    },
    userHistory: {
      age: 22,
      acneHistory: 'chronic',
      onTreatment: true,        // On medication = reduced score
      skincareRoutine: 'excellent', // Good compliance
    },
    imageConfidence: 0.85,
  };
  
  const result = analyzePorphyrins(input);
  
  console.log('Input:', JSON.stringify(input.features, null, 2));
  console.log('User on treatment: YES');
  console.log('\nResult:');
  console.log(`- Porphyrin Score: ${result.porphyrinScore}/100 (${getPorphyrinDescription(result.porphyrinScore)})`);
  console.log(`- Treatment: ${result.treatmentUrgency} (${getTreatmentUrgencyDescription(result.treatmentUrgency)})`);
  console.log(`- Progression Risk: ${result.progressionRisk} (reduced due to treatment)`);
  console.log('\nFactor Breakdown:');
  console.log(`  - History Adjustment: ${result.factors.historyAdjustment >= 0 ? '+' : ''}${result.factors.historyAdjustment} (includes -10 for treatment)`);
  console.log('\nTop 3 Recommendations:');
  result.recommendations.slice(0, 3).forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
}

/**
 * Demo 6: Pore congestion without acne - รูขุมขนอุดตัน แต่ไม่มีสิว
 */
function demoPortCongestionOnly() {
  console.log('\n========== DEMO 6: PORE CONGESTION (No Active Acne) ==========\n');
  
  const input: PorphyrinDetectorInput = {
    features: {
      acneCount: 2,             // Minimal acne
      acneClusterDensity: 5,
      poreDensity: 155,         // High pore density
      averagePoreSize: 68,      // Large pores
      congestedPoresPercent: 52, // Severely congested
      redAreasScore: 12,        // Minimal inflammation
      inflammationSpots: 1,
    },
    userHistory: {
      age: 32,                  // Older age = less bacterial activity
      acneHistory: 'occasional',
      onTreatment: false,
      skincareRoutine: 'good',
    },
    imageConfidence: 0.8,
  };
  
  const result = analyzePorphyrins(input);
  
  console.log('Input:', JSON.stringify(input.features, null, 2));
  console.log('\nResult:');
  console.log(`- Porphyrin Score: ${result.porphyrinScore}/100 (${getPorphyrinDescription(result.porphyrinScore)})`);
  console.log(`- Acne Severity: ${result.acneSeverity}`);
  console.log(`- Pore Congestion: ${result.poreCongestion} (main issue)`);
  console.log(`- Treatment: ${result.treatmentUrgency}`);
  console.log('\nFactor Breakdown:');
  console.log(`  - Acne Pattern: ${result.factors.acnePattern}/100 (low)`);
  console.log(`  - Pore Congestion: ${result.factors.poreCongestion}/100 (HIGH)`);
  console.log(`  - Inflammation: ${result.factors.inflammation}/100 (low)`);
  console.log('\nTop 3 Recommendations:');
  result.recommendations.slice(0, 3).forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
}

/**
 * Demo 7: Mature skin with minimal issues - ผิวผู้ใหญ่ ปัญหาน้อย
 */
function demoMatureSkin() {
  console.log('\n========== DEMO 7: MATURE SKIN (Minimal Issues) ==========\n');
  
  const input: PorphyrinDetectorInput = {
    features: {
      acneCount: 1,
      acneClusterDensity: 2,
      poreDensity: 75,          // Lower pore density
      averagePoreSize: 35,
      congestedPoresPercent: 8,
      redAreasScore: 8,
      inflammationSpots: 0,
    },
    userHistory: {
      age: 48,                  // Mature age = low bacterial activity
      acneHistory: 'never',
      onTreatment: false,
      skincareRoutine: 'excellent',
    },
    imageConfidence: 0.88,
  };
  
  const result = analyzePorphyrins(input);
  
  console.log('Input:', JSON.stringify(input.features, null, 2));
  console.log('\nResult:');
  console.log(`- Porphyrin Score: ${result.porphyrinScore}/100 (${getPorphyrinDescription(result.porphyrinScore)})`);
  console.log(`- Treatment: ${result.treatmentUrgency} (${getTreatmentUrgencyDescription(result.treatmentUrgency)})`);
  console.log('\nFactor Breakdown:');
  console.log(`  - History Adjustment: ${result.factors.historyAdjustment >= 0 ? '+' : ''}${result.factors.historyAdjustment} (age 48 = reduced bacterial activity)`);
  console.log('\nTop 3 Recommendations:');
  result.recommendations.slice(0, 3).forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
}

/**
 * Demo 8: Formatted summary output
 */
function demoFormattedSummary() {
  console.log('\n========== DEMO 8: FORMATTED SUMMARY ==========\n');
  
  const input: PorphyrinDetectorInput = {
    features: {
      acneCount: 18,
      acneClusterDensity: 38,
      poreDensity: 145,
      averagePoreSize: 48,
      congestedPoresPercent: 22,
      redAreasScore: 35,
      inflammationSpots: 10,
    },
    userHistory: {
      age: 20,
      acneHistory: 'frequent',
      onTreatment: false,
      skincareRoutine: 'basic',
    },
    imageConfidence: 0.83,
  };
  
  const result = analyzePorphyrins(input);
  const summary = formatPorphyrinSummary(result);
  
  console.log(summary);
}

// ========================= RUN ALL DEMOS =========================

export function runPorphyrinDemo() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   PORPHYRIN DETECTOR DEMO SCENARIOS        ║');
  console.log('║   VISIA Metric 8/8: Bacterial Analysis     ║');
  console.log('╚════════════════════════════════════════════╝');
  
  demoClearSkin();
  demoMildAcne();
  demoModerateAcne();
  demoSevereAcne();
  demoSevereAcneOnTreatment();
  demoPortCongestionOnly();
  demoMatureSkin();
  demoFormattedSummary();
  
  console.log('\n========== ALL DEMOS COMPLETED ==========\n');
}

// Run if executed directly
if (typeof window === 'undefined') {
  runPorphyrinDemo();
}
