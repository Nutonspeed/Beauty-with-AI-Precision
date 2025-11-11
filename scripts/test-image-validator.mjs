/**
 * Simple manual test for Image Quality Validator
 * Run: node scripts/test-image-validator.mjs
 */

import { validateImageQuality, quickValidate } from '../lib/cv/image-quality-validator.js';
import { Jimp } from 'jimp';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('🧪 Image Quality Validator Test\n');
console.log('═'.repeat(60));

async function testWithTestImages() {
  console.log('\n📸 Testing with real sample images...\n');
  
  const samplesDir = 'test-images/samples';
  const files = readdirSync(samplesDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
  
  if (files.length === 0) {
    console.log('❌ No test images found in test-images/samples/');
    return;
  }
  
  console.log(`Found ${files.length} test images\n`);
  
  for (const file of files.slice(0, 3)) { // Test first 3 images only
    console.log(`\n📷 ${file}`);
    console.log('─'.repeat(60));
    
    try {
      const imagePath = join(samplesDir, file);
      const imageBuffer = readFileSync(imagePath);
      
      // Quick validate first
      const quickResult = await quickValidate(imageBuffer);
      console.log(`  Quick Check: ${quickResult.isValid ? '✅ PASS' : '❌ FAIL'}`);
      if (!quickResult.isValid) {
        console.log(`    Reason: ${quickResult.reason}`);
      }
      
      // Full validation
      const result = await validateImageQuality(imageBuffer, {
        requireFace: false, // Skip face detection for speed
      });
      
      console.log(`\n  Overall Quality Score: ${result.score}/100`);
      console.log(`  Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      // Metrics
      console.log('\n  📊 Metrics:');
      console.log(`    Resolution: ${result.metrics.resolution.width}x${result.metrics.resolution.height} (${result.metrics.resolution.megapixels.toFixed(2)}MP)`);
      console.log(`    Brightness: ${result.metrics.lighting.brightness.toFixed(0)} ${result.metrics.lighting.isWellLit ? '✅' : '⚠️'}`);
      console.log(`    Contrast: ${result.metrics.lighting.contrast.toFixed(0)}`);
      console.log(`    Sharpness: ${result.metrics.sharpness.laplacianVariance.toFixed(0)} ${result.metrics.sharpness.isSharp ? '✅' : '⚠️'}`);
      
      // Issues
      if (result.issues.length > 0) {
        console.log('\n  ❌ Issues:');
        result.issues.forEach(issue => console.log(`    - ${issue}`));
      }
      
      // Warnings
      if (result.warnings.length > 0) {
        console.log('\n  ⚠️  Warnings:');
        result.warnings.forEach(warning => console.log(`    - ${warning}`));
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
}

async function testSyntheticImages() {
  console.log('\n\n🎨 Testing with synthetic images...\n');
  
  // Test 1: Too small
  console.log('\n1️⃣  Testing small image (300x300)...');
  const smallImage = new Jimp({ width: 300, height: 300, color: 0x808080ff });
  const smallBuffer = await smallImage.getBuffer('image/jpeg');
  const smallResult = await quickValidate(smallBuffer);
  console.log(`   Result: ${smallResult.isValid ? '✅ PASS' : '❌ FAIL (Expected)'}`);
  console.log(`   Reason: ${smallResult.reason || 'N/A'}`);
  
  // Test 2: Good resolution
  console.log('\n2️⃣  Testing good image (1024x1024)...');
  const goodImage = new Jimp({ width: 1024, height: 1024, color: 0x808080ff });
  const goodBuffer = await goodImage.getBuffer('image/jpeg');
  const goodQuickResult = await quickValidate(goodBuffer);
  console.log(`   Quick check: ${goodQuickResult.isValid ? '✅ PASS' : '❌ FAIL'}`);
  
  const goodResult = await validateImageQuality(goodBuffer, { requireFace: false });
  console.log(`   Full validation:`);
  console.log(`     Score: ${goodResult.score}/100`);
  console.log(`     Valid: ${goodResult.isValid ? '✅' : '❌'}`);
  console.log(`     Issues: ${goodResult.issues.length}`);
  console.log(`     Warnings: ${goodResult.warnings.length}`);
  
  // Test 3: Extreme aspect ratio
  console.log('\n3️⃣  Testing extreme aspect ratio (2000x500)...');
  const wideImage = new Jimp({ width: 2000, height: 500, color: 0x808080ff });
  const wideBuffer = await wideImage.getBuffer('image/jpeg');
  const wideResult = await quickValidate(wideBuffer);
  console.log(`   Result: ${wideResult.isValid ? '✅ PASS' : '❌ FAIL (Expected)'}`);
  console.log(`   Reason: ${wideResult.reason || 'N/A'}`);
}

async function runTests() {
  try {
    await testWithTestImages();
    await testSyntheticImages();
    
    console.log('\n\n═'.repeat(60));
    console.log('✅ All manual tests completed!');
    console.log('═'.repeat(60));
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
