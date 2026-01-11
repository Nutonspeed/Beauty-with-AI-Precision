"use client"

/**
 * Photo Comparison Component
 * 
 * Before/after photo comparison viewer with slider and side-by-side views.
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image, Maximize2, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useProgramPhotos } from "@/hooks/useProgram"

interface PhotoComparisonProps {
  programId: string
}

import { useTranslations, useLocale } from "next-intl"

export default function PhotoComparison({ programId }: PhotoComparisonProps) {
  const t = useTranslations()
  const locale = useLocale()
  const { photos: beforePhotos } = useProgramPhotos(programId, { type: "before" })
  const { photos: afterPhotos } = useProgramPhotos(programId, { type: "after" })
  const { photos: progressPhotos } = useProgramPhotos(programId, { type: "progress" })

  const [selectedBeforeIndex, setSelectedBeforeIndex] = useState(0)
  const [selectedAfterIndex, setSelectedAfterIndex] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(50)

  const beforePhoto = beforePhotos[selectedBeforeIndex]
  const afterPhoto = afterPhotos[selectedAfterIndex]

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'th' ? "th-TH" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handlePreviousBefore = () => {
    setSelectedBeforeIndex((prev) => (prev > 0 ? prev - 1 : beforePhotos.length - 1))
  }

  const handleNextBefore = () => {
    setSelectedBeforeIndex((prev) => (prev < beforePhotos.length - 1 ? prev + 1 : 0))
  }

  const handlePreviousAfter = () => {
    setSelectedAfterIndex((prev) => (prev > 0 ? prev - 1 : afterPhotos.length - 1))
  }

  const handleNextAfter = () => {
    setSelectedAfterIndex((prev) => (prev < afterPhotos.length - 1 ? prev + 1 : 0))
  }

  if (beforePhotos.length === 0 && afterPhotos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('photoComparison.empty.title')}</p>
            <p className="text-sm text-gray-400 mt-2">
              {t('photoComparison.empty.description')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">{t('photoComparison.tabs.comparison')}</TabsTrigger>
          <TabsTrigger value="progress">{t('photoComparison.tabs.progress')}</TabsTrigger>
          <TabsTrigger value="gallery">{t('photoComparison.tabs.gallery')}</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          {beforePhotos.length > 0 && afterPhotos.length > 0 ? (
            <>
              {/* Slider View */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    {t('photoComparison.slider.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {/* Before image (left side) */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">{t('photoComparison.photoInfo.before')}</span>
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-blue-500">{t('photoComparison.slider.before')}</Badge>
                      </div>
                    </div>

                    {/* After image (right side) */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                    >
                      <div className="relative w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-400">{t('photoComparison.photoInfo.after')}</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500">{t('photoComparison.slider.after')}</Badge>
                      </div>
                    </div>

                    {/* Slider control */}
                    <div
                      className="absolute inset-y-0 w-1 bg-white cursor-ew-resize"
                      style={{ left: `${sliderPosition}%` }}
                      onMouseDown={(e) => {
                        const container = e.currentTarget.parentElement!
                        const handleMove = (moveEvent: MouseEvent) => {
                          const rect = container.getBoundingClientRect()
                          const x = moveEvent.clientX - rect.left
                          const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
                          setSliderPosition(percentage)
                        }
                        const handleUp = () => {
                          document.removeEventListener("mousemove", handleMove)
                          document.removeEventListener("mouseup", handleUp)
                        }
                        document.addEventListener("mousemove", handleMove)
                        document.addEventListener("mouseup", handleUp)
                      }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <div className="flex gap-0.5">
                          <ChevronLeft className="w-3 h-3" />
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {beforePhoto && afterPhoto && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">{t('photoComparison.sideBySide.before')}</p>
                        <p className="text-gray-500">
                          {formatDate(beforePhoto.capturedDate)}
                        </p>
                        <p className="text-gray-500">
                          {beforePhoto.area} - {beforePhoto.angle}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">{t('photoComparison.sideBySide.after')}</p>
                        <p className="text-gray-500">{formatDate(afterPhoto.capturedDate)}</p>
                        <p className="text-gray-500">
                          {afterPhoto.area} - {afterPhoto.angle}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Side by Side View */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('photoComparison.sideBySide.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="space-y-2">
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400">{t('photoComparison.photoInfo.before')}</span>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-blue-500">{t('photoComparison.sideBySide.before')}</Badge>
                        </div>
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handlePreviousBefore}
                            disabled={beforePhotos.length <= 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleNextBefore}
                            disabled={beforePhotos.length <= 1}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {beforePhoto && (
                        <div className="text-sm text-gray-600">
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(beforePhoto.capturedDate)}
                          </p>
                          <p>
                            {beforePhoto.area} - {beforePhoto.angle}
                          </p>
                          {beforePhoto.notes && <p className="italic">{beforePhoto.notes}</p>}
                        </div>
                      )}
                    </div>

                    {/* After */}
                    <div className="space-y-2">
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <span className="text-gray-400">{t('photoComparison.photoInfo.after')}</span>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-green-500">{t('photoComparison.sideBySide.after')}</Badge>
                        </div>
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handlePreviousAfter}
                            disabled={afterPhotos.length <= 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleNextAfter}
                            disabled={afterPhotos.length <= 1}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {afterPhoto && (
                        <div className="text-sm text-gray-600">
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(afterPhoto.capturedDate)}
                          </p>
                          <p>
                            {afterPhoto.area} - {afterPhoto.angle}
                          </p>
                          {afterPhoto.notes && <p className="italic">{afterPhoto.notes}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-500">
                      {selectedBeforeIndex + 1} {t('photoComparison.photoInfo.of')} {beforePhotos.length} | {selectedAfterIndex + 1}{" "}
                      {t('photoComparison.photoInfo.of')} {afterPhotos.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  {beforePhotos.length === 0 && <p>{t('photoComparison.empty.noBefore')}</p>}
                  {afterPhotos.length === 0 && <p>{t('photoComparison.empty.noAfter')}</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {progressPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progressPhotos.map((photo) => (
                <Card key={photo.id}>
                  <CardContent className="p-4">
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">{t('photoComparison.photoInfo.progress')}</span>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-purple-500">{t('photoComparison.tabs.progress')}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-2 right-2"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">
                        {formatDate(photo.capturedDate)}
                      </p>
                      <p className="text-gray-500">
                        {photo.area} - {photo.angle}
                      </p>
                      {photo.notes && <p className="text-gray-600 italic mt-1">{photo.notes}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">{t('photoComparison.empty.noProgress')}</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...beforePhotos, ...afterPhotos, ...progressPhotos].map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="relative aspect-square bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge
                      className={
                        photo.type === "before"
                          ? "bg-blue-500"
                          : photo.type === "after"
                            ? "bg-green-500"
                            : "bg-purple-500"
                      }
                    >
                      {photo.type}
                    </Badge>
                  </div>
                </div>
                <div className="p-2 text-xs">
                  <p className="text-gray-600">{formatDate(photo.capturedDate)}</p>
                  <p className="text-gray-500">
                    {photo.area} - {photo.angle}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
