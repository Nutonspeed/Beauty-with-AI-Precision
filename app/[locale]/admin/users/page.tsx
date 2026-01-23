'use client'

import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  Users, 
  Search, 
  Shield, 
  Mail, 
  Phone, 
  Building,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowLeft,
  UserCheck,
  Fingerprint
} from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { useLocalizePath } from '@/lib/i18n/locale-link'
import { useTranslations, useLocale } from 'next-intl'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface User {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
  phone: string
  avatarUrl: string
  centerId: string
  centerName: string
  createdAt: string
  lastSignIn: string | null
}

interface UsersResponse {
  users: User[]
  total: number
  limit: number
  offset: number
}

const roleColors = {
  super_admin: 'bg-red-500/10 text-red-400',
  admin: 'bg-blue-500/10 text-blue-400',
  center_owner: 'bg-purple-500/10 text-purple-400',
  center_admin: 'bg-indigo-500/10 text-indigo-400',
  manager: 'bg-green-500/10 text-green-400',
  center_staff: 'bg-gray-500/10 text-gray-400',
  customer: 'bg-yellow-500/10 text-yellow-400',
}

export default function AdminUsersPage() {
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const { user: authUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const lp = useLocalizePath()
  
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const totalPages = Math.ceil(total / limit)
  const page = Math.floor(offset / limit) + 1

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        role: roleFilter,
        q: searchQuery,
        limit: limit.toString(),
        offset: offset.toString(),
      })

      const response = await fetch(`/api/admin/users/list?${params}`)
      if (!response.ok) {
        throw new Error('Failed to load users')
      }

      const data: UsersResponse = await response.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Users loading error:', err)
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [roleFilter, searchQuery, limit, offset])

  useEffect(() => {
    if (authLoading) return
    
    if (!authUser || authUser.role !== 'super_admin') {
      router.push(lp('/unauthorized'))
      return
    }

    loadUsers()
  }, [authUser, authLoading, router, lp, loadUsers])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update role')
      }
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      console.error('Role update error:', err)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-950">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse italic">Synchronizing Personnel Registry...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-950 p-6">
        <Card className="max-w-md w-full border-rose-100 bg-rose-50/50 rounded-[2.5rem] p-10 text-center space-y-6">
          <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-rose-100">
            <AlertCircle className="h-10 w-10 text-rose-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter">Registry Sync Failed</h3>
            <p className="text-sm text-slate-500 font-light italic">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full h-14 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium">
            Retry Connection Sequence
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Personnel Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600" onClick={() => router.push(lp('/admin'))}>
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <UserCheck className="mr-3 h-3.5 w-3.5 animate-pulse" />
                  Global Identity Management
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Personnel<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Registry</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                Synchronize aesthetic operators and manage system-wide authentication credentials.
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Button size="xl" variant="premium" className="h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic">
                <Edit className="mr-4 h-6 w-6" />
                Bulk Authorization
              </Button>
            </div>
          </div>

          {/* Identity Metrics Hub */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Total User Registry', val: total, sub: 'Global Authorization Nodes', icon: Users, color: 'text-slate-950', bg: 'bg-slate-50' },
              { label: 'System Operators', val: users.filter((u: User) => u.role !== 'customer').length, sub: 'Active Personnel', icon: Shield, color: 'text-pink-600', bg: 'bg-pink-50' },
              { label: 'Aesthetic Reach', val: new Set(users.map((u: User) => u.centerId)).size, sub: 'Operational Units', icon: Building, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Security Protocols', val: 'End-to-End', sub: 'PDPA Validated', icon: Fingerprint, color: 'text-blue-600', bg: 'bg-blue-50' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardContent className="p-10">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                      <stat.icon className={cn("w-20 h-20", stat.color)} />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{stat.label}</p>
                      <div className={cn("text-3xl font-black tracking-tighter italic uppercase leading-none", stat.color)}>{stat.val}</div>
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-6 bg-slate-100 rounded-full group-hover:w-12 group-hover:bg-pink-500 transition-all duration-500" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic group-hover:text-slate-600">{stat.sub}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Filtering Node Interface */}
          <div className="grid gap-10 lg:grid-cols-12 items-end">
            <div className="lg:col-span-6 space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">Global Identity Search</Label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-blue-600/20 rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none z-20">
                  <Search className="h-6 w-6 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                </div>
                <Input
                  className="h-16 pl-20 pr-10 rounded-2xl border-slate-100 bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all text-base font-bold italic shadow-inner relative z-10"
                  placeholder="Search Personnel / Entities / Roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">Role Authorization</Label>
              <select
                className="h-16 w-full rounded-2xl border border-slate-100 bg-slate-50 px-8 text-sm font-black text-slate-950 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/30 appearance-none transition-all cursor-pointer italic uppercase shadow-inner"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">GLOBAL ROLES</option>
                <option value="super_admin">SUPER ADMIN</option>
                <option value="center_owner">OWNER NODE</option>
                <option value="center_staff">OPERATOR</option>
                <option value="customer">CLIENT UNIT</option>
              </select>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">Node Density</Label>
              <select
                className="h-16 w-full rounded-2xl border border-slate-100 bg-slate-50 px-8 text-sm font-black text-slate-950 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/30 appearance-none transition-all cursor-pointer italic uppercase shadow-inner"
                value={limit.toString()}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setOffset(0)
                }}
              >
                <option value="25">25 PER NODE</option>
                <option value="50">50 PER NODE</option>
                <option value="100">100 PER NODE</option>
              </select>
            </div>
          </div>

          {/* Personnel Node Registry Architecture */}
          <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10 group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Identity Node</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Access Protocol</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Aesthetic Uplink</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Temporal Sync</th>
                    <th className="px-10 py-8 text-right w-[70px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((u: User, index: number) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group/row transition-all duration-700 hover:bg-slate-50/50 relative"
                    >
                      <td className="px-10 py-10">
                        <div className="flex items-center gap-8">
                          <Avatar className="h-16 w-16 rounded-2xl border border-slate-100 shadow-inner group-hover/row:scale-110 transition-all duration-700">
                            <AvatarImage src={u.avatarUrl} className="object-cover" />
                            <AvatarFallback className="bg-slate-50 text-slate-400 font-black italic">
                              {getInitials(u.firstName, u.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1.5">
                            <div className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase group-hover/row:text-pink-600 transition-colors leading-none">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="flex flex-wrap gap-6">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-3">
                                <Mail className="h-3.5 w-3.5 text-pink-500/40" />
                                {u.email}
                              </span>
                              {u.phone && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-3">
                                  <Phone className="h-3.5 w-3.5 text-blue-500/40" />
                                  {u.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-10">
                        <Badge className={cn(
                          "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm italic",
                          u.role === 'super_admin' ? "bg-rose-50 text-rose-600" :
                          u.role === 'center_owner' ? "bg-purple-50 text-purple-600" :
                          u.role === 'customer' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {u.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-8 py-10">
                        <div className="flex items-center gap-4 group/up">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/row:bg-pink-50 transition-all duration-700">
                            <Building className="h-5 w-5 text-slate-300 group-hover/row:text-pink-600" />
                          </div>
                          <span className="text-sm font-black text-slate-500 italic group-hover/row:text-slate-950 transition-colors uppercase tracking-tight">
                            {u.centerName || 'STANDALONE NODE'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-10">
                        {u.lastSignIn ? (
                          <div className="space-y-2">
                            <div className="text-lg font-black text-slate-900 italic uppercase leading-none">{new Date(u.lastSignIn).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}</div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic leading-none">{new Date(u.lastSignIn).toLocaleTimeString()}</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-slate-50 text-slate-300 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase italic">NEVER SYNCED</Badge>
                        )}
                      </td>
                      <td className="px-10 py-10 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-pink-50 hover:text-pink-600 transition-all duration-500 shadow-inner">
                              <MoreHorizontal className="h-6 w-6" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-slate-100 rounded-3xl p-3 min-w-[220px] shadow-premium selection:bg-pink-500/10">
                            <DropdownMenuLabel className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Protocol Access</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600 transition-all gap-4 mb-1">
                              <Edit className="h-5 w-5 text-pink-500" />
                              Refine Parameter
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-blue-50 focus:text-blue-600 transition-all gap-4 mb-1">
                              <Shield className="h-5 w-5 text-blue-500" />
                              Authorize Protocol
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-rose-50 focus:text-rose-600 transition-all gap-4">
                              <Trash2 className="h-5 w-5 text-rose-500" />
                              Decommission Unit
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
              <div className="p-10 lg:p-12 border-t border-slate-50 bg-white">
                <Pagination>
                  <PaginationContent className="gap-6">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        className={cn(
                          "rounded-2xl border-slate-200 bg-slate-50 hover:bg-white text-[10px] font-black uppercase tracking-widest h-14 px-8 transition-all shadow-premium italic",
                          page === 1 && "opacity-20 pointer-events-none"
                        )}
                        onClick={(e) => {
                          e.preventDefault()
                          if (page > 1) setOffset(offset - limit)
                        }}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <div className="h-14 px-10 flex items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-2xl shadow-pink-500/20 font-black text-sm italic uppercase tracking-widest">
                        Sector {page} / {totalPages}
                      </div>
                    </PaginationItem>

                    <PaginationItem>
                      <div
                        className={cn(
                          "cursor-pointer rounded-2xl border-slate-200 bg-slate-50 hover:bg-white text-[10px] font-black uppercase tracking-widest h-14 px-8 transition-all shadow-premium italic flex items-center gap-2",
                          page === totalPages && "opacity-20 pointer-events-none"
                        )}
                        onClick={(e) => {
                          e.preventDefault()
                          if (page < totalPages) setOffset(offset + limit)
                        }}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
