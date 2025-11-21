import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/payment/stripe-server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, bookingId, description } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment intent
    const result = await createPaymentIntent({
      amount,
      metadata: {
        bookingId: bookingId || '',
        userId: user.id,
      },
      description: description || 'Booking payment',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create payment intent' },
        { status: 500 }
      );
    }

    // Log the payment intent creation
    await supabase.from('payment_logs').insert({
      user_id: user.id,
      booking_id: bookingId,
      payment_intent_id: result.paymentIntentId,
      amount,
      status: 'created',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
