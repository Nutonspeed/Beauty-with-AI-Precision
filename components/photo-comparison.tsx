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
import { useTreatmentPhotos } from "@/hooks/useTreatment"

interface PhotoComparisonProps {
  treatmentId: string
}

export default function PhotoComparison({ treatmentId }: PhotoComparisonProps) {
  const { photos: beforePhotos } = useTreatmentPhotos(treatmentId, { type: "before" })
  const { photos: afterPhotos } = useTreatmentPhotos(treatmentId, { type: "after" })
  const { photos: progressPhotos } = useTreatmentPhotos(treatmentId, { type: "progress" })

  const [selectedBeforeIndex, setSelectedBeforeIndex] = useState(0)
  const [selectedAfterIndex, setSelectedAfterIndex] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(50)

  const beforePhoto = beforePhotos[selectedBeforeIndex]
  const afterPhoto = afterPhotos[selectedAfterIndex]

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
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
            <p className="text-gray-500">No photos available yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Photos will appear here as treatment progresses
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
          <TabsTrigger value="comparison">Before/After</TabsTrigger>
          <TabsTrigger value="progress">Progress Photos</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          {beforePhotos.length > 0 && afterPhotos.length > 0 ? (
            <>
              {/* Slider View */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Comparison Slider
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
                        <span className="text-gray-400">Before Photo</span>
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-blue-500">Before</Badge>
                      </div>
                    </div>

                    {/* After image (right side) */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                    >
                      <div className="relative w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-400">After Photo</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500">After</Badge>
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
                        <p className="font-medium text-gray-700">Before</p>
                        <p className="text-gray-500">
                          {formatDate(beforePhoto.capturedDate)}
                        </p>
                        <p className="text-gray-500">
                          {beforePhoto.area} - {beforePhoto.angle}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">After</p>
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
                  <CardTitle>Side by Side Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="space-y-2">
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400">Before Photo</span>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-blue-500">Before</Badge>
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
                          <span className="text-gray-400">After Photo</span>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-green-500">After</Badge>
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
                      {selectedBeforeIndex + 1} of {beforePhotos.length} | {selectedAfterIndex + 1}{" "}
                      of {afterPhotos.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  {beforePhotos.length === 0 && <p>No before photos available</p>}
                  {afterPhotos.length === 0 && <p>No after photos available yet</p>}
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
                        <span className="text-gray-400">Progress Photo</span>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-purple-500">Progress</Badge>
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
                <div className="text-center text-gray-500">No progress photos available yet</div>
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
