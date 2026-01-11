"use client"
// responsive-design

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Shield, 
  FileText, 
  Radio, 
  Wrench, 
  Megaphone, 
  Building2, 
  UserCog, 
  Zap, 
  ArrowRight, 
  Monitor, 
  LayoutDashboard 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { UserManagementTable } from "@/components/admin/user-management-table"
import { ChannelSubscriber } from "@/components/realtime/ChannelSubscriber"
import { channels } from "@/lib/realtime/channels"
import { toast } from "sonner"

interface AdminDashboardClientProps {
  stats: {
    totalBookings: number
    activeCustomers: number
    revenue: number
    conversionRate: number
  } | null
  bookings: any[]
}

export function AdminDashboardClient({ stats, bookings }: AdminDashboardClientProps) {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState("")

  const handleRealtimeMessage = (msg: { type: string; data?: any }) => {
    if (msg.type === 'MAINTENANCE') {
      toast.warning(t('adminDashboard.maintenance'), {
        description: msg.data?.message || t('adminDashboard.scheduled'),
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500/10 text-green md:text-green-700 border-green-500/20" variant="outline">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {t('adminDashboard.status.confirmed')}
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow md:text-yellow-700 border-yellow-500/20" variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            {t('adminDashboard.status.pending')}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-500/10 text-red md:text-red-700 border-red-500/20" variant="outline">
            <XCircle className="mr-1 h-3 w-3" />
            {t('adminDashboard.status.cancelled')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      {/* Realtime maintenance alerts subscription */}
      <ChannelSubscriber
        channels={[channels.system.maintenance]}
        onMessage={handleRealtimeMessage}
      />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Dashboard Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 pb-12 border-b border-white/5"
          >
            <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
              <LayoutDashboard className="mr-3 h-3.5 w-3.5 animate-pulse" />
              {t('adminDashboard.orchestration')}
            </Badge>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
              {t('nav.admin')}<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic font-black uppercase tracking-tight">Intelligence</span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
              {t('adminDashboard.commandDesc')}
            </p>
          </motion.div>

          {/* Core Metrics Grid - Infrastructure Nodes */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t('adminDashboard.metrics.syncCycles'), val: stats?.totalBookings || 0, sub: t('adminDashboard.globalBookings'), icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: t('adminDashboard.metrics.verifiedEntities'), val: stats?.activeCustomers || 0, sub: t('adminDashboard.activeCustomers'), icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: t('adminDashboard.metrics.grossInflow'), val: `฿${(stats?.revenue || 0).toLocaleString()}`, sub: t('adminDashboard.monthlyRevenue'), icon: DollarSign, color: 'text-pink-400', bg: 'bg-pink-500/10' },
              { label: t('adminDashboard.metrics.conversionVelocity'), val: `${stats?.conversionRate || 0}%`, sub: t('adminDashboard.efficiencyIndex'), icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
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

          {/* Tactical Control Hub */}
          <div className="space-y-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                <Wrench className="h-6 w-6 text-pink-500" />
                {t('adminDashboard.controlCenter')}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('adminDashboard.globalNodeAccess')}</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t('adminDashboard.tools.personnelRegistry.label'), sub: t('adminDashboard.tools.personnelRegistry.sub'), href: '/admin/users', icon: UserCog, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: t('adminDashboard.tools.centerUplinks.label'), sub: t('adminDashboard.tools.centerUplinks.sub'), href: '/super-admin', icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: t('adminDashboard.tools.securityMatrix.label'), sub: t('adminDashboard.tools.securityMatrix.sub'), href: '/super-admin', icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                { label: t('adminDashboard.tools.auditLedger.label'), sub: t('adminDashboard.tools.auditLedger.sub'), href: '/super-admin', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: t('adminDashboard.tools.syncStream.label'), sub: t('adminDashboard.tools.syncStream.sub'), href: '/super-admin', icon: Radio, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: t('adminDashboard.tools.databaseFlux.label'), sub: t('adminDashboard.tools.databaseFlux.sub'), href: '/super-admin', icon: Wrench, color: 'text-orange-400', bg: 'bg-orange-500/10', dev: true },
                { label: t('adminDashboard.tools.globalBroadcast.label'), sub: t('adminDashboard.tools.globalBroadcast.sub'), href: '/super-admin', icon: Megaphone, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                { label: t('adminDashboard.tools.neuralAnalytics.label'), sub: t('adminDashboard.tools.neuralAnalytics.sub'), href: '/super-admin', icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' }
              ].map((tool, i) => (
                <motion.div key={i} whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                  <Link href={tool.href}>
                    <Card className="cursor-pointer border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/[0.03] hover:border-pink-500/20 transition-all duration-500 group overflow-hidden relative shadow-xl h-full">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <CardContent className="p-8">
                        <div className="flex items-center gap-6">
                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110", tool.bg)}>
                            <tool.icon className={cn("h-6 w-6", tool.color)} />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-white italic tracking-tight group-hover:text-pink-400 transition-colors">{tool.label}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{tool.sub}</p>
                              {tool.dev && <Badge className="bg-orange-500/10 text-orange-400 border-none text-[7px] font-black italic rounded-full px-2">DEV_MODE</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end">
                          <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-pink-500 transition-all group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Comprehensive Management Interface */}
          <div className="pt-10">
            <Tabs defaultValue="users" className="space-y-10">
              <div className="flex items-center justify-center">
                <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl h-auto gap-2 flex-wrap justify-center">
                  {[
                    { value: 'users', label: t('adminDashboard.tabs.identityRegistry') },
                    { value: 'bookings', label: t('adminDashboard.tabs.processCycles') },
                    { value: 'centers', label: t('adminDashboard.tabs.nodeTopology') },
                    { value: 'analytics', label: t('adminDashboard.tabs.inferenceMatrix') }
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value} 
                      className="rounded-xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] italic h-full"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <TabsContent value="users" className="mt-0 outline-none">
                    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-2xl relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <CardHeader className="p-12 pb-6 border-b border-white/5">
                        <CardTitle className="text-3xl font-black text-white italic tracking-tighter uppercase">{t('adminDashboard.management.identityTitle')}</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('adminDashboard.management.identityDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <UserManagementTable />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="bookings" className="mt-0 outline-none">
                    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-2xl relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <CardHeader className="p-12 pb-6 border-b border-white/5">
                        <CardTitle className="text-3xl font-black text-white italic tracking-tighter uppercase">{t('adminDashboard.management.processTitle')}</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('adminDashboard.management.processDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-white/[0.02] border-b border-white/5">
                                <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('adminDashboard.table.identityNode')}</TableHead>
                                <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('adminDashboard.table.programType')}</TableHead>
                                <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('adminDashboard.table.temporalStamp')}</TableHead>
                                <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('adminDashboard.table.syncTime')}</TableHead>
                                <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('adminDashboard.table.authStatus')}</TableHead>
                                <TableHead className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-white/5">
                              {bookings.map((booking: any) => (
                                <TableRow key={booking.id} className="group/row transition-all duration-500 hover:bg-white/[0.03]">
                                  <TableCell className="px-10 py-8">
                                    <div className="text-base font-bold text-white italic group-hover/row:text-pink-400 transition-colors uppercase tracking-tight">{booking.user?.full_name || booking.user?.email || 'UNDEFINED_ENTITY'}</div>
                                  </TableCell>
                                  <TableCell className="px-8 py-8">
                                    <Badge variant="outline" className="bg-white/[0.02] border-white/10 text-slate-400 text-[10px] font-black rounded-lg px-4 py-1 italic uppercase tracking-widest">{booking.program_type}</Badge>
                                  </TableCell>
                                  <TableCell className="px-8 py-8 text-slate-300 font-bold italic">{booking.booking_date}</TableCell>
                                  <TableCell className="px-8 py-8 font-mono text-xs text-slate-500">{booking.booking_time}</TableCell>
                                  <TableCell className="px-8 py-8">{getStatusBadge(booking.status)}</TableCell>
                                  <TableCell className="px-10 py-8 text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 text-slate-500">
                                          <MoreVertical className="h-5 w-5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-[#020617] border-white/10 rounded-2xl p-2 min-w-[180px]">
                                        <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">{t('adminDashboard.dropdown.viewDetails')}</DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">{t('adminDashboard.dropdown.refineParameters')}</DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors text-emerald-400">{t('adminDashboard.dropdown.verifyNode')}</DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-rose-600 focus:text-white transition-colors text-rose-500">{t('adminDashboard.dropdown.decommission')}</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="centers" className="mt-6">
                    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-2xl relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <CardHeader className="p-12 border-b border-white/5">
                        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-3xl font-black text-white italic tracking-tighter uppercase">{t('adminDashboard.management.topologyTitle')}</CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('adminDashboard.management.topologyDesc')}</CardDescription>
                          </div>
                          <div className="flex gap-3">
                            <div className="relative group">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-pink-500 transition-colors" />
                              <Input 
                                placeholder={t('adminDashboard.searchPlaceholder')} 
                                className="h-14 pl-12 pr-6 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all font-bold italic w-[240px]" 
                                value={searchQuery} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} 
                              />
                            </div>
                            <Button variant="premium" className="h-14 px-8 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border">
                              {t('adminDashboard.management.initializeNode')}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-20 text-center space-y-6">
                        <Monitor className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-20" />
                        <p className="text-xl font-bold text-slate-500 italic uppercase tracking-widest">{t('adminDashboard.management.syncing')}</p>
                        <p className="text-sm text-slate-600 font-light italic leading-relaxed">{t('adminDashboard.management.awaitingTelemetry')}</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-0 outline-none">
                    <div className="grid gap-10 md:grid-cols-2">
                      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                          <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('aiAnalyticsDashboard.popularityMatrix')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 lg:p-12 space-y-10">
                          {[
                            { name: "Botox Program", count: 45, percentage: 35, color: 'from-blue-500 to-indigo-600' },
                            { name: "Dermal Inflow", count: 38, percentage: 30, color: 'from-purple-500 to-pink-600' },
                            { name: "Neural Laser Grid", count: 28, percentage: 22, color: 'from-cyan-500 to-blue-600' },
                            { name: "Chemical Dermal Layer", count: 17, percentage: 13, color: 'from-amber-500 to-orange-600' },
                          ].map((program, index) => (
                            <div key={index} className="space-y-4 group/item">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 group-hover/item:text-white transition-colors uppercase tracking-widest italic">{program.name}</span>
                                <span className="text-lg font-black text-white italic tracking-tighter">{program.count} <span className="text-[9px] text-slate-600 not-italic ml-1">{t('aiAnalyticsDashboard.cycles')}</span></span>
                              </div>
                              <div className="relative h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${program.percentage}%` }}
                                  transition={{ duration: 1.5, delay: index * 0.1 }}
                                  className={cn("h-full rounded-full bg-gradient-to-r", program.color)}
                                  style={{ boxShadow: `0 0 15px rgba(236,72,153,0.3)` }}
                                />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                          <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('aiAnalyticsDashboard.revenueBreakdown')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 lg:p-12 space-y-10">
                          {[
                            { category: "Aesthetic Protocols", amount: "฿180K", percentage: 73, color: 'from-emerald-500 to-teal-600' },
                            { category: "Consultation Uplink", amount: "฿35K", percentage: 14, color: 'from-blue-500 to-cyan-600' },
                            { category: "Dermal Products", amount: "฿30K", percentage: 13, color: 'from-pink-500 to-rose-600' },
                          ].map((item, index) => (
                            <div key={index} className="space-y-4 group/item">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 group-hover/item:text-white transition-colors uppercase tracking-widest italic">{item.category} {t('aiAnalyticsDashboard.vector')}</span>
                                <span className="text-lg font-black text-white italic tracking-tighter">{item.amount}</span>
                              </div>
                              <div className="relative h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.percentage}%` }}
                                  transition={{ duration: 1.5, delay: index * 0.1 }}
                                  className={cn("h-full rounded-full bg-gradient-to-r", item.color)}
                                  style={{ boxShadow: `0 0 15px rgba(16,185,129,0.3)` }}
                                />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2 border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                          <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('aiAnalyticsDashboard.activityStream')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 lg:p-12">
                          <div className="space-y-8">
                            {[
                              { action: t('aiAnalyticsDashboard.actions.newCycle'), entity: "Sarah Johnson", time: "5m ago", icon: Zap, color: 'text-blue-400' },
                              { action: t('aiAnalyticsDashboard.actions.inflowVerified'), entity: "Michael Chen", time: "1h ago", icon: DollarSign, color: 'text-emerald-400' },
                              { action: t('aiAnalyticsDashboard.actions.protocolTerminated'), entity: "Emma Wilson", time: "2h ago", icon: CheckCircle2, color: 'text-purple-400' },
                              { action: t('aiAnalyticsDashboard.actions.entityEstablished'), entity: "David Lee", time: "3h ago", icon: Users, color: 'text-pink-400' },
                            ].map((activity, index) => (
                              <div key={index} className="flex items-center justify-between border-b border-white/5 pb-6 last:border-0 last:pb-0 group/act">
                                <div className="flex items-center gap-6">
                                  <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/act:border-pink-500/30 transition-all">
                                    <activity.icon className={cn("h-5 w-5", activity.color)} />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-base font-bold text-white italic group-hover/act:text-pink-400 transition-colors uppercase tracking-tight">{activity.action}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{activity.entity} Node</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 italic">{activity.time}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}