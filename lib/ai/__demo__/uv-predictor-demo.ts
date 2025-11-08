/**
 * Demo: UV Spots Predictor
 * ตัวอย่างการใช้งาน lib/ai/uv-predictor.ts
 */

import {
  predictUVDamage,
  getUVDamageDescription,
  getRiskLevelColor,
  formatUVPredictionSummary,
  skinToneToRGB,
  type UVPredictorInput,
  type SkinTone,
  type SunExposureLevel,
} from '../uv-predictor';

// ===================== Demo 1: Basic Prediction =====================

export async function demoBasicPrediction() {
  console.log('\n=== Demo 1: Basic UV Damage Prediction ===\n');

  const input: UVPredictorInput = {
    age: 35,
    skinTone: 'medium',
    sunExposureLevel: 'moderate',
  };

  const result = await predictUVDamage(input);

  console.log('Input:');
  console.log(`  Age: ${input.age} years`);
  console.log(`  Skin Tone: ${input.skinTone}`);
  console.log(`  Sun Exposure: ${input.sunExposureLevel}`);
  console.log('\nPrediction:');
  console.log(`  UV Damage Score: ${result.uvDamageScore}/100`);
  console.log(`  UV Spots Score: ${result.uvSpotsScore}/100`);
  console.log(`  Risk Level: ${result.riskLevel}`);
  console.log(`  Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  console.log(`\n  ${getUVDamageDescription(result.uvDamageScore)}`);
}

// ===================== Demo 2: Complete Input =====================

export async function demoCompleteInput() {
  console.log('\n=== Demo 2: Complete Input with Protection ===\n');

  const input: UVPredictorInput = {
    age: 42,
    skinTone: 'light',
    sunExposureLevel: 'high',
    outdoorHoursPerDay: 5,
    sunscreenUsage: 'often',
    geographicRegion: 'tropical',
  };

  const result = await predictUVDamage(input);

  console.log('Input:');
  console.log(`  Age: ${input.age} years`);
  console.log(`  Skin Tone: ${input.skinTone} (Fitzpatrick II)`);
  console.log(`  Sun Exposure: ${input.sunExposureLevel}`);
  console.log(`  Outdoor Hours/Day: ${input.outdoorHoursPerDay}`);
  console.log(`  Sunscreen Usage: ${input.sunscreenUsage}`);
  console.log(`  Region: ${input.geographicRegion}`);

  console.log('\nFactors Breakdown:');
  console.log(`  Age Factor: ${result.factors.ageFactor.toFixed(1)}/100`);
  console.log(`  Skin Tone Factor: ${result.factors.skinToneFactor.toFixed(1)}/100`);
  console.log(`  Exposure Factor: ${result.factors.exposureFactor.toFixed(1)}/100`);
  console.log(`  Protection Factor: ${result.factors.protectionFactor.toFixed(1)}/100 (higher is better)`);

  console.log('\nFuture Risk:');
  console.log(`  Current: ${result.uvDamageScore.toFixed(1)}/100`);
  console.log(`  In 5 years: ${result.futureRisk.in5Years.toFixed(1)}/100 (+${(result.futureRisk.in5Years - result.uvDamageScore).toFixed(1)})`);
  console.log(`  In 10 years: ${result.futureRisk.in10Years.toFixed(1)}/100 (+${(result.futureRisk.in10Years - result.uvDamageScore).toFixed(1)})`);

  console.log('\nRecommendations:');
  for (const [i, rec] of result.recommendations.entries()) {
    console.log(`  ${i + 1}. ${rec}`);
  }
}

// ===================== Demo 3: With Image Features =====================

export async function demoWithImageFeatures() {
  console.log('\n=== Demo 3: Prediction with Image Analysis ===\n');

  const input: UVPredictorInput = {
    age: 50,
    skinTone: 'medium',
    sunExposureLevel: 'high',
    outdoorHoursPerDay: 4,
    sunscreenUsage: 'sometimes',
    geographicRegion: 'tropical',
    // Detected from image analysis
    existingBrownSpots: 45.5,  // from RBX color separation
    skinTextureScore: 38.2,    // from TensorFlow texture analysis
    wrinkleScore: 42.0,        // from face detection
  };

  const result = await predictUVDamage(input);

  console.log('Input (with image features):');
  console.log(`  Age: ${input.age} years`);
  console.log(`  Skin Tone: ${input.skinTone}`);
  console.log(`  Sun Exposure: ${input.sunExposureLevel}`);
  console.log(`  Detected Brown Spots: ${input.existingBrownSpots?.toFixed(1)}/100`);
  console.log(`  Skin Texture Score: ${input.skinTextureScore?.toFixed(1)}/100`);
  console.log(`  Wrinkle Score: ${input.wrinkleScore?.toFixed(1)}/100`);

  console.log('\nPrediction (enhanced with image data):');
  console.log(`  UV Damage Score: ${result.uvDamageScore.toFixed(1)}/100`);
  console.log(`  UV Spots Score: ${result.uvSpotsScore.toFixed(1)}/100`);
  console.log(`  Risk Level: ${result.riskLevel} (${getRiskLevelColor(result.riskLevel)})`);
  console.log(`  Confidence: ${(result.confidence * 100).toFixed(0)}% (high - has image data)`);

  console.log('\nProcessing Time: ' + result.processingTime.toFixed(1) + 'ms');
}

// ===================== Demo 4: Skin Tone Comparison =====================

export async function demoSkinToneComparison() {
  console.log('\n=== Demo 4: Skin Tone Sensitivity Comparison ===\n');

  const skinTones: SkinTone[] = ['very-light', 'light', 'medium', 'tan', 'brown', 'dark'];

  console.log('Same conditions, different skin tones (Age: 40, Exposure: high):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const tone of skinTones) {
    const input: UVPredictorInput = {
      age: 40,
      skinTone: tone,
      sunExposureLevel: 'high',
      sunscreenUsage: 'sometimes',
    };

    const result = await predictUVDamage(input);
    const rgb = skinToneToRGB(tone);

    console.log(`\n${tone.toUpperCase()} (RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}):`);
    console.log(`  UV Damage: ${result.uvDamageScore.toFixed(1)}/100`);
    console.log(`  Risk Level: ${result.riskLevel}`);
    console.log(`  Skin Tone Factor: ${result.factors.skinToneFactor.toFixed(1)}/100`);
  }
}

// ===================== Demo 5: Protection Impact =====================

export async function demoProtectionImpact() {
  console.log('\n=== Demo 5: Sunscreen Protection Impact ===\n');

  const protectionLevels: Array<'never' | 'rarely' | 'sometimes' | 'often' | 'always'> = [
    'never',
    'rarely',
    'sometimes',
    'often',
    'always',
  ];

  console.log('Same person, different protection habits (Age: 35, Light skin, High exposure):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const protection of protectionLevels) {
    const input: UVPredictorInput = {
      age: 35,
      skinTone: 'light',
      sunExposureLevel: 'high',
      sunscreenUsage: protection,
    };

    const result = await predictUVDamage(input);

    console.log(`\n${protection.toUpperCase()}:`);
    console.log(`  UV Damage: ${result.uvDamageScore.toFixed(1)}/100`);
    console.log(`  Protection Factor: ${result.factors.protectionFactor.toFixed(1)}/100`);
    console.log(`  Risk Level: ${result.riskLevel}`);
    console.log(`  In 10 years: ${result.futureRisk.in10Years.toFixed(1)}/100`);
  }
}

// ===================== Demo 6: Exposure Level Impact =====================

export async function demoExposureLevelImpact() {
  console.log('\n=== Demo 6: Sun Exposure Level Impact ===\n');

  const exposureLevels: SunExposureLevel[] = [
    'minimal',
    'low',
    'moderate',
    'high',
    'extreme',
  ];

  console.log('Same person, different sun exposure (Age: 30, Medium skin):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const exposure of exposureLevels) {
    const input: UVPredictorInput = {
      age: 30,
      skinTone: 'medium',
      sunExposureLevel: exposure,
      sunscreenUsage: 'sometimes',
    };

    const result = await predictUVDamage(input);

    console.log(`\n${exposure.toUpperCase()}:`);
    console.log(`  UV Damage: ${result.uvDamageScore.toFixed(1)}/100`);
    console.log(`  Exposure Factor: ${result.factors.exposureFactor.toFixed(1)}/100`);
    console.log(`  UV Spots: ${result.uvSpotsScore.toFixed(1)}/100`);
    console.log(`  Risk Level: ${result.riskLevel}`);
  }
}

// ===================== Demo 7: Formatted Summary =====================

export async function demoFormattedSummary() {
  console.log('\n=== Demo 7: Formatted Summary Report ===\n');

  const input: UVPredictorInput = {
    age: 45,
    skinTone: 'light',
    sunExposureLevel: 'high',
    outdoorHoursPerDay: 6,
    sunscreenUsage: 'rarely',
    geographicRegion: 'tropical',
    existingBrownSpots: 52.0,
    skinTextureScore: 41.5,
    wrinkleScore: 38,
  };

  const result = await predictUVDamage(input);
  const summary = formatUVPredictionSummary(result);

  console.log(summary);
}

// ===================== Run All Demos =====================

export async function runUVPredictorDemo() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  UV Spots Predictor - Demo Suite                      ║');
  console.log('║  ML-based UV damage prediction system                 ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  await demoBasicPrediction();
  await demoCompleteInput();
  await demoWithImageFeatures();
  await demoSkinToneComparison();
  await demoProtectionImpact();
  await demoExposureLevelImpact();
  await demoFormattedSummary();

  console.log('\n✅ All demos completed!\n');
}

// Auto-run if executed directly (Node.js environment)
if (typeof globalThis.window === 'undefined') {
  runUVPredictorDemo().catch(console.error);
}
