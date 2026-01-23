"use client"

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
  PlusCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { UserManagementTable } from "@/components/admin/user-management-table"
import { ChannelSubscriber } from "@/components/realtime/ChannelSubscriber"
import { channels } from "@/lib/realtime/channels"
import { toast } from "sonner"
import { useLocalizePath } from "@/lib/i18n/locale-link"

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
  const lp = useLocalizePath()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("users")

  const handleRealtimeMessage = (msg: { type: string; data?: any }) => {
    if (msg.type === 'MAINTENANCE') {
      toast.warning(t('adminDashboard.maintenance' as any) || 'System Maintenance', {
        description: msg.data?.message || t('adminDashboard.scheduled' as any) || 'A scheduled synchronization is pending.',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest italic shadow-sm" variant="outline">
            <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
            {t('adminDashboard.status.confirmed' as any) || 'Synchronized'}
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-600 border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest italic shadow-sm" variant="outline">
            <Clock className="mr-2 h-3.5 w-3.5" />
            {t('adminDashboard.status.pending' as any) || 'Awaiting_Sync'}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-rose-50 text-rose-600 border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest italic shadow-sm" variant="outline">
            <XCircle className="mr-2 h-3.5 w-3.5" />
            {t('adminDashboard.status.cancelled' as any) || 'De-Authorized'}
          </Badge>
        )
      default:
        return <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black uppercase italic">{status}</Badge>
    }
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <ChannelSubscriber
        channels={[channels.system.maintenance]}
        onMessage={handleRealtimeMessage}
      />

      {/* Primary Metrics */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('adminDashboard.metrics.syncCycles' as any) || 'System Cycles', val: stats?.totalBookings || 0, sub: t('adminDashboard.globalBookings' as any) || 'Global Sequence Load', icon: Calendar, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: t('adminDashboard.metrics.verifiedEntities' as any) || 'Verified Entities', val: stats?.activeCustomers || 0, sub: t('adminDashboard.activeCustomers' as any) || 'Identity Nodes', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('adminDashboard.metrics.grossInflow' as any) || 'Global Inflow', val: `฿${(stats?.revenue || 0).toLocaleString()}`, sub: t('adminDashboard.monthlyRevenue' as any) || 'Gross Yield MTD', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('adminDashboard.metrics.conversionVelocity' as any) || 'Inference Velocity', val: `${stats?.conversionRate || 0}%`, sub: t('adminDashboard.efficiencyIndex' as any) || 'Efficiency Coefficient', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{stat.label}</CardTitle>
                <div className={cn("p-3 rounded-2xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase">{stat.val}</div>
                <p className="text-[9px] font-black uppercase tracking-widest mt-4 text-slate-400 italic group-hover:text-slate-600 transition-colors">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Control Infrastructure */}
      <div className="space-y-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-8 px-6">
          <h2 className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
              <Wrench className="h-8 w-8 text-pink-600" />
            </div>
            {t('adminDashboard.controlCenter' as any) || 'Command_Orchestration_Hub'}
          </h2>
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-slate-50 text-[10px] font-black uppercase tracking-[0.3em] italic">{t('adminDashboard.globalNodeAccess' as any) || 'Global_Node_Interface'}</Badge>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Personnel Registry', sub: 'Identity Access Management', href: '/admin/users', icon: UserCog, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Center Topology', sub: 'Network Node Allocation', href: '/admin/centers', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Security Matrix', sub: 'Threat Detection Sequence', href: '/admin/health', icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Audit Ledger', sub: 'Immutable Activity Stream', href: '/admin/logs', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Sync Stream', sub: 'Real-time WebSocket Pipeline', href: '/admin/system-status', icon: Radio, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { label: 'Protocol Refinement', sub: 'Core Logic Optimization', href: '/admin/settings', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Neural Analytics', sub: 'Deep Ingestion Matrix', href: '/admin/analytics', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Global Broadcast', sub: 'Multicast Event Relay', href: '/admin/settings', icon: Megaphone, color: 'text-pink-600', bg: 'bg-pink-50' }
          ].map((tool, i) => (
            <motion.div key={i} whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.5 }}>
              <Link href={lp(tool.href)}>
                <Card className="cursor-pointer border-slate-100 bg-white shadow-premium rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-700 group overflow-hidden relative h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-8 space-y-8 flex flex-col justify-between h-full">
                    <div className="flex items-center gap-6">
                      <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border border-slate-50 shadow-inner transition-all duration-700 group-hover:scale-110 group-hover:bg-white", tool.bg)}>
                        <tool.icon className={cn("h-8 w-8", tool.color)} />
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{tool.label}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">{tool.sub}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-pink-50 group-hover:text-pink-600 transition-all">
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Management Interface */}
      <div className="pt-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <div className="flex items-center justify-center">
            <TabsList className="bg-slate-50 border border-slate-100 p-2 rounded-[2rem] h-auto gap-3 shadow-inner flex-wrap justify-center">
              {[
                { value: 'users', label: 'Identity_Registry', icon: UserCog },
                { value: 'bookings', label: 'Process_Cycles', icon: Calendar },
                { value: 'centers', label: 'Node_Topology', icon: Building2 },
                { value: 'analytics', label: 'Inference_Matrix', icon: TrendingUp }
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="rounded-2xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-sm italic h-full"
                >
                  <tab.icon className="mr-3 h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <TabsContent value="users" className="mt-0 outline-none">
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('adminDashboard.management.identityTitle' as any) || 'Global_Entity_Database'}</CardTitle>
                          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('adminDashboard.management.identityDesc' as any) || 'Synchronized registry of all authorized system nodes'}</CardDescription>
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-none px-6 py-2 text-[10px] font-black tracking-[0.2em] uppercase italic shadow-sm">Identity_Module_Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <UserManagementTable />
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            )}

            {activeTab === 'bookings' && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <TabsContent value="bookings" className="mt-0 outline-none">
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('adminDashboard.management.processTitle' as any) || 'Aesthetic_Process_Log'}</CardTitle>
                          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('adminDashboard.management.processDesc' as any) || 'Real-time telemetry of active treatment cycles'}</CardDescription>
                        </div>
                        <Badge className="bg-pink-50 text-pink-600 border-none px-6 py-2 text-[10px] font-black tracking-[0.2em] uppercase italic shadow-sm">Cycle_Load: {bookings.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-white/50 border-b border-slate-100 hover:bg-white/50">
                              <TableHead className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('adminDashboard.table.identityNode' as any) || 'Entity_Node'}</TableHead>
                              <TableHead className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('adminDashboard.table.programType' as any) || 'Protocol_Class'}</TableHead>
                              <TableHead className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('adminDashboard.table.temporalStamp' as any) || 'Temporal_Stamp'}</TableHead>
                              <TableHead className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('adminDashboard.table.authStatus' as any) || 'Security_Status'}</TableHead>
                              <TableHead className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-slate-100">
                            {bookings.map((booking: any) => (
                              <TableRow key={booking.id} className="group/row transition-all duration-500 hover:bg-slate-50 relative">
                                <TableCell className="px-10 py-10">
                                  <div className="flex items-center gap-4">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500/30 group-hover/row:scale-150 group-hover/row:bg-blue-600 transition-all shadow-glow-blue/20" />
                                    <span className="text-base font-black text-slate-950 italic group-hover/row:text-pink-600 transition-colors uppercase tracking-tight leading-none">{booking.user?.full_name || booking.user?.email || 'UNDEFINED_ENTITY'}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-10 py-10">
                                  <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 text-[9px] font-black rounded-full px-4 py-1 italic uppercase tracking-widest group-hover/row:bg-white group-hover/row:text-slate-950 transition-all">{booking.program_type}</Badge>
                                </TableCell>
                                <TableCell className="px-10 py-10">
                                  <div className="space-y-1">
                                    <p className="text-base font-black text-slate-950 italic tracking-tighter leading-none">{booking.booking_date}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{booking.booking_time}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="px-10 py-10">{getStatusBadge(booking.status)}</TableCell>
                                <TableCell className="px-10 py-10 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-white text-slate-300 hover:text-pink-600 transition-all shadow-inner border border-transparent hover:border-slate-100">
                                        <MoreVertical className="h-5 w-5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-white border-slate-100 rounded-2xl p-2 shadow-premium min-w-[200px]">
                                      <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600 transition-colors gap-3"><Monitor className="h-4 w-4" /> Inspect_Node</DropdownMenuItem>
                                      <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600 transition-colors gap-3"><Zap className="h-4 w-4" /> Override_Cycle</DropdownMenuItem>
                                      <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-emerald-50 focus:text-emerald-600 transition-colors text-emerald-600 gap-3"><CheckCircle2 className="h-4 w-4" /> Verify_Entity</DropdownMenuItem>
                                      <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-rose-50 focus:text-rose-600 transition-colors text-rose-600 gap-3"><XCircle className="h-4 w-4" /> Decommission</DropdownMenuItem>
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
              </motion.div>
            )}

            {activeTab === 'centers' && (
              <motion.div
                key="centers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <TabsContent value="centers" className="mt-0 outline-none">
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-purple-500/20">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                      <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('adminDashboard.management.topologyTitle' as any) || 'Network_Node_Topology'}</CardTitle>
                          <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('adminDashboard.management.topologyDesc' as any) || 'Manage centralized infrastructure node allocation'}</CardDescription>
                        </div>
                        <div className="flex gap-4">
                          <div className="relative group/search">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within/search:text-purple-600 transition-colors" />
                            <Input 
                              placeholder="Search_Nodes..." 
                              className="h-14 pl-14 pr-8 rounded-2xl border-slate-100 bg-white text-slate-950 placeholder:text-slate-300 focus:border-purple-500/30 focus:ring-purple-500/10 transition-all text-sm font-bold italic w-[280px] shadow-inner" 
                              value={searchQuery} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} 
                            />
                          </div>
                          <Button variant="premium" className="h-14 px-8 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] italic shadow-2xl transition-all hover:scale-105 active:scale-95 border-none">
                            <PlusCircle className="mr-3 h-4 w-4" />
                            {t('adminDashboard.management.initializeNode' as any) || 'Initialize_Uplink'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-32 text-center space-y-10 italic bg-slate-50/30">
                      <div className="mx-auto h-32 w-32 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-inner">
                        <Monitor className="h-16 w-16" />
                      </div>
                      <div className="space-y-4">
                        <p className="text-2xl font-black text-slate-950 uppercase tracking-widest leading-none">{t('adminDashboard.management.syncing' as any) || 'Synchronizing_Matrix'}</p>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{t('adminDashboard.management.awaitingTelemetry' as any) || 'Awaiting global network telemetry packet ingestion'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <TabsContent value="analytics" className="mt-0 outline-none">
                  <div className="grid gap-12 lg:grid-cols-2">
                    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('aiAnalyticsDashboard.popularityMatrix' as any) || 'Protocol_Impact_Matrix'}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-10 lg:p-16 space-y-10">
                        {[
                          { name: "Neural Dermal Mapping", count: 45, percentage: 35, color: 'bg-pink-500 shadow-glow-pink' },
                          { name: "Cellular Rejuvenation", count: 38, percentage: 30, color: 'bg-blue-500 shadow-glow-blue' },
                          { name: "Volumetric Fill Sequence", count: 28, percentage: 22, color: 'bg-purple-500 shadow-glow-purple' },
                          { name: "Surface Synthesis", count: 17, percentage: 13, color: 'bg-emerald-500 shadow-glow-emerald' },
                        ].map((program, index) => (
                          <div key={index} className="space-y-4 group/item">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-400 group-hover/item:text-slate-950 transition-colors uppercase tracking-[0.2em] italic leading-none">{program.name}</span>
                              <span className="text-xl font-black text-slate-950 italic tracking-tighter leading-none">{program.count} <span className="text-[9px] text-slate-300 not-italic ml-1 uppercase">{t('aiAnalyticsDashboard.cycles' as any) || 'Cycles'}</span></span>
                            </div>
                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100 p-0.5">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${program.percentage}%` }} transition={{ duration: 1.5, delay: index * 0.1 }} className={cn("h-full rounded-full", program.color)} />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-emerald-500/20">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('aiAnalyticsDashboard.revenueBreakdown' as any) || 'Yield_Vector_Distribution'}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-10 lg:p-16 space-y-10">
                        {[
                          { category: "Aesthetic Protocol Nodes", amount: "฿180K", percentage: 73, color: 'bg-emerald-500 shadow-glow-emerald' },
                          { category: "Clinical Consultation Link", amount: "฿35K", percentage: 14, color: 'bg-blue-500 shadow-glow-blue' },
                          { category: "Dermal Product Ingestion", amount: "฿30K", percentage: 13, color: 'bg-pink-500 shadow-glow-pink' },
                        ].map((item, index) => (
                          <div key={index} className="space-y-4 group/item">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-400 group-hover/item:text-slate-950 transition-colors uppercase tracking-[0.2em] italic leading-none">{item.category}</span>
                              <span className="text-xl font-black text-slate-950 italic tracking-tighter leading-none">{item.amount}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100 p-0.5">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${item.percentage}%` }} transition={{ duration: 1.5, delay: index * 0.1 }} className={cn("h-full rounded-full", item.color)} />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}

function PlusCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  )
}
