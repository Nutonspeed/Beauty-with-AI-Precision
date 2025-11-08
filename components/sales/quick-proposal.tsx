"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Sparkles, Send, MessageSquare, Mail, Check, ArrowLeft, Zap } from "lucide-react"

// Interface สำหรับข้อมูลลีด
interface Lead {
  id: string
  name: string
  age: number
  photo?: string
  score: number
  topConcern: string
  secondaryConcern?: string
  estimatedValue: number
  analysisData?: {
    wrinkles: number
    pigmentation: number
    pores: number
    hydration: number
  }
  skinType?: string
  email?: string
  phone?: string
}

// Interface สำหรับแพ็คเกจทรีตเมนต์
interface TreatmentPackage {
  id: string
  name: string
  price: number
  treatments: string[]
  description: string
  recommended: boolean
  discount?: number
}

interface QuickProposalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead | null
  onSent?: () => void
}

export function QuickProposal({ open, onOpenChange, lead, onSent }: QuickProposalProps) {
  const [step, setStep] = useState<"select" | "preview" | "sent">("select")
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [sendMethod, setSendMethod] = useState<"line" | "email" | null>(null)

  // AI แนะนำแพ็คเกจอัตโนมัติจากข้อมูลการวิเคราะห์
  const getAIRecommendedPackages = (): TreatmentPackage[] => {
    if (!lead || !lead.analysisData) {
      return getDefaultPackages()
    }

    const { wrinkles, pigmentation, pores, hydration } = lead.analysisData
    const avgScore = (wrinkles + pigmentation + pores + hydration) / 4

    // แพ็คเกจพื้นฐาน - สำหรับคะแนนดี (>80)
    const basicPackage: TreatmentPackage = {
      id: "basic",
      name: "Maintenance Care",
      price: 15000,
      treatments: ["HydraFacial", "LED Therapy", "Vitamin Serum"],
      description: "บำรุงรักษาผิวที่มีสุขภาพดีอยู่แล้ว",
      recommended: avgScore > 80,
      discount: 10
    }

    // แพ็คเกจกลาง - สำหรับคะแนนปานกลาง (60-80)
    const premiumPackage: TreatmentPackage = {
      id: "premium",
      name: "Deep Renewal",
      price: 35000,
      treatments: [
        "HydraFacial",
        "Chemical Peel",
        "Microdermabrasion",
        "RF Skin Tightening",
        "LED Therapy"
      ],
      description: "ฟื้นฟูผิวที่มีปัญหาปานกลาง เห็นผลชัดเจน",
      recommended: avgScore >= 60 && avgScore <= 80,
      discount: 15
    }

    // แพ็คเกจสูง - สำหรับคะแนนต่ำ (<60) หรือมีปัญหามาก
    const vipPackage: TreatmentPackage = {
      id: "vip",
      name: "Total Transformation",
      price: 75000,
      treatments: [
        "ทุกทรีตเมนต์",
        "Laser Treatment",
        "ปรึกษาแพทย์ผิวหนัง",
        "Home Care Kit",
        "Follow-up 6 เดือน"
      ],
      description: "แก้ปัญหาผิวอย่างครบวงจร พร้อมติดตามผล",
      recommended: avgScore < 60,
      discount: 20
    }

    // เรียงตาม recommended ก่อน
    return [basicPackage, premiumPackage, vipPackage].sort((a, b) => {
      if (a.recommended && !b.recommended) return -1
      if (!a.recommended && b.recommended) return 1
      return 0
    })
  }

  // แพ็คเกจเริ่มต้นถ้าไม่มีข้อมูลการวิเคราะห์
  const getDefaultPackages = (): TreatmentPackage[] => {
    return [
      {
        id: "premium",
        name: "Deep Renewal",
        price: 35000,
        treatments: ["HydraFacial", "Chemical Peel", "Microdermabrasion", "RF Skin Tightening"],
        description: "แพ็คเกจยอดนิยม เหมาะกับทุกสภาพผิว",
        recommended: true,
        discount: 15
      },
      {
        id: "basic",
        name: "Maintenance Care",
        price: 15000,
        treatments: ["HydraFacial", "LED Therapy", "Vitamin Serum"],
        description: "ดูแลรักษาสภาพผิว",
        recommended: false,
        discount: 10
      },
      {
        id: "vip",
        name: "Total Transformation",
        price: 75000,
        treatments: ["ทุกทรีตเมนต์", "Laser", "ปรึกษาแพทย์", "Home Care Kit"],
        description: "แก้ปัญหาอย่างครบวงจร",
        recommended: false,
        discount: 20
      }
    ]
  }

  const packages = getAIRecommendedPackages()
  const selectedPkg = packages.find(p => p.id === selectedPackage)

  // สร้าง proposal text
  const generateProposalText = () => {
    if (!lead || !selectedPkg) return ""

    const finalPrice = selectedPkg.discount 
      ? selectedPkg.price * (1 - selectedPkg.discount / 100)
      : selectedPkg.price

    return `สวัสดีค่ะคุณ${lead.name} 😊

จากการวิเคราะห์ผิวของคุณ เราพบว่าคุณมีความกังวลเรื่อง: ${lead.topConcern}${lead.secondaryConcern ? `, ${lead.secondaryConcern}` : ""}

🎯 **เราขอแนะนำ: ${selectedPkg.name}**

✨ ประกอบด้วย:
${selectedPkg.treatments.map(t => `• ${t}`).join('\n')}

💰 ราคา: ${selectedPkg.price.toLocaleString()} บาท
${selectedPkg.discount ? `🎁 ส่วนลด ${selectedPkg.discount}% = ${finalPrice.toLocaleString()} บาท` : ""}

📌 ${selectedPkg.description}

📞 ติดต่อจองคิว: 02-123-4567
🏥 หรือ Walk-in ที่คลินิก

ด้วยความเคารพ ❤️
ทีมงาน AI367BAR`
  }

  // ส่ง proposal
  const handleSendProposal = () => {
    if (!sendMethod || !selectedPkg) return

    // จำลองการส่ง
    setTimeout(() => {
      setStep("sent")
      
      // Reset หลัง 3 วินาที
      setTimeout(() => {
        onOpenChange(false)
        setStep("select")
        setSelectedPackage(null)
        setSendMethod(null)
        onSent?.()
      }, 2000)
    }, 500)
  }

  // Reset เมื่อปิด
  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep("select")
      setSelectedPackage(null)
      setSendMethod(null)
    }, 300)
  }

  if (!lead) return null

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:w-[500px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <SheetTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Proposal Generator
          </SheetTitle>
          <p className="text-sm text-white/90">
            สำหรับ: {lead.name}, {lead.age} ปี
          </p>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "select" && (
            <div className="space-y-6">
              {/* AI Insight */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">AI Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      ความกังวลหลัก: <span className="font-medium text-foreground">{lead.topConcern}</span>
                    </p>
                    {lead.analysisData && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>ริ้วรอย: {lead.analysisData.wrinkles}/100</div>
                        <div>จุดด่างดำ: {lead.analysisData.pigmentation}/100</div>
                        <div>รูขุมขน: {lead.analysisData.pores}/100</div>
                        <div>ความชุ่มชื้น: {lead.analysisData.hydration}/100</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Package Selection */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  เลือกแพ็คเกจ (1-Tap)
                </h3>
                
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg.id)
                      setStep("preview")
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      pkg.recommended
                        ? "border-purple-500 bg-purple-50 shadow-md"
                        : "border-border bg-background hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {pkg.name}
                          {pkg.recommended && (
                            <Badge className="bg-purple-600">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI แนะนำ
                            </Badge>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {pkg.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      <div className="text-sm text-muted-foreground">
                        {pkg.treatments.length} ทรีตเมนต์
                      </div>
                      <div className="text-right">
                        {pkg.discount && (
                          <div className="text-xs text-red-600 line-through">
                            ฿{pkg.price.toLocaleString()}
                          </div>
                        )}
                        <div className="text-lg font-bold text-purple-600">
                          ฿{(pkg.price * (1 - (pkg.discount || 0) / 100)).toLocaleString()}
                        </div>
                        {pkg.discount && (
                          <Badge variant="destructive" className="text-xs">
                            -{pkg.discount}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "preview" && selectedPkg && (
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => setStep("select")}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                เลือกแพ็คเกจใหม่
              </Button>

              {/* Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">ตัวอย่าง Proposal</h4>
                <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                  {generateProposalText()}
                </pre>
              </div>

              {/* Send Method Selection */}
              <div className="space-y-3">
                <h4 className="font-semibold">เลือกวิธีส่ง (1-Tap)</h4>
                
                <button
                  onClick={() => {
                    setSendMethod("line")
                    handleSendProposal()
                  }}
                  className="w-full p-4 rounded-lg border-2 border-green-500 bg-green-50 hover:bg-green-100 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500 rounded-lg text-white">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-green-900">ส่งผ่าน LINE</div>
                      <div className="text-xs text-green-700">ส่งตรงถึงลูกค้าทันที</div>
                    </div>
                  </div>
                  <Send className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setSendMethod("email")
                    handleSendProposal()
                  }}
                  className="w-full p-4 rounded-lg border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500 rounded-lg text-white">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-blue-900">ส่งผ่าน Email</div>
                      <div className="text-xs text-blue-700">
                        {lead.email || "sales@ai367bar.com"}
                      </div>
                    </div>
                  </div>
                  <Send className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === "sent" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">ส่ง Proposal สำเร็จ! 🎉</h3>
              <p className="text-muted-foreground mb-4">
                ส่งไปยัง {lead.name} ผ่าน {sendMethod === "line" ? "LINE" : "Email"}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-sm text-green-700">
                <Sparkles className="h-4 w-4" />
                แพ็คเกจ: {selectedPkg?.name}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
