import Stripe from "stripe"

// Only create Stripe instance if we have a real key
let stripe: Stripe | null = null

if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_dummy_key_for_development") {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
    typescript: true,
  })
}

export { stripe }
export const isStripeConfigured = !!stripe

export const STRIPE_PRICES = {
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "price_premium_monthly",
  premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || "price_premium_yearly",
  single_analysis: process.env.STRIPE_PRICE_SINGLE_ANALYSIS || "price_single_analysis",
  treatment_booking: process.env.STRIPE_PRICE_TREATMENT_BOOKING || "price_treatment_booking",
}
