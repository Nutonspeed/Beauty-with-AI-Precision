import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ 
  title,
  message,
  onRetry,
  className = ""
}: ErrorStateProps) {
  const t = useTranslations('ui.errorState')
  
  const displayTitle = title || t('title')
  const displayMessage = message || t('message')

  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">{displayMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('retry')}
        </Button>
      )}
    </div>
  )
}
