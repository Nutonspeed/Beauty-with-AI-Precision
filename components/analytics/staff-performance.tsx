"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Star, Trophy } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface StaffPerformanceProps {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

export function StaffPerformance({ dateRange }: StaffPerformanceProps) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    if (!dateRange.from || !dateRange.to) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
      })

      const response = await fetch(`/api/clinic/analytics/staff-performance?${params}`)
      if (!response.ok) throw new Error("Failed to fetch staff performance data")

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching staff performance:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; color: string }> = {
      doctor: { label: "👨‍⚕️ แพทย์", color: "bg-blue-500" },
      nurse: { label: "👩‍⚕️ พยาบาล", color: "bg-green-500" },
      therapist: { label: "💆 นักบำบัด", color: "bg-purple-500" },
      admin: { label: "👔 ผู้จัดการ", color: "bg-orange-500" },
      receptionist: { label: "📋 ต้อนรับ", color: "bg-pink-500" },
    }

    const roleInfo = roleMap[role] || { label: role, color: "bg-gray-500" }
    return (
      <Badge className={`${roleInfo.color} text-white`}>
        {roleInfo.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">ไม่สามารถโหลดข้อมูลได้: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">ทีมงานทั้งหมด</div>
            <div className="text-2xl font-bold">{data.summary.totalStaff}</div>
            <div className="text-xs text-muted-foreground mt-1">สมาชิกทีม</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">รายได้รวม</div>
            <div className="text-2xl font-bold">฿{data.summary.totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">ทีมทั้งหมด</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">การนัดทั้งหมด</div>
            <div className="text-2xl font-bold">{data.summary.totalAppointments}</div>
            <div className="text-xs text-muted-foreground mt-1">นัดหมาย</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Average Revenue</div>
            <div className="text-2xl font-bold">
              ฿{data.summary.averageRevenuePerStaff.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">ต่อทีมงาน</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 5 Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPerformers.map((member: any, index: number) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-white ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                          ? "bg-gray-400"
                          : index === 2
                            ? "bg-orange-600"
                            : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <Avatar>
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(member.role)}
                      {member.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{member.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">฿{member.revenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.appointments} นัดหมาย
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ฿{member.averageRevenuePerAppointment.toLocaleString()} / นัด
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>รายได้แยกตามตำแหน่ง</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.roleBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: any) => `฿${value.toLocaleString()}`}
                labelFormatter={(label) => {
                  const roleMap: Record<string, string> = {
                    doctor: "👨‍⚕️ แพทย์",
                    nurse: "👩‍⚕️ พยาบาล",
                    therapist: "💆 นักบำบัด",
                    admin: "👔 ผู้จัดการ",
                    receptionist: "📋 ต้อนรับ",
                  }
                  return roleMap[label] || label
                }}
              />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#8884d8" name="รายได้รวม" />
              <Bar dataKey="averageRevenuePerStaff" fill="#82ca9d" name="เฉลี่ยต่อคน" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* All Staff Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ประสิทธิภาพทีมงานทั้งหมด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">ชื่อ</th>
                  <th className="text-left py-2 px-4">ตำแหน่ง</th>
                  <th className="text-right py-2 px-4">Rating</th>
                  <th className="text-right py-2 px-4">การนัด</th>
                  <th className="text-right py-2 px-4">รายได้</th>
                  <th className="text-right py-2 px-4">เฉลี่ย/นัด</th>
                </tr>
              </thead>
              <tbody>
                {data.staffPerformance.map((member: any, index: number) => (
                  <tr key={member.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(member.role)}</td>
                    <td className="text-right py-3 px-4">
                      {member.rating > 0 ? (
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{member.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="text-right py-3 px-4">
                      <div>{member.appointments}</div>
                      <div className="text-xs text-muted-foreground">
                        {member.totalAppointments} ทั้งหมด
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      ฿{member.revenue.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-muted-foreground">
                      ฿{member.averageRevenuePerAppointment.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
