import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

// In-memory store for demo (use database in production)
const subscriptions = new Map<string, {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userId?: string;
  createdAt: number;
}>();

/**
 * POST /api/push-subscriptions
 * Save push notification subscription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subscription = PushSubscriptionSchema.parse(body);

    // TODO: Get user ID from session/auth
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Store subscription
    subscriptions.set(subscription.endpoint, {
      ...subscription,
      userId,
      createdAt: Date.now()
    });

    console.log(`✅ Push subscription saved for user: ${userId}`);
    console.log(`📊 Total subscriptions: ${subscriptions.size}`);

    return NextResponse.json({ 
      success: true,
      message: 'Subscription saved successfully'
    });
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push-subscriptions
 * Remove push notification subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = z.object({ endpoint: z.string() }).parse(body);

    const deleted = subscriptions.delete(endpoint);

    if (deleted) {
      console.log(`✅ Push subscription removed: ${endpoint}`);
      console.log(`📊 Total subscriptions: ${subscriptions.size}`);
    } else {
      console.log(`⚠️ Push subscription not found: ${endpoint}`);
    }

    return NextResponse.json({ 
      success: true,
      message: deleted ? 'Subscription removed' : 'Subscription not found'
    });
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/push-subscriptions
 * Get all push subscriptions (admin only)
 */
export async function GET() {
  // TODO: Add admin authentication

  const subs = Array.from(subscriptions.entries()).map(([endpoint, data]) => ({
    endpoint,
    userId: data.userId,
    createdAt: data.createdAt
  }));

  return NextResponse.json({
    success: true,
    count: subs.length,
    subscriptions: subs
  });
}

/**
 * Get all subscriptions for a user (internal helper)
 */
function getSubscriptionsByUserId(userId: string) {
  return Array.from(subscriptions.values()).filter(
    (sub) => sub.userId === userId
  );
}

/**
 * Get all subscriptions (internal helper)
 */
function getAllSubscriptions() {
  return Array.from(subscriptions.values());
}
