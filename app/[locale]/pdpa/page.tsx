"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, FileText, Lock, UserCheck, Mail, Phone, Building2, Activity, Scale } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useLocalizePath } from "@/lib/i18n/locale-link"

export default function PDPAPage() {
  const t = useTranslations()
  const lp = useLocalizePath()

  const rights = [
    {
      icon: FileText,
      title: t('pdpa.rights.access.title' as any) || 'Right to Access',
      desc: t('pdpa.rights.access.desc' as any) || 'Request a copy of your precision data node.',
    },
    {
      icon: UserCheck,
      title: t('pdpa.rights.rectification.title' as any) || 'Right to Rectify',
      desc: t('pdpa.rights.rectification.desc' as any) || 'Update or synchronize incorrect unit parameters.',
    },
    {
      icon: Lock,
      title: t('pdpa.rights.erasure.title' as any) || 'Right to Erasure',
      desc: t('pdpa.rights.erasure.desc' as any) || 'Request permanent deletion of your data nodes.',
    },
    {
      icon: Shield,
      title: t('pdpa.rights.restriction.title' as any) || 'Right to Restrict',
      desc: t('pdpa.rights.restriction.desc' as any) || 'Temporarily suspend neural weight processing.',
    },
    {
      icon: FileText,
      title: t('pdpa.rights.portability.title' as any) || 'Data Portability',
      desc: t('pdpa.rights.portability.desc' as any) || 'Transfer your biological telemetry to other nodes.',
    },
    {
      icon: UserCheck,
      title: t('pdpa.rights.object.title' as any) || 'Right to Object',
      desc: t('pdpa.rights.object.desc' as any) || 'Opt-out of specific diagnostic processing sequences.',
    },
    {
      icon: Shield,
      title: t('pdpa.rights.withdraw.title' as any) || 'Withdraw Consent',
      desc: t('pdpa.rights.withdraw.desc' as any) || 'Revoke authorization for diagnostic ingestion.',
    },
    {
      icon: FileText,
      title: t('pdpa.rights.complaint.title' as any) || 'Right to Complain',
      desc: t('pdpa.rights.complaint.desc' as any) || 'Notify regulatory authorities of protocol drift.',
    },
  ]

  const steps = [
    {
      step: "01",
      title: t('pdpa.exercise.step1.title' as any) || 'Initialization',
      desc: t('pdpa.exercise.step1.desc' as any) || 'Submit a formal request via secure terminal.',
    },
    {
      step: "02",
      title: t('pdpa.exercise.step2.title' as any) || 'Verification',
      desc: t('pdpa.exercise.step2.desc' as any) || 'Authorize your identity using biometric credentials.',
    },
    {
      step: "03",
      title: t('pdpa.exercise.step3.title' as any) || 'Processing',
      desc: t('pdpa.exercise.step3.desc' as any) || 'Our DPO node executes the requested data sequence.',
    },
    {
      step: "04",
      title: t('pdpa.exercise.step4.title' as any) || 'Completion',
      desc: t('pdpa.exercise.step4.desc' as any) || 'Synchronized outcome report delivered to your portal.',
    },
  ]

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

        <div className="container relative z-10 py-20 md:py-32 mx-auto px-6 max-w-7xl flex-1 space-y-24">
          {/* Hero Section Interface */}
          <div className="text-center space-y-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <Shield className="mr-3 h-3.5 w-3.5" />
                Data_Integrity_Protocol
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase"
            >
              PDPA<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">Rights_Framework</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-xl text-slate-500 font-light max-w-2xl mx-auto italic leading-relaxed tracking-tight"
            >
              Our governance protocols prioritize your biological and digital twin data sovereignty across all neural nodes.
            </motion.p>
          </div>

          {/* Rights Matrix interface */}
          <section className="space-y-16">
            <div className="flex items-center justify-between gap-10">
              <h2 className="text-4xl font-black text-slate-950 italic flex items-center gap-6 tracking-tighter uppercase leading-none">
                <Activity className="h-10 w-10 text-pink-600" />
                Entity Sovereignty Node
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-pink-500/20 via-transparent to-transparent hidden md:block" />
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {rights.map((right, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] overflow-hidden group transition-all duration-700 hover:border-pink-500/20 h-full">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-10 flex flex-col justify-between h-full bg-slate-50/30 group-hover:bg-white transition-all duration-700">
                      <div className="space-y-8">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-700">
                          <right.icon className="h-6 w-6 text-slate-300 group-hover:text-pink-600 transition-colors" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xl font-black italic text-slate-950 uppercase group-hover:text-pink-600 transition-colors leading-tight">{right.title}</h3>
                          <p className="text-sm text-slate-500 font-light italic leading-relaxed">
                            {right.desc}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Execution Sequence interface */}
          <section className="space-y-16 py-20 border-y border-slate-100 relative overflow-hidden bg-slate-50/30">
            <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            <div className="text-center space-y-6 relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">Authorization Sequence</h2>
              <p className="text-xl text-slate-500 font-light italic max-w-2xl mx-auto">
                Follow our standardized protocol to exercise your data sovereignty rights.
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 relative z-10 max-w-6xl mx-auto">
              {steps.map((item, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group/step"
                >
                  <div className="flex flex-col items-center text-center space-y-8">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-3xl font-black text-slate-950 italic shadow-premium group-hover/step:scale-110 group-hover/step:text-pink-600 group-hover/step:border-pink-100 transition-all duration-700">
                        {item.step}
                      </div>
                      <div className="absolute -inset-2 bg-pink-500/10 rounded-full blur-xl opacity-0 group-hover/step:opacity-100 transition-opacity duration-1000" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tight">{item.title}</h3>
                      <p className="text-sm text-slate-500 font-light italic leading-relaxed px-4">{item.desc}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[70%] w-[60%] h-px border-t border-dashed border-slate-200 -z-10" />
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* Contact Direct Telemetry interface */}
          <section className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Mail, label: 'Secure Email', val: "dpo@centeriq.ai", href: "mailto:dpo@centeriq.ai", color: "text-pink-600", bg: "bg-pink-50" },
              { icon: Phone, label: 'Frequency Node', val: "+66 (0) 2-000-0000", href: "tel:+6620000000", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Building2, label: 'Central Deployment', val: "123 Medical Plaza, Bangkok", color: "text-purple-600", bg: "bg-purple-50" }
            ].map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] overflow-hidden group transition-all duration-700 hover:border-pink-500/20 h-full">
                  <CardContent className="p-10 space-y-8 flex flex-col items-center text-center">
                    <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-110 transition-transform duration-700", c.bg)}>
                      <c.icon className={cn("h-8 w-8", c.color)} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{c.label}</h3>
                      {c.href ? (
                        <a href={c.href} className="text-2xl font-black text-slate-950 hover:text-pink-600 transition-colors tracking-tight italic uppercase block">
                          {c.val}
                        </a>
                      ) : (
                        <p className="text-xl text-slate-950 font-black italic tracking-tight uppercase leading-none">
                          {c.val}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </section>

          {/* DPO Executive section interface */}
          <section className="pb-32">
            <Card className="border-slate-100 bg-slate-950 text-white shadow-2xl rounded-[4rem] overflow-hidden relative group transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-600/10 opacity-50" />
              <CardContent className="p-12 lg:p-20 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="h-32 w-32 shrink-0 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-pink-500 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                    <UserCheck className="h-16 w-16" />
                  </div>
                  <div className="flex-1 space-y-8 text-center lg:text-left">
                    <div className="space-y-4">
                      <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                        Data Protection Officer
                        <span className="ml-4 text-pink-500">(DPO)</span>
                      </h2>
                      <p className="text-xl text-slate-400 font-light italic leading-relaxed max-w-3xl">
                        Our designated DPO oversees all neural governance and protocol compliance to ensure absolute data sovereignty for all entities.
                      </p>
                    </div>
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 pt-6">
                      {[
                        { label: 'Officer Identity', val: 'Specialist Arin Ch.' },
                        { label: 'Secure Link', val: 'dpo@centeriq.ai' },
                        { label: 'Sync Status', val: 'Operational' }
                      ].map((info, i) => (
                        <div key={i} className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic leading-none">{info.label}</p>
                          <p className="text-lg font-black italic text-white uppercase tracking-tight">{info.val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-8 pt-8">
                      <Button size="xl" variant="premium" className="h-20 px-14 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl transition-all hover:scale-105 active:scale-95" asChild>
                        <Link href={lp('/contact')}>Initialize Request</Link>
                      </Button>
                      <Button variant="outline" size="xl" className="h-20 px-14 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 font-black uppercase tracking-[0.3em] text-[11px] italic transition-all hover:scale-105 shadow-premium" asChild>
                        <Link href={lp('/privacy')}>Privacy Sequence</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Legal Authority port interface */}
          <section className="pb-20">
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/20">
              <CardContent className="p-12 text-center space-y-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform duration-700 shadow-inner">
                  <Scale className="h-8 w-8 text-blue-600" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">Regulatory Baseline</h3>
                  <p className="text-lg text-slate-500 font-light italic leading-relaxed max-w-2xl mx-auto">
                    Protocols aligned with the Personal Data Protection Committee (PDPC) standards.
                  </p>
                </div>
                <a
                  href="https://www.pdpc.or.th"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 font-black uppercase tracking-[0.3em] text-[11px] italic border-b-2 border-pink-500/20 pb-1 hover:border-pink-500 transition-all inline-block"
                >
                  www.pdpc.or.th
                </a>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
