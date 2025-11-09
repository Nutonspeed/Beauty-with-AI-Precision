"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Users, Heart, TrendingUp } from "lucide-react"
import {
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

interface CustomerRetentionProps {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"]

export function CustomerRetention({ dateRange }: CustomerRetentionProps) {
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

      const response = await fetch(`/api/clinic/analytics/customer-retention?${params}`)
      if (!response.ok) throw new Error("Failed to fetch customer retention data")

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching customer retention:", err)
    } finally {
      setIsLoading(false)
    }
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

  // Prepare segment data for chart
  const segmentData = [
    { name: "ลูกค้า 1 ครั้ง", value: data.segments.oneTime, fill: COLORS[0] },
    { name: "ลูกค้า 2-5 ครั้ง", value: data.segments.twoToFive, fill: COLORS[1] },
    { name: "ลูกค้า 5+ ครั้ง", value: data.segments.moreThanFive, fill: COLORS[2] },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">ลูกค้าทั้งหมด</div>
            <div className="text-2xl font-bold">{data.summary.totalCustomers}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.summary.customersWithBookings} คนมีการนัด
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Retention Rate</div>
            <div className="text-2xl font-bold text-green-500">
              {data.summary.retentionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.summary.repeatCustomers} ลูกค้าประจำ
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Average CLV</div>
            <div className="text-2xl font-bold">
              ฿{data.summary.averageLifetimeValue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Customer Lifetime Value</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Churn Rate</div>
            <div className="text-2xl font-bold text-red-500">
              {data.summary.churnRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.summary.churnedCustomers} ลูกค้าหายไป
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              การแบ่งกลุ่มลูกค้า
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => 
                    `${entry.name}: ${entry.value} (${(entry.percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded">
                <span className="text-sm">ลูกค้า 1 ครั้ง (ต้องติดตาม)</span>
                <Badge className="bg-red-500">{data.segments.oneTime}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-teal-50 dark:bg-teal-950 rounded">
                <span className="text-sm">ลูกค้า 2-5 ครั้ง (ปานกลาง)</span>
                <Badge className="bg-teal-500">{data.segments.twoToFive}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded">
                <span className="text-sm">ลูกค้า 5+ ครั้ง (VIP)</span>
                <Badge className="bg-blue-500">{data.segments.moreThanFive}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สถิติลูกค้าใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">ลูกค้าใหม่ในช่วงที่เลือก</div>
                <div className="text-4xl font-bold text-blue-600">
                  {data.summary.newCustomersInPeriod}
                </div>
                <div className="text-sm text-muted-foreground mt-2">คน</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">ลูกค้าที่จองแล้ว</div>
                  <div className="text-2xl font-bold mt-2">
                    {data.summary.customersWithBookings}
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    {data.summary.totalCustomers > 0
                      ? ((data.summary.customersWithBookings / data.summary.totalCustomers) * 100).toFixed(1)
                      : 0}
                    % แปลง
                  </div>
                </div>

                <div className="p-4 border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">ลูกค้าประจำ</div>
                  <div className="text-2xl font-bold mt-2">
                    {data.summary.repeatCustomers}
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    {data.summary.retentionRate.toFixed(1)}% retention
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Top 10 VIP Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">ลำดับ</th>
                  <th className="text-left py-2 px-4">ชื่อลูกค้า</th>
                  <th className="text-right py-2 px-4">Lifetime Value</th>
                  <th className="text-right py-2 px-4">จำนวนนัด</th>
                  <th className="text-right py-2 px-4">Average/นัด</th>
                  <th className="text-right py-2 px-4">วันที่นัดครั้งแรก</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((customer: any, index: number) => (
                  <tr key={customer.customerId} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-orange-600"
                                : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{customer.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {customer.customerId.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="font-bold text-lg text-green-600">
                        ฿{customer.totalValue.toLocaleString()}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div>{customer.totalBookings}</div>
                      <div className="text-xs text-muted-foreground">
                        {customer.paidBookings} ชำระแล้ว
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      ฿{customer.averageOrderValue.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-muted-foreground">
                      {customer.firstBookingDate
                        ? new Date(customer.firstBookingDate).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
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
