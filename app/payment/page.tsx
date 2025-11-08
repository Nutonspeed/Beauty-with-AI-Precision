"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Zap, Crown } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "฿0",
    period: "forever",
    description: "Perfect for trying out our AI analysis",
    features: [
      "1 AI skin analysis per month",
      "Basic treatment recommendations",
      "Email support",
      "Access to AR simulator",
    ],
    cta: "Current Plan",
    disabled: true,
    icon: Sparkles,
  },
  {
    name: "Premium",
    price: "฿299",
    period: "per month",
    description: "Unlimited access to all features",
    features: [
      "Unlimited AI skin analyses",
      "Advanced treatment recommendations",
      "Priority booking",
      "24/7 chat support",
      "Exclusive discounts on treatments",
      "Progress tracking & history",
    ],
    cta: "Upgrade to Premium",
    priceId: "price_premium_monthly",
    popular: true,
    icon: Crown,
  },
  {
    name: "Premium Yearly",
    price: "฿2,990",
    period: "per year",
    description: "Save 17% with annual billing",
    features: [
      "Everything in Premium",
      "2 months free",
      "Annual health report",
      "Personalized treatment plan",
      "VIP clinic access",
    ],
    cta: "Get Yearly Plan",
    priceId: "price_premium_yearly",
    badge: "Best Value",
    icon: Zap,
  },
]

export default function PaymentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  async function handleSubscribe(priceId: string) {
    setIsLoading(priceId)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          mode: "subscription",
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        alert("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("An error occurred")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-12">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">
              Choose Your Plan
              <br />
              <span className="text-primary">เลือกแพ็กเกจของคุณ</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Unlock unlimited AI-powered skin analysis and exclusive features
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card key={plan.name} className={`relative ${plan.popular ? "border-2 border-primary shadow-lg" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary px-4 py-1">Most Popular</Badge>
                    </div>
                  )}
                  {plan.badge && !plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-green-500 px-4 py-1">{plan.badge}</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground"> / {plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="mb-6 space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={plan.disabled || isLoading === plan.priceId}
                      onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {isLoading === plan.priceId ? "Processing..." : plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include secure payment processing via Stripe. Cancel anytime.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
