"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslations } from "next-intl"
import { 
  Cpu, 
  Target, 
  Users, 
  Zap, 
  ShieldCheck, 
  Globe, 
  BarChart3, 
  ArrowRight,
  Layers,
  Fingerprint,
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
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/10',
      desc: 'Autonomous center management and predictive logistics.'
    },
    { 
      id: 'precision', 
      title: t('vision2026.corePillars.precision'), 
      icon: Target, 
      color: 'text-pink-400', 
      bg: 'bg-pink-500/10',
      desc: 'AI-mapped aesthetic protocols with biometric accuracy.'
    },
    { 
      id: 'retention', 
      title: t('vision2026.corePillars.retention'), 
      icon: Users, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10',
      desc: 'Smart re-engagement cycles and biological loyalty hooks.'
    }
  ]

  const roadmap = [
    { year: 'Q1 2026', milestone: 'Generative 4D Aging Simulator', status: 'Deployed', color: 'bg-emerald-500' },
    { year: 'Q2 2026', milestone: 'Aesthetic Decision Support (ADSS)', status: 'Live', color: 'bg-emerald-500' },
    { year: 'Q3 2026', milestone: 'Autonomous Ad-Creative Engine', status: 'Beta', color: 'bg-amber-500' },
    { year: 'Q4 2026', milestone: 'Global Bio-Metric IoT Mesh', status: 'Planned', color: 'bg-slate-500' },
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Cinematic Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
        </div>

        <div className="container relative z-10 py-20 px-6 max-w-7xl mx-auto space-y-32">
          
          {/* Vision Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black italic shadow-2xl">
              <Globe className="mr-3 h-4 w-4 animate-spin-slow" />
              Beauty Intelligence Supremacy
            </Badge>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white italic leading-[0.8] uppercase">
              Vision<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">TwoThousandTwentySix</span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-[0.1em] max-w-3xl mx-auto leading-relaxed">
              {t('vision2026.subtitle')}
            </p>
          </motion.div>

          {/* Ecosystem Map - Technical Visualization */}
          <section className="space-y-16">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white italic flex items-center gap-4">
                <Layers className="h-8 w-8 text-cyan-400" />
                {t('vision2026.ecosystemMap')}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 via-transparent to-transparent mx-10" />
            </div>

            <AINetworkTopology />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] overflow-hidden group shadow-2xl h-full">
                    <CardHeader className="p-10 space-y-4">
                      <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover:scale-110 duration-500", pillar.bg, pillar.color)}>
                        <pillar.icon className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-2xl font-black italic text-white tracking-tight">{pillar.title}</CardTitle>
                      <CardDescription className="text-slate-500 italic font-light">{pillar.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-10 pb-10">
                      <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <Zap className="h-3 w-3 text-cyan-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deployed Efficiency: 99.4%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Fingerprint className="h-3 w-3 text-pink-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Integrity: AES-256</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Value Matrix - ROI Analysis */}
          <section className="space-y-16">
            <div className="flex items-center justify-between">
              <div className="h-px flex-1 bg-gradient-to-l from-pink-500/30 via-transparent to-transparent mx-10" />
              <h2 className="text-3xl font-bold text-white italic flex items-center gap-4">
                {t('vision2026.valueMatrix')}
                <BarChart3 className="h-8 w-8 text-pink-400" />
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { 
                      tier: t('vision2026.tierValue.standard'), 
                      price: 'Starter', 
                      features: ['Basic AI Scanning', 'Client Registry', 'Simple Analytics'],
                      color: 'border-slate-800 bg-slate-900/20'
                    },
                    { 
                      tier: t('vision2026.tierValue.professional'), 
                      price: 'Growth', 
                      features: ['Predictive Sales Velocity', 'AR Simulations', 'Branch Benchmarking', 'Staff Efficiency AI'],
                      color: 'border-blue-500/30 bg-blue-500/5',
                      highlight: true
                    },
                    { 
                      tier: t('vision2026.tierValue.enterprise'), 
                      price: 'Elite', 
                      features: ['Aesthetic Decision Support (ADSS)', 'Service Compliance Audit', 'Global Industry Benchmarking', 'Generative Marketing Engine'],
                      color: 'border-pink-500/30 bg-pink-500/5',
                      premium: true
                    }
                  ].map((pkg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className={cn("h-full border rounded-[2.5rem] p-8 flex flex-col gap-6 backdrop-blur-3xl relative overflow-hidden", pkg.color)}>
                        {pkg.premium && <div className="absolute top-0 right-0 p-6 opacity-10"><Globe className="w-20 h-20 text-pink-500" /></div>}
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{pkg.price}</p>
                          <h4 className="text-2xl font-black text-white italic">{pkg.tier}</h4>
                        </div>
                        <ul className="space-y-4 flex-1">
                          {pkg.features.map((feat, fi) => (
                            <li key={fi} className="flex items-center gap-3 text-xs text-slate-400 font-light">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              {feat}
                            </li>
                          ))}
                        </ul>
                        <Button variant={pkg.highlight || pkg.premium ? "premium" : "outline"} className="w-full h-14 rounded-2xl uppercase font-black text-[10px] tracking-widest italic">
                          Select Path
                        </Button>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8">
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardHeader className="p-10 lg:p-16 border-b border-white/5">
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Strategic ROI Projection</p>
                        <h3 className="text-4xl font-bold text-white italic tracking-tighter">Enterprise Platform Yield</h3>
                      </div>
                      <Badge className="bg-emerald-600 text-white border-none px-6 py-2 text-xs font-black italic tracking-widest uppercase mb-1 shadow-lg shadow-emerald-500/20">
                        +240% LTV INCREASE
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-16 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-8">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-4">Efficiency Benchmarks</h4>
                        <div className="space-y-6">
                          {[
                            { label: 'Conversion Velocity', val: '4.2 Days', trend: '-65%', color: 'text-cyan-400' },
                            { label: 'Operational Accuracy', val: '99.9%', trend: '+42%', color: 'text-emerald-400' },
                            { label: 'Retention Lift', val: '88%', trend: '+120%', color: 'text-pink-400' },
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center group/roi">
                              <span className="text-xs font-bold text-slate-500 italic transition-colors group-hover/roi:text-white">{item.label}</span>
                              <div className="text-right">
                                <p className="text-lg font-black text-white italic">{item.val}</p>
                                <p className={cn("text-[9px] font-black uppercase tracking-widest", item.color)}>{item.trend} Improvement</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-8">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-4">Market Position</h4>
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group/rank">
                          <Globe className="absolute bottom-[-30px] right-[-30px] h-32 w-32 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
                          <div className="space-y-2 relative z-10 text-center">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Global Intelligence Index</p>
                            <p className="text-6xl font-black text-white italic tracking-tighter">#1</p>
                            <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Aesthetic AI Category</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-10">
                <Card className="border-emerald-500/20 bg-emerald-500/[0.02] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
                   <CardHeader className="p-10 pb-6 border-b border-white/5">
                      <CardTitle className="text-xl font-black italic text-emerald-400 uppercase tracking-widest flex items-center gap-4">
                        <ShieldCheck className="h-6 w-6" />
                        Infrastructure Security
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="p-10 space-y-8">
                      <p className="text-xs text-slate-400 italic font-light leading-relaxed">
                        Beauty-Intelligence-Precision (BIP) protocol ensures 100% HIPAA/GDPR compliance while leveraging deep aesthetic datasets for autonomous analysis support.
                      </p>
                      <div className="space-y-4">
                        {['Zero-Latency Edge API', 'Quantum-Safe Encryption', 'Neural Aesthetic Audit'].map((tag, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{tag}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-[#020617] font-black uppercase tracking-widest text-[10px] italic transition-all group-hover:shadow-2xl group-hover:shadow-emerald-500/20">
                        Audit System Integrity
                      </Button>
                   </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Final Visionary Roadmap */}
          <section className="space-y-16 text-center pb-20">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{t('vision2026.roadmap')}</h2>
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -z-10 hidden md:block" />
              {roadmap.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-6"
                >
                  <div className="h-4 w-4 rounded-full mx-auto relative">
                    <div className={cn("absolute inset-0 rounded-full animate-ping opacity-20", step.color)} />
                    <div className={cn("absolute inset-0 rounded-full", step.color)} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{step.year}</p>
                    <h5 className="text-sm font-bold text-white italic">{step.milestone}</h5>
                    <Badge variant="outline" className="text-[8px] font-black border-white/5 text-slate-600 italic uppercase">{step.status}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-20">
              <Button variant="premium" className="h-20 px-16 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-md font-black uppercase tracking-[0.4em] italic group transition-all">
                Partner with the Future
                <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  )
}
