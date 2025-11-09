"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Download, 
  TrendingUp, 
  DollarSign,
  Users,
  Activity,
  FileText
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { RevenueAnalytics } from "@/components/analytics/revenue-analytics"
import { TreatmentAnalytics } from "@/components/analytics/treatment-analytics"
import { StaffPerformance } from "@/components/analytics/staff-performance"
import { CustomerRetention } from "@/components/analytics/customer-retention"

interface AnalyticsClientProps {
  initialData: {
    overview: {
      totalRevenue: number
      totalBookings: number
      newCustomers: number
      activeStaff: number
    }
    dateRange: {
      start: string
      end: string
    }
  }
}

export function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(initialData.dateRange.start),
    to: new Date(initialData.dateRange.end),
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (type: 'excel' | 'pdf') => {
    setIsExporting(true)
    try {
      if (!dateRange?.from || !dateRange?.to) {
        alert('กรุณาเลือกช่วงเวลาก่อน')
        return
      }

      const params = new URLSearchParams({
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
      })
      
      const response = await fetch(`/api/clinic/analytics/export?${params}`)
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Show success message
      alert('ส่งออกรายงานสำเร็จ!')
    } catch (error) {
      console.error('Export failed:', error)
      alert('การส่งออกล้มเหลว กรุณาลองอีกครั้ง')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <main className="flex-1">
      {/* Header */}
      <div className="border-b bg-background dark:bg-gray-900">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/clinic/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  กลับ
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Analytics & Reports</h1>
                <p className="text-sm text-muted-foreground">วิเคราะห์ข้อมูลและรายงาน</p>
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM", { locale: th })} -{" "}
                          {format(dateRange.to, "dd MMM yyyy", { locale: th })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy", { locale: th })
                      )
                    ) : (
                      <span>เลือกช่วงเวลา</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                  <div className="border-t p-3 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const end = new Date()
                        const start = new Date()
                        start.setDate(start.getDate() - 7)
                        setDateRange({ from: start, to: end })
                      }}
                    >
                      7 วันที่แล้ว
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const end = new Date()
                        const start = new Date()
                        start.setDate(start.getDate() - 30)
                        setDateRange({ from: start, to: end })
                      }}
                    >
                      30 วันที่แล้ว
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const end = new Date()
                        const start = new Date()
                        start.setDate(start.getDate() - 90)
                        setDateRange({ from: start, to: end })
                      }}
                    >
                      90 วันที่แล้ว
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('excel')}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'กำลังส่งออก...' : 'Excel'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Overview Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{initialData.overview.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ช่วงเวลาที่เลือก
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การนัดทั้งหมด</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {initialData.overview.totalBookings}
              </div>
              <p className="text-xs text-muted-foreground">
                นัดหมายที่สร้าง
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ลูกค้าใหม่</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {initialData.overview.newCustomers}
              </div>
              <p className="text-xs text-muted-foreground">
                ลูกค้าที่เพิ่มใหม่
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ทีมงานที่ใช้งาน</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {initialData.overview.activeStaff}
              </div>
              <p className="text-xs text-muted-foreground">
                สมาชิกทีม
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">
              <DollarSign className="h-4 w-4 mr-2" />
              รายได้
            </TabsTrigger>
            <TabsTrigger value="treatments">
              <Activity className="h-4 w-4 mr-2" />
              ทรีตเมนต์
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              ทีมงาน
            </TabsTrigger>
            <TabsTrigger value="customers">
              <FileText className="h-4 w-4 mr-2" />
              ลูกค้า
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueAnalytics dateRange={{ from: dateRange?.from, to: dateRange?.to }} />
          </TabsContent>

          <TabsContent value="treatments" className="space-y-6">
            <TreatmentAnalytics dateRange={{ from: dateRange?.from, to: dateRange?.to }} />
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <StaffPerformance dateRange={{ from: dateRange?.from, to: dateRange?.to }} />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomerRetention dateRange={{ from: dateRange?.from, to: dateRange?.to }} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
