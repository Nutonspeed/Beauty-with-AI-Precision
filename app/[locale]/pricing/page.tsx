"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  CheckCircle2, 
  X,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Crown,
  Building2,
  Users,
  HardDrive,
  Zap,
  Clock
} from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { SUBSCRIPTION_PLANS, formatPrice } from "@/lib/subscriptions/plans"

export default function PricingPage() {
  const t = useTranslations()
  const locale = useLocale()
  const language = locale as 'th' | 'en'

  const pricingTiers = [
    {
      planKey: 'free' as const,
      name: language === "th" ? SUBSCRIPTION_PLANS.free.nameTH : SUBSCRIPTION_PLANS.free.name,
      badge: t('pricing.free.badge'),
      icon: Sparkles,
      price: formatPrice('free', language as 'th' | 'en'),
      period: t('pricing.free.period'),
      limits: {
        users: SUBSCRIPTION_PLANS.free.maxUsers,
        storage: SUBSCRIPTION_PLANS.free.maxStorageGB,
        analyses: SUBSCRIPTION_PLANS.free.maxAnalysesPerMonth,
        trial: SUBSCRIPTION_PLANS.free.trialDays
      },
      description: t('pricing.free.description'),
      features: language === "th" ? SUBSCRIPTION_PLANS.free.featuresTH : SUBSCRIPTION_PLANS.free.features,
      excludedFeatures: [
        t('pricing.free.excludedFeatures.noHistory'),
        t('pricing.free.excludedFeatures.noAR'),
        t('pricing.free.excludedFeatures.noRecommendations')
      ],
      cta: t('pricing.free.cta'),
      href: "/analysis",
      variant: "outline" as const
    },
    {
      planKey: 'premium' as const,
      name: language === "th" ? SUBSCRIPTION_PLANS.premium.nameTH : SUBSCRIPTION_PLANS.premium.name,
      badge: t('pricing.premium.badge'),
      icon: Crown,
      price: formatPrice('premium', language as 'th' | 'en'),
      period: t('pricing.premium.period'),
      limits: {
        users: SUBSCRIPTION_PLANS.premium.maxUsers,
        storage: SUBSCRIPTION_PLANS.premium.maxStorageGB,
        analyses: SUBSCRIPTION_PLANS.premium.maxAnalysesPerMonth,
        trial: SUBSCRIPTION_PLANS.premium.trialDays
      },
      description: t('pricing.premium.description'),
      features: language === "th" ? SUBSCRIPTION_PLANS.premium.featuresTH : SUBSCRIPTION_PLANS.premium.features,
      excludedFeatures: [],
      cta: t('pricing.premium.cta'),
      href: "/auth/register?plan=premium",
      variant: "default" as const,
      popular: true
    },
    {
      planKey: 'enterprise' as const,
      name: language === "th" ? SUBSCRIPTION_PLANS.enterprise.nameTH : SUBSCRIPTION_PLANS.enterprise.name,
      badge: t('pricing.enterprise.badge'),
      icon: Building2,
      price: formatPrice('enterprise', language as 'th' | 'en'),
      period: t('pricing.enterprise.period'),
      limits: {
        users: SUBSCRIPTION_PLANS.enterprise.maxUsers,
        storage: SUBSCRIPTION_PLANS.enterprise.maxStorageGB,
        analyses: SUBSCRIPTION_PLANS.enterprise.maxAnalysesPerMonth,
        trial: SUBSCRIPTION_PLANS.enterprise.trialDays
      },
      description: t('pricing.enterprise.description'),
      features: language === "th" ? SUBSCRIPTION_PLANS.enterprise.featuresTH : SUBSCRIPTION_PLANS.enterprise.features,
      excludedFeatures: [],
      cta: t('pricing.enterprise.cta'),
      href: "/contact?plan=enterprise",
      variant: "outline" as const
    }
  ]

  const formatLimit = (value: number, type: 'users' | 'storage' | 'analyses') => {
    if (value === -1) return t('pricing.limits.unlimited')
    if (type === 'storage') return `${value} GB`
    if (type === 'analyses') return `${value}/${t('pricing.limits.perMonth')}`
    return value.toString()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-muted/30 to-background py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-primary/10 text-primary" variant="secondary">
                <TrendingUp className="mr-2 h-3 w-3" />
                {t('pricing.hero.badge')}
              </Badge>

              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                {t('pricing.hero.title')}
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {t('pricing.hero.subtitle')}
                </span>
              </h1>

              <p className="mb-8 text-balance text-lg text-muted-foreground leading-relaxed">
                {t('pricing.hero.description')}
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t('pricing.hero.freeTrial')}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t('pricing.hero.cancelAnytime')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-3">
              {pricingTiers.map((tier) => {
                const Icon = tier.icon
                return (
                  <Card 
                    key={tier.name} 
                    className={`relative border-2 transition-all hover:shadow-xl ${
                      tier.popular ? 'border-primary shadow-lg lg:scale-105' : ''
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute left-0 right-0 top-0 flex justify-center">
                        <Badge className="rounded-b-md rounded-t-none bg-primary px-3 py-1">
                          {tier.badge}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className={tier.popular ? 'pt-8' : ''}>
                      <div className="mb-4 flex items-center justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                          tier.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        {!tier.popular && (
                          <Badge variant="outline">{tier.badge}</Badge>
                        )}
                      </div>
                      
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <CardDescription className="min-h-12">{tier.description}</CardDescription>
                      
                      <div className="mt-6">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        {tier.period && (
                          <span className="ml-2 text-muted-foreground">/ {tier.period}</span>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Trial Badge */}
                      {tier.limits.trial > 0 && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
                          <Clock className="h-4 w-4" />
                          {t('pricing.trial.freeTrial', {days: tier.limits.trial})}
                        </div>
                      )}

                      <Button 
                        className="mb-6 w-full" 
                        variant={tier.variant}
                        asChild
                      >
                        <Link href={tier.href}>
                          {tier.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>

                      {/* Limits */}
                      <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center text-xs">
                        <div>
                          <Users className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                          <div className="font-semibold">{formatLimit(tier.limits.users, 'users')}</div>
                          <div className="text-muted-foreground">{t('pricing.limits.users')}</div>
                        </div>
                        <div>
                          <HardDrive className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                          <div className="font-semibold">{formatLimit(tier.limits.storage, 'storage')}</div>
                          <div className="text-muted-foreground">{t('pricing.limits.storage')}</div>
                        </div>
                        <div>
                          <Zap className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                          <div className="font-semibold">{formatLimit(tier.limits.analyses, 'analyses')}</div>
                          <div className="text-muted-foreground">{t('pricing.limits.analyses')}</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        {tier.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        {tier.excludedFeatures.map((feature, index) => (
                          <div key={`ex-${index}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <X className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t('pricing.comparison.title')}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t('pricing.comparison.description')}
              </p>
            </div>

            <Card className="overflow-x-auto">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-4 text-left font-semibold">
                        {t('pricing.comparison.features')}
                      </th>
                      <th className="px-6 py-4 text-center font-semibold">Free</th>
                      <th className="px-6 py-4 text-center font-semibold">Premium</th>
                      <th className="px-6 py-4 text-center font-semibold">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">{t('pricing.comparison.aiAnalysis')}</td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b bg-muted/50">
                      <td className="px-6 py-4">{t('pricing.comparison.visiaMetrics')}</td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">{t('pricing.comparison.saveHistory')}</td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b bg-muted/50">
                      <td className="px-6 py-4">{t('pricing.comparison.arSimulator')}</td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">{t('pricing.comparison.dashboard')}</td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b bg-muted/50">
                      <td className="px-6 py-4">{t('pricing.comparison.multiBranch')}</td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">{t('pricing.comparison.support247')}</td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t('pricing.faq.title')}
              </h2>
            </div>

            <div className="mx-auto max-w-3xl space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t('pricing.faq.q1.question')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('pricing.faq.q1.answer')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t('pricing.faq.q2.question')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('pricing.faq.q2.answer')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t('pricing.faq.q3.question')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('pricing.faq.q3.answer')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-y border-border bg-primary py-20 text-primary-foreground">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t('pricing.cta.title')}
              </h2>
              <p className="mb-8 text-balance text-lg text-primary-foreground/90 leading-relaxed">
                {t('pricing.cta.description')}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/analysis">
                    {t('pricing.cta.startFree')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/contact">{t('pricing.cta.contactSales')}</Link>
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
