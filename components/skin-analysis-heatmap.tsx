"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Info } from "lucide-react"
import { useTranslations } from "next-intl"

interface SkinAnalysisHeatmapProps {
  image: string | null
}

export function SkinAnalysisHeatmap({ image }: SkinAnalysisHeatmapProps) {
  const t = useTranslations('skinAnalysis.heatmap')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pigmentation" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pigmentation">{t('tabs.pigmentation')}</TabsTrigger>
            <TabsTrigger value="wrinkles">{t('tabs.wrinkles')}</TabsTrigger>
            <TabsTrigger value="pores">{t('tabs.pores')}</TabsTrigger>
            <TabsTrigger value="redness">{t('tabs.redness')}</TabsTrigger>
          </TabsList>

          <TabsContent value="pigmentation" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3">
                <Info className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-muted-foreground">
                  {t('info.pigmentation')}
                </p>
              </div>

              <div className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-lg border-2 border-border">
                {image ? (
                  <>
                    <Image src={image || "/placeholder.svg"} alt="Original" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-yellow-500/20" />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <p className="text-muted-foreground">{t('noImage')}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-500" />
                  <span className="text-xs">{t('levels.low')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-yellow-500" />
                  <span className="text-xs">{t('levels.medium')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-red-500" />
                  <span className="text-xs">{t('levels.high')}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wrinkles" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 p-3">
                <Info className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-muted-foreground">
                  {t('info.wrinkles')}
                </p>
              </div>

              <div className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-lg border-2 border-border">
                {image ? (
                  <>
                    <Image src={image || "/placeholder.svg"} alt="Original" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-transparent to-blue-500/10" />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <p className="text-muted-foreground">{t('noImage')}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pores" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 p-3">
                <Info className="h-4 w-4 text-purple-600" />
                <p className="text-sm text-muted-foreground">{t('info.pores')}</p>
              </div>

              <div className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-lg border-2 border-border">
                {image ? (
                  <>
                    <Image src={image || "/placeholder.svg"} alt="Original" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <p className="text-muted-foreground">{t('noImage')}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="redness" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3">
                <Info className="h-4 w-4 text-red-600" />
                <p className="text-sm text-muted-foreground">
                  {t('info.redness')}
                </p>
              </div>

              <div className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-lg border-2 border-border">
                {image ? (
                  <>
                    <Image src={image || "/placeholder.svg"} alt="Original" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-red-500/15 via-transparent to-pink-500/10" />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <p className="text-muted-foreground">{t('noImage')}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex items-start gap-3">
            <Badge className="shrink-0 bg-yellow-500/20 text-yellow-700" variant="secondary">
              {t('upgrade.badge')}
            </Badge>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('upgrade.description')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
