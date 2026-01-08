"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Eye, Database, UserCheck, FileText, AlertCircle, Clock } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

export default function PrivacyPolicyPage() {
  const t = useTranslations()
  const locale = useLocale()
  const language = locale as 'th' | 'en'

  const sections = [
    {
      icon: FileText,
      title: t('privacy.sections.collection.title'),
      content: t('privacy.sections.collection.content'),
      items: [
        { 
          label: t('privacy.sections.collection.items.personal.label'),
          desc: t('privacy.sections.collection.items.personal.desc')
        },
        { 
          label: t('privacy.sections.collection.items.analysis.label'),
          desc: t('privacy.sections.collection.items.analysis.desc')
        },
        { 
          label: t('privacy.sections.collection.items.usage.label'),
          desc: t('privacy.sections.collection.items.usage.desc')
        },
        { 
          label: t('privacy.sections.collection.items.cookies.label'),
          desc: t('privacy.sections.collection.items.cookies.desc')
        },
      ]
    },
    {
      icon: Database,
      title: t('privacy.sections.usage.title'),
      content: t('privacy.sections.usage.content'),
      items: [
        { 
          label: t('privacy.sections.usage.items.delivery.label'),
          desc: t('privacy.sections.usage.items.delivery.desc')
        },
        { 
          label: t('privacy.sections.usage.items.improvement.label'),
          desc: t('privacy.sections.usage.items.improvement.desc')
        },
        { 
          label: t('privacy.sections.usage.items.communication.label'),
          desc: t('privacy.sections.usage.items.communication.desc')
        },
        { 
          label: t('privacy.sections.usage.items.security.label'),
          desc: t('privacy.sections.usage.items.security.desc')
        },
      ]
    },
    {
      icon: Lock,
      title: t('privacy.sections.security.title'),
      content: t('privacy.sections.security.content'),
      items: [
        { 
          label: t('privacy.sections.security.items.encryption.label'),
          desc: t('privacy.sections.security.items.encryption.desc')
        },
        { 
          label: t('privacy.sections.security.items.access.label'),
          desc: t('privacy.sections.security.items.access.desc')
        },
        { 
          label: t('privacy.sections.security.items.backup.label'),
          desc: t('privacy.sections.security.items.backup.desc')
        },
        { 
          label: t('privacy.sections.security.items.audit.label'),
          desc: t('privacy.sections.security.items.audit.desc')
        },
      ]
    },
    {
      icon: UserCheck,
      title: t('privacy.sections.rights.title'),
      content: t('privacy.sections.rights.content'),
      items: [
        { 
          label: t('privacy.sections.rights.items.access.label'),
          desc: t('privacy.sections.rights.items.access.desc')
        },
        { 
          label: t('privacy.sections.rights.items.rectification.label'),
          desc: t('privacy.sections.rights.items.rectification.desc')
        },
        { 
          label: t('privacy.sections.rights.items.erasure.label'),
          desc: t('privacy.sections.rights.items.erasure.desc')
        },
        { 
          label: t('privacy.sections.rights.items.portability.label'),
          desc: t('privacy.sections.rights.items.portability.desc')
        },
      ]
    },
    {
      icon: Eye,
      title: t('privacy.sections.sharing.title'),
      content: t('privacy.sections.sharing.content'),
      items: [
        { 
          label: t('privacy.sections.sharing.items.noSale.label'),
          desc: t('privacy.sections.sharing.items.noSale.desc')
        },
        { 
          label: t('privacy.sections.sharing.items.partners.label'),
          desc: t('privacy.sections.sharing.items.partners.desc')
        },
        { 
          label: t('privacy.sections.sharing.items.legal.label'),
          desc: t('privacy.sections.sharing.items.legal.desc')
        },
        { 
          label: t('privacy.sections.sharing.items.consent.label'),
          desc: t('privacy.sections.sharing.items.consent.desc')
        },
      ]
    },
    {
      icon: Clock,
      title: t('privacy.sections.retention.title'),
      content: t('privacy.sections.retention.content'),
      items: [
        { 
          label: t('privacy.sections.retention.items.accounts.label'),
          desc: t('privacy.sections.retention.items.accounts.desc')
        },
        { 
          label: t('privacy.sections.retention.items.analysis.label'),
          desc: t('privacy.sections.retention.items.analysis.desc')
        },
        { 
          label: t('privacy.sections.retention.items.logs.label'),
          desc: t('privacy.sections.retention.items.logs.desc')
        },
        { 
          label: t('privacy.sections.retention.items.backup.label'),
          desc: t('privacy.sections.retention.items.backup.desc')
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
              <Badge className="mb-4 bg-primary/10 text-primary" variant="secondary">
                <Shield className="mr-1 h-3 w-3" />
                {t('privacy.lastUpdated')}
              </Badge>
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {t('privacy.title')}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {t('privacy.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links */}
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
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <div className="h-2 w-2 rounded-full bg-primary" />
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

              {/* Contact Section */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <AlertCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-2 text-lg sm:text-xl font-bold">
                        {t('privacy.contact.title')}
                      </h2>
                      <p className="mb-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {t('privacy.contact.description')}
                      </p>
                      <div className="space-y-2 text-sm sm:text-base">
                        <p>
                          <strong>{t('privacy.contact.email')}</strong>{" "}
                          <a href="mailto:privacy@cliniciq.ai" className="text-primary hover:underline">
                            privacy@cliniciq.ai
                          </a>
                        </p>
                        <p>
                          <strong>{t('privacy.contact.phone')}</strong>{" "}
                          <a href="tel:+6620000000" className="text-primary hover:underline">
                            +66 (0) 2-000-0000
                          </a>
                        </p>
                        <p>
                          <strong>{t('privacy.contact.address')}</strong>{" "}
                          {t('privacy.contact.addressText')}
                        </p>
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
