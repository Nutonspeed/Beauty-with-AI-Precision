"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface AnalysisRecord {
  id: string
  date: Date
  imageUrl: string
  scores: {
    wrinkles: number
    spots: number
    pores: number
    texture: number
    elasticity: number
    hydration: number
    uvDamage: number
  }
  skinAge: number
  overallScore: number
}

interface SkinComparisonTimelineProps {
  records: AnalysisRecord[]
  locale?: 'th' | 'en'
  className?: string
}

const translations = {
  th: {
    title: "เปรียบเทียบความก้าวหน้า",
    subtitle: "ดูพัฒนาการของผิวตลอดระยะเวลา",
    before: "ก่อน",
    after: "หลัง",
    improvement: "ดีขึ้น",
    decline: "แย่ลง",
    noChange: "เท่าเดิม",
    skinAge: "อายุผิว",
    overallScore: "คะแนนรวม",
    metrics: "รายละเอียด",
    wrinkles: "ริ้วรอย",
    spots: "จุดด่างดำ",
    pores: "รูขุมขน",
    texture: "เนื้อผิว",
    elasticity: "ความยืดหยุ่น",
    hydration: "ความชุ่มชื้น",
    uvDamage: "ความเสียหาย UV",
    download: "ดาวน์โหลด",
    share: "แชร์",
    dragToCompare: "เลื่อนเพื่อเปรียบเทียบ",
    selectDates: "เลือกวันที่",
    noRecords: "ยังไม่มีประวัติการวิเคราะห์"
  },
  en: {
    title: "Progress Comparison",
    subtitle: "Track your skin improvement over time",
    before: "Before",
    after: "After",
    improvement: "Improved",
    decline: "Declined",
    noChange: "No change",
    skinAge: "Skin Age",
    overallScore: "Overall Score",
    metrics: "Metrics",
    wrinkles: "Wrinkles",
    spots: "Dark Spots",
    pores: "Pores",
    texture: "Texture",
    elasticity: "Elasticity",
    hydration: "Hydration",
    uvDamage: "UV Damage",
    download: "Download",
    share: "Share",
    dragToCompare: "Drag to compare",
    selectDates: "Select dates",
    noRecords: "No analysis records yet"
  }
}

export function SkinComparisonTimeline({ 
  records, 
  locale = 'th',
  className = ''
}: SkinComparisonTimelineProps) {
  const t = translations[locale]
  const [beforeIndex, setBeforeIndex] = useState(0)
  const [afterIndex, setAfterIndex] = useState(records.length - 1)
  const [sliderPosition, setSliderPosition] = useState(50)

  if (records.length < 2) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t.noRecords}</p>
        </CardContent>
      </Card>
    )
  }

  const beforeRecord = records[beforeIndex]
  const afterRecord = records[afterIndex]

  const calculateChange = (before: number, after: number, inverse = false) => {
    const diff = inverse ? before - after : after - before
    return {
      value: Math.abs(diff),
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
    }
  }

  const getChangeIcon = (direction: string, inverse = false) => {
    if (direction === 'same') return <Minus className="h-4 w-4 text-muted-foreground" />
    if ((direction === 'up' && !inverse) || (direction === 'down' && inverse)) {
      return <TrendingUp className="h-4 w-4 text-emerald-500" />
    }
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const getChangeColor = (direction: string, inverse = false) => {
    if (direction === 'same') return 'text-muted-foreground'
    if ((direction === 'up' && !inverse) || (direction === 'down' && inverse)) {
      return 'text-emerald-500'
    }
    return 'text-red-500'
  }

  const metrics = [
    { key: 'wrinkles', label: t.wrinkles, inverse: true },
    { key: 'spots', label: t.spots, inverse: true },
    { key: 'pores', label: t.pores, inverse: true },
    { key: 'texture', label: t.texture, inverse: false },
    { key: 'elasticity', label: t.elasticity, inverse: false },
    { key: 'hydration', label: t.hydration, inverse: false },
    { key: 'uvDamage', label: t.uvDamage, inverse: true }
  ]

  const overallChange = calculateChange(beforeRecord.overallScore, afterRecord.overallScore)
  const skinAgeChange = calculateChange(beforeRecord.skinAge, afterRecord.skinAge, true)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">{t.before}</label>
              <select
                value={beforeIndex}
                onChange={(e) => setBeforeIndex(parseInt(e.target.value))}
                className="w-full p-2 rounded-lg border bg-background"
              >
                {records.map((record, i) => (
                  <option key={record.id} value={i} disabled={i >= afterIndex}>
                    {record.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                  </option>
                ))}
              </select>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground mt-6" />
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">{t.after}</label>
              <select
                value={afterIndex}
                onChange={(e) => setAfterIndex(parseInt(e.target.value))}
                className="w-full p-2 rounded-lg border bg-background"
              >
                {records.map((record, i) => (
                  <option key={record.id} value={i} disabled={i <= beforeIndex}>
                    {record.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Comparison Slider */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-[4/3] bg-muted">
            {/* Before Image */}
            <div className="absolute inset-0">
              {beforeRecord.imageUrl ? (
                <Image
                  src={beforeRecord.imageUrl}
                  alt="Before"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground">{t.before}</span>
                </div>
              )}
            </div>

            {/* After Image with clip */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              {afterRecord.imageUrl ? (
                <Image
                  src={afterRecord.imageUrl}
                  alt="After"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/80">
                  <span className="text-muted-foreground">{t.after}</span>
                </div>
              )}
            </div>

            {/* Slider Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Labels */}
            <Badge className="absolute top-4 left-4 bg-background/80">
              {t.before}
            </Badge>
            <Badge className="absolute top-4 right-4 bg-background/80">
              {t.after}
            </Badge>
          </div>

          {/* Slider Control */}
          <div className="p-4">
            <Slider
              value={[sliderPosition]}
              onValueChange={([v]) => setSliderPosition(v)}
              min={0}
              max={100}
              step={1}
            />
            <p className="text-center text-sm text-muted-foreground mt-2">
              {t.dragToCompare}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={`${overallChange.direction === 'up' ? 'bg-emerald-500/5 border-emerald-500/20' : overallChange.direction === 'down' ? 'bg-red-500/5 border-red-500/20' : ''}`}>
          <CardContent className="pt-6 text-center">
            <div className="text-sm text-muted-foreground mb-1">{t.overallScore}</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold">{beforeRecord.overallScore}</span>
              <ArrowRight className="h-4 w-4" />
              <span className={`text-2xl font-bold ${getChangeColor(overallChange.direction)}`}>
                {afterRecord.overallScore}
              </span>
            </div>
            <div className={`flex items-center justify-center gap-1 mt-2 ${getChangeColor(overallChange.direction)}`}>
              {getChangeIcon(overallChange.direction)}
              <span className="text-sm">
                {overallChange.direction === 'up' ? '+' : overallChange.direction === 'down' ? '-' : ''}
                {overallChange.value}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className={`${skinAgeChange.direction === 'down' ? 'bg-emerald-500/5 border-emerald-500/20' : skinAgeChange.direction === 'up' ? 'bg-red-500/5 border-red-500/20' : ''}`}>
          <CardContent className="pt-6 text-center">
            <div className="text-sm text-muted-foreground mb-1">{t.skinAge}</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold">{beforeRecord.skinAge}</span>
              <ArrowRight className="h-4 w-4" />
              <span className={`text-2xl font-bold ${getChangeColor(skinAgeChange.direction, true)}`}>
                {afterRecord.skinAge}
              </span>
            </div>
            <div className={`flex items-center justify-center gap-1 mt-2 ${getChangeColor(skinAgeChange.direction, true)}`}>
              {getChangeIcon(skinAgeChange.direction, true)}
              <span className="text-sm">
                {skinAgeChange.value} {locale === 'th' ? 'ปี' : 'years'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.metrics}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric) => {
            const beforeValue = beforeRecord.scores[metric.key as keyof typeof beforeRecord.scores]
            const afterValue = afterRecord.scores[metric.key as keyof typeof afterRecord.scores]
            const change = calculateChange(beforeValue, afterValue, metric.inverse)
            
            return (
              <div key={metric.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{beforeValue}%</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className={getChangeColor(change.direction, metric.inverse)}>
                      {afterValue}%
                    </span>
                    {getChangeIcon(change.direction, metric.inverse)}
                  </div>
                </div>
                <div className="flex gap-1 h-2">
                  <Progress 
                    value={beforeValue} 
                    className="flex-1 [&>div]:bg-muted-foreground/50"
                  />
                  <Progress 
                    value={afterValue} 
                    className={`flex-1 ${
                      change.direction === 'same' ? '' :
                      (change.direction === 'up' && !metric.inverse) || (change.direction === 'down' && metric.inverse)
                        ? '[&>div]:bg-emerald-500'
                        : '[&>div]:bg-red-500'
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          {t.download}
        </Button>
        <Button variant="outline" className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          {t.share}
        </Button>
      </div>
    </div>
  )
}
