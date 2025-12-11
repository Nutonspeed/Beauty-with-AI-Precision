"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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
import { LeadCaptureForm } from "@/components/leads/lead-capture-form"
import type { LeadStatus, LeadSource } from "@/types/multi-tenant"

interface Lead {
  id: string
  full_name: string
  phone?: string
  email?: string
  status: LeadStatus
  source?: LeadSource
  lead_score: number
  follow_up_date?: string
  last_contact_date?: string
  interested_treatments?: string[]
  budget_range?: string
  created_at: string
  campaign?: string
  clinic?: {
    id: string
    name: string
  }
  sales_staff?: {
    id: string
    full_name: string
  }
  analysis?: {
    id: string
    overall_score: number
  }
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-500" },
  contacted: { label: "Contacted", color: "bg-purple-500" },
  hot: { label: "Hot", color: "bg-red-500" },
  warm: { label: "Warm", color: "bg-orange-500" },
  cold: { label: "Cold", color: "bg-gray-500" },
  converted: { label: "Converted", color: "bg-green-500" },
  lost: { label: "Lost", color: "bg-gray-400" },
}

export default function LeadsListPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all")
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all")
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
    try {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (!user || !token) {
        router.push('/auth/login')
        return
      }
      
      setIsAuthenticated(true)
    } catch (error) {
      console.error('[LeadsList] Authentication error:', error)
      router.push('/auth/login')
    }
  }, [router])

  // Fetch leads (stabilized for hook deps)
  const fetchLeads = useCallback(async () => {
    if (!isAuthenticated) return
    
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (sourceFilter !== 'all') params.append('source', sourceFilter)
      if (campaignFilter.trim()) params.append('campaign', campaignFilter.trim())

      const response = await fetch(`/api/leads?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch leads')
      }

      const result = await response.json()

      if (result.success) {
        setLeads(result.data)
        setPagination(result.pagination)
      } else {
        throw new Error(result.message)
      }
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
    router.push(`/sales/leads/${leadId}`)
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
            <SelectItem value="walk_in">Walk-in</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="social_media">Social Media</SelectItem>
            <SelectItem value="other">Other</SelectItem>
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
          <div className="text-sm text-muted-foreground">Converted</div>
          <div className="text-2xl font-bold text-green-600">
            {leads.filter(l => l.status === 'converted').length}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Avg. Score</div>
          <div className="text-2xl font-bold">
            {leads.length > 0 
              ? Math.round(leads.reduce((sum, l) => sum + l.lead_score, 0) / leads.length)
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
                      <span>{lead.full_name}</span>
                      {lead.campaign && (
                        <Badge variant="outline" className="w-fit text-xs">
                          Campaign: {lead.campaign}
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
                    <div className={`flex items-center gap-1 font-semibold ${getScoreColor(lead.lead_score)}`}>
                      <TrendingUp className="h-4 w-4" />
                      {lead.lead_score}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.follow_up_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(lead.follow_up_date), "MMM d, yyyy")}
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
                    {lead.sales_staff?.full_name || '-'}
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
                        {lead.status !== 'converted' && (
                          <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Convert to Customer
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
      <LeadCaptureForm
        open={showCaptureForm}
        onOpenChange={setShowCaptureForm}
        onSuccess={() => fetchLeads()}
      />
    </div>
  )
}
