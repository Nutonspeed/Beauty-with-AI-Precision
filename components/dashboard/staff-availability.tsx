"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, CheckCircle2, Clock, Coffee, XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface StaffMember {
  id: string
  full_name: string
  role: string
  status: "active" | "on_leave" | "busy" | "available" | "offline"
  avatar_url: string | null
  patients_today: number
  appointments_today: number
  rating: number | null
}

interface StaffAvailabilityData {
  staff: StaffMember[]
  summary: {
    total: number
    available: number
    busy: number
    offline: number
  }
}

export function StaffAvailability() {
  const [data, setData] = useState<StaffAvailabilityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStaffAvailability()
    // Refresh every 2 minutes
    const interval = setInterval(fetchStaffAvailability, 120000)
    return () => clearInterval(interval)
  }, [])

  const fetchStaffAvailability = async () => {
    try {
      const response = await fetch("/api/clinic/staff?status=active&limit=10")
      if (!response.ok) throw new Error("Failed to fetch staff")
      const result = await response.json()
      
      const staffList = result.data || []
      const summary = {
        total: staffList.length,
        available: staffList.filter((s: StaffMember) => s.status === "available").length,
        busy: staffList.filter((s: StaffMember) => s.status === "busy" || s.status === "active").length,
        offline: staffList.filter((s: StaffMember) => s.status === "offline" || s.status === "on_leave").length,
      }

      setData({ staff: staffList, summary })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching staff availability:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />
      case "busy":
      case "active":
        return <Clock className="h-3 w-3 text-orange-500" />
      case "on_leave":
        return <Coffee className="h-3 w-3 text-blue-500" />
      default:
        return <XCircle className="h-3 w-3 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400">
            ว่าง
          </Badge>
        )
      case "busy":
      case "active":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400">
            ไม่ว่าง
          </Badge>
        )
      case "on_leave":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
            ลา
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-600 dark:text-gray-400">
            ออฟไลน์
          </Badge>
        )
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "doctor":
        return "👨‍⚕️ แพทย์"
      case "nurse":
        return "👩‍⚕️ พยาบาล"
      case "therapist":
        return "💆 นักบำบัด"
      case "admin":
        return "👔 ผู้จัดการ"
      case "receptionist":
        return "📋 ต้อนรับ"
      default:
        return role
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ทีมงานวันนี้
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
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

  if (error || !data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ทีมงานวันนี้
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

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ทีมงานวันนี้
          </CardTitle>
          <Link href="/clinic/staff">
            <Button variant="ghost" size="sm">
              ดูทั้งหมด
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">ว่าง</div>
            <div className="text-lg font-bold text-green-600">{data.summary.available}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">ไม่ว่าง</div>
            <div className="text-lg font-bold text-orange-600">{data.summary.busy}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">ออฟไลน์</div>
            <div className="text-lg font-bold text-gray-600">{data.summary.offline}</div>
          </div>
        </div>

        {/* Staff List */}
        <div className="space-y-3">
          {data.staff.slice(0, 6).map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getStatusIcon(member.status)}
                  <p className="text-sm font-medium truncate">{member.full_name}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{getRoleBadge(member.role)}</span>
                  <span>•</span>
                  <span>👥 {member.patients_today} คน</span>
                </div>
              </div>
              <div>{getStatusBadge(member.status)}</div>
            </div>
          ))}
        </div>

        {data.staff.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            ยังไม่มีทีมงานในระบบ
          </p>
        )}
      </CardContent>
    </Card>
  )
}
