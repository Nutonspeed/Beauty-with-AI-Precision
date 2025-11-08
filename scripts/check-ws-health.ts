#!/usr/bin/env node

import http from 'node:http';
import dotenv from 'dotenv';

dotenv.config();

const WS_PORT = Number.parseInt(process.env.WS_PORT || '3001', 10);

const req = http.request({ host: 'localhost', port: WS_PORT, path: '/health', method: 'GET' }, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    if (typeof chunk === 'string') body += chunk;
    else if (chunk instanceof Uint8Array) body += Buffer.from(chunk).toString('utf8');
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(body || '{}');
      if (json.ok === true) {
        console.log(`WS health OK, clients=${json.clients}`);
        process.exit(0);
      }
      console.error('WS health not OK:', body);
      process.exit(1);
    } catch (e) {
      console.error('Failed to parse WS health response:', e);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('WS health request error:', err);
  process.exit(1);
});

req.end();
