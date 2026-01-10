'use client'

import { useTranslations } from 'next-intl'
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

export function PatientInfoCard({
  patientInfo,
  analysisDate,
  isBaseline = false,
  locale = 'en',
  className = '',
}: PatientInfoCardProps) {
  const t = useTranslations('patientInfoCard');
  const dateLocale = locale === 'th' ? th : enUS

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          {isBaseline && (
            <Badge variant="secondary">
              {t('baselineAnalysis')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {t('fullName')}
            </Label>
            <p className="font-semibold">{patientInfo.name}</p>
          </div>

          {/* Age */}
          {patientInfo.age && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t('age')}
              </Label>
              <p className="font-semibold">
                {patientInfo.age} {t('years')}
              </p>
            </div>
          )}

          {/* Gender */}
          {patientInfo.gender && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t('gender')}
              </Label>
              <p className="font-semibold">
                {t(patientInfo.gender as any)}
              </p>
            </div>
          )}

          {/* Skin Type */}
          {patientInfo.skinType && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Droplet className="h-3 w-3" />
                {t('skinType')}
              </Label>
              <Badge variant="outline" className="font-semibold">
                {t(patientInfo.skinType as any)}
              </Badge>
            </div>
          )}

          {/* Analysis Date */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {t('analysisDate')}
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
                {t('medicalHistory')}
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
                {t('allergies')}
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
                {t('currentMedications')}
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
                {t('notes')}
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
