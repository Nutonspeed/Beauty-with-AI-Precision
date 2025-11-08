"use client"

/**
 * Comprehensive Progress Tracking Dashboard
 * Multi-angle comparison, goal tracking, and trend analysis
 */

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Target, Calendar, Award, LineChart, ImageIcon, Lightbulb } from "lucide-react"
import type { HybridSkinAnalysis } from "@/lib/types/skin-analysis"
import { ProgressCalculator } from "@/lib/utils/progress-calculator"
import { ComparisonView } from "./comparison-view"
import { AnalysisTimeline } from "./analysis-timeline"

export interface ProgressDashboardProps {
  analyses: HybridSkinAnalysis[]
  goals?: Array<{ parameter: string; targetValue: number; label: string }>
  className?: string
}

export function ProgressDashboard({ analyses, goals = [], className = "" }: ProgressDashboardProps) {
  const [selectedView, setSelectedView] = useState<"overview" | "comparison" | "timeline" | "goals">("overview")

  // Sort analyses by date
  const sortedAnalyses = [...analyses].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Calculate progress metrics
  const latestAnalysis = sortedAnalyses[0]
  const firstAnalysis = sortedAnalyses[sortedAnalyses.length - 1]
  const progressMetrics =
    sortedAnalyses.length >= 2 ? ProgressCalculator.calculateProgress(firstAnalysis, latestAnalysis) : null

  // Generate insights
  const insights = ProgressCalculator.generateInsights(sortedAnalyses)

  // Calculate goal progress
  const goalProgress = goals
    .map((goal) => ProgressCalculator.calculateGoalProgress(goal, sortedAnalyses))
    .filter(Boolean)

  if (analyses.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Analysis Data</h3>
        <p className="text-muted-foreground mb-4">
          Start tracking your skin health progress by uploading your first analysis.
        </p>
        <Button>Upload First Analysis</Button>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Analyses</p>
              <p className="text-2xl font-bold">{analyses.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Score</p>
              <p className="text-2xl font-bold">
                {ProgressCalculator.calculateOverallScore(latestAnalysis).toFixed(0)}
              </p>
            </div>
          </div>
        </Card>

        {progressMetrics && (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    progressMetrics.trend === "improving"
                      ? "bg-green-500/10 text-green-600"
                      : progressMetrics.trend === "declining"
                        ? "bg-red-500/10 text-red-600"
                        : "bg-yellow-500/10 text-yellow-600"
                  }`}
                >
                  {progressMetrics.trend === "improving" ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : progressMetrics.trend === "declining" ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : (
                    <LineChart className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall Change</p>
                  <p className="text-2xl font-bold">
                    {progressMetrics.overallImprovement > 0 ? "+" : ""}
                    {progressMetrics.overallImprovement.toFixed(1)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">4-Week Projection</p>
                  <p className="text-2xl font-bold">{progressMetrics.projectedScore.toFixed(0)}</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Insights Card */}
      {insights.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3">Progress Insights</h3>
              <ul className="space-y-2">
                {insights.map((insight, index) => (
                  <li key={index} className="text-sm leading-relaxed">
                    • {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedView} onValueChange={(v: any) => setSelectedView(v)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison" disabled={analyses.length < 2}>
            Comparison
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="goals" disabled={goals.length === 0}>
            Goals
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {progressMetrics && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Parameter Progress</h3>
              <div className="space-y-4">
                {Object.entries(progressMetrics.parameterImprovements).map(([param, change]) => (
                  <ParameterProgressBar
                    key={param}
                    parameter={param}
                    change={change}
                    current={latestAnalysis.overallScore[param as keyof typeof latestAnalysis.overallScore]}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Multi-Angle Comparison */}
          {analyses.length >= 2 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Multi-Angle Progress</h3>
              <div className="grid grid-cols-2 gap-4">
                <MultiAngleComparison analysis={firstAnalysis} label="First Analysis" />
                <MultiAngleComparison analysis={latestAnalysis} label="Latest Analysis" />
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison">
          {analyses.length >= 2 && (
            <ComparisonView
              items={[
                {
                  analysis: firstAnalysis,
                  imageUrl: firstAnalysis.imageUrl,
                  label: "First Analysis",
                },
                {
                  analysis: latestAnalysis,
                  imageUrl: latestAnalysis.imageUrl,
                  label: "Latest Analysis",
                },
              ]}
            />
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <AnalysisTimeline
            entries={sortedAnalyses.map((analysis) => ({
              analysis,
              imageUrl: analysis.imageUrl,
              notes: "",
            }))}
          />
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          {goalProgress.map((goal, index) => goal && <GoalProgressCard key={index} goal={goal} />)}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ParameterProgressBarProps {
  parameter: string
  change: number
  current: number
}

function ParameterProgressBar({ parameter, change, current }: ParameterProgressBarProps) {
  const isImproving = change > 0
  const Icon = isImproving ? TrendingUp : change < 0 ? TrendingDown : LineChart

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium capitalize">{parameter}</span>
        <div className="flex items-center gap-2">
          <Badge variant={isImproving ? "default" : change < 0 ? "destructive" : "secondary"} className="gap-1">
            <Icon className="w-3 h-3" />
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}
          </Badge>
          <span className="text-sm font-semibold">{current.toFixed(0)}/10</span>
        </div>
      </div>
      <Progress value={current * 10} className="h-2" />
    </div>
  )
}

interface MultiAngleComparisonProps {
  analysis: HybridSkinAnalysis
  label: string
}

function MultiAngleComparison({ analysis, label }: MultiAngleComparisonProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-center">{label}</h4>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <img
            src={analysis.imageUrl || "/placeholder.svg"}
            alt="Front view"
            className="w-full aspect-square object-cover rounded"
          />
          <p className="text-xs text-center text-muted-foreground">Front</p>
        </div>
        <div className="space-y-1">
          <img
            src={analysis.imageUrl || "/placeholder.svg"}
            alt="Left view"
            className="w-full aspect-square object-cover rounded"
          />
          <p className="text-xs text-center text-muted-foreground">Left</p>
        </div>
        <div className="space-y-1">
          <img
            src={analysis.imageUrl || "/placeholder.svg"}
            alt="Right view"
            className="w-full aspect-square object-cover rounded"
          />
          <p className="text-xs text-center text-muted-foreground">Right</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold">{ProgressCalculator.calculateOverallScore(analysis).toFixed(0)}</p>
        <p className="text-xs text-muted-foreground">Overall Score</p>
      </div>
    </div>
  )
}

interface GoalProgressCardProps {
  goal: NonNullable<ReturnType<typeof ProgressCalculator.calculateGoalProgress>>
}

function GoalProgressCard({ goal }: GoalProgressCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold capitalize">{goal.parameter} Goal</h4>
          <p className="text-sm text-muted-foreground">
            Target: {goal.targetValue} | Current: {goal.currentValue.toFixed(1)}
          </p>
        </div>
        <Badge variant={goal.onTrack ? "default" : "secondary"}>{goal.onTrack ? "On Track" : "Needs Attention"}</Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span>Progress</span>
          <span className="font-semibold">{goal.progress.toFixed(0)}%</span>
        </div>
        <Progress value={goal.progress} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Start Value</p>
          <p className="font-semibold">{goal.startValue.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Est. Time to Goal</p>
          <p className="font-semibold">
            {goal.estimatedWeeksToGoal === Number.POSITIVE_INFINITY ? "N/A" : `${goal.estimatedWeeksToGoal} weeks`}
          </p>
        </div>
      </div>
    </Card>
  )
}
