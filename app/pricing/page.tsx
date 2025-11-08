"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  CheckCircle2, 
  X,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Crown,
  Building2
} from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export default function PricingPage() {
  const { language } = useLanguage()

  const pricingTiers = [
    {
      name: language === "th" ? "ใช้ฟรี" : "Free Tier",
      badge: language === "th" ? "เริ่มต้นใช้งาน" : "Get Started",
      icon: Sparkles,
      price: language === "th" ? "ฟรี" : "Free",
      period: language === "th" ? "ตลอดไป" : "Forever",
      description: language === "th" 
        ? "เหมาะสำหรับผู้ที่ต้องการทดลองใช้ระบบ AI Skin Analysis"
        : "Perfect for trying out AI Skin Analysis",
      features: [
        { text: language === "th" ? "✅ AI Skin Analysis พื้นฐาน" : "✅ Basic AI Skin Analysis", included: true },
        { text: language === "th" ? "✅ วิเคราะห์ 8 ตัวชี้วัดผิว (VISIA)" : "✅ 8 VISIA Skin Metrics", included: true },
        { text: language === "th" ? "✅ ผลลัพธ์ทันที" : "✅ Instant Results", included: true },
        { text: language === "th" ? "✅ ไม่ต้องลงทะเบียน" : "✅ No Registration Required", included: true },
        { text: language === "th" ? "❌ ไม่บันทึกประวัติ" : "❌ No History Saved", included: false },
        { text: language === "th" ? "❌ ไม่มี AR Simulator" : "❌ No AR Simulator", included: false },
        { text: language === "th" ? "❌ ไม่มีการเปรียบเทียบผล" : "❌ No Result Comparison", included: false },
        { text: language === "th" ? "❌ ไม่มีคำแนะนำส่วนตัว" : "❌ No Personalized Recommendations", included: false }
      ],
      cta: language === "th" ? "เริ่มวิเคราะห์ฟรี" : "Start Free Analysis",
      href: "/analysis",
      variant: "outline" as const
    },
    {
      name: language === "th" ? "Premium" : "Premium",
      badge: language === "th" ? "ยอดนิยม" : "Most Popular",
      icon: Crown,
      price: language === "th" ? "฿4,900" : "฿4,900",
      period: language === "th" ? "ต่อเดือน" : "per month",
      description: language === "th" 
        ? "เหมาะสำหรับคลินิกขนาดเล็กถึงกลาง พร้อมฟีเจอร์ครบครัน"
        : "Perfect for small to medium clinics with full features",
      features: [
        { text: language === "th" ? "✅ AI Skin Analysis ขั้นสูง" : "✅ Advanced AI Skin Analysis", included: true },
        { text: language === "th" ? "✅ AR Treatment Simulator" : "✅ AR Treatment Simulator", included: true },
        { text: language === "th" ? "✅ บันทึกประวัติไม่จำกัด" : "✅ Unlimited History", included: true },
        { text: language === "th" ? "✅ เปรียบเทียบผลก่อน-หลัง" : "✅ Before/After Comparison", included: true },
        { text: language === "th" ? "✅ คำแนะนำส่วนตัว AI" : "✅ AI Personalized Recommendations", included: true },
        { text: language === "th" ? "✅ Sales Dashboard" : "✅ Sales Dashboard", included: true },
        { text: language === "th" ? "✅ รายงานและ Analytics" : "✅ Reports & Analytics", included: true },
        { text: language === "th" ? "✅ Email Support" : "✅ Email Support", included: true }
      ],
      cta: language === "th" ? "เริ่มใช้งาน Premium" : "Get Premium",
      href: "/contact",
      variant: "default" as const,
      popular: true
    },
    {
      name: language === "th" ? "Enterprise" : "Enterprise",
      badge: language === "th" ? "หลายสาขา" : "Multi-Branch",
      icon: Building2,
      price: language === "th" ? "ติดต่อเรา" : "Custom",
      period: language === "th" ? "ราคาพิเศษ" : "Special Price",
      description: language === "th" 
        ? "สำหรับคลินิกหลายสาขา พร้อมการปรับแต่งและซัพพอร์ตเฉพาะทาง"
        : "For multi-branch clinics with customization and dedicated support",
      features: [
        { text: language === "th" ? "✅ ฟีเจอร์ Premium ทั้งหมด" : "✅ All Premium Features", included: true },
        { text: language === "th" ? "✅ Multi-Clinic Management" : "✅ Multi-Clinic Management", included: true },
        { text: language === "th" ? "✅ Custom Branding" : "✅ Custom Branding", included: true },
        { text: language === "th" ? "✅ API Integration" : "✅ API Integration", included: true },
        { text: language === "th" ? "✅ Dedicated Support 24/7" : "✅ Dedicated Support 24/7", included: true },
        { text: language === "th" ? "✅ Custom Development" : "✅ Custom Development", included: true },
        { text: language === "th" ? "✅ Training & Onboarding" : "✅ Training & Onboarding", included: true },
        { text: language === "th" ? "✅ SLA Guarantee" : "✅ SLA Guarantee", included: true }
      ],
      cta: language === "th" ? "ติดต่อฝ่ายขาย" : "Contact Sales",
      href: "/contact",
      variant: "outline" as const
    }
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-muted/30 to-background py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-primary/10 text-primary" variant="secondary">
                <TrendingUp className="mr-2 h-3 w-3" />
                {language === "th" ? "แพ็กเกจราคา" : "Pricing Plans"}
              </Badge>

              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                {language === "th" ? "เลือกแพ็กเกจที่" : "Choose the Plan"}
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {language === "th" ? "เหมาะกับธุรกิจคุณ" : "That Fits Your Business"}
                </span>
              </h1>

              <p className="mb-8 text-balance text-lg text-muted-foreground leading-relaxed">
                {language === "th" 
                  ? "เริ่มต้นฟรีและอัพเกรดเมื่อคุณพร้อม ไม่มีค่าธรรมเนียมแอบแฝง"
                  : "Start free and upgrade when you're ready. No hidden fees."}
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {language === "th" ? "ทดลองฟรีไม่ต้องใช้บัตรเครดิต" : "Free trial without credit card"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {language === "th" ? "ยกเลิกได้ทุกเมื่อ" : "Cancel anytime"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-3">
              {pricingTiers.map((tier) => {
                const Icon = tier.icon
                return (
                  <Card 
                    key={tier.name} 
                    className={`relative border-2 transition-all hover:shadow-xl ${
                      tier.popular ? 'border-primary shadow-lg lg:scale-105' : ''
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute left-0 right-0 top-0 flex justify-center">
                        <Badge className="rounded-b-md rounded-t-none bg-primary px-3 py-1">
                          {tier.badge}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className={tier.popular ? 'pt-8' : ''}>
                      <div className="mb-4 flex items-center justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                          tier.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        {!tier.popular && (
                          <Badge variant="outline">{tier.badge}</Badge>
                        )}
                      </div>
                      
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <CardDescription className="min-h-12">{tier.description}</CardDescription>
                      
                      <div className="mt-6">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        {tier.period && (
                          <span className="ml-2 text-muted-foreground">/ {tier.period}</span>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <Button 
                        className="mb-6 w-full" 
                        variant={tier.variant}
                        asChild
                      >
                        <Link href={tier.href}>
                          {tier.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>

                      <div className="space-y-3">
                        {tier.features.map((feature, index) => (
                          <div 
                            key={index} 
                            className={`flex items-start gap-2 text-sm ${
                              !feature.included ? 'text-muted-foreground' : ''
                            }`}
                          >
                            {feature.included ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span>{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {language === "th" ? "เปรียบเทียบฟีเจอร์" : "Feature Comparison"}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {language === "th" 
                  ? "ดูฟีเจอร์ทั้งหมดที่มีในแต่ละแพ็กเกจ"
                  : "See all features available in each package"}
              </p>
            </div>

            <Card className="overflow-x-auto">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-4 text-left font-semibold">
                        {language === "th" ? "ฟีเจอร์" : "Features"}
                      </th>
                      <th className="px-6 py-4 text-center font-semibold">Free</th>
                      <th className="px-6 py-4 text-center font-semibold">Premium</th>
                      <th className="px-6 py-4 text-center font-semibold">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">{language === "th" ? "AI Skin Analysis" : "AI Skin Analysis"}</td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b bg-muted/50">
                      <td className="px-6 py-4">{language === "th" ? "8 ตัวชี้วัด VISIA" : "8 VISIA Metrics"}</td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">{language === "th" ? "บันทึกประวัติ" : "Save History"}</td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b bg-muted/50">
                      <td className="px-6 py-4">{language === "th" ? "AR Simulator" : "AR Simulator"}</td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">{language === "th" ? "Dashboard & Analytics" : "Dashboard & Analytics"}</td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b bg-muted/50">
                      <td className="px-6 py-4">{language === "th" ? "หลายสาขา" : "Multi-Branch"}</td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">{language === "th" ? "Support 24/7" : "Support 24/7"}</td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><X className="mx-auto h-5 w-5 text-muted-foreground" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-primary" /></td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {language === "th" ? "คำถามที่พบบ่อย" : "Frequently Asked Questions"}
              </h2>
            </div>

            <div className="mx-auto max-w-3xl space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "th" ? "Free Tier มีข้อจำกัดอะไรบ้าง?" : "What are the limitations of Free Tier?"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {language === "th" 
                      ? "Free Tier สามารถใช้วิเคราะห์ผิวได้ไม่จำกัด แต่จะไม่มีการบันทึกประวัติ ไม่มี AR Simulator และไม่มีฟีเจอร์ส่วนตัว"
                      : "Free Tier allows unlimited skin analysis but doesn't save history, include AR Simulator, or personal features"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "th" ? "สามารถยกเลิกได้ทุกเมื่อหรือไม่?" : "Can I cancel anytime?"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {language === "th" 
                      ? "ได้ค่ะ สามารถยกเลิกได้ทุกเมื่อโดยไม่มีค่าปรับ และจะยังใช้งานได้จนถึงสิ้นสุดรอบบิล"
                      : "Yes, you can cancel anytime without penalty and continue using until the end of billing period"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "th" ? "Enterprise Package เหมาะสำหรับใคร?" : "Who is Enterprise Package for?"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {language === "th" 
                      ? "เหมาะสำหรับคลินิกที่มีหลายสาขา ต้องการ Custom Branding หรือต้องการ Support แบบเฉพาะทาง"
                      : "Perfect for multi-branch clinics, those needing custom branding, or dedicated support"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-y border-border bg-primary py-20 text-primary-foreground">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {language === "th" ? "พร้อมที่จะเริ่มต้นแล้วหรือยัง?" : "Ready to Get Started?"}
              </h2>
              <p className="mb-8 text-balance text-lg text-primary-foreground/90 leading-relaxed">
                {language === "th" 
                  ? "เริ่มต้นฟรีวันนี้ ไม่ต้องใช้บัตรเครดิต"
                  : "Start free today, no credit card required"}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/analysis">
                    {language === "th" ? "เริ่มวิเคราะห์ฟรี" : "Start Free Analysis"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/contact">{language === "th" ? "ติดต่อฝ่ายขาย" : "Contact Sales"}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
