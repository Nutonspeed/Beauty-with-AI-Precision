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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">Synchronizing Personnel Registry...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="text-center space-y-6">
          <p className="text-rose-400 font-bold italic">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl border-white/10 text-white">Retry Connection</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-12 max-w-7xl mx-auto flex-1">
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
                  <UserCheck className="mr-3 h-3.5 w-3.5 animate-pulse" />
                  Global Identity Management
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                Personnel<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Registry</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Synchronize aesthetic operators and manage system-wide authentication credentials.
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Button size="xl" variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border">
                <Edit className="mr-3 h-5 w-5" />
                Bulk Authorization
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total User Registry', val: total, sub: 'Global Authorization Nodes', icon: Users, color: 'text-white', bg: 'bg-white/5' },
              { label: 'System Operators', val: users.filter((u: User) => u.role !== 'customer').length, sub: 'Active Personnel', icon: Shield, color: 'text-pink-400', bg: 'bg-pink-500/10' },
              { label: 'Aesthetic Reach', val: new Set(users.map((u: User) => u.centerId)).size, sub: 'Operational Units', icon: Building, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Security Protocols', val: 'End-to-End', sub: 'PDPA Validated', icon: Fingerprint, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{stat.label}</CardTitle>
                    <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-white tracking-tighter italic">{stat.val}</div>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-500 italic">{stat.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-600 group-focus-within:text-pink-500 transition-colors" />
              </div>
              <Input
                className="h-16 pl-16 pr-8 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all text-sm font-bold italic"
                placeholder="Search Personnel / Entities / Roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <select
                className="h-16 w-[200px] rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/30 appearance-none transition-all cursor-pointer italic"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all" className="bg-[#020617]">GLOBAL ROLES</option>
                <option value="super_admin" className="bg-[#020617]">SUPER ADMIN</option>
                <option value="center_owner" className="bg-[#020617]">OWNER NODE</option>
                <option value="center_staff" className="bg-[#020617]">OPERATOR</option>
                <option value="customer" className="bg-[#020617]">CLIENT UNIT</option>
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
                    <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Identity Node</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Access Protocol</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Aesthetic Uplink</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Temporal Last Sync</th>
                    <th className="px-10 py-8 text-right w-[70px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u: User, index: number) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group/row transition-all duration-500 hover:bg-white/[0.03]"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <Avatar className="h-14 w-14 rounded-2xl border border-white/10 group-hover/row:border-pink-500/30 transition-all shadow-inner">
                            <AvatarImage src={u.avatarUrl} className="object-cover" />
                            <AvatarFallback className="bg-white/[0.03] text-slate-500 font-black italic">
                              {getInitials(u.firstName, u.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="text-xl font-bold text-white tracking-tight italic group-hover/row:text-pink-400 transition-colors">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="flex flex-wrap gap-4">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic flex items-center gap-2">
                                <Mail className="h-3 w-3 text-pink-500/40" />
                                {u.email}
                              </span>
                              {u.phone && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-cyan-500/40" />
                                  {u.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <Badge className={cn(
                          "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner",
                          roleColors[u.role as keyof typeof roleColors] || 'bg-white/[0.03] text-slate-500'
                        )}>
                          {u.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover/row:border-cyan-500/30 transition-all">
                            <Building className="h-4 w-4 text-slate-600 group-hover/row:text-cyan-400" />
                          </div>
                          <span className="text-sm font-bold text-slate-300 italic group-hover/row:text-white transition-colors">
                            {u.centerName || 'STANDALONE NODE'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        {u.lastSignIn ? (
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-white italic">{new Date(u.lastSignIn).toLocaleDateString()}</div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">{new Date(u.lastSignIn).toLocaleTimeString()}</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-white/[0.02] text-[8px] font-black text-slate-700 border-white/5 uppercase italic">NEVER SYNCED</Badge>
                        )}
                      </td>
                      <td className="px-10 py-8 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 text-slate-500">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#020617] border-white/10 rounded-2xl p-2 min-w-[180px]">
                            <DropdownMenuLabel className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Protocol Access</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">
                              <Edit className="mr-3 h-4 w-4" />
                              Refine Parameter
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">
                              <Shield className="mr-3 h-4 w-4" />
                              Authorize Protocol
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-rose-600 focus:text-white transition-colors text-rose-500">
                              <Trash2 className="mr-3 h-4 w-4" />
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
                        Node {page} / {totalPages}
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
