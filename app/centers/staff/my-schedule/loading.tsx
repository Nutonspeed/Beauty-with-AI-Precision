/**
 * Staff Schedule Skeleton Loading
 */

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function StaffScheduleLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full bg-white/20" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 bg-white/20" />
              <Skeleton className="h-4 w-24 bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 border-b">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Appointment Cards */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-20 w-full rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
