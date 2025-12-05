"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  BookOpen,
  Wand2,
  Target,
  Users,
  TrendingUp,
  Sparkles,
  Copy,
  Play,
  Save,
  FileText,
  ArrowRight,
  CheckCircle,
  Lightbulb
} from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

interface NarrativeTemplate {
  id: string
  title: string
  titleTH: string
  description: string
  descriptionTH: string
  category: string
  categoryTH: string
  content: string
  contentTH: string
  variables: string[]
}

export default function SalesNarrativePage() {
  const { language } = useLanguage()
  const router = useRouter()

  const [selectedTemplate, setSelectedTemplate] = useState<NarrativeTemplate | null>(null)
  const [customNarrative, setCustomNarrative] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [treatmentType, setTreatmentType] = useState("")
  const [painPoints, setPainPoints] = useState("")
  const [generatedNarrative, setGeneratedNarrative] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const narrativeTemplates: NarrativeTemplate[] = [
    {
      id: "confidence-booster",
      title: "Confidence Builder",
      titleTH: "สร้างความมั่นใจ",
      description: "Build customer confidence through success stories",
      descriptionTH: "สร้างความมั่นใจให้ลูกค้าผ่านเรื่องราวความสำเร็จ",
      category: "Motivation",
      categoryTH: "แรงบันดาลใจ",
      content: "Imagine waking up every morning feeling confident and beautiful. That's exactly what happened to Sarah after her treatment with us. She came in feeling self-conscious about her skin, but now she glows with confidence. You deserve to feel that same transformation.",
      contentTH: "ลองนึกภาพว่าตื่นมาในทุกเช้าด้วยความมั่นใจและความงาม นั่นคือสิ่งที่เกิดขึ้นกับซาร่าหลังการรักษากับเรา เธอเข้ามาโดยรู้สึกไม่มั่นใจในผิวของตัวเอง แต่ตอนนี้เธอเปล่งประกายด้วยความมั่นใจ คุณก็สมควรได้สัมผัสการเปลี่ยนแปลงแบบเดียวกันนี้เช่นกัน",
      variables: ["customer_name", "treatment_type", "pain_point"]
    },
    {
      id: "problem-solution",
      title: "Problem-Solution",
      titleTH: "ปัญหา-โซลูชั่น",
      description: "Address pain points and present solutions",
      descriptionTH: "แก้ไขปัญหาและนำเสนอทางออก",
      category: "Education",
      categoryTH: "การศึกษา",
      content: "I understand your concerns about [pain_points]. Many of our clients felt the same way before discovering our advanced [treatment_type]. The technology we use targets these specific issues, providing long-lasting results that traditional methods simply can't match.",
      contentTH: "ฉันเข้าใจความกังวลของคุณเกี่ยวกับ [pain_points] ลูกค้าจำนวนมากของเรารู้สึกแบบเดียวกันก่อนที่จะค้นพบ [treatment_type] ขั้นสูงของเรา เทคโนโลยีที่เราใช้จะจัดการกับปัญหาเฉพาะเหล่านี้อย่างตรงจุด ให้ผลลัพธ์ที่ยาวนานซึ่งวิธีการแบบดั้งเดิมไม่สามารถเทียบเคียงได้",
      variables: ["pain_points", "treatment_type"]
    },
    {
      id: "social-proof",
      title: "Social Proof",
      titleTH: "หลักฐานทางสังคม",
      description: "Leverage testimonials and success metrics",
      descriptionTH: "ใช้คำรับรองและเมตริกความสำเร็จ",
      category: "Trust",
      categoryTH: "ความน่าเชื่อถือ",
      content: "Don't just take my word for it. Over 2,000 satisfied customers have experienced similar transformations. Our [treatment_type] has a 95% satisfaction rate, with clients seeing visible improvements within the first two weeks.",
      contentTH: "อย่าเชื่อคำพูดของฉันเพียงอย่างเดียว ลูกค้าที่พึงพอใจมากกว่า 2,000 คนได้สัมผัสการเปลี่ยนแปลงแบบเดียวกัน [treatment_type] ของเรามีอัตราการพึงพอใจ 95% โดยลูกค้าจะเห็นการปรับปรุงที่ชัดเจนภายในสองสัปดาห์แรก",
      variables: ["treatment_type"]
    },
    {
      id: "urgency-scarcity",
      title: "Urgency & Scarcity",
      titleTH: "ความเร่งด่วนและความหายาก",
      description: "Create time-sensitive opportunities",
      descriptionTH: "สร้างโอกาสที่มีจำกัดเวลา",
      category: "Conversion",
      categoryTH: "การเปลี่ยนใจ",
      content: "This exclusive offer is only available for the next 48 hours. We're limiting participation to ensure personalized attention for each client. Spaces fill up quickly - let's secure your spot today.",
      contentTH: "ข้อเสนอพิเศษนี้มีให้เฉพาะในอีก 48 ชั่วโมงข้างหน้า เราได้จำกัดจำนวนผู้เข้าร่วมเพื่อให้แน่ใจว่าทุกคนจะได้รับการดูแลเป็นการส่วนตัว ช่องว่างเต็มเร็วมาก - มาจองที่ของคุณกันวันนี้เลย",
      variables: []
    }
  ]

  const generateNarrative = async () => {
    if (!selectedTemplate) return

    setIsGenerating(true)

    try {
      // Simulate AI generation with template replacement
      await new Promise(resolve => setTimeout(resolve, 1500))

      let narrative = language === "th" ? selectedTemplate.contentTH : selectedTemplate.content

      // Replace variables
      narrative = narrative
        .replace(/\[customer_name\]/g, customerName || "[ชื่อลูกค้า]")
        .replace(/\[treatment_type\]/g, treatmentType || "[ประเภทการรักษา]")
        .replace(/\[pain_points\]/g, painPoints || "[ปัญหา]")
        .replace(/\[pain_point\]/g, painPoints || "[ปัญหา]")

      setGeneratedNarrative(narrative)
    } catch (error) {
      console.error("Generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add toast notification here
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-primary/10 text-primary" variant="secondary">
                <MessageSquare className="mr-2 h-3 w-3" />
                {language === "th" ? "เครื่องมือเล่าเรื่องการขาย" : "Sales Storytelling Tools"}
              </Badge>

              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                {language === "th" ? "สร้างเรื่องราว" : "Craft"}
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {language === "th" ? "ที่ขายได้" : "That Sells"}
                </span>
              </h1>

              <p className="mb-8 text-balance text-lg text-muted-foreground leading-relaxed">
                {language === "th"
                  ? "ใช้ AI และเทมเพลตที่พิสูจน์แล้วเพื่อสร้างเรื่องราวการขายที่เข้าถึงหัวใจลูกค้า"
                  : "Use AI and proven templates to create compelling sales stories that connect with customers"}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container">
            <Tabs defaultValue="templates" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="templates">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {language === "th" ? "เทมเพลต" : "Templates"}
                </TabsTrigger>
                <TabsTrigger value="builder">
                  <Wand2 className="w-4 h-4 mr-2" />
                  {language === "th" ? "สร้างเอง" : "Builder"}
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {language === "th" ? "วิเคราะห์" : "Analytics"}
                </TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Template Selection */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">
                      {language === "th" ? "เลือกเทมเพลต" : "Choose Template"}
                    </h3>
                    {narrativeTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'ring-2 ring-primary border-primary'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {language === "th" ? template.titleTH : template.title}
                              </CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {language === "th" ? template.categoryTH : template.category}
                              </Badge>
                            </div>
                            {selectedTemplate?.id === template.id && (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {language === "th" ? template.descriptionTH : template.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Template Preview & Generation */}
                  <div className="space-y-4">
                    {selectedTemplate ? (
                      <>
                        <h3 className="text-xl font-semibold">
                          {language === "th" ? "ปรับแต่งและสร้าง" : "Customize & Generate"}
                        </h3>

                        <Card>
                          <CardHeader>
                            <CardTitle>
                              {language === "th" ? selectedTemplate.titleTH : selectedTemplate.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Variable Inputs */}
                            {selectedTemplate.variables.includes("customer_name") && (
                              <div>
                                <label className="text-sm font-medium">
                                  {language === "th" ? "ชื่อลูกค้า" : "Customer Name"}
                                </label>
                                <Input
                                  value={customerName}
                                  onChange={(e) => setCustomerName(e.target.value)}
                                  placeholder={language === "th" ? "เช่น สาระ" : "e.g. Sarah"}
                                />
                              </div>
                            )}

                            {selectedTemplate.variables.includes("treatment_type") && (
                              <div>
                                <label className="text-sm font-medium">
                                  {language === "th" ? "ประเภทการรักษา" : "Treatment Type"}
                                </label>
                                <Input
                                  value={treatmentType}
                                  onChange={(e) => setTreatmentType(e.target.value)}
                                  placeholder={language === "th" ? "เช่น Botox" : "e.g. Botox"}
                                />
                              </div>
                            )}

                            {(selectedTemplate.variables.includes("pain_points") ||
                              selectedTemplate.variables.includes("pain_point")) && (
                              <div>
                                <label className="text-sm font-medium">
                                  {language === "th" ? "ปัญหาหลัก" : "Main Concern"}
                                </label>
                                <Input
                                  value={painPoints}
                                  onChange={(e) => setPainPoints(e.target.value)}
                                  placeholder={language === "th" ? "เช่น รอยเหี่ยวย่น" : "e.g. wrinkles"}
                                />
                              </div>
                            )}

                            <Button
                              onClick={generateNarrative}
                              disabled={isGenerating}
                              className="w-full"
                            >
                              {isGenerating ? (
                                <>
                                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                  {language === "th" ? "กำลังสร้าง..." : "Generating..."}
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-4 h-4 mr-2" />
                                  {language === "th" ? "สร้างเรื่องราว" : "Generate Narrative"}
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Generated Result */}
                        {generatedNarrative && (
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                  {language === "th" ? "เรื่องราวที่สร้าง" : "Generated Narrative"}
                                </CardTitle>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(generatedNarrative)}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  {language === "th" ? "คัดลอก" : "Copy"}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm leading-relaxed">{generatedNarrative}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-muted-foreground">
                        <div className="text-center">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>{language === "th" ? "เลือกเทมเพลตเพื่อเริ่มต้น" : "Select a template to get started"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Builder Tab */}
              <TabsContent value="builder" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "th" ? "สร้างเรื่องราวการขายด้วยตัวเอง" : "Build Your Own Sales Narrative"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder={language === "th"
                        ? "เขียนเรื่องราวการขายของคุณที่นี่..."
                        : "Write your sales narrative here..."}
                      value={customNarrative}
                      onChange={(e) => setCustomNarrative(e.target.value)}
                      rows={10}
                      className="min-h-[200px]"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Save className="w-4 h-4 mr-2" />
                        {language === "th" ? "บันทึก" : "Save"}
                      </Button>
                      <Button variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        {language === "th" ? "คัดลอก" : "Copy"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        {language === "th" ? "อัตราการปิดการขาย" : "Conversion Rate"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">87%</div>
                      <p className="text-sm text-muted-foreground">
                        {language === "th" ? "เพิ่มขึ้น 12% จากเดือนที่แล้ว" : "+12% from last month"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {language === "th" ? "การมีส่วนร่วม" : "Engagement"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">94%</div>
                      <p className="text-sm text-muted-foreground">
                        {language === "th" ? "ลูกค้าตอบสนองต่อเรื่องราว" : "Customer response to narratives"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {language === "th" ? "มูลค่าการขาย" : "Sales Value"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">+23%</div>
                      <p className="text-sm text-muted-foreground">
                        {language === "th" ? "เพิ่มขึ้นจาก storytelling" : "Increase from storytelling"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "th" ? "เทมเพลตยอดนิยม" : "Popular Templates"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {narrativeTemplates.slice(0, 3).map((template, index) => (
                        <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">
                              {language === "th" ? template.titleTH : template.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {language === "th" ? template.descriptionTH : template.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {85 + index * 5}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {language === "th" ? "อัตราการใช้" : "Usage Rate"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
