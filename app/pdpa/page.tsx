"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, FileText, Lock, UserCheck, Mail, Phone, Building2, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import Link from "next/link"

export default function PDPAPage() {
  const { language } = useLanguage()

  const rights = [
    {
      icon: FileText,
      title: language === "th" ? "สิทธิในการเข้าถึงข้อมูล" : "Right to Access",
      titleTh: "สิทธิในการเข้าถึงข้อมูล",
      desc: language === "th"
        ? "คุณมีสิทธิ์ขอเข้าถึงข้อมูลส่วนบุคคลของคุณที่เราเก็บรวบรวมและใช้งาน"
        : "You have the right to access your personal data that we collect and use.",
    },
    {
      icon: UserCheck,
      title: language === "th" ? "สิทธิในการแก้ไขข้อมูล" : "Right to Rectification",
      titleTh: "สิทธิในการแก้ไขข้อมูล",
      desc: language === "th"
        ? "คุณสามารถขอแก้ไขข้อมูลที่ไม่ถูกต้อง ไม่สมบูรณ์ หรือทำให้เข้าใจผิด"
        : "You can request correction of inaccurate, incomplete, or misleading data.",
    },
    {
      icon: Lock,
      title: language === "th" ? "สิทธิในการลบข้อมูล" : "Right to Erasure",
      titleTh: "สิทธิในการลบข้อมูล",
      desc: language === "th"
        ? "คุณสามารถขอให้ลบหรือทำลายข้อมูลส่วนบุคคลของคุณ หรือทำให้ข้อมูลเป็นข้อมูลที่ไม่สามารถระบุตัวบุคคลได้"
        : "You can request deletion or destruction of your personal data, or anonymization.",
    },
    {
      icon: Shield,
      title: language === "th" ? "สิทธิในการระงับการใช้ข้อมูล" : "Right to Restriction",
      titleTh: "สิทธิในการระงับการใช้ข้อมูล",
      desc: language === "th"
        ? "คุณสามารถขอให้ระงับการใช้ข้อมูลส่วนบุคคลของคุณชั่วคราว"
        : "You can request temporary suspension of personal data use.",
    },
    {
      icon: FileText,
      title: language === "th" ? "สิทธิในการโอนย้ายข้อมูล" : "Right to Data Portability",
      titleTh: "สิทธิในการโอนย้ายข้อมูล",
      desc: language === "th"
        ? "คุณสามารถขอรับข้อมูลส่วนบุคคลในรูปแบบที่สามารถอ่านหรือใช้งานได้ทั่วไป และส่งต่อข้อมูลนั้นไปยังผู้ควบคุมข้อมูลอื่น"
        : "You can request your data in a commonly used format and transfer it to another controller.",
    },
    {
      icon: UserCheck,
      title: language === "th" ? "สิทธิในการคัดค้าน" : "Right to Object",
      titleTh: "สิทธิในการคัดค้าน",
      desc: language === "th"
        ? "คุณสามารถคัดค้านการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคลของคุณ"
        : "You can object to the collection, use, or disclosure of your personal data.",
    },
    {
      icon: Shield,
      title: language === "th" ? "สิทธิในการถอนความยินยอม" : "Right to Withdraw Consent",
      titleTh: "สิทธิในการถอนความยินยอม",
      desc: language === "th"
        ? "คุณสามารถถอนความยินยอมในการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคลได้ทุกเมื่อ"
        : "You can withdraw consent for data collection, use, or disclosure at any time.",
    },
    {
      icon: FileText,
      title: language === "th" ? "สิทธิในการร้องเรียน" : "Right to Complaint",
      titleTh: "สิทธิในการร้องเรียน",
      desc: language === "th"
        ? "คุณมีสิทธิ์ยื่นเรื่องร้องเรียนต่อคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล หากเชื่อว่าการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลผิดกฎหมาย"
        : "You can file a complaint with the Personal Data Protection Committee if you believe data handling is unlawful.",
    },
  ]

  const steps = [
    {
      step: "1",
      title: language === "th" ? "ติดต่อเรา" : "Contact Us",
      desc: language === "th"
        ? "ส่งคำขอผ่านอีเมล โทรศัพท์ หรือแบบฟอร์มออนไลน์"
        : "Send request via email, phone, or online form",
    },
    {
      step: "2",
      title: language === "th" ? "ยืนยันตัวตน" : "Verify Identity",
      desc: language === "th"
        ? "แสดงเอกสารยืนยันตัวตนเพื่อความปลอดภัย"
        : "Provide ID verification for security",
    },
    {
      step: "3",
      title: language === "th" ? "รอการดำเนินการ" : "Wait for Processing",
      desc: language === "th"
        ? "เราจะดำเนินการภายใน 30 วัน"
        : "We will process within 30 days",
    },
    {
      step: "4",
      title: language === "th" ? "รับผลลัพธ์" : "Receive Result",
      desc: language === "th"
        ? "รับแจ้งผลการดำเนินการทางอีเมล"
        : "Receive notification via email",
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
                {language === "th" ? "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562" : "Personal Data Protection Act B.E. 2562 (2019)"}
              </Badge>
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {language === "th" ? "นโยบายคุ้มครองข้อมูลส่วนบุคคล" : "Personal Data Protection Policy"}
                <span className="block text-2xl sm:text-3xl md:text-4xl mt-2 text-primary">PDPA</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {language === "th"
                  ? "เรายึดมั่นในการปกป้องสิทธิ์ของคุณตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 คุณมีสิทธิ์ในการควบคุมข้อมูลส่วนบุคคลของคุณเอง"
                  : "We are committed to protecting your rights under the Personal Data Protection Act B.E. 2562 (2019). You have the right to control your personal data."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Rights Section */}
        <section className="py-8 sm:py-12 border-b border-border bg-background">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 text-center">
                <h2 className="mb-3 text-2xl sm:text-3xl font-bold">
                  {language === "th" ? "สิทธิ์ของคุณภายใต้ PDPA" : "Your Rights Under PDPA"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {language === "th"
                    ? "คุณมีสิทธิ์ 8 ประการในการควบคุมข้อมูลส่วนบุคคลของคุณ"
                    : "You have 8 fundamental rights to control your personal data"
                  }
                </p>
              </div>

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {rights.map((right, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                    <CardContent className="p-4 sm:p-5">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <right.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="mb-2 text-sm sm:text-base font-semibold leading-tight">
                        {right.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {right.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How to Exercise Rights */}
        <section className="py-8 sm:py-12">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 text-center">
                <h2 className="mb-3 text-2xl sm:text-3xl font-bold">
                  {language === "th" ? "วิธีการใช้สิทธิ์" : "How to Exercise Your Rights"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {language === "th"
                    ? "ทำตามขั้นตอนง่ายๆ เพื่อใช้สิทธิ์ของคุณ"
                    : "Follow these simple steps to exercise your rights"
                  }
                </p>
              </div>

              <div className="mb-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary text-2xl sm:text-3xl font-bold text-primary-foreground">
                        {item.step}
                      </div>
                      <h3 className="mb-2 text-base sm:text-lg font-semibold">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30" />
                    )}
                  </div>
                ))}
              </div>

              {/* Contact Cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Email */}
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {language === "th" ? "อีเมล" : "Email"}
                    </h3>
                    <a
                      href="mailto:pdpa@aibeautyplatform.com"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      pdpa@aibeautyplatform.com
                    </a>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {language === "th" ? "ตอบกลับภายใน 24 ชั่วโมง" : "Response within 24 hours"}
                    </p>
                  </CardContent>
                </Card>

                {/* Phone */}
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {language === "th" ? "โทรศัพท์" : "Phone"}
                    </h3>
                    <a href="tel:+66-2-xxx-xxxx" className="text-sm text-primary hover:underline">
                      +66 2 XXX XXXX
                    </a>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {language === "th" ? "จันทร์-ศุกร์ 9:00-18:00" : "Mon-Fri 9:00-18:00"}
                    </p>
                  </CardContent>
                </Card>

                {/* Office */}
                <Card className="border-2 hover:border-primary/50 transition-all sm:col-span-2 lg:col-span-1">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {language === "th" ? "ที่อยู่สำนักงาน" : "Office Address"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === "th"
                        ? "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
                        : "123 Sukhumvit Road, Khlong Toei, Bangkok 10110"
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* DPO Section */}
        <section className="border-t border-border bg-muted/50 py-8 sm:py-12">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <UserCheck className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-3 text-xl sm:text-2xl font-bold">
                        {language === "th" ? "เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล" : "Data Protection Officer"}
                        <span className="ml-2 text-primary">(DPO)</span>
                      </h2>
                      <p className="mb-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {language === "th"
                          ? "หากคุณมีคำถามหรือต้องการความช่วยเหลือเกี่ยวกับการคุ้มครองข้อมูลส่วนบุคคล สามารถติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคลของเราได้"
                          : "If you have questions or need assistance regarding personal data protection, please contact our Data Protection Officer."
                        }
                      </p>
                      <div className="space-y-2 text-sm sm:text-base mb-6">
                        <p>
                          <strong>{language === "th" ? "ชื่อ:" : "Name:"}</strong> คุณสมชาย ใจดี (Mr. Somchai Jaidee)
                        </p>
                        <p>
                          <strong>{language === "th" ? "อีเมล:" : "Email:"}</strong>{" "}
                          <a href="mailto:dpo@aibeautyplatform.com" className="text-primary hover:underline">
                            dpo@aibeautyplatform.com
                          </a>
                        </p>
                        <p>
                          <strong>{language === "th" ? "โทรศัพท์:" : "Phone:"}</strong>{" "}
                          <a href="tel:+66-2-xxx-xxxx" className="text-primary hover:underline">
                            +66 2 XXX XXXX ต่อ 101
                          </a>
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/contact">
                          <Button className="w-full sm:w-auto">
                            <Mail className="mr-2 h-4 w-4" />
                            {language === "th" ? "ติดต่อ DPO" : "Contact DPO"}
                          </Button>
                        </Link>
                        <Link href="/privacy">
                          <Button variant="outline" className="w-full sm:w-auto">
                            <Shield className="mr-2 h-4 w-4" />
                            {language === "th" ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Legal Authority */}
        <section className="border-t border-border bg-background py-8">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg sm:text-xl font-bold">
                    {language === "th" ? "หน่วยงานกำกับดูแล" : "Regulatory Authority"}
                  </h3>
                  <p className="mb-4 text-sm sm:text-base text-muted-foreground">
                    {language === "th"
                      ? "คณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (Personal Data Protection Committee)"
                      : "Personal Data Protection Committee"
                    }
                  </p>
                  <a
                    href="https://www.pdpc.or.th"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    www.pdpc.or.th
                  </a>
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
