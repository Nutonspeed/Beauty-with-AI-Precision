"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { 
  FileText, 
  ArrowLeft, 
  Search, 
  User, 
  Eye, 
  Download, 
  Trash2, 
  Filter,
  Calendar
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { th, enUS } from "date-fns/locale"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { useTranslations, useLocale } from "next-intl"

interface PresentationRecord {
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  status: 'completed' | 'incomplete'
  currentStep: number
  totalSteps: number
  createdAt: Date
  completedAt: Date | null
  totalValue: number
  signature: string | null
}

export default function PresentationsPage() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = useLocalizePath()
  const dateLocale = locale === 'th' ? th : enUS

  const STEP_NAMES = [
    t('salesPresentations.steps.customerInfo'),
    t('salesPresentations.steps.scan'),
    t('salesPresentations.steps.analysis'),
    t('salesPresentations.steps.arPreview'),
    t('salesPresentations.steps.products'),
    t('salesPresentations.steps.proposal'),
    t('salesPresentations.steps.signature')
  ]

  const [presentations, setPresentations] = useState<PresentationRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPresentations()
  }, [])

  const loadPresentations = () => {
    try {
      const records: PresentationRecord[] = []
      
      // Scan localStorage for all presentations
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('sales-presentation-')) {
          const customerId = key.replace('sales-presentation-', '')
          const dataStr = localStorage.getItem(key)
          
          if (dataStr) {
            const data = JSON.parse(dataStr)
            
            // Calculate current step
            let currentStep = 0
            if (data.customer?.name) currentStep = 1
            if (data.scannedImages?.front) currentStep = 2
            if (data.analysisResults) currentStep = 3
            if (data.selectedTreatments?.length > 0) currentStep = 4
            if (data.selectedProducts?.length > 0) currentStep = 5
            if (data.proposal) currentStep = 6
            if (data.signature) currentStep = 7
            
            const status = data.completedAt ? 'completed' : 'incomplete'
            const totalValue = data.proposal?.total || 0
            
            records.push({
              customerId,
              customerName: data.customer?.name || 'Unknown',
              customerPhone: data.customer?.phone || '',
              customerEmail: data.customer?.email || '',
              status,
              currentStep,
              totalSteps: 7,
              createdAt: new Date(), // Would be better to store creation time
              completedAt: data.completedAt ? new Date(data.completedAt) : null,
              totalValue,
              signature: data.signature
            })
          }
        }
      }
      
      setPresentations(records)
    } catch (error) {
      console.error('Error loading presentations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (customerId: string) => {
    if (confirm(t('salesPresentations.card.deleteConfirm'))) {
      localStorage.removeItem(`sales-presentation-${customerId}`)
      loadPresentations()
    }
  }

  // Filter and sort presentations
  const filteredPresentations = useMemo(() => {
    let filtered = presentations

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.customerName.toLowerCase().includes(query) ||
        p.customerPhone.includes(query) ||
        p.customerEmail.toLowerCase().includes(query)
      )
    }

    // Sort
    switch (sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case 'date-asc':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case 'value-desc':
        filtered.sort((a, b) => b.totalValue - a.totalValue)
        break
      case 'value-asc':
        filtered.sort((a, b) => a.totalValue - b.totalValue)
        break
      case 'name-asc':
        filtered.sort((a, b) => a.customerName.localeCompare(b.customerName))
        break
    }

    return filtered
  }, [presentations, searchQuery, filterStatus, sortBy])

  // Statistics
  const stats = useMemo(() => {
    const total = presentations.length
    const completed = presentations.filter(p => p.status === 'completed').length
    const incomplete = total - completed
    const totalValue = presentations
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.totalValue, 0)
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, incomplete, totalValue, completionRate }
  }, [presentations])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <Header />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          </div>
        </main>
        <Footer />
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
          {/* Presentations Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <FileText className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Visual Narrative Archive
              </Badge>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                Sales<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Archive</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Synchronized historical presentations and diagnostic transformation logs.
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Link href={lp('/sales/dashboard')}>
                <Button size="xl" variant="outline" className="h-16 px-10 rounded-2xl border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-white/10 italic">
                  <ArrowLeft className="mr-3 h-5 w-5" />
                  Terminal Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Precision Metrics Hub */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: t('salesPresentations.stats.total'), val: stats.total, color: 'text-white' },
              { label: t('salesPresentations.stats.completed'), val: stats.completed, color: 'text-emerald-400' },
              { label: t('salesPresentations.stats.incomplete'), val: stats.incomplete, color: 'text-rose-400' },
              { label: t('salesPresentations.stats.completionRate'), val: `${stats.completionRate}%`, color: 'text-cyan-400' },
              { label: t('salesPresentations.stats.totalValue'), val: stats.totalValue.toLocaleString(), color: 'text-purple-400', currency: true }
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
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 italic">{stat.label}</p>
                    <div className={cn("text-3xl font-black tracking-tighter italic", stat.color)}>
                      {stat.currency && <span className="text-sm mr-1 font-normal opacity-50">฿</span>}
                      {stat.val}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Filtering Node Interface */}
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-600 group-focus-within:text-pink-500 transition-colors" />
                  </div>
                  <Input
                    className="h-16 pl-16 pr-8 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all text-sm font-bold italic"
                    placeholder={t('salesPresentations.filters.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[200px] h-16 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-6 text-[10px] font-black uppercase tracking-widest italic">
                      <Filter className="h-4 w-4 mr-3 text-pink-500/60" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                      <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.allStatus')}</SelectItem>
                      <SelectItem value="completed" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.completed')}</SelectItem>
                      <SelectItem value="incomplete" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.incomplete')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[220px] h-16 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-6 text-[10px] font-black uppercase tracking-widest italic">
                      <Calendar className="h-4 w-4 mr-3 text-cyan-500/60" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                      <SelectItem value="date-desc" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.sortBy.dateDesc')}</SelectItem>
                      <SelectItem value="date-asc" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.sortBy.dateAsc')}</SelectItem>
                      <SelectItem value="value-desc" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.sortBy.valueDesc')}</SelectItem>
                      <SelectItem value="value-asc" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.sortBy.valueAsc')}</SelectItem>
                      <SelectItem value="name-asc" className="text-[10px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.sortBy.nameAsc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Sequence */}
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between px-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">
                {t('salesPresentations.list.showing', { count: filteredPresentations.length, total: presentations.length })}
              </p>
            </div>

            <div className="grid gap-6">
              <AnimatePresence>
                {filteredPresentations.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] p-20 text-center space-y-6">
                      <div className="h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-700 mx-auto">
                        <FileText className="h-10 w-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-500 italic">{t('salesPresentations.list.noData')}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                          {searchQuery || filterStatus !== 'all' 
                            ? t('salesPresentations.list.noDataDesc')
                            : t('salesPresentations.list.empty')}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ) : (
                  filteredPresentations.map((presentation, index) => (
                    <motion.div
                      key={presentation.customerId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 group relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-pink-600/20 group-hover:bg-pink-600 transition-colors" />
                        <CardContent className="p-8 lg:p-10">
                          <div className="flex flex-col lg:flex-row items-center gap-10">
                            {/* Left: Identity Hub */}
                            <div className="flex-1 w-full space-y-6">
                              <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover:border-pink-500/30 transition-all">
                                  <User className="h-8 w-8 text-slate-500 group-hover:text-pink-400 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                  <h3 className="text-3xl font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{presentation.customerName}</h3>
                                  <div className="flex flex-wrap gap-4">
                                    {presentation.customerPhone && (
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-pink-500/40" />
                                        {presentation.customerPhone}
                                      </span>
                                    )}
                                    {presentation.customerEmail && (
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-cyan-500/40" />
                                        {presentation.customerEmail}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {presentation.status === 'incomplete' && (
                                <div className="space-y-3 pl-22">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="bg-pink-600/10 text-pink-400 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic">
                                      {t('salesPresentations.card.step', { current: presentation.currentStep, total: 7 })}: {STEP_NAMES[presentation.currentStep - 1] || t('salesPresentations.steps.start')}
                                    </Badge>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">{Math.round((presentation.currentStep / 7) * 100)}% Synchronized</span>
                                  </div>
                                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(presentation.currentStep / 7) * 100}%` }}
                                      className="h-full bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 transition-all"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Middle: Tactical Data */}
                            <div className="flex flex-col items-center lg:items-end gap-2 shrink-0">
                              {presentation.status === 'completed' ? (
                                <div className="text-right">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1 italic">Authorized Value</p>
                                  <div className="text-3xl font-black text-emerald-400 tracking-tighter italic">
                                    <span className="text-sm mr-1 font-normal opacity-50">฿</span>
                                    {presentation.totalValue.toLocaleString()}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-right">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1 italic">Temporal Status</p>
                                  <Badge className="bg-amber-500/10 text-amber-400 border-none rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest italic">INCOMPLETE SEQUENCE</Badge>
                                </div>
                              )}
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic mt-2">
                                {presentation.completedAt 
                                  ? t('salesPresentations.card.completedAt', { time: formatDistanceToNow(presentation.completedAt, { addSuffix: true, locale: dateLocale }) })
                                  : t('salesPresentations.card.createdAt', { time: formatDistanceToNow(presentation.createdAt, { addSuffix: true, locale: dateLocale }) })
                                }
                              </p>
                            </div>

                            {/* Right: Operational Interface */}
                            <div className="flex flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-10">
                              <Link href={`/sales/wizard/${presentation.customerId}`} className="flex-1">
                                <Button size="xl" variant="premium" className="w-full h-14 rounded-2xl shadow-2xl shadow-pink-500/20 text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 border">
                                  <Eye className="h-4 w-4 mr-3" />
                                  {presentation.status === 'completed' ? 'Inspect Data' : 'Sync Sequence'}
                                </Button>
                              </Link>
                              <div className="flex gap-3">
                                {presentation.status === 'completed' && (
                                  <Button size="xl" variant="outline" className="flex-1 h-14 rounded-2xl border-white/5 bg-white/[0.03] text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                    <Download className="h-4 w-4 mr-3 text-cyan-400" />
                                    Export Schema
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(presentation.customerId)}
                                  className="h-14 w-14 rounded-2xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
