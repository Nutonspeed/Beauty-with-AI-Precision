import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

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
    <div className={cn("flex flex-col items-center justify-center py-16 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-slate-100 shadow-premium p-12", className)}>
      <div className="flex items-center justify-center size-16 rounded-[2rem] bg-rose-50/50 shadow-inner mb-6">
        <AlertCircle className="size-8 text-rose-600" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-widest italic text-slate-950 mb-3">{displayTitle}</h3>
      <p className="text-base text-slate-500 font-medium italic mb-8 max-w-md">{displayMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="lg" className="gap-2 px-8">
          <RefreshCw className="size-4" />
          {t('retry')}
        </Button>
      )}
    </div>
  )
}
