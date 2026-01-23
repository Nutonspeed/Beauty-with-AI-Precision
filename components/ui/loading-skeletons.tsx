/**
 * Dashboard Loading Skeletons
 * Reusable skeleton components for various dashboard elements
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShimmerSkeleton } from "@/components/ui/modern-loader"

// Stat Card Skeleton
export function StatCardSkeleton() {
  return (
    <Card className="rounded-[2.5rem] p-8 bg-white/80 backdrop-blur-md border-slate-100 shadow-premium">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <ShimmerSkeleton className="h-3 w-24 rounded-full" />
          <ShimmerSkeleton className="h-10 w-16 rounded-xl" />
        </div>
        <ShimmerSkeleton className="h-16 w-16 rounded-2xl" />
      </div>
    </Card>
  )
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <Card className="rounded-[3.5rem] p-10 bg-white/80 backdrop-blur-md border-slate-100 shadow-premium">
      <CardHeader className="p-0 mb-8">
        <ShimmerSkeleton className="h-6 w-48 rounded-lg" />
        <ShimmerSkeleton className="h-4 w-72 mt-3 rounded-md" />
      </CardHeader>
      <ShimmerSkeleton className="h-[350px] w-full rounded-[2.5rem]" />
    </Card>
  )
}

// Table Row Skeleton
export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-6 p-6 border-b border-slate-50">
      <ShimmerSkeleton className="h-12 w-12 rounded-xl" />
      <div className="space-y-2 flex-1">
        <ShimmerSkeleton className="h-4 w-[250px] rounded-md" />
        <ShimmerSkeleton className="h-3 w-[200px] rounded-sm" />
      </div>
      <ShimmerSkeleton className="h-10 w-24 rounded-xl" />
    </div>
  )
}

// Appointment Card Skeleton
export function AppointmentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Lead Card Skeleton (for sales)
export function LeadCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Dashboard Grid Skeleton
export function DashboardGridSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </CardContent>
      </Card>
    </div>
  )
}

// Reception Queue Skeleton
export function ReceptionQueueSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Pending */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <AppointmentCardSkeleton />
          <AppointmentCardSkeleton />
        </div>
        
        {/* Column 2: Arrived */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <AppointmentCardSkeleton />
          <AppointmentCardSkeleton />
        </div>
        
        {/* Column 3: In Progress */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <AppointmentCardSkeleton />
        </div>
      </div>
    </div>
  )
}

// Staff Schedule Skeleton
export function StaffScheduleSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        <AppointmentCardSkeleton />
        <AppointmentCardSkeleton />
        <AppointmentCardSkeleton />
      </div>
    </div>
  )
}

// Analytics Page Skeleton
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Main Chart */}
      <ChartSkeleton />

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </CardContent>
      </Card>
    </div>
  )
}
