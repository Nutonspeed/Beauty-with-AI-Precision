#!/usr/bin/env node

import dotenv from 'dotenv';
import { WebSocket } from 'ws';
import http from 'node:http';

dotenv.config();

const NEXT_PORT = Number.parseInt(process.env.NEXT_DEV_PORT || '3013', 10);

function get(path: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: 'localhost', port: NEXT_PORT, path, method: 'GET' }, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        if (typeof chunk === 'string') body += chunk; else if (chunk instanceof Uint8Array) body += Buffer.from(chunk).toString('utf8');
      });
      res.on('end', () => resolve({ status: res.statusCode || 0, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

try {
    const auth = await get('/api/ws/auth');
    if (auth.status === 401) {
      console.error('WS e2e smoke: Unauthorized. In dev, set WS_TEST_USER_ID or login in browser.');
      process.exit(2);
    }
    if (auth.status < 200 || auth.status >= 300) {
      console.error(`WS e2e smoke: auth failed status=${auth.status} body=${auth.body}`);
      process.exit(1);
    }
    const cfg = JSON.parse(auth.body);
    const wsUrl = new URL(cfg.wsUrl);
    wsUrl.searchParams.set('token', cfg.token);

    const ws = new WebSocket(wsUrl.toString());

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout opening WS')), 5000);
      ws.on('open', () => { clearTimeout(timer); resolve(); });
      ws.on('error', (e) => { clearTimeout(timer); reject(e as Error); });
    });

    // Send ping and wait for pong
    ws.send(JSON.stringify({ type: 'PING' }));

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout waiting for PONG')), 5000);
      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg?.type === 'PONG') { clearTimeout(timer); resolve(); }
        } catch {}
      });
      ws.on('error', (e) => { clearTimeout(timer); reject(e as Error); });
    });

    ws.close(1000, 'done');
    console.log('WS e2e smoke: PASS');
    process.exit(0);
} catch (e) {
  console.error('WS e2e smoke: FAIL', e);
  process.exit(1);
}
