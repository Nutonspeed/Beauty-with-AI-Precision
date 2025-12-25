import { type NextRequest, NextResponse } from "next/server"
import { stripe, isStripeConfigured } from "@/lib/stripe/client"
import { createServerClient } from "@/lib/supabase/server"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured) {
      return NextResponse.json(
        { error: "Payment system is not configured" },
        { status: 503 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe!.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId || session.client_reference_id
        const clinicId = session.metadata?.clinicId

        if (!userId) {
          console.error("No user ID in session metadata")
          break
        }

        // Update user subscription status
        if (session.mode === "subscription") {
          // Update user record
          await supabase
            .from("users")
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)

          // Update clinic subscription if clinicId provided
          if (clinicId) {
            // Get subscription plan from metadata or default to professional
            const planName = session.metadata?.planName || 'professional'
            
            // Find the plan in subscription_plans table
            const { data: plan } = await supabase
              .from("subscription_plans")
              .select("id")
              .ilike("name", `%${planName}%`)
              .single()

            if (plan) {
              // Update or create clinic_subscriptions record
              await supabase
                .from("clinic_subscriptions")
                .upsert({
                  clinic_id: clinicId,
                  plan_id: plan.id,
                  status: "active",
                  current_period_start: new Date().toISOString(),
                  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                  updated_at: new Date().toISOString(),
                })
                .eq("clinic_id", clinicId)
            }
          }

          console.log(`User ${userId} upgraded to premium`)
        }

        // Record payment
        await supabase.from("payments").insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          amount: session.amount_total || 0,
          currency: session.currency || "thb",
          status: "completed",
          payment_type: session.mode === "subscription" ? "subscription" : "one_time",
        })

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Downgrade user to free tier
        await supabase
          .from("users")
          .update({
            role: "customer",
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)

        console.log(`Subscription cancelled for customer ${customerId}`)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Payment succeeded for invoice ${invoice.id}`)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Payment failed for invoice ${invoice.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
