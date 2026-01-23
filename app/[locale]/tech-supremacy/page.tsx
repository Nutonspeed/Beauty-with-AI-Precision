"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslations } from "next-intl"
import { 
  FileText, 
  Terminal, 
  ShieldCheck, 
  Database, 
  Code, 
  Download, 
  Zap, 
  Microscope,
  Binary,
  Layers,
  ArrowRight,
  Brain
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NeuralAPIExplorer } from "@/components/visuals/neural-api-explorer"
import { AestheticDataLake } from "@/components/visuals/aesthetic-data-lake"
import { BIPCLI } from "@/components/visuals/bip-cli"
import { NeuralTrainingMonitor } from "@/components/visuals/neural-training-monitor"
import { cn } from "@/lib/utils"

export default function TechSupremacyPage() {
  const t = useTranslations()

  const assets = [
    {
      title: t('techHub.whitePapers' as any) || 'Strategic Whitepapers',
      items: [
        { name: 'Neural Mapping: 468-Point Precision Architecture', type: 'PDF', size: '4.2MB' },
        { name: 'Predictive Biometric Evolution in Aesthetic Tech', type: 'PDF', size: '3.8MB' },
        { name: 'ROI Orchestration: Autonomous Aesthetic Logistics', type: 'PDF', size: '2.1MB' },
      ],
      icon: FileText,
      color: 'text-pink-600'
    },
    {
      title: t('techHub.apiDocs' as any) || 'API Documentation',
      items: [
        { name: 'Inference Edge API v4.2 Specification', type: 'DOCS', size: 'Live' },
        { name: 'Secure Webhook Webhook Integration Node', type: 'DOCS', size: 'Live' },
        { name: 'Enterprise Data Lake Sync Protocol', type: 'DOCS', size: 'Live' },
      ],
      icon: Code,
      color: 'text-blue-600'
    },
    {
      title: t('techHub.securityAudit' as any) || 'Security & Compliance',
      items: [
        { name: 'ISO-27001 Compliance Certificate (2026)', type: 'PDF', size: '1.2MB' },
        { name: 'HIPAA/GDPR Data Isolation Strategy', type: 'PDF', size: '2.4MB' },
        { name: 'Quantum-Safe Encryption Verification', type: 'PDF', size: '0.8MB' },
      ],
      icon: ShieldCheck,
      color: 'text-emerald-600'
    }
  ]

  const architecture = [
    { name: 'Inference Layer', val: 'Low-Latency Neural Nodes', icon: Zap },
    { name: 'Data Mesh', val: 'Quantum-Safe Distributed Ledger', icon: Database },
    { name: 'Audit Engine', val: 'Autonomous Compliance Guardian', icon: ShieldCheck },
    { name: 'Visual Synthesizer', val: 'Generative 4D Render Engine', icon: Microscope },
  ]

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-20 px-6 max-w-7xl mx-auto space-y-32 flex-1">
          
          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-10"
          >
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black shadow-premium animate-pulse italic">
              <Terminal className="mr-3 h-4 w-4" />
              Technical Supremacy Interface
            </Badge>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-slate-950 italic leading-[0.8] uppercase">
              Tech<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6">Infrastructure</span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-tight max-w-3xl mx-auto leading-relaxed italic">
              Explore the architectural foundation of our high-precision aesthetic intelligence network and neural inference nodes.
            </p>
          </motion.div>

          {/* Architecture Visualization Nodes */}
          <section className="space-y-16">
            <div className="flex items-center justify-between gap-10">
              <h2 className="text-4xl font-black text-slate-950 italic flex items-center gap-6 tracking-tighter uppercase leading-none">
                <Layers className="h-10 w-10 text-pink-600" />
                {t('techHub.architectureMap' as any) || 'Architecture Schematic'}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-pink-500/20 via-transparent to-transparent hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {architecture.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] p-10 space-y-8 group hover:border-pink-500/20 transition-all duration-700 h-full">
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-transform group-hover:scale-110 duration-700 shadow-inner group-hover:bg-pink-50 group-hover:border-pink-500/20">
                      <item.icon className="h-8 w-8 text-pink-600 shadow-glow-pink/20" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-slate-950 transition-colors">{item.name}</p>
                      <p className="text-base font-black text-slate-950 italic uppercase tracking-tight leading-tight">{item.val}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Interactive Core Protocol Visualizers */}
          <section className="grid gap-16 lg:grid-cols-2">
            {/* API Explorer Node */}
            <div className="space-y-10">
              <h2 className="text-3xl font-black text-slate-950 italic flex items-center gap-5 tracking-tighter uppercase">
                <Binary className="h-8 w-8 text-blue-600" />
                {t('apiExplorer.title' as any) || 'Neural API Sequence'}
              </h2>
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden p-4 group hover:border-blue-500/20 transition-all duration-700">
                <NeuralAPIExplorer />
              </Card>
            </div>

            {/* Data Lake Node */}
            <div className="space-y-10">
              <h2 className="text-3xl font-black text-slate-950 italic flex items-center gap-5 tracking-tighter uppercase">
                <Database className="h-8 w-8 text-pink-600" />
                {t('techHub.dataLake' as any) || 'Aesthetic Data Mesh'}
              </h2>
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden p-4 group hover:border-pink-500/20 transition-all duration-700">
                <AestheticDataLake />
              </Card>
            </div>
          </section>

          {/* CLI & Training Monitors */}
          <section className="grid gap-16 lg:grid-cols-2">
            <div className="space-y-10">
              <h2 className="text-3xl font-black text-slate-950 italic flex items-center gap-5 tracking-tighter uppercase">
                <Terminal className="h-8 w-8 text-indigo-600" />
                {t('bipCli.title' as any) || 'Command Interface'}
              </h2>
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden p-4 group hover:border-indigo-500/20 transition-all duration-700">
                <BIPCLI />
              </Card>
            </div>

            <div className="space-y-10">
              <h2 className="text-3xl font-black text-slate-950 italic flex items-center gap-5 tracking-tighter uppercase">
                <Brain className="h-8 w-8 text-purple-600" />
                {t('neuralTraining.title' as any) || 'Inference Training Log'}
              </h2>
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden p-4 group hover:border-purple-500/20 transition-all duration-700">
                <NeuralTrainingMonitor />
              </Card>
            </div>
          </section>

          {/* Asset Download Hub interface */}
          <section className="space-y-16">
            <div className="flex items-center justify-between gap-10">
              <div className="h-px flex-1 bg-gradient-to-l from-pink-500/20 via-transparent to-transparent hidden md:block" />
              <h2 className="text-4xl font-black text-slate-950 italic flex items-center gap-6 tracking-tighter uppercase">
                {t('techHub.downloadCenter' as any) || 'Repository Interface'}
                <Download className="h-10 w-10 text-pink-600" />
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8">
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group h-full transition-all duration-700 hover:border-pink-500/20">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 lg:p-16 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex justify-between items-start gap-10">
                      <div className="space-y-6">
                        <Badge variant="outline" className="text-[10px] font-black text-pink-600 border-pink-500/30 bg-white uppercase tracking-[0.3em] italic animate-pulse shadow-sm">Deep_Tech_Publication</Badge>
                        <CardTitle className="text-5xl font-black text-slate-950 italic tracking-tighter leading-[0.9] uppercase">
                          {t('whitePaper.title' as any) || 'Precision Architecture Whitepaper'}
                        </CardTitle>
                        <CardDescription className="text-xl text-slate-500 font-light italic max-w-2xl leading-relaxed">
                          {t('whitePaper.subtitle' as any) || 'Technical specification of our 468-point neural mapping protocol and low-latency inference engine.'}
                        </CardDescription>
                      </div>
                      <div className="h-24 w-24 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 shadow-premium group-hover:bg-pink-50 group-hover:border-pink-500/20">
                        <FileText className="h-12 w-12 text-pink-600 transition-colors" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-16 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-[0.3em] border-b border-slate-100 pb-4 italic">Abstract_Node</h4>
                        <p className="text-lg text-slate-500 font-light leading-relaxed italic">
                          {t('whitePaper.abstractText' as any) || 'This document defines the quantitative baseline for autonomous skin analysis using edge-computing nodes and private data lakes.'}
                        </p>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-[0.3em] border-b border-slate-100 pb-4 italic">Technical_Chapters</h4>
                        <div className="space-y-4">
                          {[
                            'Neural Vector Calibration',
                            'Distributed Inference Optimization',
                            'PDPA Isolation Protocols',
                            'Volumetric 4D Reconstruction'
                          ].map((chapter, i) => (
                            <div key={i} className="flex items-center gap-4 group/chapter cursor-default">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500/30 shadow-glow-blue transition-all group-hover/chapter:scale-150 group-hover/chapter:bg-pink-500 group-hover/chapter:shadow-glow-pink" />
                              <span className="text-[12px] font-black text-slate-400 transition-colors group-hover/chapter:text-slate-950 italic uppercase tracking-widest">{chapter}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button variant="premium" size="xl" className="w-full h-20 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.4em] italic group bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white hover:scale-105 active:scale-95 transition-all">
                      Access Technical Manual
                      <ArrowRight className="ml-5 h-7 w-7 group-hover:translate-x-3 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-10">
                {assets.map((section, i) => (
                  <Card key={i} className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden flex flex-col group/asset transition-all duration-700 hover:border-pink-500/20 h-full">
                    <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center gap-5 bg-slate-50/30 group-hover/asset:bg-white transition-colors">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner group-hover/asset:scale-110 transition-transform duration-700",
                        i === 0 ? "bg-pink-50 text-pink-600" : i === 1 ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        <section.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xs font-black italic text-slate-950 uppercase tracking-[0.2em]">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6 flex-1 flex flex-col justify-center">
                      {section.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between group/item cursor-pointer p-4 rounded-2xl hover:bg-slate-50 transition-all">
                          <div className="space-y-1">
                            <p className="text-[12px] font-black text-slate-900 group-hover/item:text-pink-600 transition-colors italic uppercase tracking-tight">{item.name}</p>
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">{item.type} • {item.size}</p>
                          </div>
                          <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover/item:bg-pink-500 group-hover/item:text-white group-hover/item:border-none transition-all duration-500">
                            <Download className="h-4 w-4" />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Audit Node Sequence interface */}
          <section className="pb-32">
            <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-blue-600/5 opacity-50" />
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-center" />
              <CardContent className="p-16 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
                <div className="space-y-10 text-center lg:text-left max-w-2xl">
                  <Badge className="bg-slate-950 text-white border-none px-8 py-2.5 text-[10px] font-black italic tracking-[0.3em] uppercase shadow-2xl">
                    ENTERPRISE_EXCLUSIVE_ACCESS
                  </Badge>
                  <h2 className="text-5xl md:text-7xl font-black text-slate-950 italic tracking-tighter leading-[0.9] uppercase">
                    {t('techHub.requestFullAccess' as any) || 'Technical Protocol Audit'}
                  </h2>
                  <p className="text-xl text-slate-500 font-light italic leading-relaxed tracking-tight">
                    Partner centers receive full transparency reports on our neural weights audit, raw inference datasets, and bespoke cloud deployment architecture.
                  </p>
                </div>
                <Button variant="premium" size="xl" className="h-24 px-16 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.4em] italic group shrink-0 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white hover:scale-105 active:scale-95 transition-all">
                  Initialize Technical Audit
                  <ArrowRight className="ml-5 h-7 w-7 group-hover:translate-x-3 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  )
}
