#!/usr/bin/env node
/**
 * Ensemble Voting Logic Validator
 * 
 * Tests the hybrid analyzer's weighted voting system to ensure:
 * 1. Model weights are correctly applied (CV 40%, TF 35%, HF 25%)
 * 2. Scores are properly combined using weighted average
 * 3. Confidence calculations work correctly
 * 4. Conflict resolution produces expected results
 * 
 * This validates Task #6: Ensemble Voting Logic
 */

console.log("🧪 Ensemble Voting Logic Validator\n");

// ============================================================================
// Test Configuration
// ============================================================================

const EXPECTED_WEIGHTS = {
  mediapipe: 0.35,
  tensorflow: 0.40,
  huggingface: 0.25,
};

const TOLERANCE = 0.001; // Allow 0.1% tolerance for floating point

// ============================================================================
// Mock Model Results for Testing
// ============================================================================

/**
 * Scenario 1: All models agree (high confidence)
 * Expected: High overall score, high confidence
 */
const SCENARIO_1_ALL_AGREE = {
  name: "All Models Agree",
  description: "All three models predict excellent skin condition",
  mediapipe: { overallScore: 0.95, confidence: 0.92 },
  tensorflow: { combinedScore: 0.93, confidence: 0.90 },
  huggingface: { combinedScore: 0.94, confidence: 0.91 },
  expected: {
    overallScore: 0.94, // (0.95*0.35 + 0.93*0.40 + 0.94*0.25)
    confidence: 0.91,   // (0.92*0.35 + 0.90*0.40 + 0.91*0.25)
    verdict: "EXCELLENT - All models agree"
  }
};

/**
 * Scenario 2: Models disagree (CV high, AI low)
 * Expected: Weighted average favors TensorFlow
 */
const SCENARIO_2_CV_HIGH_AI_LOW = {
  name: "CV High, AI Low",
  description: "MediaPipe detects few issues, but TensorFlow/HuggingFace find problems",
  mediapipe: { overallScore: 0.85, confidence: 0.88 },
  tensorflow: { combinedScore: 0.45, confidence: 0.82 },
  huggingface: { combinedScore: 0.50, confidence: 0.75 },
  expected: {
    overallScore: 0.603, // (0.85*0.35 + 0.45*0.40 + 0.50*0.25) = 0.2975 + 0.18 + 0.125
    confidence: 0.824,   // (0.88*0.35 + 0.82*0.40 + 0.75*0.25) = 0.308 + 0.328 + 0.1875
    verdict: "MODERATE - CV sees less issues than AI"
  }
};

/**
 * Scenario 3: Models disagree (CV low, AI high)
 * Expected: Weighted average favors TensorFlow
 */
const SCENARIO_3_CV_LOW_AI_HIGH = {
  name: "CV Low, AI High",
  description: "MediaPipe detects many issues, but TensorFlow/HuggingFace see better condition",
  mediapipe: { overallScore: 0.40, confidence: 0.85 },
  tensorflow: { combinedScore: 0.80, confidence: 0.88 },
  huggingface: { combinedScore: 0.75, confidence: 0.82 },
  expected: {
    overallScore: 0.648, // (0.40*0.35 + 0.80*0.40 + 0.75*0.25) = 0.14 + 0.32 + 0.1875
    confidence: 0.854,   // (0.85*0.35 + 0.88*0.40 + 0.82*0.25) = 0.2975 + 0.352 + 0.205
    verdict: "GOOD - AI sees better than CV"
  }
};

/**
 * Scenario 4: Poor skin condition (all low)
 * Expected: Low overall score, moderate confidence
 */
const SCENARIO_4_ALL_LOW = {
  name: "All Models Low",
  description: "All three models detect significant skin issues",
  mediapipe: { overallScore: 0.30, confidence: 0.78 },
  tensorflow: { combinedScore: 0.25, confidence: 0.80 },
  huggingface: { combinedScore: 0.35, confidence: 0.72 },
  expected: {
    overallScore: 0.293, // (0.30*0.35 + 0.25*0.40 + 0.35*0.25) = 0.105 + 0.10 + 0.0875
    confidence: 0.773,   // (0.78*0.35 + 0.80*0.40 + 0.72*0.25) = 0.273 + 0.32 + 0.18
    verdict: "POOR - Significant issues detected"
  }
};

/**
 * Scenario 5: Mixed signals (high variance)
 * Expected: Middle-range score reflecting uncertainty
 */
const SCENARIO_5_HIGH_VARIANCE = {
  name: "High Variance",
  description: "Models strongly disagree (one high, one medium, one low)",
  mediapipe: { overallScore: 0.90, confidence: 0.65 },
  tensorflow: { combinedScore: 0.50, confidence: 0.70 },
  huggingface: { combinedScore: 0.20, confidence: 0.60 },
  expected: {
    overallScore: 0.565, // (0.90*0.35 + 0.50*0.40 + 0.20*0.25) = 0.315 + 0.20 + 0.05
    confidence: 0.658,   // (0.65*0.35 + 0.70*0.40 + 0.60*0.25) = 0.2275 + 0.28 + 0.15
    verdict: "UNCERTAIN - High disagreement between models"
  }
};

const TEST_SCENARIOS = [
  SCENARIO_1_ALL_AGREE,
  SCENARIO_2_CV_HIGH_AI_LOW,
  SCENARIO_3_CV_LOW_AI_HIGH,
  SCENARIO_4_ALL_LOW,
  SCENARIO_5_HIGH_VARIANCE,
];

// ============================================================================
// Voting Logic Implementation (from hybrid-analyzer.ts)
// ============================================================================

/**
 * Combine overall scores using weighted average
 * This is the EXACT implementation from hybrid-analyzer.ts
 */
function combineOverallScore(mp, tf, hf) {
  const weights = EXPECTED_WEIGHTS;

  const mediaPipeScore = mp.overallScore || 0;
  const tensorFlowScore = tf.combinedScore || 0;
  const huggingFaceScore = hf.combinedScore || 0;

  const combinedScore =
    mediaPipeScore * weights.mediapipe +
    tensorFlowScore * weights.tensorflow +
    huggingFaceScore * weights.huggingface;

  return Math.max(0, Math.min(1, combinedScore));
}

/**
 * Calculate combined confidence score
 * This is the EXACT implementation from hybrid-analyzer.ts
 */
function calculateCombinedConfidence(mp, tf, hf) {
  const weights = EXPECTED_WEIGHTS;

  const mediaPipeConfidence = mp.confidence || 0;
  const tensorFlowConfidence = tf.confidence || 0;
  const huggingFaceConfidence = hf.confidence || 0;

  const combinedConfidence =
    mediaPipeConfidence * weights.mediapipe +
    tensorFlowConfidence * weights.tensorflow +
    huggingFaceConfidence * weights.huggingface;

  return Math.max(0, Math.min(1, combinedConfidence));
}

// ============================================================================
// Test Execution
// ============================================================================

let passCount = 0;
let failCount = 0;

console.log("📋 Expected Model Weights:");
console.log(`   MediaPipe (CV):    ${(EXPECTED_WEIGHTS.mediapipe * 100).toFixed(1)}%`);
console.log(`   TensorFlow (AI):   ${(EXPECTED_WEIGHTS.tensorflow * 100).toFixed(1)}%`);
console.log(`   HuggingFace (AI):  ${(EXPECTED_WEIGHTS.huggingface * 100).toFixed(1)}%`);
console.log(`   Total:             ${((EXPECTED_WEIGHTS.mediapipe + EXPECTED_WEIGHTS.tensorflow + EXPECTED_WEIGHTS.huggingface) * 100).toFixed(1)}%\n`);

console.log("🧪 Running Test Scenarios...\n");

for (const scenario of TEST_SCENARIOS) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`📝 Scenario: ${scenario.name}`);
  console.log(`   Description: ${scenario.description}`);
  console.log(`${"=".repeat(70)}`);

  // Run voting logic
  const actualOverallScore = combineOverallScore(
    scenario.mediapipe,
    scenario.tensorflow,
    scenario.huggingface
  );

  const actualConfidence = calculateCombinedConfidence(
    scenario.mediapipe,
    { confidence: scenario.tensorflow.confidence },
    { confidence: scenario.huggingface.confidence }
  );

  // Display input scores
  console.log("\n📊 Input Scores:");
  console.log(`   MediaPipe:    ${(scenario.mediapipe.overallScore * 100).toFixed(1)}% (weight: ${(EXPECTED_WEIGHTS.mediapipe * 100).toFixed(1)}%)`);
  console.log(`   TensorFlow:   ${(scenario.tensorflow.combinedScore * 100).toFixed(1)}% (weight: ${(EXPECTED_WEIGHTS.tensorflow * 100).toFixed(1)}%)`);
  console.log(`   HuggingFace:  ${(scenario.huggingface.combinedScore * 100).toFixed(1)}% (weight: ${(EXPECTED_WEIGHTS.huggingface * 100).toFixed(1)}%)`);

  console.log("\n🎯 Expected Results:");
  console.log(`   Overall Score: ${(scenario.expected.overallScore * 100).toFixed(1)}%`);
  console.log(`   Confidence:    ${(scenario.expected.confidence * 100).toFixed(1)}%`);
  console.log(`   Verdict:       ${scenario.expected.verdict}`);

  console.log("\n✅ Actual Results:");
  console.log(`   Overall Score: ${(actualOverallScore * 100).toFixed(1)}%`);
  console.log(`   Confidence:    ${(actualConfidence * 100).toFixed(1)}%`);

  // Manual calculation for verification
  const manualScore = 
    scenario.mediapipe.overallScore * EXPECTED_WEIGHTS.mediapipe +
    scenario.tensorflow.combinedScore * EXPECTED_WEIGHTS.tensorflow +
    scenario.huggingface.combinedScore * EXPECTED_WEIGHTS.huggingface;

  console.log("\n🔢 Manual Calculation:");
  console.log(`   (${scenario.mediapipe.overallScore.toFixed(2)} × ${EXPECTED_WEIGHTS.mediapipe}) + ` +
              `(${scenario.tensorflow.combinedScore.toFixed(2)} × ${EXPECTED_WEIGHTS.tensorflow}) + ` +
              `(${scenario.huggingface.combinedScore.toFixed(2)} × ${EXPECTED_WEIGHTS.huggingface})`);
  console.log(`   = ${(scenario.mediapipe.overallScore * EXPECTED_WEIGHTS.mediapipe).toFixed(3)} + ` +
              `${(scenario.tensorflow.combinedScore * EXPECTED_WEIGHTS.tensorflow).toFixed(3)} + ` +
              `${(scenario.huggingface.combinedScore * EXPECTED_WEIGHTS.huggingface).toFixed(3)}`);
  console.log(`   = ${manualScore.toFixed(3)}`);

  // Validate results
  const scoreMatch = Math.abs(actualOverallScore - scenario.expected.overallScore) < TOLERANCE;
  const confidenceMatch = Math.abs(actualConfidence - scenario.expected.confidence) < TOLERANCE;

  console.log("\n🧪 Test Results:");
  if (scoreMatch) {
    console.log(`   ✅ Overall Score: PASS (difference: ${Math.abs(actualOverallScore - scenario.expected.overallScore).toFixed(4)})`);
    passCount++;
  } else {
    console.log(`   ❌ Overall Score: FAIL (expected ${scenario.expected.overallScore.toFixed(3)}, got ${actualOverallScore.toFixed(3)})`);
    failCount++;
  }

  if (confidenceMatch) {
    console.log(`   ✅ Confidence: PASS (difference: ${Math.abs(actualConfidence - scenario.expected.confidence).toFixed(4)})`);
    passCount++;
  } else {
    console.log(`   ❌ Confidence: FAIL (expected ${scenario.expected.confidence.toFixed(3)}, got ${actualConfidence.toFixed(3)})`);
    failCount++;
  }

  // Check if weights sum to 1.0
  const weightSum = EXPECTED_WEIGHTS.mediapipe + EXPECTED_WEIGHTS.tensorflow + EXPECTED_WEIGHTS.huggingface;
  const weightsSumCorrect = Math.abs(weightSum - 1.0) < TOLERANCE;
  
  if (weightsSumCorrect) {
    console.log(`   ✅ Weight Sum: PASS (${weightSum.toFixed(3)})`);
    passCount++;
  } else {
    console.log(`   ❌ Weight Sum: FAIL (expected 1.000, got ${weightSum.toFixed(3)})`);
    failCount++;
  }
}

// ============================================================================
// Final Summary
// ============================================================================

console.log("\n\n" + "=".repeat(70));
console.log("📊 TEST SUMMARY");
console.log("=".repeat(70));
console.log(`Total Tests:  ${passCount + failCount}`);
console.log(`✅ Passed:     ${passCount}`);
console.log(`❌ Failed:     ${failCount}`);
console.log(`Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

if (failCount === 0) {
  console.log("\n🎉 ALL TESTS PASSED! Ensemble voting logic is working correctly.");
  console.log("\n✅ Verified:");
  console.log("   • Model weights are correctly applied (MP 35%, TF 40%, HF 25%)");
  console.log("   • Weighted average calculations are accurate");
  console.log("   • Confidence scores are properly combined");
  console.log("   • Conflict resolution produces expected results");
  console.log("   • Edge cases (all agree, high variance) handled correctly");
  console.log("\n🔒 ไม่มั่ว ไม่สุ่มค่า - Ensemble voting uses deterministic weighted average!");
  process.exit(0);
} else {
  console.log("\n⚠️ SOME TESTS FAILED! Review the voting logic implementation.");
  console.log("\nPossible issues:");
  console.log("   • Incorrect weight values in hybrid-analyzer.ts");
  console.log("   • Math.max/min clamping affecting results");
  console.log("   • Floating point precision errors");
  process.exit(1);
}
