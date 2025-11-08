"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Target,

  Award,
  BarChart3,
  Download,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

// Mock data for sales performance
const mockPerformanceData = {
  today: {
    revenue: 125000,
    deals: 8,
    leads: 24,
    conversion: 33.3,
  },
  thisWeek: {
    revenue: 580000,
    deals: 32,
    leads: 96,
    conversion: 33.3,
  },
  thisMonth: {
    revenue: 2340000,
    deals: 145,
    leads: 412,
    conversion: 35.2,
  },
  lastMonth: {
    revenue: 2180000,
    deals: 132,
    leads: 398,
    conversion: 33.2,
  },
}

const topProducts = [
  { id: 1, name: "Complete Skin Renewal Package", revenue: 450000, units: 15, avgPrice: 30000 },
  { id: 2, name: "Anti-Aging Premium Set", revenue: 380000, units: 19, avgPrice: 20000 },
  { id: 3, name: "Acne Treatment Ultimate", revenue: 320000, units: 16, avgPrice: 20000 },
  { id: 4, name: "Brightening Intensive Course", revenue: 290000, units: 20, avgPrice: 14500 },
  { id: 5, name: "Hydration Deep Care", revenue: 240000, units: 24, avgPrice: 10000 },
]

const topServices = [
  { id: 1, name: "Laser Skin Resurfacing", revenue: 560000, sessions: 28, avgPrice: 20000 },
  { id: 2, name: "Botox & Filler Treatment", revenue: 420000, sessions: 21, avgPrice: 20000 },
  { id: 3, name: "Ultherapy Facial Lift", revenue: 380000, sessions: 12, avgPrice: 31667 },
  { id: 4, name: "Chemical Peel Premium", revenue: 280000, sessions: 35, avgPrice: 8000 },
  { id: 5, name: "RF Skin Tightening", revenue: 240000, sessions: 24, avgPrice: 10000 },
]

const revenueByMonth = [
  { month: "Jan", revenue: 2100000 },
  { month: "Feb", revenue: 2180000 },
  { month: "Mar", revenue: 2340000 },
  { month: "Apr", revenue: 2200000 },
  { month: "May", revenue: 2450000 },
  { month: "Jun", revenue: 2680000 },
]

const topSalesStaff = [
  { id: 1, name: "คุณนิดา ทองคำ", deals: 42, revenue: 1240000, conversion: 38.5 },
  { id: 2, name: "คุณสมชาย ใจดี", deals: 38, revenue: 1180000, conversion: 36.2 },
  { id: 3, name: "คุณวิภา สวยงาม", deals: 35, revenue: 980000, conversion: 34.8 },
  { id: 4, name: "คุณประสิทธิ์ รุ่งเรือง", deals: 32, revenue: 920000, conversion: 32.1 },
  { id: 5, name: "คุณสุดา ยิ้มแย้ม", deals: 28, revenue: 820000, conversion: 31.5 },
]

export default function SalesPerformancePage() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("month")
  const [activeTab, setActiveTab] = useState("overview")

  const currentData = useMemo(() => {
    if (period === "today") return mockPerformanceData.today
    if (period === "week") return mockPerformanceData.thisWeek
    return mockPerformanceData.thisMonth
  }, [period])

  const previousData = useMemo(() => {
    if (period === "month") return mockPerformanceData.lastMonth
    // For simplicity, using last month data for comparison
    return mockPerformanceData.lastMonth
  }, [period])

  const revenueChange = useMemo(() => {
    if (!previousData) return 0
    return ((currentData.revenue - previousData.revenue) / previousData.revenue) * 100
  }, [currentData, previousData])

  const dealsChange = useMemo(() => {
    if (!previousData) return 0
    return ((currentData.deals - previousData.deals) / previousData.deals) * 100
  }, [currentData, previousData])

  const conversionChange = useMemo(() => {
    if (!previousData) return 0
    return currentData.conversion - previousData.conversion
  }, [currentData, previousData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
  }



  const getChangeBadgeColor = (value: number) => {
    if (value > 0) return "bg-green-100 text-green-800"
    if (value < 0) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Sales Performance</h1>
                <p className="text-muted-foreground">รายงานยอดขายและประสิทธิภาพทีมขาย</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">วันนี้</SelectItem>
                <SelectItem value="week">สัปดาห์นี้</SelectItem>
                <SelectItem value="month">เดือนนี้</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(currentData.revenue)}</div>
              <div className="flex items-center gap-2 mt-2">
                {revenueChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <Badge className={getChangeBadgeColor(revenueChange)}>
                  {formatPercent(revenueChange)}
                </Badge>
                <span className="text-xs text-muted-foreground">vs {period === "month" ? "last month" : "previous"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Closed Deals</CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentData.deals}</div>
              <div className="flex items-center gap-2 mt-2">
                {dealsChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <Badge className={getChangeBadgeColor(dealsChange)}>
                  {formatPercent(dealsChange)}
                </Badge>
                <span className="text-xs text-muted-foreground">vs {period === "month" ? "last month" : "previous"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentData.leads}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">
                  Avg: {formatCurrency(currentData.revenue / currentData.deals)} per deal
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentData.conversion}%</div>
              <div className="flex items-center gap-2 mt-2">
                {conversionChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : conversionChange < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : null}
                <Badge className={getChangeBadgeColor(conversionChange)}>
                  {conversionChange >= 0 ? "+" : ""}{conversionChange.toFixed(1)}%
                </Badge>
                <span className="text-xs text-muted-foreground">vs {period === "month" ? "last month" : "previous"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="services">Top Services</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
                <CardDescription>รายได้รวมรายเดือน</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueByMonth.map((item, index) => {
                    const maxRevenue = Math.max(...revenueByMonth.map((m) => m.revenue))
                    const percentage = (item.revenue / maxRevenue) * 100

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.month}</span>
                          <span className="text-muted-foreground">{formatCurrency(item.revenue)}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Average Deal Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(currentData.revenue / currentData.deals)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on {currentData.deals} closed deals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lead to Deal Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">3.2 days</div>
                  <p className="text-xs text-muted-foreground mt-2">Average time to close</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Active Proposals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">18</div>
                  <p className="text-xs text-muted-foreground mt-2">Pending customer decision</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>สินค้าที่ขายดีที่สุดในเดือนนี้</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold rounded-full">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.units} units × {formatCurrency(product.avgPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                        <Badge className="mt-1">
                          {((product.revenue / topProducts.reduce((sum, p) => sum + p.revenue, 0)) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
                <CardDescription>บริการที่มีรายได้สูงสุดในเดือนนี้</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topServices.map((service, index) => (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold rounded-full">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.sessions} sessions × {formatCurrency(service.avgPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(service.revenue)}</p>
                        <Badge className="mt-1">
                          {((service.revenue / topServices.reduce((sum, s) => sum + s.revenue, 0)) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Sales Staff</CardTitle>
                <CardDescription>พนักงานขายที่มีผลงานดีที่สุดในเดือนนี้</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSalesStaff.map((staff, index) => (
                    <div key={staff.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold rounded-full text-lg">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{staff.name}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{staff.deals} deals</span>
                            <span>•</span>
                            <span>{staff.conversion}% conversion</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(staff.revenue)}</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-800">
                          <Award className="h-3 w-3 mr-1" />
                          Top Performer
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground mt-2">Active sales staff</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Avg Revenue per Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(currentData.revenue / 8)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">This {period}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team Conversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{currentData.conversion}%</div>
                  <p className="text-xs text-muted-foreground mt-2">Overall team average</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to Dashboard */}
        <div className="text-center pt-4">
          <Link href="/sales/dashboard">
            <Button variant="outline">กลับไปที่ Sales Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
