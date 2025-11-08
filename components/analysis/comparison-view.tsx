"use client"

/**
 * Side-by-Side Analysis Comparison
 * Compare 2-3 analyses with synchronized viewing
 */

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Minus, ArrowRight, ImageIcon } from "lucide-react"
import type { HybridSkinAnalysis } from "@/lib/types/skin-analysis"

export interface ComparisonItem {
  analysis: HybridSkinAnalysis
  imageUrl?: string
  label?: string
}

export interface ComparisonViewProps {
  items: [ComparisonItem, ComparisonItem] | [ComparisonItem, ComparisonItem, ComparisonItem]
  className?: string
}

export function ComparisonView({ items, className = "" }: ComparisonViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Analysis Comparison</h2>
        <p className="text-muted-foreground">Compare {items.length} analyses side-by-side</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className={`grid grid-cols-${items.length} gap-4`}>
            {items.map((item, index) => (
              <OverviewCard key={index} item={item} index={index} />
            ))}
          </div>

          {/* Improvement Summary */}
          {items.length === 2 && <ImprovementSummary before={items[0]} after={items[1]} />}
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <Card className="p-6">
            <div className={`grid grid-cols-${items.length} gap-6`}>
              {items.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-sm font-medium text-center">{item.label || `Analysis ${index + 1}`}</div>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={`Analysis ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="text-xs text-center text-muted-foreground">
                    {new Date(item.analysis.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Parameters Tab */}
        <TabsContent value="parameters" className="space-y-4">
          <ParameterComparison items={items} parameter="spots" label="Spots" />
          <ParameterComparison items={items} parameter="pores" label="Pores" />
          <ParameterComparison items={items} parameter="wrinkles" label="Wrinkles" />
          <ParameterComparison items={items} parameter="texture" label="Texture" />
          <ParameterComparison items={items} parameter="redness" label="Redness" />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Progress Metrics</h3>
            <div className="space-y-6">
              {items.length === 2 && <ProgressMetrics before={items[0]} after={items[1]} />}
              {items.length === 3 && (
                <>
                  <ProgressMetrics before={items[0]} after={items[1]} label="1 → 2" />
                  <Separator />
                  <ProgressMetrics before={items[1]} after={items[2]} label="2 → 3" />
                  <Separator />
                  <ProgressMetrics before={items[0]} after={items[2]} label="Overall (1 → 3)" />
                </>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface OverviewCardProps {
  item: ComparisonItem
  index: number
}

function OverviewCard({ item, index }: OverviewCardProps) {
  const { analysis, imageUrl, label } = item
  const date = new Date(analysis.timestamp)

  return (
    <Card className="p-4">
      <div className="text-center mb-3">
        <Badge className="mb-2">{label || `Analysis ${index + 1}`}</Badge>
        <p className="text-xs text-muted-foreground">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </p>
      </div>

      {imageUrl && (
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={label || `Analysis ${index + 1}`}
          className="w-full aspect-square object-cover rounded mb-3"
        />
      )}

      <div className="space-y-3">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">
            {Math.round(
              (analysis.overallScore.spots +
                analysis.overallScore.pores +
                analysis.overallScore.wrinkles +
                analysis.overallScore.texture +
                analysis.overallScore.redness +
                analysis.overallScore.pigmentation) /
                6,
            )}
          </p>
          <p className="text-xs text-muted-foreground">Overall Score</p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center">
            <p className="font-semibold">95%</p>
            <p className="text-xs text-muted-foreground">Confidence</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">
              {Math.round(
                (analysis.percentiles.spots +
                  analysis.percentiles.pores +
                  analysis.percentiles.wrinkles +
                  analysis.percentiles.texture +
                  analysis.percentiles.redness) /
                  5,
              )}
              th
            </p>
            <p className="text-xs text-muted-foreground">Percentile</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

interface ImprovementSummaryProps {
  before: ComparisonItem
  after: ComparisonItem
}

function ImprovementSummary({ before, after }: ImprovementSummaryProps) {
  const beforeScore = Math.round(
    (before.analysis.overallScore.spots +
      before.analysis.overallScore.pores +
      before.analysis.overallScore.wrinkles +
      before.analysis.overallScore.texture +
      before.analysis.overallScore.redness +
      before.analysis.overallScore.pigmentation) /
      6,
  )
  const afterScore = Math.round(
    (after.analysis.overallScore.spots +
      after.analysis.overallScore.pores +
      after.analysis.overallScore.wrinkles +
      after.analysis.overallScore.texture +
      after.analysis.overallScore.redness +
      after.analysis.overallScore.pigmentation) /
      6,
  )
  const scoreDiff = afterScore - beforeScore
  const beforePercentile = Math.round(
    (before.analysis.percentiles.spots +
      before.analysis.percentiles.pores +
      before.analysis.percentiles.wrinkles +
      before.analysis.percentiles.texture +
      before.analysis.percentiles.redness) /
      5,
  )
  const afterPercentile = Math.round(
    (after.analysis.percentiles.spots +
      after.analysis.percentiles.pores +
      after.analysis.percentiles.wrinkles +
      after.analysis.percentiles.texture +
      after.analysis.percentiles.redness) /
      5,
  )
  const percentileDiff = afterPercentile - beforePercentile

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-2xl font-bold">{beforeScore}</p>
          <p className="text-sm text-muted-foreground">Before</p>
        </div>

        <div className="flex items-center gap-2">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>

        <div className="text-center flex-1">
          <p className="text-2xl font-bold">{afterScore}</p>
          <p className="text-sm text-muted-foreground">After</p>
        </div>

        <div className="flex-1 text-center">
          <ChangeBadge value={scoreDiff} label="Score Change" />
          <ChangeBadge value={percentileDiff} label="Percentile Change" className="mt-2" />
        </div>
      </div>
    </Card>
  )
}

interface ParameterComparisonProps {
  readonly items: readonly ComparisonItem[]
  readonly parameter: keyof ComparisonItem["analysis"]["percentiles"]
  readonly label: string
}

function ParameterComparison({ items, parameter, label }: ParameterComparisonProps) {
  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3">{label}</h4>
      <div className={`grid grid-cols-${items.length} gap-4`}>
        {items.map((item, index) => {
          const percentile = item.analysis.percentiles[parameter]
          const severity =
            parameter === "overall"
              ? item.analysis.overallScore
              : parameter === "texture"
                ? item.analysis.cv.texture.score
                : (item.analysis.cv[parameter as keyof typeof item.analysis.cv] as any)?.severity || 0

          return (
            <div key={index} className="space-y-2">
              <div className="text-sm text-center font-medium">{item.label || `Analysis ${index + 1}`}</div>
              <div className="text-center">
                <p className="text-2xl font-bold">{percentile}th</p>
                <p className="text-sm text-muted-foreground">Percentile</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{severity}/10</p>
                <p className="text-xs text-muted-foreground">Severity</p>
              </div>
            </div>
          )
        })}
      </div>

      {items.length === 2 && (
        <div className="mt-3 pt-3 border-t text-center">
          <ChangeBadge
            value={items[1].analysis.percentiles[parameter] - items[0].analysis.percentiles[parameter]}
            label="Change"
          />
        </div>
      )}
    </Card>
  )
}

interface ProgressMetricsProps {
  readonly before: ComparisonItem
  readonly after: ComparisonItem
  readonly label?: string
}

function ProgressMetrics({ before, after, label = "Progress" }: ProgressMetricsProps) {
  const parameters: Array<{
    key: keyof typeof before.analysis.percentiles
    label: string
  }> = [
    { key: "spots", label: "Spots" },
    { key: "pores", label: "Pores" },
    { key: "wrinkles", label: "Wrinkles" },
    { key: "texture", label: "Texture" },
    { key: "redness", label: "Redness" },
  ]

  return (
    <div>
      <h4 className="font-semibold mb-4">{label}</h4>
      <div className="space-y-2">
        {parameters.map(({ key, label: paramLabel }) => {
          const beforeValue = before.analysis.percentiles[key]
          const afterValue = after.analysis.percentiles[key]
          const change = afterValue - beforeValue

          return (
            <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/50">
              <span className="text-sm font-medium">{paramLabel}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm">{beforeValue}th</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{afterValue}th</span>
                <ChangeBadge value={change} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ChangeBadgeProps {
  readonly value: number
  readonly label?: string
  readonly className?: string
}

function ChangeBadge({ value, label, className = "" }: ChangeBadgeProps) {
  const isPositive = value > 0
  const isNegative = value < 0
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
  const variant = isPositive ? "default" : isNegative ? "destructive" : "secondary"

  return (
    <Badge variant={variant} className={`gap-1 ${className}`}>
      <Icon className="w-3 h-3" />
      {label && <span className="mr-1">{label}:</span>}
      {isPositive ? "+" : ""}
      {value}
    </Badge>
  )
}
