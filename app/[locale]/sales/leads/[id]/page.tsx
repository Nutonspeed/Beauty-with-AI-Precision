"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useLocalizePath } from "@/lib/i18n/locale-link"
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
  DialogDescription,
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
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Loader2,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

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
  interested_treatments?: string[] | null
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
      subject: 'โทรติดตาม',
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
        if (!['sales_staff', 'clinic_admin', 'clinic_owner', 'super_admin'].includes(roleData.role)) {
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
      const treatmentsRaw = Array.isArray(recs) ? recs : []
      const treatments = treatmentsRaw.length
        ? treatmentsRaw.map((r: any) => ({
            name: r?.title_th || r?.title_en || r?.name || "Treatment",
            price: Number(r?.price || 0),
            sessions: Number(r?.sessions || 1),
            description: r?.description_th || r?.description_en || r?.description || "",
            service_id: r?.service_id ?? null,
          }))
        : [
            {
              name: "Consultation",
              price: 0,
              sessions: 1,
              description: lead.primary_concern ? `Concern: ${lead.primary_concern}` : "",
              service_id: null,
            },
          ]

      const subtotal = treatments.reduce((sum: number, t: any) => sum + (Number(t.price) || 0), 0)

      const res = await fetch("/api/sales/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          title: `Proposal for ${lead.name}`,
          treatments,
          subtotal,
          discount_percent: 0,
          discount_amount: 0,
          total_value: subtotal,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to create proposal")
      }

      const proposal = await res.json()
      toast.success("สร้าง Proposal สำเร็จ")
      if (proposal?.id) {
        router.push(`/sales/proposals/${proposal.id}`)
      }
    } catch (error) {
      console.error("Create proposal failed:", error)
      toast.error(error instanceof Error ? error.message : "สร้าง Proposal ไม่สำเร็จ")
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
        throw new Error('Failed to fetch lead')
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
      toast.error('Failed to load lead')
      router.push(lp('/sales/leads'))
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, leadId, updateForm, router, lp])

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
        throw new Error('Failed to update lead')
      }

      const result = await response.json()

      if (result?.data) {
        toast.success('อัปเดต Lead สำเร็จ')
        setLead(result.data)
        fetchLead()
      } else {
        toast.success('อัปเดต Lead สำเร็จ')
        fetchLead()
      }
    } catch (error) {
      console.error('[LeadDetailPage] Error updating lead:', error)
      toast.error('อัปเดต Lead ไม่สำเร็จ')
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
        throw new Error('Failed to add interaction')
      }

      toast.success('บันทึกกิจกรรมสำเร็จ')
      setShowInteractionDialog(false)
      interactionForm.reset({ type: 'call', subject: 'โทรติดตาม', description: '' })
      fetchLead()
    } catch (error) {
      console.error('[LeadDetailPage] Error adding interaction:', error)
      toast.error('บันทึกกิจกรรมไม่สำเร็จ')
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(lp('/sales/leads'))}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lead.name}</h1>
            <p className="text-muted-foreground">Lead ID: {lead.id.substring(0, 8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInteractionDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Interaction
          </Button>
          <Button variant="outline" onClick={handleCreateProposal} disabled={isCreatingProposal}>
            {isCreatingProposal ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create Proposal
          </Button>
          {lead.status !== 'won' && (
            <Button
              onClick={async () => {
                try {
                  const res = await fetch(`/api/sales/leads/${leadId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'won' }),
                  })
                  if (!res.ok) throw new Error('Failed')
                  toast.success('ปิดการขายสำเร็จ (Won)')
                  fetchLead()
                } catch {
                  toast.error('ปิดการขายไม่สำเร็จ')
                }
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Won
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <Badge className={`${STATUS_CONFIG[lead.status].color} text-white`}>
                    {STATUS_CONFIG[lead.status].label}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Lead Score</div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-semibold">{lead.score}/100</span>
                  </div>
                </div>
              </div>

              {lead.phone && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Phone</div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {lead.phone}
                  </div>
                </div>
              )}

              {lead.email && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Email</div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {lead.email}
                  </div>
                </div>
              )}

              {lead.interested_treatments && lead.interested_treatments.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Interested Treatments</div>
                  <div className="flex flex-wrap gap-2">
                    {lead.interested_treatments.map((treatment: string) => (
                      <Badge key={treatment} variant="secondary">
                        {treatment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(lead.budget_range_min != null || lead.budget_range_max != null) && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Budget Range</div>
                  <div>
                    {lead.budget_range_min != null ? `${lead.budget_range_min.toLocaleString()} ฿` : '-'}
                    {' - '}
                    {lead.budget_range_max != null ? `${lead.budget_range_max.toLocaleString()} ฿` : '-'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Interaction History</CardTitle>
              <CardDescription>
                {activities.length} interactions recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((interaction, index: number) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{String(interaction.type).replace('_', ' ')}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(interaction.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{interaction.description || interaction.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No interactions recorded yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Update Form */}
          <Card>
            <CardHeader>
              <CardTitle>Update Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(handleUpdateLead)} className="space-y-4">
                  <FormField
                    control={updateForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                              <SelectItem key={value} value={value}>
                                {config.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="preferred_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Lead'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Sales Staff</div>
                <div className="flex items-center gap-2">
                  <span>{lead.sales_user?.full_name || 'N/A'}</span>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-muted-foreground mb-1">Created</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(lead.created_at), "MMM d, yyyy")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Interaction Dialog */}
      <Dialog open={showInteractionDialog} onOpenChange={setShowInteractionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Interaction</DialogTitle>
            <DialogDescription>
              Record a new interaction with this lead
            </DialogDescription>
          </DialogHeader>

          <Form {...interactionForm}>
            <form onSubmit={interactionForm.handleSubmit(handleAddInteraction)} className="space-y-4">
              <FormField
                control={interactionForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={interactionForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="หัวข้อกิจกรรม" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={interactionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What did you discuss?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInteractionDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Interaction</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
