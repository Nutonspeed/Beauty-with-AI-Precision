import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, Award, DollarSign, Sparkles, MessageSquare, Target, Brain, Camera, Wand2, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface EmbeddedSalesDashboardProps {
  className?: string
}

export function EmbeddedSalesDashboard({ className }: EmbeddedSalesDashboardProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Dashboard</h2>
          <p className="text-gray-600 mt-1">Track your sales performance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center justify-end">
          <div className="flex rounded-lg border bg-white overflow-hidden text-xs sm:text-sm">
            {(['Today', '7d', '30d'] as const).map((label) => (
              <button
                key={label}
                type="button"
                className="px-3 py-1.5 sm:px-4 sm:py-2 border-r last:border-r-0 transition-colors bg-blue-600 text-white"
              >
                {label}
              </button>
            ))}
          </div>
          <Link href="/sales/quick-scan">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Target className="w-5 h-5 mr-2" />
              Quick Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-600">+0 today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Award className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-600">+0 today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.0%</div>
            <p className="text-xs text-gray-600">0.0% today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿0K</div>
            <p className="text-xs text-gray-600">+฿0K potential</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Bookings</CardTitle>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-600">฿0K จาก AI</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            AI Funnel (วันนี้ / ช่วง 7d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-xs text-purple-700 font-semibold uppercase">AI Leads</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">0</p>
              <p className="text-[11px] text-purple-700 mt-1">บันทึกจาก AI Scan</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-700 font-semibold uppercase">AI Proposals</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">0</p>
              <p className="text-[11px] text-blue-700 mt-1">สร้างจาก AI Recommendations</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-100">
              <p className="text-xs text-green-700 font-semibold uppercase">AI Bookings</p>
              <p className="text-2xl font-bold text-green-900 mt-1">0</p>
              <p className="text-[11px] text-green-700 mt-1">จองจาก Proposal ที่ AI สร้าง</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remote Consult Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Remote Consult Requests (ช่วง 7d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-bold text-emerald-700">0</p>
              <p className="text-xs text-gray-600 mt-1">คำขอจากลูกค้าที่กดขอปรึกษาออนไลน์</p>
              <p className="text-[11px] text-emerald-700 mt-1">
                Conversion: 0.0% ของคำขอที่ปิดเป็นลูกค้า
              </p>
            </div>
            <Link href="/sales/remote-consults">
              <Button variant="outline" size="sm" className="text-xs">
                ดูคิว Remote
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* AI Sales Tools */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Brain className="w-5 h-5" />
            AI Sales Tools
            <Badge className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs">NEW</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/sales/tools">
              <div className="p-4 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all text-center">
                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">AI Recommendations</p>
                <p className="text-xs text-gray-500 mt-1">แนะนำ treatment</p>
              </div>
            </Link>
            <Link href="/sales/tools">
              <div className="p-4 rounded-xl bg-white border border-green-200 hover:border-green-400 hover:shadow-md transition-all text-center">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Quick Quote</p>
                <p className="text-xs text-gray-500 mt-1">ใบเสนอราคา</p>
              </div>
            </Link>
            <Link href="/sales/tools">
              <div className="p-4 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all text-center">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Conversion AI</p>
                <p className="text-xs text-gray-500 mt-1">วิเคราะห์โอกาส</p>
              </div>
            </Link>
            <Link href="/sales/tools">
              <div className="p-4 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all text-center">
                <MessageSquare className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Quick Message</p>
                <p className="text-xs text-gray-500 mt-1">LINE/WhatsApp</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/sales/quick-scan">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-gray-900">Quick Scan</h3>
                <p className="text-sm text-gray-600 mt-1">Start new customer scan</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/customer">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-gray-900">Customers</h3>
                <p className="text-sm text-gray-600 mt-1">View customer database</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sales/tools">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <Brain className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-gray-900">AI Tools</h3>
                <p className="text-sm text-gray-600 mt-1">เครื่องมือ AI ทั้งหมด</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
