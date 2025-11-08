"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Trash2, Loader2 } from "lucide-react"

type Treatment = {
  name: string
  price: number
  sessions: number
  description?: string
}

type Proposal = {
  id: string
  lead_id: string
  title: string
  treatments: Treatment[]
  subtotal: number
  discount_percent: number
  discount_amount: number
  total_value: number
  valid_until?: string
  payment_terms?: string
  terms_and_conditions?: string
  notes?: string
}

type Lead = {
  id: string
  name: string
  email: string
}

type ProposalModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editProposal?: Proposal | null
  leads?: Lead[]
}

export function ProposalModal({ open, onClose, onSuccess, editProposal, leads = [] }: ProposalModalProps) {
  const [loading, setLoading] = useState(false)
  
  // Form fields
  const [leadId, setLeadId] = useState("")
  const [title, setTitle] = useState("")
  const [treatments, setTreatments] = useState<Treatment[]>([
    { name: "", price: 0, sessions: 1, description: "" }
  ])
  const [discountPercent, setDiscountPercent] = useState(0)
  const [validUntil, setValidUntil] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [termsAndConditions, setTermsAndConditions] = useState("")
  const [notes, setNotes] = useState("")

  // Calculate totals
  const subtotal = treatments.reduce((sum, t) => sum + (t.price * t.sessions), 0)
  const discountAmount = (subtotal * discountPercent) / 100
  const totalValue = subtotal - discountAmount

  // Pre-fill form when editing
  useEffect(() => {
    if (editProposal) {
      setLeadId(editProposal.lead_id)
      setTitle(editProposal.title)
      setTreatments(editProposal.treatments.length > 0 ? editProposal.treatments : [{ name: "", price: 0, sessions: 1, description: "" }])
      setDiscountPercent(editProposal.discount_percent || 0)
      setValidUntil(editProposal.valid_until?.split('T')[0] || "")
      setPaymentTerms(editProposal.payment_terms || "")
      setTermsAndConditions(editProposal.terms_and_conditions || "")
      setNotes(editProposal.notes || "")
    } else {
      resetForm()
    }
  }, [editProposal, open])

  const resetForm = () => {
    setLeadId("")
    setTitle("")
    setTreatments([{ name: "", price: 0, sessions: 1, description: "" }])
    setDiscountPercent(0)
    setValidUntil("")
    setPaymentTerms("")
    setTermsAndConditions("")
    setNotes("")
  }

  const handleAddTreatment = () => {
    setTreatments([...treatments, { name: "", price: 0, sessions: 1, description: "" }])
  }

  const handleRemoveTreatment = (index: number) => {
    if (treatments.length > 1) {
      setTreatments(treatments.filter((_, i) => i !== index))
    }
  }

  const handleTreatmentChange = (index: number, field: keyof Treatment, value: string | number) => {
    const updated = [...treatments]
    updated[index] = { ...updated[index], [field]: value }
    setTreatments(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!leadId || !title) {
      toast.error('กรุณาเลือก Lead และกรอกชื่อ Proposal')
      return
    }

    if (treatments.some(t => !t.name || t.price <= 0)) {
      toast.error('กรุณากรอกข้อมูลการรักษาให้ครบถ้วน')
      return
    }

    setLoading(true)

    try {
      const url = editProposal 
        ? `/api/sales/proposals/${editProposal.id}`
        : '/api/sales/proposals'
      
      const method = editProposal ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          title,
          treatments,
          subtotal,
          discount_percent: discountPercent,
          discount_amount: discountAmount,
          total_value: totalValue,
          valid_until: validUntil || null,
          payment_terms: paymentTerms || null,
          terms_and_conditions: termsAndConditions || null,
          notes: notes || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save proposal')
      }

      toast.success(editProposal ? 'อัพเดท proposal สำเร็จ!' : 'สร้าง proposal สำเร็จ!')
      resetForm()
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving proposal:', error)
      toast.error('ไม่สามารถบันทึก proposal ได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editProposal ? 'แก้ไข Proposal' : 'สร้าง Proposal ใหม่'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lead Selection */}
          <div className="space-y-2">
            <Label htmlFor="lead">Lead *</Label>
            <Select
              value={leadId}
              onValueChange={setLeadId}
              disabled={!!editProposal}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name} ({lead.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">ชื่อ Proposal *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น แผนการรักษาสิว 3 เดือน"
              required
            />
          </div>

          {/* Treatments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>การรักษา *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTreatment}
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มการรักษา
              </Button>
            </div>

            {treatments.map((treatment, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ชื่อการรักษา *</Label>
                        <Input
                          value={treatment.name}
                          onChange={(e) => handleTreatmentChange(index, 'name', e.target.value)}
                          placeholder="เช่น Laser Treatment"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ราคาต่อครั้ง (฿) *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={treatment.price}
                          onChange={(e) => handleTreatmentChange(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>จำนวนครั้ง *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={treatment.sessions}
                          onChange={(e) => handleTreatmentChange(index, 'sessions', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>รวม</Label>
                        <Input
                          value={`฿${(treatment.price * treatment.sessions).toLocaleString()}`}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>รายละเอียด</Label>
                      <Textarea
                        value={treatment.description}
                        onChange={(e) => handleTreatmentChange(index, 'description', e.target.value)}
                        placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                        rows={2}
                      />
                    </div>

                    {treatments.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveTreatment(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        ลบการรักษานี้
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pricing Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>ยอดรวม:</span>
                <span className="font-medium">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm items-center gap-4">
                <span>ส่วนลด:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                  <span className="text-sm">%</span>
                  <span className="font-medium text-red-600">-฿{discountAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>ยอดสุทธิ:</span>
                <span className="text-primary">฿{totalValue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validUntil">ใช้ได้ถึงวันที่</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">เงื่อนไขการชำระเงิน</Label>
              <Input
                id="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="เช่น ชำระเต็มจำนวน, แบ่ง 3 งวด"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">ข้อกำหนดและเงื่อนไข</Label>
            <Textarea
              id="terms"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder="ข้อกำหนดและเงื่อนไข..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม (internal use)"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editProposal ? 'บันทึกการแก้ไข' : 'สร้าง Proposal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
