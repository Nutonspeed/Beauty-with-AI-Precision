'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
  Link2, 
  Copy, 
  Check, 
  Send,
  Clock,
  User
} from 'lucide-react'

interface ScanLink {
  id: string
  code: string
  url: string
  expires_at: string | null
  max_uses: number
  customer_name?: string
  customer_phone?: string
}

interface CreateScanLinkProps {
  onLinkCreated?: (link: ScanLink) => void
}

export function CreateScanLink({ onLinkCreated }: CreateScanLinkProps) {
  const t = useTranslations('salesQuickScan.createLink')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [createdLink, setCreatedLink] = useState<ScanLink | null>(null)
  const [copied, setCopied] = useState(false)
  
  // Form state
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [expiresHours, setExpiresHours] = useState('24')
  const [maxUses, setMaxUses] = useState('1')

  const handleCreate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/scan-link/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName || undefined,
          customer_phone: customerPhone || undefined,
          customer_email: customerEmail || undefined,
          expires_hours: parseInt(expiresHours),
          max_uses: parseInt(maxUses)
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.link) {
        setCreatedLink(data.link)
        onLinkCreated?.(data.link)
      } else {
        console.error('Failed to create link:', data.error)
      }
    } catch (error) {
      console.error('Error creating link:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (createdLink?.url) {
      await navigator.clipboard.writeText(createdLink.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareViaLine = () => {
    if (createdLink?.url) {
      const message = customerName 
        ? t('shareMessageWithName', { name: customerName, url: createdLink.url })
        : t('shareMessage', { url: createdLink.url })
      window.open(`https://line.me/R/share?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  const resetForm = () => {
    setCreatedLink(null)
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setExpiresHours('24')
    setMaxUses('1')
    setCopied(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Link2 className="h-4 w-4" />
          {t('trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-600" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        {!createdLink ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('customerNameLabel')}
              </Label>
              <Input
                id="customer_name"
                placeholder={t('customerNamePlaceholder')}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">{t('customerPhoneLabel')}</Label>
              <Input
                id="customer_phone"
                placeholder="08x-xxx-xxxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t('expiresInLabel')}
                </Label>
                <Select value={expiresHours} onValueChange={setExpiresHours}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 {t('hours')}</SelectItem>
                    <SelectItem value="6">6 {t('hours')}</SelectItem>
                    <SelectItem value="24">24 {t('hours')}</SelectItem>
                    <SelectItem value="72">3 {t('days')}</SelectItem>
                    <SelectItem value="168">7 {t('days')}</SelectItem>
                    <SelectItem value="0">{t('noExpiry')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('maxUsesLabel')}</Label>
                <Select value={maxUses} onValueChange={setMaxUses}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 {t('times')}</SelectItem>
                    <SelectItem value="3">3 {t('times')}</SelectItem>
                    <SelectItem value="5">5 {t('times')}</SelectItem>
                    <SelectItem value="10">10 {t('times')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              className="w-full mt-4" 
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? t('creating') : t('createButton')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">{t('successTitle')}</span>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-slate-500 mb-1">{t('linkLabel')}:</p>
                  <p className="text-sm font-mono break-all text-blue-600">{createdLink.url}</p>
                </div>

                {createdLink.expires_at && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t('expiresAt')}: {new Date(createdLink.expires_at).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? t('copied') : t('copy')}
              </Button>
              
              <Button 
                variant="default"
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={shareViaLine}
              >
                <Send className="h-4 w-4" />
                {t('shareLine')}
              </Button>
            </div>

            <Button 
              variant="ghost" 
              className="w-full"
              onClick={resetForm}
            >
              {t('createNew')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreateScanLink
