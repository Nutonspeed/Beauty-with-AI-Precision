// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Search, FileText, Send, Edit, Eye, ArrowLeft, Plus, MoreVertical, Trash2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"
import { ProposalModal } from "@/components/sales/proposal-modal"
import { toast } from "sonner"

type Proposal = {
  id: string
  lead_id: string
  title: string
  status: string
  total_value: number
  sent_at: string | null
  valid_until: string | null
  treatments: any[]
  win_probability: number
  created_at: string
  sales_leads: {
    name: string
  } | null
}

type Stats = {
  total: number
  draft: number
  sent: number
  viewed: number
  accepted: number
  rejected: number
  totalValue: number
}

type ProposalsClientProps = {
  initialProposals: Proposal[]
  initialStats: Stats
}

export function ProposalsClient({ initialProposals, initialStats }: ProposalsClientProps) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals)
  const [stats, setStats] = useState<Stats>(initialStats)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Modal states
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
  const [leads, setLeads] = useState<any[]>([])

  // Fetch leads for proposal creation
  useEffect(() => {
    const fetchLeads = async () => {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('sales_leads')
        .select('id, name, email')
        .order('name')
      
      if (data) {
        setLeads(data)
      }
    }
    fetchLeads()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const supabase = createBrowserClient()

    const channel = supabase
      .channel('sales_proposals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales_proposals'
        },
        (payload) => {
          console.log('[Proposals] Real-time update:', payload)
          globalThis.location.reload()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleRefresh = () => {
    globalThis.location.reload()
  }

  const handleEditProposal = (proposal: Proposal) => {
    setEditingProposal(proposal)
    setShowProposalModal(true)
  }

  const handleDeleteProposal = async (proposalId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ proposal นี้? (เฉพาะ draft เท่านั้น)')) {
      return
    }

    try {
      const response = await fetch(`/api/sales/proposals/${proposalId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast.success('ลบ proposal สำเร็จ!')
      handleRefresh()
    } catch (error: any) {
      console.error('Error deleting proposal:', error)
      toast.error(error.message || 'ไม่สามารถลบ proposal ได้')
    }
  }

  const handleSendProposal = async (proposalId: string) => {
    if (!confirm('ส่ง proposal นี้ให้ลูกค้า?')) {
      return
    }

    try {
      const response = await fetch(`/api/sales/proposals/${proposalId}/send`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to send proposal')
      }

      toast.success('ส่ง proposal สำเร็จ!')
      handleRefresh()
    } catch (error) {
      console.error('Error sending proposal:', error)
      toast.error('ไม่สามารถส่ง proposal ได้')
    }
  }

  const handleAcceptProposal = async (proposalId: string) => {
    if (!confirm('ยืนยันว่าลูกค้ายอมรับ proposal นี้?')) {
      return
    }

    try {
      const response = await fetch(`/api/sales/proposals/${proposalId}/accept`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to accept proposal')
      }

      toast.success('ยอมรับ proposal สำเร็จ!')
      handleRefresh()
    } catch (error) {
      console.error('Error accepting proposal:', error)
      toast.error('ไม่สามารถยอมรับ proposal ได้')
    }
  }

  const handleRejectProposal = async (proposalId: string) => {
    const reason = prompt('เหตุผลที่ปฏิเสธ (ถ้ามี):')
    if (reason === null) return // User cancelled

    try {
      const response = await fetch(`/api/sales/proposals/${proposalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'Not specified' })
      })

      if (!response.ok) {
        throw new Error('Failed to reject proposal')
      }

      toast.success('ปฏิเสธ proposal แล้ว')
      handleRefresh()
    } catch (error) {
      console.error('Error rejecting proposal:', error)
      toast.error('ไม่สามารถปฏิเสธ proposal ได้')
    }
  }

  const handleCloseProposalModal = () => {
    setShowProposalModal(false)
    setEditingProposal(null)
  }

  // Filter proposals client-side
  const filteredProposals = proposals.filter((proposal) => {
    const leadName = proposal.sales_leads?.name || ''
    const matchesSearch =
      leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-300">📝 Draft</Badge>
      case "sent":
        return <Badge className="bg-blue-500">📤 Sent</Badge>
      case "viewed":
        return <Badge className="bg-purple-500">👁️ Viewed</Badge>
      case "accepted":
        return <Badge className="bg-green-500">✅ Accepted</Badge>
      case "rejected":
        return <Badge className="bg-red-500">❌ Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <>
    <main className="flex-1">
      {/* Header */}
      <div className="border-b bg-background dark:bg-gray-900">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/sales/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Proposals</h1>
                <p className="text-sm text-muted-foreground">จัดการข้อเสนอทั้งหมด</p>
              </div>
            </div>
            <Button onClick={() => setShowProposalModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4 lg:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">📝 Draft</div>
              <div className="text-2xl font-bold text-gray-500">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">📤 Sent</div>
              <div className="text-2xl font-bold text-blue-500">{stats.sent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">👁️ Viewed</div>
              <div className="text-2xl font-bold text-purple-500">{stats.viewed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">✅ Accepted</div>
              <div className="text-2xl font-bold text-green-500">{stats.accepted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="text-xl font-bold">฿{stats.totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by lead name or proposal title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">📝 Draft</SelectItem>
                  <SelectItem value="sent">📤 Sent</SelectItem>
                  <SelectItem value="viewed">👁️ Viewed</SelectItem>
                  <SelectItem value="accepted">✅ Accepted</SelectItem>
                  <SelectItem value="rejected">❌ Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Proposals Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProposals.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No proposals found</p>
              </CardContent>
            </Card>
          ) : (
            filteredProposals.map((proposal) => {
              const leadName = proposal.sales_leads?.name || 'Unknown Lead'
              const treatments = Array.isArray(proposal.treatments) 
                ? proposal.treatments.map((t: any) => t.name || t)
                : []
              
              return (
                <Card key={proposal.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{proposal.title}</CardTitle>
                        <CardDescription className="mt-1">For: {leadName}</CardDescription>
                      </div>
                      {getStatusBadge(proposal.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Value & Probability */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Value</div>
                          <div className="text-2xl font-bold">฿{Number(proposal.total_value).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Win Rate</div>
                          <div className="text-xl font-bold text-green-500">{proposal.win_probability}%</div>
                        </div>
                      </div>

                      {/* Treatments */}
                      {treatments.length > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Treatments</div>
                          <div className="flex flex-wrap gap-1">
                            {treatments.map((treatment, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {treatment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {proposal.sent_at && (
                          <div>
                            <div className="text-muted-foreground">Sent</div>
                            <div>{new Date(proposal.sent_at).toLocaleDateString()}</div>
                          </div>
                        )}
                        {proposal.valid_until && (
                          <div>
                            <div className="text-muted-foreground">Expires</div>
                            <div>{new Date(proposal.valid_until).toLocaleDateString()}</div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {proposal.status === "draft" ? (
                          <>
                            <Button size="sm" className="flex-1" onClick={() => handleEditProposal(proposal)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSendProposal(proposal.id)}>
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDeleteProposal(proposal.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  ลบ Draft
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        ) : proposal.status === "sent" ? (
                          <>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditProposal(proposal)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleAcceptProposal(proposal.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  ยอมรับ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectProposal(proposal.id)}>
                                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                  ปฏิเสธ
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditProposal(proposal)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </main>

    {/* Modals */}
    <ProposalModal
      open={showProposalModal}
      onClose={handleCloseProposalModal}
      onSuccess={handleRefresh}
      editProposal={editingProposal || undefined}
      leads={leads}
    />
  </>
  )
}
