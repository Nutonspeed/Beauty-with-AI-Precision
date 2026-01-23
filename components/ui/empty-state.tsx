/**
 * Empty State Component
 * Displayed when no data is available, with CTA for user action
 */

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { useTranslations } from "next-intl"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizes = {
    sm: {
      icon: "h-10 w-10",
      title: "text-lg",
      description: "text-sm",
      padding: "p-8",
    },
    md: {
      icon: "h-14 w-14",
      title: "text-xl",
      description: "text-base",
      padding: "p-12",
    },
    lg: {
      icon: "h-20 w-20",
      title: "text-2xl",
      description: "text-lg",
      padding: "p-16",
    },
  }

  const sizeClasses = sizes[size]

  return (
    <Card className={cn("border-2 border-dashed border-slate-100 bg-white/50 backdrop-blur-sm rounded-[3rem] shadow-none hover:border-pink-200 transition-colors duration-500", className)}>
      <CardContent className={cn("text-center", sizeClasses.padding)}>
        <div className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <div className="flex items-center justify-center rounded-[2rem] bg-pink-50/50 p-5 shadow-inner">
            <Icon
              className={cn(sizeClasses.icon, "text-pink-600")}
              aria-hidden="true"
            />
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h3 className={cn("font-black uppercase tracking-widest italic text-slate-950", sizeClasses.title)}>
              {title}
            </h3>
            <p className={cn("text-slate-500 font-medium italic max-w-md", sizeClasses.description)}>
              {description}
            </p>
          </div>

          {/* Actions */}
          {(action || secondaryAction) && (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              {action && (
                <Button
                  onClick={action.onClick}
                  variant={action.variant || "default"}
                  size={size === "sm" ? "sm" : "lg"}
                  className="px-8"
                >
                  {action.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant="outline"
                  size={size === "sm" ? "sm" : "lg"}
                  className="px-8"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Variants for different use cases
export function NoAppointmentsState({ onAddNew }: { onAddNew?: () => void }) {
  const t = useTranslations('ui.emptyState')
  return (
    <EmptyState
      icon={require("lucide-react").Calendar}
      title={t('noAppointments')}
      description={t('noAppointmentsDesc')}
      action={
        onAddNew
          ? {
              label: t('addAppointment'),
              onClick: onAddNew,
            }
          : undefined
      }
    />
  )
}

export function NoCustomersState({ onAddNew }: { onAddNew?: () => void }) {
  const t = useTranslations('ui.emptyState')
  return (
    <EmptyState
      icon={require("lucide-react").Users}
      title={t('noCustomers')}
      description={t('noCustomersDesc')}
      action={
        onAddNew
          ? {
              label: t('addCustomer'),
              onClick: onAddNew,
            }
          : undefined
      }
    />
  )
}

export function NoDataState({ 
  message,
  description
}: { 
  message?: string
  description?: string 
}) {
  const t = useTranslations('ui.emptyState')
  return (
    <EmptyState
      icon={require("lucide-react").Inbox}
      title={message || t('noData')}
      description={description || t('noDataDesc')}
      size="sm"
    />
  )
}

export function SearchNoResultsState({ 
  query,
  onClear 
}: { 
  query: string
  onClear: () => void 
}) {
  const t = useTranslations('ui.emptyState')
  return (
    <EmptyState
      icon={require("lucide-react").Search}
      title={t('noResults')}
      description={t('searchNoResults', { query })}
      action={{
        label: t('clearSearch'),
        onClick: onClear,
        variant: "outline",
      }}
      size="sm"
    />
  )
}

export function ErrorState({ 
  onRetry 
}: { 
  onRetry: () => void 
}) {
  const t = useTranslations('ui.errorState')
  return (
    <EmptyState
      icon={require("lucide-react").AlertTriangle}
      title={t('title')}
      description={t('message')}
      action={{
        label: t('retry'),
        onClick: onRetry,
      }}
    />
  )
}
