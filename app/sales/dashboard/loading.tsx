import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SalesMetricsSkeleton } from "@/components/sales/sales-metrics-skeleton"
import { HotLeadCardSkeleton } from "@/components/sales/hot-lead-card-skeleton"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function SalesDashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />

      <main className="flex-1 pb-20 md:pb-0">
        {/* Header Skeleton */}
        <div className="border-b bg-white sticky top-16 z-40">
          <div className="container py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-36" />
              </div>
            </div>
          </div>
        </div>

        <div className="container py-6 space-y-6">
          {/* Sales Performance Overview Skeleton */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Badge className="mb-2 bg-blue-100 text-blue-800">Live Performance</Badge>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <SalesMetricsSkeleton />
          </div>

          {/* Hot Leads Section Skeleton */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-9 w-24 hidden md:block" />
            </div>

            {/* Search and Filter Bar Skeleton */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full sm:w-[180px]" />
            </div>

            {/* Lead Cards Skeleton */}
            <div className="space-y-4">
              <HotLeadCardSkeleton />
              <HotLeadCardSkeleton />
              <HotLeadCardSkeleton />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
