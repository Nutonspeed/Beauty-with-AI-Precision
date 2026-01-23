"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  Target, 
  Zap, 
  Shield, 
  TrendingUp,
  Award,
  Brain,
  Camera,
  BarChart3,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AboutPage() {
  const t = useTranslations()
  const lp = useLocalizePath()

  const coreValues = [
    {
      icon: Brain,
      title: t('about.coreValues.innovation.title'),
      description: t('about.coreValues.innovation.description')
    },
    {
      icon: Shield,
      title: t('about.coreValues.security.title'),
      description: t('about.coreValues.security.description')
    },
    {
      icon: TrendingUp,
      title: t('about.coreValues.growth.title'),
      description: t('about.coreValues.growth.description')
    },
    {
      icon: Award,
      title: t('about.coreValues.quality.title'),
      description: t('about.coreValues.quality.description')
    }
  ]

  const techStack = [
    {
      icon: Brain,
      title: t('about.techStack.mediapipe.title'),
      description: t('about.techStack.mediapipe.description')
    },
    {
      icon: Zap,
      title: t('about.techStack.tensorflow.title'),
      description: t('about.techStack.tensorflow.description')
    },
    {
      icon: Camera,
      title: t('about.techStack.ar.title'),
      description: t('about.techStack.ar.description')
    },
    {
      icon: BarChart3,
      title: t('about.techStack.visia.title'),
      description: t('about.techStack.visia.description')
    }
  ]

  const milestones = [
    {
      year: t('about.milestones.q1_2024.year'),
      title: t('about.milestones.q1_2024.title'),
      description: t('about.milestones.q1_2024.description')
    },
    {
      year: t('about.milestones.q2_2024.year'),
      title: t('about.milestones.q2_2024.title'),
      description: t('about.milestones.q2_2024.description')
    },
    {
      year: t('about.milestones.q3_2024.year'),
      title: t('about.milestones.q3_2024.title'),
      description: t('about.milestones.q3_2024.description')
    },
    {
      year: t('about.milestones.q1_2025.year'),
      title: t('about.milestones.q1_2025.title'),
      description: t('about.milestones.q1_2025.description')
    }
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
                  {t('about.hero.badge')}
                </Badge>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase"
              >
                {t('about.hero.title')}
                <br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6">
                  {t('about.hero.subtitle')}
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-slate-500 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-tight italic"
              >
                {t('about.hero.description')}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-8 justify-center pt-6"
              >
                <Button size="xl" variant="premium" className="h-18 px-14 rounded-2xl shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" asChild>
                  <Link href={lp('/analysis')}>
                    {t('about.hero.tryFree')}
                    <ArrowRight className="ml-4 h-6 w-6" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="h-18 px-14 rounded-2xl border-slate-200 bg-white/50 text-slate-950 backdrop-blur-md hover:bg-slate-50 hover:border-pink-500/30 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-premium italic" asChild>
                  <Link href={lp('/contact')}>{t('about.hero.contactUs')}</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Vision - Precision Architecture */}
        <section className="py-32 lg:py-48 relative">
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden group hover:border-pink-500/20 transition-all duration-700 relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-12 relative">
                    <div className="mb-12 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-110 group-hover:bg-pink-50 group-hover:border-pink-500/20 transition-all duration-700">
                      <Target className="h-10 w-10 text-slate-300 group-hover:text-pink-600 transition-colors" />
                    </div>
                    <h2 className="mb-8 text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                      {t('about.vision.title')}
                    </h2>
                    <p className="text-xl text-slate-500 font-light leading-relaxed italic">
                      {t('about.vision.description')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden group hover:border-blue-500/20 transition-all duration-700 relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-12 relative">
                    <div className="mb-12 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-110 group-hover:bg-blue-50 group-hover:border-blue-500/20 transition-all duration-700">
                      <Sparkles className="h-10 w-10 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h2 className="mb-8 text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                      {t('about.mission.title')}
                    </h2>
                    <p className="text-xl text-slate-500 font-light leading-relaxed italic">
                      {t('about.mission.description')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values - Luxury Aesthetic Cards */}
        <section className="py-32 lg:py-48 border-y border-slate-100 bg-slate-50/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="mx-auto mb-24 max-w-2xl text-center space-y-8">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase">
                {t('about.coreValues.title')}
              </h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-pink-500 to-blue-600 mx-auto rounded-full" />
              <p className="text-xl text-slate-500 font-light tracking-tight italic">
                {t('about.coreValues.subtitle')}
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {coreValues.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[3rem] hover:border-pink-500/30 transition-all duration-700 group">
                    <CardContent className="p-10 space-y-10 flex flex-col justify-between">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-110 group-hover:bg-pink-50 group-hover:border-pink-100 transition-all duration-700 shadow-sm">
                        <value.icon className="h-8 w-8 text-slate-300 group-hover:text-pink-600 transition-colors shadow-glow-pink/20" />
                      </div>
                      <div className="space-y-5">
                        <h3 className="text-xl font-black text-slate-950 italic tracking-tight uppercase group-hover:text-pink-600 transition-colors">{value.title}</h3>
                        <p className="text-sm text-slate-500 font-light leading-relaxed italic">
                          {value.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack - Aesthetic Infrastructure */}
        <section className="py-32 lg:py-48 relative bg-white">
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="mx-auto mb-24 max-w-2xl text-center space-y-8">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase">
                {t('about.techStack.title')}
              </h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full" />
              <p className="text-xl text-slate-500 font-light tracking-tight italic">
                {t('about.techStack.subtitle')}
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {techStack.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[2.5rem] hover:border-blue-500/20 hover:bg-slate-50/50 transition-all duration-700 group text-center">
                    <CardContent className="p-10 space-y-8">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-500 shadow-sm">
                        <tech.icon className="h-8 w-8 text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xl font-black text-slate-950 italic tracking-tight uppercase group-hover:text-blue-600 transition-colors">{tech.title}</h3>
                        <p className="text-[10px] text-slate-400 font-black leading-relaxed uppercase tracking-[0.2em] italic">
                          {tech.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones - High-End Timeline */}
        <section className="py-32 lg:py-48 border-y border-slate-100 bg-slate-50/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="mx-auto mb-24 max-w-2xl text-center space-y-8">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase">
                {t('about.milestones.title')}
              </h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-pink-500 to-blue-600 mx-auto rounded-full" />
              <p className="text-xl text-slate-500 font-light tracking-tight italic">
                {t('about.milestones.subtitle')}
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="space-y-16">
                {milestones.map((milestone, index) => (
                  <motion.div 
                    key={index} 
                    className="flex gap-10 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-premium text-lg font-black italic group-hover:scale-110 group-hover:bg-pink-50 group-hover:text-pink-600 transition-all duration-500">
                        {index + 1}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="mt-6 h-full w-1 bg-slate-100 rounded-full group-hover:bg-pink-100 transition-colors duration-700" />
                      )}
                    </div>
                    <Card className="flex-1 border-slate-100 bg-white shadow-premium rounded-[3rem] group-hover:border-pink-500/20 transition-all duration-700 overflow-hidden relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-10 space-y-6">
                        <Badge className="bg-pink-50 text-pink-600 border-none px-6 py-2 rounded-full uppercase tracking-widest text-[10px] font-black italic shadow-sm" variant="outline">
                          {milestone.year}
                        </Badge>
                        <h3 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{milestone.title}</h3>
                        <p className="text-lg text-slate-500 font-light leading-relaxed italic">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats - Precision Metrics */}
        <section className="py-32 lg:py-48 bg-white relative">
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="grid gap-16 md:grid-cols-4">
              {[
                { label: t('about.stats.images'), val: t('about.stats.imagesVal'), color: "text-pink-600" },
                { label: t('about.stats.accuracy'), val: t('about.stats.accuracyVal'), color: "text-blue-600" },
                { label: t('about.stats.time'), val: t('about.stats.timeVal'), color: "text-purple-600" },
                { label: t('about.stats.metrics'), val: t('about.stats.metricsVal'), color: "text-emerald-600" }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  className="text-center space-y-6 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className={cn("text-6xl font-black tracking-tighter italic uppercase group-hover:scale-110 transition-transform duration-500", stat.color)}>{stat.val}</div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-1.5 w-8 bg-slate-50 rounded-full group-hover:w-16 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-blue-600 transition-all duration-500 shadow-inner" />
                    <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.4em] italic group-hover:text-slate-950 transition-colors">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Deployment CTA - Cinematic Section */}
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
                  {t('about.cta.title')}
                </h2>
                <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto italic tracking-tight">
                  {t('about.cta.description')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
                <Button size="xl" variant="premium" className="h-20 px-16 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white border-none italic" asChild>
                  <Link href={lp('/analysis')}>
                    <Sparkles className="mr-4 h-7 w-7" />
                    {t('about.cta.tryFree')}
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="h-20 px-16 rounded-[2rem] border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 italic shadow-premium"
                  asChild
                >
                  <Link href={lp('/contact')}>{t('about.cta.contactUs')}</Link>
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
