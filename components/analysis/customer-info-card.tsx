'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Calendar, User, Droplet, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { th, enUS } from 'date-fns/locale'
import type { CustomerInfo } from '@/types/supabase'

interface CustomerInfoCardProps {
  customerInfo: CustomerInfo
  analysisDate: string
  isBaseline?: boolean
  locale?: 'th' | 'en'
  className?: string
}

export function CustomerInfoCard({
  customerInfo,
  analysisDate,
  isBaseline = false,
  locale = 'en',
  className = '',
}: CustomerInfoCardProps) {
  const t = useTranslations('customerInfoCard');
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
            <p className="font-semibold">{customerInfo.name}</p>
          </div>

          {/* Age */}
          {customerInfo.age && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t('age')}
              </Label>
              <p className="font-semibold">
                {customerInfo.age} {t('years')}
              </p>
            </div>
          )}

          {/* Gender */}
          {customerInfo.gender && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t('gender')}
              </Label>
              <p className="font-semibold">
                {t(customerInfo.gender as any)}
              </p>
            </div>
          )}

          {/* Skin Type */}
          {customerInfo.skinType && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Droplet className="h-3 w-3" />
                {t('skinType')}
              </Label>
              <Badge variant="outline" className="font-semibold">
                {t(customerInfo.skinType as any)}
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

          {/* Aesthetic History */}
          {customerInfo.aestheticHistory && customerInfo.aestheticHistory.length > 0 && (
            <div className="col-span-full space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {t('aestheticHistory')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {customerInfo.aestheticHistory.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Allergies */}
          {customerInfo.allergies && customerInfo.allergies.length > 0 && (
            <div className="col-span-full space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-destructive" />
                {t('allergies')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {customerInfo.allergies.map((item) => (
                  <Badge key={item} variant="destructive">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Current Medications */}
          {customerInfo.currentMedications && customerInfo.currentMedications.length > 0 && (
            <div className="col-span-full space-y-2">
              <Label className="text-xs text-muted-foreground">
                {t('currentMedications')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {customerInfo.currentMedications.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {customerInfo.notes && (
            <div className="col-span-full space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t('notes')}
              </Label>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {customerInfo.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
