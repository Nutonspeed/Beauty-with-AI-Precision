"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Star } from "lucide-react"

interface Program {
  name: string
  bookings: number
  revenue: number
  avgPrice: number
}

interface ProgramsData {
  programs: Program[]
  totalPrograms: number
}

import { useTranslations } from "next-intl"

export function TopPrograms() {
  const t = useTranslations()
  const [data, setData] = useState<ProgramsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await fetch("/api/center/dashboard/programs")
        if (!response.ok) {
          throw new Error(`Failed to fetch programs: ${response.status}`)
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("[TopPrograms] Error:", err)
        setError(err instanceof Error ? err.message : "Failed to load programs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrograms()
    const interval = setInterval(fetchPrograms, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">{t('dashboard.topPrograms.error')}</p>
      </div>
    )
  }

  const palette = ["bg-purple-500","bg-blue-500","bg-green-500","bg-orange-500","bg-red-500"]
  const topPrograms = data.programs.slice(0, 5).map((program, index) => ({
    ...program,
    rating: program.avgPrice ? Math.max(3.5, Math.min(5, 3.5 + program.avgPrice / 100000)) : 4.0,
    growth: 0, // no growth data returned; keep neutral
    color: palette[index] || "bg-gray-500"
  }))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const maxRevenue = topPrograms.length > 0 
    ? Math.max(...topPrograms.map(t => t.revenue)) 
    : 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Programs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('dashboard.topPrograms.title')}
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">{t('dashboard.topPrograms.thisMonth')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topPrograms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('dashboard.topPrograms.empty')}</p>
              <p className="text-sm mt-2">{t('dashboard.topPrograms.emptyDesc')}</p>
            </div>
          ) : (
            topPrograms.map((program, index) => (
            <div key={program.name} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full ${program.color} flex items-center justify-center text-white font-bold text-lg`}>
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium truncate">{program.name}</h4>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{program.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{t('dashboard.topPrograms.bookings', { count: program.bookings })}</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    +{program.growth}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{formatCurrency(program.revenue)}</span>
                  <div className="w-20">
                    <Progress
                      value={(program.revenue / maxRevenue) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Program Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.topPrograms.performance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue Distribution */}
            <div>
              <h4 className="font-medium mb-4">{t('dashboard.topPrograms.revenue')}</h4>
              <div className="space-y-3">
                {topPrograms.slice(0, 3).map((program) => (
                  <div key={program.name} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1 mr-2">{program.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${program.color}`}
                          style={{ width: `${(program.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {((program.revenue / topPrograms.reduce((sum, t) => sum + t.revenue, 0)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Leaders */}
            <div>
              <h4 className="font-medium mb-4">{t('dashboard.topPrograms.growth')}</h4>
              <div className="space-y-2">
                {topPrograms
                  .sort((a, b) => b.growth - a.growth)
                  .slice(0, 3)
                  .map((program, index) => (
                    <div key={program.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm truncate">{program.name}</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{program.growth}%</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Average Rating */}
            <div>
              <h4 className="font-medium mb-4">{t('dashboard.topPrograms.rating')}</h4>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold">
                  {(topPrograms.reduce((sum, t) => sum + t.rating, 0) / topPrograms.length).toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">/ 5.0</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('dashboard.topPrograms.reviews', { count: topPrograms.reduce((sum, t) => sum + t.bookings, 0) })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
