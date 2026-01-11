"use client"

/**
 * Program Timeline Component
 * 
 * Visual timeline showing program progress with sessions, milestones,
 * photos, and notes.
 */

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Circle,
  FileText,
  Image,
  Milestone,
  Stethoscope,
  TrendingUp,
  Clock,
} from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { useProgramTimeline } from "@/hooks/useProgram"
import type { ProgramTimeline } from "@/lib/program/program-tracker"

interface AestheticTimelineProps {
  programId: string
}

export function AestheticTimeline({ programId }: AestheticTimelineProps) {
  const t = useTranslations()
  const locale = useLocale()
  const { timeline, loading, error } = useProgramTimeline(programId)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('programTimeline.loading')}</div>
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">{t('programTimeline.empty')}</p>
      </div>
    )
  }

  const getIcon = (type: ProgramTimeline["type"]) => {
    switch (type) {
      case "session":
        return <Stethoscope className="w-5 h-5" />
      case "milestone":
        return <Milestone className="w-5 h-5" />
      case "photo":
        return <Image className="w-5 h-5" />
      case "note":
        return <FileText className="w-5 h-5" />
      case "status_change":
        return <TrendingUp className="w-5 h-5" />
      default:
        return <Circle className="w-5 h-5" />
    }
  }

  const getColor = (type: ProgramTimeline["type"]) => {
    switch (type) {
      case "session":
        return "bg-blue-500"
      case "milestone":
        return "bg-green-500"
      case "photo":
        return "bg-purple-500"
      case "note":
        return "bg-gray-500"
      case "status_change":
        return "bg-orange-500"
      default:
        return "bg-gray-400"
    }
  }

  const getTypeLabel = (type: ProgramTimeline["type"]) => {
    switch (type) {
      case "session":
        return t('programTimeline.types.session')
      case "milestone":
        return t('programTimeline.types.milestone')
      case "photo":
        return t('programTimeline.types.photo')
      case "note":
        return t('programTimeline.types.note')
      case "status_change":
        return t('programTimeline.types.status_change')
      default:
        return type
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'th' ? "th-TH" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(locale === 'th' ? "th-TH" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Timeline entries */}
        <div className="space-y-6">
          {timeline.map((entry, _index) => (
            <div key={entry.id} className="relative pl-16">
              {/* Timeline dot */}
              <div
                className={`absolute left-3 top-2 w-6 h-6 rounded-full ${getColor(
                  entry.type
                )} flex items-center justify-center text-white`}
              >
                {getIcon(entry.type)}
              </div>

              {/* Timeline content */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(entry.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(entry.date)} {t('programTimeline.at')} {formatTime(entry.date)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{entry.description}</p>
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs text-gray-500">
                        {Object.entries(entry.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {timeline.length > 10 && (
        <div className="text-center pt-4">
          <Button variant="outline" size="sm">
            {t('programTimeline.loadMore')}
          </Button>
        </div>
      )}
    </div>
  )
}
