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
import { ClinicalDataLake } from "@/components/visuals/clinical-data-lake"
import { BIPCLI } from "@/components/visuals/bip-cli"
import { NeuralTrainingMonitor } from "@/components/visuals/neural-training-monitor"
import { cn } from "@/lib/utils"

export default function TechSupremacyPage() {
  const t = useTranslations()

  const assets = [
    {
      title: t('techHub.whitePapers'),
      items: [
        { name: 'Neural Mapping: 468-Point Precision Architecture', type: 'PDF', size: '4.2MB' },
        { name: 'Predictive Biometric Evolution in Aesthetic Medicine', type: 'PDF', size: '3.8MB' },
        { name: 'ROI Orchestration: Autonomous Clinical Logistics', type: 'PDF', size: '2.1MB' },
      ],
      icon: FileText,
      color: 'text-pink-400'
    },
    {
      title: t('techHub.apiDocs'),
      items: [
        { name: 'Inference Edge API v4.2 Specification', type: 'DOCS', size: 'Live' },
        { name: 'Secure Webhook Webhook Integration Node', type: 'DOCS', size: 'Live' },
        { name: 'Enterprise Data Lake Sync Protocol', type: 'DOCS', size: 'Live' },
      ],
      icon: Code,
      color: 'text-cyan-400'
    },
    {
      title: t('techHub.securityAudit'),
      items: [
        { name: 'ISO-27001 Compliance Certificate (2026)', type: 'PDF', size: '1.2MB' },
        { name: 'HIPAA/GDPR Data Isolation Strategy', type: 'PDF', size: '2.4MB' },
        { name: 'Quantum-Safe Encryption Verification', type: 'PDF', size: '0.8MB' },
      ],
      icon: ShieldCheck,
      color: 'text-emerald-400'
    }
  ]

  const architecture = [
    { name: 'Inference Layer', val: 'Low-Latency Neural Nodes', icon: Zap },
    { name: 'Data Mesh', val: 'Quantum-Safe Distributed Ledger', icon: Database },
    { name: 'Audit Engine', val: 'Autonomous Compliance Guardian', icon: ShieldCheck },
    { name: 'Visual Synthesizer', val: 'Generative 4D Render Engine', icon: Microscope },
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Cinematic Tech Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.04]" />
        </div>

        <div className="container relative z-10 py-20 px-6 max-w-7xl mx-auto space-y-32">
          
          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <Badge variant="outline" className="px-6 py-2 rounded-full border-cyan-500/30 text-cyan-400 bg-cyan-500/5 backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black italic shadow-2xl">
              <Terminal className="mr-3 h-4 w-4" />
              Technical Supremacy Interface
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white italic leading-[0.8] uppercase">
              Tech<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent not-italic">Infrastructure</span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-[0.1em] max-w-3xl mx-auto leading-relaxed">
              {t('techHub.subtitle')}
            </p>
          </motion.div>

          {/* Architecture Visualization */}
          <section className="space-y-16">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white italic flex items-center gap-4">
                <Layers className="h-8 w-8 text-pink-400" />
                {t('techHub.architectureMap')}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-pink-500/30 via-transparent to-transparent mx-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {architecture.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-8 space-y-6 group hover:border-pink-500/30 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                      <item.icon className="h-6 w-6 text-pink-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{item.name}</p>
                      <p className="text-sm font-bold text-white italic">{item.val}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Interactive API Explorer */}
          <section className="space-y-16">
            <div className="flex items-center justify-between">
              <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/30 via-transparent to-transparent mx-10" />
              <h2 className="text-3xl font-bold text-white italic flex items-center gap-4">
                {t('apiExplorer.title')}
                <Binary className="h-8 w-8 text-pink-400" />
              </h2>
            </div>
            
            <NeuralAPIExplorer />
          </section>

          {/* Clinical Data Lake Simulator */}
          <section className="space-y-16">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white italic flex items-center gap-4">
                <Database className="h-8 w-8 text-cyan-400" />
                {t('dataLake.title')}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 via-transparent to-transparent mx-10" />
            </div>
            
            <ClinicalDataLake />
          </section>

          {/* BIP-Command Line Interface */}
          <section className="space-y-16">
            <div className="flex items-center justify-between">
              <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/30 via-transparent to-transparent mx-10" />
              <h2 className="text-3xl font-bold text-white italic flex items-center gap-4 text-right">
                {t('bipCli.title')}
                <Terminal className="h-8 w-8 text-emerald-400" />
              </h2>
            </div>
            
            <BIPCLI />
          </section>

          {/* AI Neural Training Monitor - NEW SECTION */}
          <section className="space-y-16">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white italic flex items-center gap-4">
                <Brain className="h-8 w-8 text-pink-400" />
                {t('neuralTraining.title')}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-pink-500/30 via-transparent to-transparent mx-10" />
            </div>
            
            <NeuralTrainingMonitor />
          </section>

          {/* Download Center */}
          <section className="space-y-16">
            <div className="flex items-center justify-between">
              <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/30 via-transparent to-transparent mx-10" />
              <h2 className="text-3xl font-bold text-white italic flex items-center gap-4">
                {t('techHub.downloadCenter')}
                <Download className="h-8 w-8 text-cyan-400" />
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Strategic White-paper Module */}
              <div className="lg:col-span-8">
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardHeader className="p-10 lg:p-16 border-b border-white/5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4">
                        <Badge variant="outline" className="text-[10px] font-black text-pink-500 border-pink-500/20 uppercase tracking-[0.3em] italic">Deep_Tech_Publication</Badge>
                        <CardTitle className="text-4xl font-black text-white italic tracking-tighter leading-tight">
                          {t('whitePaper.title')}
                        </CardTitle>
                        <CardDescription className="text-lg text-slate-500 font-light italic max-w-2xl leading-relaxed">
                          {t('whitePaper.subtitle')}
                        </CardDescription>
                      </div>
                      <div className="h-20 w-20 rounded-3xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 group-hover:scale-110 transition-transform duration-700">
                        <FileText className="h-10 w-10 text-pink-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-16 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-4">{t('whitePaper.abstract')}</h4>
                        <p className="text-sm text-slate-400 font-light leading-relaxed italic">
                          {t('whitePaper.abstractText')}
                        </p>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-4">{t('whitePaper.keyChapters')}</h4>
                        <div className="space-y-4">
                          {[
                            t('whitePaper.chapter1'),
                            t('whitePaper.chapter2'),
                            t('whitePaper.chapter3'),
                            t('whitePaper.chapter4'),
                          ].map((chapter, i) => (
                            <div key={i} className="flex items-center gap-4 group/chapter">
                              <div className="h-1 w-1 rounded-full bg-cyan-500 transition-all group-hover/chapter:scale-150" />
                              <span className="text-xs font-bold text-slate-500 transition-colors group-hover/chapter:text-white italic">{chapter}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button variant="premium" className="w-full h-20 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-md font-black uppercase tracking-[0.4em] italic group">
                      {t('whitePaper.readFull')}
                      <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Assets */}
              <div className="lg:col-span-4 space-y-8">
                {assets.map((section, i) => (
                  <Card key={i} className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col group/asset">
                    <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group-hover/asset:scale-110 transition-transform", section.color)}>
                        <section.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-sm font-black italic text-white uppercase tracking-widest">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                      {section.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between group/item cursor-pointer">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-white group-hover/item:text-cyan-400 transition-colors">{item.name}</p>
                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{item.type} • {item.size}</p>
                          </div>
                          <Download className="h-3 w-3 text-slate-700 group-hover/item:text-white transition-colors" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Full Audit Request */}
          <section className="pb-20">
            <Card className="border-pink-500/20 bg-gradient-to-br from-pink-600/10 via-transparent to-transparent backdrop-blur-3xl rounded-[4rem] overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
              <CardContent className="p-16 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
                <div className="space-y-8 text-center lg:text-left max-w-2xl">
                  <Badge className="bg-pink-600 text-white border-none px-6 py-2 text-[10px] font-black italic tracking-[0.3em] uppercase">
                    ENTERPRISE_EXCLUSIVE
                  </Badge>
                  <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-[0.9] uppercase">
                    {t('techHub.requestFullAccess')}
                  </h2>
                  <p className="text-xl text-slate-400 font-light italic leading-relaxed">
                    Partner clinics receive full access to our neural weights audit, raw inference datasets, and bespoke cloud deployment architecture.
                  </p>
                </div>
                <Button variant="premium" className="h-24 px-16 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-md font-black uppercase tracking-[0.4em] italic group shrink-0">
                  Request Technical Audit
                  <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
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
