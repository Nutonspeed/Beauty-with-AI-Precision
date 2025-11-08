#!/usr/bin/env node

import http from 'node:http';
import dotenv from 'dotenv';

dotenv.config();

// Simple CLI args parsing
const args = process.argv.slice(2);
let message = 'Demo announcement from ws-broadcast.ts';
let type = 'ANNOUNCEMENT';
let channels: string[] | undefined = ['system:announcements'];

let idx = 0;
while (idx < args.length) {
  const a = args[idx];
  if (a === '--message' && args[idx + 1]) { message = args[idx + 1]; idx += 2; continue; }
  if (a === '--type' && args[idx + 1]) { type = args[idx + 1]; idx += 2; continue; }
  if (a === '--channels' && args[idx + 1]) { channels = args[idx + 1].split(','); idx += 2; continue; }
  if (a === '--no-channels') { channels = undefined; idx += 1; continue; }
  idx += 1;
}

const WS_PORT = Number.parseInt(process.env.WS_PORT || '3001', 10);
const WS_ADMIN_SECRET = process.env.WS_ADMIN_SECRET || '';

if (!WS_ADMIN_SECRET) {
  console.error('WS_ADMIN_SECRET is not set. Aborting.');
  process.exit(1);
}

const payload = {
  message: { type, data: { message, at: new Date().toISOString() } },
  filter: channels ? { channels } : undefined,
};

const json = JSON.stringify(payload);

const req = http.request(
  {
    host: 'localhost',
    port: WS_PORT,
    path: '/broadcast',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json),
      'x-ws-admin-secret': WS_ADMIN_SECRET,
    },
  },
  (res) => {
    let bodyStr = '';
    res.on('data', (chunk) => {
      if (typeof chunk === 'string') bodyStr += chunk;
      else if (chunk instanceof Uint8Array) bodyStr += Buffer.from(chunk).toString('utf8');
    });
    res.on('end', () => {
      console.log('Response', res.statusCode, bodyStr || '');
      process.exit(res.statusCode && res.statusCode >= 200 && res.statusCode < 300 ? 0 : 1);
    });
  }
);

req.on('error', (err) => {
  console.error('Broadcast request failed:', err);
  process.exit(1);
});

req.write(json);
req.end();
