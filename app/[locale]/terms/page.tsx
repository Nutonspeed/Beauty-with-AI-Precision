"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle2, XCircle, Scale, AlertTriangle, UserX, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"

export default function TermsOfServicePage() {
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const language = locale as 'th' | 'en'

  const sections = [
    {
      icon: CheckCircle2,
      title: t('terms.sections.acceptance.title'),
      content: t('terms.sections.acceptance.content'),
      items: [
        {
          label: t('terms.sections.acceptance.items.age.label'),
          desc: t('terms.sections.acceptance.items.age.desc')
        },
        {
          label: t('terms.sections.acceptance.items.responsibility.label'),
          desc: t('terms.sections.acceptance.items.responsibility.desc')
        },
        {
          label: t('terms.sections.acceptance.items.properUse.label'),
          desc: t('terms.sections.acceptance.items.properUse.desc')
        },
      ]
    },
    {
      icon: FileText,
      title: t('terms.sections.service.title'),
      content: t('terms.sections.service.content'),
      items: [
        {
          label: t('terms.sections.service.items.free.label'),
          desc: t('terms.sections.service.items.free.desc')
        },
        {
          label: t('terms.sections.service.items.premium.label'),
          desc: t('terms.sections.service.items.premium.desc')
        },
        {
          label: t('terms.sections.service.items.enterprise.label'),
          desc: t('terms.sections.service.items.enterprise.desc')
        },
      ]
    },
    {
      icon: XCircle,
      title: t('terms.sections.prohibited.title'),
      content: t('terms.sections.prohibited.content'),
      items: [
        {
          label: t('terms.sections.prohibited.items.misuse.label'),
          desc: t('terms.sections.prohibited.items.misuse.desc')
        },
        {
          label: t('terms.sections.prohibited.items.scraping.label'),
          desc: t('terms.sections.prohibited.items.scraping.desc')
        },
        {
          label: t('terms.sections.prohibited.items.impersonation.label'),
          desc: t('terms.sections.prohibited.items.impersonation.desc')
        },
        {
          label: t('terms.sections.prohibited.items.reverse.label'),
          desc: t('terms.sections.prohibited.items.reverse.desc')
        },
      ]
    },
    {
      icon: Scale,
      title: t('terms.sections.ip.title'),
      content: t('terms.sections.ip.content'),
      items: [
        {
          label: t('terms.sections.ip.items.ourContent.label'),
          desc: t('terms.sections.ip.items.ourContent.desc')
        },
        {
          label: t('terms.sections.ip.items.yourContent.label'),
          desc: t('terms.sections.ip.items.yourContent.desc')
        },
        {
          label: t('terms.sections.ip.items.license.label'),
          desc: t('terms.sections.ip.items.license.desc')
        },
      ]
    },
    {
      icon: AlertTriangle,
      title: t('terms.sections.liability.title'),
      content: t('terms.sections.liability.content'),
      items: [
        {
          label: t('terms.sections.liability.items.notMedical.label'),
          desc: t('terms.sections.liability.items.notMedical.desc')
        },
        {
          label: t('terms.sections.liability.items.accuracy.label'),
          desc: t('terms.sections.liability.items.accuracy.desc')
        },
        {
          label: t('terms.sections.liability.items.consult.label'),
          desc: t('terms.sections.liability.items.consult.desc')
        },
      ]
    },
    {
      icon: UserX,
      title: t('terms.sections.termination.title'),
      content: t('terms.sections.termination.content'),
      items: [
        {
          label: t('terms.sections.termination.items.userCancel.label'),
          desc: t('terms.sections.termination.items.userCancel.desc')
        },
        {
          label: t('terms.sections.termination.items.systemSuspend.label'),
          desc: t('terms.sections.termination.items.systemSuspend.desc')
        },
        {
          label: t('terms.sections.termination.items.deletion.label'),
          desc: t('terms.sections.termination.items.deletion.desc')
        },
      ]
    },
    {
      icon: Shield,
      title: t('terms.sections.changes.title'),
      content: t('terms.sections.changes.content'),
      items: [
        {
          label: t('terms.sections.changes.items.notification.label'),
          desc: t('terms.sections.changes.items.notification.desc')
        },
        {
          label: t('terms.sections.changes.items.review.label'),
          desc: t('terms.sections.changes.items.review.desc')
        },
        {
          label: t('terms.sections.changes.items.versioning.label'),
          desc: t('terms.sections.changes.items.versioning.desc')
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
                  <FileText className="mr-3 h-3.5 w-3.5" />
                  {t('terms.effectiveDate')}
                </Badge>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-7xl font-bold tracking-tight text-white leading-tight"
              >
                {t('terms.title')}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-slate-400 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-wide"
              >
                {t('terms.description')}
              </motion.p>
            </div>
          </div>
        </section>

        {/* Quick Aesthetic Navigation */}
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

              {/* Governing Law - Professional Grade */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="border-pink-500/20 bg-pink-500/[0.02] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Scale className="w-64 h-64 text-pink-500" />
                  </div>
                  <CardContent className="p-10 lg:p-16 relative z-10">
                    <div className="flex flex-col lg:flex-row items-start gap-12">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-pink-500/10 border border-pink-500/20 shadow-inner">
                        <Scale className="h-8 w-8 text-pink-400" />
                      </div>
                      <div className="flex-1 space-y-10">
                        <div className="space-y-4">
                          <h2 className="text-3xl font-bold text-white tracking-tight italic">
                            {t('terms.governingLaw.title')}
                          </h2>
                          <p className="text-lg text-slate-400 font-light leading-relaxed">
                            {t('terms.governingLaw.description')}
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-6">
                          <Button size="xl" variant="premium" className="h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-lg font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all" asChild>
                            <Link href="/contact">
                              {t('nav.contact')}
                            </Link>
                          </Button>
                          <Button size="xl" variant="outline" className="h-16 px-12 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 text-lg font-bold tracking-wide transition-all hover:scale-105 active:scale-95" asChild>
                            <Link href="/privacy">
                              {t('footer.privacy')}
                            </Link>
                          </Button>
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
