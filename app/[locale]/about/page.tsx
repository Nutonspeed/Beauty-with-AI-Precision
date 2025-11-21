"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
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
import { useLanguage } from "@/lib/i18n/language-context"

export default function AboutPage() {
  const { language } = useLanguage()

  const coreValues = [
    {
      icon: Brain,
      title: language === "th" ? "นวัตกรรม AI" : "AI Innovation",
      description: language === "th" 
        ? "พัฒนาเทคโนโลยี AI ที่ล้ำสมัยเพื่อการวิเคราะห์ผิวที่แม่นยำ"
        : "Developing cutting-edge AI technology for accurate skin analysis"
    },
    {
      icon: Shield,
      title: language === "th" ? "ความปลอดภัย" : "Security",
      description: language === "th" 
        ? "ปกป้องข้อมูลส่วนบุคคลตามมาตรฐาน PDPA"
        : "Protecting personal data according to PDPA standards"
    },
    {
      icon: TrendingUp,
      title: language === "th" ? "การเติบโต" : "Growth",
      description: language === "th" 
        ? "ช่วยให้ธุรกิจคลินิกเติบโตด้วยเทคโนโลยีที่ทันสมัย"
        : "Helping clinic businesses grow with modern technology"
    },
    {
      icon: Award,
      title: language === "th" ? "คุณภาพ" : "Quality",
      description: language === "th" 
        ? "มาตรฐานระดับการแพทย์ เทียบเท่า VISIA"
        : "Medical-grade standards comparable to VISIA"
    }
  ]

  const techStack = [
    {
      icon: Brain,
      title: "MediaPipe Face Detection",
      description: language === "th" 
        ? "AI ตรวจจับใบหน้าที่แม่นยำด้วย 468 จุดสังเกต"
        : "Accurate face detection AI with 468 landmarks"
    },
    {
      icon: Zap,
      title: "TensorFlow.js",
      description: language === "th" 
        ? "วิเคราะห์ผิวด้วย Machine Learning บนเบราว์เซอร์"
        : "Browser-based machine learning for skin analysis"
    },
    {
      icon: Camera,
      title: "AR Visualization",
      description: language === "th" 
        ? "แสดงผลการรักษาแบบ AR ก่อนตัดสินใจ"
        : "AR visualization of treatment results before decision"
    },
    {
      icon: BarChart3,
      title: "VISIA Metrics",
      description: language === "th" 
        ? "วัดผล 8 ตัวชี้วัดตามมาตรฐาน VISIA"
        : "8 metrics measured by VISIA standards"
    }
  ]

  const milestones = [
    {
      year: "2024 Q1",
      title: language === "th" ? "ก่อตั้งบริษัท" : "Company Founded",
      description: language === "th" 
        ? "เริ่มต้นพัฒนาระบบ AI สำหรับคลินิกความงาม"
        : "Started developing AI system for aesthetic clinics"
    },
    {
      year: "2024 Q2",
      title: language === "th" ? "ทดสอบ AI Model" : "AI Model Testing",
      description: language === "th" 
        ? "ทดสอบความแม่นยำของ AI กับข้อมูลจริง 10,000+ ภาพ"
        : "Tested AI accuracy with 10,000+ real images"
    },
    {
      year: "2024 Q3",
      title: "Beta Launch",
      description: language === "th" 
        ? "เปิดให้คลินิกนำร่องทดสอบระบบ"
        : "Launched beta testing with pilot clinics"
    },
    {
      year: "2025 Q1",
      title: "Official Launch",
      description: language === "th" 
        ? "เปิดให้บริการอย่างเป็นทางการพร้อม Free Tier"
        : "Official launch with Free Tier availability"
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
                <Sparkles className="mr-2 h-3 w-3" />
                {language === "th" ? "เกี่ยวกับเรา" : "About Us"}
              </Badge>

              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                {language === "th" ? "ผู้นำด้านเทคโนโลยี AI" : "AI Technology Leader"}
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {language === "th" ? "สำหรับคลินิกความงาม" : "for Aesthetic Clinics"}
                </span>
              </h1>

              <p className="mb-8 text-balance text-lg text-muted-foreground leading-relaxed">
                {language === "th" 
                  ? "AI367BAR คือแพลตฟอร์ม B2B2C ที่รวมเทคโนโลยี AI ขั้นสูง การวิเคราะห์ผิวระดับการแพทย์ และระบบจัดการคลินิกครบวงจร เพื่อช่วยให้ธุรกิจคลินิกความงามเติบโตอย่างยั่งยืน"
                  : "AI367BAR is a B2B2C platform combining advanced AI technology, medical-grade skin analysis, and comprehensive clinic management systems to help aesthetic clinic businesses grow sustainably."}
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/analysis">
                    {language === "th" ? "ทดลองใช้ฟรี" : "Try for Free"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">{language === "th" ? "ติดต่อเรา" : "Contact Us"}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="mb-4 text-2xl font-bold">
                    {language === "th" ? "วิสัยทัศน์" : "Vision"}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {language === "th" 
                      ? "เป็นแพลตฟอร์ม AI ชั้นนำในเอเชียสำหรับการวิเคราะห์ผิวและการจัดการคลินิกความงาม ที่ช่วยให้ธุรกิจเข้าถึงเทคโนโลยีระดับโลกได้ในราคาที่เหมาะสม"
                      : "To be the leading AI platform in Asia for skin analysis and aesthetic clinic management, making world-class technology accessible and affordable for businesses."}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="mb-4 text-2xl font-bold">
                    {language === "th" ? "พันธกิจ" : "Mission"}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {language === "th" 
                      ? "พัฒนาเทคโนโลยี AI ที่แม่นยำ ปลอดภัย และเข้าถึงได้ง่าย เพื่อยกระดับมาตรฐานการให้บริการของคลินิกความงาม และสร้างประสบการณ์ที่ดีที่สุดให้กับลูกค้า"
                      : "Develop accurate, secure, and accessible AI technology to elevate aesthetic clinic service standards and create the best customer experience."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {language === "th" ? "ค่านิยมหลัก" : "Core Values"}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {language === "th" 
                  ? "หลักการที่ขับเคลื่อนการพัฒนาผลิตภัณฑ์และบริการของเรา"
                  : "Principles that drive our product and service development"}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {coreValues.map((value) => {
                const Icon = value.icon
                return (
                  <Card key={value.title} className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{value.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {language === "th" ? "เทคโนโลยีที่ใช้" : "Technology Stack"}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {language === "th" 
                  ? "AI และเทคโนโลยีขั้นสูงที่ขับเคลื่อนระบบของเรา"
                  : "Advanced AI and technologies powering our system"}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {techStack.map((tech) => {
                const Icon = tech.icon
                return (
                  <Card key={tech.title} className="border-2">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                        <Icon className="h-6 w-6 text-accent" />
                      </div>
                      <h3 className="mb-2 font-semibold">{tech.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tech.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {language === "th" ? "เส้นทางการเติบโต" : "Growth Milestones"}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {language === "th" 
                  ? "ก้าวสำคัญในการพัฒนาผลิตภัณฑ์"
                  : "Key steps in product development"}
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="mt-2 h-full w-0.5 bg-border" />
                      )}
                    </div>
                    <Card className="flex-1 border-2">
                      <CardContent className="p-6">
                        <Badge className="mb-2" variant="outline">{milestone.year}</Badge>
                        <h3 className="mb-2 text-xl font-semibold">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">10K+</div>
                <p className="text-sm text-muted-foreground">
                  {language === "th" ? "ภาพวิเคราะห์" : "Analyzed Images"}
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">95%+</div>
                <p className="text-sm text-muted-foreground">
                  {language === "th" ? "ความแม่นยำ" : "Accuracy Rate"}
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">&lt;2s</div>
                <p className="text-sm text-muted-foreground">
                  {language === "th" ? "เวลาวิเคราะห์" : "Analysis Time"}
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">8</div>
                <p className="text-sm text-muted-foreground">
                  {language === "th" ? "ตัวชี้วัดผิว" : "Skin Metrics"}
                </p>
              </div>
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
                  ? "ทดลองใช้ระบบวิเคราะห์ผิว AI ฟรี หรือติดต่อเราเพื่อขอข้อมูลเพิ่มเติม"
                  : "Try our AI skin analysis for free or contact us for more information"}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/analysis">
                    {language === "th" ? "ทดลองใช้ฟรี" : "Try for Free"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/contact">{language === "th" ? "ติดต่อเรา" : "Contact Us"}</Link>
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
