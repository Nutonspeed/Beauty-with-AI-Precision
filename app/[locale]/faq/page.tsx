"use client"

import { motion } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, HelpCircle, ArrowRight, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useLocalizePath } from "@/lib/i18n/locale-link"

export default function FaqPage() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = useLocalizePath()
  const isThaiLocale = locale === 'th'
  
  const faqs = [
    { q: t('faq.questions.accuracy.q'), a: t('faq.questions.accuracy.a') },
    { q: t('faq.questions.privacy.q'), a: t('faq.questions.privacy.a') },
    { q: t('faq.questions.device.q'), a: t('faq.questions.device.a') },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }

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

        <div className="container relative z-10 py-20 md:py-32 mx-auto px-6 max-w-7xl flex-1">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          
          <div className="mx-auto max-w-4xl space-y-24">
            {/* Precision Header Section */}
            <div className="text-center space-y-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Sparkles className="mr-3 h-3.5 w-3.5" />
                  {t('faqPage.badge' as any) || 'Intelligence Knowledge Node'}
                </Badge>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase"
              >
                {t('faq.title')}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6">Protocol FAQ</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-slate-500 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-tight italic"
              >
                {t('faqPage.description' as any) || 'Access synchronized technical knowledge and diagnostic baseline information.'}
              </motion.p>
            </div>

            {/* Diagnostic FAQ Nodes */}
            <div className="space-y-10 max-w-3xl mx-auto">
              {faqs.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden group hover:border-pink-500/20 transition-all duration-700 relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-10 lg:p-14 bg-slate-50/30 group-hover:bg-white transition-all duration-700">
                      <div className="flex gap-10">
                        <div className="mt-1 h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-pink-50 group-hover:border-pink-100 transition-all duration-700 shadow-inner">
                          <HelpCircle className="h-8 w-8 text-slate-300 group-hover:text-pink-600 transition-colors shadow-glow-pink/20" />
                        </div>
                        <div className="space-y-6 flex-1">
                          <h2 className="text-3xl font-black text-slate-950 tracking-tight group-hover:text-pink-600 transition-colors duration-500 italic uppercase leading-none">{f.q}</h2>
                          <p className="text-xl text-slate-500 font-light leading-relaxed italic">{f.a}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Support Infrastructure CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center pt-16"
            >
              <div className="inline-block p-1 rounded-[4rem] bg-slate-100 shadow-inner">
                <div className="bg-white rounded-[3.9rem] px-16 py-14 space-y-10 border border-slate-50 shadow-premium relative overflow-hidden group/cta">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                    <MessageSquare className="w-32 h-32 text-pink-600" />
                  </div>
                  <p className="text-slate-500 font-light tracking-tight italic text-2xl relative z-10">
                    {t('faqPage.cantFindAnswer' as any) || 'Require specialized architectural support?'}
                  </p>
                  <Button size="xl" variant="premium" className="h-20 px-16 rounded-2xl shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic relative z-10" asChild>
                    <Link href={lp('/contact')}>
                      Initialize Contact Sequence
                      <ArrowRight className="ml-4 h-6 w-6" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
