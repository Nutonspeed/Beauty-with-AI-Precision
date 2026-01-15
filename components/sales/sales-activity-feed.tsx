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
  RefreshCw,
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
import { motion, AnimatePresence } from "framer-motion"

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
    <Card className="h-full border-white/10 bg-slate-900/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.2)] relative group ring-1 ring-white/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-50" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-white/5 flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.03] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <ActivitySquare className="h-6 w-6 text-blue-400" />
            </div>
            {t('salesActivityFeed.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-1">{latestActivityText}</CardDescription>
        </div>
        <div className="flex w-full items-center gap-4 md:w-auto relative z-10">
          <Select value={range} onValueChange={(value) => setRange(value as any)}>
            <SelectTrigger className="w-full md:w-44 h-12 rounded-xl border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest italic focus:ring-blue-500/20">
              <SelectValue placeholder={t('salesActivityFeed.rangeLabel')} />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 rounded-xl">
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-[10px] font-black uppercase italic tracking-widest">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-12 px-6 rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all shadow-xl ring-1 ring-white/5"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            {isRefreshing ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-400" /> {t('salesActivityFeed.refreshing')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-400" /> {t('salesActivityFeed.refresh')}
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
          <div className="space-y-8">
            {summary && (
              <div className="flex flex-wrap items-center gap-4 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-inner ring-1 ring-white/5">
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-none px-4 py-1 rounded-lg text-[9px] font-black italic tracking-widest uppercase">
                  {t('salesActivityFeed.totalActivities')} {summary.totalActivities.toLocaleString()}
                </Badge>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-none px-4 py-1 rounded-lg text-[9px] font-black italic tracking-widest uppercase">
                  {t('salesActivityFeed.uniqueLeads')} {summary.uniqueLeads.toLocaleString()}
                </Badge>
                <div className="h-4 w-px bg-white/10 mx-2" />
                {typeSummary.slice(0, 4).map((item) => (
                  <Badge key={item.type} variant="outline" className="gap-2 border-white/10 bg-white/5 text-slate-400 px-3 py-1 rounded-lg text-[8px] font-black italic uppercase tracking-widest">
                    {getActivityIcon(item.type)}
                    <span>
                      {ACTIVITY_BADGE[item.type]?.label ?? item.type}: {item.total}
                    </span>
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {activities.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex flex-col gap-6 rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 transition-all duration-500 hover:bg-white/[0.03] hover:border-blue-500/20 hover:shadow-2xl md:flex-row md:items-start ring-1 ring-white/5 group/activity"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner group-hover/activity:scale-110 group-hover/activity:rotate-3 transition-all duration-500 shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-lg font-black text-white italic tracking-tight uppercase leading-none">{activity.subject}</p>
                            {getActivityBadge(activity.type)}
                            {activity.isTask && !activity.completedAt && (
                              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-0.5 rounded-lg text-[8px] font-black italic tracking-widest uppercase">
                                {t('salesActivityFeed.pendingTask')}
                              </Badge>
                            )}
                          </div>
                          {activity.description && (
                            <p className="text-sm text-slate-400 font-light italic leading-relaxed">"{activity.description}"</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-600 italic">
                            <span className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-blue-500" />
                              {formatTimeAgo(activity.createdAt)}
                            </span>
                            {activity.contactMethod && (
                              <span className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-slate-800" />
                                {t('salesActivityFeed.contactMethod')}: {activity.contactMethod}
                              </span>
                            )}
                            {activity.durationMinutes && activity.durationMinutes > 0 && (
                              <span className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-slate-800" />
                                {t('salesActivityFeed.duration')}: {activity.durationMinutes}m
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 text-xs md:text-right">
                          {activity.lead && (
                            <div className="flex items-center gap-3 md:justify-end">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                              <Badge variant="outline" className="gap-2 border-white/10 bg-white/5 text-white px-4 py-1.5 rounded-xl font-bold italic text-[10px] shadow-lg ring-1 ring-white/5 uppercase tracking-tight">
                                <User className="h-3.5 w-3.5 text-blue-400" /> {activity.lead.name}
                              </Badge>
                              {typeof activity.lead.score === "number" && (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-3 py-0.5 rounded-lg text-[9px] font-black italic">
                                  {activity.lead.score}% Score
                                </Badge>
                              )}
                            </div>
                          )}
                          {activity.proposal && (
                            <div className="flex items-center gap-3 md:justify-end">
                              <Badge variant="outline" className="gap-2 border-white/10 bg-white/5 text-white px-4 py-1.5 rounded-xl font-bold italic text-[10px] shadow-lg ring-1 ring-white/5 uppercase tracking-tight">
                                <FileText className="h-3.5 w-3.5 text-pink-400" /> {activity.proposal.title}
                              </Badge>
                              {activity.proposal.totalValue && (
                                <span className="font-black text-white italic tracking-tighter text-lg">
                                  ฿{Number(activity.proposal.totalValue).toLocaleString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {Object.keys(activity.metadata ?? {}).length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-2">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-500 px-3 py-0.5 rounded-lg italic">
                              {key.replace(/_/g, ' ')}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
