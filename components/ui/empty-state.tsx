/**
 * Empty State Component
 * แสดงเมื่อไม่มีข้อมูล พร้อม CTA ให้ user ทำ action
 */

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

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
      icon: "h-12 w-12",
      title: "text-lg",
      description: "text-sm",
      padding: "p-8",
    },
    md: {
      icon: "h-16 w-16",
      title: "text-xl",
      description: "text-base",
      padding: "p-12",
    },
    lg: {
      icon: "h-24 w-24",
      title: "text-2xl",
      description: "text-lg",
      padding: "p-16",
    },
  }

  const sizeClasses = sizes[size]

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className={cn("text-center", sizeClasses.padding)}>
        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className="flex items-center justify-center rounded-full bg-muted/50 p-4">
            <Icon
              className={cn(sizeClasses.icon, "text-muted-foreground")}
              aria-hidden="true"
            />
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h3 className={cn("font-semibold", sizeClasses.title)}>
              {title}
            </h3>
            <p className={cn("text-muted-foreground max-w-md", sizeClasses.description)}>
              {description}
            </p>
          </div>

          {/* Actions */}
          {(action || secondaryAction) && (
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {action && (
                <Button
                  onClick={action.onClick}
                  variant={action.variant || "default"}
                  size={size === "sm" ? "sm" : "default"}
                >
                  {action.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant="outline"
                  size={size === "sm" ? "sm" : "default"}
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

// Variants สำหรับ use cases ต่างๆ
export function NoAppointmentsState({ onAddNew }: { onAddNew?: () => void }) {
  return (
    <EmptyState
      icon={require("lucide-react").Calendar}
      title="ยังไม่มีนัดหมาย"
      description="เริ่มต้นโดยเพิ่มนัดหมายใหม่ หรือรอลูกค้าจองผ่านระบบออนไลน์"
      action={
        onAddNew
          ? {
              label: "เพิ่มนัดหมาย",
              onClick: onAddNew,
            }
          : undefined
      }
    />
  )
}

export function NoCustomersState({ onAddNew }: { onAddNew?: () => void }) {
  return (
    <EmptyState
      icon={require("lucide-react").Users}
      title="ยังไม่มีลูกค้า"
      description="เพิ่มลูกค้าใหม่เพื่อเริ่มต้นจัดการข้อมูลและประวัติการรักษา"
      action={
        onAddNew
          ? {
              label: "เพิ่มลูกค้า",
              onClick: onAddNew,
            }
          : undefined
      }
    />
  )
}

export function NoDataState({ 
  message = "ยังไม่มีข้อมูล",
  description = "ข้อมูลจะแสดงที่นี่เมื่อมีการเพิ่มข้อมูลเข้ามาในระบบ"
}: { 
  message?: string
  description?: string 
}) {
  return (
    <EmptyState
      icon={require("lucide-react").Inbox}
      title={message}
      description={description}
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
  return (
    <EmptyState
      icon={require("lucide-react").Search}
      title="ไม่พบผลลัพธ์"
      description={`ไม่พบข้อมูลที่ตรงกับคำค้นหา "${query}"`}
      action={{
        label: "ล้างการค้นหา",
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
  return (
    <EmptyState
      icon={require("lucide-react").AlertTriangle}
      title="เกิดข้อผิดพลาด"
      description="ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง"
      action={{
        label: "ลองอีกครั้ง",
        onClick: onRetry,
      }}
    />
  )
}
