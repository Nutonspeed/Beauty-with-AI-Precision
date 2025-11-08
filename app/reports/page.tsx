"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, TrendingUp, Users, DollarSign, Download, Loader2, PieChart } from "lucide-react"
import {
  BarChart as RechartsBarChart,
  LineChart,
  Line,
  Pie as RechartsPie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts"

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b"]

export default function ReportsPage() {
  const [period, setPeriod] = useState("month")
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [period])

  async function fetchReport() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reports/overview?period=${period}`)
      const data = await response.json()
      if (data.success) {
        setReportData(data)
      }
    } catch (error) {
      console.error("Error fetching report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleExport(type: string) {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/reports/export?type=${type}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-export.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting:", error)
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  const treatmentData = Object.entries(reportData?.breakdown?.treatments || {}).map(([name, value]) => ({
    name,
    value,
  }))

  const revenueData = Object.entries(reportData?.breakdown?.dailyRevenue || {})
    .slice(-30)
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: (amount as number) / 100,
    }))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Reports & Analytics</h1>
              <p className="text-muted-foreground">รายงานและการวิเคราะห์</p>
            </div>

            <div className="flex gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">Last 3 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => handleExport("bookings")} disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{reportData?.metrics?.totalBookings || 0}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">฿{reportData?.metrics?.totalRevenue?.toLocaleString() || 0}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New Customers</p>
                    <p className="text-2xl font-bold">{reportData?.metrics?.newCustomers || 0}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{reportData?.metrics?.conversionRate || 0}%</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="revenue">
                <LineChart className="mr-2 h-4 w-4" />
                Revenue Trend
              </TabsTrigger>
              <TabsTrigger value="treatments">
                <PieChart className="mr-2 h-4 w-4" />
                Treatments
              </TabsTrigger>
              <TabsTrigger value="export">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={revenueData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#667eea" strokeWidth={2} name="Revenue (฿)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="treatments" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Treatment Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <RechartsPie
                          data={treatmentData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {treatmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </RechartsPie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Treatment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={treatmentData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line dataKey="value" fill="#667eea" name="Bookings" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="outline" onClick={() => handleExport("bookings")} disabled={isExporting}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Bookings
                    </Button>
                    <Button variant="outline" onClick={() => handleExport("payments")} disabled={isExporting}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Payments
                    </Button>
                    <Button variant="outline" onClick={() => handleExport("customers")} disabled={isExporting}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Customers
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Export data as CSV files for further analysis in Excel or other tools.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
