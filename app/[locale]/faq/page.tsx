"use client"

import { useTranslations } from 'next-intl'

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
    <div className="container py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{t('faq.title')}</h1>
      <div className="space-y-6 max-w-3xl">
        {faqs.map(f => (
          <div key={f.q} className="rounded-lg border border-border/70 p-4 bg-muted/30">
            <h2 className="mb-2 text-lg font-semibold">{f.q}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
