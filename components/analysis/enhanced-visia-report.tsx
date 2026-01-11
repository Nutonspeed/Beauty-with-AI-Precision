"use client"

/**
 * Enhanced VISIA-Style Report with PDF Export and Comparison
 */

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "next-intl"
import { Download, Printer, Share2, FileText, TrendingUp, ImageIcon } from "lucide-react"
import type { HybridSkinAnalysis } from "@/lib/types/skin-analysis"
import { getPDFGenerator } from "@/lib/utils/pdf-generator"
import { VISIAReport } from "./visia-report"
import { ComparisonView } from "./comparison-view"
import { AnalysisTimeline } from "./analysis-timeline"

export interface EnhancedVISIAReportProps {
  analysis: HybridSkinAnalysis
  previousAnalyses?: HybridSkinAnalysis[]
  customerInfo?: {
    name?: string
    age?: number
    gender?: string
    skinType?: string
  }
  centerInfo?: {
    name?: string
    logo?: string
    address?: string
    phone?: string
    email?: string
  }
  className?: string
}

export function EnhancedVISIAReport({
  analysis,
  previousAnalyses = [],
  customerInfo,
  centerInfo,
  className = "",
}: EnhancedVISIAReportProps) {
  const t = useTranslations('visiaReport')
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<"report" | "comparison" | "timeline">("report")

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const pdfGenerator = getPDFGenerator()
      await pdfGenerator.generatePDF(analysis, {
        includeImages: true,
        includeCharts: true,
        includeRecommendations: true,
        centerInfo: centerInfo?.name ? { ...centerInfo, name: centerInfo.name } : undefined,
        watermark: t('watermark'),
      })
      console.log("[v0] PDF export initiated")
    } catch (error) {
      console.error("[v0] PDF export failed:", error)
      alert(t('exportPdfFailed'))
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPNG = async () => {
    setIsExporting(true)
    try {
      const pdfGenerator = getPDFGenerator()
      const blob = await pdfGenerator.generatePNG("visia-report")

      // Download the PNG
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `skin-analysis-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)

      console.log("[v0] PNG export complete")
    } catch (error) {
      console.error("[v0] PNG export failed:", error)
      alert(t('exportPngFailed'))
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = () => {
    // window is available in client components, guard for safety if ever refactored
    if (typeof globalThis !== "undefined" && (globalThis as any).print) {
      ;(globalThis as any).print()
    }
  }

  const handleShare = async () => {
    try {
      const pdfGenerator = getPDFGenerator()
      const shareUrl = await pdfGenerator.generateShareLink(analysis.id)

      if (navigator.share) {
        await navigator.share({
          title: t('shareTitle'),
          text: t('shareText'),
          url: shareUrl,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert(t('shareLinkCopied'))
      }
    } catch (error) {
      console.error("[v0] Share failed:", error)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Header with Export Options */}
      <Card className="p-6 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{t('professionalTitle')}</h1>
            <p className="text-muted-foreground">{t('equivalentSystem')}</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Printer className="w-4 h-4" />
              {t('print')}
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <Download className="w-4 h-4" />
              {isExporting ? t('exporting') : t('pdf')}
            </Button>
            <Button
              onClick={handleExportPNG}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <ImageIcon className="w-4 h-4" />
              {t('png')}
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              {t('share')}
            </Button>
          </div>
        </div>

        {/* Tabs for different views */}
  <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="report" className="gap-2">
              <FileText className="w-4 h-4" />
              {t('summary')}
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2" disabled={previousAnalyses.length === 0}>
              <TrendingUp className="w-4 h-4" />
              {t('progressTracking')}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2" disabled={previousAnalyses.length === 0}>
              <TrendingUp className="w-4 h-4" />
              {t('timeline')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="mt-6">
            <VISIAReport
              analysis={analysis}
              customerInfo={customerInfo}
              centerInfo={centerInfo}
              onExport={(format) => {
                if (format === "pdf") handleExportPDF()
                else handleExportPNG()
              }}
              onPrint={handlePrint}
              onShare={handleShare}
            />
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            {previousAnalyses.length > 0 && (
              <ComparisonView
                items={[
                  {
                    analysis,
                    imageUrl: (analysis as any).imageUrl,
                  },
                  ...previousAnalyses.slice(0, 2).map((prev) => ({
                    analysis: prev,
                    imageUrl: (prev as any).imageUrl,
                  })),
                ] as any}
              />
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            {previousAnalyses.length > 0 && (
              <AnalysisTimeline
                entries={[
                  {
                    analysis,
                    imageUrl: (analysis as any).imageUrl,
                    notes: t('latestAnalysis'),
                  },
                  ...previousAnalyses.map((prev) => ({
                    analysis: prev,
                    imageUrl: (prev as any).imageUrl,
                    notes: "",
                  })),
                ]}
              />
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Advanced Features Badge */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-sm">
              {t('visiaEquivalent')}
            </Badge>
            <span className="text-sm text-muted-foreground">{t('accuracyNote')}</span>
          </div>
          {(analysis as any)?.advancedFeatures && (
            <div className="flex gap-2">
              <Badge variant="outline">{t('uvSpots')}</Badge>
              <Badge variant="outline">{t('porphyrins')}</Badge>
              <Badge variant="outline">{t('rbxTech')}</Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
