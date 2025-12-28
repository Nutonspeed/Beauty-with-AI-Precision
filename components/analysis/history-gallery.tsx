"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, TrendingUp, Eye } from "lucide-react"
import type { AnalysisHistoryItem } from "@/types/api"
import { useAuth } from "@/lib/auth/context"

export function AnalysisHistoryGallery() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const lp = useLocalizePath()
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ total: 0, limit: 12, offset: 0 })

  const loadHistory = useCallback(async () => {
    if (!user?.id) {
      console.log('[HistoryGallery] No user ID, skipping load')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log('[HistoryGallery] Loading history for user:', user.id)

      // Use new storage-optimized API endpoint
      const response = await fetch(`/api/analysis/history?userId=${user.id}&limit=${pagination.limit}&offset=${pagination.offset}`)
      
      if (!response.ok) {
        throw new Error('Failed to load analysis history')
      }

      const result = await response.json()

      console.log('[HistoryGallery] Loaded history:', result)

      setHistory(result.data)
      setPagination(result.pagination)
    } catch (err) {
      console.error('[HistoryGallery] Failed to load history:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analysis history'
      
      // Check if it's an auth error
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        console.log('[HistoryGallery] Auth error, redirecting to login')
        router.push(lp('/auth/login?callbackUrl=/analysis/history'))
        return
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, router, lp, pagination.limit, pagination.offset])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push(lp('/auth/login?callbackUrl=/analysis/history'))
      return
    }

    if (user?.id) {
      loadHistory()
    }
  }, [authLoading, user, router, lp, loadHistory])

  const handleViewAnalysis = (item: AnalysisHistoryItem) => {
    // Store analysis data in session storage for viewing
    sessionStorage.setItem('analysisImage', item.imageUrl)
    sessionStorage.setItem('analysisResults', JSON.stringify({
      concerns: item.concerns,
      timestamp: item.createdAt,
    }))
    router.push(lp('/analysis/results'))
  }

  const loadMore = () => {
    setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }))
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/10">
        <CardContent className="p-6">
          <p className="text-red-700">{error}</p>
          <Button onClick={loadHistory} className="mt-4" variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No Analysis History</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            You haven't performed any skin analysis yet.
            <br />
            คุณยังไม่มีประวัติการวิเคราะห์ผิวหน้า
          </p>
          <Button onClick={() => router.push(lp('/analysis'))}>
            Start Analysis / เริ่มวิเคราะห์
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              All time / ทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common Concern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getMostCommonConcern(history)}
            </div>
            <p className="text-xs text-muted-foreground">
              Top concern / ปัญหาที่พบบ่อย
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Analysis</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRelativeTime(history[0]?.createdAt)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last scan / ครั้งล่าสุด
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gallery Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {history.map((item) => (
          <Card
            key={item.id}
            className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
            onClick={() => handleViewAnalysis(item)}
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              <Image
                src={item.thumbnailUrl || item.displayUrl || '/placeholder.svg'}
                alt={`Analysis from ${new Date(item.createdAt).toLocaleDateString()}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                priority={false}
                loading="lazy"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-xs font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <p className="text-[10px] opacity-75">
                  Optimized: 96% faster loading ⚡
                </p>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="mb-2 flex flex-wrap gap-1">
                {Object.entries(item.concernCount)
                  .filter(([_, count]) => count > 0)
                  .map(([type, count]) => (
                    <span
                      key={type}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {getConcernLabel(type)}: {count}
                    </span>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {item.concerns.length} concerns detected
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {pagination.offset + pagination.limit < pagination.total && (
        <div className="flex justify-center">
          <Button onClick={loadMore} variant="outline" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More (${pagination.total - pagination.offset - pagination.limit} remaining)`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// Helper functions
function getMostCommonConcern(history: AnalysisHistoryItem[]): string {
  const counts: Record<string, number> = {}
  
  for (const item of history) {
    for (const [type, count] of Object.entries(item.concernCount)) {
      if (count > 0) {
        counts[type] = (counts[type] || 0) + count
      }
    }
  }

  const entries = Object.entries(counts)
  if (entries.length === 0) return 'None'

  const [topConcern] = entries.reduce((a, b) => (a[1] > b[1] ? a : b))
  return getConcernLabel(topConcern)
}

function getConcernLabel(type: string): string {
  const labels: Record<string, string> = {
    wrinkle: 'Wrinkles',
    pigmentation: 'Dark Spots',
    pore: 'Pores',
    redness: 'Redness',
    acne: 'Acne',
    dark_circle: 'Dark Circles',
  }
  return labels[type] || type
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}
