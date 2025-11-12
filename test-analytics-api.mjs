/**
 * Test script for analytics events API
 * Tests the POST /api/analytics/events endpoint
 */

const testEvents = [
  {
    event: 'page_view',
    category: 'engagement',
    userId: 'test-user-123',
    tenantId: 'clinic-1',
    metadata: { page: '/dashboard', duration: 120 },
    timestamp: new Date().toISOString(),
    sessionId: 'session-abc'
  },
  {
    event: 'feature_used',
    category: 'feature',
    userId: 'test-user-123',
    metadata: { feature: 'skin_analysis', result: 'success' },
    timestamp: new Date().toISOString()
  }
];

async function testAnalyticsAPI() {
  try {
    console.log('Testing analytics events API...');
    console.log('Sending events:', JSON.stringify(testEvents, null, 2));

    const response = await fetch('http://localhost:3000/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvents)
    });

    const result = await response.json();

    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ API test successful!');
    } else {
      console.log('❌ API test failed!');
    }

  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testAnalyticsAPI();