"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import {
  ActivitySquare,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react"

import { useTranslations, useLocale } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "note"
  | "task"
  | "proposal_sent"
  | "status_change"
  | "other"

interface ActivityLead {
  id: string
  name: string
  status: string | null
  score: number | null
  estimatedValue: number | null
  primaryConcern: string | null
  lastContactAt: string | null
}

interface ActivityProposal {
  id: string
  title: string
  status: string | null
  totalValue: number | null
}

interface ActivityItem {
  id: string
  type: ActivityType
  subject: string
  description: string | null
  contactMethod: string | null
  durationMinutes: number | null
  isTask: boolean
  dueDate: string | null
  completedAt: string | null
  metadata: Record<string, unknown>
  createdAt: string
  lead: ActivityLead | null
  proposal: ActivityProposal | null
}

interface ActivitySummaryByType {
  type: ActivityType | string
  total: number
}

interface ActivityFeedResponse {
  range: string
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  summary: {
    totalActivities: number
    byType: ActivitySummaryByType[]
    uniqueLeads: number
    latestActivityAt: string | null
    oldestActivityAt: string | null
  }
  data: ActivityItem[]
}

export function SalesActivityFeed() {
  const t = useTranslations()
  const locale = useLocale()
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]["value"]>("7d")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ActivityFeedResponse | null>(null)

  const RANGE_OPTIONS = useMemo(() => [
    { value: "24h", label: t('salesActivityFeed.ranges.24h') },
    { value: "7d", label: t('salesActivityFeed.ranges.7d') },
    { value: "30d", label: t('salesActivityFeed.ranges.30d') },
    { value: "90d", label: t('salesActivityFeed.ranges.90d') },
  ], [t])

  const ACTIVITY_BADGE: Record<ActivityType | string, { label: string; className: string }> = {
    call: { label: t('salesLeadDetail.dialog.types.call'), className: "bg-green-500/10 text-green-600" },
    email: { label: t('salesLeadDetail.dialog.types.email'), className: "bg-blue-500/10 text-blue-600" },
    meeting: { label: t('salesLeadDetail.dialog.types.meeting'), className: "bg-indigo-500/10 text-indigo-600" },
    note: { label: t('salesLeadDetail.dialog.types.note'), className: "bg-amber-500/10 text-amber-600" },
    task: { label: t('salesLeadDetail.dialog.types.task'), className: "bg-emerald-500/10 text-emerald-600" },
    proposal_sent: { label: t('salesWizard.steps.summary.sectionProposal'), className: "bg-purple-500/10 text-purple-600" },
    status_change: { label: t('salesLeadDetail.status'), className: "bg-pink-500/10 text-pink-600" },
    other: { label: t('salesLeadDetail.dialog.types.note'), className: "bg-muted text-muted-foreground" },
  }

  const formatTimeAgo = (value: string | null) => {
    if (!value) return t('salesActivityFeed.noActivity')
    try {
      return formatDistanceToNow(new Date(value), { addSuffix: true, locale: locale === 'th' ? th : undefined })
    } catch {
      return t('salesActivityFeed.noActivity')
    }
  }


  const fetchData = useCallback(
    async ({ signal, mode = "refresh" }: { signal?: AbortSignal; mode?: "initial" | "refresh" } = {}) => {
      try {
        setError(null)
        if (mode === "initial") {
          setIsLoading(true)
        } else {
          setIsRefreshing(true)
        }

        const response = await fetch(`/api/sales/activity-feed?range=${range}&limit=25`, {
          signal,
        })

        if (!response.ok) {
          throw new Error(t('salesActivityFeed.errorTitle'))
        }

        const result: ActivityFeedResponse = await response.json()
        setData(result)
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          return
        }
        setError(err instanceof Error ? err.message : t('common.error'))
      } finally {
        if (mode === "initial") {
          setIsLoading(false)
        }
        setIsRefreshing(false)
      }
    },
    [range],
  )

  useEffect(() => {
    const controller = new AbortController()

    fetchData({ signal: controller.signal, mode: "initial" })

    const interval = setInterval(() => {
      fetchData()
    }, 60000)

    return () => {
      controller.abort()
      clearInterval(interval)
    }
  }, [fetchData])

  const handleRefresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  const activities = data?.data ?? []
  const summary = data?.summary

  const typeSummary = useMemo(() => {
    if (!summary) return []
    return summary.byType
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [summary])

  const latestActivityText = summary?.latestActivityAt
    ? t('salesActivityFeed.latest', { time: formatTimeAgo(summary.latestActivityAt) })
    : t('salesActivityFeed.noActivity')

  const getActivityIcon = (type: ActivityType | string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <CalendarClock className="h-4 w-4" />
      case "note":
        return <MessageSquare className="h-4 w-4" />
      case "task":
        return <CheckCircle2 className="h-4 w-4" />
      case "proposal_sent":
        return <FileText className="h-4 w-4" />
      case "status_change":
        return <ActivitySquare className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityBadge = (type: ActivityType | string) => {
    const config = ACTIVITY_BADGE[type] || ACTIVITY_BADGE.other
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t('salesActivityFeed.title')}
          </CardTitle>
          <CardDescription>{latestActivityText}</CardDescription>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <Select value={range} onValueChange={(value) => setRange(value as any)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder={t('salesActivityFeed.rangeLabel')} />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            {isRefreshing ? (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" /> {t('salesActivityFeed.refreshing')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> {t('salesActivityFeed.refresh')}
              </span>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">{t('salesActivityFeed.errorTitle')}</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" onClick={() => setRange((current) => current)}>
              {t('salesActivityFeed.retry')}
            </Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
            <User className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">{t('salesActivityFeed.emptyTitle')}</p>
              <p className="text-sm text-muted-foreground">
                {t('salesActivityFeed.emptyDesc')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {summary && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-3 text-xs md:text-sm">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {t('salesActivityFeed.totalActivities')} {summary.totalActivities.toLocaleString()}
                </Badge>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                  {t('salesActivityFeed.uniqueLeads')} {summary.uniqueLeads.toLocaleString()}
                </Badge>
                {typeSummary.slice(0, 4).map((item) => (
                  <Badge key={item.type} variant="outline" className="gap-1">
                    {getActivityIcon(item.type)}
                    <span>
                      {ACTIVITY_BADGE[item.type]?.label ?? item.type}: {item.total}
                    </span>
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col gap-3 rounded-xl border bg-background/80 p-4 transition hover:border-primary/40 hover:shadow-sm md:flex-row md:items-start"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold leading-tight">{activity.subject}</p>
                          {getActivityBadge(activity.type)}
                          {activity.isTask && !activity.completedAt && (
                            <Badge className="bg-amber-500 text-white">{t('salesActivityFeed.pendingTask')}</Badge>
                          )}
                          {activity.completedAt && (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
                              {t('salesActivityFeed.completed')}
                            </Badge>
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(activity.createdAt)}
                          </span>
                          {activity.contactMethod && <span>{t('salesActivityFeed.contactMethod')}: {activity.contactMethod}</span>}
                          {activity.durationMinutes && activity.durationMinutes > 0 && (
                            <span>{t('salesActivityFeed.duration')}: {t('salesActivityFeed.durationMins', { mins: activity.durationMinutes })}</span>
                          )}
                          {activity.dueDate && !activity.completedAt && (
                            <span>{t('salesActivityFeed.dueDate')}: {formatTimeAgo(activity.dueDate)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-muted-foreground md:text-right">
                        {activity.lead && (
                          <div className="flex items-center gap-2 md:justify-end">
                            <Badge variant="outline" className="gap-1">
                              <User className="h-3.5 w-3.5" /> {activity.lead.name}
                            </Badge>
                            {typeof activity.lead.score === "number" && (
                              <Badge className="bg-primary/10 text-primary">{t('salesActivityFeed.score')} {activity.lead.score}</Badge>
                            )}
                          </div>
                        )}
                        {activity.proposal && (
                          <div className="flex items-center gap-2 md:justify-end">
                            <Badge variant="outline" className="gap-1">
                              <FileText className="h-3.5 w-3.5" /> {activity.proposal.title}
                            </Badge>
                            {activity.proposal.totalValue && (
                              <span className="font-medium text-foreground">
                                ฿{Number(activity.proposal.totalValue).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {Object.keys(activity.metadata ?? {}).length > 0 && (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="bg-muted text-muted-foreground">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
