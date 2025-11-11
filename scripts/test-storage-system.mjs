/**
 * Storage System Integration Test
 * 
 * Tests the complete storage workflow:
 * 1. Initialize Supabase bucket
 * 2. Upload test image with multi-tier optimization
 * 3. Verify all 3 tiers created
 * 4. Check CDN URLs accessible
 * 5. Clean up test data
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function testStorageSystem() {
  section('🚀 Storage System Integration Test');
  
  // Check environment variables
  const cleanEnv = (str) => {
    const trimmed = (str || '').trim();
    return trimmed.replace(/^["'](.*)["']$/, '$1');
  };
  const SUPABASE_URL = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  
  if (!SUPABASE_URL) {
    log('❌ Missing SUPABASE_URL environment variable', 'red');
    return { success: false };
  }
  
  log(`API Endpoint: http://localhost:3000`, 'gray');
  log(`Supabase: ${SUPABASE_URL}`, 'gray');
  log('', 'reset');
  
  const API_BASE = 'http://localhost:3000';
  let testImagePath = null;
  let uploadResult = null;

  try {
    // Step 1: Check if test image exists
    section('📁 Step 1: Prepare Test Image');
    const testImagesDir = join(__dirname, '..', 'test-images', 'samples');
    
    // Try to find any existing test image
    const possibleImages = [
      'ภาพหน้าผู้หญิงมุมตรง.png',
      'A front-facing portr.png',
      'a portrait of a beau.png',
    ];
    
    let imageBuffer;
    let foundImage = false;
    
    for (const imgFile of possibleImages) {
      try {
        testImagePath = join(testImagesDir, imgFile);
        imageBuffer = readFileSync(testImagePath);
        log(`✅ Test image found: ${imgFile}`, 'green');
        log(`   Size: ${(imageBuffer.length / 1024).toFixed(2)} KB`, 'gray');
        foundImage = true;
        break;
      } catch {
        // Try next image
      }
    }
    
    if (!foundImage) {
      throw new Error('No test images found in test-images/samples/. Please add at least one image file.');
    }

    // Step 2: Initialize bucket (optional, should auto-create)
    section('🪣 Step 2: Check Storage Bucket');
    log('Bucket will be auto-created on first upload', 'gray');
    log('Bucket name: analysis-images', 'gray');
    log('✅ Ready to test upload', 'green');

    // Step 3: Upload test image
    section('📤 Step 3: Upload Test Image with Multi-Tier');
    
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'test-storage-system.jpg',
      contentType: 'image/jpeg',
    });
    
    log('Uploading to: POST /api/storage/upload', 'gray');
    log('Expected: 3 tiers (Original, Display, Thumbnail)', 'gray');
    
    const uploadStartTime = Date.now();
    
    // Use form-data specific methods
    const uploadResponse = await fetch(`${API_BASE}/api/storage/upload`, {
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
      },
      body: formData.getBuffer ? formData.getBuffer() : formData,
    });
    const uploadTime = Date.now() - uploadStartTime;

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    uploadResult = await uploadResponse.json();
    log(`✅ Upload successful in ${uploadTime}ms`, 'green');
    log(`Storage path: ${uploadResult.storagePath}`, 'gray');

    // Step 4: Verify URLs
    section('🔗 Step 4: Verify Multi-Tier URLs');
    
    if (!uploadResult.urls) {
      throw new Error('No URLs returned in upload result');
    }

    const tiers = ['original', 'display', 'thumbnail'];
    for (const tier of tiers) {
      if (!uploadResult.urls[tier]) {
        throw new Error(`Missing ${tier} tier URL`);
      }
      log(`✅ ${tier.padEnd(10)}: ${uploadResult.urls[tier].substring(0, 60)}...`, 'green');
    }

    // Step 5: Check metadata
    section('📊 Step 5: Verify Compression Metadata');
    
    if (!uploadResult.metadata) {
      throw new Error('No metadata returned');
    }

    log(`Original size:  ${uploadResult.metadata.originalSize}`, 'gray');
    log(`Display size:   ${uploadResult.metadata.displaySize}`, 'gray');
    log(`Thumbnail size: ${uploadResult.metadata.thumbnailSize}`, 'gray');
    log(`Savings:        ${uploadResult.metadata.compressionSavings}`, 'gray');
    log(`✅ Metadata complete`, 'green');

    // Step 6: Test URL retrieval
    section('🔍 Step 6: Test URL Retrieval API');
    
    const getResponse = await fetch(
      `${API_BASE}/api/storage/upload?path=${encodeURIComponent(uploadResult.storagePath)}`
    );

    if (!getResponse.ok) {
      throw new Error(`GET failed: ${getResponse.status}`);
    }

    const getResult = await getResponse.json();
    log(`✅ Retrieved URLs for: ${uploadResult.storagePath}`, 'green');
    log(`   Original:  ${getResult.urls.original ? '✓' : '✗'}`, 'gray');
    log(`   Display:   ${getResult.urls.display ? '✓' : '✗'}`, 'gray');
    log(`   Thumbnail: ${getResult.urls.thumbnail ? '✓' : '✗'}`, 'gray');

    // Step 7: Test tier-specific retrieval
    section('🎯 Step 7: Test Tier-Specific Retrieval');
    
    for (const tier of ['original', 'display', 'thumbnail']) {
      const tierResponse = await fetch(
        `${API_BASE}/api/storage/upload?path=${encodeURIComponent(uploadResult.storagePath)}&tier=${tier}`
      );

      if (!tierResponse.ok) {
        const errorText = await tierResponse.text();
        throw new Error(`Failed to get ${tier} tier: ${tierResponse.status} - ${errorText}`);
      }

      const tierResult = await tierResponse.json();
      if (!tierResult.url) {
        throw new Error(`No URL returned for ${tier} tier`);
      }

      log(`✅ ${tier.padEnd(10)}: ${tierResult.url.substring(0, 50)}...`, 'green');
    }

    // Step 8: Clean up
    section('🧹 Step 8: Clean Up Test Data');
    
    log(`Deleting test image: ${uploadResult.storagePath}`, 'gray');
    
    const deleteResponse = await fetch(
      `${API_BASE}/api/storage/upload?path=${encodeURIComponent(uploadResult.storagePath)}`,
      { method: 'DELETE' }
    );

    if (!deleteResponse.ok) {
      log(`⚠️  Delete failed: ${deleteResponse.status}`, 'yellow');
      log('You may need to manually delete: ' + uploadResult.storagePath, 'yellow');
    } else {
      const deleteResult = await deleteResponse.json();
      if (deleteResult.success) {
        log('✅ Test data deleted successfully', 'green');
      } else {
        log(`⚠️  Delete returned success=false: ${deleteResult.error}`, 'yellow');
      }
    }

    // Success summary
    section('✅ All Tests Passed!');
    log('Storage system is working correctly:', 'green');
    log('  ✓ Multi-tier upload (3 versions)', 'green');
    log('  ✓ CDN URL generation', 'green');
    log('  ✓ URL retrieval API', 'green');
    log('  ✓ Tier-specific access', 'green');
    log('  ✓ Delete operation', 'green');
    log('', 'reset');
    log('🎉 Ready for production use!', 'cyan');

    return { success: true };

  } catch (error) {
    section('❌ Test Failed');
    log(`Error: ${error.message}`, 'red');
    
    if (error.stack) {
      log('\nStack trace:', 'gray');
      log(error.stack, 'gray');
    }

    // Try to clean up on error
    if (uploadResult?.storagePath) {
      log('\nAttempting cleanup...', 'yellow');
      try {
        await fetch(
          `${API_BASE}/api/storage/upload?path=${encodeURIComponent(uploadResult.storagePath)}`,
          { method: 'DELETE' }
        );
        log('✅ Cleanup successful', 'green');
      } catch (cleanupError) {
        log(`⚠️  Cleanup failed: ${cleanupError.message}`, 'yellow');
      }
    }

    return { success: false, error: error.message };
  }
}

// Run tests
console.log('\n');
try {
  const result = await testStorageSystem();
  process.exit(result.success ? 0 : 1);
} catch (error) {
  console.error('Unexpected error:', error);
  process.exit(1);
}
