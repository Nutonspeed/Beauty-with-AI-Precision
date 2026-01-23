"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { useTranslations } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Loader2,
  Plus,
  Fingerprint,
  Sparkles,
  Brain,
  Zap,
  Target,
  ShieldAlert,
  Lightbulb,
  Trophy,
  Clock,
  Save
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"

import { NeuralNarrativeSynthesis } from '@/components/sales/neural-narrative-synthesis'
import { AestheticSentiment } from '@/components/sales/aesthetic-sentiment'

type SalesLeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'cold' | 'warm' | 'hot'

type SalesLead = {
  id: string
  name: string
  email: string
  phone: string | null
  status: SalesLeadStatus
  score: number
  source: string
  primary_concern: string | null
  interested_programs?: string[] | null
  budget_range_min?: number | null
  budget_range_max?: number | null
  notes: string | null
  next_follow_up_at: string | null
  created_at: string
  metadata?: Record<string, any> | null
  sales_user?: { full_name?: string | null; email?: string | null } | null
}

type LeadActivity = {
  id: string
  type: string
  subject: string
  description: string | null
  created_at: string
}

const updateFormSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost', 'cold', 'warm', 'hot']),
  preferred_date: z.string().optional(),
  notes: z.string().optional(),
})

const interactionFormSchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note', 'task']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().min(1, 'Description is required'),
})

export default function LeadDetailPage() {
  const t = useTranslations()
  const router = useRouter()
  const lp = useLocalizePath()
  const params = useParams()
  const leadId = params.id as string
  const [activities, setActivities] = useState<LeadActivity[]>([])

  const [lead, setLead] = useState<SalesLead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showInteractionDialog, setShowInteractionDialog] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCreatingProposal, setIsCreatingProposal] = useState(false)

  const updateForm = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      status: 'new',
      preferred_date: '',
      notes: '',
    },
  })

  const interactionForm = useForm<z.infer<typeof interactionFormSchema>>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues: {
      type: 'call',
      subject: t('salesLeadDetail.dialog.types.call' as any) || 'Call',
      description: '',
    },
  })

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const roleRes = await fetch('/api/auth/check-role', { headers: { Accept: 'application/json' } })
        if (!roleRes.ok) {
          router.push(lp('/auth/login'))
          return
        }
        const roleData = await roleRes.json()
        if (!['sales_staff', 'center_admin', 'center_owner', 'super_admin'].includes(roleData.role)) {
          router.push(lp('/unauthorized'))
          return
        }
        if (!cancelled) setIsAuthenticated(true)
      } catch (error) {
        console.error('[LeadDetailPage] Authentication error:', error)
        router.push(lp('/auth/login'))
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [router, lp])

  // Fetch lead details
  const fetchLead = useCallback(async () => {
    if (!isAuthenticated) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/sales/leads/${leadId}`)

      if (!response.ok) {
        throw new Error(t('salesLeadDetail.messages.updateError' as any) || 'Error loading lead')
      }

      const result: SalesLead = await response.json()
      setLead(result)

      updateForm.reset({
        status: result.status,
        preferred_date: result.next_follow_up_at ? result.next_follow_up_at.slice(0, 10) : '',
        notes: result.notes || '',
      })

      const actRes = await fetch(`/api/sales/leads/${leadId}/activities`)
      if (actRes.ok) {
        const act = await actRes.json()
        setActivities((act?.data || []) as LeadActivity[])
      }
    } catch (error) {
      console.error('[LeadDetailPage] Error fetching lead:', error)
      toast.error(t('salesLeadDetail.messages.updateError' as any) || 'Error loading lead')
      router.push(lp('/sales/leads'))
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, leadId, updateForm, router, lp, t])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  const handleUpdateLead = async (values: z.infer<typeof updateFormSchema>) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/sales/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error(t('salesLeadDetail.messages.updateError' as any) || 'Error updating lead')
      }

      toast.success(t('salesLeadDetail.messages.updateSuccess' as any) || 'Lead updated successfully')
      fetchLead()
    } catch (error) {
      console.error('[LeadDetailPage] Error updating lead:', error)
      toast.error(t('salesLeadDetail.messages.updateError' as any) || 'Error updating lead')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddInteraction = async (values: z.infer<typeof interactionFormSchema>) => {
    try {
      const response = await fetch(`/api/sales/leads/${leadId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error(t('salesLeadDetail.messages.interactionError' as any) || 'Error adding interaction')
      }

      toast.success(t('salesLeadDetail.messages.interactionSuccess' as any) || 'Interaction added successfully')
      setShowInteractionDialog(false)
      interactionForm.reset({ type: 'call', subject: t('salesLeadDetail.dialog.types.call' as any) || 'Call', description: '' })
      fetchLead()
    } catch (error) {
      console.error('[LeadDetailPage] Error adding interaction:', error)
      toast.error(t('salesLeadDetail.messages.interactionError' as any) || 'Error adding interaction')
    }
  }

  const handleCreateProposal = async () => {
    if (!lead) return
    setIsCreatingProposal(true)
    try {
      const recs = (lead.metadata as any)?.recommendations
      const programsRaw = Array.isArray(recs) ? recs : []
      const programs = programsRaw.length
        ? programsRaw.map((r: any) => ({
            name: r?.title_th || r?.title_en || r?.name || t('common.program' as any) || 'Program',
            price: Number(r?.price || 0),
            sessions: Number(r?.sessions || 1),
            type: r?.type || 'procedure'
          }))
        : [
            {
              name: lead.primary_concern || t('common.program' as any) || 'Program',
              price: lead.budget_range_min || 0,
              sessions: 1,
              type: 'procedure'
            },
          ]

      const subtotal = programs.reduce((sum: number, p: any) => sum + (Number(p.price) || 0), 0)

      const res = await fetch("/api/sales/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          title: t('salesProposalGenerator.generatedTitle' as any) || 'Aesthetic Proposal',
          programs,
          subtotal,
          discount_percent: 0,
          discount_amount: 0,
          total: subtotal,
          status: "draft",
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || t('salesLeadDetail.messages.proposalError' as any) || 'Error creating proposal')
      }

      const proposal = await res.json()
      toast.success(t('salesLeadDetail.messages.proposalSuccess' as any) || 'Proposal created successfully')
      if (proposal?.id) {
        router.push(lp(`/sales/proposals/${proposal.id}`))
      }
    } catch (error) {
      console.error("Create proposal failed:", error)
      toast.error(error instanceof Error ? error.message : t('salesLeadDetail.messages.proposalError' as any) || 'Error creating proposal')
    } finally {
      setIsCreatingProposal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-950">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Decoding Unit Parameters...</p>
        </div>
      </div>
    )
  }

  if (!lead) return null

  const STATUS_CONFIG: Record<SalesLeadStatus, { label: string; color: string }> = {
    new: { label: t('salesLeads.status.new' as any) || 'New', color: "bg-blue-50 text-blue-600" },
    contacted: { label: t('salesLeads.status.contacted' as any) || 'Contacted', color: "bg-purple-50 text-purple-600" },
    qualified: { label: t('salesLeads.status.qualified' as any) || 'Qualified', color: "bg-emerald-50 text-emerald-600" },
    proposal_sent: { label: t('salesLeads.status.proposal_sent' as any) || 'Proposal Sent', color: "bg-indigo-50 text-indigo-600" },
    negotiation: { label: t('salesLeads.status.negotiation' as any) || 'Negotiation', color: "bg-amber-50 text-amber-600" },
    won: { label: t('salesLeads.status.won' as any) || 'Won', color: "bg-emerald-50 text-emerald-600 shadow-glow-emerald/20" },
    lost: { label: t('salesLeads.status.lost' as any) || 'Lost', color: "bg-slate-50 text-slate-400" },
    cold: { label: t('salesLeads.status.cold' as any) || 'Cold', color: "bg-slate-50 text-slate-400" },
    warm: { label: t('salesLeads.status.warm' as any) || 'Warm', color: "bg-orange-50 text-orange-600" },
    hot: { label: t('salesLeads.status.hot' as any) || 'Hot', color: "bg-rose-50 text-rose-600 shadow-glow-rose/20" },
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Detail Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600" onClick={() => router.push(lp('/sales/leads'))}>
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Fingerprint className="mr-3 h-3.5 w-3.5" />
                  Unit Precision Analysis
                </Badge>
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                  {lead.name}<br />
                  <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl">NODE_ID: {lead.id.substring(0, 8)}</span>
                </h1>
              </div>
            </motion.div>
            
            <div className="flex flex-wrap gap-6 shrink-0">
              <Button size="xl" variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-slate-50 italic shadow-premium" onClick={() => setShowInteractionDialog(true)}>
                <Plus className="mr-3 h-5 w-5" />
                Add Interaction
              </Button>
              <Button size="xl" variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-slate-50 italic shadow-premium" onClick={handleCreateProposal} disabled={isCreatingProposal}>
                {isCreatingProposal ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <Plus className="mr-3 h-4 w-4" />}
                Generate Schema
              </Button>
              {lead.status !== 'won' && (
                <Button size="xl" variant="premium" className="h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={async () => {
                  try {
                    const res = await fetch(`/api/sales/leads/${leadId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'won' }),
                    })
                    if (!res.ok) throw new Error('Failed')
                    toast.success(t('salesLeadDetail.wonSuccess' as any) || 'Lead won successfully')
                    fetchLead()
                  } catch {
                    toast.error(t('salesLeadDetail.wonError' as any) || 'Error updating lead')
                  }
                }}>
                  <CheckCircle className="mr-3 h-5 w-5" />
                  Authorize Win
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Operational Column */}
            <div className="lg:col-span-8 space-y-12">
              {/* Intelligence Summary Node */}
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50">
                  <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{t('salesLeadDetail.information' as any) || 'Information Summary'}</CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-12 bg-slate-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">{t('salesLeadDetail.status' as any) || 'Current Status'}</p>
                        <Badge className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm italic", STATUS_CONFIG[lead.status].color)}>
                          {STATUS_CONFIG[lead.status].label}
                        </Badge>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">{t('salesLeadDetail.score' as any) || 'Unit Priority Score'}</p>
                        <div className="flex items-center gap-6">
                          <div className={cn("text-5xl font-black italic tracking-tighter uppercase leading-none", lead.score >= 80 ? "text-emerald-600" : lead.score >= 60 ? "text-amber-600" : "text-slate-400")}>
                            {lead.score}
                          </div>
                          <div className="h-3 flex-1 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100 p-0.5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${lead.score}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={cn("h-full rounded-full transition-all duration-1000", lead.score >= 80 ? "bg-emerald-500 shadow-glow-emerald/30" : lead.score >= 60 ? "bg-amber-500 shadow-glow-amber/30" : "bg-slate-300")} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {lead.phone && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">{t('salesLeadDetail.phone' as any) || 'Primary Phone'}</p>
                          <div className="flex items-center gap-5 text-2xl font-black text-slate-950 tracking-tight italic uppercase group/phone cursor-pointer">
                            <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/phone:bg-pink-50 transition-all duration-500">
                              <Phone className="h-6 w-6 text-pink-600" />
                            </div>
                            {lead.phone}
                          </div>
                        </div>
                      )}
                      {lead.email && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">{t('salesLeadDetail.email' as any) || 'Secure Email'}</p>
                          <div className="flex items-center gap-5 text-2xl font-black text-slate-950 tracking-tight italic uppercase group/email cursor-pointer">
                            <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/email:bg-blue-50 transition-all duration-500">
                              <Mail className="h-6 w-6 text-blue-600" />
                            </div>
                            {lead.email}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {lead.interested_programs && lead.interested_programs.length > 0 && (
                    <div className="space-y-6 pt-10 border-t border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">{t('salesLeadDetail.interestedPrograms' as any) || 'Target Interests'}</p>
                      <div className="flex flex-wrap gap-4">
                        {lead.interested_programs.map((program: string) => (
                          <Badge key={program} variant="outline" className="bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border-slate-100 px-5 py-2.5 rounded-2xl italic shadow-sm hover:bg-pink-50 hover:text-pink-600 hover:border-pink-500/20 transition-all duration-500">
                            {program}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Sales Advisor Node */}
              <div className="space-y-12">
                <AestheticSentiment clientName={lead.name} />
                
                <NeuralNarrativeSynthesis 
                  clientData={{
                    name: lead.name,
                    concerns: lead.interested_programs || [],
                    score: lead.score
                  }} 
                />
                
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                    <div className="space-y-3">
                      <CardTitle className="text-xl font-black text-slate-950 tracking-tighter italic uppercase flex items-center gap-5 leading-none">
                        <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 transition-transform duration-700">
                          <Brain className="h-8 w-8 text-pink-600" />
                        </div>
                        AI Strategic Aesthetic Advisor
                      </CardTitle>
                      <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">Predictive communication patterns and personalized conversion scripts.</CardDescription>
                    </div>
                    <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 font-black italic tracking-widest text-[9px] uppercase shadow-sm">
                      PRECISION_LEVEL: HIGH
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-12 space-y-12 bg-slate-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { icon: Zap, title: "Opening Hook", text: '"Based on your scan, the 468-point neural mapping identified specific vectors for rejuvenation..."', color: "text-pink-600", bg: "bg-pink-50" },
                        { icon: ShieldAlert, title: "Objection Handling", text: '"I understand the budget concern. Our Professional Tier ROI metrics show a 2.4x retention lift..."', color: "text-blue-600", bg: "bg-blue-50" },
                        { icon: Trophy, title: "Closing Playbook", text: '"Secure your digital twin slot today to lock in the AI-calibrated protocol discount."', color: "text-purple-600", bg: "bg-purple-50" }
                      ].map((f, i) => (
                        <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 space-y-6 hover:border-pink-500/20 transition-all duration-700 shadow-sm hover:shadow-premium group/card relative overflow-hidden">
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-50 group-hover/card:bg-pink-600 transition-all duration-700" />
                          <div className="flex items-center gap-4 relative z-10">
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border border-slate-50 shadow-inner transition-all duration-700 group-hover/card:scale-110", f.bg)}>
                              <f.icon className={cn("h-5 w-5", f.color)} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">{f.title}</span>
                          </div>
                          <p className="text-sm text-slate-500 font-light italic leading-relaxed relative z-10 group-hover/card:text-slate-900 transition-colors">{f.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center shadow-sm">
                            <Lightbulb className="h-6 w-6 text-pink-600" />
                          </div>
                          <h4 className="text-base font-black uppercase tracking-widest text-slate-950 italic">AI Strategy Insights</h4>
                        </div>
                        <ul className="space-y-6 ml-4">
                          {[
                            "Quantitative evidence of program effectiveness",
                            "Personalized 3D visualization of future results",
                            "Precision-calibrated program protocols"
                          ].map((insight, i) => (
                            <li key={i} className="flex items-center gap-5 group/insight">
                              <div className="h-2 w-2 rounded-full bg-pink-500/30 group-hover/insight:scale-150 group-hover/insight:bg-pink-500 transition-all duration-500 shadow-glow-pink/20" />
                              <span className="text-sm text-slate-500 font-light italic group-hover/insight:text-slate-950 transition-colors">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-8">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                            <Target className="h-6 w-6 text-blue-600" />
                          </div>
                          <h4 className="text-base font-black uppercase tracking-widest text-slate-950 italic">Target Conversion Vector</h4>
                        </div>
                        <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 space-y-6 shadow-sm group/progress">
                          <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-400 italic">
                            <span className="group-hover/progress:text-slate-950 transition-colors">Probability</span>
                            <span className="text-emerald-600 text-xl tracking-tighter">82%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100 p-0.5">
                            <motion.div initial={{ width: 0 }} animate={{ width: "82%" }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-emerald-500 rounded-full shadow-glow-emerald/30" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-slate-100">
                      <Button variant="outline" className="w-full h-18 rounded-[2rem] border-slate-200 bg-white text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-slate-50 hover:text-pink-600 shadow-premium italic">
                        <Sparkles className="mr-4 h-6 w-6 text-pink-600" />
                        Regenerate AI Aesthetic Narrative
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interaction Narrative Timeline */}
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 flex flex-row items-center justify-between">
                  <div className="space-y-3">
                    <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{t('salesLeadDetail.interactionHistory' as any) || 'Interaction History'}</CardTitle>
                    <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">{t('salesLeadDetail.interactionsCount' as any) || activities.length} units recorded in terminal</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 bg-slate-50/30">
                  {activities.length > 0 ? (
                    <div className="space-y-12 relative">
                      <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-200" />
                      {activities.map((interaction, index: number) => (
                        <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex gap-10 relative z-10 group/act">
                          <div className="flex-shrink-0 w-20 h-20 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-premium group-hover/act:scale-110 group-hover/act:border-pink-500/30 transition-all duration-700">
                            <MessageSquare className="h-10 w-10 text-slate-300 group-hover/act:text-pink-600 transition-colors" />
                          </div>
                          <div className="flex-1 space-y-4 pt-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <Badge variant="outline" className="w-fit px-5 py-1.5 rounded-full border-slate-200 bg-white text-pink-600 text-[10px] font-black uppercase tracking-widest italic shadow-sm">{String(interaction.type).replace('_', ' ')}</Badge>
                              <div className="flex items-center gap-3 text-slate-400 italic">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                  {format(new Date(interaction.created_at), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-2xl font-black text-slate-950 tracking-tight italic uppercase group-hover/act:text-pink-600 transition-colors leading-none">{interaction.subject}</p>
                              <p className="text-lg text-slate-500 font-light leading-relaxed italic">{interaction.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-32 text-center space-y-8 bg-white rounded-[3rem] border border-slate-100 border-dashed italic shadow-inner">
                      <div className="mx-auto h-24 w-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-sm">
                        <MessageSquare className="h-12 w-12" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-slate-950 uppercase tracking-tighter">No Interactions Logged</p>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{t('salesLeadDetail.noInteractions' as any) || 'Awaiting initial unit synchronization'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Parameter Control Column */}
            <div className="lg:col-span-4 space-y-12">
              {/* Refinement Node */}
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50">
                  <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{t('salesLeadDetail.updateLead' as any) || 'Update Parameter'}</CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-10 bg-slate-50/30">
                  <Form {...updateForm}>
                    <form onSubmit={updateForm.handleSubmit(handleUpdateLead)} className="space-y-10">
                      <FormField
                        control={updateForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('salesLeadDetail.status' as any) || 'Authorization Status'}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-white text-slate-950 focus:ring-pink-500/10 focus:border-pink-500/30 transition-all px-8 text-[11px] font-black uppercase tracking-widest italic shadow-inner">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white border-slate-100 rounded-3xl p-2 shadow-premium">
                                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                                  <SelectItem key={value} value={value} className="rounded-xl px-6 py-3 text-[11px] font-black uppercase tracking-widest italic focus:bg-pink-50 focus:text-pink-600 transition-all cursor-pointer">
                                    {config.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-[10px] font-black uppercase tracking-widest text-rose-600 italic px-2" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={updateForm.control}
                        name="preferred_date"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('salesLeadDetail.followUpDate' as any) || 'Temporal Sync Target'}</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="h-16 rounded-2xl border-slate-100 bg-white text-slate-950 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-bold shadow-inner"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px] font-black uppercase tracking-widest text-rose-600 italic px-2" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={updateForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('salesLeadDetail.internalNotes' as any) || 'Strategic Notes'}</FormLabel>
                            <FormControl>
                              <Textarea
                                className="min-h-[200px] rounded-[2.5rem] border-slate-100 bg-white text-slate-950 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all p-8 italic font-light text-lg shadow-inner resize-none leading-relaxed"
                                placeholder="Author internal node narrative..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px] font-black uppercase tracking-widest text-rose-600 italic px-2" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full h-20 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Synchronizing...
                          </>
                        ) : (
                          <>
                            <Save className="mr-3 h-5 w-5" />
                            Update Registry
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Interaction Dialog Infrastructure interface */}
      <Dialog open={showInteractionDialog} onOpenChange={setShowInteractionDialog}>
        <DialogContent className="border-slate-100 p-12 rounded-[3.5rem] shadow-premium max-w-xl bg-white overflow-hidden selection:bg-pink-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          <DialogHeader className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-pink-50 border border-pink-100 shadow-sm mb-2 group">
              <Plus className="h-10 w-10 text-pink-600 transition-transform duration-700 group-hover:scale-110" />
            </div>
            <DialogTitle className="text-4xl font-black text-slate-950 tracking-tight italic uppercase leading-none">{t('salesLeadDetail.dialog.title' as any) || 'Log Interaction'}</DialogTitle>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Synchronize manual engagement unit</p>
          </DialogHeader>
          <div className="mt-10 bg-slate-50/30 rounded-[2.5rem] border border-slate-50 p-10 shadow-inner">
            <Form {...interactionForm}>
              <form onSubmit={interactionForm.handleSubmit(handleAddInteraction)} className="space-y-10">
                <FormField
                  control={interactionForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('salesLeadDetail.dialog.type' as any) || 'Interaction Mode'}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-white text-slate-950 focus:ring-pink-500/10 focus:border-pink-500/30 transition-all px-8 text-[11px] font-black uppercase tracking-widest italic shadow-inner">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-slate-100 rounded-3xl p-2 shadow-premium">
                          {['call', 'email', 'meeting', 'note', 'task'].map((type) => (
                            <SelectItem key={type} value={type} className="rounded-xl px-6 py-3 text-[11px] font-black uppercase tracking-widest italic focus:bg-pink-50 focus:text-pink-600 transition-all cursor-pointer">
                              {type.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={interactionForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('salesLeadDetail.dialog.subject' as any) || 'Subject Protocol'}</FormLabel>
                      <FormControl>
                        <Input
                          className="h-16 rounded-2xl border-slate-100 bg-white text-slate-950 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-bold shadow-inner"
                          placeholder="Node interaction subject..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={interactionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('salesLeadDetail.dialog.description' as any) || 'Detailed Narrative'}</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[150px] rounded-[2rem] border-slate-100 bg-white text-slate-950 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all p-8 italic font-light text-lg shadow-inner resize-none leading-relaxed"
                          placeholder="Log engagement details..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-20 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic">
                  Authorize Engagement Log
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
