/**
 * Reusable Stat Card Component
 * ใช้แสดงตัวเลข metrics แบบสม่ำเสมอทุกหน้า
 */

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number // เช่น 12.5 = +12.5%
    label?: string // เช่น "vs เดือนที่แล้ว"
  }
  iconColor?: string
  iconBackground?: string
  className?: string
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = "text-blue-600 dark:text-blue-400",
  iconBackground = "bg-blue-50 dark:bg-blue-950",
  className,
  onClick,
}: StatCardProps) {
  const isClickable = !!onClick

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        isClickable && "cursor-pointer hover:border-primary",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {typeof value === 'number' ? value.toLocaleString('th-TH') : value}
            </p>
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                {trend.value > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      +{trend.value}%
                    </span>
                  </>
                ) : trend.value < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {trend.value}%
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">0%</span>
                )}
                {trend.label && (
                  <span className="text-muted-foreground">{trend.label}</span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg",
              iconBackground
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton สำหรับ StatCard
export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-12 w-12 bg-muted animate-pulse rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

// Variants สำหรับ metrics ต่างๆ
export const STAT_CARD_VARIANTS = {
  revenue: {
    iconColor: "text-green-600 dark:text-green-400",
    iconBackground: "bg-green-50 dark:bg-green-950",
  },
  customers: {
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBackground: "bg-blue-50 dark:bg-blue-950",
  },
  bookings: {
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBackground: "bg-purple-50 dark:bg-purple-950",
  },
  staff: {
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBackground: "bg-indigo-50 dark:bg-indigo-950",
  },
  treatments: {
    iconColor: "text-pink-600 dark:text-pink-400",
    iconBackground: "bg-pink-50 dark:bg-pink-950",
  },
  inventory: {
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBackground: "bg-amber-50 dark:bg-amber-950",
  },
} as const

// Helper function
export function getStatVariant(type: keyof typeof STAT_CARD_VARIANTS) {
  return STAT_CARD_VARIANTS[type] || STAT_CARD_VARIANTS.customers
}
