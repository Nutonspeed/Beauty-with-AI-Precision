"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SalesMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </Card>
      ))}
    </div>
  )
}
