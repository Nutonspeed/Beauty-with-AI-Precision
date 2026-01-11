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

export default function CaseStudiesPage() {
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const language = locale as 'th' | 'en'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    usageTracker.trackPageView("case-studies")
  }, [])

  const items = useMemo(() => getCaseStudies(language), [language])

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

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Case Studies Header Interface */}
          <div className="text-center space-y-8 max-w-4xl mx-auto pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <BookOpen className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Aesthetic Outcome Archive
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic"
            >
              Transformation<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Intelligence</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-xl text-slate-500 font-light tracking-widest max-w-2xl mx-auto italic leading-relaxed"
            >
              Explore synchronized aesthetic evidence and realized aesthetic outcomes from our precision AI ecosystem.
            </motion.p>
          </div>

          {/* Narrative Archive Grid */}
          <div className="grid gap-10 md:grid-cols-2">
            {items.map((item: any, index: number) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group hover:bg-white/[0.03] transition-all duration-700">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardContent className="p-10 lg:p-12 space-y-8">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-pink-600/10 text-pink-400 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-inner">
                        {t('caseStudies.caseStudyLabel')}
                      </Badge>
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-pink-500/30 transition-all shadow-inner">
                        <Sparkles className="h-5 w-5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors leading-[1.1]">
                        <Link href={`/case-studies/${item.slug}`}>
                          {item.title}
                        </Link>
                      </h2>
                      <p className="text-lg text-slate-500 font-light italic leading-relaxed line-clamp-3">
                        {item.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
                      {item.metrics.slice(0, 2).map((m: any, i: number) => (
                        <div key={i} className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 italic">{m.label}</p>
                          <div className="flex items-center gap-3">
                            <div className="h-1 w-1 rounded-full bg-cyan-500/40" />
                            <p className="text-xl font-bold text-white tracking-tighter italic">{m.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <Link href={`/case-studies/${item.slug}`} className="group/btn inline-flex items-center gap-4 text-pink-500 font-black uppercase tracking-[0.3em] text-[10px] italic hover:text-pink-400 transition-colors">
                        {t('caseStudies.readMore')}
                        <div className="h-8 w-8 rounded-full bg-pink-600/10 border border-pink-500/20 flex items-center justify-center group-hover/btn:translate-x-2 transition-transform shadow-inner">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </Link>
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
            className="pt-16 border-t border-white/5 flex justify-center"
          >
            <Button asChild variant="outline" className="h-16 px-12 rounded-2xl border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all italic shadow-inner">
              <Link href="/">
                <ArrowRight className="mr-4 h-4 w-4 rotate-180" />
                {t('caseStudies.backToHome')}
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
