"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslations, useLocale } from "next-intl"
import { useEffect, useMemo } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { getCaseStudyBySlug, type Locale } from "@/lib/data/case-studies"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, ShieldCheck, Activity, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { Button } from "@/components/ui/button"

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
  const lp = useLocalizePath()
  const router = useRouter()
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
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <Card className="max-w-md w-full border-rose-100 bg-rose-50/50 rounded-[2.5rem] p-10 text-center space-y-6">
          <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-rose-100">
            <Activity className="h-10 w-10 text-rose-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter">Narrative Not Found</h3>
            <p className="text-sm text-slate-500 font-light italic">{t('caseStudies.notFound')}</p>
          </div>
          <Button onClick={() => router.push(lp('/case-studies'))} className="w-full h-14 rounded-xl bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] italic">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('caseStudies.backToCaseStudies')}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 max-w-4xl mx-auto flex-1">
          <article className="space-y-16">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600" onClick={() => router.push(lp('/case-studies'))}>
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Sparkles className="mr-3 h-3.5 w-3.5" />
                  {t('caseStudies.caseStudyLabel')}
                </Badge>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase">
                  {localizeText(study.title, locale)}
                </h1>
                <p className="text-2xl text-slate-500 font-light italic leading-relaxed tracking-tight max-w-3xl">
                  {localizeText(study.summary, locale)}
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {study.metrics.map((m: any, index: number) => (
                <motion.div
                  key={`${localizeText((m as any).label, locale)}-${(m as any).value}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] overflow-hidden group transition-all duration-700 hover:border-pink-500/20">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-8 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 italic group-hover:text-slate-950 transition-colors">
                        {localizeText((m as any).label, locale)}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-blue-500/30 group-hover:bg-blue-600 transition-all duration-500 shadow-glow-blue/20" />
                        <p className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase group-hover:text-blue-600 transition-colors leading-none">{m.value}</p>
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
              className="space-y-16"
            >
              {(study.content || []).map((section: any, idx: number) => (
                <section key={idx} className="space-y-8 group/section">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-lg text-slate-300 italic group-hover/section:bg-pink-50 group-hover/section:text-pink-600 transition-all duration-700">
                      0{idx + 1}
                    </div>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{localizeText((section as any).heading, locale)}</h2>
                  </div>
                  <div className="p-10 rounded-[3rem] bg-slate-50/30 border border-slate-100 shadow-inner">
                    <p className="text-xl text-slate-600 font-light leading-relaxed italic">
                      {localizeText((section as any).body, locale)}
                    </p>
                  </div>
                </section>
              ))}
            </motion.div>

            {study.disclaimer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="rounded-[2.5rem] border-amber-100 bg-amber-50/30 p-10 shadow-inner relative overflow-hidden group/disclaimer">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                    <Award className="w-32 h-32 text-amber-600" />
                  </div>
                  <CardContent className="p-0 flex items-start gap-8 relative z-10">
                    <div className="h-12 w-12 rounded-xl bg-white border border-amber-100 flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck className="h-6 w-6 text-amber-600" />
                    </div>
                    <p className="text-lg text-amber-900/70 italic font-medium leading-relaxed">
                      {localizeText(study.disclaimer, locale)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="pt-16 border-t border-slate-100 flex items-center justify-between"
            >
              <Button 
                onClick={() => router.push(lp('/case-studies'))}
                variant="ghost" 
                className="group h-auto p-0 hover:bg-transparent text-slate-400 hover:text-pink-600 transition-all italic font-black uppercase tracking-[0.3em] text-[10px]"
              >
                <ArrowLeft className="h-4 w-4 mr-4 group-hover:-translate-x-2 transition-transform" />
                {t('caseStudies.backToCaseStudies')}
              </Button>
            </motion.div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
