"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Sparkles, Download, Send, Eye, Edit } from "lucide-react"

export function AIProposalGenerator() {
  const t = useTranslations()
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedPackage, setSelectedPackage] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [generatedProposal, setGeneratedProposal] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const programPackages = [
    {
      id: "basic",
      name: t('salesProposalGenerator.packages.basic.name'),
      price: 15000,
      programs: ["HydraFacial", "Chemical Peel", "LED Therapy"],
      description: t('salesProposalGenerator.packages.basic.description')
    },
    {
      id: "premium",
      name: t('salesProposalGenerator.packages.premium.name'),
      price: 35000,
      programs: ["HydraFacial", "Chemical Peel", "LED Therapy", "Microdermabrasion", "RF Skin Tightening"],
      description: t('salesProposalGenerator.packages.premium.description')
    },
    {
      id: "vip",
      name: t('salesProposalGenerator.packages.vip.name'),
      price: 75000,
      programs: t.raw('salesProposalGenerator.packages.vip.programs') as string[],
      description: t('salesProposalGenerator.packages.vip.description')
    }
  ]

  const aiSuggestions = [
    {
      id: "1",
      customerName: "Somjai Raksauy",
      skinType: t('customer.skinType.oily'),
      concerns: [t('programComparison.concerns.acne'), t('programComparison.concerns.pigmentation')],
      recommendedPackage: "premium",
      confidence: 92,
      reasoning: t('salesProposalGenerator.suggestions.reasoning1')
    },
    {
      id: "2",
      customerName: "Wichai Jaidee",
      skinType: t('customer.skinType.dry'),
      concerns: [t('programComparison.concerns.anti_aging'), t('programComparison.concerns.dryness')],
      recommendedPackage: "vip",
      confidence: 88,
      reasoning: t('salesProposalGenerator.suggestions.reasoning2')
    }
  ]

  const handleGenerateProposal = () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      const customer = aiSuggestions.find(c => c.id === selectedCustomer)
      const pkg = programPackages.find(p => p.id === selectedPackage)
      
      if (customer && pkg) {
        let proposal = t('salesProposalGenerator.proposalTemplate', {
          customerName: customer.customerName,
          packageName: pkg.name,
          price: pkg.price.toLocaleString(),
          reasoning: customer.reasoning
        })
        
        if (customMessage) {
          proposal += `\n\n${t('salesProposalGenerator.personalNote')}: ${customMessage}`
        }
        
        setGeneratedProposal(proposal)
      }
      setIsGenerating(false)
    }, 1500)
  }

  const handleSendProposal = () => {
    // In production this would be sent to an API
    console.log("Sending proposal:", generatedProposal)
    alert(t('salesProposalGenerator.sendSuccess'))
  }

  const handleDownloadProposal = () => {
    const blob = new Blob([generatedProposal], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'program-proposal.txt'
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
            {t('salesProposalGenerator.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Selection */}
          <div>
            <div className="text-sm font-medium mb-2 block">{t('salesProposalGenerator.customerSelection')}</div>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder={t('salesProposalGenerator.customerPlaceholder')} />
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
              <h4 className="font-medium mb-2">{t('salesProposalGenerator.aiRecommendation')}</h4>
              {(() => {
                const customer = aiSuggestions.find(c => c.id === selectedCustomer)
                if (!customer) return null

                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{customer.skinType}</Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {t('salesProposalGenerator.confidenceLabel', { percent: customer.confidence })}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('salesProposalGenerator.concernsLabel', { text: customer.concerns.join(", ") })}
                    </p>
                    <p className="text-sm">{customer.reasoning}</p>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Package Selection */}
          <div>
            <div className="text-sm font-medium mb-2 block">{t('salesProposalGenerator.packageSelection')}</div>
            <Select value={selectedPackage} onValueChange={setSelectedPackage}>
              <SelectTrigger>
                <SelectValue placeholder={t('salesProposalGenerator.packagePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {programPackages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {t(`salesProposalGenerator.packages.${pkg.id}.name`)} - ฿{pkg.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Message */}
          <div>
            <div className="text-sm font-medium mb-2 block">{t('salesProposalGenerator.customMessage')}</div>
            <Textarea
              placeholder={t('salesProposalGenerator.customMessagePlaceholder')}
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
                {t('salesProposalGenerator.generating')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t('salesProposalGenerator.generateButton')}
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
              {t('salesProposalGenerator.generatedTitle')}
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
                  {t('salesProposalGenerator.edit')}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  {t('salesProposalGenerator.preview')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('salesProposalGenerator.emptyState')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
