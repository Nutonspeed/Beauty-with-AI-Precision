"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, Microscope } from "lucide-react"
import { cn } from "@/lib/utils"

import { useTranslations } from "next-intl"

export type AnalysisTier = "free" | "premium" | "professional"

interface TierSelectorProps {
  selectedTier: AnalysisTier
  onTierChange: (tier: AnalysisTier) => void
  className?: string
}

export function TierSelector({ selectedTier, onTierChange, className }: TierSelectorProps) {
  const t = useTranslations('tierSelector')

  const tiers = [
    {
      id: "free" as const,
      name: t('tiers.free.name'),
      icon: Zap,
      price: t('currencySymbol') + "0",
      accuracy: "70-80%",
      features: t.raw('tiers.free.features') as string[],
      color: "border-gray-300 dark:border-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-900/50",
    },
    {
      id: "premium" as const,
      name: t('tiers.premium.name'),
      icon: Sparkles,
      price: t('currencySymbol') + "299",
      accuracy: "80-85%",
      features: t.raw('tiers.premium.features') as string[],
      color: "border-purple-300 dark:border-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      popular: true,
    },
    {
      id: "professional" as const,
      name: t('tiers.professional.name'),
      icon: Microscope,
      price: t('currencySymbol') + "999",
      accuracy: "85-90%",
      features: t.raw('tiers.professional.features') as string[],
      color: "border-blue-500 dark:border-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      badge: t('mostAccurate'),
    },
  ]

  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {tiers.map((tier) => {
        const Icon = tier.icon
        const isSelected = selectedTier === tier.id

        return (
          <Card
            key={tier.id}
            className={cn(
              "relative cursor-pointer transition-all hover:shadow-lg",
              tier.color,
              isSelected && "ring-2 ring-primary shadow-lg scale-105",
            )}
            onClick={() => onTierChange(tier.id)}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-purple-600 text-white">{t('popular')}</Badge>
              </div>
            )}
            {tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">{tier.badge}</Badge>
              </div>
            )}

            <CardHeader className={cn("pb-4", tier.bgColor)}>
              <div className="flex items-center justify-between">
                <Icon className="h-8 w-8 text-primary" />
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl">
                {tier.name}
              </CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{t('perAnalysis')}</span>
              </div>
              <Badge variant="outline" className="w-fit">
                {tier.accuracy} {t('accuracy')}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm">{feature}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full" variant={isSelected ? "default" : "outline"}>
                {isSelected ? t('selected') : t('select')}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
