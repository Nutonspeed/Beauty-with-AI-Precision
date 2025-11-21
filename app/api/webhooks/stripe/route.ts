import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/payment/stripe-server';
import { createClient } from '@/lib/supabase/server';
import { sendBookingConfirmationEmail } from '@/lib/notifications/email-service';
import { sendBookingConfirmationSMS, sendPaymentSuccessSMS } from '@/lib/notifications/sms-service';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);

        // Update booking status
        const bookingId = paymentIntent.metadata.bookingId;
        if (bookingId) {
          await supabase
            .from('bookings')
            .update({
              payment_status: 'paid',
              payment_intent_id: paymentIntent.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

          // Log payment success
          await supabase.from('payment_logs').insert({
            booking_id: bookingId,
            payment_intent_id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            status: 'succeeded',
            created_at: new Date().toISOString(),
          });

          // Get booking details for notifications
          const { data: booking } = await supabase
            .from('bookings')
            .select('*, customer:customer_id(*), clinic:clinic_id(*)')
            .eq('id', bookingId)
            .single();

          if (booking && booking.customer) {
            // Send confirmation email
            if (booking.customer.email) {
              await sendBookingConfirmationEmail({
                to: booking.customer.email,
                customerName: booking.customer.full_name || booking.customer.email,
                bookingDate: new Date(booking.booking_date).toLocaleDateString('th-TH'),
                bookingTime: booking.booking_time || 'TBD',
                treatment: booking.treatment_type || 'Treatment',
                clinicName: booking.clinic?.name || 'Beauty AI Clinic',
                clinicAddress: booking.clinic?.address,
                bookingId: booking.id,
              });
            }

            // Send confirmation SMS
            if (booking.customer.phone) {
              await sendBookingConfirmationSMS({
                to: booking.customer.phone,
                customerName: booking.customer.full_name || 'Customer',
                bookingDate: new Date(booking.booking_date).toLocaleDateString('th-TH'),
                bookingTime: booking.booking_time || 'TBD',
                treatment: booking.treatment_type || 'Treatment',
                clinicName: booking.clinic?.name || 'Beauty AI Clinic',
                bookingId: booking.id,
              });

              // Send payment success SMS
              await sendPaymentSuccessSMS({
                to: booking.customer.phone,
                amount: paymentIntent.amount / 100,
                bookingId: booking.id,
              });
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.id);

        const bookingId = paymentIntent.metadata.bookingId;
        if (bookingId) {
          await supabase
            .from('bookings')
            .update({
              payment_status: 'failed',
              payment_intent_id: paymentIntent.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

          await supabase.from('payment_logs').insert({
            booking_id: bookingId,
            payment_intent_id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            status: 'failed',
            error_message: paymentIntent.last_payment_error?.message,
            created_at: new Date().toISOString(),
          });
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment canceled:', paymentIntent.id);

        const bookingId = paymentIntent.metadata.bookingId;
        if (bookingId) {
          await supabase
            .from('bookings')
            .update({
              payment_status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

          await supabase.from('payment_logs').insert({
            booking_id: bookingId,
            payment_intent_id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            status: 'canceled',
            created_at: new Date().toISOString(),
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
