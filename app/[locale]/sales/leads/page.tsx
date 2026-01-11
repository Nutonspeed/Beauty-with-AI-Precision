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

type SalesLeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'cold' | 'warm' | 'hot'
type SalesLeadSource = 'website' | 'facebook' | 'instagram' | 'google_ads' | 'referral' | 'walk_in' | 'phone' | 'email' | 'other' | 'ai_scan' | 'quick_scan'

interface Lead {
  id: string
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
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Leads Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Target className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Intelligence Acquisition Node
              </Badge>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                Lead<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Management</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Orchestrate prospective conversion flows through aesthetic intelligence metrics.
              </p>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <div className="w-full sm:w-[240px] relative group">
                <Input
                  className="h-16 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6 italic"
                  placeholder="CAMPAIGN_ID_SYNC"
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                />
              </div>
              <Button size="xl" variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border" onClick={() => setShowCaptureForm(true)}>
                <UserPlus className="mr-3 h-5 w-5" />
                Initialize Lead
              </Button>
            </div>
          </div>

          {/* Acquisition Metrics Hub */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: t('salesLeads.stats.total'), val: pagination.total, color: 'text-white' },
              { label: t('salesLeads.stats.hot'), val: leads.filter(l => l.status === 'hot').length, color: 'text-rose-400' },
              { label: t('salesLeads.stats.won'), val: leads.filter(l => l.status === 'won').length, color: 'text-emerald-400' },
              { label: t('salesLeads.stats.avgScore'), val: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0, color: 'text-cyan-400' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <CardContent className="p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 italic">{stat.label}</p>
                    <div className={cn("text-4xl font-black tracking-tighter italic", stat.color)}>{stat.val}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Filtering Node Interface */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-600 group-focus-within:text-pink-500 transition-colors" />
              </div>
              <Input
                className="h-16 pl-16 pr-8 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all text-sm font-bold italic"
                placeholder={t('salesLeads.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[200px] h-16 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-6 text-[10px] font-black uppercase tracking-widest italic">
                  <SelectValue placeholder={t('salesLeads.filterStatus')} />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesLeads.allStatuses')}</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status} className="text-[10px] font-black uppercase tracking-widest italic">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as any)}>
                <SelectTrigger className="w-[200px] h-16 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-6 text-[10px] font-black uppercase tracking-widest italic">
                  <SelectValue placeholder={t('salesLeads.filterSource')} />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
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
            className="border border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-6">
                <Loader2 className="h-16 w-16 animate-spin text-pink-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">Syncing Intelligence Nodes...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-6 text-center">
                <div className="h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-700">
                  <Search className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-slate-500 italic">{t('salesLeads.noLeads')}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">No data found in acquisition database</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/5 hover:bg-transparent">
                      <TableHead className="h-20 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('salesLeads.table.name')}</TableHead>
                      <TableHead className="h-20 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('salesLeads.table.contact')}</TableHead>
                      <TableHead className="h-20 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('salesLeads.table.status')}</TableHead>
                      <TableHead className="h-20 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('salesLeads.table.score')}</TableHead>
                      <TableHead className="h-20 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('salesLeads.table.followUp')}</TableHead>
                      <TableHead className="h-20 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Personnel</TableHead>
                      <TableHead className="h-20 px-10 text-right w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow 
                        key={lead.id} 
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group/row cursor-pointer"
                        onClick={() => handleViewLead(lead.id)}
                      >
                        <TableCell className="px-10 py-8">
                          <div className="flex flex-col gap-2">
                            <span className="text-lg font-bold text-white tracking-tight italic group-hover/row:text-pink-400 transition-colors">{lead.name}</span>
                            {lead.metadata?.campaign && (
                              <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-widest border-white/10 text-slate-500 py-0.5 px-2 italic">
                                NODE: {lead.metadata?.campaign}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-8">
                          <div className="flex flex-col gap-3">
                            {lead.phone && (
                              <div className="flex items-center gap-3 text-[10px] font-black tracking-widest text-slate-500 group-hover/row:text-slate-300 transition-colors italic">
                                <Phone className="h-3.5 w-3.5 text-pink-500/60" />
                                {lead.phone}
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center gap-3 text-[10px] font-black tracking-widest text-slate-500 group-hover/row:text-slate-300 transition-colors italic">
                                <Mail className="h-3.5 w-3.5 text-cyan-500/60" />
                                {lead.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-8">
                          <Badge
                            className={cn(
                              "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner",
                              STATUS_CONFIG[lead.status].color
                            )}
                          >
                            {STATUS_CONFIG[lead.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-8">
                          <div className={cn(
                            "flex items-center gap-3 text-2xl font-black italic tracking-tighter",
                            getScoreColor(lead.score).replace('text-', 'text-').replace('600', '400')
                          )}>
                            <TrendingUp className="h-5 w-5" />
                            {lead.score}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-8">
                          {lead.next_follow_up_at ? (
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                              <Calendar className="h-4 w-4 text-pink-500/60" />
                              {format(new Date(lead.next_follow_up_at), "MMM d, yyyy")}
                            </div>
                          ) : (
                            <span className="text-slate-700 text-[10px] font-black tracking-[0.2em]">--:--:--</span>
                          )}
                        </TableCell>
                        <TableCell className="px-8 py-8">
                          <div className="text-[11px] font-bold text-slate-400 italic group-hover/row:text-white transition-colors">
                            {lead.sales_user?.full_name || 'UNASSIGNED'}
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-8 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 text-slate-500">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#020617] border-white/10 rounded-2xl p-2 min-w-[180px]">
                              <DropdownMenuItem onClick={() => handleViewLead(lead.id)} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">
                                <Eye className="mr-3 h-4 w-4" />
                                Inspect Node
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewLead(lead.id)} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">
                                <Edit className="mr-3 h-4 w-4" />
                                Refine Parameter
                              </DropdownMenuItem>
                              {lead.status !== 'won' && (
                                <DropdownMenuItem onClick={() => handleViewLead(lead.id)} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">
                                  <CheckCircle className="mr-3 h-4 w-4" />
                                  Authorize Win
                                </DropdownMenuItem>
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-white/5">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">
                Synchronizing Nodes {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} Units
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all px-8"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Temporal Reverse
                </Button>
                <Button
                  variant="outline"
                  className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all px-8"
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
