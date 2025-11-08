"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Sparkles, Shield, Zap, Users, BarChart3, Camera, CheckCircle2, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-accent/10 text-accent hover:bg-accent/20" variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />
              Medical-Grade AI Technology
            </Badge>

            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
              {t.home.heroTitle}
              <br />
              <span className="text-primary">{t.home.heroSubtitle}</span>
            </h1>

            <p className="mb-8 text-balance text-lg text-muted-foreground leading-relaxed md:text-xl">
              {t.home.heroDescription}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/analysis">
                  {t.home.startFreeAnalysis}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto bg-transparent">
                <Link href="/demo">{t.home.watchDemo}</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              {t.home.noCreditCard} • {t.home.freeTierAvailable}
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t.home.whyChooseTitle}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t.home.whyChooseSubtitle}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.aiPowered.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.aiPowered.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Camera className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.arVisualization.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.arVisualization.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.pdpaCompliant.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.pdpaCompliant.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <BarChart3 className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.visiaStyle.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.visiaStyle.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.fastAccurate.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.fastAccurate.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.multiClinic.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.multiClinic.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t.home.howItWorks.title}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t.home.howItWorks.subtitle}
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t.home.howItWorks.step1.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t.home.howItWorks.step1.description}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t.home.howItWorks.step2.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t.home.howItWorks.step2.description}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t.home.howItWorks.step3.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t.home.howItWorks.step3.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-y border-border bg-primary py-20 text-primary-foreground">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{t.home.cta.title}</h2>
              <p className="mb-8 text-balance text-lg text-primary-foreground/90 leading-relaxed">
                {t.home.cta.description}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
                  <Link href="/analysis">
                    {t.home.cta.startFreeAnalysis}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                >
                  <Link href="/contact">{t.home.cta.contactSales}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tiers Preview */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t.home.pricing.title}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t.home.pricing.subtitle}
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
              <Card className="border-2">
                <CardContent className="p-8">
                  <Badge className="mb-4" variant="secondary">
                    {t.home.pricing.freeTier.badge}
                  </Badge>
                  <h3 className="mb-2 text-2xl font-bold">{t.home.pricing.freeTier.title}</h3>
                  <p className="mb-6 text-sm text-muted-foreground">{t.home.pricing.freeTier.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{t.home.pricing.freeTier.price}</span>
                    <span className="text-muted-foreground"> / {t.home.pricing.freeTier.period}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {t.home.pricing.freeTier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/analysis">{t.home.pricing.freeTier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary shadow-lg">
                <CardContent className="p-8">
                  <Badge className="mb-4 bg-primary text-primary-foreground">{t.home.pricing.premium.badge}</Badge>
                  <h3 className="mb-2 text-2xl font-bold">{t.home.pricing.premium.title}</h3>
                  <p className="mb-6 text-sm text-muted-foreground">{t.home.pricing.premium.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{t.home.pricing.premium.price}</span>
                    <span className="text-muted-foreground"> / {t.home.pricing.premium.period}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {t.home.pricing.premium.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full">
                    <Link href="/contact">{t.home.pricing.premium.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
