"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Sparkles, 
  Target, 
  Zap, 
  Shield, 
  TrendingUp,
  Award,
  Brain,
  Camera,
  BarChart3,
  ArrowRight
} from "lucide-react"
import { useTranslations } from "next-intl"

export default function AboutPage() {
  const t = useTranslations()

  const coreValues = [
    {
      icon: Brain,
      title: t('about.coreValues.innovation.title'),
      description: t('about.coreValues.innovation.description')
    },
    {
      icon: Shield,
      title: t('about.coreValues.security.title'),
      description: t('about.coreValues.security.description')
    },
    {
      icon: TrendingUp,
      title: t('about.coreValues.growth.title'),
      description: t('about.coreValues.growth.description')
    },
    {
      icon: Award,
      title: t('about.coreValues.quality.title'),
      description: t('about.coreValues.quality.description')
    }
  ]

  const techStack = [
    {
      icon: Brain,
      title: "MediaPipe Face Detection",
      description: t('about.techStack.mediapipe.description')
    },
    {
      icon: Zap,
      title: "TensorFlow.js",
      description: t('about.techStack.tensorflow.description')
    },
    {
      icon: Camera,
      title: "AR Visualization",
      description: t('about.techStack.ar.description')
    },
    {
      icon: BarChart3,
      title: "VISIA Metrics",
      description: t('about.techStack.visia.description')
    }
  ]

  const milestones = [
    {
      year: "2024 Q1",
      title: t('about.milestones.q1_2024.title'),
      description: t('about.milestones.q1_2024.description')
    },
    {
      year: "2024 Q2",
      title: t('about.milestones.q2_2024.title'),
      description: t('about.milestones.q2_2024.description')
    },
    {
      year: "2024 Q3",
      title: "Beta Launch",
      description: t('about.milestones.q3_2024.description')
    },
    {
      year: "2025 Q1",
      title: "Official Launch",
      description: t('about.milestones.q1_2025.description')
    }
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-muted/30 to-background py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-primary/10 text-primary" variant="secondary">
                <Sparkles className="mr-2 h-3 w-3" />
                {t('about.hero.badge')}
              </Badge>

              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                {t('about.hero.title')}
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {t('about.hero.subtitle')}
                </span>
              </h1>

              <p className="mb-8 text-balance text-lg text-muted-foreground leading-relaxed">
                {t('about.hero.description')}
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/analysis">
                    {t('about.hero.tryFree')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">{t('about.hero.contactUs')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="mb-4 text-2xl font-bold">
                    {t('about.vision.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.vision.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="mb-4 text-2xl font-bold">
                    {t('about.mission.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.mission.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t('about.coreValues.title')}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t('about.coreValues.subtitle')}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {coreValues.map((value) => {
                const Icon = value.icon
                return (
                  <Card key={value.title} className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{value.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t('about.techStack.title')}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t('about.techStack.subtitle')}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {techStack.map((tech) => {
                const Icon = tech.icon
                return (
                  <Card key={tech.title} className="border-2">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                        <Icon className="h-6 w-6 text-accent" />
                      </div>
                      <h3 className="mb-2 font-semibold">{tech.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tech.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t('about.milestones.title')}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t('about.milestones.subtitle')}
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="mt-2 h-full w-0.5 bg-border" />
                      )}
                    </div>
                    <Card className="flex-1 border-2">
                      <CardContent className="p-6">
                        <Badge className="mb-2" variant="outline">{milestone.year}</Badge>
                        <h3 className="mb-2 text-xl font-semibold">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">10K+</div>
                <p className="text-sm text-muted-foreground">
                  {t('about.stats.images')}
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">95%+</div>
                <p className="text-sm text-muted-foreground">
                  {t('about.stats.accuracy')}
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">&lt;2s</div>
                <p className="text-sm text-muted-foreground">
                  {t('about.stats.time')}
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">8</div>
                <p className="text-sm text-muted-foreground">
                  {t('about.stats.metrics')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-y border-border bg-primary py-20 text-primary-foreground">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t('about.cta.title')}
              </h2>
              <p className="mb-8 text-balance text-lg text-primary-foreground/90 leading-relaxed">
                {t('about.cta.description')}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/analysis">
                    {t('about.cta.tryFree')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/contact">{t('about.cta.contactUs')}</Link>
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
