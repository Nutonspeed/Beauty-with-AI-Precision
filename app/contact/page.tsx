"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2,
  Building2,
  Users,
  Sparkles
} from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export default function ContactPage() {
  const { t, language } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    clinicName: "",
    message: "",
    interest: "premium"
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log("Contact form submitted:", formData)
    setSubmitted(true)
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-16">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary" variant="secondary">
              <Sparkles className="mr-2 h-3 w-3" />
              {language === "th" ? "ติดต่อเรา" : "Contact Us"}
            </Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              {language === "th" ? "พร้อมเริ่มต้นกับ AI367BAR?" : "Ready to Start with AI367BAR?"}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {language === "th" 
                ? "ติดต่อทีมงานของเราเพื่อปรึกษาการใช้งานระบบ หรือสอบถามข้อมูลเพิ่มเติม"
                : "Contact our team for consultation or more information about the system"}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {language === "th" ? "ส่งข้อความถึงเรา" : "Send us a Message"}
                  </CardTitle>
                  <CardDescription>
                    {language === "th" 
                      ? "กรอกข้อมูลด้านล่าง เราจะติดต่อกลับภายใน 24 ชั่วโมง"
                      : "Fill in the form below and we'll get back to you within 24 hours"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            {language === "th" ? "ชื่อ-นามสกุล" : "Full Name"} *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder={language === "th" ? "คุณสมชาย ใจดี" : "John Doe"}
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            {language === "th" ? "อีเมล" : "Email"} *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            {language === "th" ? "เบอร์โทรศัพท์" : "Phone Number"}
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="08X-XXX-XXXX"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clinicName">
                            {language === "th" ? "ชื่อคลินิก/บริษัท" : "Clinic/Company Name"}
                          </Label>
                          <Input
                            id="clinicName"
                            name="clinicName"
                            placeholder={language === "th" ? "คลินิกความงาม ABC" : "ABC Beauty Clinic"}
                            value={formData.clinicName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="interest">
                          {language === "th" ? "สนใจแพ็กเกจ" : "Package Interest"}
                        </Label>
                        <select
                          id="interest"
                          name="interest"
                          aria-label="Package Interest"
                          value={formData.interest}
                          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="free">{language === "th" ? "Free Tier - ใช้งานฟรี" : "Free Tier"}</option>
                          <option value="premium">{language === "th" ? "Premium - แพ็กเกจเต็มรูปแบบ" : "Premium Package"}</option>
                          <option value="enterprise">{language === "th" ? "Enterprise - หลายคลินิก" : "Enterprise - Multi-Clinic"}</option>
                          <option value="consultation">{language === "th" ? "ปรึกษาข้อมูลทั่วไป" : "General Consultation"}</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">
                          {language === "th" ? "ข้อความ" : "Message"} *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder={language === "th" 
                            ? "บอกเราเกี่ยวกับความต้องการของคุณ..."
                            : "Tell us about your needs..."}
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            {language === "th" ? "กำลังส่ง..." : "Sending..."}
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            {language === "th" ? "ส่งข้อความ" : "Send Message"}
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="mb-2 text-2xl font-bold">
                        {language === "th" ? "ส่งข้อความสำเร็จ!" : "Message Sent Successfully!"}
                      </h3>
                      <p className="mb-6 text-muted-foreground">
                        {language === "th" 
                          ? "ขอบคุณที่ติดต่อเรา ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง"
                          : "Thank you for contacting us. Our team will get back to you within 24 hours"}
                      </p>
                      <Button onClick={() => setSubmitted(false)} variant="outline">
                        {language === "th" ? "ส่งข้อความอีกครั้ง" : "Send Another Message"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "th" ? "ข้อมูลติดต่อ" : "Contact Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">Email</div>
                      <a href="mailto:contact@ai367bar.com" className="text-sm text-muted-foreground hover:text-primary">
                        contact@ai367bar.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        {language === "th" ? "โทรศัพท์" : "Phone"}
                      </div>
                      <a href="tel:+66123456789" className="text-sm text-muted-foreground hover:text-primary">
                        +66 (0) 12-345-6789
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        {language === "th" ? "ที่อยู่" : "Address"}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === "th" 
                          ? "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
                          : "123 Sukhumvit Road, Klong Toey, Bangkok 10110"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        {language === "th" ? "เวลาทำการ" : "Business Hours"}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === "th" 
                          ? "จันทร์-ศุกร์: 9:00 - 18:00"
                          : "Mon-Fri: 9:00 AM - 6:00 PM"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {language === "th" ? "ลูกค้าองค์กร" : "Enterprise Customers"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      {language === "th" 
                        ? "มีส่วนลดพิเศษสำหรับคลินิกหลายสาขา"
                        : "Special discount for multi-branch clinics"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      {language === "th" 
                        ? "รองรับการปรับแต่งตามความต้องการ"
                        : "Custom configuration support"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      {language === "th" 
                        ? "ทีมซัพพอร์ตเฉพาะทาง 24/7"
                        : "Dedicated 24/7 support team"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
