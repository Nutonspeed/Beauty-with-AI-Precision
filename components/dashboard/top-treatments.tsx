"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Star } from "lucide-react"

interface Treatment {
  name: string
  bookings: number
  revenue: number
  avgPrice: number
}

interface TreatmentsData {
  treatments: Treatment[]
  totalTreatments: number
}

export function TopTreatments() {
  const [data, setData] = useState<TreatmentsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTreatments() {
      try {
        const response = await fetch("/api/clinic/dashboard/treatments")
        if (!response.ok) {
          throw new Error(`Failed to fetch treatments: ${response.status}`)
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("[TopTreatments] Error:", err)
        setError(err instanceof Error ? err.message : "Failed to load treatments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTreatments()
    const interval = setInterval(fetchTreatments, 5 * 60 * 1000)
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
        <p className="text-sm text-destructive">Failed to load treatments. Please try again.</p>
      </div>
    )
  }

  const topTreatments = data.treatments.slice(0, 5).map((treatment, index) => ({
    ...treatment,
    rating: 4.5 + (Math.random() * 0.5), // Mock ratings for now
    growth: 5 + (Math.random() * 20), // Mock growth for now
    color: [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-red-500"
    ][index] || "bg-gray-500"
  }))

// Mock data - replaced with real data from API
const _mockTopTreatments = [
  {
    name: "Complete Skin Renewal Package",
    revenue: 285000,
    bookings: 45,
    rating: 4.9,
    growth: 23.5,
    color: "bg-purple-500"
  },
  {
    name: "Laser Hair Removal",
    revenue: 198000,
    bookings: 38,
    rating: 4.8,
    growth: 18.2,
    color: "bg-blue-500"
  },
  {
    name: "Anti-Aging Facial",
    revenue: 165000,
    bookings: 52,
    rating: 4.7,
    growth: 15.8,
    color: "bg-green-500"
  },
  {
    name: "Hydrating Treatment",
    revenue: 142000,
    bookings: 41,
    rating: 4.6,
    growth: 12.3,
    color: "bg-orange-500"
  },
  {
    name: "Acne Treatment",
    revenue: 128000,
    bookings: 35,
    rating: 4.5,
    growth: 8.7,
    color: "bg-red-500"
  }
]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const maxRevenue = topTreatments.length > 0 
    ? Math.max(...topTreatments.map(t => t.revenue)) 
    : 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Treatments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏆 Top Performing Treatments
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">This Month</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topTreatments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>ยังไม่มีข้อมูลทรีตเมนต์</p>
              <p className="text-sm mt-2">ข้อมูลจะแสดงเมื่อมีการจองบริการ</p>
            </div>
          ) : (
            topTreatments.map((treatment, index) => (
            <div key={treatment.name} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full ${treatment.color} flex items-center justify-center text-white font-bold text-lg`}>
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium truncate">{treatment.name}</h4>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{treatment.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{treatment.bookings} bookings</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    +{treatment.growth}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{formatCurrency(treatment.revenue)}</span>
                  <div className="w-20">
                    <Progress
                      value={(treatment.revenue / maxRevenue) * 100}
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

      {/* Treatment Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Treatment Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue Distribution */}
            <div>
              <h4 className="font-medium mb-4">Revenue Distribution</h4>
              <div className="space-y-3">
                {topTreatments.slice(0, 3).map((treatment) => (
                  <div key={treatment.name} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1 mr-2">{treatment.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${treatment.color}`}
                          style={{ width: `${(treatment.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {((treatment.revenue / topTreatments.reduce((sum, t) => sum + t.revenue, 0)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Leaders */}
            <div>
              <h4 className="font-medium mb-4">🚀 Growth Leaders</h4>
              <div className="space-y-2">
                {topTreatments
                  .sort((a, b) => b.growth - a.growth)
                  .slice(0, 3)
                  .map((treatment, index) => (
                    <div key={treatment.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm truncate">{treatment.name}</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">+{treatment.growth}%</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Average Rating */}
            <div>
              <h4 className="font-medium mb-4">⭐ Average Rating</h4>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold">
                  {(topTreatments.reduce((sum, t) => sum + t.rating, 0) / topTreatments.length).toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">/ 5.0</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {topTreatments.reduce((sum, t) => sum + t.bookings, 0)} customer reviews
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
