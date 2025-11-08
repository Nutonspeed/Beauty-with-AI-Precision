"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Sparkles, Download, Send, Eye, Edit } from "lucide-react"

// Mock data - ในโปรดักชั่นจะดึงจาก API
const treatmentPackages = [
  {
    id: "basic",
    name: "แพ็คเกจพื้นฐาน",
    price: 15000,
    treatments: ["HydraFacial", "Chemical Peel", "LED Therapy"],
    description: "เหมาะสำหรับผู้เริ่มต้นที่ต้องการดูแลผิวอย่างครบครัน"
  },
  {
    id: "premium",
    name: "แพ็คเกจพรีเมี่ยม",
    price: 35000,
    treatments: ["HydraFacial", "Chemical Peel", "LED Therapy", "Microdermabrasion", "RF Skin Tightening"],
    description: "สำหรับผู้ที่ต้องการผลลัพธ์ที่เห็นได้ชัดและยั่งยืน"
  },
  {
    id: "vip",
    name: "แพ็คเกจ VIP",
    price: 75000,
    treatments: ["ทุกทรีตเมนต์ที่มี", "ปรึกษาแพทย์เฉพาะ", "Home Care Kit", "Follow-up 6 เดือน"],
    description: "แพ็คเกจครบครันสำหรับผู้ที่ต้องการการดูแลระดับมืออาชีพ"
  }
]

const aiSuggestions = [
  {
    id: "1",
    customerName: "นางสาว สมใจ รักสวย",
    skinType: "ผิวมัน",
    concerns: ["สิว", "รูขุมขนกว้าง"],
    recommendedPackage: "premium",
    confidence: 92,
    reasoning: "ลูกค้าอายุ 25 ปี มีปัญหาผิวมันและสิว ควรใช้แพ็คเกจพรีเมี่ยมที่มี Chemical Peel และ Microdermabrasion"
  },
  {
    id: "2",
    customerName: "นาย วิชัย ใจดี",
    skinType: "ผิวแห้ง",
    concerns: ["ริ้วรอย", "ผิวไม่กระชับ"],
    recommendedPackage: "vip",
    confidence: 88,
    reasoning: "ลูกค้าอายุ 45 ปี มีปัญหาผิวแห้งและริ้วรอย ควรใช้แพ็คเกจ VIP ที่มี RF Skin Tightening"
  }
]

export function AIProposalGenerator() {
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedPackage, setSelectedPackage] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [generatedProposal, setGeneratedProposal] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateProposal = async () => {
    if (!selectedCustomer || !selectedPackage) return

    setIsGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      const customer = aiSuggestions.find(c => c.id === selectedCustomer)
      const package_ = treatmentPackages.find(p => p.id === selectedPackage)

      if (customer && package_) {
        const proposal = `เรียน ${customer.customerName}

จากการวิเคราะห์ผิวของคุณ เราพบว่าคุณมีปัญหา: ${customer.concerns.join(", ")}

เราขอแนะนำ **${package_.name}** ราคา ${package_.price.toLocaleString()} บาท
ประกอบด้วย: ${package_.treatments.join(", ")}

${package_.description}

${customMessage ? `ข้อความเพิ่มเติม: ${customMessage}` : ""}

ติดต่อเราได้ที่ 02-123-4567 หรือ Walk-in ที่คลินิก

ด้วยความเคารพ
ทีมงาน AI367BAR`

        setGeneratedProposal(proposal)
      }

      setIsGenerating(false)
    }, 2000)
  }

  const handleSendProposal = () => {
    // ในโปรดักชั่นจะส่งไปยัง API
    console.log("Sending proposal:", generatedProposal)
    alert("ส่ง proposal สำเร็จ!")
  }

  const handleDownloadProposal = () => {
    const blob = new Blob([generatedProposal], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'treatment-proposal.txt'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* AI Suggestions & Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Proposal Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Selection */}
          <div>
            <div className="text-sm font-medium mb-2 block">เลือกลูกค้า</div>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกลูกค้า..." />
              </SelectTrigger>
              <SelectContent>
                {aiSuggestions.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.customerName} - {customer.skinType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AI Recommendations */}
          {selectedCustomer && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">AI แนะนำ</h4>
              {(() => {
                const customer = aiSuggestions.find(c => c.id === selectedCustomer)
                if (!customer) return null

                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{customer.skinType}</Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        ความมั่นใจ {customer.confidence}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ปัญหา: {customer.concerns.join(", ")}
                    </p>
                    <p className="text-sm">{customer.reasoning}</p>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Package Selection */}
          <div>
            <div className="text-sm font-medium mb-2 block">เลือกแพ็คเกจ</div>
            <Select value={selectedPackage} onValueChange={setSelectedPackage}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกแพ็คเกจ..." />
              </SelectTrigger>
              <SelectContent>
                {treatmentPackages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name} - ฿{pkg.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Message */}
          <div>
            <div className="text-sm font-medium mb-2 block">ข้อความเพิ่มเติม (ไม่บังคับ)</div>
            <Textarea
              placeholder="เพิ่มข้อความส่วนตัวหรือเงื่อนไขพิเศษ..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateProposal}
            disabled={!selectedCustomer || !selectedPackage || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                กำลังสร้าง Proposal...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                สร้าง Proposal ด้วย AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Proposal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Proposal
            </div>
            {generatedProposal && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleDownloadProposal}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleSendProposal}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedProposal ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {generatedProposal}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  แก้ไข
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  ดูตัวอย่าง
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>เลือกข้อมูลลูกค้าและแพ็คเกจเพื่อสร้าง Proposal</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
