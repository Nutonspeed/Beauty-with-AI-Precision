"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
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
  FormDescription,
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
  User,
  Building,
  MessageSquare,
  CheckCircle,
  Loader2,
  Plus,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import type { Lead, LeadStatus } from "@/types/multi-tenant"

const updateFormSchema = z.object({
  status: z.enum(['new', 'contacted', 'hot', 'warm', 'cold', 'converted', 'lost']),
  follow_up_date: z.string().optional(),
  next_action: z.string().optional(),
  notes: z.string().optional(),
})

const interactionFormSchema = z.object({
  type: z.enum(['call', 'email', 'message', 'meeting', 'demo', 'follow_up', 'other']),
  notes: z.string().min(1, "Notes are required"),
})

const convertFormSchema = z.object({
  create_user_account: z.boolean().default(false),
  password: z.string().optional(),
  send_welcome_email: z.boolean().default(false),
})

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showInteractionDialog, setShowInteractionDialog] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)

  const analysisId = lead?.analysis?.id ?? null

  const updateForm = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      status: 'new',
      follow_up_date: '',
      next_action: '',
      notes: '',
    },
  })

  const interactionForm = useForm<z.infer<typeof interactionFormSchema>>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues: {
      type: 'call',
      notes: '',
    },
  })

  const convertForm = useForm<z.infer<typeof convertFormSchema>>({
    resolver: zodResolver(convertFormSchema),
    defaultValues: {
      create_user_account: false,
      password: '',
      send_welcome_email: false,
    },
  })

  // Fetch lead details
  useEffect(() => {
    fetchLead()
  }, [leadId])

  const fetchLead = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/leads/${leadId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch lead')
      }

      const result = await response.json()

      if (result.success) {
        const leadData: Lead = {
          ...result.data,
          interaction_history: result.data.interaction_history ?? [],
        }
        setLead(leadData)
        
        // Set form defaults
        updateForm.reset({
          status: result.data.status,
          follow_up_date: result.data.follow_up_date || '',
          next_action: result.data.next_action || '',
          notes: result.data.notes || '',
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('[LeadDetailPage] Error fetching lead:', error)
      toast.error('Failed to load lead')
      router.push('/sales/leads')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateLead = async (values: z.infer<typeof updateFormSchema>) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Failed to update lead')
      }

      const result = await response.json()

      if (result.success) {
        toast.success('Lead updated successfully')
        fetchLead()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('[LeadDetailPage] Error updating lead:', error)
      toast.error('Failed to update lead')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddInteraction = async (values: z.infer<typeof interactionFormSchema>) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          add_interaction: values,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add interaction')
      }

      const result = await response.json()

      if (result.success) {
        toast.success('Interaction added')
        setShowInteractionDialog(false)
        interactionForm.reset()
        fetchLead()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('[LeadDetailPage] Error adding interaction:', error)
      toast.error('Failed to add interaction')
    }
  }

  const handleConvert = async (values: z.infer<typeof convertFormSchema>) => {
    if (values.create_user_account && !values.password) {
      toast.error('Password is required to create user account')
      return
    }

    try {
      const response = await fetch(`/api/leads/${leadId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Failed to convert lead')
      }

      const result = await response.json()

      if (result.success) {
        toast.success('Lead converted successfully!')
        setShowConvertDialog(false)
        fetchLead()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('[LeadDetailPage] Error converting lead:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to convert lead')
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

  const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
    new: { label: "New", color: "bg-blue-500" },
    contacted: { label: "Contacted", color: "bg-purple-500" },
    hot: { label: "Hot", color: "bg-red-500" },
    warm: { label: "Warm", color: "bg-orange-500" },
    cold: { label: "Cold", color: "bg-gray-500" },
    converted: { label: "Converted", color: "bg-green-500" },
    lost: { label: "Lost", color: "bg-gray-400" },
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/sales/leads')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lead.full_name}</h1>
            <p className="text-muted-foreground">Lead ID: {lead.id.substring(0, 8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInteractionDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Interaction
          </Button>
          {lead.status !== 'converted' && (
            <Button onClick={() => setShowConvertDialog(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Convert to Customer
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
                    <span className="font-semibold">{lead.lead_score}/100</span>
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

              {lead.budget_range && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Budget Range</div>
                  <div>{lead.budget_range}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Interaction History</CardTitle>
              <CardDescription>
                {lead.interaction_history?.length || 0} interactions recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lead.interaction_history && lead.interaction_history.length > 0 ? (
                <div className="space-y-4">
                  {lead.interaction_history.map((interaction: any, index: number) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{interaction.type.replace('_', ' ')}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(interaction.date), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{interaction.notes}</p>
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
                    name="follow_up_date"
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
                    name="next_action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Action</FormLabel>
                        <FormControl>
                          <Input placeholder="Call to schedule appointment" {...field} />
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
                <div className="text-muted-foreground mb-1">Clinic</div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {lead.clinic?.name || 'N/A'}
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-muted-foreground mb-1">Sales Staff</div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {lead.sales_staff?.full_name || 'N/A'}
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

              {analysisId && (
                <>
                  <Separator />
                  <div>
                    <div className="text-muted-foreground mb-1">Skin Analysis</div>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => router.push(`/analysis/detail/${analysisId}`)}
                    >
                      View Analysis <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
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
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="message">Message</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="demo">Demo</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={interactionForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
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

      {/* Convert Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Customer</DialogTitle>
            <DialogDescription>
              Mark this lead as converted and optionally create a user account
            </DialogDescription>
          </DialogHeader>

          <Form {...convertForm}>
            <form onSubmit={convertForm.handleSubmit(handleConvert)} className="space-y-4">
              <FormField
                control={convertForm.control}
                name="create_user_account"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Create user account</FormLabel>
                      <FormDescription>
                        Allow customer to login and view their analyses
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {convertForm.watch('create_user_account') && (
                <FormField
                  control={convertForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Temporary password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Customer can change this after first login
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConvertDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Convert Lead
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
