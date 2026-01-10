"use client"

/**
 * Multi-Mode Skin Visualization - แสดงผล 8 โหมดการวิเคราะห์ผิว
 * ตามที่ลูกค้าต้องการ (8-panel layout)
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface AnalysisMode {
  id: string
  name: string
  count: number
  color: string // สีของ filter overlay
  description: string
}

export interface MultiModeViewerProps {
  originalImage: string
  modes: AnalysisMode[]
  detectionData?: {
    spots?: Array<{ x: number; y: number; radius: number }>
    wrinkles?: Array<{ x1: number; y1: number; x2: number; y2: number }>
    pores?: Array<{ x: number; y: number; size: number }>
    redness?: Array<{ x: number; y: number; width: number; height: number }>
  }
}

const DEFAULT_MODES: any[] = [
  // Top row
  { id: 'spots', color: 'rgba(255, 255, 0, 0.3)' },
  { id: 'wrinkles', color: 'rgba(0, 255, 0, 0.3)' },
  { id: 'texture', color: 'rgba(255, 200, 100, 0.3)' },
  { id: 'pores', color: 'rgba(255, 150, 255, 0.3)' },
  // Bottom row
  { id: 'uv_spots', color: 'rgba(255, 215, 0, 0.5)' },
  { id: 'brown_spots', color: 'rgba(139, 90, 43, 0.4)' },
  { id: 'red_areas', color: 'rgba(255, 0, 0, 0.3)' },
  { id: 'porphyrins', color: 'rgba(0, 100, 255, 0.4)' },
]

export function MultiModeViewer({ 
  originalImage, 
  modes = DEFAULT_MODES,
  detectionData 
}: MultiModeViewerProps) {
  const t = useTranslations('multiModeViewer')
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* 8-Panel Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {modes.map((mode) => (
          <Card
            key={mode.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedMode === mode.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedMode(selectedMode === mode.id ? null : mode.id)}
          >
            <CardContent className="p-0">
              {/* Image with overlay */}
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <Image
                  src={originalImage}
                  alt={mode.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Color filter overlay */}
                <div 
                  className="absolute inset-0 mix-blend-multiply"
                  style={{ backgroundColor: mode.color }}
                />
                
                {/* Detection markers */}
                {detectionData && renderDetectionMarkers(mode.id, detectionData)}

                {/* Count badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    {mode.count}
                  </Badge>
                </div>
              </div>

              {/* Label */}
              <div className="p-3 bg-black text-white text-center">
                <div className="font-semibold text-sm">{t(`${mode.id}.name` as any)}</div>
                <div className="text-xs text-gray-300">{t(`${mode.id}.desc` as any)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected mode detail */}
      {selectedMode && (
        <Card className="border-primary">
          <CardContent className="p-6">
            {(() => {
              const mode = modes.find(m => m.id === selectedMode)
              if (!mode) return null
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{t(`${mode.id}.name` as any)}</h3>
                      <p className="text-sm text-muted-foreground">{t(`${mode.id}.desc` as any)}</p>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {mode.count} {t('detected')}
                    </Badge>
                  </div>

                  {/* Detailed view */}
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={originalImage}
                      alt={`${mode.name} detailed view`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    <div 
                      className="absolute inset-0 mix-blend-multiply"
                      style={{ backgroundColor: mode.color }}
                    />
                    {detectionData && renderDetectionMarkers(mode.id, detectionData, true)}
                  </div>

                  {/* Analysis details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">{t('detected')}</div>
                      <div className="text-2xl font-bold">{mode.count}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{t('severity')}</div>
                      <div className="text-2xl font-bold">
                        {mode.count > 10 ? t('high') : mode.count > 5 ? t('medium') : t('low')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{t('coverage')}</div>
                      <div className="text-2xl font-bold">
                        {Math.min(Math.round((mode.count / 100) * 100), 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{t('status')}</div>
                      <div className="text-2xl font-bold">
                        {mode.count > 10 ? '⚠️' : mode.count > 5 ? '⚡' : '✅'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper: Render detection markers on the image
function renderDetectionMarkers(
  modeId: string, 
  data: MultiModeViewerProps['detectionData'],
  enlarged = false
) {
  if (!data) return null

  const size = enlarged ? 'large' : 'small'
  const dotSize = size === 'large' ? 8 : 4
  const lineWidth = size === 'large' ? 2 : 1

  switch (modeId) {
    case 'spots':
    case 'uv_spots':
    case 'brown_spots':
      return data.spots?.map((spot, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-yellow-400"
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: `${spot.radius * 2}px`,
            height: `${spot.radius * 2}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))

    case 'pores':
      return data.pores?.map((pore, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-purple-500/30"
          style={{
            left: `${pore.x}%`,
            top: `${pore.y}%`,
            width: `${pore.size}px`,
            height: `${pore.size}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))

    case 'wrinkles':
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {data.wrinkles?.map((wrinkle, i) => (
            <line
              key={i}
              x1={`${wrinkle.x1}%`}
              y1={`${wrinkle.y1}%`}
              x2={`${wrinkle.x2}%`}
              y2={`${wrinkle.y2}%`}
              stroke="lime"
              strokeWidth={lineWidth}
            />
          ))}
        </svg>
      )

    case 'red_areas':
      return data.redness?.map((area, i) => (
        <div
          key={i}
          className="absolute border-2 border-red-500 bg-red-500/20"
          style={{
            left: `${area.x}%`,
            top: `${area.y}%`,
            width: `${area.width}%`,
            height: `${area.height}%`,
          }}
        />
      ))

    case 'porphyrins':
      // Blue dots for bacteria/porphyrins
      return data.spots?.map((spot, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-400"
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))

    default:
      return null
  }
}
