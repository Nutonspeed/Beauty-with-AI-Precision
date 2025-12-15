"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLocalizePath } from "@/lib/i18n/locale-link"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { AddLeadModal } from "@/components/sales/add-lead-modal"

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
  interested_treatments?: string[] | null
  budget_range_min?: number | null
  budget_range_max?: number | null
  created_at: string
  metadata?: Record<string, any> | null
  sales_user?: {
    full_name?: string | null
    email?: string | null
  } | null
}

const STATUS_CONFIG: Record<SalesLeadStatus, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-500" },
  contacted: { label: "Contacted", color: "bg-purple-500" },
  qualified: { label: "Qualified", color: "bg-emerald-600" },
  proposal_sent: { label: "Proposal Sent", color: "bg-indigo-600" },
  negotiation: { label: "Negotiation", color: "bg-yellow-600" },
  won: { label: "Won", color: "bg-green-600" },
  lost: { label: "Lost", color: "bg-gray-400" },
  cold: { label: "Cold", color: "bg-gray-500" },
  warm: { label: "Warm", color: "bg-orange-500" },
  hot: { label: "Hot", color: "bg-red-500" },
}

export default function LeadsListPage() {
  const router = useRouter()
  const lp = useLocalizePath()
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
        if (!['sales_staff', 'clinic_admin', 'clinic_owner', 'super_admin'].includes(roleData.role)) {
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
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground">
            Track and manage your sales leads
          </p>
        </div>

        <div className="w-full md:w-[200px]">
          <Input
            placeholder="Filter by campaign code..."
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowCaptureForm(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Capture New Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="google_ads">Google Ads</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="walk_in">Walk-in</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="ai_scan">AI Scan</SelectItem>
            <SelectItem value="quick_scan">Quick Scan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Leads</div>
          <div className="text-2xl font-bold">{pagination.total}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Hot Leads</div>
          <div className="text-2xl font-bold text-red-600">
            {leads.filter(l => l.status === 'hot').length}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Won</div>
          <div className="text-2xl font-bold text-green-600">
            {leads.filter(l => l.status === 'won').length}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Avg. Score</div>
          <div className="text-2xl font-bold">
            {leads.length > 0 
              ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length)
              : 0}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No leads found. Create your first lead to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead>Interests</TableHead>
                <TableHead>Sales Staff</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span>{lead.name}</span>
                      {lead.metadata?.campaign && (
                        <Badge variant="outline" className="w-fit text-xs">
                          Campaign: {lead.metadata?.campaign}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${STATUS_CONFIG[lead.status].color} text-white`}
                    >
                      {STATUS_CONFIG[lead.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 font-semibold ${getScoreColor(lead.score)}`}>
                      <TrendingUp className="h-4 w-4" />
                      {lead.score}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.next_follow_up_at ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(lead.next_follow_up_at), "MMM d, yyyy")}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {lead.interested_treatments && lead.interested_treatments.length > 0
                        ? `${lead.interested_treatments.length} treatment${lead.interested_treatments.length > 1 ? 's' : ''}`
                        : '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {lead.sales_user?.full_name || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(lead.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Lead
                        </DropdownMenuItem>
                        {lead.status !== 'won' && (
                          <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark / View
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} leads
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.total_pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Lead Capture Form */}
      <AddLeadModal
        open={showCaptureForm}
        onClose={() => setShowCaptureForm(false)}
        onSuccess={() => fetchLeads()}
      />
    </div>
  )
}
