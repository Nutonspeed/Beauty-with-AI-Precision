"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
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
  X
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { generateQRCodeUrl } from "@/lib/utils/report-sharing"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysisId: string
  clinicName: string
  clinicLogoUrl?: string
  onShareCreated?: (shareUrl: string) => void
}

export function ShareDialog({
  open,
  onOpenChange,
  analysisId,
  clinicName,
  clinicLogoUrl,
  onShareCreated,
}: ShareDialogProps) {
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
        throw new Error(error.message || 'Failed to create share link')
      }

      const result = await response.json()
      setShareUrl(result.data.share_url)
      onShareCreated?.(result.data.share_url)
      
      toast.success('Share link created successfully!')
    } catch (error) {
      console.error('[ShareDialog] Error creating share link:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create share link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('[ShareDialog] Error copying link:', error)
      toast.error('Failed to copy link')
    }
  }

  const handleSendEmail = async () => {
    if (!shareUrl || !recipientEmail) {
      toast.error('Please enter recipient email')
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement email sending via API route
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
        throw new Error('Failed to send email')
      }

      toast.success(`Email sent to ${recipientEmail}`)
      setRecipientEmail("")
      setRecipientName("")
      setMessage("")
    } catch (error) {
      console.error('[ShareDialog] Error sending email:', error)
      toast.error('Failed to send email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareLine = () => {
    if (!shareUrl) return

    const lineMessage = `รายงานการวิเคราะห์ผิวหน้าจาก ${clinicName}\n${shareUrl}`
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
    "7": "7 days",
    "30": "30 days",
    "90": "90 days",
    "never": "Never expires"
  } as const

  const expiryText = expiryTextMap[expiryDays] ?? 'the selected period'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {clinicLogoUrl && (
              <Image
                src={clinicLogoUrl}
                alt={clinicName}
                width={40}
                height={40}
                className="rounded-lg"
              />
            )}
            <div>
              <DialogTitle className="text-xl">Share Analysis Report</DialogTitle>
              <DialogDescription>
                Share this report with patients or colleagues
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Create Share Link */}
          {!shareUrl && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="expiry" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Link Expiry
                </Label>
                <Select
                  value={expiryDays}
                  onValueChange={(value) => setExpiryDays(value as ExpiryOption)}
                >
                  <SelectTrigger id="expiry" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days (recommended)</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="never">Never expires</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  The link will expire after {expiryText.toLowerCase()}
                </p>
              </div>

              <Button 
                onClick={handleCreateShare} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Share Link...
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Create Share Link
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Share Options */}
          {shareUrl && (
            <div className="space-y-6">
              {/* Share URL */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <Label className="flex items-center gap-2 mb-2">
                  <LinkIcon className="h-4 w-4" />
                  Share Link
                </Label>
                <div className="flex gap-2">
                  <Input 
                    value={shareUrl} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    onClick={handleCopyLink}
                    variant="outline"
                    size="icon"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Anyone with this link can view the report. {expiryText}.
                </p>
              </div>

              {/* Quick Share Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleShareLine}
                  variant="outline"
                  className="w-full"
                >
                  <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
                  Share via Line
                </Button>
                <Button
                  onClick={() => setShowQR(!showQR)}
                  variant="outline"
                  className="w-full"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  {showQR ? 'Hide' : 'Show'} QR Code
                </Button>
              </div>

              {/* QR Code */}
              {showQR && (
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <div className="text-center">
                    <Image
                      src={generateQRCodeUrl(shareUrl, 250)}
                      alt="QR Code"
                      width={250}
                      height={250}
                      className="rounded-lg"
                    />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Scan to view report
                    </p>
                  </div>
                </div>
              )}

              {/* Email Share Form */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send via Email (Optional)
                </Label>
                
                <div className="space-y-3">
                  <div>
                    <Input
                      type="email"
                      placeholder="Recipient email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      type="text"
                      placeholder="Recipient name (optional)"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Textarea
                      placeholder="Add a personal message (optional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleSendEmail}
                    disabled={!recipientEmail || isLoading}
                    className="w-full"
                    variant="secondary"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Powered by {clinicName}
          </p>
          <Button 
            onClick={handleClose} 
            variant="outline"
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
