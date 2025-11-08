"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function HotLeadCardSkeleton() {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar Skeleton */}
        <Skeleton className="w-12 h-12 rounded-full" />
        
        <div className="flex-1 min-w-0">
          {/* Name & Badge */}
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          
          {/* Age & Concerns */}
          <Skeleton className="h-4 w-48 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Score Badge Skeleton */}
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>

      {/* Analysis Data Bars */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 flex-1" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 flex-1" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </div>
    </Card>
  )
}
