"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Copy, 
  Mail, 
  MessageSquare, 
  Share2, 
  Check,
  Loader2,
  QrCode,
  Clock,
  Link as LinkIcon,
  X,
  ShieldCheck,
  Zap,
  Target
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { generateQRCodeUrl } from "@/lib/utils/report-sharing"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysisId: string
  centerName: string
  centerLogoUrl?: string
  onShareCreated?: (shareUrl: string) => void
}

export function ShareDialog({
  open,
  onOpenChange,
  analysisId,
  centerName,
  centerLogoUrl,
  onShareCreated,
}: ShareDialogProps) {
  const t = useTranslations('shareDialog');
  const [isLoading, setIsLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  type ExpiryOption = '7' | '30' | '90' | 'never'
  const [expiryDays, setExpiryDays] = useState<ExpiryOption>('7')
  const [recipientEmail, setRecipientEmail] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const handleCreateShare = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/analysis/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisId,
          expiry_days: expiryDays === "never" ? null : parseInt(expiryDays),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || t('loadError' as any) || "Sync Failure")
      }

      const result = await response.json()
      setShareUrl(result.data.share_url)
      onShareCreated?.(result.data.share_url)
      
      toast.success(t('linkCopied' as any) || "Secure link generated")
    } catch (error) {
      console.error('[ShareDialog] Error creating share link:', error)
      toast.error(error instanceof Error ? error.message : (t('loadError' as any) || "Load Error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t('linkCopied' as any) || "Link committed to clipboard")
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('[ShareDialog] Error copying link:', error)
      toast.error(t('loadError' as any) || "Copy failure")
    }
  }

  const handleSendEmail = async () => {
    if (!shareUrl || !recipientEmail) {
      toast.error(t('recipientEmail' as any) || "Email required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/analysis/share/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          share_url: shareUrl,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          message: message,
        }),
      })

      if (!response.ok) {
        throw new Error(t('loadError' as any) || "Transmission Failure")
      }

      toast.success((t('sendEmail' as any) || "Email transmitted to") + ` ${recipientEmail}`)
      setRecipientEmail("")
      setRecipientName("")
      setMessage("")
    } catch (error) {
      console.error('[ShareDialog] Error sending email:', error)
      toast.error(t('loadError' as any) || "Send failure")
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareLine = () => {
    if (!shareUrl) return
    const lineMessage = (t('lineMessage' as any || 'Precision Report from {name}').replace('{name}', centerName)) + `\n${shareUrl}`
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(lineMessage)}`
    window.open(lineUrl, '_blank')
  }

  const handleClose = () => {
    setShareUrl(null)
    setRecipientEmail("")
    setRecipientName("")
    setMessage("")
    setCopied(false)
    setShowQR(false)
    onOpenChange(false)
  }

  const expiryTextMap = {
    "7": t('expiry7' as any) || '7 DAYS',
    "30": t('expiry30' as any) || '30 DAYS',
    "90": t('expiry90' as any) || '90 DAYS',
    "never": t('expiryNever' as any) || 'PERMANENT'
  } as const

  const expiryText = expiryTextMap[expiryDays] || '7 DAYS'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white border-slate-100 rounded-[4rem] p-0 overflow-hidden shadow-premium selection:bg-pink-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
        
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header interface */}
          <div className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-start justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className="h-20 w-20 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm relative overflow-hidden group/logo">
                {centerLogoUrl ? (
                  <Image src={centerLogoUrl} alt={centerName} fill className="object-contain p-2 group-hover/logo:scale-110 transition-transform duration-700" />
                ) : (
                  <Share2 className="h-8 w-8 text-pink-600 animate-pulse" />
                )}
              </div>
              <div className="space-y-3">
                <DialogTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('title' as any) || 'Secure_Node_Sharing'}</DialogTitle>
                <DialogDescription className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight max-w-sm">
                  {t('description' as any) || 'Authorize biological diagnostic access via secure encrypted link.'}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-12 w-12 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-inner">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <div className="p-10 lg:p-16 space-y-12">
              <AnimatePresence mode="wait">
                {!shareUrl ? (
                  <motion.div 
                    key="setup"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-5 ml-4">
                        <div className="h-8 w-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-pink-600" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('linkExpiry' as any) || 'Temporal_Persistence_Limit'}</h4>
                      </div>
                      
                      <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                        <Select value={expiryDays} onValueChange={(value) => setExpiryDays(value as ExpiryOption)}>
                          <SelectTrigger className="h-16 w-full rounded-xl border-none bg-transparent text-lg font-black italic text-slate-950 focus:ring-0 uppercase tracking-tight">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-premium">
                            <SelectItem value="7" className="text-sm font-bold italic uppercase cursor-pointer">{t('expiry7' as any) || '7_DAYS_CYCLES'}</SelectItem>
                            <SelectItem value="30" className="text-sm font-bold italic uppercase cursor-pointer">{t('expiry30' as any) || '30_DAYS_CYCLES'}</SelectItem>
                            <SelectItem value="90" className="text-sm font-bold italic uppercase cursor-pointer">{t('expiry90' as any) || '90_DAYS_CYCLES'}</SelectItem>
                            <SelectItem value="never" className="text-sm font-bold italic uppercase cursor-pointer">{t('expiryNever' as any) || 'PERMANENT_STAMP'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium italic px-4">
                        {t('expireAfter' as any || 'Access token will terminate after {period}').replace('{period}', expiryText)}
                      </p>
                    </div>

                    <Button 
                      size="xl"
                      onClick={handleCreateShare} 
                      disabled={isLoading}
                      className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white border-none shadow-2xl transition-all hover:bg-pink-600 active:scale-95 italic font-black text-xs uppercase tracking-[0.3em] group/btn relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                      {isLoading ? <Loader2 className="mr-4 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />}
                      {isLoading ? 'AUTHORIZING...' : (t('createLink' as any) || 'Initialize_Secure_Link')}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="shared"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-12"
                  >
                    {/* Share URL interface interface */}
                    <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner space-y-8 relative overflow-hidden group/link">
                      <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover/link:scale-110 transition-transform duration-1000">
                        <LinkIcon className="w-24 h-24 text-blue-600" />
                      </div>
                      <div className="flex items-center gap-5 ml-4">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                          <LinkIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('shareLink' as any) || 'Encrypted_Access_Vector'}</h4>
                      </div>
                      <div className="flex gap-4 relative z-10">
                        <div className="flex-1 h-16 rounded-2xl border border-slate-200 bg-white px-8 flex items-center overflow-hidden">
                          <span className="font-mono text-sm text-slate-500 truncate">{shareUrl}</span>
                        </div>
                        <Button 
                          onClick={handleCopyLink}
                          variant="premium"
                          className="h-16 w-16 rounded-2xl shrink-0 bg-slate-950 text-white shadow-xl hover:bg-blue-600 transition-all border-none"
                        >
                          {copied ? <Check className="h-6 w-6 text-emerald-400" /> : <Copy className="h-6 w-6" />}
                        </Button>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-full text-[9px] font-black italic uppercase tracking-widest shadow-sm">
                        {t('expireAfter' as any || 'Validity: {period}').replace('{period}', expiryText)}
                      </Badge>
                    </div>

                    {/* Quick Action matrix interface */}
                    <div className="grid grid-cols-2 gap-8">
                      <Button
                        onClick={handleShareLine}
                        variant="outline"
                        size="xl"
                        className="h-20 rounded-[2.5rem] border-emerald-100 bg-emerald-50/20 text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-sm hover:bg-emerald-50 transition-all group/line"
                      >
                        <MessageSquare className="mr-4 h-6 w-6 group-hover/line:scale-110 transition-transform" />
                        {t('shareViaLine' as any) || 'LINE_SYNC'}
                      </Button>
                      <Button
                        onClick={() => setShowQR(!showQR)}
                        variant="outline"
                        size="xl"
                        className={cn(
                          "h-20 rounded-[2.5rem] border-slate-200 bg-white font-black uppercase tracking-[0.2em] text-[10px] italic shadow-sm transition-all group/qr",
                          showQR ? "bg-pink-50 border-pink-100 text-pink-600" : "text-slate-950 hover:bg-slate-50"
                        )}
                      >
                        <QrCode className="mr-4 h-6 w-6 group-hover/qr:rotate-12 transition-transform" />
                        {showQR ? (t('hideQR' as any) || 'CLOSE_VOXEL') : (t('showQR' as any) || 'GENERATE_VOXEL')}
                      </Button>
                    </div>

                    {/* Voxel interface interface */}
                    <AnimatePresence>
                      {showQR && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex justify-center p-12 bg-slate-50 border border-slate-100 rounded-[4rem] shadow-inner relative overflow-hidden group/voxel"
                        >
                          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />
                          <div className="text-center space-y-10 relative z-10">
                            <div className="p-8 bg-white rounded-[3rem] shadow-premium inline-block border-4 border-slate-100 group-hover/voxel:border-pink-100 transition-all duration-1000">
                              <Image
                                src={generateQRCodeUrl(shareUrl, 250)}
                                alt="Voxel Code"
                                width={250}
                                height={250}
                                className="rounded-2xl"
                              />
                            </div>
                            <div className="space-y-3">
                              <p className="text-[11px] font-black text-slate-950 uppercase tracking-[0.4em] italic">{t('scanToView' as any) || 'VISUAL_NODE_SCAN'}</p>
                              <div className="flex items-center gap-3 justify-center text-pink-600">
                                <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shadow-glow-pink" />
                                <span className="text-[9px] font-black uppercase tracking-widest italic">Precision_Payload_Ready</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Email Transmission interface interface */}
                    <div className="space-y-8 pt-12 border-t border-slate-50">
                      <div className="flex items-center gap-5 ml-4">
                        <div className="h-8 w-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-purple-600" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('sendViaEmail' as any) || 'Neural_Email_Transmission'}</h4>
                      </div>
                      
                      <div className="grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">{t('recipientName' as any) || 'NODE_NAME'}</Label>
                            <Input
                              placeholder="Entity Identity..."
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              className="h-14 rounded-xl border-slate-100 bg-slate-50/50 px-6 focus:ring-pink-500/10 focus:border-pink-500/30 italic font-medium"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">{t('recipientEmail' as any) || 'PROTOCOL_ADDRESS'}</Label>
                            <Input
                              type="email"
                              placeholder="node@precision.ai"
                              value={recipientEmail}
                              onChange={(e) => setRecipientEmail(e.target.value)}
                              className="h-14 rounded-xl border-slate-100 bg-slate-50/50 px-6 focus:ring-pink-500/10 focus:border-pink-500/30 italic font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">{t('personalMessage' as any) || 'CUSTOM_HEURISTIC_MESSAGE'}</Label>
                          <Textarea
                            placeholder="Initialize personalized protocol briefing..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="rounded-2xl border-slate-100 bg-slate-50/50 p-6 focus:ring-pink-500/10 focus:border-pink-500/30 italic font-medium resize-none"
                          />
                        </div>

                        <Button
                          onClick={handleSendEmail}
                          disabled={!recipientEmail || isLoading}
                          size="xl"
                          variant="premium"
                          className="w-full h-18 rounded-2xl bg-slate-950 text-white shadow-2xl hover:bg-purple-600 transition-all border-none font-black text-[10px] uppercase tracking-[0.3em] italic group/mail relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/mail:translate-x-[100%] transition-transform duration-1000" />
                          {isLoading ? <Loader2 className="mr-4 h-5 w-5 animate-spin" /> : <Zap className="mr-4 h-5 w-5 group-hover:scale-110 transition-transform" />}
                          {isLoading ? 'TRANSMITTING...' : (t('sendEmail' as any) || 'Initialize_Transmission')}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer interface interface */}
          <div className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-10 shrink-0">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <Target className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">
                {t('poweredBy' as any || 'Powered by {name} Neural-Grid').replace('{name}', centerName)}
              </p>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm group/all">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
                <span className="text-[9px] font-black text-slate-950 uppercase tracking-[0.3em] italic group-hover/all:text-emerald-600 transition-colors">INFRASTRUCTURE_SECURE</span>
              </div>
              <Button 
                variant="outline" 
                size="xl" 
                onClick={handleClose} 
                className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-rose-600 font-black uppercase tracking-widest text-[10px] italic shadow-sm hover:bg-rose-50 transition-all group/abort"
              >
                <X className="mr-3 h-4 w-4 group-hover/abort:rotate-90 transition-transform" />
                {t('close' as any) || 'Terminate_Session'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
