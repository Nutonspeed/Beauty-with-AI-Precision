"use client"

import { motion } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, HelpCircle } from "lucide-react"

export default function FaqPage() {
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const faqs = [
    { q: t('faq.questions.accuracy.q'), a: t('faq.questions.accuracy.a') },
    { q: t('faq.questions.privacy.q'), a: t('faq.questions.privacy.a') },
    { q: t('faq.questions.device.q'), a: t('faq.questions.device.a') },
  ]

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
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
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-20 md:py-32">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          
          <div className="mx-auto max-w-4xl space-y-20">
            {/* Precision Header Section */}
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                  <Sparkles className="mr-3 h-3.5 w-3.5 animate-pulse" />
                  {t('faqPage.badge')}
                </Badge>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-tight"
              >
                {t('faq.title')}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-slate-400 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-wide"
              >
                {t('faqPage.description')}
              </motion.p>
            </div>

            {/* Diagnostic FAQ Nodes */}
            <div className="space-y-8 max-w-3xl mx-auto">
              {faqs.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-2xl relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <CardContent className="p-8 lg:p-10">
                      <div className="flex gap-8">
                        <div className="mt-1 h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-pink-500/30 transition-all duration-500 shadow-inner">
                          <HelpCircle className="h-6 w-6 text-slate-500 group-hover:text-pink-400 transition-colors" />
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-pink-400 transition-colors duration-500">{f.q}</h2>
                          <p className="text-lg text-slate-400 font-light leading-relaxed">{f.a}</p>
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
              className="text-center pt-12"
            >
              <div className="inline-block p-1 rounded-[2.5rem] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20">
                <div className="bg-[#020617] rounded-[2.4rem] px-12 py-10 space-y-8">
                  <p className="text-slate-400 font-light tracking-wide italic">
                    {isThaiLocale ? 'ยังไม่พบคำตอบที่คุณต้องการ?' : 'Cant find what you are looking for?'}
                  </p>
                  <Button size="xl" variant="premium" className="h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-lg font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all" asChild>
                    <a href="/contact">
                      {isThaiLocale ? 'ติดต่อฝ่ายสนับสนุน' : 'Contact Clinical Support'}
                    </a>
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
