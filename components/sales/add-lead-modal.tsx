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
        throw new Error(result.error || 'Failed to save lead')
      }

      toast.success(editLead ? 'Lead updated successfully!' : 'Lead created successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving lead:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save lead')
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
          <DialogTitle>{editLead ? 'แก้ไข Lead' : 'เพิ่ม Lead ใหม่'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="นาย สมชาย ใจดี"
                required
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="somchai@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">เบอร์โทร</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="081-234-5678"
                />
              </div>
            </div>

            {/* Status & Source */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">สถานะ</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">🔥 Hot</SelectItem>
                    <SelectItem value="warm">⚡ Warm</SelectItem>
                    <SelectItem value="cold">❄️ Cold</SelectItem>
                    <SelectItem value="contacted">📞 Contacted</SelectItem>
                    <SelectItem value="qualified">✅ Qualified</SelectItem>
                    <SelectItem value="lost">❌ Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source">แหล่งที่มา</Label>
                <Select value={formData.source} onValueChange={(value) => handleChange('source', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">🌐 Website</SelectItem>
                    <SelectItem value="facebook">📘 Facebook</SelectItem>
                    <SelectItem value="instagram">📸 Instagram</SelectItem>
                    <SelectItem value="google_ads">🔍 Google Ads</SelectItem>
                    <SelectItem value="referral">👥 Referral</SelectItem>
                    <SelectItem value="walk_in">🚶 Walk-in</SelectItem>
                    <SelectItem value="other">📋 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Concern */}
            <div className="grid gap-2">
              <Label htmlFor="concern">ความสนใจ/ปัญหา</Label>
              <Input
                id="concern"
                value={formData.concern}
                onChange={(e) => handleChange('concern', e.target.value)}
                placeholder="เช่น ฉีดโบท็อกซ์, ลดริ้วรอย, ผิวหน้า"
              />
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budget_min">งบประมาณต่ำสุด (฿)</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min || ''}
                  onChange={(e) => handleChange('budget_min', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="10000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget_max">งบประมาณสูงสุด (฿)</Label>
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
                <Label htmlFor="preferred_date">วันที่สนใจนัดหมาย</Label>
                <Input
                  id="preferred_date"
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => handleChange('preferred_date', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="score">คะแนน Lead (0-100)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={(e) => handleChange('score', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">หมายเหตุ</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="บันทึกข้อมูลเพิ่มเติม..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editLead ? 'บันทึกการแก้ไข' : 'เพิ่ม Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
