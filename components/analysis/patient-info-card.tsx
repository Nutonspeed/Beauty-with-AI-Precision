'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Calendar, User, Droplet, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { th, enUS } from 'date-fns/locale'
import type { PatientInfo } from '@/types/supabase'

interface PatientInfoCardProps {
  patientInfo: PatientInfo
  analysisDate: string
  isBaseline?: boolean
  locale?: 'th' | 'en'
  className?: string
}

const SKIN_TYPE_LABELS: Record<string, { th: string; en: string }> = {
  dry: { th: 'ผิวแห้ง', en: 'Dry' },
  oily: { th: 'ผิวมัน', en: 'Oily' },
  combination: { th: 'ผิวผสม', en: 'Combination' },
  normal: { th: 'ผิวปกติ', en: 'Normal' },
  sensitive: { th: 'ผิวบอบบาง', en: 'Sensitive' },
}

const GENDER_LABELS: Record<string, { th: string; en: string }> = {
  male: { th: 'ชาย', en: 'Male' },
  female: { th: 'หญิง', en: 'Female' },
  other: { th: 'อื่นๆ', en: 'Other' },
}

export function PatientInfoCard({
  patientInfo,
  analysisDate,
  isBaseline = false,
  locale = 'en',
  className = '',
}: PatientInfoCardProps) {
  const dateLocale = locale === 'th' ? th : enUS

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {locale === 'th' ? 'ข้อมูลผู้ป่วย' : 'Patient Information'}
          </CardTitle>
          {isBaseline && (
            <Badge variant="secondary">
              {locale === 'th' ? 'การวิเคราะห์ฐาน' : 'Baseline Analysis'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {locale === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'}
            </Label>
            <p className="font-semibold">{patientInfo.name}</p>
          </div>

          {/* Age */}
          {patientInfo.age && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {locale === 'th' ? 'อายุ' : 'Age'}
              </Label>
              <p className="font-semibold">
                {patientInfo.age} {locale === 'th' ? 'ปี' : 'years'}
              </p>
            </div>
          )}

          {/* Gender */}
          {patientInfo.gender && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {locale === 'th' ? 'เพศ' : 'Gender'}
              </Label>
              <p className="font-semibold">
                {GENDER_LABELS[patientInfo.gender]?.[locale] || patientInfo.gender}
              </p>
            </div>
          )}

          {/* Skin Type */}
          {patientInfo.skinType && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Droplet className="h-3 w-3" />
                {locale === 'th' ? 'ประเภทผิว' : 'Skin Type'}
              </Label>
              <Badge variant="outline" className="font-semibold">
                {SKIN_TYPE_LABELS[patientInfo.skinType]?.[locale] || patientInfo.skinType}
              </Badge>
            </div>
          )}

          {/* Analysis Date */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {locale === 'th' ? 'วันที่วิเคราะห์' : 'Analysis Date'}
            </Label>
            <p className="font-semibold">
              {format(new Date(analysisDate), 'PPP', { locale: dateLocale })}
            </p>
          </div>

          {/* Medical History */}
          {patientInfo.medicalHistory && patientInfo.medicalHistory.length > 0 && (
            <div className="col-span-full space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {locale === 'th' ? 'ประวัติทางการแพทย์' : 'Medical History'}
              </Label>
              <div className="flex flex-wrap gap-2">
                {patientInfo.medicalHistory.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Allergies */}
          {patientInfo.allergies && patientInfo.allergies.length > 0 && (
            <div className="col-span-full space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-destructive" />
                {locale === 'th' ? 'อาการแพ้' : 'Allergies'}
              </Label>
              <div className="flex flex-wrap gap-2">
                {patientInfo.allergies.map((item) => (
                  <Badge key={item} variant="destructive">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Current Medications */}
          {patientInfo.currentMedications && patientInfo.currentMedications.length > 0 && (
            <div className="col-span-full space-y-2">
              <Label className="text-xs text-muted-foreground">
                {locale === 'th' ? 'ยาที่ใช้อยู่' : 'Current Medications'}
              </Label>
              <div className="flex flex-wrap gap-2">
                {patientInfo.currentMedications.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {patientInfo.notes && (
            <div className="col-span-full space-y-1">
              <Label className="text-xs text-muted-foreground">
                {locale === 'th' ? 'หมายเหตุ' : 'Notes'}
              </Label>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {patientInfo.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
