'use server'

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'node:crypto';

function signToken(userId: string, timestamp: number) {
  const secret = process.env.WS_TOKEN_SECRET || 'your-secret-key';
  const data = `${userId}:${timestamp}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export async function GET() {
  try {
    let userId: string | null = null;
    const user = await getCurrentUser();
    if (user?.id) {
      userId = user.id;
    } else if (process.env.NODE_ENV !== 'production' && process.env.WS_TEST_USER_ID) {
      // Dev-only override to enable smoke tests without interactive login
      userId = process.env.WS_TEST_USER_ID;
      console.warn('[ws-auth] Using WS_TEST_USER_ID override in non-production environment');
    }
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wsBase = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:${process.env.WS_PORT || '3001'}`;
    const timestamp = Date.now();
    const signature = signToken(userId, timestamp);
    const payload = { userId, timestamp, signature };
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');

    return NextResponse.json({ wsUrl: wsBase, token, userId });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
