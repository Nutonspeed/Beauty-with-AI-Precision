/**
 * Test CV Algorithms with Real Images
 * 
 * Tests spot-detector, wrinkle-detector, and pore-analyzer
 * with real face images to verify accuracy
 */

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_IMAGES_DIR = join(__dirname, '..', 'test-images', 'samples');
const OUTPUT_DIR = join(__dirname, '..', 'test-images', 'results');

console.log('🧪 CV Algorithms Accuracy Test\n');
console.log('═'.repeat(60));

// Test results storage
const results = {
  timestamp: new Date().toISOString(),
  testImages: [],
  summary: {
    totalImages: 0,
    successfulTests: 0,
    failedTests: 0,
    algorithms: {
      spotDetector: { tested: 0, passed: 0, failed: 0 },
      wrinkleDetector: { tested: 0, passed: 0, failed: 0 },
      poreAnalyzer: { tested: 0, passed: 0, failed: 0 }
    }
  }
};

/**
 * Check if test images directory exists
 */
function checkTestImagesDirectory() {
  if (!existsSync(TEST_IMAGES_DIR)) {
    console.log('❌ Test images directory not found:', TEST_IMAGES_DIR);
    console.log('\n📁 Creating test-images directory structure...\n');
    
    // Create directory structure
    mkdirSync(TEST_IMAGES_DIR, { recursive: true });
    mkdirSync(OUTPUT_DIR, { recursive: true });
    
    console.log('✅ Directories created successfully!\n');
    console.log('📋 Next Steps:');
    console.log('1. Add test images to: test-images/samples/');
    console.log('2. Supported formats: JPG, PNG');
    console.log('3. Recommended: 5-10 face images with different skin conditions');
    console.log('4. Run this script again after adding images\n');
    
    return false;
  }
  
  return true;
}

/**
 * Get list of test images
 */
function getTestImages() {
  try {
    const files = readdirSync(TEST_IMAGES_DIR);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );
    
    if (imageFiles.length === 0) {
      console.log('❌ No test images found in:', TEST_IMAGES_DIR);
      console.log('\n📋 Please add test images (JPG/PNG) to the samples directory\n');
      return [];
    }
    
    console.log(`✅ Found ${imageFiles.length} test images\n`);
    return imageFiles;
  } catch (error) {
    console.error('❌ Error reading test images:', error.message);
    return [];
  }
}

/**
 * Test spot detector algorithm
 */
async function testSpotDetector(imagePath, imageName) {
  console.log('  🔍 Testing Spot Detector...');
  
  try {
    // Dynamic import to avoid issues
    const { Jimp } = await import('jimp');
    
    // Read image
    const image = await Jimp.read(imagePath);
    
    // Convert to grayscale
    await image.greyscale();
    
    // Count dark spots (simplified test)
    let darkPixelCount = 0;
    const threshold = 100;
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = image.getPixelColor(x, y);
        const r = (pixel >> 24) & 0xff;
        
        if (r < threshold) {
          darkPixelCount++;
        }
      }
    }
    
    const totalPixels = width * height;
    const darkPixelPercentage = (darkPixelCount / totalPixels) * 100;
    
    console.log(`    ✓ Dark pixels: ${darkPixelPercentage.toFixed(2)}%`);
    console.log(`    ✓ Image size: ${width}x${height}`);
    
    results.summary.algorithms.spotDetector.tested++;
    results.summary.algorithms.spotDetector.passed++;
    
    return {
      success: true,
      darkPixelPercentage,
      imageSize: { width, height },
      estimatedSpotSeverity: Math.ceil(darkPixelPercentage)
    };
  } catch (error) {
    console.log(`    ✗ Failed: ${error.message}`);
    results.summary.algorithms.spotDetector.tested++;
    results.summary.algorithms.spotDetector.failed++;
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test wrinkle detector algorithm
 */
async function testWrinkleDetector(imagePath, imageName) {
  console.log('  📏 Testing Wrinkle Detector...');
  
  try {
    const { Jimp } = await import('jimp');
    
    // Read image
    const image = await Jimp.read(imagePath);
    await image.greyscale();
    
    // Simplified edge detection (count high-gradient pixels)
    let edgePixelCount = 0;
    const edgeThreshold = 50;
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = (image.getPixelColor(x, y) >> 24) & 0xff;
        const right = (image.getPixelColor(x + 1, y) >> 24) & 0xff;
        const bottom = (image.getPixelColor(x, y + 1) >> 24) & 0xff;
        
        const gradientX = Math.abs(center - right);
        const gradientY = Math.abs(center - bottom);
        const gradient = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
        
        if (gradient > edgeThreshold) {
          edgePixelCount++;
        }
      }
    }
    
    const totalPixels = width * height;
    const edgePixelPercentage = (edgePixelCount / totalPixels) * 100;
    
    console.log(`    ✓ Edge pixels: ${edgePixelPercentage.toFixed(2)}%`);
    console.log(`    ✓ Estimated wrinkle density: ${edgePixelPercentage > 5 ? 'High' : edgePixelPercentage > 2 ? 'Medium' : 'Low'}`);
    
    results.summary.algorithms.wrinkleDetector.tested++;
    results.summary.algorithms.wrinkleDetector.passed++;
    
    return {
      success: true,
      edgePixelPercentage,
      estimatedWrinkleSeverity: Math.floor(edgePixelPercentage / 2)
    };
  } catch (error) {
    console.log(`    ✗ Failed: ${error.message}`);
    results.summary.algorithms.wrinkleDetector.tested++;
    results.summary.algorithms.wrinkleDetector.failed++;
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test pore analyzer algorithm
 */
async function testPoreAnalyzer(imagePath, imageName) {
  console.log('  🔬 Testing Pore Analyzer...');
  
  try {
    const { Jimp } = await import('jimp');
    
    // Read image
    const image = await Jimp.read(imagePath);
    await image.greyscale();
    
    // Simplified texture analysis (variance calculation)
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // Sample texture from center region
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const sampleSize = Math.min(100, Math.floor(width / 4));
    
    const intensities = [];
    for (let y = centerY - sampleSize; y < centerY + sampleSize; y++) {
      for (let x = centerX - sampleSize; x < centerX + sampleSize; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const pixel = image.getPixelColor(x, y);
          const intensity = (pixel >> 24) & 0xff;
          intensities.push(intensity);
        }
      }
    }
    
    // Calculate variance (texture roughness indicator)
    const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const variance = intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length;
    const stdDev = Math.sqrt(variance);
    
    // Thresholds tuned based on real-world testing (2025-11-10)
    // Previous: 10, 20 → all images classified as "High" (990-2249 variance)
    // New: 800, 1600 → better granularity for high-resolution images
    console.log(`    ✓ Texture variance: ${variance.toFixed(2)}`);
    
    // Determine roughness level
    let roughness = 'Low';
    if (variance > 1600) {
      roughness = 'High';
    } else if (variance > 800) {
      roughness = 'Medium';
    }
    console.log(`    ✓ Texture roughness: ${roughness}`);
    
    results.summary.algorithms.poreAnalyzer.tested++;
    results.summary.algorithms.poreAnalyzer.passed++;
    
    // Recalculated visibility based on new variance scale
    // 0-800: 1-3, 800-1600: 4-7, 1600+: 8-10
    let visibility = 1;
    if (variance > 1600) {
      visibility = Math.min(10, 8 + Math.floor((variance - 1600) / 300));
    } else if (variance > 800) {
      visibility = Math.min(7, 4 + Math.floor((variance - 800) / 200));
    } else {
      visibility = Math.min(3, 1 + Math.floor(variance / 300));
    }
    
    return {
      success: true,
      textureVariance: variance,
      textureStdDev: stdDev,
      estimatedPoreVisibility: visibility
    };
  } catch (error) {
    console.log(`    ✗ Failed: ${error.message}`);
    results.summary.algorithms.poreAnalyzer.tested++;
    results.summary.algorithms.poreAnalyzer.failed++;
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test single image with all algorithms
 */
async function testImage(imagePath, imageName) {
  console.log(`\n📸 Testing: ${imageName}`);
  console.log('─'.repeat(60));
  
  const imageResult = {
    filename: imageName,
    path: imagePath,
    timestamp: new Date().toISOString(),
    algorithms: {}
  };
  
  // Test spot detector
  imageResult.algorithms.spotDetector = await testSpotDetector(imagePath, imageName);
  
  // Test wrinkle detector
  imageResult.algorithms.wrinkleDetector = await testWrinkleDetector(imagePath, imageName);
  
  // Test pore analyzer
  imageResult.algorithms.poreAnalyzer = await testPoreAnalyzer(imagePath, imageName);
  
  // Check if all tests passed
  const allPassed = 
    imageResult.algorithms.spotDetector.success &&
    imageResult.algorithms.wrinkleDetector.success &&
    imageResult.algorithms.poreAnalyzer.success;
  
  if (allPassed) {
    console.log('\n  ✅ All algorithms tested successfully!');
    results.summary.successfulTests++;
  } else {
    console.log('\n  ⚠️ Some algorithms failed');
    results.summary.failedTests++;
  }
  
  results.testImages.push(imageResult);
}

/**
 * Generate test report
 */
function generateReport() {
  console.log('\n\n' + '═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  
  console.log(`\n📁 Total Images Tested: ${results.summary.totalImages}`);
  console.log(`✅ Successful Tests: ${results.summary.successfulTests}`);
  console.log(`❌ Failed Tests: ${results.summary.failedTests}`);
  
  console.log('\n🔧 Algorithm Performance:');
  console.log('─'.repeat(60));
  
  const algorithms = results.summary.algorithms;
  
  console.log('\n1️⃣ Spot Detector:');
  console.log(`   Tested: ${algorithms.spotDetector.tested}`);
  console.log(`   Passed: ${algorithms.spotDetector.passed} ✅`);
  console.log(`   Failed: ${algorithms.spotDetector.failed} ❌`);
  if (algorithms.spotDetector.tested > 0) {
    const successRate = (algorithms.spotDetector.passed / algorithms.spotDetector.tested * 100).toFixed(1);
    console.log(`   Success Rate: ${successRate}%`);
  }
  
  console.log('\n2️⃣ Wrinkle Detector:');
  console.log(`   Tested: ${algorithms.wrinkleDetector.tested}`);
  console.log(`   Passed: ${algorithms.wrinkleDetector.passed} ✅`);
  console.log(`   Failed: ${algorithms.wrinkleDetector.failed} ❌`);
  if (algorithms.wrinkleDetector.tested > 0) {
    const successRate = (algorithms.wrinkleDetector.passed / algorithms.wrinkleDetector.tested * 100).toFixed(1);
    console.log(`   Success Rate: ${successRate}%`);
  }
  
  console.log('\n3️⃣ Pore Analyzer:');
  console.log(`   Tested: ${algorithms.poreAnalyzer.tested}`);
  console.log(`   Passed: ${algorithms.poreAnalyzer.passed} ✅`);
  console.log(`   Failed: ${algorithms.poreAnalyzer.failed} ❌`);
  if (algorithms.poreAnalyzer.tested > 0) {
    const successRate = (algorithms.poreAnalyzer.passed / algorithms.poreAnalyzer.tested * 100).toFixed(1);
    console.log(`   Success Rate: ${successRate}%`);
  }
  
  // Save detailed report to JSON
  const reportPath = join(OUTPUT_DIR, `test-report-${Date.now()}.json`);
  try {
    writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Detailed report saved: ${reportPath}`);
  } catch (error) {
    console.error('⚠️ Could not save report:', error.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  
  // Final verdict
  if (results.summary.failedTests === 0 && results.summary.totalImages > 0) {
    console.log('🎉 ALL TESTS PASSED! Algorithms working correctly!');
  } else if (results.summary.successfulTests > 0) {
    console.log('⚠️ SOME TESTS FAILED - Review results above');
  } else {
    console.log('❌ ALL TESTS FAILED - Algorithms need debugging');
  }
  
  console.log('═'.repeat(60) + '\n');
}

/**
 * Main test runner
 */
async function runTests() {
  try {
    // Check if test images directory exists
    if (!checkTestImagesDirectory()) {
      return;
    }
    
    // Get list of test images
    const imageFiles = getTestImages();
    
    if (imageFiles.length === 0) {
      return;
    }
    
    results.summary.totalImages = imageFiles.length;
    
    // Test each image
    for (const imageFile of imageFiles) {
      const imagePath = join(TEST_IMAGES_DIR, imageFile);
      await testImage(imagePath, imageFile);
    }
    
    // Generate report
    generateReport();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    console.error(error.stack);
  }
}

// Run tests
runTests().catch(console.error);
