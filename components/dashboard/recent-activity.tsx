"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    switch (type) {
      case "booking":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">การนัด</Badge>
      case "customer":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400">ลูกค้า</Badge>
      case "inventory":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400">สต็อก</Badge>
      case "staff":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400">ทีมงาน</Badge>
      case "revenue":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">รายได้</Badge>
      default:
        return <Badge variant="outline">อื่นๆ</Badge>
    }
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
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            กิจกรรมล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          กิจกรรมล่าสุด
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.activities.slice(0, 8).map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight">
                    {activity.title}
                  </p>
                  {getActivityBadge(activity.type)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
