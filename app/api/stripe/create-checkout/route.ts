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
    const { priceId, mode = "payment", successUrl, cancelUrl } = body

    // Create Stripe checkout session
    const checkoutSession = await stripe!.checkout.sessions.create({
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as "payment" | "subscription",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancelled`,
      metadata: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, sessionId: checkoutSession.id, url: checkoutSession.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
