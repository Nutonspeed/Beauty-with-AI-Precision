import http from 'node:http';

export type BroadcastFilter = {
  userIds?: string[];
  clinicIds?: string[];
  roles?: string[];
  channels?: string[];
};

export type BroadcastMessage = {
  type: string;
  data?: unknown;
};

function postJson(path: string, payload: unknown): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const WS_PORT = Number.parseInt(process.env.WS_PORT || '3001', 10);
    const WS_ADMIN_SECRET = process.env.WS_ADMIN_SECRET || '';
    if (!WS_ADMIN_SECRET) return reject(new Error('WS_ADMIN_SECRET is not set'));
    const json = JSON.stringify(payload);

    const req = http.request(
      {
        host: 'localhost',
        port: WS_PORT,
        path,
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
        res.on('end', () => resolve({ status: res.statusCode || 0, body: bodyStr }));
      }
    );

    req.on('error', reject);
    req.write(json);
    req.end();
  });
}

export async function broadcast(message: BroadcastMessage, filter?: BroadcastFilter) {
  const { status, body } = await postJson('/broadcast', { message, filter });
  if (status < 200 || status >= 300) throw new Error(`Broadcast failed (${status}): ${body}`);
  return true;
}

export async function broadcastAnnouncement(text: string, channels: string[] = ['system:announcements']) {
  return broadcast({ type: 'ANNOUNCEMENT', data: { message: text, at: new Date().toISOString() } }, { channels });
}

export async function broadcastToClinic(type: string, data: unknown, clinicId: string, channels?: string[]) {
  return broadcast({ type, data }, { clinicIds: [clinicId], channels });
}

export async function broadcastToUsers(type: string, data: unknown, userIds: string[], channels?: string[]) {
  return broadcast({ type, data }, { userIds, channels });
}
