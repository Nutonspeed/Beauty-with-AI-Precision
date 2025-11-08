#!/usr/bin/env node

/**
 * Test Hugging Face API connectivity
 * This script tests the Hugging Face Inference API endpoints used in the analyzer
 */

// Load token from environment variable
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN || '';
const BASE_URL = 'https://api-inference.huggingface.co/models';

if (!HUGGINGFACE_TOKEN) {
  console.error('❌ Error: HUGGINGFACE_TOKEN environment variable not set');
  console.log('💡 Please set HUGGINGFACE_TOKEN in your .env.local file');
  process.exit(1);
}

// Test data - minimal base64 image
const TEST_IMAGE_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/vAA=';

async function makeAPIRequest(model, inputs) {
  const url = `${BASE_URL}/${model}`;
  console.log(`🔄 Testing ${model}...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ ${model}: ${response.status} - ${error}`);
      return false;
    }

    const result = await response.json();
    console.log(`✅ ${model}: Success - ${JSON.stringify(result).substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.log(`❌ ${model}: ${error.message}`);
    return false;
  }
}

async function testHuggingFaceConnectivity() {
  console.log('🚀 Testing Hugging Face API Connectivity\n');

  const tests = [
    {
      model: 'facebook/dino-vits16',
      inputs: {
        image: TEST_IMAGE_BASE64,
        parameters: { pool: true }
      },
      description: 'DINOv2 Feature Extraction'
    },
    {
      model: 'facebook/sam-vit-base',
      inputs: {
        image: TEST_IMAGE_BASE64,
        parameters: {
          points_per_side: 32,
          pred_iou_thresh: 0.8,
          stability_score_thresh: 0.9,
        }
      },
      description: 'SAM Segmentation'
    },
    {
      model: 'openai/clip-vit-base-patch32',
      inputs: {
        image: TEST_IMAGE_BASE64,
        candidate_labels: ['clear skin', 'acne', 'wrinkles']
      },
      description: 'CLIP Zero-shot Classification'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n📋 Testing: ${test.description}`);
    const success = await makeAPIRequest(test.model, test.inputs);
    if (success) {
      passed++;
    } else {
      failed++;
    }

    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All Hugging Face API endpoints are accessible!');
    process.exit(0);
  } else {
    console.log('⚠️  Some API endpoints failed. Check token and network connectivity.');
    process.exit(1);
  }
}

// Run the test
testHuggingFaceConnectivity().catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
