#!/usr/bin/env tsx
/**
 * Script to test user notifications
 * Usage: pnpm tsx scripts/test-user-notifications.ts <userId>
 * Example: pnpm tsx scripts/test-user-notifications.ts user-123
 */

const userId = process.argv[2] || 'user-123';
const WS_PORT = process.env.WS_PORT || '3001';
const WS_ADMIN_SECRET = process.env.WS_ADMIN_SECRET || 'supersecret';

const testNotifications = [
  {
    type: 'USER_NOTIFICATION',
    data: {
      id: `notif-${Date.now()}-1`,
      type: 'info',
      message: 'Your appointment is confirmed',
      description: 'Appointment scheduled for tomorrow at 10:00 AM'
    }
  },
  {
    type: 'USER_NOTIFICATION',
    data: {
      id: `notif-${Date.now()}-2`,
      type: 'success',
      message: 'Payment received',
      description: 'Your payment of $150 has been successfully processed'
    }
  },
  {
    type: 'USER_NOTIFICATION',
    data: {
      id: `notif-${Date.now()}-3`,
      type: 'warning',
      message: 'Lab results ready',
      description: 'Your lab results are now available for review'
    }
  }
];

async function sendNotification(message: any, userId: string) {
  const channel = `user:${userId}:notifications`;
  
  const response = await fetch(`http://localhost:${WS_PORT}/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ws-admin-secret': WS_ADMIN_SECRET,
    },
    body: JSON.stringify({
      message,
      filter: { channels: [channel] }
    })
  });

  if (!response.ok) {
    throw new Error(`Broadcast failed: ${response.statusText}`);
  }

  const result = await response.json();
  console.log(`✅ Sent notification to ${channel}:`, result);
}

async function main() {
  console.log(`🔔 Testing user notifications for: user:${userId}:notifications\n`);

  for (const [index, notification] of testNotifications.entries()) {
    console.log(`\n📤 [${index + 1}/${testNotifications.length}] Sending: ${notification.data.message}`);
    await sendNotification(notification, userId);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between notifications
  }

  console.log('\n✨ Test sequence completed!');
  console.log('\n💡 Check your app header for the notification bell icon');
}

main().catch(console.error);
