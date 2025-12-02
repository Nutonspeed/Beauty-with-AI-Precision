'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Chart } from '../charts/chart'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react'
import { ReportData } from '@/types/reports'
import { DateRange } from 'react-day-picker'

export interface DashboardProps {
  reportData: ReportData
  onRefresh?: () => void
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void
  onDateRangeChange?: (range: any) => void
  onFilterChange?: (filters: any) => void
}

export function ReportDashboard({ 
  reportData, 
  onRefresh, 
  onExport, 
  onDateRangeChange, 
  onFilterChange 
}: DashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh?.()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    onExport?.(format)
  }

  const renderOverview = () => {
    const { data, insights } = reportData

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data).map(([key, value]: [string, any]) => {
            if (typeof value === 'object' && value.total !== undefined) {
              const trend = insights.find(i => i.type === `${key}_growth`)
              return (
                <Card key={key}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </CardTitle>
                    {trend ? (
                      trend.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )
                    ) : (
                      <Activity className="h-4 w-4 text-gray-600" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{value.total.toLocaleString()}</div>
                    {trend && (
                      <p className={`text-xs ${trend.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.trend === 'up' ? '+' : ''}{trend.value.toFixed(1)}% from last period
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            }
            return null
          })}
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>Important trends and observations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={insight.trend === 'up' ? 'default' : 'secondary'}>
                        {insight.trend === 'up' ? 'Positive' : 'Needs Attention'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderCharts = () => {
    return (
      <div className="space-y-6">
        {reportData.charts.map((chart, index) => (
          <Chart
            key={index}
            type={chart.type}
            title={chart.title}
            data={chart.data}
            options={chart.config}
            height={400}
          />
        ))}
      </div>
    )
  }

  const renderDetails = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>Comprehensive data breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Report Generated</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(reportData.metadata.generatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Date Range</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(reportData.metadata.dateRange.startDate).toLocaleDateString()} - {' '}
                    {new Date(reportData.metadata.dateRange.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Data Summary</h4>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(reportData.data, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{reportData.metadata.title}</h2>
          <p className="text-gray-600">
            Generated on {new Date(reportData.metadata.generatedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Select onValueChange={(value) => handleExport(value as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <DateRangePicker
                value={dateRange}
                onChange={(range) => {
                  if (range) {
                    setDateRange(range)
                    onDateRangeChange?.(range)
                  }
                }}
              />
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="charts">
          {renderCharts()}
        </TabsContent>
        
        <TabsContent value="details">
          {renderDetails()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ReportDashboard
