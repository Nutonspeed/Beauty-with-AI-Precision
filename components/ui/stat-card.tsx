/**
 * Reusable Stat Card Component
 * Displays metrics consistently across all pages
 */

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number // e.g., 12.5 = +12.5%
    label?: string // e.g., "vs last month"
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
  iconColor = "text-pink-600",
  iconBackground = "bg-pink-50/50",
  className,
  onClick,
}: StatCardProps) {
  const isClickable = !!onClick

  return (
    <Card
      className={cn(
        "rounded-[2.5rem] bg-white/80 backdrop-blur-md border-slate-100 shadow-premium transition-all duration-500 hover:shadow-glow-pink hover:border-pink-200 group",
        isClickable && "cursor-pointer active:scale-95",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400 group-hover:text-pink-600 transition-colors">
              {title}
            </p>
            <p className="text-3xl font-black italic tracking-tight text-slate-950">
              {typeof value === 'number' ? value.toLocaleString('th-TH') : value}
            </p>
            {trend && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                {trend.value > 0 ? (
                  <>
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg shadow-inner">
                      <TrendingUp className="size-3" />
                      <span>+{trend.value}%</span>
                    </div>
                  </>
                ) : trend.value < 0 ? (
                  <>
                    <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg shadow-inner">
                      <TrendingDown className="size-3" />
                      <span>{trend.value}%</span>
                    </div>
                  </>
                ) : (
                  <span className="text-slate-400">0%</span>
                )}
                {trend.label && (
                  <span className="text-slate-400 opacity-60 lowercase">{trend.label}</span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex size-16 items-center justify-center rounded-2xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:shadow-glow-pink",
              iconBackground
            )}
          >
            <Icon className={cn("size-8 transition-transform duration-500 group-hover:rotate-12", iconColor)} aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton for StatCard
export function StatCardSkeleton() {
  return (
    <Card data-testid="metric-skeleton">
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

// Variants for various metrics
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
  programs: {
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
