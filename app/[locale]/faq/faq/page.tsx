"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { 
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Camera,
  Lock,
  Zap,
  CreditCard,
  Users,
  ArrowRight
} from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

export default function FAQPage() {
  const t = useTranslations()
  const locale = useLocale()
  const language = locale as 'th' | 'en'
  const [searchQuery, setSearchQuery] = useState("")
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const categories = [
    {
      title: language === "th" ? "เกี่ยวกับระบบ" : "About System",
      icon: Sparkles,
      faqs: [
        {
          question: language === "th" ? "AI367BAR คืออะไร?" : "What is AI367BAR?",
          answer: language === "th" 
            ? "AI367BAR คือแพลตฟอร์ม B2B2C สำหรับคลินิกความงาม ที่รวมเทคโนโลยี AI Skin Analysis, AR Simulator และระบบจัดการคลินิกครบวงจรไว้ในที่เดียว"
            : "AI367BAR is a B2B2C platform for aesthetic clinics, combining AI Skin Analysis, AR Simulator, and comprehensive clinic management in one place."
        },
        {
          question: language === "th" ? "ทำไมต้องใช้ AI367BAR?" : "Why use AI367BAR?",
          answer: language === "th" 
            ? "ช่วยให้คลินิกวิเคราะห์ผิวได้แม่นยำด้วย AI ระดับการแพทย์ มีระบบ AR แสดงผลการรักษา และมี Dashboard จัดการธุรกิจครบวงจร ในราคาที่เข้าถึงได้"
            : "Helps clinics analyze skin accurately with medical-grade AI, includes AR treatment visualization, and comprehensive business dashboard at an affordable price."
        },
        {
          question: language === "th" ? "มีคลินิกใดใช้บ้าง?" : "Which clinics are using it?",
          answer: language === "th" 
            ? "ปัจจุบันมีคลินิกความงามในประเทศไทยใช้งานมากกว่า 50 สาขา ครอบคลุมทั้งคลินิกขนาดเล็กและเครือข่ายหลายสาขา"
            : "Currently used by over 50 branches of aesthetic clinics in Thailand, covering both small clinics and multi-branch networks."
        }
      ]
    },
    {
      title: language === "th" ? "AI Skin Analysis" : "AI Skin Analysis",
      icon: Camera,
      faqs: [
        {
          question: language === "th" ? "วิเคราะห์ผิวได้แม่นยำแค่ไหน?" : "How accurate is skin analysis?",
          answer: language === "th" 
            ? "ระบบมีความแม่นยำมากกว่า 95% ใช้เทคโนโลยี MediaPipe สำหรับตรวจจับใบหน้า 468 จุด และ TensorFlow.js วิเคราะห์ผิวตามมาตรฐาน VISIA 8 ตัวชี้วัด"
            : "The system is over 95% accurate, using MediaPipe technology for 468-point face detection and TensorFlow.js for VISIA-standard 8-metric skin analysis."
        },
        {
          question: language === "th" ? "ใช้เวลาวิเคราะห์นานเท่าไหร่?" : "How long does analysis take?",
          answer: language === "th" 
            ? "ใช้เวลาเพียง 1-2 วินาทีต่อภาพ ประมวลผลบนเบราว์เซอร์โดยตรง ไม่ต้องส่งข้อมูลไปเซิร์ฟเวอร์"
            : "Only 1-2 seconds per image, processed directly in the browser without sending data to servers."
        },
        {
          question: language === "th" ? "วัดอะไรบ้าง?" : "What does it measure?",
          answer: language === "th" 
            ? "วัด 8 ตัวชี้วัดตามมาตรฐาน VISIA: รอยเหี่ยวย่น (Wrinkles), จุดด่างดำ (Spots), รูขุมขน (Pores), เนื้อผิว (Texture), ความสม่ำเสมอ (Evenness), ความกระชับ (Firmness), ความกระจ่างใส (Radiance) และความชุ่มชื้น (Hydration)"
            : "Measures 8 VISIA-standard metrics: Wrinkles, Spots, Pores, Texture, Evenness, Firmness, Radiance, and Hydration."
        },
        {
          question: language === "th" ? "ต้องใช้กล้องพิเศษหรือไม่?" : "Do I need a special camera?",
          answer: language === "th" 
            ? "ไม่ต้องครับ ใช้กล้องมือถือหรือเว็บแคมทั่วไปก็วิเคราะห์ได้ แนะนำให้ถ่ายในที่แสงสว่างเพียงพอและใบหน้าอยู่ตรงกลางภาพ"
            : "No special camera needed. Regular smartphone or webcam works. Recommended to shoot in good lighting with face centered."
        }
      ]
    },
    {
      title: language === "th" ? "ความปลอดภัยและความเป็นส่วนตัว" : "Security & Privacy",
      icon: Lock,
      faqs: [
        {
          question: language === "th" ? "ข้อมูลผู้ใช้ปลอดภัยหรือไม่?" : "Is user data secure?",
          answer: language === "th" 
            ? "ปลอดภัย 100% เราปฏิบัติตามมาตรฐาน PDPA ของไทย ข้อมูลเข้ารหัสด้วย SSL และไม่แชร์ข้อมูลให้บุคคลที่สาม"
            : "100% secure. We comply with Thailand's PDPA standards, use SSL encryption, and never share data with third parties."
        },
        {
          question: language === "th" ? "รูปภาพถูกเก็บไว้ที่ไหน?" : "Where are images stored?",
          answer: language === "th" 
            ? "Free Tier: ประมวลผลบนเบราว์เซอร์และไม่บันทึก | Premium/Enterprise: เก็บในฐานข้อมูลที่เข้ารหัส พร้อมสิทธิ์ลบได้ตลอดเวลา"
            : "Free Tier: Processed in browser, not saved | Premium/Enterprise: Stored in encrypted database with deletion rights anytime."
        },
        {
          question: language === "th" ? "ทำอย่างไรถ้าต้องการลบข้อมูล?" : "How to delete my data?",
          answer: language === "th" 
            ? "ผู้ใช้ Premium/Enterprise สามารถลบข้อมูลได้เองผ่าน Dashboard หรือติดต่อ Support ของเรา เราจะลบภายใน 24 ชั่วโมง"
            : "Premium/Enterprise users can delete data via Dashboard or contact our Support. We delete within 24 hours."
        }
      ]
    },
    {
      title: language === "th" ? "ราคาและแพ็กเกจ" : "Pricing & Packages",
      icon: CreditCard,
      faqs: [
        {
          question: language === "th" ? "Free Tier มีข้อจำกัดอะไร?" : "What are Free Tier limitations?",
          answer: language === "th" 
            ? "Free Tier ใช้วิเคราะห์ได้ไม่จำกัด แต่ไม่บันทึกประวัติ ไม่มี AR Simulator ไม่มีการเปรียบเทียบผล และไม่มี Dashboard"
            : "Free Tier has unlimited analysis but no history, AR Simulator, result comparison, or Dashboard."
        },
        {
          question: language === "th" ? "Premium แพงไหม?" : "Is Premium expensive?",
          answer: language === "th" 
            ? "Premium เริ่มต้นเพียง 4,900 บาท/เดือน ถูกกว่าเครื่อง VISIA หลายหมื่นเท่า และมีฟีเจอร์มากกว่า"
            : "Premium starts at only ฿4,900/month, much cheaper than VISIA machines costing hundreds of thousands, with more features."
        },
        {
          question: language === "th" ? "ยกเลิกได้ไหม?" : "Can I cancel?",
          answer: language === "th" 
            ? "ยกเลิกได้ทุกเมื่อโดยไม่มีค่าปรับ จะใช้งานได้จนสิ้นสุดรอบบิล"
            : "Cancel anytime without penalty. Service continues until end of billing period."
        },
        {
          question: language === "th" ? "Enterprise ราคาเท่าไหร่?" : "How much is Enterprise?",
          answer: language === "th" 
            ? "Enterprise เป็นแพ็กเกจปรับแต่งตามความต้องการ ราคาขึ้นอยู่กับจำนวนสาขาและฟีเจอร์ ติดต่อฝ่ายขายเพื่อขอใบเสนอราคา"
            : "Enterprise is customized based on needs. Pricing depends on branches and features. Contact sales for quote."
        }
      ]
    },
    {
      title: language === "th" ? "การใช้งาน" : "Usage",
      icon: Zap,
      faqs: [
        {
          question: language === "th" ? "ต้องติดตั้งอะไรบ้าง?" : "What needs to be installed?",
          answer: language === "th" 
            ? "ไม่ต้องติดตั้งอะไรเลย ใช้งานผ่านเว็บเบราว์เซอร์ได้เลย รองรับทั้ง Chrome, Safari, Firefox และ Edge"
            : "No installation needed. Works directly in web browsers including Chrome, Safari, Firefox, and Edge."
        },
        {
          question: language === "th" ? "ใช้บนมือถือได้ไหม?" : "Does it work on mobile?",
          answer: language === "th" 
            ? "ได้ครับ ใช้งานได้ทั้ง iOS และ Android ผ่านเว็บเบราว์เซอร์ โดยไม่ต้องดาวน์โหลดแอป"
            : "Yes, works on both iOS and Android via web browser without downloading apps."
        },
        {
          question: language === "th" ? "ต้องเชื่อมต่ออินเทอร์เน็ตหรือไม่?" : "Need internet connection?",
          answer: language === "th" 
            ? "ต้องมีอินเทอร์เน็ตในครั้งแรกเพื่อโหลด AI Model หลังจากนั้นสามารถใช้งาน Offline ได้ (ยกเว้นการบันทึกข้อมูล)"
            : "Internet needed first time to load AI Model. After that, can work offline (except for saving data)."
        },
        {
          question: language === "th" ? "มีคู่มือการใช้งานหรือไม่?" : "Is there a user manual?",
          answer: language === "th" 
            ? "มีครับ เรามี Video Tutorial, Step-by-step Guide และ FAQ ครบครัน รวมถึงทีม Support พร้อมช่วยเหลือ"
            : "Yes, we have Video Tutorials, Step-by-step Guides, and comprehensive FAQs, plus Support team ready to help."
        }
      ]
    },
    {
      title: language === "th" ? "การสนับสนุน" : "Support",
      icon: Users,
      faqs: [
        {
          question: language === "th" ? "ติดต่อ Support ได้อย่างไร?" : "How to contact Support?",
          answer: language === "th" 
            ? "ติดต่อผ่าน Email: contact@ai367bar.com, โทร: 012-345-6789 หรือผ่าน Live Chat ในระบบ (Premium/Enterprise เท่านั้น)"
            : "Contact via Email: contact@ai367bar.com, Phone: 012-345-6789, or Live Chat (Premium/Enterprise only)."
        },
        {
          question: language === "th" ? "มีการฝึกอบรมหรือไม่?" : "Is training available?",
          answer: language === "th" 
            ? "Enterprise Package มี Onboarding และ Training รวมอยู่ในแพ็กเกจ สำหรับ Premium ติดต่อเพื่อจัดการฝึกอบรมแบบคิดค่าบริการ"
            : "Enterprise Package includes Onboarding and Training. Premium users can arrange paid training sessions."
        },
        {
          question: language === "th" ? "ตอบกลับภายในกี่ชั่วโมง?" : "Response time?",
          answer: language === "th" 
            ? "Free Tier: 48 ชั่วโมง | Premium: 24 ชั่วโมง | Enterprise: ภายใน 4 ชั่วโมง (24/7 Support)"
            : "Free Tier: 48 hours | Premium: 24 hours | Enterprise: Within 4 hours (24/7 Support)"
        }
      ]
    }
  ]

  const allFAQs = categories.flatMap(cat => 
    cat.faqs.map(faq => ({ ...faq, category: cat.title, icon: cat.icon }))
  )

  const filteredFAQs = searchQuery 
    ? allFAQs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-muted/30 to-background py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-primary/10 text-primary" variant="secondary">
                <HelpCircle className="mr-2 h-3 w-3" />
                {t('faqPage.badge')}
              </Badge>

              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                {t('faqPage.title')}
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {t('faqPage.titleHighlight')}
                </span>
              </h1>

              <p className="mb-8 text-balance text-lg text-muted-foreground leading-relaxed">
                {t('faqPage.description')}
              </p>

              {/* Search Bar */}
              <div className="relative mx-auto max-w-2xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('faqPage.searchPlaceholder')}
                  className="h-14 pl-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20">
          <div className="container">
            {searchQuery && filteredFAQs ? (
              /* Search Results */
              <div className="mx-auto max-w-4xl">
                <p className="mb-6 text-sm text-muted-foreground">
                  {t('faqPage.foundQuestions', { count: filteredFAQs.length })}
                </p>
                <div className="space-y-4">
                  {filteredFAQs.map((faq, index) => {
                    const Icon = faq.icon
                    const faqId = `search-${index}`
                    return (
                      <Card key={faqId}>
                        <CardHeader
                          className="cursor-pointer transition-colors hover:bg-muted/50"
                          onClick={() => setOpenIndex(openIndex === faqId ? null : faqId)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <Badge variant="outline" className="mb-2 text-xs">
                                  {faq.category}
                                </Badge>
                                <CardTitle className="text-lg font-semibold">
                                  {faq.question}
                                </CardTitle>
                              </div>
                            </div>
                            {openIndex === faqId ? (
                              <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                        {openIndex === faqId && (
                          <CardContent className="pt-0">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Category View */
              <div className="mx-auto max-w-6xl space-y-16">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <div key={category.title}>
                      <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">{category.title}</h2>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        {category.faqs.map((faq, index) => {
                          const globalIndex = `${category.title}-${index}`
                          return (
                            <Card key={globalIndex} className="border-2">
                              <CardHeader
                                className="cursor-pointer transition-colors hover:bg-muted/50"
                                onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <CardTitle className="text-lg font-semibold">
                                    {faq.question}
                                  </CardTitle>
                                  {openIndex === globalIndex ? (
                                    <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                                  )}
                                </div>
                              </CardHeader>
                              {openIndex === globalIndex && (
                                <CardContent className="pt-0">
                                  <p className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                  </p>
                                </CardContent>
                              )}
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">
                {t('faqPage.stillHaveQuestions')}
              </h2>
              <p className="mb-8 text-balance text-muted-foreground leading-relaxed">
                {t('faqPage.stillHaveQuestionsDesc')}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/contact">
                    {t('faqPage.contactUs')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/demo">{t('faqPage.viewDemo')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">
                {t('faqPage.helpfulLinks')}
              </h2>
            </div>

            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
              <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
                <CardHeader>
                  <Sparkles className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>{t('faqPage.gettingStarted')}</CardTitle>
                  <CardDescription>
                    {t('faqPage.gettingStartedDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/analysis">{t('faqPage.startNow')}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
                <CardHeader>
                  <CreditCard className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>{t('faqPage.pricingTitle')}</CardTitle>
                  <CardDescription>
                    {t('faqPage.pricingDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/pricing">{t('faqPage.viewPricing')}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
                <CardHeader>
                  <Users className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>{t('faqPage.aboutUsTitle')}</CardTitle>
                  <CardDescription>
                    {t('faqPage.aboutUsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/about">{t('faqPage.learnMore')}</Link>
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
