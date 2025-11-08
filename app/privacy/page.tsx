"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Eye, Database, UserCheck, FileText, AlertCircle, Clock } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export default function PrivacyPolicyPage() {
  const { language } = useLanguage()

  const sections = [
    {
      icon: FileText,
      title: language === "th" ? "ข้อมูลที่เราเก็บรวบรวม" : "Information We Collect",
      titleTh: "ข้อมูลที่เราเก็บรวบรวม",
      content: language === "th" 
        ? "เราเก็บรวบรวมข้อมูลที่คุณให้ไว้โดยตรง เช่น ชื่อ อีเมล เบอร์โทรศัพท์ และภาพถ่ายใบหน้าสำหรับการวิเคราะห์ผิว รวมถึงข้อมูลที่เกิดจากการใช้งาน เช่น ประวัติการวิเคราะห์ ผลการวิเคราะห์ และการตั้งค่าต่างๆ"
        : "We collect information you provide directly, such as name, email, phone number, and facial photos for skin analysis. We also collect usage data including analysis history, results, and settings.",
      items: [
        { 
          label: language === "th" ? "ข้อมูลส่วนบุคคล" : "Personal Information",
          desc: language === "th" ? "ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์" : "Name, email, phone number"
        },
        { 
          label: language === "th" ? "ข้อมูลการวิเคราะห์" : "Analysis Data",
          desc: language === "th" ? "ภาพถ่ายใบหน้า, ผลการวิเคราะห์ผิว" : "Facial photos, skin analysis results"
        },
        { 
          label: language === "th" ? "ข้อมูลการใช้งาน" : "Usage Data",
          desc: language === "th" ? "IP Address, Browser, Device, เวลาเข้าใช้งาน" : "IP address, browser, device, access time"
        },
        { 
          label: language === "th" ? "Cookies" : "Cookies",
          desc: language === "th" ? "เพื่อปรับปรุงประสบการณ์การใช้งาน" : "To improve user experience"
        },
      ]
    },
    {
      icon: Database,
      title: language === "th" ? "วิธีการใช้ข้อมูล" : "How We Use Your Data",
      titleTh: "วิธีการใช้ข้อมูล",
      content: language === "th"
        ? "เราใช้ข้อมูลของคุณเพื่อให้บริการวิเคราะห์ผิวด้วย AI, ปรับปรุงความแม่นยำของระบบ, ส่งการแจ้งเตือนและข้อมูลที่เกี่ยวข้อง และรักษาความปลอดภัยของระบบ เราไม่ขายหรือแชร์ข้อมูลของคุณกับบุคคลที่สาม เว้นแต่ได้รับความยินยอมจากคุณ"
        : "We use your data to provide AI-powered skin analysis, improve system accuracy, send relevant notifications, and maintain system security. We do not sell or share your data with third parties without your consent.",
      items: [
        { 
          label: language === "th" ? "การให้บริการ" : "Service Delivery",
          desc: language === "th" ? "ประมวลผลและวิเคราะห์ผิวด้วย AI" : "Process and analyze skin with AI"
        },
        { 
          label: language === "th" ? "การปรับปรุงระบบ" : "System Improvement",
          desc: language === "th" ? "พัฒนาความแม่นยำของ AI Model" : "Improve AI model accuracy"
        },
        { 
          label: language === "th" ? "การสื่อสาร" : "Communication",
          desc: language === "th" ? "ส่งผลการวิเคราะห์และข้อมูลสำคัญ" : "Send analysis results and important updates"
        },
        { 
          label: language === "th" ? "ความปลอดภัย" : "Security",
          desc: language === "th" ? "ป้องกันการใช้งานที่ผิดกฎหมาย" : "Prevent unauthorized access"
        },
      ]
    },
    {
      icon: Lock,
      title: language === "th" ? "การรักษาความปลอดภัย" : "Data Security",
      titleTh: "การรักษาความปลอดภัย",
      content: language === "th"
        ? "เราใช้มาตรการรักษาความปลอดภัยตามมาตรฐานสากล รวมถึง SSL/TLS Encryption, การเข้ารหัสข้อมูล, การควบคุมการเข้าถึง, และ Backup อัตโนมัติ เพื่อปกป้องข้อมูลของคุณจากการเข้าถึงโดยไม่ได้รับอนุญาต การสูญหาย หรือการเปิดเผยโดยไม่ตั้งใจ"
        : "We implement industry-standard security measures including SSL/TLS encryption, data encryption, access controls, and automatic backups to protect your data from unauthorized access, loss, or unintentional disclosure.",
      items: [
        { 
          label: language === "th" ? "Encryption" : "Encryption",
          desc: language === "th" ? "SSL/TLS 256-bit สำหรับการส่งข้อมูล" : "SSL/TLS 256-bit for data transmission"
        },
        { 
          label: language === "th" ? "Access Control" : "Access Control",
          desc: language === "th" ? "จำกัดการเข้าถึงเฉพาะผู้มีสิทธิ์" : "Restricted access to authorized personnel"
        },
        { 
          label: language === "th" ? "Data Backup" : "Data Backup",
          desc: language === "th" ? "สำรองข้อมูลอัตโนมัติทุกวัน" : "Automated daily backups"
        },
        { 
          label: language === "th" ? "Audit Logs" : "Audit Logs",
          desc: language === "th" ? "บันทึกการเข้าถึงและการเปลี่ยนแปลงข้อมูล" : "Log all access and data modifications"
        },
      ]
    },
    {
      icon: UserCheck,
      title: language === "th" ? "สิทธิ์ของผู้ใช้งาน" : "Your Rights",
      titleTh: "สิทธิ์ของผู้ใช้งาน",
      content: language === "th"
        ? "คุณมีสิทธิ์ในการเข้าถึง แก้ไข ลบ หรือจำกัดการใช้ข้อมูลส่วนบุคคลของคุณ คุณสามารถขอสำเนาข้อมูล ถอนความยินยอม หรือโอนย้ายข้อมูลได้ตามกฎหมาย PDPA และ GDPR"
        : "You have the right to access, correct, delete, or restrict the use of your personal data. You can request a copy of your data, withdraw consent, or transfer your data in accordance with PDPA and GDPR laws.",
      items: [
        { 
          label: language === "th" ? "สิทธิ์เข้าถึงข้อมูล" : "Right to Access",
          desc: language === "th" ? "ขอดูข้อมูลส่วนบุคคลที่เราเก็บ" : "Request to view your stored data"
        },
        { 
          label: language === "th" ? "สิทธิ์แก้ไขข้อมูล" : "Right to Rectification",
          desc: language === "th" ? "แก้ไขข้อมูลที่ไม่ถูกต้อง" : "Correct inaccurate information"
        },
        { 
          label: language === "th" ? "สิทธิ์ลบข้อมูล" : "Right to Erasure",
          desc: language === "th" ? "ขอลบข้อมูลส่วนบุคคล" : "Request data deletion"
        },
        { 
          label: language === "th" ? "สิทธิ์โอนย้ายข้อมูล" : "Right to Portability",
          desc: language === "th" ? "ขอโอนข้อมูลไปยังผู้ให้บริการอื่น" : "Transfer data to another service"
        },
      ]
    },
    {
      icon: Eye,
      title: language === "th" ? "การแชร์ข้อมูล" : "Data Sharing",
      titleTh: "การแชร์ข้อมูล",
      content: language === "th"
        ? "เราจะไม่ขาย เช่า หรือแชร์ข้อมูลส่วนบุคคลของคุณกับบุคคลที่สาม ยกเว้นกรณีที่จำเป็นตามกฎหมาย หรือเพื่อให้บริการที่คุณร้องขอ เช่น การส่งต่อข้อมูลไปยังคลินิกที่คุณจองนัดหมาย"
        : "We will not sell, rent, or share your personal data with third parties except when legally required or to provide services you requested, such as sharing data with clinics where you book appointments.",
      items: [
        { 
          label: language === "th" ? "ไม่มีการขาย" : "No Sale",
          desc: language === "th" ? "เราไม่ขายข้อมูลของคุณ" : "We never sell your data"
        },
        { 
          label: language === "th" ? "คู่ค้าที่จำเป็น" : "Essential Partners",
          desc: language === "th" ? "เฉพาะผู้ให้บริการที่จำเป็นเท่านั้น" : "Only essential service providers"
        },
        { 
          label: language === "th" ? "ตามกฎหมาย" : "Legal Requirements",
          desc: language === "th" ? "เมื่อมีคำสั่งจากหน่วยงานราชการ" : "When required by government authorities"
        },
        { 
          label: language === "th" ? "ด้วยความยินยอม" : "With Consent",
          desc: language === "th" ? "เมื่อคุณให้ความยินยอมชัดแจ้ง" : "Only with your explicit consent"
        },
      ]
    },
    {
      icon: Clock,
      title: language === "th" ? "ระยะเวลาเก็บข้อมูล" : "Data Retention",
      titleTh: "ระยะเวลาเก็บข้อมูล",
      content: language === "th"
        ? "เราจะเก็บข้อมูลของคุณตามระยะเวลาที่จำเป็นเพื่อให้บริการ หรือตามที่กฎหมายกำหนด ข้อมูลการวิเคราะห์จะเก็บไว้ 2 ปี หลังจากนั้นจะลบโดยอัตโนมัติ คุณสามารถขอลบข้อมูลได้ทุกเมื่อ"
        : "We retain your data for as long as necessary to provide services or as required by law. Analysis data is kept for 2 years and then automatically deleted. You can request deletion at any time.",
      items: [
        { 
          label: language === "th" ? "บัญชีผู้ใช้งาน" : "User Accounts",
          desc: language === "th" ? "ตลอดระยะเวลาที่ใช้งาน + 30 วันหลังลบบัญชี" : "Active period + 30 days after deletion"
        },
        { 
          label: language === "th" ? "ข้อมูลการวิเคราะห์" : "Analysis Data",
          desc: language === "th" ? "เก็บไว้ 2 ปีแล้วลบอัตโนมัติ" : "Stored for 2 years, then auto-deleted"
        },
        { 
          label: language === "th" ? "Log Files" : "Log Files",
          desc: language === "th" ? "เก็บไว้ 90 วัน" : "Retained for 90 days"
        },
        { 
          label: language === "th" ? "การสำรองข้อมูล" : "Backup Data",
          desc: language === "th" ? "เก็บไว้ 30 วัน" : "Retained for 30 days"
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
              <Badge className="mb-4 bg-primary/10 text-primary" variant="secondary">
                <Shield className="mr-1 h-3 w-3" />
                {language === "th" ? "อัปเดตล่าสุด: 31 ตุลาคม 2025" : "Last Updated: October 31, 2025"}
              </Badge>
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {language === "th" ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy"}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {language === "th" 
                  ? "เราให้ความสำคัญกับความเป็นส่วนตัวและความปลอดภัยของข้อมูลของคุณ นโยบายนี้อธิบายวิธีการเก็บ ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ"
                  : "We value your privacy and data security. This policy explains how we collect, use, and protect your personal information."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links */}
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
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <div className="h-2 w-2 rounded-full bg-primary" />
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

              {/* Contact Section */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <AlertCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-2 text-lg sm:text-xl font-bold">
                        {language === "th" ? "ติดต่อเรา" : "Contact Us"}
                      </h2>
                      <p className="mb-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {language === "th"
                          ? "หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวหรือต้องการใช้สิทธิ์ของคุณ กรุณาติดต่อเรา:"
                          : "If you have questions about this privacy policy or wish to exercise your rights, please contact us:"
                        }
                      </p>
                      <div className="space-y-2 text-sm sm:text-base">
                        <p>
                          <strong>{language === "th" ? "อีเมล:" : "Email:"}</strong>{" "}
                          <a href="mailto:privacy@aibeautyplatform.com" className="text-primary hover:underline">
                            privacy@aibeautyplatform.com
                          </a>
                        </p>
                        <p>
                          <strong>{language === "th" ? "โทรศัพท์:" : "Phone:"}</strong>{" "}
                          <a href="tel:+66-2-xxx-xxxx" className="text-primary hover:underline">
                            +66 2 XXX XXXX
                          </a>
                        </p>
                        <p>
                          <strong>{language === "th" ? "ที่อยู่:" : "Address:"}</strong>{" "}
                          {language === "th"
                            ? "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
                            : "123 Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand"
                          }
                        </p>
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
