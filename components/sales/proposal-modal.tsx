"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
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

export type Program = {
  name: string
  price: number
  sessions: number
  description: string
}

export type Proposal = {
  id: string
  lead_id: string
  title: string
  programs: Program[]
  subtotal: number
  discount_percent: number
  discount_amount: number
  total_value: number
  valid_until: string | null
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  payment_terms: string | null
  notes: string | null
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
  const t = useTranslations()
  const [loading, setLoading] = useState(false)
  
  // Form fields
  const [leadId, setLeadId] = useState("")
  const [title, setTitle] = useState("")
  const [programs, setPrograms] = useState<Program[]>([
    { name: "", price: 0, sessions: 1, description: "" }
  ])
  const [discountPercent, setDiscountPercent] = useState(0)
  const [validUntil, setValidUntil] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [notes, setNotes] = useState("")
  const [termsAndConditions, setTermsAndConditions] = useState("")

  // Calculate totals
  const subtotal = programs.reduce((sum, t) => sum + (t.price * t.sessions), 0)
  const discountAmount = (subtotal * discountPercent) / 100
  const totalValue = subtotal - discountAmount

  // Pre-fill form when editing
  useEffect(() => {
    if (editProposal) {
      setLeadId(editProposal.lead_id)
      setTitle(editProposal.title)
      setPrograms(editProposal.programs.length > 0 ? editProposal.programs : [{ name: "", price: 0, sessions: 1, description: "" }])
      setDiscountPercent(editProposal.discount_percent || 0)
      setValidUntil(editProposal.valid_until?.split('T')[0] || "")
      setPaymentTerms(editProposal.payment_terms || "")
      setNotes(editProposal.notes || "")
    } else {
      resetForm()
    }
  }, [editProposal, open])

  const resetForm = () => {
    setLeadId("")
    setTitle("")
    setPrograms([{ name: "", price: 0, sessions: 1, description: "" }])
    setDiscountPercent(0)
    setValidUntil("")
    setPaymentTerms("")
    setNotes("")
  }

  const addProgram = () => {
    setPrograms([...programs, { name: "", price: 0, sessions: 1, description: "" }])
  }

  const removeProgram = (index: number) => {
    if (programs.length > 1) {
      const updated = [...programs]
      updated.splice(index, 1)
      setPrograms(updated)
    }
  }

  const updateProgram = (index: number, field: keyof Program, value: any) => {
    const updated = [...programs]
    updated[index] = { ...updated[index], [field]: value }
    setPrograms(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!leadId || !title) {
      toast.error(t('salesTools.proposalModal.validation.leadAndTitle'))
      return
    }

    if (programs.some(t => !t.name || t.price <= 0)) {
      toast.error(t('salesTools.proposalModal.validation.programDetails'))
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
          programs,
          subtotal,
          discount_percent: discountPercent,
          discount_amount: discountAmount,
          total_value: totalValue,
          valid_until: validUntil || null,
          payment_terms: paymentTerms || null,
          notes: notes || null,
          terms_and_conditions: termsAndConditions || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save proposal')
      }

      toast.success(editProposal ? t('salesTools.proposalModal.messages.updateSuccess') : t('salesTools.proposalModal.messages.createSuccess'))
      resetForm()
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving proposal:', error)
      toast.error(t('salesTools.proposalModal.messages.saveError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editProposal ? t('salesTools.proposalModal.titleEdit') : t('salesTools.proposalModal.titleCreate')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lead Selection */}
          <div className="space-y-2">
            <Label htmlFor="lead">{t('salesTools.proposalModal.leadLabel')}</Label>
            <Select
              value={leadId}
              onValueChange={setLeadId}
              disabled={!!editProposal}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('salesTools.proposalModal.leadPlaceholder')} />
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
            <Label htmlFor="title">{t('salesTools.proposalModal.proposalTitleLabel')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('salesTools.proposalModal.proposalTitlePlaceholder')}
              required
            />
          </div>

          {/* Programs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('salesTools.proposalModal.programsLabel')}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProgram}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('salesTools.proposalModal.addProgram')}
              </Button>
            </div>

            {programs.map((program, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('salesTools.proposalModal.programNameLabel')}</Label>
                        <Input
                          value={program.name}
                          onChange={(e) => updateProgram(index, 'name', e.target.value)}
                          placeholder={t('salesTools.proposalModal.programNamePlaceholder')}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('salesTools.proposalModal.pricePerSessionLabel')}</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={program.price}
                          onChange={(e) => updateProgram(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('salesTools.proposalModal.sessionsLabel')}</Label>
                        <Input
                          type="number"
                          min="1"
                          value={program.sessions}
                          onChange={(e) => updateProgram(index, 'sessions', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('salesTools.proposalModal.totalLabel')}</Label>
                        <Input
                          value={`฿${(program.price * program.sessions).toLocaleString()}`}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('salesTools.proposalModal.detailsLabel')}</Label>
                      <Textarea
                        value={program.description}
                        onChange={(e) => updateProgram(index, 'description', e.target.value)}
                        placeholder={t('salesTools.proposalModal.detailsPlaceholder')}
                        rows={2}
                      />
                    </div>

                    {programs.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProgram(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('salesTools.proposalModal.removeProgram')}
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
                <span>{t('salesTools.proposalModal.subtotal')}</span>
                <span className="font-medium">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm items-center gap-4">
                <span>{t('salesTools.proposalModal.discount')}</span>
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
                <span>{t('salesTools.proposalModal.netTotal')}</span>
                <span className="text-primary">฿{totalValue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validUntil">{t('salesTools.proposalModal.validUntil')}</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">{t('salesTools.proposalModal.paymentTerms')}</Label>
              <Input
                id="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder={t('salesTools.proposalModal.paymentTermsPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">{t('salesTools.proposalModal.termsAndConditions')}</Label>
            <Textarea
              id="terms"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder={t('salesTools.proposalModal.termsPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('salesTools.proposalModal.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('salesTools.proposalModal.notesPlaceholder')}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('salesTools.proposalModal.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editProposal ? t('salesTools.proposalModal.saveChanges') : t('salesTools.proposalModal.createProposal')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
