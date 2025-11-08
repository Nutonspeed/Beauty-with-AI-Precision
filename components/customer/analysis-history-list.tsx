"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, Eye } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

interface Analysis {
  id: string
  created_at: string
  image_url?: string
  thumbnail_url?: string
  concerns: Array<{ type: string; confidence: number }>
  metrics?: {
    totalTime: number
    detectionCount: number
  }
}

export function AnalysisHistoryList({ userId }: { userId: string }) {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        const response = await fetch("/api/customer/analyses")
        const data = await response.json()
        if (data.success) {
          setAnalyses(data.analyses)
        }
      } catch (error) {
        console.error("Error fetching analyses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyses()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <div className="py-12 text-center">
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No analyses yet</h3>
        <p className="mb-4 text-sm text-muted-foreground">Start with your first AI skin analysis</p>
        <Button>
          <Sparkles className="mr-2 h-4 w-4" />
          Start Analysis
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {analyses.map((analysis) => (
        <div key={analysis.id} className="overflow-hidden rounded-lg border border-border bg-background">
          {analysis.thumbnail_url && (
            <div className="relative aspect-square">
              <Image src={analysis.thumbnail_url || "/placeholder.svg"} alt="Analysis" fill className="object-cover" />
            </div>
          )}
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {format(new Date(analysis.created_at), "MMM d, yyyy")}
              </span>
              <Badge variant="secondary">
                <Sparkles className="mr-1 h-3 w-3" />
                AI Analysis
              </Badge>
            </div>

            {analysis.concerns && analysis.concerns.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {analysis.concerns.slice(0, 3).map((concern, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {concern.type}
                  </Badge>
                ))}
                {analysis.concerns.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{analysis.concerns.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <Button size="sm" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View Results
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
