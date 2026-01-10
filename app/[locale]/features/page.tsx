"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Scan,
  Eye,
  Boxes,
  Shield,
  Zap,
  Users,
  BarChart3,
  Calendar,
  MessageSquare,
  Camera,
  Cpu,
  Microscope,
  Calculator,
  ShieldCheck,
  Clock
} from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { motion } from "framer-motion"

export default function FeaturesPage() {
  const t = useTranslations()

  const mainFeatures = [
    {
      icon: Sparkles,
      title: t('features.main.aiAnalysis.title'),
      desc: t('features.main.aiAnalysis.desc'),
      features: [
        t('features.main.aiAnalysis.feature1'),
        t('features.main.aiAnalysis.feature2'),
        t('features.main.aiAnalysis.feature3'),
        t('features.main.aiAnalysis.feature4'),
      ],
      color: "from-violet-500/10 to-purple-500/10",
      iconColor: "text-violet-600",
    },
    {
      icon: Eye,
      title: t('features.main.arVisualization.title'),
      desc: t('features.main.arVisualization.desc'),
      features: [
        t('features.main.arVisualization.feature1'),
        t('features.main.arVisualization.feature2'),
        t('features.main.arVisualization.feature3'),
        t('features.main.arVisualization.feature4'),
      ],
      color: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-600",
    },
    {
      icon: Boxes,
      title: t('features.main.multiClinic.title'),
      desc: t('features.main.multiClinic.desc'),
      features: [
        t('features.main.multiClinic.feature1'),
        t('features.main.multiClinic.feature2'),
        t('features.main.multiClinic.feature3'),
        t('features.main.multiClinic.feature4'),
      ],
      color: "from-emerald-500/10 to-green-500/10",
      iconColor: "text-emerald-600",
    },
    {
      icon: Shield,
      title: t('features.main.security.title'),
      desc: t('features.main.security.desc'),
      features: [
        t('features.main.security.feature1'),
        t('features.main.security.feature2'),
        t('features.main.security.feature3'),
        t('features.main.security.feature4'),
      ],
      color: "from-orange-500/10 to-red-500/10",
      iconColor: "text-orange-600",
    },
  ]

  const supremacyFeatures = [
    {
      icon: Microscope,
      title: t('featuresSupremacy.mdss.title'),
      desc: t('featuresSupremacy.mdss.desc'),
      color: "from-cyan-500/10 to-blue-500/10",
      iconColor: "text-cyan-400"
    },
    {
      icon: Clock,
      title: t('featuresSupremacy.aging.title'),
      desc: t('featuresSupremacy.aging.desc'),
      color: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-400"
    },
    {
      icon: Calculator,
      title: t('featuresSupremacy.roi.title'),
      desc: t('featuresSupremacy.roi.desc'),
      color: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-400"
    },
    {
      icon: ShieldCheck,
      title: t('featuresSupremacy.audit.title'),
      desc: t('featuresSupremacy.audit.desc'),
      color: "from-pink-500/10 to-rose-500/10",
      iconColor: "text-pink-400"
    }
  ]

  const additionalFeatures = [
    {
      icon: Zap,
      title: t('features.additional.ultraFast.title'),
      desc: t('features.additional.ultraFast.desc'),
    },
    {
      icon: Users,
      title: t('features.additional.customerDb.title'),
      desc: t('features.additional.customerDb.desc'),
    },
    {
      icon: BarChart3,
      title: t('features.additional.salesAnalytics.title'),
      desc: t('features.additional.salesAnalytics.desc'),
    },
    {
      icon: Calendar,
      title: t('features.additional.booking.title'),
      desc: t('features.additional.booking.desc'),
    },
    {
      icon: MessageSquare,
      title: t('features.additional.recommendations.title'),
      desc: t('features.additional.recommendations.desc'),
    },
    {
      icon: Camera,
      title: t('features.additional.gallery.title'),
      desc: t('features.additional.gallery.desc'),
    },
    {
      icon: Cpu,
      title: t('features.additional.technology.title'),
      desc: t('features.additional.technology.desc'),
    },
    {
      icon: Scan,
      title: t('features.additional.landmarks.title'),
      desc: t('features.additional.landmarks.desc'),
    },
  ]

  const comparisonData = [
    {
      feature: t('features.comparison.accuracy'),
      ours: t('features.comparison.values.accuracy.ours'),
      competitor: t('features.comparison.values.accuracy.competitor'),
    },
    {
      feature: t('features.comparison.speed'),
      ours: t('features.comparison.values.speed.ours'),
      competitor: t('features.comparison.values.speed.competitor'),
    },
    {
      feature: t('features.comparison.analysisPoints'),
      ours: t('features.comparison.values.points.ours'),
      competitor: t('features.comparison.values.points.competitor'),
    },
    {
      feature: t('features.comparison.arSimulator'),
      ours: "✓",
      competitor: "✗",
    },
    {
      feature: t('features.comparison.multiClinic'),
      ours: t('features.comparison.values.multiClinic.ours'),
      competitor: t('features.comparison.values.multiClinic.competitor'),
    },
    {
      feature: t('features.comparison.pdpaCompliant'),
      ours: t('features.comparison.values.pdpa.ours'),
      competitor: t('features.comparison.values.pdpa.competitor'),
    },
    {
      feature: t('features.comparison.price'),
      ours: t('features.comparison.values.price.ours'),
      competitor: t('features.comparison.values.price.competitor'),
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
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 border-b border-white/5">
          <div className="container relative z-10">
            <div className="mx-auto max-w-5xl text-center space-y-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Badge className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10" variant="outline">
                  <Sparkles className="mr-3 h-3.5 w-3.5 animate-pulse" />
                  {t('features.hero.badge')}
                </Badge>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-tight"
              >
                {t('features.hero.title')}
                <span className="block mt-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent italic">
                  {t('features.hero.subtitle')}
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-slate-400 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-wide"
              >
                {t('features.hero.description')}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center pt-4"
              >
                <Link href="/analysis">
                  <Button variant="premium" size="xl" className="w-full sm:w-auto h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-lg font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                    <Scan className="mr-3 h-6 w-6" />
                    {t('features.hero.tryFree')}
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto h-16 px-12 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 text-lg font-bold tracking-wide transition-all hover:scale-105 active:scale-95">
                    <BarChart3 className="mr-3 h-6 w-6" />
                    {t('features.hero.viewPricing')}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Strategic Feature Architecture */}
        <section className="py-32 lg:py-48 relative">
          <div className="container relative z-10">
            <div className="mx-auto max-w-6xl">
              <div className="mb-24 text-center space-y-6">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                  {t('features.main.title')}
                </h2>
                <div className="h-1 w-20 bg-pink-500/50 mx-auto rounded-full" />
                <p className="text-xl text-slate-400 font-light tracking-wide max-w-2xl mx-auto">
                  {t('features.main.subtitle')}
                </p>
              </div>

              <div className="grid gap-10 lg:grid-cols-2">
                {mainFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden group hover:border-white/10 transition-all duration-700 shadow-2xl relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <CardContent className="p-12 relative">
                        <div className={`mb-10 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${feature.color} border border-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3`}>
                          <feature.icon className={`h-10 w-10 ${feature.iconColor}`} />
                        </div>
                        <h3 className="mb-6 text-3xl font-bold text-white tracking-tight group-hover:text-pink-400 transition-colors">{feature.title}</h3>
                        <p className="mb-10 text-lg text-slate-400 font-light leading-relaxed">
                          {feature.desc}
                        </p>
                        <div className="grid grid-cols-1 gap-4">
                          {feature.features.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 group/item">
                              <div className="h-1.5 w-1.5 rounded-full bg-pink-500/50 group-hover/item:bg-pink-500 transition-colors" />
                              <p className="text-sm font-medium text-slate-500 group-hover/item:text-slate-300 transition-colors tracking-wide">
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Supremacy Strategic Modules - NEW SECTION */}
        <section className="py-32 lg:py-48 relative border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="container relative z-10">
            <div className="mx-auto max-w-6xl">
              <div className="mb-24 text-center space-y-6">
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black italic shadow-2xl">
                  ENTERPRISE_SUPREMACY_TIER
                </Badge>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight italic uppercase">
                  {t('featuresSupremacy.title')}
                </h2>
                <div className="h-1 w-20 bg-pink-500/50 mx-auto rounded-full" />
                <p className="text-xl text-slate-400 font-light tracking-wide max-w-2xl mx-auto">
                  {t('featuresSupremacy.subtitle')}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {supremacyFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group hover:border-pink-500/30 transition-all duration-700 shadow-2xl relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <CardContent className="p-8 space-y-6">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} border border-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3`}>
                          <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-lg font-black text-white italic tracking-tight group-hover:text-pink-400 transition-colors">{feature.title}</h3>
                          <p className="text-xs text-slate-500 font-light leading-relaxed italic">
                            {feature.desc}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Specialized Clinical Utility Modules */}
        <section className="py-32 lg:py-48 border-y border-white/5 bg-white/[0.01]">
          <div className="container relative z-10">
            <div className="mx-auto max-w-6xl">
              <div className="mb-24 text-center space-y-6">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                  {t('features.additional.title')}
                </h2>
                <div className="h-1 w-20 bg-cyan-500/50 mx-auto rounded-full" />
                <p className="text-xl text-slate-400 font-light tracking-wide max-w-2xl mx-auto">
                  {t('features.additional.subtitle')}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {additionalFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-md rounded-[2rem] hover:border-white/10 hover:bg-white/[0.03] transition-all duration-500 group text-center">
                      <CardContent className="p-8 space-y-6">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 group-hover:scale-110 group-hover:border-cyan-500/30 transition-all duration-500">
                          <feature.icon className="h-6 w-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-lg font-bold text-white tracking-tight">{feature.title}</h3>
                          <p className="text-xs text-slate-500 font-light leading-relaxed uppercase tracking-widest">
                            {feature.desc}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Elite Performance Benchmarks */}
        <section className="py-32 lg:py-48 relative overflow-hidden">
          <div className="container relative z-10">
            <div className="mx-auto max-w-5xl">
              <div className="mb-24 text-center space-y-6">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                  {t('features.comparison.title')}
                </h2>
                <p className="text-xl text-slate-400 font-light tracking-wide max-w-2xl mx-auto">
                  {t('features.comparison.subtitle')}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl"
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-10 py-8 text-left text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                          {t('features.comparison.feature')}
                        </th>
                        <th className="px-10 py-8 text-center text-xs font-black uppercase tracking-[0.3em] text-pink-400 bg-pink-500/5">
                          {t('features.comparison.ourPlatform')}
                        </th>
                        <th className="px-10 py-8 text-center text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                          {t('features.comparison.competitors')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {comparisonData.map((row, index) => (
                        <tr key={index} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-8 text-sm font-bold text-white tracking-tight">
                            {row.feature}
                          </td>
                          <td className="px-10 py-8 text-center text-sm font-black text-pink-400 bg-pink-500/[0.02] group-hover:bg-pink-500/5 transition-colors">
                            {row.ours}
                          </td>
                          <td className="px-10 py-8 text-center text-sm font-medium text-slate-500 italic">
                            {row.competitor}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Global Deployment CTA */}
        <section className="relative py-40 overflow-hidden bg-[#020617]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-600/10" />
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl text-center space-y-12"
            >
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                  {t('features.cta.title')}
                </h2>
                <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
                  {t('features.cta.description')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <Link href="/analysis">
                  <Button variant="premium" size="xl" className="h-20 px-16 rounded-3xl shadow-2xl shadow-pink-500/20 text-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                    <Sparkles className="mr-4 h-7 w-7" />
                    {t('features.cta.freeSkinAnalysis')}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="xl" className="h-20 px-16 rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 text-xl font-bold tracking-wide transition-all hover:scale-105 active:scale-95">
                    <MessageSquare className="mr-4 h-7 w-7" />
                    {t('features.cta.contactSales')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
