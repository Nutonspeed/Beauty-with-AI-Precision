"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Clock, MessageSquare, Zap } from "lucide-react"
import { PriorityScore } from "@/lib/lead-prioritization"

interface PriorityScoreCardProps {
  leadName: string // currently unused; retained for future display logic
  priorityScore: PriorityScore
}

export function PriorityScoreCard({ leadName: _leadName, priorityScore }: PriorityScoreCardProps) {
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
            Priority Score
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
          <div className="text-xs text-muted-foreground">Total Points</div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Score Breakdown:</div>
          
          {breakdown.onlineBonus > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Online Status
              </span>
              <span className="font-semibold text-green-600">+{breakdown.onlineBonus}</span>
            </div>
          )}

          {breakdown.aiScoreBonus > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs">
                <Sparkles className="h-3 w-3 text-purple-500" />
                AI Score (Issues)
              </span>
              <span className="font-semibold text-purple-600">+{breakdown.aiScoreBonus}</span>
            </div>
          )}

          {breakdown.valueBonus > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs">
                <TrendingUp className="h-3 w-3 text-blue-500" />
                Est. Value
              </span>
              <span className="font-semibold text-blue-600">+{breakdown.valueBonus}</span>
            </div>
          )}

          {breakdown.timeBonus > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3 text-orange-500" />
                Fresh Analysis
              </span>
              <span className="font-semibold text-orange-600">+{breakdown.timeBonus}</span>
            </div>
          )}

          {breakdown.engagementBonus > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs">
                <MessageSquare className="h-3 w-3 text-pink-500" />
                Engagement
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
                <span><strong>Critical Priority:</strong> Immediate action required. High-value lead with urgent needs.</span>
              )}
              {priorityLevel === "high" && (
                <span><strong>High Priority:</strong> Follow up soon. Strong potential for conversion.</span>
              )}
              {priorityLevel === "medium" && (
                <span><strong>Medium Priority:</strong> Good opportunity. Contact when available.</span>
              )}
              {priorityLevel === "low" && (
                <span><strong>Low Priority:</strong> Standard follow-up timeline.</span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
