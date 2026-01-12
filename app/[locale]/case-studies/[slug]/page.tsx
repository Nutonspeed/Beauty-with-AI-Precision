"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslations, useLocale } from "next-intl"
import { useEffect, useMemo } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { getCaseStudyBySlug, type Locale } from "@/lib/data/case-studies"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

function localizeText(value: unknown, locale: Locale): string {
  if (typeof value === "string") return value
  if (value && typeof value === "object") {
    return String((value as Record<string, unknown>)[locale] ?? "")
  }
  return ""
}

export default function CaseStudyDetailPage() {
  const t = useTranslations()
  const localeStr = useLocale()
  const language = localeStr as 'th' | 'en'
  const locale = language as Locale
  const { slug } = useParams<{ slug: string }>()

  const study = useMemo(() => getCaseStudyBySlug(language, slug), [language, slug])

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
            <h1 className="mb-4 text-2xl font-bold">{t('caseStudies.notFound')}</h1>
            <Link href="/case-studies" className="text-primary underline underline-offset-2">
              {t('caseStudies.backToCaseStudies')}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 max-w-4xl mx-auto flex-1">
          <article className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                {t('caseStudies.caseStudyLabel')}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white leading-[1.1] italic font-display">
                {localizeText(study.title, locale)}
              </h1>
              <p className="text-xl text-slate-400 font-light italic leading-relaxed">
                {localizeText(study.summary, locale)}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {study.metrics.map((m: any, index: number) => (
                <motion.div
                  key={`${localizeText((m as any).label, locale)}-${(m as any).value}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-3xl overflow-hidden group hover:bg-white/[0.04] transition-all shadow-xl">
                    <CardContent className="p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 italic">
                        {localizeText((m as any).label, locale)}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                        <p className="text-3xl font-bold text-white tracking-tighter italic">{m.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-white prose-headings:italic prose-p:text-slate-400 prose-p:font-light prose-p:leading-relaxed prose-p:text-lg prose-strong:text-pink-400"
            >
              {(study.content || []).map((section: any) => (
                <section key={localizeText((section as any).heading, locale)} className="mb-12 space-y-4">
                  <h2 className="text-2xl font-bold tracking-tight">{localizeText((section as any).heading, locale)}</h2>
                  <p>{localizeText((section as any).body, locale)}</p>
                </section>
              ))}
            </motion.div>

            {study.disclaimer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="rounded-[2rem] border border-amber-500/20 bg-amber-500/5 p-8 text-sm text-amber-200/70 italic leading-relaxed backdrop-blur-md">
                  {localizeText(study.disclaimer, locale)}
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="pt-12 border-t border-white/5 flex items-center justify-between"
            >
              <Link 
                href="/case-studies" 
                className="group inline-flex items-center gap-4 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] italic hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                {t('caseStudies.backToCaseStudies')}
              </Link>
            </motion.div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
