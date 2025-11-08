import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ 
  message = "กำลังโหลด...",
  className = ""
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
