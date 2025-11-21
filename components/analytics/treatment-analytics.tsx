"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, TrendingDown } from "lucide-react"
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

interface TreatmentAnalyticsProps {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

export function TreatmentAnalytics({ dateRange }: TreatmentAnalyticsProps) {
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

      const response = await fetch(`/api/clinic/analytics/treatments?${params}`)
      if (!response.ok) throw new Error("Failed to fetch treatment data")

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching treatment analytics:", err)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
            <div className="text-sm text-muted-foreground">Treatment ทั้งหมด</div>
            <div className="text-2xl font-bold">{data.summary.totalTreatments}</div>
            <div className="text-xs text-muted-foreground mt-1">ประเภท</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">การนัดรวม</div>
            <div className="text-2xl font-bold">{data.summary.totalBookings}</div>
            <div className="text-xs text-muted-foreground mt-1">นัดหมาย</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">รายได้รวม</div>
            <div className="text-2xl font-bold">฿{data.summary.totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">จากทุก Treatment</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Average Revenue</div>
            <div className="text-2xl font-bold">
              ฿{data.summary.averageRevenuePerTreatment.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">ต่อ Treatment</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Treatments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Top 5 Treatments ยอดนิยม
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topTreatments.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.treatment}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.bookings} การนัด • {item.uniqueCustomers} ลูกค้า
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">฿{item.revenue.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {item.growthRate > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">+{item.growthRate.toFixed(1)}%</span>
                      </>
                    ) : item.growthRate < 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-red-500">{item.growthRate.toFixed(1)}%</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">ไม่เปลี่ยนแปลง</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bookings Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>เปรียบเทียบจำนวนการนัด</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.treatments.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="treatment" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#8884d8" name="การนัดทั้งหมด" />
              <Bar dataKey="paidCount" fill="#82ca9d" name="ชำระแล้ว" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* All Treatments Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดทุก Treatment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Treatment</th>
                  <th className="text-right py-2 px-4">การนัด</th>
                  <th className="text-right py-2 px-4">รายได้</th>
                  <th className="text-right py-2 px-4">ราคาเฉลี่ย</th>
                  <th className="text-right py-2 px-4">ลูกค้า</th>
                  <th className="text-right py-2 px-4">Growth</th>
                </tr>
              </thead>
              <tbody>
                {data.treatments.map((item: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{item.treatment}</td>
                    <td className="text-right py-3 px-4">
                      <div>{item.bookings}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.bookingPercentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="font-semibold">฿{item.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.revenuePercentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">฿{item.averagePrice.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{item.uniqueCustomers}</td>
                    <td className="text-right py-3 px-4">
                      {item.growthRate > 0 ? (
                        <Badge className="bg-green-500">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{item.growthRate.toFixed(0)}%
                        </Badge>
                      ) : item.growthRate < 0 ? (
                        <Badge className="bg-red-500">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {item.growthRate.toFixed(0)}%
                        </Badge>
                      ) : (
                        <Badge variant="outline">0%</Badge>
                      )}
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
