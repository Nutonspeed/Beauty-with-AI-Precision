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
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface Lead {
  id?: string
  name: string
  email: string
  phone?: string
  status: string
  source: string
  concern?: string
  budget_min?: number
  budget_max?: number
  preferred_date?: string
  score: number
  notes?: string
  tags?: string[]
}

interface AddLeadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editLead?: Lead | null
}

export function AddLeadModal({ open, onClose, onSuccess, editLead }: AddLeadModalProps) {
  const t = useTranslations()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Lead>({
    name: editLead?.name || "",
    email: editLead?.email || "",
    phone: editLead?.phone || "",
    status: editLead?.status || "cold",
    source: editLead?.source || "website",
    concern: editLead?.concern || "",
    budget_min: editLead?.budget_min || undefined,
    budget_max: editLead?.budget_max || undefined,
    preferred_date: editLead?.preferred_date || "",
    score: editLead?.score || 0,
    notes: editLead?.notes || "",
    tags: editLead?.tags || [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editLead ? `/api/sales/leads/${editLead.id}` : '/api/sales/leads'
      const method = editLead ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('salesLeads.modal.saveError'))
      }

      toast.success(editLead ? t('salesLeads.modal.updateSuccess') : t('salesLeads.modal.createSuccess'))
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving lead:', error)
      toast.error(error instanceof Error ? error.message : t('salesLeads.modal.saveError'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Lead, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editLead ? t('salesLeads.modal.editTitle') : t('salesLeads.modal.addTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t('salesLeads.modal.nameLabel')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('salesLeads.modal.namePlaceholder')}
                required
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('salesLeads.modal.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder={t('salesLeads.modal.emailPlaceholder')}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">{t('salesLeads.modal.phoneLabel')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder={t('salesLeads.modal.phonePlaceholder')}
                />
              </div>
            </div>

            {/* Status & Source */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">{t('salesLeads.modal.statusLabel')}</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">🔥 {t('salesLeads.status.hot')}</SelectItem>
                    <SelectItem value="warm">⚡ {t('salesLeads.status.warm')}</SelectItem>
                    <SelectItem value="cold">❄️ {t('salesLeads.status.cold')}</SelectItem>
                    <SelectItem value="contacted">📞 {t('salesLeads.status.contacted')}</SelectItem>
                    <SelectItem value="qualified">✅ {t('salesLeads.status.qualified')}</SelectItem>
                    <SelectItem value="lost">❌ {t('salesLeads.status.lost')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source">{t('salesLeads.modal.sourceLabel')}</Label>
                <Select value={formData.source} onValueChange={(value) => handleChange('source', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">{t('salesLeadDetail.sources.website')}</SelectItem>
                    <SelectItem value="facebook">{t('salesLeadDetail.sources.facebook')}</SelectItem>
                    <SelectItem value="instagram">{t('salesLeadDetail.sources.instagram')}</SelectItem>
                    <SelectItem value="google_ads">{t('salesLeadDetail.sources.google_ads')}</SelectItem>
                    <SelectItem value="referral">{t('salesLeadDetail.sources.referral')}</SelectItem>
                    <SelectItem value="walk_in">{t('salesLeadDetail.sources.walk_in')}</SelectItem>
                    <SelectItem value="other">{t('salesLeadDetail.sources.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Concern */}
            <div className="grid gap-2">
              <Label htmlFor="concern">{t('salesLeads.modal.concernLabel')}</Label>
              <Input
                id="concern"
                value={formData.concern}
                onChange={(e) => handleChange('concern', e.target.value)}
                placeholder={t('salesLeads.modal.concernPlaceholder')}
              />
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budget_min">{t('salesLeads.modal.budgetMinLabel')}</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min || ''}
                  onChange={(e) => handleChange('budget_min', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="10000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget_max">{t('salesLeads.modal.budgetMaxLabel')}</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max || ''}
                  onChange={(e) => handleChange('budget_max', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="50000"
                />
              </div>
            </div>

            {/* Preferred Date & Score */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="preferred_date">{t('salesLeads.modal.preferredDateLabel')}</Label>
                <Input
                  id="preferred_date"
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => handleChange('preferred_date', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="score">{t('salesLeads.modal.scoreLabel')}</Label>
                <Input
                  id="score"
                  type="number"
                  value={formData.score}
                  onChange={(e) => handleChange('score', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">{t('salesLeads.modal.notesLabel')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t('salesLeads.modal.notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('salesLeads.modal.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editLead ? t('salesLeads.modal.save') : t('salesLeads.modal.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
