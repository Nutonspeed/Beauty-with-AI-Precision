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
                  {t('about.hero.badge')}
                </Badge>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-tight"
              >
                {t('about.hero.title')}
                <br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent italic">
                  {t('about.hero.subtitle')}
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-slate-400 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-wide"
              >
                {t('about.hero.description')}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center pt-4"
              >
                <Button size="xl" variant="premium" className="h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-lg font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all" asChild>
                  <Link href={lp('/analysis')}>
                    {t('about.hero.tryFree')}
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="h-16 px-12 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 text-lg font-bold tracking-wide transition-all hover:scale-105 active:scale-95" asChild>
                  <Link href={lp('/contact')}>{t('about.hero.contactUs')}</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Vision - Precision Architecture */}
        <section className="py-32 lg:py-48 relative">
          <div className="container relative z-10">
            <div className="grid gap-10 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden group hover:border-white/10 transition-all duration-700 shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                  <CardContent className="p-12 relative">
                    <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 border border-pink-500/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
                      <Target className="h-8 w-8 text-pink-400" />
                    </div>
                    <h2 className="mb-6 text-3xl font-bold text-white tracking-tight italic">
                      {t('about.vision.title')}
                    </h2>
                    <p className="text-xl text-slate-400 font-light leading-relaxed">
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
                <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden group hover:border-white/10 transition-all duration-700 shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  <CardContent className="p-12 relative">
                    <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
                      <Sparkles className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h2 className="mb-6 text-3xl font-bold text-white tracking-tight italic">
                      {t('about.mission.title')}
                    </h2>
                    <p className="text-xl text-slate-400 font-light leading-relaxed">
                      {t('about.mission.description')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values - Luxury Aesthetic Cards */}
        <section className="py-32 lg:py-48 border-y border-white/5 bg-white/[0.01]">
          <div className="container relative z-10">
            <div className="mx-auto mb-24 max-w-2xl text-center space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                {t('about.coreValues.title')}
              </h2>
              <div className="h-1 w-20 bg-pink-500/50 mx-auto rounded-full" />
              <p className="text-xl text-slate-400 font-light tracking-wide">
                {t('about.coreValues.subtitle')}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {coreValues.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-md rounded-[2.5rem] hover:border-white/10 hover:bg-white/[0.03] transition-all duration-500 group">
                    <CardContent className="p-10 space-y-8">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 group-hover:scale-110 group-hover:border-pink-500/30 transition-all duration-500 shadow-inner">
                        <value.icon className="h-6 w-6 text-slate-400 group-hover:text-pink-400 transition-colors" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-pink-400 transition-colors">{value.title}</h3>
                        <p className="text-sm text-slate-500 font-light leading-relaxed">
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
        <section className="py-32 lg:py-48 relative">
          <div className="container relative z-10">
            <div className="mx-auto mb-24 max-w-2xl text-center space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                {t('about.techStack.title')}
              </h2>
              <div className="h-1 w-20 bg-cyan-500/50 mx-auto rounded-full" />
              <p className="text-xl text-slate-400 font-light tracking-wide">
                {t('about.techStack.subtitle')}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {techStack.map((tech, index) => (
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
                        <tech.icon className="h-6 w-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">{tech.title}</h3>
                        <p className="text-xs text-slate-500 font-light leading-relaxed uppercase tracking-widest">
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
        <section className="py-32 lg:py-48 border-y border-white/5 bg-white/[0.01]">
          <div className="container relative z-10">
            <div className="mx-auto mb-24 max-w-2xl text-center space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                {t('about.milestones.title')}
              </h2>
              <div className="h-1 w-20 bg-pink-500/50 mx-auto rounded-full" />
              <p className="text-xl text-slate-400 font-light tracking-wide">
                {t('about.milestones.subtitle')}
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <motion.div 
                    key={index} 
                    className="flex gap-8 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-black italic shadow-inner group-hover:bg-pink-600 group-hover:text-white transition-all duration-500">
                        {index + 1}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="mt-4 h-full w-px bg-gradient-to-b from-pink-500/30 to-transparent" />
                      )}
                    </div>
                    <Card className="flex-1 border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] group-hover:border-white/10 transition-all duration-500 overflow-hidden relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <CardContent className="p-8 space-y-4">
                        <Badge className="bg-white/[0.03] text-slate-500 border-white/10 px-4 py-1 rounded-full uppercase tracking-widest text-[9px] font-black group-hover:text-pink-400 group-hover:border-pink-500/30 transition-colors" variant="outline">
                          {milestone.year}
                        </Badge>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{milestone.title}</h3>
                        <p className="text-slate-400 font-light leading-relaxed">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats - Precision Metrics */}
        <section className="py-32 lg:py-48">
          <div className="container">
            <div className="grid gap-12 md:grid-cols-4">
              {[
                { label: t('about.stats.images'), val: t('about.stats.imagesVal'), color: "text-pink-400" },
                { label: t('about.stats.accuracy'), val: t('about.stats.accuracyVal'), color: "text-cyan-400" },
                { label: t('about.stats.time'), val: t('about.stats.timeVal'), color: "text-purple-400" },
                { label: t('about.stats.metrics'), val: t('about.stats.metricsVal'), color: "text-emerald-400" }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  className="text-center space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className={`text-5xl font-bold tracking-tighter ${stat.color}`}>{stat.val}</div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em]">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Deployment CTA - Bold Cinematic Section */}
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
                  {t('about.cta.title')}
                </h2>
                <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
                  {t('about.cta.description')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <Button size="xl" variant="premium" className="h-20 px-16 rounded-3xl shadow-2xl shadow-pink-500/20 text-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all" asChild>
                  <Link href={lp('/analysis')}>
                    {t('about.cta.tryFree')}
                    <ArrowRight className="mr-4 h-7 w-7" />
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="h-20 px-16 rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 text-xl font-bold tracking-wide transition-all hover:scale-105 active:scale-95"
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
