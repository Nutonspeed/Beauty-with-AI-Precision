// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Search, MoreVertical, Phone, Mail, MessageSquare, FileText, UserPlus, ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"
import { AddLeadModal } from "@/components/sales/add-lead-modal"
import { AddActivityModal } from "@/components/sales/add-activity-modal"
import { toast } from "sonner"

type Lead = {
  id: string
  name: string
  email: string
  phone?: string | null
  status: string
  score: number
  source: string
  last_contact_at: string | null
  estimated_value: number
  primary_concern: string | null
  concern?: string
  budget_min?: number
  budget_max?: number
  preferred_date?: string
  notes?: string
  tags?: string[]
}

type Stats = {
  total: number
  hot: number
  warm: number
  cold: number
}

type LeadsClientProps = {
  initialLeads: Lead[]
  initialStats: Stats
}

export function LeadsClient({ initialLeads, initialStats }: LeadsClientProps) {
  const [leads, _setLeads] = useState<Lead[]>(initialLeads)
  const [stats, _setStats] = useState<Stats>(initialStats)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [activityType, setActivityType] = useState<string>('note')

  // Set up real-time subscription
  useEffect(() => {
    const supabase = createBrowserClient()

    const channel = supabase
      .channel('sales_leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales_leads'
        },
        (payload) => {
          console.log('[Leads] Real-time update:', payload)
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

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead)
    setShowAddModal(true)
  }

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ lead นี้? (จะเปลี่ยนสถานะเป็น Lost)')) {
      return
    }

    try {
      const response = await fetch(`/api/sales/leads/${leadId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete lead')
      }

      toast.success('ลบ lead สำเร็จ!')
      handleRefresh()
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast.error('ไม่สามารถลบ lead ได้')
    }
  }

  const handleAddActivity = (leadId: string, type: string = 'note') => {
    setSelectedLeadId(leadId)
    setActivityType(type)
    setShowActivityModal(true)
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setEditingLead(null)
  }

  const handleCloseActivityModal = () => {
    setShowActivityModal(false)
    setSelectedLeadId(null)
  }

  // Filter leads client-side
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery)

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    const matchesSource = sourceFilter === "all" || lead.source.toLowerCase() === sourceFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesSource
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "hot":
        return <Badge className="bg-red-500">🔥 Hot</Badge>
      case "warm":
        return <Badge className="bg-orange-500">⚡ Warm</Badge>
      case "cold":
        return <Badge className="bg-blue-500">❄️ Cold</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatSource = (source: string) => {
    const sourceMap: Record<string, string> = {
      'website': 'Website',
      'facebook': 'Facebook',
      'instagram': 'Instagram',
      'google_ads': 'Google Ads',
      'referral': 'Referral',
      'walk_in': 'Walk-in',
      'phone': 'Phone',
      'email': 'Email',
      'other': 'Other'
    }
    return sourceMap[source.toLowerCase()] || source
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
                  <h1 className="text-2xl font-bold">All Leads</h1>
                  <p className="text-sm text-muted-foreground">จัดการลูกค้าทั้งหมด</p>
                </div>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Leads</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">🔥 Hot Leads</div>
                <div className="text-2xl font-bold text-red-500">{stats.hot}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">⚡ Warm Leads</div>
                <div className="text-2xl font-bold text-orange-500">{stats.warm}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">❄️ Cold Leads</div>
                <div className="text-2xl font-bold text-blue-500">{stats.cold}</div>
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
                      placeholder="Search by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="hot">🔥 Hot</SelectItem>
                    <SelectItem value="warm">⚡ Warm</SelectItem>
                    <SelectItem value="cold">❄️ Cold</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="google_ads">Google Ads</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leads List ({filteredLeads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Concern</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{lead.email}</div>
                            <div className="text-muted-foreground">{lead.phone || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.score}</Badge>
                        </TableCell>
                        <TableCell>{formatSource(lead.source)}</TableCell>
                        <TableCell>{lead.primary_concern || lead.concern || 'N/A'}</TableCell>
                        <TableCell>฿{(lead.estimated_value || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          {lead.last_contact_at 
                            ? new Date(lead.last_contact_at).toLocaleDateString('th-TH')
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                                <Edit className="mr-2 h-4 w-4" />
                                แก้ไข
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAddActivity(lead.id, 'call')}>
                                <Phone className="mr-2 h-4 w-4" />
                                บันทึกการโทร
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddActivity(lead.id, 'email')}>
                                <Mail className="mr-2 h-4 w-4" />
                                บันทึกอีเมล
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddActivity(lead.id, 'meeting')}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                บันทึกการประชุม
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddActivity(lead.id, 'note')}>
                                <FileText className="mr-2 h-4 w-4" />
                                เพิ่มหมายเหตุ
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteLead(lead.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                ลบ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <AddLeadModal
        open={showAddModal}
        onClose={handleCloseAddModal}
        onSuccess={handleRefresh}
        editLead={editingLead || undefined}
      />
      
      {selectedLeadId && (
        <AddActivityModal
          open={showActivityModal}
          onClose={handleCloseActivityModal}
          onSuccess={handleRefresh}
          leadId={selectedLeadId}
          activityType={activityType}
        />
      )}
    </>
  )
}
