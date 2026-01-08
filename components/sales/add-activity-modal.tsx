"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Phone, Mail, Users, FileText } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface AddActivityModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  leadId: string
  activityType?: string
}

export function AddActivityModal({ open, onClose, onSuccess, leadId, activityType }: AddActivityModalProps) {
  const t = useTranslations()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: activityType || 'note',
    title: '',
    description: '',
    scheduled_at: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/sales/leads/${leadId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('salesLeadDetail.messages.interactionError'))
      }

      toast.success(t('salesLeadDetail.messages.interactionSuccess'))
      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        type: activityType || 'note',
        title: '',
        description: '',
        scheduled_at: '',
      })
    } catch (error) {
      console.error('Error adding activity:', error)
      toast.error(error instanceof Error ? error.message : t('salesLeadDetail.messages.interactionError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('salesLeadDetail.addInteraction')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Activity Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">{t('salesLeadDetail.dialog.type')}</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{t('salesLeadDetail.dialog.types.call')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{t('salesLeadDetail.dialog.types.email')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="meeting">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{t('salesLeadDetail.dialog.types.meeting')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="note">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{t('salesLeadDetail.dialog.types.note')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">{t('salesLeadDetail.dialog.subject')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('salesLeadDetail.dialog.subjectPlaceholder')}
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">{t('salesLeadDetail.dialog.descriptionLabel')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('salesLeadDetail.dialog.descriptionPlaceholder')}
                rows={4}
              />
            </div>

            {/* Scheduled At (optional) */}
            <div className="grid gap-2">
              <Label htmlFor="scheduled_at">{t('salesLeadDetail.followUpDate')} ({t('common.optional')})</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
