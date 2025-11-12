"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, CheckCircle2, LineChart, Shield, Sparkles } from "lucide-react"
import RoiMiniCalculator from "@/components/roi/roi-mini-calculator"

export default function SalesNarrativePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-background py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-4 bg-primary/10 text-primary" variant="secondary">For Stakeholders & Partners</Badge>
              <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight md:text-5xl">
                From AI Skin Insights to Measurable Clinic Revenue
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-muted-foreground md:text-lg">
                We connect medical‑grade AI analysis to a clear sales workflow. Clinics convert more, faster, with transparency and compliance.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/demo/skin-analysis">
                    See Interactive Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Outcome Pillars */}
        <section className="py-14">
          <div className="container">
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              <Card className="border-2 border-border/70 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <LineChart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Conversion Uplift</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Narrative‑first proposals + AI insights increase trust and close rate. Typical uplift +10–30% in 3 months.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border/70 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Faster Decisions</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    3–5s analysis with clear next‑best‑action reduces friction. Shorter cycle from consult to purchase.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border/70 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Trust & Compliance</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    PDPA‑ready, encrypted, auditable. Evidence‑based visuals help clinicians and customers align.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ROI Mini Calculator */}
        <section className="border-y border-border/60 bg-background py-12">
          <div className="container">
            <div className="mx-auto mb-6 max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Estimate Impact in 10 Seconds</h2>
              <p className="text-sm text-muted-foreground">Try a quick what‑if based on your leads and average bill.</p>
            </div>
            <div className="mx-auto max-w-5xl">
              <RoiMiniCalculator />
            </div>
          </div>
        </section>

        {/* Proof Points */}
        <section className="py-14">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">What Makes Us Different</h2>
              <ul className="space-y-3">
                {[
                  "Medical‑grade accuracy with rapid analysis (3–5s)",
                  "From analysis → recommendation → close: a complete workflow",
                  "AR visualization to set expectations and reduce doubt",
                  "Multi‑clinic, CRM, and booking integration",
                  "Data security: encryption at rest/in transit; audit logs",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-foreground/80">PDPA‑ready</span>
                <span className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-foreground/80">GDPR‑friendly</span>
                <span className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-foreground/80">Encrypted</span>
                <span className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-foreground/80">Audit Logging</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border bg-muted/30 py-14">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">Ready to Discuss Outcomes?</h2>
              <p className="mb-6 text-muted-foreground">We can walk through a live demo and a tailored projection for your clinics.</p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/contact">
                    Contact Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent">
                  <Link href="/demo/skin-analysis">See Interactive Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
