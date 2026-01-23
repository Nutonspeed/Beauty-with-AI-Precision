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
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        {/* Cinematic Hero Section */}
        <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-slate-100">
          <div className="container relative z-10 max-w-7xl mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Badge className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic" variant="outline">
                  <Shield className="mr-3 h-3.5 w-3.5" />
                  {t('privacy.lastUpdated')}
                </Badge>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase"
              >
                {t('privacy.title')}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-xl text-slate-500 font-light max-w-2xl mx-auto italic leading-relaxed tracking-tight"
              >
                {t('privacy.description')}
              </motion.p>
            </div>
          </div>
        </section>

        {/* Quick Aesthetic Navigation */}
        <section className="sticky top-[72px] z-40 border-b border-slate-100 bg-white/80 backdrop-blur-xl py-6 overflow-x-auto shadow-sm">
          <div className="container max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-center gap-6 min-w-max">
              {sections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-pink-600 transition-all px-6 py-3 rounded-[1.25rem] hover:bg-pink-50/50 border border-transparent hover:border-pink-500/10 italic"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Content Infrastructure */}
        <section className="py-20 lg:py-32">
          <div className="container relative z-10 max-w-7xl mx-auto px-6">
            <div className="mx-auto max-w-4xl space-y-16 lg:space-y-24">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  id={`section-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="scroll-mt-48"
                >
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-10 lg:p-16 space-y-12">
                      <div className="flex flex-col md:flex-row items-start gap-10">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-110 group-hover:bg-pink-50 group-hover:border-pink-500/20 transition-all duration-700">
                          <section.icon className="h-10 w-10 text-slate-300 group-hover:text-pink-600 transition-colors" />
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{section.title}</h2>
                          <p className="text-xl text-slate-500 font-light italic leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-8">
                        {section.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-8 rounded-[2.5rem] border border-slate-50 bg-slate-50/30 p-10 transition-all duration-700 hover:bg-white hover:border-pink-500/20 hover:shadow-premium group/item relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/item:bg-pink-600 transition-all duration-700" />
                            <div className="mt-2.5 flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-pink-500/30 group-hover/item:bg-pink-600 transition-colors duration-500" />
                            <div className="space-y-3 relative z-10">
                              <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase leading-none group-hover/item:text-pink-600 transition-colors">{item.label}</h3>
                              <p className="text-lg text-slate-500 font-light italic leading-relaxed">
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
                <Card className="border-pink-500/20 bg-pink-50/30 backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-premium relative group hover:border-pink-500/30 transition-all duration-700">
                  <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                    <AlertCircle className="w-72 h-72 text-pink-600" />
                  </div>
                  <CardContent className="p-10 lg:p-16 relative z-10">
                    <div className="flex flex-col lg:flex-row items-start gap-12">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-white border border-pink-100 shadow-premium group-hover:scale-110 transition-transform duration-700">
                        <AlertCircle className="h-10 w-10 text-pink-600" />
                      </div>
                      <div className="flex-1 space-y-12">
                        <div className="space-y-4">
                          <h2 className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                            {t('privacy.contact.title')}
                          </h2>
                          <p className="text-xl text-slate-500 font-light italic leading-relaxed tracking-tight">
                            {t('privacy.contact.description')}
                          </p>
                        </div>
                        
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
                          {[
                            { label: t('privacy.contact.email'), val: "privacy@aesthetic-ai.io", href: "mailto:privacy@aesthetic-ai.io" },
                            { label: t('privacy.contact.phone'), val: "+66 (0) 2-000-0000", href: "tel:+6620000000" },
                            { label: t('privacy.contact.address'), val: t('privacy.contact.addressText') }
                          ].map((c, i) => (
                            <div key={i} className="space-y-2 group/info">
                              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic group-hover/info:text-pink-600 transition-colors">{c.label}</div>
                              {c.href ? (
                                <a href={c.href} className="text-2xl font-black text-slate-950 hover:text-pink-600 transition-all tracking-tight italic uppercase leading-none">
                                  {c.val}
                                </a>
                              ) : (
                                <p className="text-xl text-slate-500 font-light tracking-tight leading-relaxed italic">
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
