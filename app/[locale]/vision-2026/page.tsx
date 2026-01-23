"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslations } from "next-intl"
import { 
  Cpu, 
  Target, 
  Users, 
  ShieldCheck, 
  Globe, 
  BarChart3, 
  ArrowRight,
  Layers,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AINetworkTopology } from "@/components/visuals/ai-network-topology"
import { cn } from "@/lib/utils"

export default function Vision2026Page() {
  const t = useTranslations()

  const pillars = [
    { 
      id: 'automation', 
      title: t('vision2026.corePillars.automation'), 
      icon: Cpu, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      desc: t('vision2026.descriptions.automation')
    },
    { 
      id: 'precision', 
      title: t('vision2026.corePillars.precision'), 
      icon: Target, 
      color: 'text-pink-600', 
      bg: 'bg-pink-50',
      desc: t('vision2026.descriptions.precision')
    },
    { 
      id: 'retention', 
      title: t('vision2026.corePillars.retention'), 
      icon: Users, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50',
      desc: t('vision2026.descriptions.retention')
    }
  ]

  const roadmap = [
    { year: 'Q1 2026', milestone: 'Generative 4D Aging Simulator', status: 'Deployed', color: 'bg-emerald-500' },
    { year: 'Q2 2026', milestone: 'Aesthetic Decision Support (ADSS)', status: 'Live', color: 'bg-emerald-500' },
    { year: 'Q3 2026', milestone: 'Autonomous Ad-Creative Engine', status: 'Beta', color: 'bg-amber-500' },
    { year: 'Q4 2026', milestone: 'Global Bio-Metric IoT Mesh', status: 'Planned', color: 'bg-slate-500' },
  ]

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Cinematic Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-20 px-6 max-w-7xl mx-auto space-y-32 flex-1">
          
          {/* Vision Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-10"
          >
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black italic shadow-premium animate-pulse">
              <Globe className="mr-3 h-4 w-4 animate-spin-slow" />
              Beauty Intelligence Supremacy
            </Badge>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-slate-950 italic leading-[0.8] uppercase">
              Vision<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6">TwoThousandTwentySix</span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-tight max-w-3xl mx-auto leading-relaxed italic">
              {t('vision2026.subtitle')}
            </p>
          </motion.div>

          {/* Ecosystem Map - Technical Visualization */}
          <section className="space-y-16">
            <div className="flex items-center justify-between gap-10">
              <h2 className="text-4xl font-black text-slate-950 italic flex items-center gap-6 tracking-tighter uppercase leading-none">
                <Layers className="h-10 w-10 text-pink-600" />
                {t('vision2026.ecosystemMap')}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-pink-500/20 via-transparent to-transparent hidden md:block" />
            </div>

            <div className="rounded-[3.5rem] border border-slate-100 bg-white p-2 shadow-premium overflow-hidden">
              <AINetworkTopology />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -12 }}
                >
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden group h-full transition-all duration-700 hover:border-pink-500/20 relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-12 space-y-8 bg-slate-50/30">
                      <div className={cn("h-20 w-20 rounded-[1.5rem] flex items-center justify-center border border-slate-100 shadow-inner transition-all group-hover:scale-110 duration-700", pillar.bg, pillar.color)}>
                        <pillar.icon className="h-10 w-10" />
                      </div>
                      <div className="space-y-4">
                        <CardTitle className="text-3xl font-black italic text-slate-950 tracking-tight uppercase leading-none">{pillar.title}</CardTitle>
                        <CardDescription className="text-slate-500 italic font-light text-lg leading-relaxed">{pillar.desc}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-12 space-y-6">
                      <div className="space-y-5 pt-8 border-t border-slate-100">
                        <div className="flex items-center gap-5 group/feat">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-glow-blue transition-all group-hover/feat:scale-150 group-hover/feat:bg-pink-500 group-hover/feat:shadow-glow-pink" />
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-950 transition-colors italic">{t('vision2026.stats.efficiency')}</span>
                        </div>
                        <div className="flex items-center gap-5 group/feat">
                          <div className="h-1.5 w-1.5 rounded-full bg-pink-500 shadow-glow-pink transition-all group-hover/feat:scale-150 group-hover/feat:bg-blue-500 group-hover/feat:shadow-glow-blue" />
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-950 transition-colors italic">{t('vision2026.stats.integrity')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Value Matrix interface */}
          <section className="space-y-16">
            <div className="flex items-center justify-between gap-10">
              <div className="h-px flex-1 bg-gradient-to-l from-pink-500/20 via-transparent to-transparent hidden md:block" />
              <h2 className="text-4xl font-black text-slate-950 italic flex items-center gap-6 tracking-tighter uppercase leading-none">
                {t('vision2026.valueMatrix')}
                <BarChart3 className="h-10 w-10 text-pink-600" />
              </h2>
            </div>

            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {[
                    { 
                      tier: t('vision2026.tierValue.standard'), 
                      price: t('vision2026.pkgNames.starter'), 
                      features: t.raw('vision2026.pkgFeatures.basic') as string[],
                      color: 'border-slate-100 bg-white'
                    },
                    { 
                      tier: t('vision2026.tierValue.professional'), 
                      price: t('vision2026.pkgNames.growth'), 
                      features: t.raw('vision2026.pkgFeatures.pro') as string[],
                      color: 'border-blue-100 bg-blue-50/20',
                      highlight: true
                    },
                    { 
                      tier: t('vision2026.tierValue.enterprise'), 
                      price: t('vision2026.pkgNames.elite'), 
                      features: t.raw('vision2026.pkgFeatures.enterprise') as string[],
                      color: 'border-pink-100 bg-pink-50/20',
                      premium: true
                    }
                  ].map((pkg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className={cn("h-full border shadow-premium rounded-[3rem] p-10 flex flex-col gap-10 relative overflow-hidden group hover:border-pink-500/20 transition-all duration-700", pkg.color)}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {pkg.premium && <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000"><Globe className="w-32 h-32 text-pink-600" /></div>}
                        <div className="space-y-3 relative z-10">
                          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">{pkg.price}</p>
                          <h4 className="text-4xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{pkg.tier}</h4>
                        </div>
                        <ul className="space-y-6 flex-1 relative z-10">
                          {pkg.features.map((feat, fi) => (
                            <li key={fi} className="flex items-start gap-5 group/feat">
                              <CheckCircle2 className="h-5 w-5 text-pink-500 shrink-0 shadow-glow-pink/20 transition-transform group-hover/feat:scale-110" />
                              <span className="text-[13px] text-slate-500 font-light italic leading-snug group-hover/feat:text-slate-950 transition-colors">{feat}</span>
                            </li>
                          ))}
                        </ul>
                        <Button variant={pkg.highlight || pkg.premium ? "premium" : "outline"} className={cn("w-full h-18 rounded-2xl uppercase font-black text-[10px] tracking-[0.2em] italic relative z-10 transition-all hover:scale-105 active:scale-95", (pkg.highlight || pkg.premium) ? "bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none shadow-2xl shadow-pink-500/20" : "border-slate-200 bg-white text-slate-950 shadow-sm")}>
                          {t('common.select')}
                        </Button>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8">
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 lg:p-16 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex justify-between items-end gap-10">
                      <div className="space-y-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('vision2026.roi.projection')}</p>
                        <h3 className="text-5xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('vision2026.roi.yield')}</h3>
                      </div>
                      <Badge className="bg-pink-500 text-white border-none px-8 py-3 text-[10px] font-black italic tracking-[0.2em] uppercase mb-2 shadow-2xl shadow-pink-500/30 animate-glow-pulse">
                        {t('vision2026.roi.ltvIncrease')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-16 space-y-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                      <div className="space-y-10">
                        <h4 className="text-[12px] font-black text-slate-950 uppercase tracking-[0.3em] border-b border-slate-100 pb-6 italic">{t('vision2026.roi.benchmarks')}</h4>
                        <div className="space-y-10">
                          {[
                            { label: t('vision2026.roi.metrics.velocity'), val: '4.2 Days', trend: '-65%', color: 'text-blue-600' },
                            { label: t('vision2026.roi.metrics.accuracy'), val: '99.9%', trend: '+42%', color: 'text-pink-600' },
                            { label: t('vision2026.roi.metrics.retention'), val: '88%', trend: '+120%', color: 'text-purple-600' },
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center group/roi">
                              <span className="text-[13px] font-black text-slate-400 italic uppercase tracking-widest transition-colors group-hover/roi:text-slate-950">{item.label}</span>
                              <div className="text-right space-y-1">
                                <p className="text-3xl font-black text-slate-950 italic tracking-tighter leading-none">{item.val}</p>
                                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] leading-none", item.color)}>{item.trend} {t('vision2026.roi.metrics.improvement')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-10">
                        <h4 className="text-[12px] font-black text-slate-950 uppercase tracking-[0.3em] border-b border-slate-100 pb-6 italic">{t('vision2026.roi.marketPosition')}</h4>
                        <div className="p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 relative overflow-hidden group/rank shadow-inner flex items-center justify-center">
                          <Globe className="absolute inset-0 h-full w-full text-pink-500/5 group-hover:scale-110 transition-transform duration-1000 group-hover:text-pink-500/10" />
                          <div className="space-y-6 relative z-10 text-center">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">{t('vision2026.roi.intelligenceIndex')}</p>
                            <p className="text-9xl font-black text-slate-950 italic tracking-tighter bg-gradient-to-br from-pink-500 to-blue-600 bg-clip-text text-transparent leading-none">#1</p>
                            <p className="text-[11px] font-black text-pink-600 uppercase tracking-[0.4em] italic leading-none">{t('vision2026.roi.category')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4">
                <Card className="border-slate-100 bg-pink-50/10 shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 h-full flex flex-col">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                      <ShieldCheck className="w-48 h-48 text-pink-600" />
                   </div>
                   <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-100 bg-white">
                      <CardTitle className="text-2xl font-black italic text-pink-600 uppercase tracking-[0.3em] flex items-center gap-5 leading-none">
                        <div className="p-3 bg-pink-50 rounded-2xl shadow-inner border border-pink-100">
                          <ShieldCheck className="h-8 w-8 text-pink-600" />
                        </div>
                        {t('vision2026.security.title')}
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="p-10 lg:p-12 space-y-12 flex-1 flex flex-col justify-between">
                      <div className="space-y-10">
                        <p className="text-xl text-slate-500 italic font-light leading-relaxed">
                          {t('vision2026.security.description')}
                        </p>
                        <div className="space-y-6">
                          {(t.raw('vision2026.security.tags') as string[]).map((tag, i) => (
                            <div key={i} className="flex items-center gap-5 group/tag">
                              <div className="h-1.5 w-1.5 rounded-full bg-pink-500 shadow-glow-pink group-hover/tag:scale-150 transition-all duration-500" />
                              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-950 transition-colors italic">{tag}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button size="xl" className="w-full h-20 rounded-2xl bg-slate-950 hover:bg-pink-600 text-white font-black uppercase tracking-[0.3em] text-[10px] italic transition-all duration-500 shadow-2xl hover:shadow-pink-500/20 border-none">
                        {t('vision2026.security.auditBtn')}
                      </Button>
                   </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Final Visionary Roadmap interface */}
          <section className="space-y-24 text-center pb-32">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-8xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('vision2026.roadmap')}</h2>
              <div className="h-1.5 w-32 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 mx-auto rounded-full" />
            </div>
            
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 relative px-6">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-100 -z-10 hidden md:block" />
              {roadmap.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-10 group/roadmap"
                >
                  <div className="h-8 w-8 rounded-full mx-auto relative group-hover:scale-125 transition-transform duration-500 border-4 border-white shadow-premium">
                    <div className={cn("absolute inset-0 rounded-full animate-ping opacity-20", step.color)} />
                    <div className={cn("absolute inset-0 rounded-full", step.color)} />
                  </div>
                  <div className="space-y-6 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium transition-all duration-700 hover:border-pink-500/20 hover:-translate-y-4 group-hover/roadmap:shadow-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">{step.year}</p>
                    <h5 className="text-xl font-black text-slate-950 italic leading-tight uppercase tracking-tight min-h-[3rem] flex items-center justify-center">{step.milestone}</h5>
                    <Badge variant="outline" className={cn("text-[9px] font-black border-none px-5 py-1.5 rounded-full uppercase italic shadow-sm", 
                      step.status === 'Deployed' ? 'bg-emerald-50 text-emerald-600' :
                      step.status === 'Live' ? 'bg-blue-50 text-blue-600' :
                      step.status === 'Beta' ? 'bg-pink-50 text-pink-600' : 'bg-slate-50 text-slate-400'
                    )}>{step.status}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-24">
              <Button size="xl" variant="premium" className="h-24 px-20 rounded-[3rem] shadow-2xl shadow-pink-500/20 text-xl font-black uppercase tracking-[0.4em] italic group transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white border-none hover:scale-105 active:scale-95">
                {t('vision2026.cta.button')}
                <ArrowRight className="ml-6 h-8 w-8 group-hover:translate-x-4 transition-transform" />
              </Button>
            </div>
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  )
}
