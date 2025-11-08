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
} from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import Link from "next/link"

export default function FeaturesPage() {
  const { language } = useLanguage()

  const mainFeatures = [
    {
      icon: Sparkles,
      title: language === "th" ? "AI วิเคราะห์ผิวหน้า 8 จุด" : "8-Point AI Skin Analysis",
      desc: language === "th"
        ? "วิเคราะห์ปัญหาผิว 8 ด้านด้วย AI ความแม่นยำระดับ VISIA: ริ้วรอย จุดด่างดำ รูขุมขน สิว ความชุ่มชื้น ความยืดหยุ่น เนื้อสัมผัส และโทนสีผิว"
        : "Analyze 8 skin concerns with VISIA-grade AI accuracy: wrinkles, dark spots, pores, acne, moisture, elasticity, texture, and skin tone",
      features: [
        language === "th" ? "✓ ความแม่นยำ 95%+ เทียบเท่า VISIA" : "✓ 95%+ accuracy comparable to VISIA",
        language === "th" ? "✓ วิเคราะห์เสร็จภายใน 3 วินาที" : "✓ Analysis completed in 3 seconds",
        language === "th" ? "✓ รองรับ 468 Face Landmarks" : "✓ Supports 468 face landmarks",
        language === "th" ? "✓ คะแนนแต่ละจุด 0-100" : "✓ Score each point 0-100",
      ],
      color: "from-violet-500/10 to-purple-500/10",
      iconColor: "text-violet-600",
    },
    {
      icon: Eye,
      title: language === "th" ? "AR Visualization & 3D Face Model" : "AR Visualization & 3D Face Model",
      desc: language === "th"
        ? "ทดลองดูผลทรีตเมนต์แบบ Real-time ด้วย AR และ 3D Face Modeling ให้คุณเห็นภาพ Before/After ก่อนตัดสินใจทำจริง"
        : "Preview treatment results in real-time with AR and 3D Face Modeling. See Before/After visualization before committing",
      features: [
        language === "th" ? "✓ ทดลอง AR แบบ Real-time" : "✓ Real-time AR preview",
        language === "th" ? "✓ 3D Face Model ละเอียด" : "✓ Detailed 3D face model",
        language === "th" ? "✓ เปรียบเทียบ Before/After" : "✓ Before/After comparison",
        language === "th" ? "✓ แชร์ผลได้ทันที" : "✓ Instant sharing",
      ],
      color: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-600",
    },
    {
      icon: Boxes,
      title: language === "th" ? "Multi-Clinic Management" : "Multi-Clinic Management",
      desc: language === "th"
        ? "ระบบจัดการหลายสาขาในที่เดียว ติดตามผลลูกค้า จัดการทีม และวิเคราะห์ยอดขายแบบ Real-time Dashboard"
        : "Manage multiple clinics in one place. Track customer results, manage teams, and analyze sales with real-time dashboards",
      features: [
        language === "th" ? "✓ จัดการไม่จำกัดสาขา" : "✓ Unlimited clinic management",
        language === "th" ? "✓ Role-based Access Control" : "✓ Role-based access control",
        language === "th" ? "✓ Real-time Analytics" : "✓ Real-time analytics",
        language === "th" ? "✓ ข้อมูลซิงค์ทุกสาขา" : "✓ Data sync across branches",
      ],
      color: "from-emerald-500/10 to-green-500/10",
      iconColor: "text-emerald-600",
    },
    {
      icon: Shield,
      title: language === "th" ? "PDPA & GDPR Compliant" : "PDPA & GDPR Compliant",
      desc: language === "th"
        ? "ระบบรักษาความปลอดภัยข้อมูลตามมาตรฐานสากล เข้ารหัส SSL/TLS 256-bit และปฏิบัติตามกฎหมาย PDPA ของไทยอย่างเคร่งครัด"
        : "Industry-standard security with SSL/TLS 256-bit encryption. Fully compliant with Thailand's PDPA and GDPR regulations",
      features: [
        language === "th" ? "✓ SSL/TLS 256-bit Encryption" : "✓ SSL/TLS 256-bit encryption",
        language === "th" ? "✓ ผ่านมาตรฐาน PDPA" : "✓ PDPA certified",
        language === "th" ? "✓ Backup ทุกวันอัตโนมัติ" : "✓ Daily automated backups",
        language === "th" ? "✓ Access Control & Audit Logs" : "✓ Access control & audit logs",
      ],
      color: "from-orange-500/10 to-red-500/10",
      iconColor: "text-orange-600",
    },
  ]

  const additionalFeatures = [
    {
      icon: Zap,
      title: language === "th" ? "ประมวลผลเร็วสุด 3 วินาที" : "Ultra-fast 3-second Processing",
      desc: language === "th" ? "AI ประมวลผลภาพและวิเคราะห์เสร็จภายใน 3 วินาที" : "AI processes and analyzes images in just 3 seconds",
    },
    {
      icon: Users,
      title: language === "th" ? "Customer Database" : "Customer Database",
      desc: language === "th" ? "จัดเก็บประวัติลูกค้าแบบ Timeline พร้อมเปรียบเทียบผล" : "Store customer history as timeline with comparison",
    },
    {
      icon: BarChart3,
      title: language === "th" ? "Sales Analytics Dashboard" : "Sales Analytics Dashboard",
      desc: language === "th" ? "วิเคราะห์ยอดขาย Conversion Rate แบบ Real-time" : "Analyze sales and conversion rates in real-time",
    },
    {
      icon: Calendar,
      title: language === "th" ? "Booking & Appointment" : "Booking & Appointment",
      desc: language === "th" ? "ระบบจองคิวออนไลน์ มีการแจ้งเตือนอัตโนมัติ" : "Online booking system with automated notifications",
    },
    {
      icon: MessageSquare,
      title: language === "th" ? "Treatment Recommendations" : "Treatment Recommendations",
      desc: language === "th" ? "แนะนำทรีตเมนต์ที่เหมาะสมจาก AI Analysis" : "AI-powered treatment recommendations based on analysis",
    },
    {
      icon: Camera,
      title: language === "th" ? "Before/After Gallery" : "Before/After Gallery",
      desc: language === "th" ? "แกลเลอรี่เปรียบเทียบผลลูกค้าแบบ Interactive" : "Interactive before/after customer result gallery",
    },
    {
      icon: Cpu,
      title: language === "th" ? "MediaPipe + TensorFlow.js" : "MediaPipe + TensorFlow.js",
      desc: language === "th" ? "ใช้เทคโนโลยี AI ล่าสุดจาก Google" : "Powered by Google's latest AI technology",
    },
    {
      icon: Scan,
      title: language === "th" ? "468 Face Landmarks" : "468 Face Landmarks",
      desc: language === "th" ? "วิเคราะห์ใบหน้าด้วย 468 จุดอ้างอิงความละเอียดสูง" : "Analyze face with 468 high-precision landmarks",
    },
  ]

  const comparisonData = [
    {
      feature: language === "th" ? "ความแม่นยำ" : "Accuracy",
      ours: "95%+",
      competitor: "85-90%",
    },
    {
      feature: language === "th" ? "ความเร็ว" : "Speed",
      ours: "3 วินาที / 3 sec",
      competitor: "10-15 วินาที / sec",
    },
    {
      feature: language === "th" ? "จุดวิเคราะห์" : "Analysis Points",
      ours: "8 จุด / points",
      competitor: "5-6 จุด / points",
    },
    {
      feature: language === "th" ? "AR Simulator" : "AR Simulator",
      ours: "✓",
      competitor: "✗",
    },
    {
      feature: language === "th" ? "Multi-Clinic" : "Multi-Clinic",
      ours: "✓ Unlimited",
      competitor: "Limited",
    },
    {
      feature: language === "th" ? "PDPA Compliant" : "PDPA Compliant",
      ours: "✓ Full",
      competitor: "Partial",
    },
    {
      feature: language === "th" ? "ราคา" : "Price",
      ours: "฿990/เดือน / ฿990/mo",
      competitor: "฿2,000+/เดือน / ฿2,000+/mo",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-background to-muted/50 py-12 sm:py-16 lg:py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-4 bg-primary/10 text-primary" variant="secondary">
                <Sparkles className="mr-1 h-3 w-3" />
                {language === "th" ? "คุณสมบัติครบครัน" : "Complete Feature Set"}
              </Badge>
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                {language === "th" ? "ฟีเจอร์ที่ทรงพลัง" : "Powerful Features"}
                <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {language === "th" ? "สำหรับคลินิกความงามยุคใหม่" : "For Modern Beauty Clinics"}
                </span>
              </h1>
              <p className="mb-8 text-base sm:text-lg text-muted-foreground leading-relaxed">
                {language === "th"
                  ? "ระบบวิเคราะห์ผิวด้วย AI ที่ทันสมัยที่สุด พร้อมฟีเจอร์ครบครันสำหรับการจัดการคลินิกความงาม"
                  : "The most advanced AI-powered skin analysis system with comprehensive features for beauty clinic management"
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/analysis">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Scan className="mr-2 h-5 w-5" />
                    {language === "th" ? "ทดลองฟรี" : "Try Free"}
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    {language === "th" ? "ดูแพ็กเกจ" : "View Pricing"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <h2 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {language === "th" ? "ฟีเจอร์หลัก 4 ด้าน" : "4 Core Features"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {language === "th"
                    ? "เทคโนโลยีชั้นนำที่ทำให้คุณแตกต่างจากคู่แข่ง"
                    : "Leading technology that sets you apart from competitors"
                  }
                </p>
              </div>

              <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
                {mainFeatures.map((feature, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-xl">
                    <CardContent className="p-6 sm:p-8">
                      <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color}`}>
                        <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                      </div>
                      <h3 className="mb-3 text-xl sm:text-2xl font-bold">{feature.title}</h3>
                      <p className="mb-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {feature.desc}
                      </p>
                      <div className="space-y-2">
                        {feature.features.map((item, idx) => (
                          <p key={idx} className="text-xs sm:text-sm text-muted-foreground">
                            {item}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="border-y border-border bg-muted/50 py-12 sm:py-16">
          <div className="container">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <h2 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {language === "th" ? "ฟีเจอร์เพิ่มเติม" : "Additional Features"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {language === "th"
                    ? "ความสามารถอื่นๆ ที่ช่วยเพิ่มประสิทธิภาพการทำงาน"
                    : "More capabilities to enhance your workflow efficiency"
                  }
                </p>
              </div>

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {additionalFeatures.map((feature, index) => (
                  <Card key={index} className="border hover:border-primary/50 transition-all">
                    <CardContent className="p-5 sm:p-6">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="mb-2 text-base sm:text-lg font-semibold">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center">
                <h2 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {language === "th" ? "เปรียบเทียบกับคู่แข่ง" : "Competitor Comparison"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {language === "th"
                    ? "ดูว่าเราดีกว่าอย่างไร"
                    : "See how we outperform the competition"
                  }
                </p>
              </div>

              <Card className="border-2 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold">
                          {language === "th" ? "ฟีเจอร์" : "Feature"}
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold bg-primary/5">
                          {language === "th" ? "เรา" : "Our Platform"}
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold">
                          {language === "th" ? "คู่แข่ง" : "Competitors"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {comparisonData.map((row, index) => (
                        <tr key={index} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                            {row.feature}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-primary bg-primary/5">
                            {row.ours}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-muted-foreground">
                            {row.competitor}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-gradient-to-b from-muted/50 to-background py-12 sm:py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">
                {language === "th" ? "พร้อมเริ่มต้นแล้วหรือยัง?" : "Ready to Get Started?"}
              </h2>
              <p className="mb-8 text-sm sm:text-base text-muted-foreground">
                {language === "th"
                  ? "ลองใช้ฟรีวันนี้ ไม่ต้องใช้บัตรเครดิต"
                  : "Try it free today. No credit card required."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/analysis">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Sparkles className="mr-2 h-5 w-5" />
                    {language === "th" ? "วิเคราะห์ผิวฟรี" : "Free Skin Analysis"}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    {language === "th" ? "ติดต่อขอข้อมูล" : "Contact Sales"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
