"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { useTranslations, useLocale } from "next-intl"
import { AddLeadModal } from "@/components/sales/add-lead-modal"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  UserPlus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Loader2,
  Target,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { GiveCreditsDialog } from "@/components/sales/GiveCreditsDialog"
import { Gift, UserCheck } from "lucide-react"

type SalesLeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'cold' | 'warm' | 'hot'
type SalesLeadSource = 'website' | 'facebook' | 'instagram' | 'google_ads' | 'referral' | 'walk_in' | 'phone' | 'email' | 'other' | 'ai_scan' | 'quick_scan'

interface Lead {
  id: string
  customer_user_id?: string | null
  name: string
  phone?: string | null
  email?: string | null
  status: SalesLeadStatus
  source?: SalesLeadSource
  score: number
  next_follow_up_at?: string | null
  last_contact_at?: string | null
  interested_programs?: string[] | null
  budget_range_min?: number | null
  budget_range_max?: number | null
  created_at: string
  metadata?: Record<string, any> | null
  sales_user?: {
    full_name?: string | null
    email?: string | null
  } | null
}

export default function LeadsListPage() {
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const router = useRouter()
  const lp = useLocalizePath()

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

  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<SalesLeadStatus | "all">("all")
  const [sourceFilter, setSourceFilter] = useState<SalesLeadSource | "all">("all")
  const [campaignFilter, setCampaignFilter] = useState<string>("")
  const [showCaptureForm, setShowCaptureForm] = useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [selectedLeadForConvert, setSelectedLeadForConvert] = useState<Lead | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  })

  // Authentication check
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
        console.error('[LeadsList] Authentication error:', error)
        router.push(lp('/auth/login'))
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [router, lp])

  // Fetch leads (stabilized for hook deps)
  const fetchLeads = useCallback(async () => {
    if (!isAuthenticated) return
    
    setIsLoading(true)

    try {
      const offset = (pagination.page - 1) * pagination.limit
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: offset.toString(),
      })

      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (sourceFilter !== 'all') params.append('source', sourceFilter)
      if (campaignFilter.trim()) params.append('campaign', campaignFilter.trim())

      const response = await fetch(`/api/sales/leads?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch leads')
      }

      const result = await response.json()

      const total = result?.pagination?.total ?? 0
      const limit = result?.pagination?.limit ?? pagination.limit
      const offsetFromApi = result?.pagination?.offset ?? offset
      const totalPages = Math.max(1, Math.ceil(total / limit))

      setLeads((result?.data || []) as Lead[])
      setPagination((prev) => ({
        ...prev,
        total,
        limit,
        page: Math.floor(offsetFromApi / limit) + 1,
        total_pages: totalPages,
      }))
    } catch (error) {
      console.error('[LeadsListPage] Error fetching leads:', error)
      toast.error('Failed to load leads')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, search, statusFilter, sourceFilter, campaignFilter, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads()
    }
  }, [fetchLeads, isAuthenticated])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => {
        if (prev.page === 1) {
          fetchLeads()
          return prev
        }
        return { ...prev, page: 1 }
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [search, fetchLeads])

  const handleViewLead = (leadId: string) => {
    router.push(lp(`/sales/leads/${leadId}`))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-gray-600"
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
          {/* Leads Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <Target className="mr-3 h-3.5 w-3.5" />
                Intelligence Acquisition Node
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Lead<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Management</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                Orchestrate prospective conversion flows through aesthetic intelligence metrics.
              </p>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-6 shrink-0">
              <div className="w-full sm:w-[280px] relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-blue-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                <Input
                  className="h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-bold shadow-inner relative z-10"
                  placeholder="CAMPAIGN_ID_SYNC"
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                />
              </div>
              <Button size="xl" variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={() => setShowCaptureForm(true)}>
                <UserPlus className="mr-4 h-5 w-5" />
                Initialize Lead
              </Button>
            </div>
          </div>

          {/* Acquisition Metrics Hub */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: t('salesLeads.stats.total'), val: pagination.total, color: 'text-slate-950', icon: Target },
              { label: t('salesLeads.stats.hot'), val: leads.filter(l => l.status === 'hot').length, color: 'text-rose-600', icon: Zap },
              { label: t('salesLeads.stats.won'), val: leads.filter(l => l.status === 'won').length, color: 'text-emerald-600', icon: CheckCircle },
              { label: t('salesLeads.stats.avgScore'), val: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0, color: 'text-pink-600', icon: TrendingUp }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardContent className="p-10">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                      <stat.icon className={cn("w-20 h-20", stat.color)} />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{stat.label}</p>
                      <div className={cn("text-4xl font-black tracking-tighter italic uppercase", stat.color)}>{stat.val}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Filtering Node Interface */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-blue-600/20 rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
              <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none z-20">
                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
              </div>
              <Input
                className="h-16 pl-20 pr-10 rounded-2xl border-slate-100 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all text-base font-bold italic shadow-inner relative z-10"
                placeholder={t('salesLeads.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-6">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[240px] h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-900 focus:ring-pink-500/10 focus:border-pink-500/30 transition-all px-8 text-[10px] font-black uppercase tracking-widest italic shadow-inner">
                  <SelectValue placeholder={t('salesLeads.filterStatus')} />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-premium">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesLeads.allStatuses')}</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status} className="text-[10px] font-black uppercase tracking-widest italic">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as any)}>
                <SelectTrigger className="w-[240px] h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-900 focus:ring-pink-500/10 focus:border-pink-500/30 transition-all px-8 text-[10px] font-black uppercase tracking-widest italic shadow-inner">
                  <SelectValue placeholder={t('salesLeads.filterSource')} />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-premium">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesLeads.allSources')}</SelectItem>
                  <SelectItem value="website" className="text-[10px] font-black uppercase tracking-widest italic">Aesthetic Portal</SelectItem>
                  <SelectItem value="facebook" className="text-[10px] font-black uppercase tracking-widest italic">Meta Node</SelectItem>
                  <SelectItem value="instagram" className="text-[10px] font-black uppercase tracking-widest italic">Visual Channel</SelectItem>
                  <SelectItem value="google_ads" className="text-[10px] font-black uppercase tracking-widest italic">Alpha Search</SelectItem>
                  <SelectItem value="referral" className="text-[10px] font-black uppercase tracking-widest italic">Network Sync</SelectItem>
                  <SelectItem value="walk_in" className="text-[10px] font-black uppercase tracking-widest italic">Physical Uplink</SelectItem>
                  <SelectItem value="phone" className="text-[10px] font-black uppercase tracking-widest italic">Voice Channel</SelectItem>
                  <SelectItem value="ai_scan" className="text-[10px] font-black uppercase tracking-widest italic">AI Diagnostic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Intelligence Database Architecture */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="border border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-8 bg-slate-50/30">
                <div className="relative h-20 w-20">
                  <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
                  <Loader2 className="h-12 w-12 animate-spin text-pink-600 relative mx-auto" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic animate-pulse">Syncing Intelligence Nodes...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-10 text-center bg-white italic">
                <div className="h-32 w-32 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-inner">
                  <Search className="h-16 w-16" />
                </div>
                <div className="space-y-4">
                  <p className="text-3xl font-black text-slate-950 uppercase tracking-tighter">{t('salesLeads.noLeads')}</p>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">No data found in acquisition database</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-transparent">
                      <TableHead className="h-24 px-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('salesLeads.table.name')}</TableHead>
                      <TableHead className="h-24 px-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('salesLeads.table.contact')}</TableHead>
                      <TableHead className="h-24 px-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('salesLeads.table.status')}</TableHead>
                      <TableHead className="h-24 px-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('salesLeads.table.score')}</TableHead>
                      <TableHead className="h-24 px-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('salesLeads.table.followUp')}</TableHead>
                      <TableHead className="h-24 px-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Personnel</TableHead>
                      <TableHead className="h-24 px-10 text-right w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {leads.map((lead) => (
                      <TableRow 
                        key={lead.id} 
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-all duration-700 group/row cursor-pointer"
                        onClick={() => handleViewLead(lead.id)}
                      >
                        <TableCell className="px-10 py-10">
                          <div className="flex flex-col gap-3">
                            <span className="text-xl font-black text-slate-950 tracking-tight italic group-hover/row:text-pink-600 transition-colors uppercase leading-none">{lead.name}</span>
                            {lead.metadata?.campaign && (
                              <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-widest border-none bg-pink-50 text-pink-500 py-1 px-3 italic shadow-sm">
                                NODE: {lead.metadata?.campaign}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-10">
                          <div className="flex flex-col gap-4">
                            {lead.phone && (
                              <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-slate-400 group-hover/row:text-slate-600 transition-colors italic uppercase leading-none">
                                <Phone className="h-4 w-4 text-pink-500/40" />
                                {lead.phone}
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-slate-400 group-hover/row:text-slate-600 transition-colors italic uppercase leading-none">
                                <Mail className="h-4 w-4 text-blue-500/40" />
                                {lead.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-10">
                          <Badge
                            className={cn(
                              "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm italic",
                              STATUS_CONFIG[lead.status].color.replace('bg-', 'bg-opacity-10 text-').replace('500', '600').replace('600', '50 text-')
                            )}
                            style={{ 
                              backgroundColor: STATUS_CONFIG[lead.status].color.includes('emerald') || STATUS_CONFIG[lead.status].color.includes('green') ? 'rgba(16, 185, 129, 0.1)' : 
                                               STATUS_CONFIG[lead.status].color.includes('rose') || STATUS_CONFIG[lead.status].color.includes('red') ? 'rgba(244, 63, 94, 0.1)' :
                                               STATUS_CONFIG[lead.status].color.includes('blue') ? 'rgba(59, 130, 246, 0.1)' :
                                               STATUS_CONFIG[lead.status].color.includes('purple') ? 'rgba(168, 85, 247, 0.1)' :
                                               'rgba(148, 163, 184, 0.1)',
                              color: STATUS_CONFIG[lead.status].color.includes('emerald') || STATUS_CONFIG[lead.status].color.includes('green') ? '#059669' : 
                                     STATUS_CONFIG[lead.status].color.includes('rose') || STATUS_CONFIG[lead.status].color.includes('red') ? '#e11d48' :
                                     STATUS_CONFIG[lead.status].color.includes('blue') ? '#2563eb' :
                                     STATUS_CONFIG[lead.status].color.includes('purple') ? '#9333ea' :
                                     '#475569'
                            }}
                          >
                            {STATUS_CONFIG[lead.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-10">
                          <div className={cn(
                            "flex items-center gap-4 text-3xl font-black italic tracking-tighter uppercase leading-none transition-transform duration-700 group-hover/row:translate-x-2",
                            lead.score >= 80 ? 'text-emerald-600' : lead.score >= 60 ? 'text-amber-600' : 'text-slate-400'
                          )}>
                            <TrendingUp className="h-6 w-6" />
                            {lead.score}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-10">
                          {lead.next_follow_up_at ? (
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 italic group-hover/row:text-slate-900 transition-colors">
                              <Calendar className="h-5 w-5 text-pink-500/40" />
                              {format(new Date(lead.next_follow_up_at), "MMM d, yyyy")}
                            </div>
                          ) : (
                            <div className="h-px w-10 bg-slate-100" />
                          )}
                        </TableCell>
                        <TableCell className="px-8 py-10">
                          <div className="flex items-center gap-4 group/p">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover/p:bg-blue-600 group-hover/p:text-white transition-all duration-700 shadow-sm">
                              <User className="w-5 h-5 text-blue-600 group-hover/p:text-white" />
                            </div>
                            <div className="text-[11px] font-black text-slate-400 italic group-hover/row:text-slate-900 transition-colors uppercase leading-none">
                              {lead.sales_user?.full_name || 'UNASSIGNED'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-pink-50 hover:text-pink-600 transition-all duration-500 shadow-inner">
                                <MoreVertical className="h-6 w-6" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-slate-100 rounded-3xl p-3 min-w-[220px] shadow-premium selection:bg-pink-500/10">
                              <DropdownMenuItem onClick={() => handleViewLead(lead.id)} className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600 transition-all gap-4 mb-1">
                                <Eye className="h-5 w-5 text-pink-500" />
                                Inspect Node
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewLead(lead.id)} className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-blue-50 focus:text-blue-600 transition-all gap-4 mb-1">
                                <Edit className="h-5 w-5 text-blue-500" />
                                Refine Parameter
                              </DropdownMenuItem>
                              {lead.status !== 'won' && (
                                <DropdownMenuItem onClick={() => handleViewLead(lead.id)} className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-emerald-50 focus:text-emerald-600 transition-all gap-4 mb-1">
                                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                                  Authorize Win
                                </DropdownMenuItem>
                              )}
                              
                              {!lead.customer_user_id ? (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLeadForConvert(lead);
                                    setConvertDialogOpen(true);
                                  }} 
                                  className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-purple-50 focus:text-purple-600 transition-all gap-4"
                                >
                                  <UserCheck className="h-5 w-5 text-purple-500" />
                                  Convert to Customer
                                </DropdownMenuItem>
                              ) : (
                                <div className="px-1 py-1">
                                  <GiveCreditsDialog 
                                    customer={{
                                      id: lead.customer_user_id,
                                      full_name: lead.name,
                                      email: lead.email || undefined,
                                      phone: lead.phone || undefined
                                    }}
                                    trigger={
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-purple-50 focus:text-purple-600 transition-all gap-4">
                                        <Gift className="h-5 w-5 text-purple-500" />
                                        Grant Credits
                                      </DropdownMenuItem>
                                    }
                                  />
                                </div>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>

          {/* Temporal Pagination Control */}
          {pagination.total_pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-12 pt-12 border-t border-slate-100">
              <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                Synchronizing Nodes <span className="text-slate-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-pink-600">{pagination.total}</span> Units
              </div>
              <div className="flex gap-6">
                <Button
                  variant="outline"
                  className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic hover:bg-slate-50 transition-all shadow-premium"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Temporal Reverse
                </Button>
                <Button
                  variant="outline"
                  className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic hover:bg-slate-50 transition-all shadow-premium"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.total_pages}
                >
                  Forward Sequence
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      <AddLeadModal
        open={showCaptureForm}
        onClose={() => setShowCaptureForm(false)}
        onSuccess={() => fetchLeads()}
      />
    </div>
  )
}
