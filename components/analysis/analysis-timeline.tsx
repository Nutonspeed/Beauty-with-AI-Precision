"use client"

import type React from "react"

/**
 * Analysis Timeline Component
 * Visual progress tracking with before/after comparisons
 */

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Calendar, ChevronLeft, ChevronRight, Target } from "lucide-react"
import type { HybridSkinAnalysis } from "@/lib/types/skin-analysis"

export interface TimelineEntry {
  analysis: HybridSkinAnalysis
  imageUrl?: string
  notes?: string
}

export interface AnalysisTimelineProps {
  entries: TimelineEntry[]
  onSelectEntry?: (entry: TimelineEntry) => void
  className?: string
}

export function AnalysisTimeline({ entries, onSelectEntry, className = "" }: AnalysisTimelineProps) {
  if (entries.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <p className="text-muted-foreground">No analysis history available</p>
      </Card>
    )
  }

  // Sort by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => b.analysis.timestamp.getTime() - a.analysis.timestamp.getTime())

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Progress Timeline
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" disabled>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

        {/* Timeline entries */}
        <div className="space-y-8">
          {sortedEntries.map((entry, index) => {
            const prevEntry = sortedEntries[index + 1]
            const improvement = prevEntry
              ? (() => {
                  const currentScore = Math.round(
                    (entry.analysis.overallScore.spots +
                      entry.analysis.overallScore.pores +
                      entry.analysis.overallScore.wrinkles +
                      entry.analysis.overallScore.texture +
                      entry.analysis.overallScore.redness +
                      entry.analysis.overallScore.pigmentation) /
                      6,
                  )
                  const prevScore = Math.round(
                    (prevEntry.analysis.overallScore.spots +
                      prevEntry.analysis.overallScore.pores +
                      prevEntry.analysis.overallScore.wrinkles +
                      prevEntry.analysis.overallScore.texture +
                      prevEntry.analysis.overallScore.redness +
                      prevEntry.analysis.overallScore.pigmentation) /
                      6,
                  )
                  return currentScore - prevScore
                })()
              : 0

            return (
              <TimelineItem
                key={entry.analysis.timestamp.getTime()}
                entry={entry}
                improvement={improvement}
                isFirst={index === 0}
                isLast={index === sortedEntries.length - 1}
                onClick={() => onSelectEntry?.(entry)}
              />
            )
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Sessions" value={entries.length} icon={<Target className="w-5 h-5" />} />
          <StatCard
            label="Current Score"
            value={Math.round(
              (sortedEntries[0].analysis.overallScore.spots +
                sortedEntries[0].analysis.overallScore.pores +
                sortedEntries[0].analysis.overallScore.wrinkles +
                sortedEntries[0].analysis.overallScore.texture +
                sortedEntries[0].analysis.overallScore.redness +
                sortedEntries[0].analysis.overallScore.pigmentation) /
                6,
            )}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            label="Starting Score"
            value={Math.round(
              (sortedEntries[sortedEntries.length - 1].analysis.overallScore.spots +
                sortedEntries[sortedEntries.length - 1].analysis.overallScore.pores +
                sortedEntries[sortedEntries.length - 1].analysis.overallScore.wrinkles +
                sortedEntries[sortedEntries.length - 1].analysis.overallScore.texture +
                sortedEntries[sortedEntries.length - 1].analysis.overallScore.redness +
                sortedEntries[sortedEntries.length - 1].analysis.overallScore.pigmentation) /
                6,
            )}
            icon={<Minus className="w-5 h-5" />}
          />
          <StatCard
            label="Total Improvement"
            value={(() => {
              const currentScore = Math.round(
                (sortedEntries[0].analysis.overallScore.spots +
                  sortedEntries[0].analysis.overallScore.pores +
                  sortedEntries[0].analysis.overallScore.wrinkles +
                  sortedEntries[0].analysis.overallScore.texture +
                  sortedEntries[0].analysis.overallScore.redness +
                  sortedEntries[0].analysis.overallScore.pigmentation) /
                  6,
              )
              const startingScore = Math.round(
                (sortedEntries[sortedEntries.length - 1].analysis.overallScore.spots +
                  sortedEntries[sortedEntries.length - 1].analysis.overallScore.pores +
                  sortedEntries[sortedEntries.length - 1].analysis.overallScore.wrinkles +
                  sortedEntries[sortedEntries.length - 1].analysis.overallScore.texture +
                  sortedEntries[sortedEntries.length - 1].analysis.overallScore.redness +
                  sortedEntries[sortedEntries.length - 1].analysis.overallScore.pigmentation) /
                  6,
              )
              return currentScore - startingScore
            })()}
            icon={<TrendingUp className="w-5 h-5" />}
            showSign
          />
        </div>
      </Card>
    </div>
  )
}

interface TimelineItemProps {
  entry: TimelineEntry
  improvement: number
  isFirst: boolean
  isLast: boolean
  onClick?: () => void
}

function TimelineItem({ entry, improvement, isFirst, isLast, onClick }: TimelineItemProps) {
  const date = new Date(entry.analysis.timestamp)
  const dateString = date.toLocaleDateString()
  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="relative pl-20">
      {/* Timeline dot */}
      <div
        className={`absolute left-6 w-5 h-5 rounded-full border-4 ${
          isFirst ? "bg-primary border-primary" : "bg-background border-border"
        }`}
      />

      {/* Date label */}
      <div className="absolute left-0 top-0 text-xs text-muted-foreground w-14 text-right pr-2">
        {dateString}
        <br />
        {timeString}
      </div>

      {/* Content card */}
      <Card
        className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${isFirst ? "border-primary" : ""}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Image */}
          {entry.imageUrl && (
            <img src={entry.imageUrl || "/placeholder.svg"} alt="Analysis" className="w-20 h-20 rounded object-cover" />
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isFirst && <Badge className="text-xs">Latest</Badge>}
              {isLast && (
                <Badge variant="outline" className="text-xs">
                  First
                </Badge>
              )}
              {!isFirst && improvement !== 0 && <ImprovementBadge value={improvement} />}
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Overall Score</p>
                <p className="font-semibold text-lg">
                  {Math.round(
                    (entry.analysis.overallScore.spots +
                      entry.analysis.overallScore.pores +
                      entry.analysis.overallScore.wrinkles +
                      entry.analysis.overallScore.texture +
                      entry.analysis.overallScore.redness +
                      entry.analysis.overallScore.pigmentation) /
                      6,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="font-semibold text-lg">95%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Percentile</p>
                <p className="font-semibold text-lg">
                  {Math.round(
                    (entry.analysis.percentiles.spots +
                      entry.analysis.percentiles.pores +
                      entry.analysis.percentiles.wrinkles +
                      entry.analysis.percentiles.texture +
                      entry.analysis.percentiles.redness) /
                      5,
                  )}
                  th
                </p>
              </div>
            </div>

            {entry.notes && <p className="mt-2 text-sm text-muted-foreground italic">{entry.notes}</p>}
          </div>
        </div>

        {/* Parameter trends */}
        <div className="mt-3 pt-3 border-t grid grid-cols-3 md:grid-cols-5 gap-2 text-xs">
          <ParamTrend label="Spots" value={entry.analysis.percentiles.spots} />
          <ParamTrend label="Pores" value={entry.analysis.percentiles.pores} />
          <ParamTrend label="Wrinkles" value={entry.analysis.percentiles.wrinkles} />
          <ParamTrend label="Texture" value={entry.analysis.percentiles.texture} />
          <ParamTrend label="Redness" value={entry.analysis.percentiles.redness} />
        </div>
      </Card>
    </div>
  )
}

interface ImprovementBadgeProps {
  value: number
}

function ImprovementBadge({ value }: ImprovementBadgeProps) {
  const isPositive = value > 0
  const Icon = isPositive ? TrendingUp : value < 0 ? TrendingDown : Minus

  return (
    <Badge variant={isPositive ? "default" : value < 0 ? "destructive" : "secondary"} className="text-xs gap-1">
      <Icon className="w-3 h-3" />
      {isPositive ? "+" : ""}
      {value}
    </Badge>
  )
}

interface ParamTrendProps {
  label: string
  value: number
}

function ParamTrend({ label, value }: ParamTrendProps) {
  const getColor = (percentile: number) => {
    if (percentile >= 75) {
      return "text-green-600"
    }
    if (percentile >= 50) {
      return "text-yellow-600"
    }
    return "text-red-600"
  }

  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className={`font-semibold ${getColor(value)}`}>{value}th</p>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  showSign?: boolean
}

function StatCard({ label, value, icon, showSign = false }: StatCardProps) {
  const displayValue = showSign && value > 0 ? `+${value}` : value

  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{displayValue}</p>
      </div>
    </div>
  )
}
