"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Scan,
  Eye,
  Boxes,
  Shield,
  Zap,
  Users,
  BarChart3,
  Calendar,
  MessageSquare,
  Camera,
  Cpu,
} from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function FeaturesPage() {
  const t = useTranslations()

  const mainFeatures = [
    {
      icon: Sparkles,
      title: t('features.main.aiAnalysis.title'),
      desc: t('features.main.aiAnalysis.desc'),
      features: [
        t('features.main.aiAnalysis.feature1'),
        t('features.main.aiAnalysis.feature2'),
        t('features.main.aiAnalysis.feature3'),
        t('features.main.aiAnalysis.feature4'),
      ],
      color: "from-violet-500/10 to-purple-500/10",
      iconColor: "text-violet-600",
    },
    {
      icon: Eye,
      title: t('features.main.arVisualization.title'),
      desc: t('features.main.arVisualization.desc'),
      features: [
        t('features.main.arVisualization.feature1'),
        t('features.main.arVisualization.feature2'),
        t('features.main.arVisualization.feature3'),
        t('features.main.arVisualization.feature4'),
      ],
      color: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-600",
    },
    {
      icon: Boxes,
      title: t('features.main.multiClinic.title'),
      desc: t('features.main.multiClinic.desc'),
      features: [
        t('features.main.multiClinic.feature1'),
        t('features.main.multiClinic.feature2'),
        t('features.main.multiClinic.feature3'),
        t('features.main.multiClinic.feature4'),
      ],
      color: "from-emerald-500/10 to-green-500/10",
      iconColor: "text-emerald-600",
    },
    {
      icon: Shield,
      title: t('features.main.security.title'),
      desc: t('features.main.security.desc'),
      features: [
        t('features.main.security.feature1'),
        t('features.main.security.feature2'),
        t('features.main.security.feature3'),
        t('features.main.security.feature4'),
      ],
      color: "from-orange-500/10 to-red-500/10",
      iconColor: "text-orange-600",
    },
  ]

  const additionalFeatures = [
    {
      icon: Zap,
      title: t('features.additional.ultraFast.title'),
      desc: t('features.additional.ultraFast.desc'),
    },
    {
      icon: Users,
      title: t('features.additional.customerDb.title'),
      desc: t('features.additional.customerDb.desc'),
    },
    {
      icon: BarChart3,
      title: t('features.additional.salesAnalytics.title'),
      desc: t('features.additional.salesAnalytics.desc'),
    },
    {
      icon: Calendar,
      title: t('features.additional.booking.title'),
      desc: t('features.additional.booking.desc'),
    },
    {
      icon: MessageSquare,
      title: t('features.additional.recommendations.title'),
      desc: t('features.additional.recommendations.desc'),
    },
    {
      icon: Camera,
      title: t('features.additional.gallery.title'),
      desc: t('features.additional.gallery.desc'),
    },
    {
      icon: Cpu,
      title: t('features.additional.technology.title'),
      desc: t('features.additional.technology.desc'),
    },
    {
      icon: Scan,
      title: t('features.additional.landmarks.title'),
      desc: t('features.additional.landmarks.desc'),
    },
  ]

  const comparisonData = [
    {
      feature: t('features.comparison.accuracy'),
      ours: "95%+",
      competitor: "85-90%",
    },
    {
      feature: t('features.comparison.speed'),
      ours: "3 วินาที / 3 sec",
      competitor: "10-15 วินาที / sec",
    },
    {
      feature: t('features.comparison.analysisPoints'),
      ours: "8 จุด / points",
      competitor: "5-6 จุด / points",
    },
    {
      feature: t('features.comparison.arSimulator'),
      ours: "✓",
      competitor: "✗",
    },
    {
      feature: t('features.comparison.multiClinic'),
      ours: "✓ Unlimited",
      competitor: "Limited",
    },
    {
      feature: t('features.comparison.pdpaCompliant'),
      ours: "✓ Full",
      competitor: "Partial",
    },
    {
      feature: t('features.comparison.price'),
      ours: "฿990/เดือน / ฿990/mo",
      competitor: "฿2,000+/เดือน / ฿2,000+/mo",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-background to-muted/50 py-12 sm:py-16 lg:py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-4 bg-primary/10 text-primary" variant="secondary">
                <Sparkles className="mr-1 h-3 w-3" />
                {t('features.hero.badge')}
              </Badge>
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                {t('features.hero.title')}
                <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t('features.hero.subtitle')}
                </span>
              </h1>
              <p className="mb-8 text-base sm:text-lg text-muted-foreground leading-relaxed">
                {t('features.hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/analysis">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Scan className="mr-2 h-5 w-5" />
                    {t('features.hero.tryFree')}
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    {t('features.hero.viewPricing')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <h2 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {t('features.main.title')}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('features.main.subtitle')}
                </p>
              </div>

              <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
                {mainFeatures.map((feature, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-xl">
                    <CardContent className="p-6 sm:p-8">
                      <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color}`}>
                        <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                      </div>
                      <h3 className="mb-3 text-xl sm:text-2xl font-bold">{feature.title}</h3>
                      <p className="mb-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {feature.desc}
                      </p>
                      <div className="space-y-2">
                        {feature.features.map((item, idx) => (
                          <p key={idx} className="text-xs sm:text-sm text-muted-foreground">
                            {item}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="border-y border-border bg-muted/50 py-12 sm:py-16">
          <div className="container">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <h2 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {t('features.additional.title')}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('features.additional.subtitle')}
                </p>
              </div>

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {additionalFeatures.map((feature, index) => (
                  <Card key={index} className="border hover:border-primary/50 transition-all">
                    <CardContent className="p-5 sm:p-6">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="mb-2 text-base sm:text-lg font-semibold">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center">
                <h2 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {t('features.comparison.title')}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('features.comparison.subtitle')}
                </p>
              </div>

              <Card className="border-2 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold">
                          {t('features.comparison.feature')}
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold bg-primary/5">
                          {t('features.comparison.ourPlatform')}
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold">
                          {t('features.comparison.competitors')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {comparisonData.map((row, index) => (
                        <tr key={index} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                            {row.feature}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-primary bg-primary/5">
                            {row.ours}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-muted-foreground">
                            {row.competitor}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-gradient-to-b from-muted/50 to-background py-12 sm:py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">
                {t('features.cta.title')}
              </h2>
              <p className="mb-8 text-sm sm:text-base text-muted-foreground">
                {t('features.cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/analysis">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Sparkles className="mr-2 h-5 w-5" />
                    {t('features.cta.freeSkinAnalysis')}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    {t('features.cta.contactSales')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
