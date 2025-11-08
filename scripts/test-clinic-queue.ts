#!/usr/bin/env tsx
/**
 * Script to test clinic queue realtime updates
 * Usage: pnpm tsx scripts/test-clinic-queue.ts <clinicId>
 * Example: pnpm tsx scripts/test-clinic-queue.ts clinic-123
 */

const clinicId = process.argv[2] || 'clinic-123';
const WS_PORT = process.env.WS_PORT || '3001';
const WS_ADMIN_SECRET = process.env.WS_ADMIN_SECRET || 'supersecret';

const channel = `clinic:${clinicId}:queue`;

const testMessages = [
  {
    type: 'QUEUE_UPDATE',
    data: {
      queue: [
        { id: 'q1', patientName: 'John Doe', service: 'Consultation', waitTime: 15, status: 'waiting' },
        { id: 'q2', patientName: 'Jane Smith', service: 'X-Ray', waitTime: 30, status: 'waiting' },
      ]
    }
  },
  {
    type: 'QUEUE_ADD',
    data: { id: 'q3', patientName: 'Bob Johnson', service: 'Blood Test', waitTime: 5, status: 'waiting' }
  },
  {
    type: 'QUEUE_UPDATE',
    data: {
      queue: [
        { id: 'q1', patientName: 'John Doe', service: 'Consultation', waitTime: 10, status: 'in-progress' },
        { id: 'q2', patientName: 'Jane Smith', service: 'X-Ray', waitTime: 25, status: 'waiting' },
        { id: 'q3', patientName: 'Bob Johnson', service: 'Blood Test', waitTime: 5, status: 'waiting' },
      ]
    }
  },
  {
    type: 'QUEUE_REMOVE',
    data: { id: 'q1' }
  }
];

async function sendBroadcast(message: any) {
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
  console.log(`✅ Sent ${message.type} to ${channel}:`, result);
}

async function main() {
  console.log(`🧪 Testing clinic queue updates for: ${channel}\n`);

  for (const [index, message] of testMessages.entries()) {
    console.log(`\n📤 [${index + 1}/${testMessages.length}] Sending ${message.type}...`);
    await sendBroadcast(message);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s between messages
  }

  console.log('\n✨ Test sequence completed!');
  console.log(`\n💡 Visit: http://localhost:3000/clinic/${clinicId}/queue to see realtime updates`);
}

main().catch(console.error);
