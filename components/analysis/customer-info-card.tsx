'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Calendar, User, Droplet, AlertCircle, ShieldCheck, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { th, enUS } from 'date-fns/locale'
import type { CustomerInfo } from '@/types/supabase'
import { cn } from '@/lib/utils'

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
    <Card className={cn("border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden group transition-all duration-700 hover:border-pink-500/20 relative", className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <User className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('title' as any) || 'Identity_Summary'}</CardTitle>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Biometric node profile</p>
            </div>
          </div>
          {isBaseline && (
            <Badge className="bg-emerald-50 text-emerald-600 border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest animate-pulse">
              {t('baselineAnalysis' as any) || 'BASELINE_NODE'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-10 lg:p-12 space-y-10 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Name interface */}
          <div className="space-y-4 group/item">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none group-hover/item:text-pink-600 transition-colors">{t('fullName' as any) || 'ENTITY_NAME'}</Label>
            <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner">
              <User className="h-6 w-6 text-slate-300" />
              <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none">{customerInfo.name}</span>
            </div>
          </div>

          {/* Age interface */}
          {customerInfo.age && (
            <div className="space-y-4 group/item">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none group-hover/item:text-blue-600 transition-colors">{t('age' as any) || 'BIOMETRIC_AGE'}</Label>
              <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner">
                <Calendar className="h-6 w-6 text-slate-300" />
                <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none">{customerInfo.age} {t('years' as any) || 'YRS'}</span>
              </div>
            </div>
          )}

          {/* Gender interface */}
          {customerInfo.gender && (
            <div className="space-y-4 group/item">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none group-hover/item:text-purple-600 transition-colors">{t('gender' as any) || 'GENDER_CLASS'}</Label>
              <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner uppercase">
                <Activity className="h-6 w-6 text-slate-300" />
                <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none">{t(customerInfo.gender as any)}</span>
              </div>
            </div>
          )}

          {/* Skin Type interface */}
          {customerInfo.skinType && (
            <div className="space-y-4 group/item">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none group-hover/item:text-pink-600 transition-colors">{t('skinType' as any) || 'MATRIX_TYPE'}</Label>
              <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner">
                <div className="flex items-center gap-6">
                  <Droplet className="h-6 w-6 text-pink-500/40" />
                  <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none">{t(customerInfo.skinType as any)}</span>
                </div>
                <Badge className="bg-white border-slate-100 text-slate-400 text-[8px] font-black italic shadow-sm uppercase tracking-widest px-3 py-1">IDENTIFIED</Badge>
              </div>
            </div>
          )}

          {/* Analysis Date interface */}
          <div className="space-y-4 group/item">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none group-hover/item:text-blue-600 transition-colors">{t('analysisDate' as any) || 'TEMPORAL_STAMP'}</Label>
            <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner">
              <Clock className="h-6 w-6 text-slate-300" />
              <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none">
                {format(new Date(analysisDate), 'PPP', { locale: dateLocale })}
              </span>
            </div>
          </div>
        </div>

        {/* Aesthetic History interface */}
        {customerInfo.aestheticHistory && customerInfo.aestheticHistory.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-50">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none">{t('aestheticHistory' as any) || 'HISTORICAL_PROTOCOL_NODES'}</Label>
            <div className="flex flex-wrap gap-4">
              {customerInfo.aestheticHistory.map((item) => (
                <Badge key={item} variant="outline" className="rounded-full border-slate-200 bg-white text-slate-500 text-[10px] font-black italic uppercase shadow-sm px-6 py-2 hover:border-pink-500/20 hover:text-pink-600 transition-all cursor-default">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Allergies & Medications interface */}
        {(customerInfo.allergies?.length > 0 || customerInfo.currentMedications?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-slate-50">
            {customerInfo.allergies?.length > 0 && (
              <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-600 ml-4 italic leading-none">{t('allergies' as any) || 'CONTRAINDICATION_LOG'}</Label>
                <div className="flex flex-wrap gap-4">
                  {customerInfo.allergies.map((item) => (
                    <Badge key={item} className="bg-rose-50 text-rose-600 border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest">
                      <AlertCircle className="mr-2 h-3.5 w-3.5" /> {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {customerInfo.currentMedications?.length > 0 && (
              <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 ml-4 italic leading-none">{t('currentMedications' as any) || 'BIO-CHEMICAL_SYNCS'}</Label>
                <div className="flex flex-wrap gap-4">
                  {customerInfo.currentMedications.map((item) => (
                    <Badge key={item} variant="outline" className="bg-blue-50 border-blue-100 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes interface */}
        {customerInfo.notes && (
          <div className="space-y-6 pt-6 border-t border-slate-50 group/notes">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none group-hover/notes:text-slate-950 transition-colors">{t('notes' as any) || 'EXECUTIVE_SUMMARY'}</Label>
            <div className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner group-hover/notes:bg-white group-hover/notes:border-pink-500/20 transition-all duration-700">
              <p className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight group-hover/notes:text-slate-950">
                "{customerInfo.notes}"
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <div className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between rounded-b-[3rem] opacity-40 hover:opacity-100 transition-opacity duration-700">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Identity_Verified: NOMINAL</p>
        </div>
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Registry_Protocol: BIP-ID-v4.8</p>
      </div>
    </Card>
  )
}
