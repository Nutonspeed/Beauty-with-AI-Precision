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
import { useTranslations } from "next-intl"
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
  const t = useTranslations('progressDashboard')
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
        <h3 className="text-xl font-semibold mb-2">{t('noData')}</h3>
        <p className="text-muted-foreground mb-4">
          {t('noDataDesc')}
        </p>
        <Button>{t('uploadFirst')}</Button>
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
              <p className="text-sm text-muted-foreground">{t('totalAnalyses')}</p>
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
              <p className="text-sm text-muted-foreground">{t('currentScore')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('overallChange')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('projectedScore')}</p>
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
              <h3 className="text-lg font-semibold mb-3">{t('progressInsights')}</h3>
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
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="comparison" disabled={analyses.length < 2}>
            {t('comparison')}
          </TabsTrigger>
          <TabsTrigger value="timeline">{t('timeline')}</TabsTrigger>
          <TabsTrigger value="goals" disabled={goals.length === 0}>
            {t('goals')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {progressMetrics && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('parameterProgress')}</h3>
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
              <h3 className="text-lg font-semibold mb-4">{t('multiAngleProgress')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <MultiAngleComparison analysis={firstAnalysis} label={t('firstAnalysis')} />
                <MultiAngleComparison analysis={latestAnalysis} label={t('latestAnalysis')} />
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
                  label: t('firstAnalysis'),
                },
                {
                  analysis: latestAnalysis,
                  imageUrl: latestAnalysis.imageUrl,
                  label: t('latestAnalysis'),
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
  const t = useTranslations('progressDashboard')
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
          <p className="text-xs text-center text-muted-foreground">{t('front')}</p>
        </div>
        <div className="space-y-1">
          <img
            src={analysis.imageUrl || "/placeholder.svg"}
            alt="Left view"
            className="w-full aspect-square object-cover rounded"
          />
          <p className="text-xs text-center text-muted-foreground">{t('left')}</p>
        </div>
        <div className="space-y-1">
          <img
            src={analysis.imageUrl || "/placeholder.svg"}
            alt="Right view"
            className="w-full aspect-square object-cover rounded"
          />
          <p className="text-xs text-center text-muted-foreground">{t('right')}</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold">{ProgressCalculator.calculateOverallScore(analysis).toFixed(0)}</p>
        <p className="text-xs text-muted-foreground">{t('overallScore')}</p>
      </div>
    </div>
  )
}

interface GoalProgressCardProps {
  goal: NonNullable<ReturnType<typeof ProgressCalculator.calculateGoalProgress>>
}

function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const t = useTranslations('progressDashboard')
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold capitalize">{t('goalTitle', { parameter: goal.parameter })}</h4>
          <p className="text-sm text-muted-foreground">
            {t('target')}: {goal.targetValue} | {t('current')}: {goal.currentValue.toFixed(1)}
          </p>
        </div>
        <Badge variant={goal.onTrack ? "default" : "secondary"}>{goal.onTrack ? t('onTrack') : t('needsAttention')}</Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span>{t('progress')}</span>
          <span className="font-semibold">{goal.progress.toFixed(0)}%</span>
        </div>
        <Progress value={goal.progress} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">{t('startValue')}</p>
          <p className="font-semibold">{goal.startValue.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t('estTimeToGoal')}</p>
          <p className="font-semibold">
            {goal.estimatedWeeksToGoal === Number.POSITIVE_INFINITY ? "N/A" : `${goal.estimatedWeeksToGoal} ${t('weeks')}`}
          </p>
        </div>
      </div>
    </Card>
  )
}
