"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Sparkles, Shield, Zap, Users, BarChart3, Camera, CheckCircle2, ArrowRight, Brain } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { useLocale } from "next-intl"
import RoiMiniCalculator from "@/components/roi/roi-mini-calculator"
import { useEffect, useRef } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { motion } from "framer-motion"

export default function HomePage() {
  const { t } = useLanguage()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const heroRef = useRef<HTMLElement | null>(null)
  const caseStudyRef = useRef<HTMLElement | null>(null)

  // Page view
  useEffect(() => {
    usageTracker.trackPageView("home")
  }, [])


  // Analytics: time in hero viewport -> usageTracker
  useEffect(() => {
    if (globalThis.window === undefined) { return }
    const el = heroRef.current
    if (!el) return
    let inView = false
    let enterAt = 0
    let total = 0
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.2)
        const now = performance.now()
        if (vis && !inView) { inView = true; enterAt = now }
        else if (!vis && inView) { inView = false; total += now - enterAt }
      },
      { root: null, threshold: [0, 0.2, 0.5, 1] }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      try {
        const ms = Math.round(total)
        usageTracker.trackEvent({
          event: "hero_time_in_view_ms",
          category: "engagement",
          metadata: { page: "home", ms },
        })
      } catch {}
    }
  }, [])

  // Analytics: scroll depth -> usageTracker
  useEffect(() => {
    if (globalThis.window === undefined) { return }
    let maxDepth = 0
    const onScroll = () => {
      const h = document.documentElement
      const docH = h.scrollHeight - h.clientHeight
      if (docH <= 0) return
      const depth = Math.min(100, Math.round((globalThis.scrollY / docH) * 100))
      if (depth > maxDepth) {
        maxDepth = depth
        if (depth === 25 || depth === 50 || depth === 75 || depth === 100) {
          try {
            usageTracker.trackEvent({
              event: "page_scroll_depth",
              category: "engagement",
              metadata: { page: "home", depth },
            })
          } catch {}
        }
      }
    }
    globalThis.addEventListener("scroll", onScroll as EventListener, { passive: true } as AddEventListenerOptions)
    onScroll()
    return () => globalThis.removeEventListener("scroll", onScroll as EventListener)
  }, [])


  const onHeroCta = () => {
    try {
      usageTracker.trackEvent({
        event: "hero_primary_cta_click",
        category: "engagement",
        metadata: { page: "home" },
      })
    } catch {}
  }

  const onDemoCta = () => {
    try {
      usageTracker.trackEvent({
        event: "hero_secondary_cta_click",
        category: "engagement",
        metadata: { page: "home" },
      })
    } catch {}
  }

  // Case study teaser view tracking (fire once)
  useEffect(() => {
    if (globalThis.window === undefined) { return }
    const el = caseStudyRef.current
    if (!el) return
    let fired = false
    const io = new IntersectionObserver(
      (entries) => {
        if (fired) return
        const vis = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.3)
        if (vis) {
          fired = true
          try {
            usageTracker.trackEvent({
              event: "case_study_view",
              category: "engagement",
              metadata: { page: "home", position: "teaser" },
            })
          } catch {}
          io.disconnect()
        }
      },
      { root: null, threshold: [0, 0.3, 0.6] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Structured data (Organization + WebSite). Since this page is a client component we hydrate on client; we still embed JSON-LD for crawlers.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Beauty with AI Precision",
      "url": siteUrl,
      "logo": `${siteUrl}/og-interactive-sphere.svg`,
      "description": isThaiLocale ? "แพลตฟอร์มวิเคราะห์ผิวและความงามด้วย AI" : "AI-powered dermatology & aesthetic analysis platform",
      "sameAs": []
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": siteUrl,
      "name": "Beauty with AI Precision",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/search?q={query}`,
        "query-input": "required name=query"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "AI Skin Analysis Free Tier",
      "serviceType": "Skin analysis",
      "provider": { "@type": "Organization", "name": "Beauty with AI Precision" },
      "offers": { "@type": "Offer", "price": 0, "priceCurrency": "USD" }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "AI Skin Analysis Premium",
      "serviceType": "Advanced skin and treatment planning analysis",
      "provider": { "@type": "Organization", "name": "Beauty with AI Precision" },
      "offers": { "@type": "Offer", "price": 49, "priceCurrency": "USD" }
    }
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Modern Minimal Design */}
        <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
          </div>
          
          <div className="container relative py-20">
            <div className="mx-auto max-w-4xl text-center">
              {/* Subtle tag */}
              <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm animate-in fade-in duration-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-white/70">AI-Powered Aesthetic Analysis</span>
              </div>

              {/* Main headline with gradient */}
              <h1 className="mb-6 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 font-display">
                <span className="text-white font-thai-mobile">
                  {isThaiLocale ? 'จากการสแกนผิวหน้า' : 'From Facial Scans'}
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent font-thai-mobile">
                  {isThaiLocale ? 'ถึงประสบการณ์คลินิกอัจฉริยะครบวงจร' : 'To Intelligent Clinic Experience'}
                </span>
              </h1>

              {/* Subtitle - clearer platform positioning for sales teams */}
              <p className="mb-10 text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 font-thai-mobile">
                {isThaiLocale 
                  ? 'แพลตฟอร์ม AI / AR สำหรับคลินิกความงาม ที่ช่วยให้ทีมเซลสามารถวิเคราะห์ผิวและจำลองผลลัพธ์ให้ลูกค้าเห็นจากที่บ้านได้ทันที'
                  : 'AI/AR platform for aesthetic clinics that helps sales teams analyze skin and simulate results for customers remotely'
                }
                <br className="hidden md:block" />
                {isThaiLocale 
                  ? 'เชื่อมต่อทีมแพทย์ ทีมเซล และลูกค้า ให้อยู่ใน workflow เดียวกัน เพิ่ม conversion และปิดการขายได้มากขึ้นโดยไม่ต้องนัดเข้าคลินิกทุกครั้ง'
                  : 'Connect doctors, sales teams, and customers in one workflow, increase conversion and close sales without requiring clinic visits every time'
                }
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                <Button size="lg" asChild className="w-full sm:w-auto text-base px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                  <Link href="/analysis" onClick={onHeroCta}>
                    {isThaiLocale ? 'เริ่มวิเคราะห์ฟรี' : 'Start Free Analysis'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-base px-8 py-6 border-white/20 text-white hover:bg-white/10">
                  <Link href="/demo/skin-analysis" onClick={onDemoCta}>
                    {isThaiLocale ? 'ดูตัวอย่าง' : 'View Demo'}
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40 animate-in fade-in duration-700 delay-700">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {isThaiLocale ? 'ไม่ต้องใช้บัตรเครดิต' : 'No credit card required'}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {isThaiLocale ? 'ทดลองใช้ฟรี' : 'Free trial available'}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {isThaiLocale ? 'ตั้งค่าใน 5 นาที' : 'Setup in 5 minutes'}
                </span>
                </div>
            </div>
          </div>
        </section>

        {/* ROI Mini-Calculator */}
        <section className="py-8 md:py-10">
          <div className="container">
            <div className="mx-auto mb-6 max-w-3xl text-center">
              <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
                {isThaiLocale ? 'ประเมินมูลค่าเพิ่มใน 10 วินาที' : 'Assess Added Value in 10 Seconds'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isThaiLocale ? 'ใส่ตัวเลขของคลินิกคุณเพื่อดูผลกระทบโดยประมาณจาก AI' : 'Enter your clinic numbers to see estimated AI impact'}
              </p>
            </div>
            <div className="mx-auto max-w-5xl">
              <RoiMiniCalculator />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-y border-border bg-gradient-to-b from-background to-muted/30 py-24">
          <div className="container">
            <motion.div 
              className="mx-auto mb-16 max-w-2xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4 px-4 py-1">
                <Sparkles className="mr-2 h-3 w-3" />
                Features
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl font-display">
                {isThaiLocale ? 'ทำไมต้องเลือกเรา' : 'Why Choose Our Platform'}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed text-lg">
                {isThaiLocale ? 'เครื่องมือระดับมืออาชีพสำหรับคลินิกความงาม' : 'Professional Tools for Aesthetic Clinics'}
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                      <Brain className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold">
                      {isThaiLocale ? 'วิเคราะห์ด้วย AI' : 'AI-Powered Analysis'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {isThaiLocale 
                        ? 'วิเคราะห์ผิว 8 จุด ความแม่นยำระดับการแพทย์ 95-99%'
                        : '8-point comprehensive skin analysis with 95-99% medical-grade accuracy'
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500/5 to-pink-500/5 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                      <Camera className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold">
                      {isThaiLocale ? 'จำลองด้วย AR' : 'AR Visualization'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {isThaiLocale 
                        ? 'ดูผลลัพธ์การรักษาแบบ real-time ก่อนทำจริง'
                        : 'Real-time AR preview of treatment results before actual procedures'
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                      <Shield className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold">
                      {isThaiLocale ? 'ปฏิบัติตาม PDPA' : 'PDPA Compliant'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {isThaiLocale 
                        ? 'จัดการข้อมูลเข้ารหัสปลอดภัย ตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล'
                        : 'Secure, encrypted data management following Thai personal data protection laws'
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-500/5 to-amber-500/5 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
                      <BarChart3 className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold">
                      {isThaiLocale ? 'แดชบอร์ดระดับ VISIA' : 'VISIA-Style Dashboard'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {isThaiLocale 
                        ? 'รายงานระดับมืออาชีพ เทียบเท่าอุปกรณ์ VISIA มูลค่าหลายล้าน'
                        : 'Professional reporting comparable to million-dollar VISIA equipment'
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                      <Zap className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold">
                      {isThaiLocale ? 'รวดเร็ว & แม่นยำ' : 'Fast & Accurate'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {isThaiLocale 
                        ? 'วิเคราะห์สำเร็จใน 3-5 วินาที พร้อมคำแนะนำส่วนตัว'
                        : 'Complete analysis in 3-5 seconds with personalized recommendations'
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-rose-500/5 to-red-500/5 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 shadow-lg">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold">
                      {isThaiLocale ? 'รองรับหลายคลินิก' : 'Multi-Clinic Support'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {isThaiLocale 
                        ? 'รองรับหลายสาขาพร้อม CRM และระบบนัดหมาย'
                        : 'Multi-branch support with integrated CRM and appointment system'
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl font-display">
                {isThaiLocale ? 'วิธีการทำงาน' : 'How It Works'}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {isThaiLocale 
                  ? 'ขั้นตอนง่ายๆ เพื่อเริ่มวิเคราะห์ผิวหน้า'
                  : 'Simple 3-step process to get professional skin analysis'
                }
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {isThaiLocale ? 'อัปโหลดรูปภาพ' : 'Upload Photo'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {isThaiLocale 
                    ? 'ถ่ายหรืออัปโหลดรูปใบหน้า\นำรองรับทุกอุปกรณ์'
                    : 'Capture or upload facial photo\nSupports all devices'
                  }
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {isThaiLocale ? 'วิเคราะห์ด้วย AI' : 'AI Analysis'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {isThaiLocale 
                    ? 'วิเคราะห์ผิว 8 จุดด้วย AI\nเสร็จใน 3-5 วินาที'
                    : '8-point AI skin analysis\nCompletes in 3-5 seconds'
                  }
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {isThaiLocale ? 'รับผลลัพธ์' : 'Get Results'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {isThaiLocale 
                    ? 'รับรายงานละเอียดและคำแนะนำ\นำพร้อมจำลองด้วย AR'
                    : 'Receive detailed report and recommendations\nwith AR Visualization'
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Case Study Teaser */}
  <section ref={caseStudyRef} className="border-y border-border/60 bg-background py-12">
          <div className="container">
            <div className="mx-auto grid max-w-5xl items-stretch gap-6 md:grid-cols-3">
              <Card className="md:col-span-2 border-2 border-border/70 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Case study</div>
                  <h3 className="mb-2 text-xl font-semibold">ลดเวลารอคิวเฉลี่ย 37% ภายใน 6 สัปดาห์</h3>
                  <p className="text-sm text-muted-foreground">คลินิก A, กรุงเทพฯ — ใช้การวิเคราะห์ผิวอัตโนมัติและเวิร์กโฟลว์ใหม่</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary/40 bg-primary/5 shadow-sm">
                <CardContent className="flex h-full flex-col justify-between p-6">
                  <div>
                    <h4 className="mb-2 text-lg font-semibold">ดูเคสตัวอย่าง</h4>
                    <p className="text-sm text-muted-foreground">ผลลัพธ์จริงจากคลินิกที่ใช้งาน</p>
                  </div>
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href="/case-studies">เปิดดูเคสศึกษา</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pre-Trust CTA: Encourage Interactive Demo */}
        <section className="border-y border-border/60 bg-background py-10">
          <div className="container">
            <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 text-center">
              <h3 className="text-xl font-semibold tracking-tight md:text-2xl">ลองเดโมแบบโต้ตอบภายใน 1 นาที</h3>
              <p className="text-sm text-muted-foreground">อัปโหลดภาพหรือใช้ตัวอย่าง เพื่อเห็นภาพระบบจริงก่อนคุยต่อ</p>
              <Button size="lg" variant="outline" asChild className="border-foreground/25 text-foreground hover:bg-foreground/5">
                <Link href="/demo/skin-analysis" onClick={onDemoCta}>ดูเดโมแบบโต้ตอบ</Link>
              </Button>
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="border-y border-border bg-primary py-20 text-primary-foreground">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl font-display">
                {isThaiLocale ? 'พร้อมเปลี่ยนแปลงคลินิกของคุณ?' : 'Ready to Transform Your Clinic?'}
              </h2>
              <p className="mb-8 text-balance text-lg text-primary-foreground/90 leading-relaxed">
                {isThaiLocale 
                  ? 'เริ่มต้นใช้งานวันนี้ ไม่ต้องใช้บัตรเครดิต'
                  : 'Start Today with No Credit Card Required'
                }
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
                  <Link href="/analysis">
                    {isThaiLocale ? 'เริ่มวิเคราะห์ฟรี' : 'Start Free Analysis'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                >
                  <Link href="/contact">
                    {isThaiLocale ? 'ติดต่อขาย' : 'Contact Sales'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tiers Preview */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl font-display">
                {isThaiLocale ? 'ราคาที่เข้าใจง่าย' : 'Simple Pricing'}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {isThaiLocale 
                  ? 'เลือกแผนที่เหมาะกับคลินิกของคุณ'
                  : 'Choose the plan that works for your clinic'
                }
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
              <Card className="border-2 border-border/70 shadow-sm">
                <CardContent className="p-8">
                  <Badge className="mb-4" variant="secondary">
                    {isThaiLocale ? 'วิเคราะห์ฟรี' : 'Free Analysis'}
                  </Badge>
                  <h3 className="mb-2 text-2xl font-bold">
                    {isThaiLocale ? 'วิเคราะห์ฟรี' : 'Free Analysis'}
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {isThaiLocale 
                      ? 'วิเคราะห์ผิว 8 จุด พร้อมรายงานพื้นฐาน'
                      : '8-point skin analysis with basic report'
                    }
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">฿0</span>
                    <span className="text-muted-foreground"> / {isThaiLocale ? 'การวิเคราะห์' : 'analysis'}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {isThaiLocale ? 'วิเคราะห์ผิว 8 จุด' : '8-point skin analysis'}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {isThaiLocale ? 'รายงานพื้นฐาน' : 'Basic report'}
                    </li>
                  </ul>
                  <Button asChild className="w-full">
                    <Link href="/analysis">
                      {isThaiLocale ? 'เริ่มวิเคราะห์ฟรี' : 'Start Free Analysis'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary shadow-md">
                <CardContent className="p-8">
                  <Badge className="mb-4 bg-primary text-primary-foreground">
                    {isThaiLocale ? 'ยอดนิยม' : 'Popular'}
                  </Badge>
                  <h3 className="mb-2 text-2xl font-bold">
                    {isThaiLocale ? 'ระดับการแพทย์' : 'Medical-Grade'}
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {isThaiLocale 
                      ? 'วิเคราะห์ไม่จำกัด พร้อมจำลอง AR และ CRM'
                      : 'Unlimited analysis with AR simulation and CRM'
                    }
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">฿1,500</span>
                    <span className="text-muted-foreground"> / {isThaiLocale ? 'เดือน' : 'month'}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{isThaiLocale ? 'วิเคราะห์ไม่จำกัด' : 'Unlimited analysis'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{isThaiLocale ? 'จำลอง AR' : 'AR simulation'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{isThaiLocale ? 'CRM แบบบูรณาการ' : 'Integrated CRM'}</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full">
                    <Link href="/contact">
                      {isThaiLocale ? 'ติดต่อขาย' : 'Contact Sales'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
