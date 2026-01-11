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
  Calendar,
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
  Trophy
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
      subject: t('salesLeadDetail.dialog.types.call'),
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

  const handleCreateProposal = async () => {
    if (!lead) return
    setIsCreatingProposal(true)
    try {
      const recs = (lead.metadata as any)?.recommendations
      const programsRaw = Array.isArray(recs) ? recs : []
      const programs = programsRaw.length
        ? programsRaw.map((r: any) => ({
            name: r?.title_th || r?.title_en || r?.name || t('common.program'),
            price: Number(r?.price || 0),
            sessions: Number(r?.sessions || 1),
            type: r?.type || 'procedure'
          }))
        : [
            {
              name: lead.primary_concern || t('common.program'),
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
          title: t('salesProposalGenerator.generatedTitle'),
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
        throw new Error(err.error || t('salesLeadDetail.messages.proposalError'))
      }

      const proposal = await res.json()
      toast.success(t('salesLeadDetail.messages.proposalSuccess'))
      if (proposal?.id) {
        router.push(`/sales/proposals/${proposal.id}`)
      }
    } catch (error) {
      console.error("Create proposal failed:", error)
      toast.error(error instanceof Error ? error.message : t('salesLeadDetail.messages.proposalError'))
    } finally {
      setIsCreatingProposal(false)
    }
  }

  // Fetch lead details
  const fetchLead = useCallback(async () => {
    if (!isAuthenticated) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/sales/leads/${leadId}`)

      if (!response.ok) {
        throw new Error(t('salesLeadDetail.messages.updateError'))
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
      toast.error(t('salesLeadDetail.messages.updateError'))
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
        throw new Error(t('salesLeadDetail.messages.updateError'))
      }

      const result = await response.json()

      if (result?.data) {
        toast.success(t('salesLeadDetail.messages.updateSuccess'))
        setLead(result.data)
        fetchLead()
      } else {
        toast.success(t('salesLeadDetail.messages.updateSuccess'))
        fetchLead()
      }
    } catch (error) {
      console.error('[LeadDetailPage] Error updating lead:', error)
      toast.error(t('salesLeadDetail.messages.updateError'))
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
        throw new Error(t('salesLeadDetail.messages.interactionError'))
      }

      toast.success(t('salesLeadDetail.messages.interactionSuccess'))
      setShowInteractionDialog(false)
      interactionForm.reset({ type: 'call', subject: t('salesLeadDetail.dialog.types.call'), description: '' })
      fetchLead()
    } catch (error) {
      console.error('[LeadDetailPage] Error adding interaction:', error)
      toast.error(t('salesLeadDetail.messages.interactionError'))
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!lead) {
    return null
  }

  const STATUS_CONFIG: Record<SalesLeadStatus, { label: string; color: string }> = {
    new: { label: t('salesLeads.status.new'), color: "bg-blue-500" },
    contacted: { label: t('salesLeads.status.contacted'), color: "bg-purple-500" },
    qualified: { label: t('salesLeads.status.qualified'), color: "bg-emerald-600" },
    proposal_sent: { label: t('salesLeads.status.proposal_sent'), color: "bg-indigo-600" },
    negotiation: { label: t('salesLeads.status.negotiation'), color: "bg-yellow-600" },
    won: { label: t('salesLeads.status.won'), color: "bg-green-600" },
    lost: { label: t('salesLeads.status.lost'), color: "bg-gray-400" },
    cold: { label: t('salesLeads.status.cold'), color: "bg-gray-500" },
    warm: { label: t('salesLeads.status.warm'), color: "bg-orange-500" },
    hot: { label: t('salesLeads.status.hot'), color: "bg-red-500" },
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-12 max-w-7xl mx-auto flex-1">
          {/* Detail Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all" onClick={() => router.push(lp('/sales/leads'))}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                  <Fingerprint className="mr-3 h-3.5 w-3.5 animate-pulse" />
                  Unit Precision Analysis
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[0.9] italic">
                  {lead.name}<br />
                  <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic text-2xl tracking-[0.3em] font-black uppercase">NODE_ID: {lead.id.substring(0, 8)}</span>
                </h1>
              </div>
            </motion.div>
            
            <div className="flex flex-wrap gap-4 shrink-0">
              <Button size="xl" variant="outline" className="h-16 px-8 rounded-2xl border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-white/10 italic" onClick={() => setShowInteractionDialog(true)}>
                <Plus className="mr-3 h-4 w-4" />
                Add Interaction
              </Button>
              <Button size="xl" variant="outline" className="h-16 px-8 rounded-2xl border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-white/10 italic" onClick={handleCreateProposal} disabled={isCreatingProposal}>
                {isCreatingProposal ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <Plus className="mr-3 h-4 w-4" />}
                Generate Schema
              </Button>
              {lead.status !== 'won' && (
                <Button size="xl" variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border" onClick={async () => {
                  try {
                    const res = await fetch(`/api/sales/leads/${leadId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'won' }),
                    })
                    if (!res.ok) throw new Error('Failed')
                    toast.success(t('salesLeadDetail.wonSuccess'))
                    fetchLead()
                  } catch {
                    toast.error(t('salesLeadDetail.wonError'))
                  }
                }}>
                  <CheckCircle className="mr-3 h-5 w-5" />
                  Authorize Win
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Operational Column */}
            <div className="lg:col-span-8 space-y-10">
              {/* Intelligence Summary Node */}
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('salesLeadDetail.information')}</CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{t('salesLeadDetail.status')}</p>
                        <Badge className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-inner", STATUS_CONFIG[lead.status].color)}>
                          {STATUS_CONFIG[lead.status].label}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{t('salesLeadDetail.score')}</p>
                        <div className="flex items-center gap-4">
                          <div className={cn("text-4xl font-black italic tracking-tighter", lead.score >= 80 ? "text-emerald-400" : lead.score >= 60 ? "text-amber-400" : "text-slate-400")}>
                            {lead.score}
                          </div>
                          <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${lead.score}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={cn("h-full", lead.score >= 80 ? "bg-emerald-500" : lead.score >= 60 ? "bg-amber-500" : "bg-slate-500")} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {lead.phone && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{t('salesLeadDetail.phone')}</p>
                          <div className="flex items-center gap-4 text-xl font-bold text-white tracking-tight italic">
                            <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner">
                              <Phone className="h-5 w-5 text-pink-500/60" />
                            </div>
                            {lead.phone}
                          </div>
                        </div>
                      )}
                      {lead.email && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{t('salesLeadDetail.email')}</p>
                          <div className="flex items-center gap-4 text-xl font-bold text-white tracking-tight italic">
                            <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner">
                              <Mail className="h-5 w-5 text-cyan-500/60" />
                            </div>
                            {lead.email}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {lead.interested_programs && lead.interested_programs.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{t('salesLeadDetail.interestedPrograms')}</p>
                      <div className="flex flex-wrap gap-3">
                        {lead.interested_programs.map((program: string) => (
                          <Badge key={program} variant="outline" className="bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-slate-300 border-white/5 px-4 py-2 rounded-xl italic">
                            {program}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Sales Advisor Node - ENTERPRISE VALUE */}
              <div className="space-y-10">
                <AestheticSentiment customerName={lead.name} />
                
                <NeuralNarrativeSynthesis 
                  customerData={{
                    name: lead.name,
                    concerns: lead.interested_programs || [],
                    score: lead.score
                  }} 
                />
                
                <Card className="relative overflow-hidden border-pink-500/20 bg-pink-500/[0.02] backdrop-blur-3xl rounded-[3rem] shadow-2xl group">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
                  <CardHeader className="p-10 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-pink-400 flex items-center gap-3">
                        <Brain className="w-4 h-4 animate-pulse" />
                        AI Strategic Sales Advisor
                      </CardTitle>
                      <CardDescription className="text-slate-500 font-light italic">Predictive communication patterns and personalized conversion scripts.</CardDescription>
                    </div>
                    <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/10 font-black italic tracking-widest text-[9px]">
                      PRECISION_LEVEL: HIGH
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-12 space-y-10">
                    {/* Strategic Battle Cards Interface */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 rounded-[2rem] bg-pink-500/5 border border-pink-500/10 space-y-4 hover:bg-pink-500/10 transition-colors group/card">
                        <div className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-pink-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-white">Opening Hook</span>
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">"Based on your scan, the 468-point neural mapping identified specific vectors for rejuvenation..."</p>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10 space-y-4 hover:bg-cyan-500/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <ShieldAlert className="h-4 w-4 text-cyan-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-white">Objection Handling</span>
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">"I understand the budget concern. Our Professional Tier ROI metrics show a 2.4x retention lift..."</p>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-purple-500/5 border border-purple-500/10 space-y-4 hover:bg-purple-500/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-4 w-4 text-purple-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-white">Closing Playbook</span>
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">"Secure your digital twin slot today to lock in the AI-calibrated protocol discount."</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                            <Lightbulb className="h-5 w-5 text-pink-500" />
                          </div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-white italic">AI Strategy Insights</h4>
                        </div>
                        <ul className="space-y-4">
                          {[
                            "Quantitative evidence of program effectiveness",
                            "Personalized 3D visualization of future results",
                            "Precision-calibrated program protocols"
                          ].map((insight, i) => (
                            <li key={i} className="flex items-center gap-4 text-xs text-slate-400 font-light">
                              <div className="h-1 w-1 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                            <Target className="h-5 w-5 text-cyan-500" />
                          </div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-white italic">Target Conversion Vector</h4>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                            <span>Probability</span>
                            <span className="text-emerald-500">82%</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div animate={{ width: "82%" }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/5">
                      <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10">
                        <Sparkles className="mr-3 h-4 w-4 text-pink-500" />
                        Regenerate AI Sales Narrative
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interaction Narrative Timeline */}
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('salesLeadDetail.interactionHistory')}</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('salesLeadDetail.interactionsCount', { count: activities.length })} units recorded</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  {activities.length > 0 ? (
                    <div className="space-y-10 relative">
                      <div className="absolute left-7 top-0 bottom-0 w-px bg-white/5" />
                      {activities.map((interaction, index: number) => (
                        <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex gap-8 relative z-10 group/act">
                          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/act:border-pink-500/30 transition-all">
                            <MessageSquare className="h-6 w-6 text-slate-500 group-hover/act:text-pink-400 transition-colors" />
                          </div>
                          <div className="flex-1 space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500/60 italic">{String(interaction.type).replace('_', ' ')}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                                {format(new Date(interaction.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            <p className="text-lg font-bold text-white tracking-tight italic group-hover/act:text-pink-400 transition-colors">{interaction.subject}</p>
                            <p className="text-sm text-slate-500 font-light leading-relaxed">{interaction.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-6">
                      <div className="h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-700 mx-auto">
                        <MessageSquare className="h-10 w-10" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">{t('salesLeadDetail.noInteractions')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Parameter Control Column */}
            <div className="lg:col-span-4 space-y-10">
              {/* Refinement Node */}
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('salesLeadDetail.updateLead')}</CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  <Form {...updateForm}>
                    <form onSubmit={updateForm.handleSubmit(handleUpdateLead)} className="space-y-8">
                      <FormField
                        control={updateForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('salesLeadDetail.status')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-6 text-[10px] font-black uppercase tracking-widest italic">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                                  <SelectItem key={value} value={value} className="text-[10px] font-black uppercase tracking-widest italic">
                                    {config.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-[10px] font-black uppercase tracking-widest text-rose-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={updateForm.control}
                        name="preferred_date"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('salesLeadDetail.followUpDate')}</FormLabel>
                            <FormControl>
                              <Input type="date" className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6" {...field} />
                            </FormControl>
                            <FormMessage className="text-[10px] font-black uppercase tracking-widest text-rose-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={updateForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('salesLeadDetail.notes')}</FormLabel>
                            <FormControl>
                              <Textarea className="rounded-[2rem] border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 transition-all px-6 py-4 resize-none italic font-light min-h-[150px]" {...field} />
                            </FormControl>
                            <FormMessage className="text-[10px] font-black uppercase tracking-widest text-rose-500" />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" size="xl" variant="premium" className="w-full h-18 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Syncing Node...
                          </>
                        ) : (
                          t('salesLeadDetail.updateLead')
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Administrative Schema Node */}
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('salesLeadDetail.details')}</CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">{t('salesLeadDetail.salesStaff')}</span>
                      <span className="text-white font-bold italic">{lead.sales_user?.full_name || 'UNASSIGNED'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Acquisition Vector</span>
                      <span className="text-cyan-400 font-bold italic uppercase tracking-widest text-[10px]">{lead.source}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">{t('salesLeadDetail.created')}</span>
                      <div className="flex items-center gap-3 text-white font-bold italic">
                        <Calendar className="h-4 w-4 text-pink-500/60" />
                        {format(new Date(lead.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Interaction Dialog Infrastructure */}
      <Dialog open={showInteractionDialog} onOpenChange={setShowInteractionDialog}>
        <DialogContent className="glass-panel border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-xl bg-[#020617]/90 backdrop-blur-3xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
          <DialogHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 border border-pink-500/20 shadow-inner mb-2">
              <MessageSquare className="h-8 w-8 text-pink-400" />
            </div>
            <DialogTitle className="text-3xl font-bold text-white tracking-tight italic">{t('salesLeadDetail.dialog.title')}</DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('salesLeadDetail.dialog.description')}</p>
          </DialogHeader>

          <Form {...interactionForm}>
            <form onSubmit={interactionForm.handleSubmit(handleAddInteraction)} className="space-y-8 py-8">
              <FormField
                control={interactionForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('salesLeadDetail.dialog.type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-6 text-[10px] font-black uppercase tracking-widest italic">
                          <SelectValue placeholder={t('salesLeadDetail.dialog.selectType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                        <SelectItem value="call" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesLeadDetail.dialog.types.call')}</SelectItem>
                        <SelectItem value="email" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesLeadDetail.dialog.types.email')}</SelectItem>
                        <SelectItem value="meeting" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesLeadDetail.dialog.types.meeting')}</SelectItem>
                        <SelectItem value="note" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesLeadDetail.dialog.types.note')}</SelectItem>
                        <SelectItem value="task" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesLeadDetail.dialog.types.task')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[9px] font-black uppercase tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={interactionForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('salesLeadDetail.dialog.subject')}</FormLabel>
                    <FormControl>
                      <Input className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6 font-bold italic" placeholder={t('salesLeadDetail.dialog.subjectPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage className="text-[9px] font-black uppercase tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={interactionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('salesLeadDetail.dialog.descriptionLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        className="rounded-[2rem] border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 transition-all px-6 py-4 resize-none italic font-light min-h-[120px]"
                        placeholder={t('salesLeadDetail.dialog.descriptionPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] font-black uppercase tracking-widest text-rose-500" />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setShowInteractionDialog(false)}
                >
                  Abort LOG
                </Button>
                <Button type="submit" variant="premium" className="flex-1 h-14 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
                  Authorize Log
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
