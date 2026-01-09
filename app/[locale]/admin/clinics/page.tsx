'use client'

import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  Building, 
  Search, 
  Mail, 
  MapPin,
  DollarSign,
  Users,
  Shield,
  MoreHorizontal,
  Edit,
  Eye,
  ArrowLeft,
  Plus,
  Box
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { useTranslations, useLocale } from 'next-intl'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
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
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
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

  const loadClinics = useCallback(async () => {
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
  }, [statusFilter, searchQuery, limit, offset])

  useEffect(() => {
    if (authLoading) return
    
    if (!user || user.role !== 'super_admin') {
      router.push(lp('/unauthorized'))
      return
    }

    loadClinics()
  }, [user, authLoading, router, lp, loadClinics])

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
          {/* Clinics Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all" onClick={() => router.push(lp('/admin'))}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                  <Box className="mr-3 h-3.5 w-3.5 animate-pulse" />
                  Global Clinical Infrastructure
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                Clinic<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Management</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Synchronize and orchestrate clinical nodes across the global precision aesthetic network.
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Button size="xl" variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border">
                <Plus className="mr-3 h-5 w-5" />
                Provision New Node
              </Button>
            </div>
          </div>

          {/* Clinical Metrics Hub */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Node Registry', val: total, sub: `${clinics.filter((c: Clinic) => c.is_active).length} Active Nodes`, icon: Building, color: 'text-white' },
              { label: 'Global Personnel', val: clinics.reduce((sum: number, c: Clinic) => sum + (c.userCount || 0), 0), sub: `${clinics.reduce((sum: number, c: Clinic) => sum + (c.ownerCount || 0), 0)} Authorized Owners`, icon: Users, color: 'text-pink-400' },
              { label: 'Global Revenue (30d)', val: formatCurrency(clinics.reduce((sum: number, c: Clinic) => sum + (c.revenue30Days || 0), 0)), sub: 'System-wide Inflow', icon: DollarSign, color: 'text-emerald-400' },
              { label: 'Temporal Authorizations', val: clinics.filter((c: Clinic) => c.subscriptionStatus === 'expired').length, sub: 'Expired Plan Vectors', icon: Shield, color: 'text-rose-400' }
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
                    <div className={cn("text-3xl font-black tracking-tighter italic mb-2", stat.color)}>{stat.val}</div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">{stat.sub}</p>
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
                placeholder="Search Clinics / Nodes / Emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <select
                className="h-16 w-[200px] rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/30 appearance-none transition-all cursor-pointer italic"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all" className="bg-[#020617]">GLOBAL VIEW</option>
                <option value="active" className="bg-[#020617]">ACTIVE NODES</option>
                <option value="inactive" className="bg-[#020617]">DEACTIVATED</option>
              </select>

              <select
                className="h-16 w-[200px] rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/30 appearance-none transition-all cursor-pointer italic"
                value={limit.toString()}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setOffset(0)
                }}
              >
                <option value="25" className="bg-[#020617]">25 PER NODE</option>
                <option value="50" className="bg-[#020617]">50 PER NODE</option>
                <option value="100" className="bg-[#020617]">100 PER NODE</option>
              </select>
            </div>
          </div>

          {/* Clinical Node Registry Architecture */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="border border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Clinical Node</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Personnel Density</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Yield (30d)</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Authorization</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Status Vector</th>
                    <th className="px-10 py-8 text-right w-[70px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {clinics.map((clinic: Clinic, index: number) => (
                    <motion.tr
                      key={clinic.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group/row transition-all duration-500 hover:bg-white/[0.03]"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/row:border-pink-500/30 transition-all">
                            <Building className="h-7 w-7 text-slate-500 group-hover/row:text-pink-400 transition-colors" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xl font-bold text-white tracking-tight italic group-hover/row:text-pink-400 transition-colors">{clinic.name}</div>
                            <div className="flex flex-wrap gap-4">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic flex items-center gap-2">
                                <Mail className="h-3 w-3 text-pink-500/40" />
                                {clinic.email}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-cyan-500/40" />
                                {clinic.city}, {clinic.province}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-white italic">{clinic.userCount} Units</div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{clinic.ownerCount} Owners / {clinic.staffCount} Staff</p>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-xl font-black text-white italic tracking-tighter group-hover/row:text-emerald-400 transition-colors">
                          {formatCurrency(clinic.revenue30Days)}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="space-y-2">
                          <Badge className={cn(
                            "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner",
                            clinic.subscriptionStatus === 'active' ? "bg-blue-500/10 text-blue-400" : 
                            clinic.subscriptionStatus === 'expired' ? "bg-rose-500/10 text-rose-400" : "bg-white/[0.03] text-slate-600"
                          )}>
                            {clinic.subscription_plan || 'TRIAL'} ({clinic.subscriptionStatus})
                          </Badge>
                          {clinic.subscription_expires_at && (
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 pl-1 italic">EXPIRES: {formatDate(clinic.subscription_expires_at)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <Badge className={cn(
                          "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner",
                          clinic.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.03] text-slate-600"
                        )}>
                          {clinic.is_active ? 'NOMINAL' : 'OFFLINE'}
                        </Badge>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 text-slate-500">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#020617] border-white/10 rounded-2xl p-2 min-w-[180px]">
                            <DropdownMenuLabel className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Module Controls</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">
                              <Eye className="mr-3 h-4 w-4" />
                              Inspect Node
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">
                              <Edit className="mr-3 h-4 w-4" />
                              Refine Parameter
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">
                              <Users className="mr-3 h-4 w-4" />
                              Sync Personnel
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors text-emerald-400">
                              <DollarSign className="mr-3 h-4 w-4" />
                              Yield Analysis
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Registry Pagination Interface */}
            {totalPages > 1 && (
              <div className="p-8 lg:p-10 border-t border-white/5 bg-white/[0.01]">
                <Pagination>
                  <PaginationContent className="gap-4">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        className={cn(
                          "rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-12 px-6 transition-all",
                          page === 1 && "opacity-20 pointer-events-none"
                        )}
                        onClick={(e) => {
                          e.preventDefault()
                          if (page > 1) setOffset(offset - limit)
                        }}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <div className="h-12 px-6 flex items-center justify-center rounded-xl bg-pink-600 text-white shadow-2xl shadow-pink-600/40 font-black text-xs italic">
                        Sector {page} / {totalPages}
                      </div>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        className={cn(
                          "rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-12 px-6 transition-all",
                          page === totalPages && "opacity-20 pointer-events-none"
                        )}
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
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
