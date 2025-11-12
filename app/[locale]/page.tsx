"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Sparkles, Shield, Zap, Users, BarChart3, Camera, CheckCircle2, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { FluidWebGL } from "@/components/fluid-webgl"
import RoiMiniCalculator from "@/components/roi/roi-mini-calculator"
import { partnerLogos, complianceBadges } from "@/data/trust"
import { useEffect, useRef, useState } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"

// Prefer a lightweight canvas fallback that always works
// const FluidBackground = dynamic(() => import("@/components/visuals/fluid-background"), { ssr: false })

export default function HomePage() {
  const { t } = useLanguage()
  const [fxOn, setFxOn] = useState(true)
  const [fxDampen, setFxDampen] = useState(false)
  const trustRef = useRef<HTMLElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const caseStudyRef = useRef<HTMLElement | null>(null)

  // Page view
  useEffect(() => {
    usageTracker.trackPageView("home")
  }, [])

  // initialize toggle from storage or prefers-reduced-motion
  useEffect(() => {
    try {
      const w = globalThis.window
      if (!w) return
      const saved = w.localStorage?.getItem("heroFxOn")
      if (saved !== null) {
        setFxOn(saved === "1")
        return
      }
      if (w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setFxOn(false)
      }
    } catch {
      // ignore storage errors
    }
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

  // persist toggle
  useEffect(() => {
    try {
      const w = globalThis.window
      if (w) {
        w.localStorage?.setItem("heroFxOn", fxOn ? "1" : "0")
      }
    } catch {
      // ignore storage errors
    }
  }, [fxOn])

  // Observe Trust Wall to soften hero motion when visible
  useEffect(() => {
  if (globalThis.window === undefined) { return }
    const el = trustRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.some((e) => e.isIntersecting)
        setFxDampen(vis)
      },
      { root: null, threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const onToggleFx = () => {
    setFxOn((v) => !v)
    try {
      const w = globalThis.window
      if (w) {
        const ev = new CustomEvent("hero:fx-toggle", { detail: { on: !fxOn, ts: Date.now() } })
        globalThis.dispatchEvent(ev)
      }
    } catch {}
  }

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section ref={heroRef} className="relative overflow-hidden py-20 md:py-32">
          {fxOn && (
            /* Prefer the real david.li WebGL fluid; keep 2D as optional fallback if needed */
            <FluidWebGL dampen={fxDampen} className={`${fxDampen ? 'opacity-80' : 'opacity-95'}`} variant="simple" />
          )}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/60 via-background/25 to-transparent" />
          <div className="container relative">
            <div className="absolute right-4 top-4 z-10">
              <Button size="sm" variant="outline" aria-pressed={fxOn} onClick={onToggleFx}>
                {fxOn ? "ลดเอฟเฟกต์" : "เปิดเอฟเฟกต์"}
              </Button>
            </div>
            <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-accent/10 text-accent hover:bg-accent/20" variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />
              Medical-Grade AI Technology
            </Badge>

            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl font-display">
              {t.home.heroTitle}
              <br />
              <span className="text-primary">{t.home.heroSubtitle}</span>
            </h1>

            <p className="mb-8 text-balance text-lg text-muted-foreground leading-relaxed md:text-xl">
              {t.home.heroDescription}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="group relative w-full sm:w-auto">
                <Button size="lg" asChild className="cta-primary w-full sm:w-auto">
                  <Link href="/analysis" onClick={onHeroCta}>
                    {t.home.startFreeAnalysis}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <div className="pointer-events-none absolute left-3 right-3 -bottom-1 h-1 rounded-full bg-gradient-to-r from-primary via-accent to-primary opacity-60 blur-[2px] transition-opacity duration-300 group-hover:opacity-90" />
              </div>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-foreground/25 text-foreground hover:bg-foreground/5 bg-transparent">
                <Link href="/demo/skin-analysis" onClick={onDemoCta}>{t.home.watchDemo}</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              {t.home.noCreditCard} • {t.home.freeTierAvailable}
            </p>
            </div>
          </div>
        </section>

        {/* ROI Mini-Calculator */}
        <section className="py-8 md:py-10">
          <div className="container">
            <div className="mx-auto mb-6 max-w-3xl text-center">
              <h3 className="text-xl font-semibold tracking-tight md:text-2xl">ประเมินมูลค่าเพิ่มใน 10 วินาที</h3>
              <p className="text-sm text-muted-foreground">ใส่ตัวเลขของคลินิกคุณเพื่อดูผลกระทบโดยประมาณจาก AI</p>
            </div>
            <div className="mx-auto max-w-5xl">
              <RoiMiniCalculator />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl font-display">
                {t.home.whyChooseTitle}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t.home.whyChooseSubtitle}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 border-border/70 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.aiPowered.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.aiPowered.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/70 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Camera className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.arVisualization.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.arVisualization.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/70 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.pdpaCompliant.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.pdpaCompliant.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/70 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <BarChart3 className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.visiaStyle.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.visiaStyle.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/70 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.fastAccurate.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.fastAccurate.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/70 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t.home.features.multiClinic.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.home.features.multiClinic.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl font-display">
                {t.home.howItWorks.title}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t.home.howItWorks.subtitle}
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t.home.howItWorks.step1.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t.home.howItWorks.step1.description}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t.home.howItWorks.step2.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t.home.howItWorks.step2.description}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t.home.howItWorks.step3.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t.home.howItWorks.step3.description}
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

        {/* Trust Wall */}
        <section ref={trustRef} className="border-y border-border/60 bg-background py-16">
          <div className="container">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">Trusted by clinics and partners</h2>
              <p className="text-muted-foreground">เสียงจากผู้ใช้จริงและมาตรฐานความปลอดภัยที่คุณไว้วางใจ</p>
            </div>
            {/* Logos (real logos only, max 6) */}
            {Array.isArray(partnerLogos) && partnerLogos.some((l) => !!l.src) && (
              <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {partnerLogos
                  .filter((l) => !!l.src)
                  .slice(0, 6)
                  .map((item) => (
                    <Link
                      key={item.name}
                      href={item.href || "#"}
                      aria-label={item.name}
                      className="flex h-14 items-center justify-center rounded-md border border-border/70 bg-white/80 p-2"
                    >
                      <img src={item.src} alt={item.name} className="max-h-10 object-contain opacity-90" />
                    </Link>
                  ))}
              </div>
            )}

            {/* Testimonials removed on home: replaced by case study teaser above */}

            {/* Compliance */}
            <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-3 text-xs">
              {(complianceBadges && complianceBadges.length > 0 ? complianceBadges : [
                { label: "PDPA‑ready" },
                { label: "GDPR‑friendly" },
                { label: "Data Encryption" },
                { label: "Audit Logging" },
              ]).map((b) => (
                <span key={b.label} className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-foreground/80">{b.label}</span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-y border-border bg-primary py-20 text-primary-foreground">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl font-display">{t.home.cta.title}</h2>
              <p className="mb-8 text-balance text-lg text-primary-foreground/90 leading-relaxed">
                {t.home.cta.description}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
                  <Link href="/analysis">
                    {t.home.cta.startFreeAnalysis}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                >
                  <Link href="/contact">{t.home.cta.contactSales}</Link>
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
                {t.home.pricing.title}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t.home.pricing.subtitle}
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
              <Card className="border-2 border-border/70 shadow-sm">
                <CardContent className="p-8">
                  <Badge className="mb-4" variant="secondary">
                    {t.home.pricing.freeTier.badge}
                  </Badge>
                  <h3 className="mb-2 text-2xl font-bold">{t.home.pricing.freeTier.title}</h3>
                  <p className="mb-6 text-sm text-muted-foreground">{t.home.pricing.freeTier.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{t.home.pricing.freeTier.price}</span>
                    <span className="text-muted-foreground"> / {t.home.pricing.freeTier.period}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {t.home.pricing.freeTier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/analysis">{t.home.pricing.freeTier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary shadow-md">
                <CardContent className="p-8">
                  <Badge className="mb-4 bg-primary text-primary-foreground">{t.home.pricing.premium.badge}</Badge>
                  <h3 className="mb-2 text-2xl font-bold">{t.home.pricing.premium.title}</h3>
                  <p className="mb-6 text-sm text-muted-foreground">{t.home.pricing.premium.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{t.home.pricing.premium.price}</span>
                    <span className="text-muted-foreground"> / {t.home.pricing.premium.period}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {t.home.pricing.premium.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full">
                    <Link href="/contact">{t.home.pricing.premium.cta}</Link>
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
