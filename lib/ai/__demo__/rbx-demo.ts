/**
 * Demo: RBX Color Separation Algorithm
 * ตัวอย่างการใช้งาน lib/ai/color-separation.ts
 */

import {
  rgbToHSV,
  rgbToLAB,
  classifyPixelColor,
  analyzeRBXColors,
  createRBXVisualization,
  getRBXScoreDescription,
} from '../color-separation';

// ===================== Demo 1: Color Space Conversion =====================

export function demoColorSpaceConversion() {
  console.log('\n=== Demo 1: Color Space Conversion ===\n');

  // Test 1: Pure Red
  const red = { r: 255, g: 0, b: 0 };
  const redHSV = rgbToHSV(red.r, red.g, red.b);
  const redLAB = rgbToLAB(red.r, red.g, red.b);
  console.log('Pure Red (255, 0, 0):');
  console.log(`  HSV: H=${redHSV.h.toFixed(1)}°, S=${redHSV.s.toFixed(1)}%, V=${redHSV.v.toFixed(1)}%`);
  console.log(`  LAB: L=${redLAB.l.toFixed(1)}, a=${redLAB.a.toFixed(1)}, b=${redLAB.b.toFixed(1)}`);

  // Test 2: Brown (Tan/Beige)
  const brown = { r: 139, g: 69, b: 19 };
  const brownHSV = rgbToHSV(brown.r, brown.g, brown.b);
  const brownLAB = rgbToLAB(brown.r, brown.g, brown.b);
  console.log('\nBrown (139, 69, 19):');
  console.log(`  HSV: H=${brownHSV.h.toFixed(1)}°, S=${brownHSV.s.toFixed(1)}%, V=${brownHSV.v.toFixed(1)}%`);
  console.log(`  LAB: L=${brownLAB.l.toFixed(1)}, a=${brownLAB.a.toFixed(1)}, b=${brownLAB.b.toFixed(1)}`);

  // Test 3: Light UV damage (yellowish)
  const uv = { r: 200, g: 180, b: 140 };
  const uvHSV = rgbToHSV(uv.r, uv.g, uv.b);
  const uvLAB = rgbToLAB(uv.r, uv.g, uv.b);
  console.log('\nLight UV (200, 180, 140):');
  console.log(`  HSV: H=${uvHSV.h.toFixed(1)}°, S=${uvHSV.s.toFixed(1)}%, V=${uvHSV.v.toFixed(1)}%`);
  console.log(`  LAB: L=${uvLAB.l.toFixed(1)}, a=${uvLAB.a.toFixed(1)}, b=${uvLAB.b.toFixed(1)}`);

  // Test 4: Normal skin
  const skin = { r: 220, g: 180, b: 160 };
  const skinHSV = rgbToHSV(skin.r, skin.g, skin.b);
  const skinLAB = rgbToLAB(skin.r, skin.g, skin.b);
  console.log('\nNormal Skin (220, 180, 160):');
  console.log(`  HSV: H=${skinHSV.h.toFixed(1)}°, S=${skinHSV.s.toFixed(1)}%, V=${skinHSV.v.toFixed(1)}%`);
  console.log(`  LAB: L=${skinLAB.l.toFixed(1)}, a=${skinLAB.a.toFixed(1)}, b=${skinLAB.b.toFixed(1)}`);
}

// ===================== Demo 2: Pixel Classification =====================

export function demoPixelClassification() {
  console.log('\n=== Demo 2: Pixel Classification ===\n');

  const testColors = [
    { name: 'Red spot (inflammation)', r: 180, g: 50, b: 50 },
    { name: 'Brown spot (pigmentation)', r: 120, g: 80, b: 40 },
    { name: 'UV damage (yellowish)', r: 190, g: 170, b: 130 },
    { name: 'Normal skin', r: 220, g: 180, b: 160 },
    { name: 'Dark brown (mole)', r: 90, g: 60, b: 30 },
    { name: 'Light red (rosacea)', r: 200, g: 120, b: 120 },
  ];

  for (const color of testColors) {
    const classification = classifyPixelColor(color.r, color.g, color.b);
    console.log(`${color.name} (${color.r}, ${color.g}, ${color.b}):`);
    console.log(`  Red: ${classification.isRed ? '✓' : '✗'} (intensity: ${(classification.redIntensity * 100).toFixed(1)}%)`);
    console.log(`  Brown: ${classification.isBrown ? '✓' : '✗'} (intensity: ${(classification.brownIntensity * 100).toFixed(1)}%)`);
    console.log(`  UV: ${classification.isUV ? '✓' : '✗'} (intensity: ${(classification.uvIntensity * 100).toFixed(1)}%)`);
    console.log('');
  }
}

// ===================== Demo 3: Image Analysis =====================

export async function demoImageAnalysis() {
  console.log('\n=== Demo 3: Image Analysis ===\n');

  // Create synthetic test image (100x100)
  const width = 100;
  const height = 100;
  const imageData = new ImageData(width, height);

  // Fill with synthetic data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      // Normal skin (60%)
      if (x < 60) {
        imageData.data[i] = 220; // R
        imageData.data[i + 1] = 180; // G
        imageData.data[i + 2] = 160; // B
        imageData.data[i + 3] = 255; // A
      }
      // Red areas (20%)
      else if (x < 80) {
        imageData.data[i] = 180;
        imageData.data[i + 1] = 50 + Math.random() * 30;
        imageData.data[i + 2] = 50 + Math.random() * 30;
        imageData.data[i + 3] = 255;
      }
      // Brown spots (15%)
      else if (x < 95) {
        imageData.data[i] = 120 + Math.random() * 20;
        imageData.data[i + 1] = 70 + Math.random() * 20;
        imageData.data[i + 2] = 30 + Math.random() * 20;
        imageData.data[i + 3] = 255;
      }
      // UV damage (5%)
      else {
        imageData.data[i] = 190 + Math.random() * 20;
        imageData.data[i + 1] = 170 + Math.random() * 20;
        imageData.data[i + 2] = 130 + Math.random() * 20;
        imageData.data[i + 3] = 255;
      }
    }
  }

  // Analyze
  const result = await analyzeRBXColors(imageData);

  console.log('Analysis Result:');
  console.log('\nRed Areas:');
  console.log(`  Score: ${result.redAreas.score}/100`);
  console.log(`  Coverage: ${result.redAreas.coverage.toFixed(2)}%`);
  console.log(`  Intensity: ${result.redAreas.intensity.toFixed(1)}/100`);
  console.log(`  Distribution: ${result.redAreas.distribution}`);
  console.log(`  Confidence: ${(result.redAreas.confidence * 100).toFixed(0)}%`);
  console.log(`  Description: ${getRBXScoreDescription(result.redAreas.score, 'red')}`);

  console.log('\nBrown Spots:');
  console.log(`  Score: ${result.brownSpots.score}/100`);
  console.log(`  Coverage: ${result.brownSpots.coverage.toFixed(2)}%`);
  console.log(`  Intensity: ${result.brownSpots.intensity.toFixed(1)}/100`);
  console.log(`  Distribution: ${result.brownSpots.distribution}`);
  console.log(`  Confidence: ${(result.brownSpots.confidence * 100).toFixed(0)}%`);
  console.log(`  Description: ${getRBXScoreDescription(result.brownSpots.score, 'brown')}`);

  console.log('\nUV Spots:');
  console.log(`  Score: ${result.uvSpots.score}/100`);
  console.log(`  Coverage: ${result.uvSpots.coverage.toFixed(2)}%`);
  console.log(`  Confidence: ${(result.uvSpots.confidence * 100).toFixed(0)}%`);
  console.log(`  Description: ${getRBXScoreDescription(result.uvSpots.score, 'uv')}`);

  console.log(`\nProcessing Time: ${result.processingTime.toFixed(1)}ms`);
}

// ===================== Demo 4: Visualization =====================

export function demoVisualization() {
  console.log('\n=== Demo 4: Visualization ===\n');

  // Create small test image (10x10)
  const width = 10;
  const height = 10;
  const imageData = new ImageData(width, height);

  // Fill with test pattern
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      if (x < 3) {
        // Red zone
        imageData.data[i] = 180;
        imageData.data[i + 1] = 50;
        imageData.data[i + 2] = 50;
      } else if (x < 6) {
        // Brown zone
        imageData.data[i] = 120;
        imageData.data[i + 1] = 70;
        imageData.data[i + 2] = 30;
      } else {
        // UV zone
        imageData.data[i] = 190;
        imageData.data[i + 1] = 170;
        imageData.data[i + 2] = 130;
      }
      imageData.data[i + 3] = 255; // A
    }
  }

  // Create visualizations
  createRBXVisualization(imageData, 'red');
  createRBXVisualization(imageData, 'brown');
  createRBXVisualization(imageData, 'uv');
  const allViz = createRBXVisualization(imageData, 'all');

  console.log('Visualization modes created:');
  console.log('  - Red-only visualization');
  console.log('  - Brown-only visualization');
  console.log('  - UV-only visualization');
  console.log('  - Combined (all) visualization');
  console.log('\nThese can be rendered to canvas for visual inspection.');

  // Count highlighted pixels
  let redCount = 0;
  let brownCount = 0;
  let uvCount = 0;

  for (let i = 0; i < allViz.data.length; i += 4) {
    if (allViz.data[i + 3] > 0) {
      const r = allViz.data[i];
      const g = allViz.data[i + 1];
      const b = allViz.data[i + 2];

      if (r === 255 && g === 0 && b === 0) redCount++;
      else if (r === 139 && g === 69 && b === 19) brownCount++;
      else if (r === 255 && g === 255 && b === 0) uvCount++;
    }
  }

  console.log(`\nHighlighted pixels in combined visualization:`);
  console.log(`  Red: ${redCount} pixels`);
  console.log(`  Brown: ${brownCount} pixels`);
  console.log(`  UV: ${uvCount} pixels`);
}

// ===================== Demo 5: Score Descriptions =====================

export function demoScoreDescriptions() {
  console.log('\n=== Demo 5: Score Descriptions (Thai) ===\n');

  const scores = [0, 15, 35, 55, 75];

  console.log('Red Areas:');
  for (const score of scores) {
    console.log(`  Score ${score}/100: ${getRBXScoreDescription(score, 'red')}`);
  }

  console.log('\nBrown Spots:');
  for (const score of scores) {
    console.log(`  Score ${score}/100: ${getRBXScoreDescription(score, 'brown')}`);
  }

  console.log('\nUV Spots:');
  for (const score of scores) {
    console.log(`  Score ${score}/100: ${getRBXScoreDescription(score, 'uv')}`);
  }
}

// ===================== Run All Demos =====================

export async function runRBXDemo() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  RBX Color Separation Algorithm - Demo Suite          ║');
  console.log('║  VISIA RBX® compatible color analysis                 ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  demoColorSpaceConversion();
  demoPixelClassification();
  await demoImageAnalysis();
  demoVisualization();
  demoScoreDescriptions();

  console.log('\n✅ All demos completed!\n');
}

// Auto-run if executed directly (Node.js environment)
if (typeof globalThis.window === 'undefined') {
  runRBXDemo().catch(console.error);
}
