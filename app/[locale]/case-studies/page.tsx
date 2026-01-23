"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslations, useLocale } from "next-intl"
import { useEffect, useMemo, useState } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { getCaseStudies } from "@/lib/data/case-studies"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BookOpen, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLocalizePath } from "@/lib/i18n/locale-link"

export default function CaseStudiesPage() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = useLocalizePath()
  const language = locale as 'th' | 'en'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    usageTracker.trackPageView("case-studies")
  }, [])

  const items = useMemo(() => getCaseStudies(language), [language])

  if (!mounted) return null

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

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Case Studies Header Interface */}
          <div className="text-center space-y-8 max-w-4xl mx-auto pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <BookOpen className="mr-3 h-3.5 w-3.5" />
                Aesthetic Outcome Archive
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase"
            >
              Transformation<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">Intelligence</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-xl text-slate-500 font-light max-w-2xl mx-auto italic leading-relaxed tracking-tight"
            >
              Explore synchronized aesthetic evidence and realized aesthetic outcomes from our precision AI ecosystem.
            </motion.p>
          </div>

          {/* Narrative Archive Grid */}
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-2">
            {items.map((item: any, index: number) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 h-full flex flex-col">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-10 lg:p-12 space-y-10 flex-1 flex flex-col justify-between">
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-pink-50 text-pink-600 border-none rounded-full px-5 py-1.5 text-[9px] font-black uppercase tracking-widest italic shadow-sm">
                          {t('caseStudies.caseStudyLabel' as any) || 'Case Study'}
                        </Badge>
                        <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-pink-50 group-hover:border-pink-100 transition-all duration-700">
                          <Sparkles className="h-6 w-6 text-slate-300 group-hover:text-pink-600 transition-colors" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-3xl font-black text-slate-950 tracking-tighter italic group-hover:text-pink-600 transition-colors leading-none uppercase">
                          <Link href={lp(`/case-studies/${item.slug}`)}>
                            {item.title}
                          </Link>
                        </h2>
                        <p className="text-lg text-slate-500 font-light italic leading-relaxed line-clamp-3">
                          {item.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        {item.metrics.slice(0, 2).map((m: any, i: number) => (
                          <div key={i} className="space-y-2 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{m.label}</p>
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500/30 group-hover:bg-blue-600 transition-all duration-500 shadow-glow-blue/20" />
                              <p className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase group-hover:text-blue-600 transition-colors">{m.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 flex items-center justify-between relative z-10">
                      <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-[0.3em] text-pink-600 hover:bg-transparent transition-all hover:translate-x-2 italic" asChild>
                        <Link href={lp(`/case-studies/${item.slug}`)}>
                          {t('caseStudies.readMore' as any) || 'Inspect Narrative'}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="pt-16 border-t border-slate-100 flex justify-center"
          >
            <Button asChild variant="outline" className="h-18 px-14 rounded-2xl border-slate-200 bg-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 transition-all hover:scale-105 italic shadow-premium">
              <Link href={lp('/')}>
                <ArrowRight className="mr-4 h-6 w-6 rotate-180" />
                {t('caseStudies.backToHome' as any) || 'Return to Gateway'}
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
