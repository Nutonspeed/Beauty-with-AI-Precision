import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { stripe, isStripeConfigured } from "@/lib/stripe/client"

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured) {
      return NextResponse.json(
        { error: "Payment system is not configured. Please contact support." },
        { status: 503 }
      )
    }

    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, currency = "thb", description } = body

    // Create payment intent
    const paymentIntent = await stripe!.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description,
      metadata: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json(
      { error: "Failed to create payment intent", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
