"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, User, CheckCircle2, PlayCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import type { PresentationData } from "@/lib/sales/presentation-types"
import {
  listStoredPresentationIds,
  loadPresentationData,
  clearPresentationData,
} from "@/lib/sales/presentation-storage"

interface IncompletePresentationSummary {
  customerId: string
  customerName: string
  lastStep: number
  lastUpdated: Date
  progress: number
  data: PresentationData
}

const STEP_NAMES = [
  "ข้อมูลลูกค้า",
  "สแกนใบหน้า", 
  "วิเคราะห์ AI",
  "ดู AR Preview",
  "เลือกผลิตภัณฑ์",
  "สร้างใบเสนอราคา",
  "เซ็นสัญญา"
]

function computeLastStep(data: PresentationData): number {
  const selectedTreatments = data.selectedTreatments ?? []
  const selectedProducts = data.selectedProducts ?? []

  if (data.completedAt) return 7
  if (data.proposal) return 6
  if (selectedProducts.length > 0) return 5
  if (selectedTreatments.length > 0) return 4
  if (data.analysisResults) return 3
  if (data.scannedImages?.front) return 2
  if (data.customer?.name) return 1
  return 0
}

function buildPresentationSummary(
  customerId: string,
  data: PresentationData
): IncompletePresentationSummary | null {
  if (data.completedAt) {
    return null
  }

  const lastStep = computeLastStep(data)

  if (lastStep === 0) {
    return null
  }

  return {
    customerId,
    customerName: data.customer.name || 'Unknown',
    lastStep,
    lastUpdated: data.lastSavedAt ?? new Date(),
    progress: (lastStep / 7) * 100,
    data,
  }
}

export function ResumePresentations() {
  const [incompletePresentations, setIncompletePresentations] = useState<IncompletePresentationSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadIncompletePresentations()
  }, [])

  const loadIncompletePresentations = () => {
    try {
      const presentations = listStoredPresentationIds()
        .map((customerId) => {
          const data = loadPresentationData(customerId)
          return data ? buildPresentationSummary(customerId, data) : null
        })
        .filter((summary): summary is IncompletePresentationSummary => summary !== null)
        .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())

      setIncompletePresentations(presentations)
    } catch (error) {
      console.error('Error loading presentations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (customerId: string) => {
    if (confirm('ต้องการลบ presentation นี้ใช่หรือไม่?')) {
      clearPresentationData(customerId)
      loadIncompletePresentations()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (incompletePresentations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="text-lg font-medium">ไม่มี Presentation ที่ค้างอยู่</p>
            <p className="text-sm mt-1">Presentations ทั้งหมดเสร็จสิ้นแล้ว</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">Presentations ที่ค้างอยู่</h3>
          <p className="text-sm text-muted-foreground">
            {incompletePresentations.length} รายการรอดำเนินการต่อ
          </p>
        </div>
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          Incomplete
        </Badge>
      </div>

      {incompletePresentations.map((presentation) => (
        <Card key={presentation.customerId} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Customer Info */}
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h4 className="font-medium truncate">{presentation.customerName}</h4>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>ความคืบหน้า: Step {presentation.lastStep}/7</span>
                    <span>{Math.round(presentation.progress)}%</span>
                  </div>
                  <Progress value={presentation.progress} className="h-2" />
                </div>

                {/* Last Step Info */}
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="text-xs">
                    {STEP_NAMES[presentation.lastStep - 1]}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    • ต่อไปคือ: {STEP_NAMES[presentation.lastStep] || 'เสร็จสิ้น'}
                  </span>
                </div>

                {/* Phone/Email if available */}
                {(presentation.data.customer.phone || presentation.data.customer.email) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {presentation.data.customer.phone && (
                      <span className="mr-3">📞 {presentation.data.customer.phone}</span>
                    )}
                    {presentation.data.customer.email && (
                      <span>✉️ {presentation.data.customer.email}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link href={`/sales/wizard/${presentation.customerId}`}>
                  <Button size="sm" className="w-full">
                    <PlayCircle className="h-4 w-4 mr-1" />
                    ทำต่อ
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(presentation.customerId)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
