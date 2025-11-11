'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import {
  Loader2,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Plus,
} from 'lucide-react'
import Link from 'next/link'

interface Invoice {
  id: string
  clinic_id: string
  invoice_number: string
  billing_period_start: string
  billing_period_end: string
  amount: number
  tax: number
  total: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_at: string | null
  created_at: string
  isOverdue: boolean
  clinics: {
    id: string
    name: string
    slug: string
    subscription_plan: string
  }
}

interface ClinicOption {
  id: string
  name: string
}

export default function BillingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clinics, setClinics] = useState<ClinicOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [clinicFilter, setClinicFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedClinicForInvoice, setSelectedClinicForInvoice] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (!loading && user && user.role !== 'super_admin') {
      router.push('/customer/dashboard')
    }
  }, [loading, user, router])

  useEffect(() => {
    async function loadData() {
      try {
        // Load invoices
        const invoicesResponse = await fetch('/api/admin/billing')
        if (invoicesResponse.ok) {
          const data = await invoicesResponse.json()
          setInvoices(data.invoices || [])
        }

        // Load clinics
        const clinicsResponse = await fetch('/api/tenant')
        if (clinicsResponse.ok) {
          const data = await clinicsResponse.json()
          setClinics(
            data.tenants?.map((t: any) => ({ id: t.id, name: t.settings.clinicName })) || []
          )
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        toast({
          title: '❌ Error',
          description: 'Failed to load billing data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'super_admin') {
      loadData()
    }
  }, [user, toast])

  const handleCreateInvoice = async () => {
    if (!selectedClinicForInvoice) {
      toast({
        title: '⚠️ Warning',
        description: 'Please select a clinic',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsCreating(true)
      const response = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: selectedClinicForInvoice,
        }),
      })

      if (response.ok) {
        toast({
          title: '✅ Success',
          description: 'Invoice created successfully',
        })

        // Reload invoices
        const reloadResponse = await fetch('/api/admin/billing')
        if (reloadResponse.ok) {
          const data = await reloadResponse.json()
          setInvoices(data.invoices || [])
        }

        setShowCreateDialog(false)
        setSelectedClinicForInvoice('')
      } else {
        const error = await response.json()
        toast({
          title: '❌ Error',
          description: error.error || 'Failed to create invoice',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create invoice:', error)
      toast({
        title: '❌ Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      setUpdatingInvoiceId(invoiceId)
      const response = await fetch('/api/admin/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        toast({
          title: '✅ Success',
          description: 'Invoice status updated',
        })

        // Reload invoices
        const reloadResponse = await fetch('/api/admin/billing')
        if (reloadResponse.ok) {
          const data = await reloadResponse.json()
          setInvoices(data.invoices || [])
        }
      } else {
        const error = await response.json()
        toast({
          title: '❌ Error',
          description: error.error || 'Failed to update invoice',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to update invoice:', error)
      toast({
        title: '❌ Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setUpdatingInvoiceId(null)
    }
  }

  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/admin/billing/download?id=${invoiceId}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        toast({
          title: '✅ Success',
          description: 'Invoice downloaded successfully',
        })
      } else {
        toast({
          title: '❌ Error',
          description: 'Failed to download invoice',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to download invoice:', error)
      toast({
        title: '❌ Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Loading billing data...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || user.role !== 'super_admin') {
    return null
  }

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const statusMatch = statusFilter === 'all' || invoice.status === statusFilter
    const clinicMatch = clinicFilter === 'all' || invoice.clinic_id === clinicFilter
    return statusMatch && clinicMatch
  })

  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0)
  
  const pendingAmount = invoices
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + i.total, 0)
  
  const overdueAmount = invoices
    .filter((i) => i.isOverdue)
    .reduce((sum, i) => sum + i.total, 0)
  
  const overdueCount = invoices.filter((i) => i.isOverdue).length

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      )
    }

    const config = {
      paid: {
        icon: CheckCircle,
        className: 'bg-green-500/10 text-green-600 border-green-500/20',
      },
      pending: {
        icon: Clock,
        className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      },
      cancelled: {
        icon: XCircle,
        className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      },
      overdue: {
        icon: AlertTriangle,
        className: 'bg-red-500/10 text-red-600 border-red-500/20',
      },
    }

    const { icon: Icon, className } = config[status as keyof typeof config] || config.pending

    return (
      <Badge variant="outline" className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Billing & Invoices</h1>
            <p className="text-muted-foreground">Manage invoices and track payments</p>
          </div>
          <div className="flex gap-2">
            <Link href="/super-admin">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ฿{totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Paid invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                ฿{pendingAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {invoices.filter((i) => i.status === 'pending').length} invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ฿{overdueAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{overdueCount} invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={clinicFilter} onValueChange={setClinicFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by clinic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clinics</SelectItem>
              {clinics.map((clinic) => (
                <SelectItem key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => {
            const daysUntilDue = getDaysUntilDue(invoice.due_date)
            const clinic = Array.isArray(invoice.clinics) ? invoice.clinics[0] : invoice.clinics

            return (
              <Card key={invoice.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                        {getStatusBadge(invoice.status, invoice.isOverdue)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Clinic:</span> {clinic?.name}
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span> ฿
                          {invoice.total.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Billing Period:</span>{' '}
                          {new Date(invoice.billing_period_start).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div>
                          <span className="font-medium">Due Date:</span>{' '}
                          <span
                            className={
                              invoice.isOverdue
                                ? 'text-red-600 font-semibold'
                                : daysUntilDue <= 7
                                ? 'text-yellow-600 font-semibold'
                                : ''
                            }
                          >
                            {new Date(invoice.due_date).toLocaleDateString('en-US')}
                            {invoice.status === 'pending' &&
                              !invoice.isOverdue &&
                              ` (${daysUntilDue} days)`}
                          </span>
                        </div>
                        {invoice.paid_at && (
                          <div>
                            <span className="font-medium">Paid:</span>{' '}
                            {new Date(invoice.paid_at).toLocaleDateString('en-US')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>

                      {invoice.status === 'pending' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleUpdateStatus(invoice.id, 'paid')}
                          disabled={updatingInvoiceId === invoice.id}
                        >
                          {updatingInvoiceId === invoice.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Paid
                            </>
                          )}
                        </Button>
                      )}

                      {invoice.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(invoice.id, 'cancelled')}
                          disabled={updatingInvoiceId === invoice.id}
                          className="text-red-600"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredInvoices.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">No invoices found</div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Generate an invoice for the current billing period
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="clinic">Select Clinic</Label>
            <Select value={selectedClinicForInvoice} onValueChange={setSelectedClinicForInvoice}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
