"use client"

import type { ComponentType } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SkinAnalysisUpload } from "@/components/skin-analysis-upload"
import { useAnalysisMode } from "@/hooks/use-analysis-mode"
import type { AnalysisMode } from "@/types"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Sparkles, ShieldCheck, Brain } from "lucide-react"

interface AnalysisInteractionPanelProps {
  isLoggedIn?: boolean
}

const MODE_METADATA: Record<AnalysisMode, { label: string; description: string; icon: ComponentType<{ className?: string }> }> = {
  local: {
    label: "analysis.modes.local.label",
    description: "analysis.modes.local.description",
    icon: ShieldCheck,
  },
  hf: {
    label: "analysis.modes.hf.label",
    description: "analysis.modes.hf.description",
    icon: Brain,
  },
  auto: {
    label: "analysis.modes.auto.label",
    description: "analysis.modes.auto.description",
    icon: Sparkles,
  },
}

const MODE_ORDER: AnalysisMode[] = ["local", "auto", "hf"]

export function AnalysisInteractionPanel({ isLoggedIn }: AnalysisInteractionPanelProps) {
  const t = useTranslations()
  const { mode, setMode } = useAnalysisMode()

  const activeMeta = MODE_METADATA[mode]

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                {t('analysis.mode')}: {t(activeMeta.label)}
              </Badge>
              <span className="text-xs text-muted-foreground">{t('analysis.switchHint')}</span>
            </div>
            <p className="text-sm text-muted-foreground md:text-xs">
              {t(activeMeta.description)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {MODE_ORDER.map((option) => {
              const OptionIcon = MODE_METADATA[option].icon
              const isActive = option === mode
              return (
                <Button
                  key={option}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setMode(option)}
                  className={cn(
                    "h-10 min-w-[120px] justify-start gap-2",
                    !isActive && "bg-background",
                  )}
                >
                  <OptionIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {t(MODE_METADATA[option].label)}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <SkinAnalysisUpload isLoggedIn={isLoggedIn} analysisMode={mode} />
    </div>
  )
}
