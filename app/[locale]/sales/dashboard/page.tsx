'use client'

import { useState } from 'react'
import { TrendingUp, Users, Clock, DollarSign, Award, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface SalesStats {
  today: {
    scans: number
    conversions: number
    revenue: number
  }
  thisWeek: {
    scans: number
    conversions: number
    revenue: number
  }
  thisMonth: {
    scans: number
    conversions: number
    revenue: number
  }
  topPackages: Array<{
    name: string
    sold: number
    revenue: number
  }>
}

export default function SalesDashboard() {
  const [stats] = useState<SalesStats>({
    today: {
      scans: 12,
      conversions: 3,
      revenue: 59700
    },
    thisWeek: {
      scans: 87,
      conversions: 21,
      revenue: 418900
    },
    thisMonth: {
      scans: 342,
      conversions: 89,
      revenue: 1774300
    },
    topPackages: [
      { name: 'Anti-Aging Package', sold: 34, revenue: 676600 },
      { name: 'Complete Rejuvenation', sold: 28, revenue: 1117200 },
      { name: 'Pigmentation Treatment', sold: 27, revenue: 672300 }
    ]
  })

  const conversionRate = ((stats.thisMonth.conversions / stats.thisMonth.scans) * 100).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your sales performance</p>
          </div>
          <Link href="/sales/quick-scan" className="w-full sm:w-auto">
            <Button 
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Target className="w-5 h-5 mr-2" />
              Quick Scan
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth.scans}</div>
              <p className="text-xs text-gray-600">
                +{stats.today.scans} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Award className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth.conversions}</div>
              <p className="text-xs text-gray-600">
                +{stats.today.conversions} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-gray-600">
                {((stats.today.conversions / stats.today.scans) * 100).toFixed(1)}% today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{(stats.thisMonth.revenue / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-gray-600">
                +฿{(stats.today.revenue / 1000).toFixed(0)}K today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Scans</span>
                <span className="font-semibold">{stats.today.scans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversions</span>
                <span className="font-semibold">{stats.today.conversions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-semibold">฿{stats.today.revenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Scans</span>
                <span className="font-semibold">{stats.thisWeek.scans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversions</span>
                <span className="font-semibold">{stats.thisWeek.conversions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-semibold">฿{stats.thisWeek.revenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Scans</span>
                <span className="font-semibold">{stats.thisMonth.scans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversions</span>
                <span className="font-semibold">{stats.thisMonth.conversions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-semibold">฿{stats.thisMonth.revenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topPackages.map((pkg, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">#{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                      <p className="text-sm text-gray-600">{pkg.sold} packages sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ฿{pkg.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/sales/quick-scan" className="block">
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

          <Link href="/customer" className="block">
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

          <Link href="/analytics" className="block">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-gray-900">Reports</h3>
                  <p className="text-sm text-gray-600 mt-1">Detailed analytics</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
