'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Gift, 
  Check, 
  User,
  Zap,
  Sparkles,
  Calendar
} from 'lucide-react'

interface Customer {
  id: string
  full_name: string
  email?: string
  phone?: string
}

interface GiveCreditsDialogProps {
  customer: Customer
  onCreditsGiven?: (credits: number) => void
  trigger?: React.ReactNode
}

export function GiveCreditsDialog({ customer, onCreditsGiven, trigger }: GiveCreditsDialogProps) {
  const t = useTranslations('giveCredits')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [creditType, setCreditType] = useState<'analysis' | 'ar' | 'both'>('analysis')
  const [credits, setCredits] = useState('5')
  const [reason, setReason] = useState('')
  const [expiresDays, setExpiresDays] = useState('30')

  const handleGiveCredits = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/credits/give', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          credit_type: creditType,
          credits: parseInt(credits),
          reason: reason || t('defaultReason'),
          expires_days: expiresDays === '0' ? null : parseInt(expiresDays)
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        onCreditsGiven?.(parseInt(credits))
        setTimeout(() => {
          setOpen(false)
          resetForm()
        }, 2000)
      } else {
        console.error('Failed to give credits:', data.error)
        alert(data.error || t('error'))
      }
    } catch (error) {
      console.error('Error giving credits:', error)
      alert(t('generalError'))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSuccess(false)
    setCreditType('analysis')
    setCredits('5')
    setReason('')
    setExpiresDays('30')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Gift className="h-4 w-4" />
            {t('trigger')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        {!success ? (
          <div className="space-y-4 py-4">
            {/* Customer Info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">{customer.full_name}</p>
                <p className="text-sm text-slate-500">{customer.email || customer.phone}</p>
              </div>
            </div>

            {/* Credit Type */}
            <div className="space-y-2">
              <Label>{t('typeLabel')}</Label>
              <Select value={creditType} onValueChange={(v) => setCreditType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analysis">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      {t('types.analysis')}
                    </div>
                  </SelectItem>
                  <SelectItem value="ar">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      {t('types.ar')}
                    </div>
                  </SelectItem>
                  <SelectItem value="both">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-green-600" />
                      {t('types.both')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Number of Credits */}
            <div className="space-y-2">
              <Label>{t('amountLabel')}</Label>
              <Select value={credits} onValueChange={setCredits}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['1', '3', '5', '10', '20'].map(val => (
                    <SelectItem key={val} value={val}>{t('times', { count: val })}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('expiryLabel')}
              </Label>
              <Select value={expiresDays} onValueChange={setExpiresDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['7', '14', '30', '60', '90'].map(val => (
                    <SelectItem key={val} value={val}>{t('expiryOptions.days', { count: val })}</SelectItem>
                  ))}
                  <SelectItem value="0">{t('expiryOptions.never')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>{t('noteLabel')}</Label>
              <Textarea
                placeholder={t('notePlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>

            {/* Warning */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <p>{t('warning', { count: credits })}</p>
            </div>

            <Button 
              className="w-full" 
              onClick={handleGiveCredits}
              disabled={loading}
            >
              {loading ? t('buttonLoading') : t('button', { count: credits })}
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-600 mb-2">{t('success')}</h3>
            <p className="text-slate-600">
              {customer.full_name} {t('successMessageSuffix', { count: credits })}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default GiveCreditsDialog
