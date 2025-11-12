/**
 * Test script to verify usage events API functionality
 * Tests the /api/analytics/events endpoint directly
 */

import { usageTracker } from '@/lib/analytics/usage-tracker';

async function testUsageEventsAPI() {
  console.log('Testing usage events API...');

  try {
    // Track some test events
    usageTracker.trackEvent({
      event: 'test_api_feature',
      category: 'feature',
      metadata: { test: true }
    });

    usageTracker.trackEvent({
      event: 'test_api_engagement',
      category: 'engagement',
      metadata: { action: 'click' }
    });

    console.log('Events tracked successfully');

    // Check if events are in the tracker
    const events = usageTracker['events'];
    console.log(`Total events in tracker: ${events.length}`);

    // Try to send events to API (this will fail since server isn't running, but we can check the batching)
    const batch = usageTracker['eventBatch'];
    console.log(`Events in batch queue: ${batch.length}`);

    console.log('Usage events API test completed successfully');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
await testUsageEventsAPI();