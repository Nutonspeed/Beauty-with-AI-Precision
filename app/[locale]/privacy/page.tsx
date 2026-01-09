"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Eye, Database, UserCheck, FileText, AlertCircle, Clock } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { motion } from "framer-motion"

export default function PrivacyPolicyPage() {
  const t = useTranslations()
  const locale = useLocale()
  const language = locale as 'th' | 'en'

  const sections = [
    {
      icon: FileText,
      title: t('privacy.sections.collection.title'),
      content: t('privacy.sections.collection.content'),
      items: [
        { 
          label: t('privacy.sections.collection.items.personal.label'),
          desc: t('privacy.sections.collection.items.personal.desc')
        },
        { 
          label: t('privacy.sections.collection.items.analysis.label'),
          desc: t('privacy.sections.collection.items.analysis.desc')
        },
        { 
          label: t('privacy.sections.collection.items.usage.label'),
          desc: t('privacy.sections.collection.items.usage.desc')
        },
        { 
          label: t('privacy.sections.collection.items.cookies.label'),
          desc: t('privacy.sections.collection.items.cookies.desc')
        },
      ]
    },
    {
      icon: Database,
      title: t('privacy.sections.usage.title'),
      content: t('privacy.sections.usage.content'),
      items: [
        { 
          label: t('privacy.sections.usage.items.delivery.label'),
          desc: t('privacy.sections.usage.items.delivery.desc')
        },
        { 
          label: t('privacy.sections.usage.items.improvement.label'),
          desc: t('privacy.sections.usage.items.improvement.desc')
        },
        { 
          label: t('privacy.sections.usage.items.communication.label'),
          desc: t('privacy.sections.usage.items.communication.desc')
        },
        { 
          label: t('privacy.sections.usage.items.security.label'),
          desc: t('privacy.sections.usage.items.security.desc')
        },
      ]
    },
    {
      icon: Lock,
      title: t('privacy.sections.security.title'),
      content: t('privacy.sections.security.content'),
      items: [
        { 
          label: t('privacy.sections.security.items.encryption.label'),
          desc: t('privacy.sections.security.items.encryption.desc')
        },
        { 
          label: t('privacy.sections.security.items.access.label'),
          desc: t('privacy.sections.security.items.access.desc')
        },
        { 
          label: t('privacy.sections.security.items.backup.label'),
          desc: t('privacy.sections.security.items.backup.desc')
        },
        { 
          label: t('privacy.sections.security.items.audit.label'),
          desc: t('privacy.sections.security.items.audit.desc')
        },
      ]
    },
    {
      icon: UserCheck,
      title: t('privacy.sections.rights.title'),
      content: t('privacy.sections.rights.content'),
      items: [
        { 
          label: t('privacy.sections.rights.items.access.label'),
          desc: t('privacy.sections.rights.items.access.desc')
        },
        { 
          label: t('privacy.sections.rights.items.rectification.label'),
          desc: t('privacy.sections.rights.items.rectification.desc')
        },
        { 
          label: t('privacy.sections.rights.items.erasure.label'),
          desc: t('privacy.sections.rights.items.erasure.desc')
        },
        { 
          label: t('privacy.sections.rights.items.portability.label'),
          desc: t('privacy.sections.rights.items.portability.desc')
        },
      ]
    },
    {
      icon: Eye,
      title: t('privacy.sections.sharing.title'),
      content: t('privacy.sections.sharing.content'),
      items: [
        { 
          label: t('privacy.sections.sharing.items.noSale.label'),
          desc: t('privacy.sections.sharing.items.noSale.desc')
        },
        { 
          label: t('privacy.sections.sharing.items.partners.label'),
          desc: t('privacy.sections.sharing.items.partners.desc')
        },
        { 
          label: t('privacy.sections.sharing.items.legal.label'),
          desc: t('privacy.sections.sharing.items.legal.desc')
        },
        { 
          label: t('privacy.sections.sharing.items.consent.label'),
          desc: t('privacy.sections.sharing.items.consent.desc')
        },
      ]
    },
    {
      icon: Clock,
      title: t('privacy.sections.retention.title'),
      content: t('privacy.sections.retention.content'),
      items: [
        { 
          label: t('privacy.sections.retention.items.accounts.label'),
          desc: t('privacy.sections.retention.items.accounts.desc')
        },
        { 
          label: t('privacy.sections.retention.items.analysis.label'),
          desc: t('privacy.sections.retention.items.analysis.desc')
        },
        { 
          label: t('privacy.sections.retention.items.logs.label'),
          desc: t('privacy.sections.retention.items.logs.desc')
        },
        { 
          label: t('privacy.sections.retention.items.backup.label'),
          desc: t('privacy.sections.retention.items.backup.desc')
        },
      ]
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        {/* Cinematic Hero Section */}
        <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-white/5">
          <div className="container relative z-10">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Badge className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10" variant="outline">
                  <Shield className="mr-3 h-3.5 w-3.5" />
                  {t('privacy.lastUpdated')}
                </Badge>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-7xl font-bold tracking-tight text-white leading-tight"
              >
                {t('privacy.title')}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-slate-400 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-wide"
              >
                {t('privacy.description')}
              </motion.p>
            </div>
          </div>
        </section>

        {/* Quick Clinical Navigation */}
        <section className="sticky top-[72px] z-40 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl py-4 overflow-x-auto">
          <div className="container">
            <div className="flex items-center justify-center gap-4 min-w-max">
              {sections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-pink-400 transition-colors px-4 py-2 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Content Infrastructure */}
        <section className="py-20 lg:py-32">
          <div className="container relative z-10">
            <div className="mx-auto max-w-4xl space-y-12 lg:space-y-20">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  id={`section-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="scroll-mt-40"
                >
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <CardContent className="p-10 lg:p-16 space-y-12">
                      <div className="flex flex-col md:flex-row items-start gap-8">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner group-hover:scale-110 group-hover:border-pink-500/30 transition-all duration-700">
                          <section.icon className="h-8 w-8 text-slate-400 group-hover:text-pink-400 transition-colors" />
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-3xl font-bold text-white tracking-tight italic">{section.title}</h2>
                          <p className="text-lg text-slate-400 font-light leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-6">
                        {section.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-6 rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] hover:border-white/10 group/item"
                          >
                            <div className="mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-pink-500/50 group-hover/item:bg-pink-500 transition-colors" />
                            <div className="space-y-2">
                              <h3 className="text-lg font-bold text-white tracking-tight">{item.label}</h3>
                              <p className="text-sm text-slate-500 font-light leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Contact Infrastructure Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="border-pink-500/20 bg-pink-500/[0.02] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <AlertCircle className="w-64 h-64 text-pink-500" />
                  </div>
                  <CardContent className="p-10 lg:p-16 relative z-10">
                    <div className="flex flex-col lg:flex-row items-start gap-12">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-pink-500/10 border border-pink-500/20 shadow-inner">
                        <AlertCircle className="h-8 w-8 text-pink-400" />
                      </div>
                      <div className="flex-1 space-y-10">
                        <div className="space-y-4">
                          <h2 className="text-3xl font-bold text-white tracking-tight italic">
                            {t('privacy.contact.title')}
                          </h2>
                          <p className="text-lg text-slate-400 font-light leading-relaxed">
                            {t('privacy.contact.description')}
                          </p>
                        </div>
                        
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
                          {[
                            { label: t('privacy.contact.email'), val: "privacy@cliniciq.ai", href: "mailto:privacy@cliniciq.ai" },
                            { label: t('privacy.contact.phone'), val: "+66 (0) 2-000-0000", href: "tel:+6620000000" },
                            { label: t('privacy.contact.address'), val: t('privacy.contact.addressText') }
                          ].map((c, i) => (
                            <div key={i} className="space-y-1 group">
                              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">{c.label}</div>
                              {c.href ? (
                                <a href={c.href} className="text-xl font-bold text-white hover:text-pink-400 transition-colors tracking-tight">
                                  {c.val}
                                </a>
                              ) : (
                                <p className="text-lg text-slate-300 font-light tracking-tight leading-snug">
                                  {c.val}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
