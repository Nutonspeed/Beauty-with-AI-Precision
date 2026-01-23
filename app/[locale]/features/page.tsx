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
      color: "from-pink-500/10 to-pink-600/10",
      iconColor: "text-pink-600",
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
      color: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-600",
    },
    {
      icon: Boxes,
      title: t('features.main.multiCenter.title'),
      desc: t('features.main.multiCenter.desc'),
      features: [
        t('features.main.multiCenter.feature1'),
        t('features.main.multiCenter.feature2'),
        t('features.main.multiCenter.feature3'),
        t('features.main.multiCenter.feature4'),
      ],
      color: "from-indigo-500/10 to-indigo-600/10",
      iconColor: "text-indigo-600",
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
      color: "from-slate-500/10 to-slate-600/10",
      iconColor: "text-slate-600",
    },
  ]

  const supremacyFeatures = [
    {
      icon: Microscope,
      title: t('featuresSupremacy.adss.title'),
      desc: t('featuresSupremacy.adss.desc'),
      color: "from-pink-500/10 to-pink-600/10",
      iconColor: "text-pink-500"
    },
    {
      icon: Clock,
      title: t('featuresSupremacy.aging.title'),
      desc: t('featuresSupremacy.aging.desc'),
      color: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-500"
    },
    {
      icon: Calculator,
      title: t('featuresSupremacy.roi.title'),
      desc: t('featuresSupremacy.roi.desc'),
      color: "from-indigo-500/10 to-indigo-600/10",
      iconColor: "text-indigo-500"
    },
    {
      icon: ShieldCheck,
      title: t('featuresSupremacy.audit.title'),
      desc: t('featuresSupremacy.audit.desc'),
      color: "from-pink-500/10 to-purple-600/10",
      iconColor: "text-pink-500"
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
      feature: t('features.comparison.multiCenter'),
      ours: t('features.comparison.values.multiCenter.ours'),
      competitor: t('features.comparison.values.multiCenter.competitor'),
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
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 border-b border-slate-100">
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="mx-auto max-w-5xl text-center space-y-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Badge className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic" variant="outline">
                  <Sparkles className="mr-3 h-3.5 w-3.5" />
                  {t('features.hero.badge')}
                </Badge>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase"
              >
                {t('features.hero.title')}
                <span className="block mt-6 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic uppercase text-3xl md:text-5xl tracking-[0.3em]">
                  {t('features.hero.subtitle')}
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-slate-500 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-tight italic"
              >
                {t('features.hero.description')}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-8 justify-center pt-6"
              >
                <Button variant="premium" size="xl" className="w-full sm:w-auto h-18 px-14 rounded-2xl shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" asChild>
                  <Link href="/analysis">
                    <Scan className="mr-4 h-6 w-6" />
                    {t('features.hero.tryFree')}
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="w-full sm:w-auto h-18 px-14 rounded-2xl border-slate-200 bg-white/50 text-slate-950 backdrop-blur-md hover:bg-slate-50 hover:border-pink-500/30 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-premium italic" asChild>
                  <Link href="/pricing">
                    <BarChart3 className="mr-4 h-6 w-6 text-pink-600" />
                    {t('features.hero.viewPricing')}
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Strategic Feature Architecture */}
        <section className="py-32 lg:py-48 relative">
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="mx-auto max-w-6xl">
              <div className="mb-24 text-center space-y-8">
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase">
                  {t('features.main.title')}
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-pink-500 to-blue-600 mx-auto rounded-full" />
                <p className="text-xl text-slate-500 font-light tracking-tight italic max-w-2xl mx-auto">
                  {t('features.main.subtitle')}
                </p>
              </div>

              <div className="grid gap-12 lg:grid-cols-2">
                {mainFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden group hover:border-pink-500/20 transition-all duration-700 relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-12 relative h-full flex flex-col">
                        <div className={`mb-12 inline-flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${feature.color} border border-slate-100 shadow-inner transition-all duration-700 group-hover:scale-110 group-hover:rotate-3`}>
                          <feature.icon className={`h-10 w-10 ${feature.iconColor}`} />
                        </div>
                        <h3 className="mb-8 text-3xl font-black text-slate-950 tracking-tight italic group-hover:text-pink-600 transition-colors uppercase leading-none">{feature.title}</h3>
                        <p className="mb-12 text-lg text-slate-500 font-light leading-relaxed italic flex-grow">
                          {feature.desc}
                        </p>
                        <div className="grid grid-cols-1 gap-5">
                          {feature.features.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-5 group/item">
                              <div className="h-1.5 w-1.5 rounded-full bg-pink-500 group-hover/item:scale-150 transition-all shadow-glow-pink" />
                              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover/item:text-slate-950 transition-colors italic">
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

        {/* Supremacy Strategic Modules */}
        <section className="py-32 lg:py-48 relative border-y border-slate-100 bg-slate-50/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="mx-auto max-w-6xl">
              <div className="mb-24 text-center space-y-8">
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-white backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black italic shadow-sm">
                  ENTERPRISE_SUPREMACY_TIER
                </Badge>
                <h2 className="text-4xl md:text-7xl font-black text-slate-950 leading-[0.9] italic uppercase tracking-tighter">
                  {t('featuresSupremacy.title')}
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-pink-500 to-blue-600 mx-auto rounded-full" />
                <p className="text-xl text-slate-500 font-light tracking-tight italic max-w-2xl mx-auto">
                  {t('featuresSupremacy.subtitle')}
                </p>
              </div>

              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                {supremacyFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[2.5rem] overflow-hidden group hover:border-pink-500/30 transition-all duration-700 relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                      <CardContent className="p-10 space-y-8">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} border border-slate-100 shadow-inner transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3`}>
                          <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-xl font-black text-slate-950 italic tracking-tight group-hover:text-pink-600 transition-colors uppercase leading-tight">{feature.title}</h3>
                          <p className="text-[10px] text-slate-400 font-black leading-relaxed italic uppercase tracking-widest">
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

        {/* Specialized Aesthetic Utility Modules */}
        <section className="py-32 lg:py-48 border-b border-slate-100 bg-white">
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="mx-auto max-w-6xl">
              <div className="mb-24 text-center space-y-8">
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase">
                  {t('features.additional.title')}
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full" />
                <p className="text-xl text-slate-500 font-light tracking-tight italic max-w-2xl mx-auto">
                  {t('features.additional.subtitle')}
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {additionalFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[2.5rem] hover:border-pink-500/20 hover:bg-slate-50/50 transition-all duration-700 group text-center">
                      <CardContent className="p-10 space-y-8">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-500 shadow-inner group-hover:bg-white">
                          <feature.icon className="h-8 w-8 text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-xl font-black text-slate-950 italic tracking-tight uppercase group-hover:text-blue-600 transition-colors leading-none">{feature.title}</h3>
                          <p className="text-[9px] text-slate-400 font-black leading-relaxed uppercase tracking-[0.2em] italic">
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
        <section className="py-32 lg:py-48 relative overflow-hidden bg-slate-50/30">
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="mx-auto max-w-5xl">
              <div className="mb-24 text-center space-y-8">
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase">
                  {t('features.comparison.title')}
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-pink-500 to-blue-600 mx-auto rounded-full" />
                <p className="text-xl text-slate-500 font-light tracking-tight italic max-w-2xl mx-auto">
                  {t('features.comparison.subtitle')}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-[3.5rem] border border-slate-100 bg-white shadow-premium relative group"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-12 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                          {t('features.comparison.feature')}
                        </th>
                        <th className="px-12 py-10 text-center text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 bg-pink-50/50 italic">
                          {t('features.comparison.ourPlatform')}
                        </th>
                        <th className="px-12 py-10 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                          {t('features.comparison.competitors')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {comparisonData.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors group/row">
                          <td className="px-12 py-10 text-xl font-black text-slate-950 tracking-tighter italic uppercase group-hover/row:text-pink-600 transition-colors leading-none">
                            {row.feature}
                          </td>
                          <td className="px-12 py-10 text-center text-xl font-black text-pink-600 bg-pink-50/[0.01] group-hover/row:bg-pink-50/20 transition-colors italic tracking-tighter uppercase leading-none">
                            {row.ours}
                          </td>
                          <td className="px-12 py-10 text-center text-xl font-light text-slate-400 italic tracking-tighter uppercase leading-none">
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
        <section className="relative py-48 overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-600/10" />
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl text-center space-y-16"
            >
              <div className="space-y-8">
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] italic uppercase">
                  {t('features.cta.title')}
                </h2>
                <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto italic tracking-tight">
                  {t('features.cta.description')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
                <Button variant="premium" size="xl" className="h-20 px-16 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white border-none italic" asChild>
                  <Link href="/analysis">
                    <Sparkles className="mr-4 h-7 w-7" />
                    {t('features.cta.freeSkinAnalysis')}
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 px-16 rounded-[2rem] border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 italic shadow-premium" asChild>
                  <Link href="/contact">
                    <MessageSquare className="mr-4 h-7 w-7" />
                    {t('features.cta.contactSales')}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
