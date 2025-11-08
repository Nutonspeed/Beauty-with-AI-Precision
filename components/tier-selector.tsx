"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, Microscope } from "lucide-react"
import { cn } from "@/lib/utils"

export type AnalysisTier = "free" | "premium" | "clinical"

interface TierSelectorProps {
  selectedTier: AnalysisTier
  onTierChange: (tier: AnalysisTier) => void
  className?: string
}

const tiers = [
  {
    id: "free" as const,
    name: "Free",
    nameTh: "ฟรี",
    icon: Zap,
    price: "฿0",
    accuracy: "70-80%",
    features: ["Browser AI analysis", "8-point skin metrics", "Basic recommendations", "Standard processing speed"],
    featuresTh: ["วิเคราะห์ด้วย AI บนเบราว์เซอร์", "วัดผล 8 จุด", "คำแนะนำพื้นฐาน", "ความเร็วมาตรฐาน"],
    color: "border-gray-300 dark:border-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-900/50",
  },
  {
    id: "premium" as const,
    name: "Premium",
    nameTh: "พรีเมียม",
    icon: Sparkles,
    price: "฿299",
    accuracy: "80-85%",
    features: [
      "Browser + Cloud AI",
      "Advanced heatmap visualization",
      "Detailed confidence scores",
      "Priority processing",
    ],
    featuresTh: ["AI บนเบราว์เซอร์ + คลาวด์", "แผนที่ความร้อนขั้นสูง", "คะแนนความมั่นใจละเอียด", "ประมวลผลแบบเร่งด่วน"],
    color: "border-purple-300 dark:border-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    popular: true,
  },
  {
    id: "clinical" as const,
    name: "Clinical",
    nameTh: "คลินิก",
    icon: Microscope,
    price: "฿999",
    accuracy: "85-90%",
    features: [
      "VISIA-equivalent analysis",
      "UV & polarized imaging simulation",
      "3D depth estimation",
      "Expert validation available",
    ],
    featuresTh: ["วิเคราะห์ระดับ VISIA", "จำลอง UV และแสงโพลาไรซ์", "ประมาณความลึก 3 มิติ", "ตรวจสอบโดยผู้เชี่ยวชาญ"],
    color: "border-blue-500 dark:border-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    badge: "Most Accurate",
  },
]

export function TierSelector({ selectedTier, onTierChange, className }: TierSelectorProps) {
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
                <Badge className="bg-purple-600 text-white">Most Popular</Badge>
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
                <span className="ml-2 text-lg text-muted-foreground">/ {tier.nameTh}</span>
              </CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-sm text-muted-foreground">per analysis</span>
              </div>
              <Badge variant="outline" className="w-fit">
                {tier.accuracy} accuracy
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm">{feature}</p>
                      <p className="text-xs text-muted-foreground">{tier.featuresTh[idx]}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full" variant={isSelected ? "default" : "outline"}>
                {isSelected ? "Selected / เลือกแล้ว" : "Select / เลือก"}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
