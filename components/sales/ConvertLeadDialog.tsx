
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserCheck, Loader2, Key, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface ConvertLeadDialogProps {
  lead: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ConvertLeadDialog({ lead, open, onOpenChange, onSuccess }: ConvertLeadDialogProps) {
  const t = useTranslations('salesLeads.convert')
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [convertedData, setConvertedData] = useState<{ email: string; pass: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 6) {
      toast.error(t('errors.passwordTooShort'))
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          create_user_account: true,
          password: password,
          send_welcome_email: false // We handle manual notification
        })
      })

      const data = await response.json()
      if (data.success) {
        setConvertedData({ email: lead.email || '', pass: password })
        toast.success(t('success.message'))
        onSuccess()
      } else {
        toast.error(data.message || t('errors.failed'))
      }
    } catch (error) {
      console.error('Convert error:', error)
      toast.error(t('errors.unexpected'))
    } finally {
      setLoading(false)
    }
  }

  const copyCredentials = () => {
    if (!convertedData) return
    const text = t('copyTemplate', { email: convertedData.email, pass: convertedData.pass })
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(t('success.copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(pass)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#020617] border-white/10 text-white">
        {!convertedData ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold italic flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-pink-500" />
                {t('title', { name: lead.name })}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {t('description')}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleConvert} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('emailLabel')}</Label>
                  <Input 
                    value={lead.email || ''} 
                    disabled 
                    className="bg-white/5 border-white/10 text-slate-400 rounded-xl h-12"
                  />
                  {!lead.email && (
                    <p className="text-[10px] text-red-500 font-bold italic">{t('errors.noEmail')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('passwordLabel')}</Label>
                    <button 
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[10px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1"
                    >
                      <Key className="h-3 w-3" /> {t('randomPassword')}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      className="bg-white/5 border-white/10 text-white rounded-xl h-12 pr-12"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={loading || !lead.email}
                  className="w-full h-14 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-pink-600/20"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <UserCheck className="h-5 w-5 mr-2" />}
                  {t('submitButton')}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="space-y-6 py-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{t('success.title')}</h3>
              <p className="text-sm text-slate-400">{t('success.description')}</p>
            </div>

            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4 text-left">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t('emailLabel')}</p>
                <p className="font-bold text-white italic">{convertedData.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t('passwordLabel')}</p>
                <p className="font-bold text-white italic">{convertedData.pass}</p>
              </div>
            </div>

            <Button 
              onClick={copyCredentials}
              className="w-full h-14 bg-white text-[#020617] hover:bg-slate-200 rounded-xl font-black uppercase tracking-widest"
            >
              {copied ? <Check className="h-5 w-5 mr-2" /> : <Copy className="h-5 w-5 mr-2" />}
              {t('copyButton')}
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full text-slate-500 hover:text-white"
            >
              {t('closeButton')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
