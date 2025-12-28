"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"

function MetricsWidget({ t }: Readonly<{ t: any }>) {
  const metricsRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = metricsRef.current
    if (!el) return
    let fired = false
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !fired) {
          fired = true
          usageTracker.trackEngagement("view", "compliance_metrics")
          io.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div
        ref={metricsRef as any}
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
        aria-label={t('compliance.modelValidation.metricsLabel')}
      >
        <div className="rounded-lg border border-border/60 p-4">
          <div className="text-2xl font-semibold">94.2%</div>
          <div className="text-sm text-muted-foreground">{t('compliance.modelValidation.sensitivity')}</div>
        </div>
        <div className="rounded-lg border border-border/60 p-4">
          <div className="text-2xl font-semibold">92.8%</div>
          <div className="text-sm text-muted-foreground">{t('compliance.modelValidation.specificity')}</div>
        </div>
        <div className="rounded-lg border border-border/60 p-4">
          <div className="text-2xl font-semibold">93.5%</div>
          <div className="text-sm text-muted-foreground">{t('compliance.modelValidation.accuracy')}</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {t('compliance.modelValidation.disclaimer')}
      </p>
    </>
  )
}

export default function CompliancePage() {
  const t = useTranslations()

  useEffect(() => {
    usageTracker.trackPageView("compliance")
  }, [])


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          <header>
            <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl font-display">
              {t('compliance.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('compliance.description')}
            </p>
          </header>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              {t('compliance.dataPrivacy.title')}
            </h2>
            <ul className="list-inside list-disc text-sm text-muted-foreground space-y-2">
              <li>{t('compliance.dataPrivacy.item1')}</li>
              <li>{t('compliance.dataPrivacy.item2')}</li>
              <li>{t('compliance.dataPrivacy.item3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              {t('compliance.modelValidation.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('compliance.modelValidation.description')}
            </p>
            <MetricsWidget t={t} />
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              {t('compliance.medicalDisclaimer.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('compliance.medicalDisclaimer.description')}
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">{t('compliance.contact.title')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('compliance.contact.description')}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
