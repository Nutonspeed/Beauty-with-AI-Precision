"use client"

import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Clock, MessageSquare, Zap } from "lucide-react"
import { PriorityScore } from "@/lib/lead-prioritization"

interface PriorityScoreCardProps {
  leadName: string // currently unused; retained for future display logic
  priorityScore: PriorityScore
}

export function PriorityScoreCard({ leadName: _leadName, priorityScore }: PriorityScoreCardProps) {
  const t = useTranslations()
  const { totalScore, breakdown, priorityLevel, badge } = priorityScore

  const getBadgeColor = () => {
    switch (priorityLevel) {
      case "critical":
        return "bg-red-600 text-white"
      case "high":
        return "bg-orange-600 text-white"
      case "medium":
        return "bg-yellow-600 text-white"
      case "low":
        return "bg-gray-500 text-white"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t('priorityScore.title')}
          </span>
          <Badge className={getBadgeColor()}>
            {badge}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Total Score */}
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-3xl font-bold text-primary">{totalScore}</div>
          <div className="text-xs text-muted-foreground">{t('priorityScore.totalPoints')}</div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="text-xs font-semibold text-muted-foreground mb-2">{t('priorityScore.breakdown')}</div>
          
          {breakdown.onlineBonus > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                {t('priorityScore.onlineStatus')}
              </span>
              <span className="font-semibold text-green-600">+{breakdown.onlineBonus}</span>
            </div>
          )}

          {breakdown.aiScoreBonus > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs">
                <Sparkles className="h-3 w-3 text-purple-500" />
                {t('priorityScore.aiScore')}
              </span>
              <span className="font-semibold text-purple-600">+{breakdown.aiScoreBonus}</span>
            </div>
          )}

          {breakdown.valueBonus > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs">
                <TrendingUp className="h-3 w-3 text-blue-500" />
                {t('priorityScore.estValue')}
              </span>
              <span className="font-semibold text-blue-600">+{breakdown.valueBonus}</span>
            </div>
          )}

          {breakdown.timeBonus > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3 text-orange-500" />
                {t('priorityScore.freshAnalysis')}
              </span>
              <span className="font-semibold text-orange-600">+{breakdown.timeBonus}</span>
            </div>
          )}

          {breakdown.engagementBonus > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs">
                <MessageSquare className="h-3 w-3 text-pink-500" />
                {t('priorityScore.engagement')}
              </span>
              <span className="font-semibold text-pink-600">+{breakdown.engagementBonus}</span>
            </div>
          )}
        </div>

        {/* Priority Explanation */}
        <div className="pt-3 border-t">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {priorityLevel === "critical" && (
                <span><strong>{t('common.critical')}:</strong> {t('priorityScore.explanations.critical')}</span>
              )}
              {priorityLevel === "high" && (
                <span><strong>{t('common.high')}:</strong> {t('priorityScore.explanations.high')}</span>
              )}
              {priorityLevel === "medium" && (
                <span><strong>{t('common.medium')}:</strong> {t('priorityScore.explanations.medium')}</span>
              )}
              {priorityLevel === "low" && (
                <span><strong>{t('common.low')}:</strong> {t('priorityScore.explanations.low')}</span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
