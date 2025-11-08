// @ts-nocheck
"use client"

/**
 * A/B Test Results Component
 * 
 * Displays A/B test variant performance comparison with statistical analysis.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, TrendingUp, Users, Eye, MousePointerClick, Target } from "lucide-react"
import { useABTest } from "@/hooks/useMarketing"

interface ABTestResultsProps {
  testId: string
  onDeclareWinner?: (variantId: string) => void
}

export default function ABTestResults({ testId, onDeclareWinner }: ABTestResultsProps) {
  const { test, loading, calculateWinner } = useABTest(testId)

  if (loading || !test) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 bg-gray-100 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  const winner = calculateWinner()

  const formatPercent = (value: number) => `${value.toFixed(1)}%`
  
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return "text-green-600"
    if (confidence >= 90) return "text-blue-600"
    if (confidence >= 80) return "text-yellow-600"
    return "text-gray-600"
  }

  const totalSent = test.variants.reduce((sum, v) => sum + v.sent, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{test.name}</h2>
          <p className="text-sm text-gray-600 mt-1">A/B Test Performance Analysis</p>
        </div>
        <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalSent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{test.variants.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Metric</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold capitalize">{test.metric}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${getConfidenceColor(winner.confidence)}`}>
              {formatPercent(winner.confidence)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Winner Announcement */}
      {winner.winnerId && winner.confidence >= 95 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Award className="w-12 h-12 text-green-600" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900">
                  {winner.winnerName} is the clear winner!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  With {formatPercent(winner.confidence)} confidence, this variant outperforms
                  others significantly.
                </p>
              </div>
              {onDeclareWinner && test.status === "running" && (
                <Button
                  onClick={() => onDeclareWinner(winner.winnerId!)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Declare Winner
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variant Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Performance</CardTitle>
          <CardDescription>Detailed metrics for each variant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {test.variants.map((variant) => {
            const isWinner = variant.id === winner.winnerId
            const trafficPercentage = totalSent > 0 ? (variant.sent / totalSent) * 100 : 0

            return (
              <div
                key={variant.id}
                className={`p-4 rounded-lg border-2 ${
                  isWinner
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Variant Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold">
                      {variant.name}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Variant {variant.name}</h4>
                      <p className="text-sm text-gray-600">{variant.content}</p>
                    </div>
                  </div>
                  {isWinner && <Badge className="bg-green-600">Winner 🏆</Badge>}
                </div>

                {/* Traffic Split */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Traffic Split</span>
                    <span className="font-medium">{formatPercent(trafficPercentage)}</span>
                  </div>
                  <Progress value={trafficPercentage} className="h-2" />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Sent */}
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <Users className="w-3 h-3" />
                      Sent
                    </div>
                    <p className="text-lg font-bold">{variant.sent.toLocaleString()}</p>
                  </div>

                  {/* Open Rate */}
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <Eye className="w-3 h-3" />
                      Open Rate
                    </div>
                    <p className="text-lg font-bold">{formatPercent(variant.openRate)}</p>
                    <p className="text-xs text-gray-500">{variant.opened} opened</p>
                  </div>

                  {/* Click Rate */}
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <MousePointerClick className="w-3 h-3" />
                      Click Rate
                    </div>
                    <p className="text-lg font-bold">{formatPercent(variant.clickRate)}</p>
                    <p className="text-xs text-gray-500">{variant.clicked} clicked</p>
                  </div>

                  {/* Conversion Rate */}
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <Target className="w-3 h-3" />
                      Conv. Rate
                    </div>
                    <p className="text-lg font-bold">{formatPercent(variant.conversionRate)}</p>
                    <p className="text-xs text-gray-500">{variant.conversions} conversions</p>
                  </div>

                  {/* Revenue */}
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <TrendingUp className="w-3 h-3" />
                      Revenue
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(variant.revenue)}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(variant.sent > 0 ? variant.revenue / variant.sent : 0)} per
                      send
                    </p>
                  </div>
                </div>

                {/* Performance vs Winner */}
                {!isWinner && winner.winnerId && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Performance vs Winner:{" "}
                      <span className="font-semibold text-red-600">
                        {(() => {
                          const winnerVariant = test.variants.find((v) => v.id === winner.winnerId)
                          if (!winnerVariant) return "N/A"
                          const metricKey = test.metric === "open_rate" ? "openRate" :
                                          test.metric === "click_rate" ? "clickRate" :
                                          "conversionRate"
                          const diff = variant[metricKey] - winnerVariant[metricKey]
                          return `${diff > 0 ? "+" : ""}${formatPercent(diff)}`
                        })()}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Statistical Significance */}
      <Card>
        <CardHeader>
          <CardTitle>Statistical Analysis</CardTitle>
          <CardDescription>Confidence level and reliability of results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Confidence Level</p>
              <p className="text-sm text-gray-600 mt-1">
                Statistical confidence in the winning variant
              </p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getConfidenceColor(winner.confidence)}`}>
                {formatPercent(winner.confidence)}
              </p>
            </div>
          </div>
          <Progress value={winner.confidence} className="h-3" />
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-600">Low</p>
              <p className="font-medium text-gray-400">{"<"} 80%</p>
            </div>
            <div>
              <p className="text-gray-600">Medium</p>
              <p className="font-medium text-yellow-600">80-95%</p>
            </div>
            <div>
              <p className="text-gray-600">High</p>
              <p className="font-medium text-green-600">≥ 95%</p>
            </div>
          </div>

          {winner.confidence < 95 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ The confidence level is below 95%. Consider collecting more data before making a
                final decision. Current sample size may not be sufficient for reliable results.
              </p>
            </div>
          )}

          {winner.confidence >= 95 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Results are statistically significant! You can confidently choose the winning
                variant for your campaign.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {winner.winnerId && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Next steps based on test results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {winner.confidence >= 95 ? (
              <>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-sm text-gray-700">
                    Use <span className="font-semibold">{winner.winnerName}</span> for all future
                    sends in this campaign
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-sm text-gray-700">
                    Apply winning elements to similar campaigns
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-sm text-gray-700">
                    Consider testing other elements (subject line, timing, CTA) in future tests
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-sm text-gray-700">Continue collecting data to reach 95% confidence</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-sm text-gray-700">
                    Ensure adequate sample size (at least 1,000 sends recommended)
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-sm text-gray-700">
                    Wait for statistical significance before making decisions
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
