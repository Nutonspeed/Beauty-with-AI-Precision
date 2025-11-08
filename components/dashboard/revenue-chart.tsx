"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

// Mock data - ในโปรดักชั่นจะดึงจาก API
const revenueData = [
  { day: "1", revenue: 32000, target: 35000 },
  { day: "2", revenue: 28000, target: 35000 },
  { day: "3", revenue: 41000, target: 35000 },
  { day: "4", revenue: 38000, target: 35000 },
  { day: "5", revenue: 45000, target: 35000 },
  { day: "6", revenue: 52000, target: 35000 },
  { day: "7", revenue: 48000, target: 35000 },
  { day: "8", revenue: 39000, target: 35000 },
  { day: "9", revenue: 43000, target: 35000 },
  { day: "10", revenue: 51000, target: 35000 },
  { day: "11", revenue: 47000, target: 35000 },
  { day: "12", revenue: 55000, target: 35000 },
  { day: "13", revenue: 49000, target: 35000 },
  { day: "14", revenue: 42000, target: 35000 },
  { day: "15", revenue: 46000, target: 35000 },
  { day: "16", revenue: 53000, target: 35000 },
  { day: "17", revenue: 50000, target: 35000 },
  { day: "18", revenue: 44000, target: 35000 },
  { day: "19", revenue: 48000, target: 35000 },
  { day: "20", revenue: 56000, target: 35000 },
  { day: "21", revenue: 52000, target: 35000 },
  { day: "22", revenue: 45000, target: 35000 },
  { day: "23", revenue: 49000, target: 35000 },
  { day: "24", revenue: 57000, target: 35000 },
  { day: "25", revenue: 54000, target: 35000 },
  { day: "26", revenue: 46000, target: 35000 },
  { day: "27", revenue: 50000, target: 35000 },
  { day: "28", revenue: 58000, target: 35000 },
  { day: "29", revenue: 55000, target: 35000 },
  { day: "30", revenue: 47000, target: 35000 }
]

export function RevenueChart() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0)
  const totalTarget = revenueData.reduce((sum, day) => sum + day.target, 0)
  const achievement = (totalRevenue / totalTarget) * 100

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue))
  const minRevenue = Math.min(...revenueData.map(d => d.revenue))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Revenue Trends (This Month)</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={achievement >= 100 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
              {achievement >= 100 ? "🎯 Target Achieved" : "📈 On Track"}
            </Badge>
            <div className="text-right">
              <div className="text-sm font-medium">{achievement.toFixed(1)}% of target</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(totalRevenue)} / {formatCurrency(totalTarget)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple Bar Chart */}
        <div className="space-y-4">
          <div className="flex items-end gap-1 h-64">
            {revenueData.map((day, index) => {
              const height = (day.revenue / maxRevenue) * 100
              const isAboveTarget = day.revenue >= day.target
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    {/* Target line */}
                    <div
                      className="w-full border-t-2 border-dashed border-orange-400 opacity-50"
                      style={{ height: `${(day.target / maxRevenue) * 100}%` }}
                    />
                    {/* Revenue bar */}
                    <div
                      className={`w-full rounded-t-sm ${isAboveTarget ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-orange-400 border-t-2 border-dashed" />
              <span>Target</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(maxRevenue)}</div>
            <div className="text-sm text-muted-foreground">Best Day</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(Math.round(totalRevenue / revenueData.length))}</div>
            <div className="text-sm text-muted-foreground">Daily Average</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {achievement > 100 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-orange-600" />
              )}
              <div className={`text-2xl font-bold ${achievement > 100 ? 'text-green-600' : 'text-orange-600'}`}>
                {(achievement - 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-sm text-muted-foreground">vs Target</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
