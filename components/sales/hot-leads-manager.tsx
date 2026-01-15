"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Loader2, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import { HotLeadCard } from "./hot-lead-card"
import { cn } from "@/lib/utils"

export function HotLeadsManager() {
  const t = useTranslations()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sales/hot-leads?limit=50')
      const result = await response.json()
      if (result.leads) {
        setLeads(result.leads)
      }
    } catch (error) {
      console.error('Failed to fetch hot leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
    // Poll for updates every 30s to keep telemetry fresh
    const interval = setInterval(fetchLeads, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot": return "bg-red-100 text-red-800"
      case "active": return "bg-blue-100 text-blue-800"
      case "warm": return "bg-orange-100 text-orange-800"
      case "new": return "bg-blue-100 text-blue-800"
      case "cold": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "hot": return `🔥 ${t('salesLeads.status.hot') || 'HOT'}`
      case "active": return `⚡ ${t('salesLeads.status.active') || 'ACTIVE'}`
      case "warm": return `🌡️ ${t('salesLeads.status.warm') || 'WARM'}`
      case "new": return `🆕 ${t('salesLeads.status.new') || 'NEW'}`
      case "cold": return `❄️ ${t('salesLeads.status.cold') || 'COLD'}`
      default: return status.toUpperCase()
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical": return "CRITICAL"
      case "high": return t('hotLeadsManager.priorities.high')
      case "medium": return t('hotLeadsManager.priorities.medium')
      case "low": return t('hotLeadsManager.priorities.low')
      default: return priority.toUpperCase()
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.topConcern.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    const matchesPriority = priorityFilter === "all" || lead.priorityScore.priorityLevel === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading && leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Syncing live engagement nodes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Filters */}
      <Card className="border-white/10 bg-slate-900/20 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl ring-1 ring-white/10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 relative z-10" />
                <Input
                  placeholder={t('hotLeadsManager.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-pink-500/40 relative z-10 italic"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 h-12 rounded-xl border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest italic">
                  <SelectValue placeholder="Status Node" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 rounded-xl">
                  <SelectItem value="all" className="text-[10px] font-black uppercase italic tracking-widest">All Nodes</SelectItem>
                  <SelectItem value="active" className="text-[10px] font-black uppercase italic tracking-widest text-blue-400">Active Nodes</SelectItem>
                  <SelectItem value="hot" className="text-[10px] font-black uppercase italic tracking-widest text-rose-400">Hot Leads</SelectItem>
                  <SelectItem value="new" className="text-[10px] font-black uppercase italic tracking-widest text-emerald-400">New Syncs</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48 h-12 rounded-xl border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest italic">
                  <SelectValue placeholder="Priority Vector" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 rounded-xl">
                  <SelectItem value="all" className="text-[10px] font-black uppercase italic tracking-widest">All Vectors</SelectItem>
                  <SelectItem value="critical" className="text-[10px] font-black uppercase italic tracking-widest text-rose-500">Critical Priority</SelectItem>
                  <SelectItem value="high" className="text-[10px] font-black uppercase italic tracking-widest text-orange-400">High Priority</SelectItem>
                  <SelectItem value="medium" className="text-[10px] font-black uppercase italic tracking-widest text-blue-400">Medium Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Interface */}
      <Tabs defaultValue="list" className="w-full space-y-8">
        <div className="flex justify-center">
          <TabsList className="bg-white/[0.03] border border-white/10 p-1.5 rounded-2xl h-auto gap-2 ring-1 ring-white/5">
            <TabsTrigger value="list" className="rounded-xl px-10 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] italic">
              {t('hotLeadsManager.listTab')}
            </TabsTrigger>
            <TabsTrigger value="kanban" className="rounded-xl px-10 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] italic">
              {t('hotLeadsManager.kanbanTab')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="space-y-6 outline-none">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-20 space-y-6">
              <div className="h-20 w-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto opacity-20 shadow-inner ring-1 ring-white/5">
                <Users className="h-10 w-10 text-white" />
              </div>
              <p className="text-slate-500 italic text-sm tracking-widest uppercase font-black">No matching engagement nodes detected.</p>
            </div>
          ) : (
            filteredLeads.map((lead, idx) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <HotLeadCard 
                  lead={{
                    ...lead,
                    estimatedValue: lead.estimatedValue || 0,
                    analysisData: lead.analysisData || {}
                  }} 
                />
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="kanban" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {["hot", "active", "new", "cold"].map((status) => (
              <div key={status} className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic leading-none">{getStatusLabel(status)}</h3>
                  <Badge className={cn("rounded-lg text-[10px] font-black border-none px-3 py-0.5 shadow-lg ring-1 ring-white/5", getStatusColor(status))}>
                    {filteredLeads.filter(l => l.status === status).length}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {filteredLeads
                    .filter(lead => lead.status === status)
                    .map((lead) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        className="p-5 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-pink-500/20 transition-all duration-500 cursor-pointer shadow-2xl ring-1 ring-white/5 group"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="h-10 w-10 rounded-xl ring-2 ring-white/10 group-hover:ring-pink-500/30 transition-all duration-500">
                            <AvatarImage src={lead.photo} />
                            <AvatarFallback className="bg-slate-800 text-white font-black text-xs">{lead.initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-white italic truncate uppercase tracking-tight">{lead.name}</p>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest truncate">{lead.topConcern}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs border-t border-white/5 pt-4">
                          <span className="font-black text-emerald-400 italic tracking-tighter">฿{lead.estimatedValue.toLocaleString()}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-blue-500" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{lead.score}%</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  {filteredLeads.filter(lead => lead.status === status).length === 0 && (
                    <div className="text-center py-12 rounded-[2.5rem] border border-dashed border-white/5 bg-white/[0.01]">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-700 italic">Neutral Node Empty</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
