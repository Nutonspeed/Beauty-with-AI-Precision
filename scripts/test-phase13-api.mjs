/**
 * Phase 13 API Testing Script
 * Tests Analysis and User Profile API endpoints
 */

const BASE_URL = 'http://localhost:3000'

// Mock session for testing (in production this would be from NextAuth)
const testUserId = 'test-user-123'

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()
    return {
      status: response.status,
      ok: response.ok,
      data,
    }
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, error.message)
    return {
      status: 0,
      ok: false,
      data: { error: error.message },
    }
  }
}

// Test data
const sampleAnalysis = {
  imageUrl: 'https://example.com/test-image.jpg',
  thumbnailUrl: 'https://example.com/test-thumb.jpg',
  concerns: [
    {
      type: 'wrinkle',
      bbox: { x: 100, y: 150, width: 50, height: 30 },
      confidence: 0.85,
      severity: 'moderate',
    },
    {
      type: 'pigmentation',
      bbox: { x: 200, y: 180, width: 40, height: 25 },
      confidence: 0.72,
      severity: 'mild',
    },
  ],
  metrics: {
    totalTime: 1500,
    inferenceTime: 180,
    detectionCount: 2,
  },
  aiVersion: 'v1.0.0-phase12',
}

const sampleProfile = {
  skinType: 'combination',
  primaryConcerns: ['wrinkle', 'pigmentation'],
  allergies: 'None',
  preferences: {
    language: 'th',
    notifications: true,
    theme: 'light',
  },
}

// Test functions
async function testSaveAnalysis() {
  console.log('\n📝 Testing POST /api/analysis/save...')
  
  const result = await apiCall('/api/analysis/save', {
    method: 'POST',
    body: JSON.stringify(sampleAnalysis),
  })

  if (result.ok && result.data.success) {
    console.log('✅ Analysis saved successfully!')
    console.log(`   Analysis ID: ${result.data.analysisId}`)
    return result.data.analysisId
  } else {
    console.log(`❌ Failed: ${result.data.error || 'Unknown error'}`)
    console.log(`   Status: ${result.status}`)
    return null
  }
}

async function testGetAnalysis(analysisId) {
  if (!analysisId) {
    console.log('\n⏭️  Skipping GET /api/analysis/[id] (no analysis ID)')
    return
  }

  console.log(`\n📖 Testing GET /api/analysis/${analysisId}...`)
  
  const result = await apiCall(`/api/analysis/${analysisId}`)

  if (result.ok && result.data.success) {
    console.log('✅ Analysis retrieved successfully!')
    console.log(`   Concerns: ${result.data.data.concerns.length}`)
    console.log(`   AI Version: ${result.data.data.aiVersion}`)
  } else {
    console.log(`❌ Failed: ${result.data.error || 'Unknown error'}`)
  }
}

async function testGetAnalysisHistory(userId) {
  console.log(`\n📚 Testing GET /api/analysis/history/${userId}...`)
  
  const result = await apiCall(`/api/analysis/history/${userId}?limit=5`)

  if (result.ok && result.data.success) {
    console.log('✅ Analysis history retrieved successfully!')
    console.log(`   Total analyses: ${result.data.pagination.total}`)
    console.log(`   Returned: ${result.data.data.length} items`)
  } else {
    console.log(`❌ Failed: ${result.data.error || 'Unknown error'}`)
  }
}

async function testGetProfile() {
  console.log('\n👤 Testing GET /api/user/profile...')
  
  const result = await apiCall('/api/user/profile')

  if (result.ok && result.data.success) {
    console.log('✅ Profile retrieved successfully!')
    console.log(`   Skin Type: ${result.data.profile.skinType || 'Not set'}`)
    console.log(`   Analysis Count: ${result.data.analysisCount || 0}`)
  } else {
    console.log(`❌ Failed: ${result.data.error || 'Unknown error'}`)
  }
}

async function testUpdateProfile() {
  console.log('\n✏️  Testing PATCH /api/user/profile...')
  
  const result = await apiCall('/api/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(sampleProfile),
  })

  if (result.ok && result.data.success) {
    console.log('✅ Profile updated successfully!')
    console.log(`   Skin Type: ${result.data.data.skinType}`)
    console.log(`   Concerns: ${result.data.data.primaryConcerns.join(', ')}`)
  } else {
    console.log(`❌ Failed: ${result.data.error || 'Unknown error'}`)
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Phase 13 API Testing')
  console.log('=' .repeat(50))
  console.log('Note: These tests require authentication.')
  console.log('If tests fail with 401, please log in at /auth/login first.')
  console.log('=' .repeat(50))

  try {
    // Test Analysis APIs
    const analysisId = await testSaveAnalysis()
    await testGetAnalysis(analysisId)
    await testGetAnalysisHistory(testUserId)

    // Test Profile APIs
    await testGetProfile()
    await testUpdateProfile()

    console.log('\n✨ Testing complete!')
  } catch (error) {
    console.error('\n💥 Test suite error:', error)
  }
}

// Run tests
runTests()
