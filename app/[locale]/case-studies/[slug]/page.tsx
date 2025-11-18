"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/i18n/language-context"
import { useEffect, useMemo } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { getCaseStudyBySlug, type Locale } from "@/data/case-studies"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function CaseStudyDetailPage() {
  const { language } = useLanguage()
  const { slug } = useParams<{ slug: string }>()

  const study = useMemo(() => getCaseStudyBySlug(slug), [slug])

  useEffect(() => {
    if (slug) {
      usageTracker.trackPageView("case-study-detail", { slug })
      usageTracker.trackEngagement("view", "case_study_detail", { slug })
    }
  }, [slug])

  if (!study) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container flex-1 py-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-2xl font-bold">{language === "th" ? "ไม่พบเคสศึกษา" : "Case study not found"}</h1>
            <Link href="/case-studies" className="text-primary underline underline-offset-2">
              {language === "th" ? "กลับไปหน้าเคสศึกษา" : "Back to case studies"}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const locale = language as Locale

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-16">
        <article className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              {language === "th" ? "เคสศึกษา" : "Case Study"}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl font-display">{study.title[locale]}</h1>
            <p className="mt-3 text-muted-foreground">{study.summary[locale]}</p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {study.metrics.map((m: { label: Record<Locale, string>; value: string }) => (
              <div key={`${m.label[locale]}-${m.value}`} className="rounded-lg border border-border/60 p-4">
                <div className="text-2xl font-semibold">{m.value}</div>
                <div className="text-sm text-muted-foreground">{m.label[locale]}</div>
              </div>
            ))}
          </div>

          <div className="prose prose-neutral max-w-none dark:prose-invert">
            {study.content.map((section: { heading: Record<Locale, string>; body: Record<Locale, string> }) => (
              <section key={section.heading[locale]} className="mb-8">
                <h2 className="mt-0">{section.heading[locale]}</h2>
                <p>{section.body[locale]}</p>
              </section>
            ))}
          </div>

          {study.disclaimer && (
            <div className="mt-8 rounded-md border border-amber-300/40 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-300/30 dark:bg-amber-950/20 dark:text-amber-200">
              {study.disclaimer[locale]}
            </div>
          )}

          <div className="mt-10">
            <Link href="/case-studies" className="text-primary underline underline-offset-2">
              {language === "th" ? "กลับไปหน้าเคสศึกษา" : "Back to case studies"}
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
