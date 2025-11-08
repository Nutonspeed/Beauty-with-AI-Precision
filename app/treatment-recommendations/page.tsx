"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  ArrowLeft,
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Heart,
  Share2
} from "lucide-react"
import type { TreatmentRecommendation, RecommendationResult } from "@/types/treatment"

export default function TreatmentRecommendationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  // User preferences
  const [budgetMax, setBudgetMax] = useState([100000])
  const [maxDowntime, setMaxDowntime] = useState([7])
  const [maxPain, setMaxPain] = useState([5])

  // Load analysis ID from URL or session
  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search)
    const id = params.get("analysis_id")
    
    if (id) {
      setAnalysisId(id)
    } else {
      const stored = sessionStorage.getItem("currentAnalysisId")
      if (stored) {
        setAnalysisId(stored)
      } else {
        setError("No analysis found. Please complete a skin analysis first.")
        setLoading(false)
      }
    }
  }, [])

  // Auto-generate recommendations when analysis ID is available
  useEffect(() => {
    if (analysisId) {
      generateRecommendations()
    }
  }, [analysisId])

  const generateRecommendations = async () => {
    if (!analysisId) return

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisId,
          criteria: {
            budget_max: budgetMax[0],
            max_downtime_days: maxDowntime[0],
            max_pain_level: maxPain[0]
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate recommendations')
      }

      const result = await response.json()
      setRecommendations(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations')
    } finally {
      setGenerating(false)
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading || generating) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">
            {generating ? "Generating AI-powered recommendations..." : "Loading..."}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Analyzing your skin concerns and matching with 60+ treatments
          </p>
        </div>
      </div>
    )
  }

  if (error || !recommendations) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "No recommendations available"}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/analysis")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Analysis
        </Button>
      </div>
    )
  }

  const topRecommendations = recommendations.recommended_treatments.slice(0, 5)

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Treatment Recommendations
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalized treatment plan based on your skin analysis
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Plan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(recommendations.total_estimated_cost_min)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Up to {formatCurrency(recommendations.total_estimated_cost_max)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recommendations.total_timeline_weeks} weeks
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              To see full results
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Predicted Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {recommendations.overall_predicted_improvement}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average across all concerns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recommendations.recommended_treatments.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Treatments matched
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Customize Your Plan</CardTitle>
          <CardDescription>Adjust preferences to refine recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Maximum Budget</span>
              <span className="text-muted-foreground">{formatCurrency(budgetMax[0])}</span>
            </label>
            <Slider
              value={budgetMax}
              onValueChange={setBudgetMax}
              min={10000}
              max={200000}
              step={5000}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Maximum Downtime</span>
              <span className="text-muted-foreground">{maxDowntime[0]} days</span>
            </label>
            <Slider
              value={maxDowntime}
              onValueChange={setMaxDowntime}
              min={0}
              max={14}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Pain Tolerance</span>
              <span className="text-muted-foreground">{maxPain[0]}/10</span>
            </label>
            <Slider
              value={maxPain}
              onValueChange={setMaxPain}
              min={0}
              max={10}
              step={1}
            />
          </div>

          <Button onClick={generateRecommendations} className="w-full" disabled={generating}>
            {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Regenerate Recommendations
          </Button>
        </CardContent>
      </Card>

      {/* Treatment Recommendations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recommended Treatments</h2>

        {topRecommendations.map((rec, index) => (
          <TreatmentCard key={rec.treatment_id} recommendation={rec} rank={index + 1} />
        ))}
      </div>
    </div>
  )
}

function TreatmentCard({ 
  recommendation, 
  rank 
}: { 
  recommendation: TreatmentRecommendation
  rank: number 
}) {
  const treatment = recommendation.treatment
  if (!treatment) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={rank === 1 ? "default" : "secondary"}>
                #{rank} Recommendation
              </Badge>
              <Badge variant="outline">{treatment.category}</Badge>
              <Badge variant="outline" className="ml-auto">
                {Math.round(recommendation.confidence_score * 100)}% Match
              </Badge>
            </div>
            <CardTitle className="text-xl">{treatment.name}</CardTitle>
            <CardDescription className="mt-1">{treatment.name_th}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-sm font-semibold">
              {formatCurrency(recommendation.estimated_cost_min)}
            </div>
            <div className="text-xs text-muted-foreground">Cost</div>
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-sm font-semibold">
              {recommendation.estimated_sessions}x
            </div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-sm font-semibold">
              {recommendation.timeline_weeks}w
            </div>
            <div className="text-xs text-muted-foreground">Timeline</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <div className="text-sm font-semibold text-green-600">
              {recommendation.predicted_improvement}%
            </div>
            <div className="text-xs text-muted-foreground">Improvement</div>
          </div>
        </div>

        {/* Reason */}
        {recommendation.recommendation_reason && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{recommendation.recommendation_reason}</AlertDescription>
          </Alert>
        )}

        {/* Target Concerns */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">Targets:</span>
          {recommendation.target_concerns.map(concern => (
            <Badge key={concern} variant="secondary">
              {concern}
            </Badge>
          ))}
        </div>

        <Separator />

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Downtime:</span>
            <span className="ml-2 font-medium">{treatment.downtime_days} days</span>
          </div>
          <div>
            <span className="text-muted-foreground">Pain Level:</span>
            <span className="ml-2 font-medium">{treatment.pain_level}/10</span>
          </div>
          <div>
            <span className="text-muted-foreground">Age Range:</span>
            <span className="ml-2 font-medium">
              {treatment.min_age}+ years
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Results Last:</span>
            <span className="ml-2 font-medium">
              {treatment.results_duration_months} months
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="default" className="flex-1">
          Book Consultation
        </Button>
        <Button variant="outline" className="flex-1">
          View Details
        </Button>
        <Button variant="ghost" size="icon">
          <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
