"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, User, CreditCard, CheckCircle2, ArrowRight, Sparkles } from "lucide-react"
import { toast } from "sonner"

type Step = 1 | 2 | 3 | 4

interface ClinicData {
  // Step 1: Clinic Information
  clinicName: string
  clinicType: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string

  // Step 2: Owner Information
  ownerName: string
  ownerEmail: string
  password: string
  confirmPassword: string

  // Step 3: Plan Selection
  plan: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ClinicData>({
    // Step 1
    clinicName: "",
    clinicType: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Thailand",
    // Step 2
    ownerName: "",
    ownerEmail: "",
    password: "",
    confirmPassword: "",
    // Step 3
    plan: "premium",
  })

  const plans = [
    {
      id: "free",
      name: "Free Tier",
      price: "฿0",
      period: "forever",
      accuracy: "70-80%",
      features: [
        "Browser AI Only (MediaPipe + TensorFlow)",
        "Basic VISIA Metrics (4/8 accurate)",
        "Consumer Education",
        "Unlimited Analysis",
      ],
      color: "bg-gray-500",
    },
    {
      id: "standard",
      name: "Standard",
      price: "฿1,000",
      period: "/month",
      accuracy: "80-85%",
      features: [
        "Hybrid AI (Browser 30% + Cloud 70%)",
        "Lighting Simulation (UV/Polarized)",
        "6/8 VISIA Metrics Accurate",
        "Customer Support",
      ],
      color: "bg-blue-500",
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "฿5,000",
      period: "/month",
      accuracy: "92-96%",
      features: [
        "Dermatology-Trained Models",
        "Depth Estimation (3D Metrics)",
        "8/8 VISIA Metrics",
        "Priority Support",
        "Advanced Analytics",
      ],
      color: "bg-purple-500",
    },
    {
      id: "clinical",
      name: "Clinical",
      price: "฿10,000",
      period: "/month",
      accuracy: "95-99%",
      features: [
        "VISIA-Equivalent Accuracy",
        "Hardware Sensor Integration (Optional)",
        "Medical-Grade Reports",
        "Dedicated Account Manager",
        "Custom AI Training",
      ],
      color: "bg-orange-500",
    },
  ]

  const updateFormData = (field: keyof ClinicData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (
      !formData.clinicName ||
      !formData.clinicType ||
      !formData.email ||
      !formData.phone ||
      !formData.street ||
      !formData.city
    ) {
      toast.error("กรุณากรอกข้อมูลคลินิกให้ครบถ้วน")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.ownerName || !formData.ownerEmail || !formData.password || !formData.confirmPassword) {
      toast.error("กรุณากรอกข้อมูลเจ้าของคลินิกให้ครบถ้วน")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน")
      return false
    }
    if (formData.password.length < 8) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((prev) => Math.min(prev + 1, 4) as Step)
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create tenant
      const slug = formData.clinicName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")

      const response = await fetch("/api/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          clinicName: formData.clinicName,
          clinicType: formData.clinicType,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          plan: formData.plan,
          ownerId: formData.ownerEmail, // Will create user after tenant
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create clinic")
      }

      const { tenant } = await response.json()

      // Create owner user
      const userResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.ownerEmail,
          password: formData.password,
          name: formData.ownerName,
          role: "clinic_owner",
          tenantId: tenant.id,
        }),
      })

      if (!userResponse.ok) {
        throw new Error("Failed to create owner account")
      }

      toast.success("🎉 ยินดีต้อนรับ! คลินิกของคุณพร้อมใช้งานแล้ว")

      // Auto-login and redirect
      setTimeout(() => {
        router.push(`/auth/signin?email=${encodeURIComponent(formData.ownerEmail)}`)
      }, 2000)
    } catch (error) {
      console.error("Onboarding error:", error)
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${
                      s === step
                        ? "border-primary bg-primary text-white"
                        : s < step
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-muted-foreground/20 bg-background text-muted-foreground"
                    }`}
                  >
                    {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`h-1 w-12 ${s < step ? "bg-green-500" : "bg-muted-foreground/20"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Clinic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  <CardTitle>ข้อมูลคลินิก</CardTitle>
                </div>
                <CardDescription>กรอกข้อมูลคลินิกของคุณเพื่อเริ่มต้นใช้งาน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">ชื่อคลินิก *</Label>
                    <Input
                      id="clinicName"
                      placeholder="Beauty Clinic Bangkok"
                      value={formData.clinicName}
                      onChange={(e) => updateFormData("clinicName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinicType">ประเภทคลินิก *</Label>
                    <Select
                      value={formData.clinicType}
                      onValueChange={(value) => updateFormData("clinicType", value)}
                    >
                      <SelectTrigger id="clinicType">
                        <SelectValue placeholder="เลือกประเภทคลินิก" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aesthetic_clinic">คลินิกความงาม</SelectItem>
                        <SelectItem value="dermatology">คลินิกผิวหนัง</SelectItem>
                        <SelectItem value="med_spa">Med Spa</SelectItem>
                        <SelectItem value="wellness">ศูนย์เวลเนส</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@clinic.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+66-2-123-4567"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">ที่อยู่ *</Label>
                  <Input
                    id="street"
                    placeholder="123 Sukhumvit Road"
                    value={formData.street}
                    onChange={(e) => updateFormData("street", e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">เมือง/อำเภอ *</Label>
                    <Input
                      id="city"
                      placeholder="Bangkok"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">จังหวัด</Label>
                    <Input
                      id="state"
                      placeholder="Bangkok"
                      value={formData.state}
                      onChange={(e) => updateFormData("state", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                    <Input
                      id="postalCode"
                      placeholder="10110"
                      value={formData.postalCode}
                      onChange={(e) => updateFormData("postalCode", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleNext}>
                    ถัดไป
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Owner Information */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-6 w-6 text-primary" />
                  <CardTitle>ข้อมูลเจ้าของคลินิก</CardTitle>
                </div>
                <CardDescription>สร้างบัญชีผู้ดูแลระบบหลักของคลินิก</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">ชื่อ-นามสกุล *</Label>
                  <Input
                    id="ownerName"
                    placeholder="Dr. Somchai Clinic"
                    value={formData.ownerName}
                    onChange={(e) => updateFormData("ownerName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">อีเมลสำหรับเข้าสู่ระบบ *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="owner@clinic.com"
                    value={formData.ownerEmail}
                    onChange={(e) => updateFormData("ownerEmail", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    อีเมลนี้จะใช้สำหรับเข้าสู่ระบบในฐานะเจ้าของคลินิก
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">รหัสผ่าน *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    ย้อนกลับ
                  </Button>
                  <Button onClick={handleNext}>
                    ถัดไป
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Plan Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">เลือกแพ็กเกจ</h2>
                </div>
                <p className="text-muted-foreground">เลือกแพ็กเกจที่เหมาะกับความต้องการของคุณ</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      formData.plan === plan.id
                        ? "border-2 border-primary shadow-md"
                        : "border border-border"
                    } ${plan.popular ? "relative" : ""}`}
                    onClick={() => updateFormData("plan", plan.id)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 right-4 bg-primary">
                        <Sparkles className="mr-1 h-3 w-3" />
                        แนะนำ
                      </Badge>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className={`h-2 w-2 rounded-full ${plan.color}`} />
                        <Badge variant="outline">{plan.accuracy} accuracy</Badge>
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  ย้อนกลับ
                </Button>
                <Button onClick={handleNext}>
                  ถัดไป
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <CardTitle>ยืนยันข้อมูล</CardTitle>
                </div>
                <CardDescription>ตรวจสอบข้อมูลก่อนสร้างบัญชี</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">ข้อมูลคลินิก</h3>
                  <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
                    <p>
                      <strong>ชื่อคลินิก:</strong> {formData.clinicName}
                    </p>
                    <p>
                      <strong>ประเภท:</strong>{" "}
                      {formData.clinicType === "aesthetic_clinic"
                        ? "คลินิกความงาม"
                        : formData.clinicType === "dermatology"
                        ? "คลินิกผิวหนัง"
                        : formData.clinicType === "med_spa"
                        ? "Med Spa"
                        : "ศูนย์เวลเนส"}
                    </p>
                    <p>
                      <strong>อีเมล:</strong> {formData.email}
                    </p>
                    <p>
                      <strong>โทรศัพท์:</strong> {formData.phone}
                    </p>
                    <p>
                      <strong>ที่อยู่:</strong> {formData.street}, {formData.city},{" "}
                      {formData.state} {formData.postalCode}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">เจ้าของคลินิก</h3>
                  <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
                    <p>
                      <strong>ชื่อ:</strong> {formData.ownerName}
                    </p>
                    <p>
                      <strong>อีเมล:</strong> {formData.ownerEmail}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">แพ็กเกจ</h3>
                  <div className="rounded-lg bg-muted p-4 text-sm">
                    <p>
                      <strong>แผน:</strong>{" "}
                      {plans.find((p) => p.id === formData.plan)?.name} (
                      {plans.find((p) => p.id === formData.plan)?.accuracy} accuracy)
                    </p>
                    <p>
                      <strong>ราคา:</strong> {plans.find((p) => p.id === formData.plan)?.price}
                      {plans.find((p) => p.id === formData.plan)?.period}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack} disabled={loading}>
                    ย้อนกลับ
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    สร้างบัญชี
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
