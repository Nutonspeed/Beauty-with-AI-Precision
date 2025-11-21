"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, DollarSign } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface RevenueAnalyticsProps {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function RevenueAnalytics({ dateRange }: RevenueAnalyticsProps) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
      })

      const response = await fetch(`/api/clinic/analytics/revenue?${params}`)
      if (!response.ok) throw new Error("Failed to fetch revenue data")

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching revenue analytics:", err)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
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
            <div className="text-sm text-muted-foreground">รายได้รวม</div>
            <div className="text-2xl font-bold">฿{data.summary.totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.summary.paidCount} การนัดจาก {data.summary.totalBookings}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Average Order Value</div>
            <div className="text-2xl font-bold">฿{data.summary.averageOrderValue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">ค่าเฉลี่ยต่อนัด</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
            <div className="text-2xl font-bold">{data.summary.conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">ชำระเงินแล้ว</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">รออนุมัติ</div>
            <div className="text-2xl font-bold text-orange-500">{data.summary.pendingCount}</div>
            <div className="text-xs text-muted-foreground mt-1">การนัด</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            แนวโน้มรายได้รายวัน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: any) => [`฿${value.toLocaleString()}`, "รายได้"]}
                labelFormatter={(label) => {
                  const date = new Date(label)
                  return date.toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="รายได้" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Treatment Revenue Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              รายได้แยกตาม Treatment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.treatmentBreakdown.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="treatment" angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => `฿${value.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#8884d8" name="รายได้" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สัดส่วนรายได้</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.treatmentBreakdown.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.treatment} (${entry.percentage.toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {data.treatmentBreakdown.slice(0, 6).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `฿${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดแต่ละ Treatment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Treatment</th>
                  <th className="text-right py-2 px-4">รายได้</th>
                  <th className="text-right py-2 px-4">จำนวนนัด</th>
                  <th className="text-right py-2 px-4">สัดส่วน</th>
                </tr>
              </thead>
              <tbody>
                {data.treatmentBreakdown.map((item: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4 font-medium">{item.treatment}</td>
                    <td className="text-right py-2 px-4">฿{item.revenue.toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{item.count}</td>
                    <td className="text-right py-2 px-4">{item.percentage.toFixed(1)}%</td>
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
