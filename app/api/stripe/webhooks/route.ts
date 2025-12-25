/**
 * Stripe Webhook Endpoint
 * Handles real-time payment events from Stripe
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { StripeService } from '@/lib/payment/stripe-service'
import { createClient } from '@/lib/supabase/server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature and process event
    await StripeService.handleWebhook(body, signature, webhookSecret)

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Manual webhook testing endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
