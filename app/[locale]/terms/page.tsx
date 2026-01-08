"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle2, XCircle, Scale, AlertTriangle, UserX, Shield } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

export default function TermsOfServicePage() {
  const t = useTranslations()
  const locale = useLocale()
  const language = locale as 'th' | 'en'

  const sections = [
    {
      icon: CheckCircle2,
      title: t('terms.sections.acceptance.title'),
      content: t('terms.sections.acceptance.content'),
      items: [
        {
          label: t('terms.sections.acceptance.items.age.label'),
          desc: t('terms.sections.acceptance.items.age.desc')
        },
        {
          label: t('terms.sections.acceptance.items.responsibility.label'),
          desc: t('terms.sections.acceptance.items.responsibility.desc')
        },
        {
          label: t('terms.sections.acceptance.items.properUse.label'),
          desc: t('terms.sections.acceptance.items.properUse.desc')
        },
      ]
    },
    {
      icon: FileText,
      title: t('terms.sections.service.title'),
      content: t('terms.sections.service.content'),
      items: [
        {
          label: t('terms.sections.service.items.free.label'),
          desc: t('terms.sections.service.items.free.desc')
        },
        {
          label: t('terms.sections.service.items.premium.label'),
          desc: t('terms.sections.service.items.premium.desc')
        },
        {
          label: t('terms.sections.service.items.enterprise.label'),
          desc: t('terms.sections.service.items.enterprise.desc')
        },
      ]
    },
    {
      icon: XCircle,
      title: t('terms.sections.prohibited.title'),
      content: t('terms.sections.prohibited.content'),
      items: [
        {
          label: t('terms.sections.prohibited.items.misuse.label'),
          desc: t('terms.sections.prohibited.items.misuse.desc')
        },
        {
          label: t('terms.sections.prohibited.items.scraping.label'),
          desc: t('terms.sections.prohibited.items.scraping.desc')
        },
        {
          label: t('terms.sections.prohibited.items.impersonation.label'),
          desc: t('terms.sections.prohibited.items.impersonation.desc')
        },
        {
          label: t('terms.sections.prohibited.items.reverse.label'),
          desc: t('terms.sections.prohibited.items.reverse.desc')
        },
      ]
    },
    {
      icon: Scale,
      title: t('terms.sections.ip.title'),
      content: t('terms.sections.ip.content'),
      items: [
        {
          label: t('terms.sections.ip.items.ourContent.label'),
          desc: t('terms.sections.ip.items.ourContent.desc')
        },
        {
          label: t('terms.sections.ip.items.yourContent.label'),
          desc: t('terms.sections.ip.items.yourContent.desc')
        },
        {
          label: t('terms.sections.ip.items.license.label'),
          desc: t('terms.sections.ip.items.license.desc')
        },
      ]
    },
    {
      icon: AlertTriangle,
      title: t('terms.sections.liability.title'),
      content: t('terms.sections.liability.content'),
      items: [
        {
          label: t('terms.sections.liability.items.notMedical.label'),
          desc: t('terms.sections.liability.items.notMedical.desc')
        },
        {
          label: t('terms.sections.liability.items.accuracy.label'),
          desc: t('terms.sections.liability.items.accuracy.desc')
        },
        {
          label: t('terms.sections.liability.items.consult.label'),
          desc: t('terms.sections.liability.items.consult.desc')
        },
      ]
    },
    {
      icon: UserX,
      title: t('terms.sections.termination.title'),
      content: t('terms.sections.termination.content'),
      items: [
        {
          label: t('terms.sections.termination.items.userCancel.label'),
          desc: t('terms.sections.termination.items.userCancel.desc')
        },
        {
          label: t('terms.sections.termination.items.systemSuspend.label'),
          desc: t('terms.sections.termination.items.systemSuspend.desc')
        },
        {
          label: t('terms.sections.termination.items.deletion.label'),
          desc: t('terms.sections.termination.items.deletion.desc')
        },
      ]
    },
    {
      icon: Shield,
      title: t('terms.sections.changes.title'),
      content: t('terms.sections.changes.content'),
      items: [
        {
          label: t('terms.sections.changes.items.notification.label'),
          desc: t('terms.sections.changes.items.notification.desc')
        },
        {
          label: t('terms.sections.changes.items.review.label'),
          desc: t('terms.sections.changes.items.review.desc')
        },
        {
          label: t('terms.sections.changes.items.versioning.label'),
          desc: t('terms.sections.changes.items.versioning.desc')
        },
      ]
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-background to-muted/50 py-12 sm:py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 bg-accent/10 text-accent" variant="secondary">
                <FileText className="mr-1 h-3 w-3" />
                {t('terms.effectiveDate')}
              </Badge>
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {t('terms.title')}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {t('terms.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="border-b border-border bg-background py-6">
          <div className="container">
            <div className="flex flex-wrap justify-center gap-2">
              {sections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-md hover:bg-muted"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="py-8 sm:py-12">
          <div className="container">
            <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
              {sections.map((section, index) => (
                <Card key={index} id={`section-${index}`} className="border-2 scroll-mt-20">
                  <CardContent className="p-6 sm:p-8">
                    <div className="mb-6 flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <section.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="mb-2 text-xl sm:text-2xl font-bold">{section.title}</h2>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {section.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
                        >
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10">
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="mb-1 text-sm sm:text-base font-semibold">{item.label}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Governing Law */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Scale className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-2 text-lg sm:text-xl font-bold">
                        {t('terms.governingLaw.title')}
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                        {t('terms.governingLaw.description')}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 text-sm">
                        <a
                          href="/contact"
                          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          {t('nav.contact')}
                        </a>
                        <a
                          href="/privacy"
                          className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-primary hover:bg-primary/10 transition-colors"
                        >
                          {t('footer.privacy')}
                        </a>
                      </div>
                    </div>
                  </div>
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
