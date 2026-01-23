"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ShieldCheck, 
  Lock, 
  Scale, 
  AlertCircle,
  Fingerprint,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

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
    <div className="space-y-6">
      <div
        ref={metricsRef as any}
        className="grid grid-cols-1 gap-6 sm:grid-cols-3"
        aria-label={t('compliance.modelValidation.metricsLabel')}
      >
        {[
          { label: t('compliance.modelValidation.sensitivity'), val: '94.2%', color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: t('compliance.modelValidation.specificity'), val: '92.8%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('compliance.modelValidation.accuracy'), val: '93.5%', color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map((m, i) => (
          <div key={i} className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm group hover:shadow-premium transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-50 group-hover:bg-pink-500 transition-all duration-700" />
            <div className={cn("text-3xl font-black italic tracking-tighter mb-2", m.color)}>{m.val}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{m.label}</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
        {t('compliance.modelValidation.disclaimer')}
      </p>
    </div>
  )
}

export default function CompliancePage() {
  const t = useTranslations()

  useEffect(() => {
    usageTracker.trackPageView("compliance")
  }, [])

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

        <div className="container relative z-10 py-20 px-6 max-w-4xl mx-auto flex-1 space-y-24">
          {/* Header Interface */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black shadow-premium animate-pulse italic">
              <ShieldCheck className="mr-3 h-3.5 w-3.5" />
              Compliance_Baseline_Node
            </Badge>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
              Regulatory<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">Framework</span>
            </h1>
            <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto italic leading-relaxed tracking-tight">
              {t('compliance.description')}
            </p>
          </motion.div>

          <div className="space-y-16 lg:space-y-24">
            {/* Data Privacy Sequence */}
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 group"
            >
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:bg-pink-50 group-hover:border-pink-500/20 transition-all duration-700">
                  <Lock className="h-7 w-7 text-slate-300 group-hover:text-pink-600 transition-colors" />
                </div>
                <h2 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('compliance.dataPrivacy.title')}</h2>
              </div>
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-10 lg:p-12 space-y-8 bg-slate-50/30">
                  <div className="grid gap-6">
                    {[
                      t('compliance.dataPrivacy.item1'),
                      t('compliance.dataPrivacy.item2'),
                      t('compliance.dataPrivacy.item3')
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-6 group/item p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-premium">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-pink-500/30 group-hover/item:scale-150 group-hover/item:bg-pink-500 transition-all shadow-glow-pink/20" />
                        <p className="text-lg text-slate-600 font-light italic leading-relaxed group-hover/item:text-slate-950 transition-colors">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Model Validation Architecture */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 group"
            >
              <div className="flex items-center gap-6 justify-end text-right">
                <h2 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('compliance.modelValidation.title')}</h2>
                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:bg-blue-50 group-hover:border-blue-500/20 transition-all duration-700">
                  <Fingerprint className="h-7 w-7 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-blue-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-10 lg:p-12 space-y-10 bg-slate-50/30">
                  <p className="text-lg text-slate-500 font-light italic leading-relaxed text-center max-w-2xl mx-auto">
                    {t('compliance.modelValidation.description')}
                  </p>
                  <MetricsWidget t={t} />
                </CardContent>
              </Card>
            </motion.section>

            {/* Medical Disclaimer Node */}
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8 group"
            >
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:bg-amber-50 group-hover:border-amber-500/20 transition-all duration-700">
                  <AlertCircle className="h-7 w-7 text-slate-300 group-hover:text-amber-600 transition-colors" />
                </div>
                <h2 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('compliance.medicalDisclaimer.title')}</h2>
              </div>
              <Card className="border-amber-100 bg-amber-50/30 backdrop-blur-xl rounded-[2.5rem] shadow-inner p-10 relative overflow-hidden group/disclaimer transition-all duration-700 hover:bg-white hover:border-amber-200">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                  <Scale className="w-32 h-32 text-amber-600" />
                </div>
                <CardContent className="p-0 flex items-start gap-8 relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-white border border-amber-100 flex items-center justify-center shrink-0 shadow-sm">
                    <Scale className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-lg text-amber-900/70 font-light italic leading-relaxed">
                    {t('compliance.medicalDisclaimer.description')}
                  </p>
                </CardContent>
              </Card>
            </motion.section>

            {/* Support Terminal interface */}
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center pt-16"
            >
              <div className="inline-block p-1 rounded-[4rem] bg-slate-100 shadow-inner">
                <div className="bg-white rounded-[3.9rem] px-16 py-14 space-y-10 border border-slate-50 shadow-premium relative overflow-hidden group/cta">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                    <Zap className="w-32 h-32 text-pink-600" />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <h2 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('compliance.contact.title')}</h2>
                    <p className="text-slate-500 font-light tracking-tight italic text-xl max-w-md mx-auto">
                      {t('compliance.contact.description')}
                    </p>
                  </div>
                  <Button size="xl" variant="premium" className="h-20 px-16 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic relative z-10">
                    Initialize Protocol Support
                  </Button>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
