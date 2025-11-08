"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Presentation, CheckCircle2, Clock, TrendingUp, DollarSign } from "lucide-react"

interface PresentationStats {
  todayCount: number
  completionRate: number
  avgTimeMinutes: number
  totalValue: number
  weekComparison: {
    countChange: number
    completionChange: number
  }
}

export function PresentationStatsCards() {
  const [stats, setStats] = useState<PresentationStats>({
    todayCount: 0,
    completionRate: 0,
    avgTimeMinutes: 0,
    totalValue: 0,
    weekComparison: {
      countChange: 0,
      completionChange: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    calculateStats()
  }, [])

  const calculateStats = () => {
    try {
      const presentations: any[] = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      // Scan localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('sales-presentation-')) {
          const dataStr = localStorage.getItem(key)
          if (dataStr) {
            const data = JSON.parse(dataStr)
            
            // Mock creation date (in real app, store this)
            const createdAt = new Date()
            
            presentations.push({
              ...data,
              createdAt,
              isCompleted: !!data.completedAt,
              totalValue: data.proposal?.total || 0
            })
          }
        }
      }

      // Today's presentations
      const todayPresentations = presentations.filter(p => {
        const pDate = new Date(p.createdAt)
        pDate.setHours(0, 0, 0, 0)
        return pDate.getTime() === today.getTime()
      })

      // Last week's presentations (for comparison)
      const lastWeekPresentations = presentations.filter(p => {
        const pDate = new Date(p.createdAt)
        return pDate >= weekAgo && pDate < today
      })

      // Calculate metrics
      const todayCount = todayPresentations.length
      const todayCompleted = todayPresentations.filter(p => p.isCompleted).length
      const completionRate = todayCount > 0 
        ? Math.round((todayCompleted / todayCount) * 100) 
        : 0

      const totalValue = todayPresentations
        .filter(p => p.isCompleted)
        .reduce((sum, p) => sum + p.totalValue, 0)

      // Average time (mock - would need actual timestamps)
      const avgTimeMinutes = 25 // Mock average

      // Week comparison
      const lastWeekCount = lastWeekPresentations.length
      const countChange = lastWeekCount > 0 
        ? Math.round(((todayCount - lastWeekCount) / lastWeekCount) * 100)
        : 0

      const lastWeekCompleted = lastWeekPresentations.filter(p => p.isCompleted).length
      const lastWeekCompletionRate = lastWeekCount > 0
        ? (lastWeekCompleted / lastWeekCount) * 100
        : 0
      const completionChange = Math.round(completionRate - lastWeekCompletionRate)

      setStats({
        todayCount,
        completionRate,
        avgTimeMinutes,
        totalValue,
        weekComparison: {
          countChange,
          completionChange
        }
      })
    } catch (error) {
      console.error('Error calculating stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Today's Presentations */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Presentations วันนี้</div>
            <Presentation className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold">{stats.todayCount}</div>
            {stats.weekComparison.countChange !== 0 && (
              <Badge 
                variant="outline"
                className={stats.weekComparison.countChange > 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}
              >
                <TrendingUp className={`h-3 w-3 mr-1 ${stats.weekComparison.countChange < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(stats.weekComparison.countChange)}%
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            vs สัปดาห์ที่แล้ว
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Completion Rate</div>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            {stats.weekComparison.completionChange !== 0 && (
              <Badge 
                variant="outline"
                className={stats.weekComparison.completionChange > 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}
              >
                {stats.weekComparison.completionChange > 0 ? '+' : ''}{stats.weekComparison.completionChange}%
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            เสร็จสมบูรณ์
          </div>
        </CardContent>
      </Card>

      {/* Average Time */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Avg. Time</div>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <div className="text-2xl font-bold">{stats.avgTimeMinutes}</div>
            <div className="text-sm text-muted-foreground">min</div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            ต่อ presentation
          </div>
        </CardContent>
      </Card>

      {/* Total Value */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">มูลค่าวันนี้</div>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <div className="text-2xl font-bold">
              {stats.totalValue >= 1000 
                ? `${(stats.totalValue / 1000).toFixed(1)}K`
                : stats.totalValue}
            </div>
            <div className="text-sm text-muted-foreground">THB</div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            จาก presentations ที่ปิดการขาย
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
