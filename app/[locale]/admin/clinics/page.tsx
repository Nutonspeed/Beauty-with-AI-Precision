'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Shield,
  MoreHorizontal,
  Edit,
  Eye,
  ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { useLocalizePath } from '@/lib/i18n/locale-link'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface Clinic {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
  is_active: boolean
  created_at: string
  subscription_plan: string
  subscription_expires_at: string | null
  userCount: number
  ownerCount: number
  staffCount: number
  revenue30Days: number
  subscriptionStatus: 'active' | 'expired' | 'none'
}

interface ClinicsResponse {
  clinics: Clinic[]
  total: number
  limit: number
  offset: number
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
}

const subscriptionColors = {
  active: 'bg-blue-100 text-blue-800',
  expired: 'bg-orange-100 text-orange-800',
  none: 'bg-gray-100 text-gray-800',
}

export default function AdminClinicsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const lp = useLocalizePath()
  
  const [isLoading, setIsLoading] = useState(true)
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const totalPages = Math.ceil(total / limit)
  const page = Math.floor(offset / limit) + 1

  useEffect(() => {
    if (authLoading) return
    
    if (!user || user.role !== 'super_admin') {
      router.push(lp('/unauthorized'))
      return
    }

    loadClinics()
  }, [user, authLoading, router, lp, statusFilter, searchQuery, offset, limit])

  const loadClinics = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        q: searchQuery,
        limit: limit.toString(),
        offset: offset.toString(),
      })
      
      const response = await fetch(`/api/admin/clinics/list?${params}`)
      if (!response.ok) {
        throw new Error('Failed to load clinics')
      }
      
      const data: ClinicsResponse = await response.json()
      setClinics(data.clinics)
      setTotal(data.total)
    } catch (err) {
      console.error('Clinics loading error:', err)
      setError('Failed to load clinics')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('th-TH')
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Clinics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clinic Management</h1>
                <p className="text-sm text-gray-500">Manage clinics and their performance</p>
              </div>
            </div>
            <Button onClick={() => router.push(lp('/admin'))}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-green-600 font-medium">
                  {clinics.filter(c => c.is_active).length} Active
                </span>
              </div>
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs text-muted-foreground">Total Clinics</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-blue-600 font-medium">
                  {clinics.reduce((sum, c) => sum + c.userCount, 0)} Total
                </span>
              </div>
              <div className="text-2xl font-bold">
                {clinics.reduce((sum, c) => sum + c.ownerCount, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Clinic Owners</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-green-600 font-medium">Last 30 days</span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(clinics.reduce((sum, c) => sum + c.revenue30Days, 0))}
              </div>
              <div className="text-xs text-muted-foreground">Total Revenue</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-blue-600 font-medium">
                  {clinics.filter(c => c.subscriptionStatus === 'active').length}
                </span>
              </div>
              <div className="text-2xl font-bold">
                {clinics.filter(c => c.subscriptionStatus === 'expired').length}
              </div>
              <div className="text-xs text-muted-foreground">Expired Subscriptions</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clinics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded border bg-white px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                
                <select
                  value={limit.toString()}
                  onChange={(e) => {
                    setLimit(Number(e.target.value))
                    setOffset(0)
                  }}
                  className="rounded border bg-white px-3 py-2 text-sm"
                >
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinics List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Clinics ({total})</span>
              <Button variant="outline" size="sm">
                <Building className="h-4 w-4 mr-2" />
                Add New Clinic
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Clinic</th>
                    <th className="text-left py-3 px-4">Users</th>
                    <th className="text-left py-3 px-4">Revenue (30d)</th>
                    <th className="text-left py-3 px-4">Subscription</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clinics.map((clinic, index) => (
                    <motion.tr
                      key={clinic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{clinic.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {clinic.email}
                          </div>
                          {clinic.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {clinic.phone}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {clinic.city}, {clinic.province}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div>{clinic.userCount} total</div>
                          <div className="text-gray-500">
                            {clinic.ownerCount} owners, {clinic.staffCount} staff
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">
                          {formatCurrency(clinic.revenue30Days)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <Badge className={subscriptionColors[clinic.subscriptionStatus]}>
                            {clinic.subscriptionStatus}
                          </Badge>
                          {clinic.subscription_expires_at && (
                            <div className="text-xs text-gray-500">
                              Expires {formatDate(clinic.subscription_expires_at)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[clinic.is_active ? 'active' : 'inactive']}>
                          {clinic.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Clinic
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Users className="h-4 w-4 mr-2" />
                              Manage Users
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <DollarSign className="h-4 w-4 mr-2" />
                              View Revenue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (page > 1) setOffset(offset - limit)
                        }}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        {page}
                      </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (page < totalPages) setOffset(offset + limit)
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
