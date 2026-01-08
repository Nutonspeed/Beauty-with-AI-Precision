"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Save,
  FileText,
  CheckCircle
} from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

interface NarrativeTemplate {
  id: string
  title: string
  description: string
  category: string
  content: string
  variables: string[]
}

export default function SalesNarrativePage() {
  const t = useTranslations()
  const locale = useLocale()
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
      title: t('salesNarrativePage.templates.confidence.title'),
      description: t('salesNarrativePage.templates.confidence.description'),
      category: t('salesNarrativePage.templates.confidence.category'),
      content: t('salesNarrativePage.templates.confidence.content'),
      variables: ["customer_name", "treatment_type", "pain_point"]
    },
    {
      id: "problem-solution",
      title: t('salesNarrativePage.templates.problem.title'),
      description: t('salesNarrativePage.templates.problem.description'),
      category: t('salesNarrativePage.templates.problem.category'),
      content: t('salesNarrativePage.templates.problem.content'),
      variables: ["pain_points", "treatment_type"]
    },
    {
      id: "social-proof",
      title: t('salesNarrativePage.templates.social.title'),
      description: t('salesNarrativePage.templates.social.description'),
      category: t('salesNarrativePage.templates.social.category'),
      content: t('salesNarrativePage.templates.social.content'),
      variables: ["treatment_type"]
    },
    {
      id: "urgency-scarcity",
      title: t('salesNarrativePage.templates.urgency.title'),
      description: t('salesNarrativePage.templates.urgency.description'),
      category: t('salesNarrativePage.templates.urgency.category'),
      content: t('salesNarrativePage.templates.urgency.content'),
      variables: []
    }
  ]

  const generateNarrative = async () => {
    if (!selectedTemplate) return

    setIsGenerating(true)

    try {
      // Simulate AI generation with template replacement
      await new Promise(resolve => setTimeout(resolve, 1500))

      let narrative = selectedTemplate.content

      // Replace variables
      narrative = narrative
        .replace(/\[customer_name\]/g, customerName || t('salesNarrativePage.placeholders.customerName'))
        .replace(/\[treatment_type\]/g, treatmentType || t('salesNarrativePage.placeholders.treatmentType'))
        .replace(/\[pain_points\]/g, painPoints || t('salesNarrativePage.placeholders.painPoints'))
        .replace(/\[pain_point\]/g, painPoints || t('salesNarrativePage.placeholders.painPoint'))

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
                {t('salesNarrativePage.badge')}
              </Badge>

              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                {t('salesNarrativePage.title')}
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {t('salesNarrativePage.titleHighlight')}
                </span>
              </h1>

              <p className="mb-8 text-balance text-lg text-muted-foreground leading-relaxed">
                {t('salesNarrativePage.description')}
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
                  {t('salesNarrativePage.tabs.templates')}
                </TabsTrigger>
                <TabsTrigger value="builder">
                  <Wand2 className="w-4 h-4 mr-2" />
                  {t('salesNarrativePage.tabs.builder')}
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t('salesNarrativePage.tabs.analytics')}
                </TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Template Selection */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">
                      {t('salesNarrativePage.chooseTemplate')}
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
                                {template.title}
                              </CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {template.category}
                              </Badge>
                            </div>
                            {selectedTemplate?.id === template.id && (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
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
                          {t('salesNarrativePage.customizeGenerate')}
                        </h3>

                        <Card>
                          <CardHeader>
                            <CardTitle>
                              {selectedTemplate.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Variable Inputs */}
                            {selectedTemplate.variables.includes("customer_name") && (
                              <div>
                                <label className="text-sm font-medium">
                                  {t('salesNarrativePage.customerName')}
                                </label>
                                <Input
                                  value={customerName}
                                  onChange={(e) => setCustomerName(e.target.value)}
                                  placeholder={t('salesNarrativePage.customerNamePlaceholder')}
                                />
                              </div>
                            )}

                            {selectedTemplate.variables.includes("treatment_type") && (
                              <div>
                                <label className="text-sm font-medium">
                                  {t('salesNarrativePage.treatmentType')}
                                </label>
                                <Input
                                  value={treatmentType}
                                  onChange={(e) => setTreatmentType(e.target.value)}
                                  placeholder={t('salesNarrativePage.treatmentTypePlaceholder')}
                                />
                              </div>
                            )}

                            {(selectedTemplate.variables.includes("pain_points") ||
                              selectedTemplate.variables.includes("pain_point")) && (
                              <div>
                                <label className="text-sm font-medium">
                                  {t('salesNarrativePage.mainConcern')}
                                </label>
                                <Input
                                  value={painPoints}
                                  onChange={(e) => setPainPoints(e.target.value)}
                                  placeholder={t('salesNarrativePage.mainConcernPlaceholder')}
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
                                  {t('salesNarrativePage.generating')}
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-4 h-4 mr-2" />
                                  {t('salesNarrativePage.generateNarrative')}
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
                                  {t('salesNarrativePage.generatedNarrative')}
                                </CardTitle>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(generatedNarrative)}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  {t('salesNarrativePage.copy')}
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
                          <p>{t('salesNarrativePage.selectTemplate')}</p>
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
                      {t('salesNarrativePage.buildOwnTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder={t('salesNarrativePage.writeNarrativePlaceholder')}
                      value={customNarrative}
                      onChange={(e) => setCustomNarrative(e.target.value)}
                      rows={10}
                      className="min-h-[200px]"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Save className="w-4 h-4 mr-2" />
                        {t('salesNarrativePage.save')}
                      </Button>
                      <Button variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        {t('salesNarrativePage.copy')}
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
                        {t('salesNarrativePage.conversionRate')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">87%</div>
                      <p className="text-sm text-muted-foreground">
                        {t('salesNarrativePage.increaseFromLastMonth')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {t('salesNarrativePage.engagement')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">94%</div>
                      <p className="text-sm text-muted-foreground">
                        {t('salesNarrativePage.customerResponse')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {t('salesNarrativePage.salesValue')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">+23%</div>
                      <p className="text-sm text-muted-foreground">
                        {t('salesNarrativePage.increaseFromStorytelling')}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t('salesNarrativePage.popularTemplates')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {narrativeTemplates.slice(0, 3).map((template, index) => (
                        <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">
                              {template.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {85 + index * 5}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {t('salesNarrativePage.usageRate')}
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
