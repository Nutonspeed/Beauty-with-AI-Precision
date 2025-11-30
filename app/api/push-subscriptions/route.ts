import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

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

    // Get user ID from auth session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || request.headers.get('x-user-id') || 'anonymous';

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
  // Check admin authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['super_admin', 'clinic_owner'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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
