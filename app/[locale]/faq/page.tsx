"use client"

import { useTranslations } from 'next-intl'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, HelpCircle } from "lucide-react"

export default function FaqPage() {
  const t = useTranslations()
  const faqs = [
    { q: t('faq.questions.accuracy.q'), a: t('faq.questions.accuracy.a') },
    { q: t('faq.questions.privacy.q'), a: t('faq.questions.privacy.a') },
    { q: t('faq.questions.device.q'), a: t('faq.questions.device.a') },
  ]

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-16">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          
          <div className="mx-auto max-w-4xl space-y-12">
            <div className="text-center space-y-4">
              <Badge className="mb-4 bg-primary/10 text-primary" variant="secondary">
                <Sparkles className="mr-2 h-3 w-3" />
                {t('faqPage.badge')}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl font-display">
                {t('faq.title')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('faqPage.description')}
              </p>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              {faqs.map((f, i) => (
                <Card key={i} className="border-2 hover:border-primary/30 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="mt-1 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <HelpCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold leading-tight">{f.q}</h2>
                        <p className="text-slate-400 font-light leading-relaxed">{f.a}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
