"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle2, XCircle, Scale, AlertTriangle, UserX, Shield } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

export default function TermsOfServicePage() {
  const t = useTranslations()
  const locale = useLocale()
  const language = locale as 'th' | 'en'

  const sections = [
    {
      icon: CheckCircle2,
      title: language === "th" ? "การยอมรับข้อกำหนด" : "Acceptance of Terms",
      titleTh: "การยอมรับข้อกำหนด",
      content: language === "th"
        ? "การเข้าใช้งานหรือใช้บริการของเราถือว่าคุณยอมรับและตกลงที่จะปฏิบัติตามข้อกำหนดการให้บริการนี้ทั้งหมด หากคุณไม่ยอมรับข้อกำหนดเหล่านี้ กรุณาอย่าใช้บริการของเรา"
        : "By accessing or using our service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.",
      items: [
        {
          label: language === "th" ? "อายุขั้นต่ำ" : "Minimum Age",
          desc: language === "th" ? "ผู้ใช้งานต้องมีอายุอย่างน้อย 18 ปีบริบูรณ์" : "Users must be at least 18 years old"
        },
        {
          label: language === "th" ? "ความรับผิดชอบ" : "Responsibility",
          desc: language === "th" ? "คุณรับผิดชอบในการรักษาความลับของบัญชีของคุณ" : "You are responsible for maintaining account confidentiality"
        },
        {
          label: language === "th" ? "การใช้งานที่ถูกต้อง" : "Proper Use",
          desc: language === "th" ? "ใช้บริการตามวัตถุประสงค์ที่กำหนดเท่านั้น" : "Use service only for its intended purpose"
        },
      ]
    },
    {
      icon: FileText,
      title: language === "th" ? "การให้บริการ" : "Service Description",
      titleTh: "การให้บริการ",
      content: language === "th"
        ? "แพลตฟอร์มของเราให้บริการวิเคราะห์ผิวหน้าด้วย AI, การจำลอง AR สำหรับทรีตเมนต์, และการจัดการข้อมูลลูกค้าสำหรับคลินิกความงาม บริการอาจมีการเปลี่ยนแปลงหรือปรับปรุงโดยไม่ต้องแจ้งให้ทราบล่วงหน้า"
        : "Our platform provides AI-powered facial skin analysis, AR treatment simulation, and customer management for beauty clinics. Services may be modified or updated without prior notice.",
      items: [
        {
          label: language === "th" ? "Free Tier" : "Free Tier",
          desc: language === "th" ? "วิเคราะห์ผิวฟรี, ข้อมูลพื้นฐาน, จำกัด 5 ครั้ง/เดือน" : "Free analysis, basic data, 5 times/month limit"
        },
        {
          label: language === "th" ? "Premium Tier" : "Premium Tier",
          desc: language === "th" ? "วิเคราะห์ไม่จำกัด, AI ขั้นสูง, AR Simulator" : "Unlimited analysis, advanced AI, AR Simulator"
        },
        {
          label: language === "th" ? "Enterprise" : "Enterprise",
          desc: language === "th" ? "Multi-clinic, API Integration, Custom Features" : "Multi-clinic, API Integration, Custom Features"
        },
      ]
    },
    {
      icon: XCircle,
      title: language === "th" ? "ข้อห้ามในการใช้งาน" : "Prohibited Uses",
      titleTh: "ข้อห้ามในการใช้งาน",
      content: language === "th"
        ? "ห้ามใช้บริการเพื่อวัตถุประสงค์ที่ผิดกฎหมาย ทำลายระบบ คัดลอกเนื้อหา หรือละเมิดทรัพย์สินทางปัญญา การกระทำที่ผิดกฎอาจถูกระงับบัญชีทันทีโดยไม่ต้องแจ้งให้ทราบล่วงหน้า"
        : "Do not use the service for illegal purposes, system disruption, content copying, or intellectual property violation. Violations may result in immediate account suspension.",
      items: [
        {
          label: language === "th" ? "การใช้งานผิดวัตถุประสงค์" : "Misuse",
          desc: language === "th" ? "ห้ามใช้เพื่อวัตถุประสงค์อื่นนอกเหนือจากการวิเคราะห์ผิว" : "Prohibited for purposes other than skin analysis"
        },
        {
          label: language === "th" ? "การคัดลอกข้อมูล" : "Data Scraping",
          desc: language === "th" ? "ห้าม scrape, crawl หรือคัดลอกข้อมูลโดยอัตโนมัติ" : "No automated scraping, crawling, or copying"
        },
        {
          label: language === "th" ? "การแอบอ้าง" : "Impersonation",
          desc: language === "th" ? "ห้ามแอบอ้างเป็นบุคคลหรือองค์กรอื่น" : "No impersonation of others or organizations"
        },
        {
          label: language === "th" ? "Reverse Engineering" : "Reverse Engineering",
          desc: language === "th" ? "ห้ามถอดรหัสหรือวิศวกรรมย้อนกลับระบบ" : "No reverse engineering of the system"
        },
      ]
    },
    {
      icon: Scale,
      title: language === "th" ? "ทรัพย์สินทางปัญญา" : "Intellectual Property",
      titleTh: "ทรัพย์สินทางปัญญา",
      content: language === "th"
        ? "เนื้อหา AI Models, ซอฟต์แวร์ โลโก้ และทรัพย์สินทางปัญญาอื่นๆ ทั้งหมดเป็นของบริษัทเรา ห้ามคัดลอก ดัดแปลง หรือใช้งานโดยไม่ได้รับอนุญาต คุณมีสิทธิ์ในข้อมูลที่คุณอัปโหลดเท่านั้น"
        : "All content, AI models, software, logos, and intellectual property belong to our company. Copying, modification, or use without permission is prohibited. You retain rights to your uploaded data.",
      items: [
        {
          label: language === "th" ? "เนื้อหาของเรา" : "Our Content",
          desc: language === "th" ? "AI Models, ซอฟต์แวร์, UI/UX Design เป็นของบริษัท" : "AI models, software, UI/UX design are company property"
        },
        {
          label: language === "th" ? "เนื้อหาของคุณ" : "Your Content",
          desc: language === "th" ? "คุณเป็นเจ้าของภาพและข้อมูลที่อัปโหลด" : "You own photos and data you upload"
        },
        {
          label: language === "th" ? "สิทธิ์การใช้งาน" : "License Grant",
          desc: language === "th" ? "คุณให้สิทธิ์เราใช้ข้อมูลเพื่อให้บริการ" : "You grant us license to use data for service delivery"
        },
      ]
    },
    {
      icon: AlertTriangle,
      title: language === "th" ? "ข้อจำกัดความรับผิด" : "Limitation of Liability",
      titleTh: "ข้อจำกัดความรับผิด",
      content: language === "th"
        ? "บริการของเราให้ผลการวิเคราะห์เพื่อการอ้างอิงเท่านั้น ไม่ใช่คำวินิจฉัยทางการแพทย์ เราไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดจากการใช้บริการ รวมถึงความเสียหายทางอ้อม โดยบังเอิญ หรือพิเศษ"
        : "Our service provides analysis for reference only, not medical diagnosis. We are not liable for any damages from service use, including indirect, incidental, or special damages.",
      items: [
        {
          label: language === "th" ? "ไม่ใช่คำแนะนำทางการแพทย์" : "Not Medical Advice",
          desc: language === "th" ? "ผลวิเคราะห์เพื่อการอ้างอิงเท่านั้น" : "Analysis results are for reference only"
        },
        {
          label: language === "th" ? "ความถูกต้อง" : "Accuracy",
          desc: language === "th" ? "เราพยายามให้ความแม่นยำสูงสุด แต่ไม่รับประกัน 100%" : "We strive for accuracy but cannot guarantee 100%"
        },
        {
          label: language === "th" ? "ปรึกษาผู้เชี่ยวชาญ" : "Consult Experts",
          desc: language === "th" ? "ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญก่อนตัดสินใจทรีตเมนต์" : "Consult medical professionals before treatment decisions"
        },
      ]
    },
    {
      icon: UserX,
      title: language === "th" ? "การยกเลิกบัญชี" : "Account Termination",
      titleTh: "การยกเลิกบัญชี",
      content: language === "th"
        ? "คุณสามารถยกเลิกบัญชีได้ทุกเมื่อผ่านการตั้งค่า เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีที่ละเมิดข้อกำหนดโดยไม่ต้องแจ้งให้ทราบล่วงหน้า ข้อมูลจะถูกลบตามนโยบายความเป็นส่วนตัว"
        : "You can cancel your account anytime through settings. We reserve the right to suspend or terminate accounts that violate terms without notice. Data will be deleted per privacy policy.",
      items: [
        {
          label: language === "th" ? "การยกเลิกโดยผู้ใช้" : "User Cancellation",
          desc: language === "th" ? "ยกเลิกได้ทุกเมื่อผ่านหน้าตั้งค่าบัญชี" : "Cancel anytime through account settings"
        },
        {
          label: language === "th" ? "การระงับโดยระบบ" : "System Suspension",
          desc: language === "th" ? "หากตรวจพบการใช้งานผิดกฎ" : "For violations of terms"
        },
        {
          label: language === "th" ? "การลบข้อมูล" : "Data Deletion",
          desc: language === "th" ? "ข้อมูลจะถูกลบภายใน 30 วันหลังยกเลิก" : "Data deleted within 30 days after cancellation"
        },
      ]
    },
    {
      icon: Shield,
      title: language === "th" ? "การเปลี่ยนแปลงข้อกำหนด" : "Changes to Terms",
      titleTh: "การเปลี่ยนแปลงข้อกำหนด",
      content: language === "th"
        ? "เราขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดการให้บริการนี้ได้ทุกเมื่อ การเปลี่ยนแปลงที่สำคัญจะแจ้งให้ทราบผ่านอีเมลหรือการแจ้งเตือนในระบบ การใช้บริการต่อไปถือว่ายอมรับข้อกำหนดที่แก้ไขแล้ว"
        : "We reserve the right to modify these terms at any time. Significant changes will be notified via email or system notification. Continued use constitutes acceptance of revised terms.",
      items: [
        {
          label: language === "th" ? "การแจ้งเตือน" : "Notification",
          desc: language === "th" ? "แจ้งผ่านอีเมลและระบบอย่างน้อย 7 วันล่วงหน้า" : "Notify via email and system at least 7 days in advance"
        },
        {
          label: language === "th" ? "การทบทวน" : "Review",
          desc: language === "th" ? "ทบทวนข้อกำหนดเป็นประจำทุก 6 เดือน" : "Review terms every 6 months"
        },
        {
          label: language === "th" ? "เวอร์ชัน" : "Versioning",
          desc: language === "th" ? "เก็บประวัติการเปลี่ยนแปลงทุกครั้ง" : "Archive all version changes"
        },
      ]
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-background to-muted/50 py-12 sm:py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 bg-accent/10 text-accent" variant="secondary">
                <FileText className="mr-1 h-3 w-3" />
                {language === "th" ? "มีผลบังคับใช้: 31 ตุลาคม 2025" : "Effective Date: October 31, 2025"}
              </Badge>
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {language === "th" ? "เงื่อนไขการให้บริการ" : "Terms of Service"}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {language === "th"
                  ? "กรุณาอ่านข้อกำหนดการให้บริการเหล่านี้อย่างละเอียดก่อนใช้งานแพลตฟอร์มของเรา การใช้งานถือว่าคุณยอมรับและตกลงตามข้อกำหนดทั้งหมด"
                  : "Please read these Terms of Service carefully before using our platform. By using our service, you agree to be bound by these terms."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="border-b border-border bg-background py-6">
          <div className="container">
            <div className="flex flex-wrap justify-center gap-2">
              {sections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-md hover:bg-muted"
                >
                  {section.titleTh}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="py-8 sm:py-12">
          <div className="container">
            <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
              {sections.map((section, index) => (
                <Card key={index} id={`section-${index}`} className="border-2 scroll-mt-20">
                  <CardContent className="p-6 sm:p-8">
                    <div className="mb-6 flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <section.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="mb-2 text-xl sm:text-2xl font-bold">{section.title}</h2>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {section.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
                        >
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10">
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="mb-1 text-sm sm:text-base font-semibold">{item.label}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Governing Law */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Scale className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-2 text-lg sm:text-xl font-bold">
                        {language === "th" ? "กฎหมายที่ใช้บังคับ" : "Governing Law"}
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                        {language === "th"
                          ? "ข้อกำหนดการให้บริการนี้อยู่ภายใต้และตีความตามกฎหมายของประเทศไทย ข้อพิพาทใดๆ จะอยู่ในเขตอำนาจศาลไทย"
                          : "These Terms of Service are governed by and construed in accordance with the laws of Thailand. Any disputes shall be under the jurisdiction of Thai courts."
                        }
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 text-sm">
                        <a
                          href="/contact"
                          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          {language === "th" ? "ติดต่อเรา" : "Contact Us"}
                        </a>
                        <a
                          href="/privacy"
                          className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 text-primary hover:bg-primary/10 transition-colors"
                        >
                          {language === "th" ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy"}
                        </a>
                      </div>
                    </div>
                  </div>
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
