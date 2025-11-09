/**
 * Test Script: Multi-Mode Analysis API Workflow
 * 
 * Tests the complete workflow:
 * 1. Upload image to Next.js API
 * 2. API calls Python AI service
 * 3. AI generates 8-mode analysis
 * 4. API generates visualization
 * 5. API uploads to Supabase Storage
 * 6. API saves to database
 * 7. Returns comprehensive results
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/analysis/multi-mode';
const TEST_IMAGE = path.join(__dirname, 'ai-service', 'test_images', 'face_sample.jpg');

async function testWorkflow() {
  console.log('🧪 Testing Multi-Mode Analysis API Workflow');
  console.log('==========================================\n');

  // Check if test image exists
  if (!fs.existsSync(TEST_IMAGE)) {
    console.error('❌ Test image not found:', TEST_IMAGE);
    return;
  }

  console.log('✅ Test image found:', TEST_IMAGE);
  console.log('📁 File size:', (fs.statSync(TEST_IMAGE).size / 1024).toFixed(2), 'KB\n');

  // Prepare form data
  const formData = new FormData();
  formData.append('image', fs.createReadStream(TEST_IMAGE), {
    filename: 'face_sample.jpg',
    contentType: 'image/jpeg',
  });
  formData.append('is_baseline', 'true');
  formData.append('notes', 'Test analysis from automated workflow script');

  console.log('📤 Sending POST request to:', API_URL);
  console.log('⏱️  Starting analysis...\n');

  const startTime = Date.now();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        // Note: In real test, you need to add authentication cookie/header
        // For now, testing without auth (will fail with 401 if auth is required)
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Response received in ${elapsed} seconds\n`);

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ HTTP ${response.status}:`, error);
      
      if (response.status === 401) {
        console.log('\n💡 Note: This API requires authentication.');
        console.log('   You need to be logged in via Supabase Auth to test this endpoint.');
        console.log('   Consider testing via:');
        console.log('   1. Browser (with logged-in session)');
        console.log('   2. Postman/Thunder Client (with auth cookie)');
        console.log('   3. E2E test with authentication setup');
      }
      return;
    }

    const result = await response.json();

    console.log('✅ SUCCESS! Analysis completed\n');
    console.log('📊 Results:');
    console.log('─────────────────────────────────────');
    console.log('ID:', result.analysis.id);
    console.log('Overall Score:', result.analysis.overall_score?.toFixed(1) || 'N/A');
    console.log('Skin Health Grade:', result.analysis.skin_health_grade || 'N/A');
    console.log('Processing Time:', result.analysis.processing_time_ms, 'ms');
    console.log('\n🔢 Individual Scores:');
    Object.entries(result.analysis.scores).forEach(([mode, score]) => {
      console.log(`  ${mode.padEnd(15)}: ${score.toFixed(1)}`);
    });
    console.log('\n📈 Detection Counts:');
    Object.entries(result.analysis.counts).forEach(([mode, count]) => {
      console.log(`  ${mode.padEnd(20)}: ${count}`);
    });
    console.log('\n⚠️  Severity Levels:');
    Object.entries(result.analysis.severity).forEach(([mode, severity]) => {
      const emoji = severity === 'low' ? '🟢' : severity === 'moderate' ? '🟡' : severity === 'high' ? '🟠' : '🔴';
      console.log(`  ${emoji} ${mode.padEnd(15)}: ${severity}`);
    });
    console.log('\n🖼️  Image URLs:');
    console.log('  Original:', result.analysis.image_url);
    console.log('  Visualization:', result.analysis.visualization_url || 'N/A');
    
    if (result.analysis.recommendations) {
      console.log('\n💡 Recommendations:');
      if (result.analysis.recommendations.treatments?.length) {
        console.log('  Treatments:', result.analysis.recommendations.treatments.length, 'recommended');
      }
      if (result.analysis.recommendations.products?.length) {
        console.log('  Products:', result.analysis.recommendations.products.length, 'recommended');
      }
      if (result.analysis.recommendations.lifestyle?.length) {
        console.log('  Lifestyle:', result.analysis.recommendations.lifestyle.length, 'tips');
      }
    }

    console.log('\n─────────────────────────────────────');
    console.log('✅ Full workflow test completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    console.error(error);
  }
}

// Run test
testWorkflow().catch(console.error);
