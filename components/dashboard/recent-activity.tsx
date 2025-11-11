"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, User, Calendar, Package, TrendingUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"

interface Activity {
  id: string
  type: "booking" | "customer" | "inventory" | "staff" | "revenue"
  title: string
  description: string
  timestamp: string
  icon?: string
  metadata?: any
}

interface RecentActivityData {
  activities: Activity[]
}

export function RecentActivity() {
  const [data, setData] = useState<RecentActivityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivity()
    // Refresh every 1 minute
    const interval = setInterval(fetchActivity, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchActivity = async () => {
    try {
      const response = await fetch("/api/clinic/dashboard/activity")
      if (!response.ok) throw new Error("Failed to fetch activity")
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching activity:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Central meta mapping for consistency
  const TYPE_META: Record<Activity["type"], { label: string; badgeClass: string; icon: React.ReactElement }> = {
    booking:   { label: "การนัด", badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: <Calendar className="h-4 w-4 text-blue-500" /> },
    customer:  { label: "ลูกค้า", badgeClass: "bg-green-500/10 text-green-600 dark:text-green-400", icon: <User className="h-4 w-4 text-green-500" /> },
    inventory: { label: "สต็อก", badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400", icon: <Package className="h-4 w-4 text-orange-500" /> },
    staff:     { label: "ทีมงาน", badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400", icon: <User className="h-4 w-4 text-purple-500" /> },
    revenue:   { label: "รายได้", badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: <TrendingUp className="h-4 w-4 text-emerald-500" /> },
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "customer":
        return <User className="h-4 w-4 text-green-500" />
      case "inventory":
        return <Package className="h-4 w-4 text-orange-500" />
      case "staff":
        return <User className="h-4 w-4 text-purple-500" />
      case "revenue":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    const meta = TYPE_META[type as Activity["type"]]
    if (!meta) return <Badge variant="outline">อื่นๆ</Badge>
    return (
      <Badge variant="outline" className={meta.badgeClass}>
        {meta.label}
      </Badge>
    )
  }

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: th,
      })
    } catch {
      return "เมื่อสักครู่"
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full" aria-busy="true" aria-live="polite">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            กิจกรรมล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            กิจกรรมล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            ไม่สามารถโหลดข้อมูลได้
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.activities.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            กิจกรรมล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            ยังไม่มีกิจกรรม
          </p>
        </CardContent>
      </Card>
    )
  }

  // Motion variants
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          กิจกรรมล่าสุด
        </CardTitle>
      </CardHeader>
      <CardContent aria-live="polite" role="feed">
        <motion.div className="space-y-3" variants={container} initial="hidden" animate="show">
          <AnimatePresence initial={false}>
            {data.activities.slice(0, 8).map((activity) => (
              <motion.article
                key={activity.id}
                variants={item}
                layout
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.995 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-border/80 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                role="article"
                aria-label={activity.title}
                tabIndex={0}
              >
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <span className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-b from-primary/25 to-transparent blur-md opacity-60" aria-hidden />
                  <span className="relative">{getActivityIcon(activity.type)}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium leading-tight">{activity.title}</h3>
                    {getActivityBadge(activity.type)}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                  <time
                    className="text-xs text-muted-foreground flex items-center gap-1"
                    dateTime={activity.timestamp}
                    aria-label={`เกิดขึ้นเมื่อ ${formatTime(activity.timestamp)}`}
                  >
                    <Clock className="h-3 w-3" />
                    {formatTime(activity.timestamp)}
                  </time>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  )
}
