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
            if (data.selectedPrograms?.length > 0) currentStep = 4
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
          {/* Presentations Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <FileText className="mr-3 h-3.5 w-3.5" />
                {t('salesPresentations.header.badge')}
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                {t('salesPresentations.header.title')}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">{t('salesPresentations.header.highlight')}</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                {t('salesPresentations.header.description')}
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Link href={lp('/sales/dashboard')}>
                <Button size="xl" variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-slate-50 italic shadow-premium">
                  <ArrowLeft className="mr-4 h-5 w-5" />
                  {t('salesPresentations.header.dashboardBtn')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Precision Metrics Hub */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: t('salesPresentations.stats.total'), val: stats.total, color: 'text-slate-950', icon: FileText },
              { label: t('salesPresentations.stats.completed'), val: stats.completed, color: 'text-emerald-600', icon: CheckCircle2 },
              { label: t('salesPresentations.stats.incomplete'), val: stats.incomplete, color: 'text-rose-600', icon: Clock },
              { label: t('salesPresentations.stats.completionRate'), val: `${stats.completionRate}%`, color: 'text-blue-600', icon: Zap },
              { label: t('salesPresentations.stats.totalValue'), val: stats.totalValue.toLocaleString(), color: 'text-pink-600', currency: true, icon: CreditCard }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardContent className="p-8">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                      {stat.icon && <stat.icon className={cn("w-12 h-12", stat.color)} />}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 italic group-hover:text-slate-900 transition-colors">{stat.label}</p>
                    <div className={cn("text-2xl font-black tracking-tighter italic uppercase leading-none", stat.color)}>
                      {stat.currency && <span className="text-sm mr-1 font-normal opacity-50">฿</span>}
                      {stat.val}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Filtering Node Interface */}
          <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-blue-600/20 rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                  <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none z-20">
                    <Search className="h-6 w-6 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                  </div>
                  <Input
                    className="h-16 pl-20 pr-10 rounded-2xl border-slate-100 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all text-base font-bold italic shadow-inner relative z-10"
                    placeholder={t('salesPresentations.filters.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-6">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[220px] h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-950 focus:ring-pink-500/10 focus:border-pink-500/30 transition-all px-8 text-[11px] font-black uppercase tracking-widest italic shadow-inner">
                      <Filter className="h-5 w-5 mr-4 text-pink-500/60" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-premium">
                      <SelectItem value="all" className="text-[11px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.allStatus')}</SelectItem>
                      <SelectItem value="completed" className="text-[11px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.completed')}</SelectItem>
                      <SelectItem value="incomplete" className="text-[11px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.incomplete')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[240px] h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-950 focus:ring-pink-500/10 focus:border-pink-500/30 transition-all px-8 text-[11px] font-black uppercase tracking-widest italic shadow-inner">
                      <Calendar className="h-5 w-5 mr-4 text-blue-500/60" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-premium">
                      <SelectItem value="date-desc" className="text-[11px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.sortBy.dateDesc')}</SelectItem>
                      <SelectItem value="date-asc" className="text-[11px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.sortBy.dateAsc')}</SelectItem>
                      <SelectItem value="value-desc" className="text-[11px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.sortBy.valueDesc')}</SelectItem>
                      <SelectItem value="value-asc" className="text-[11px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.sortBy.valueAsc')}</SelectItem>
                      <SelectItem value="name-asc" className="text-[11px] font-black uppercase tracking-widest italic">{t('salesPresentations.filters.sortBy.nameAsc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Sequence */}
          <div className="space-y-8 flex-1">
            <div className="flex items-center justify-between px-6">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                {t('salesPresentations.list.showing', { count: filteredPresentations.length, total: presentations.length })}
              </p>
            </div>

            <div className="grid gap-8">
              <AnimatePresence mode="popLayout">
                {filteredPresentations.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] p-32 text-center space-y-10 italic">
                      <div className="mx-auto h-32 w-32 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-inner">
                        <FileText className="h-16 w-16" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">{t('salesPresentations.list.noData')}</h3>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
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
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] hover:border-pink-500/20 transition-all duration-700 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover:bg-pink-600 transition-all duration-700" />
                        <CardContent className="p-10 lg:p-12">
                          <div className="flex flex-col lg:flex-row items-center gap-12">
                            {/* Left: Identity Hub */}
                            <div className="flex-1 w-full space-y-8">
                              <div className="flex items-center gap-8">
                                <div className="h-20 w-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:bg-pink-50 transition-all duration-700">
                                  <User className="h-10 w-10 text-slate-300 group-hover:text-pink-600 transition-colors" />
                                </div>
                                <div className="space-y-2">
                                  <h3 className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase group-hover:text-pink-600 transition-colors leading-none">{presentation.customerName}</h3>
                                  <div className="flex flex-wrap gap-6">
                                    {presentation.customerPhone && (
                                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-pink-500/30" />
                                        {presentation.customerPhone}
                                      </span>
                                    )}
                                    {presentation.customerEmail && (
                                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500/30" />
                                        {presentation.customerEmail}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {presentation.status === 'incomplete' && (
                                <div className="space-y-4 pl-28">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="bg-pink-50 text-pink-600 border-none rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-widest italic shadow-sm">
                                      {t('salesPresentations.card.step', { current: presentation.currentStep, total: 7 })}: {STEP_NAMES[presentation.currentStep - 1] || t('salesPresentations.steps.start')}
                                    </Badge>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{Math.round((presentation.currentStep / 7) * 100)}% SYNCED</span>
                                  </div>
                                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(presentation.currentStep / 7) * 100}%` }}
                                      className="h-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 transition-all shadow-glow-pink/20"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Middle: Tactical Data */}
                            <div className="flex flex-col items-center lg:items-end gap-4 shrink-0 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner group-hover:bg-white transition-all duration-700">
                              {presentation.status === 'completed' ? (
                                <div className="text-right space-y-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t('salesPresentations.card.authorizedValue')}</p>
                                  <div className="text-4xl font-black text-emerald-600 tracking-tighter italic uppercase leading-none">
                                    <span className="text-lg mr-1 font-bold opacity-50">฿</span>
                                    {presentation.totalValue.toLocaleString()}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-right space-y-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t('salesPresentations.card.temporalStatus')}</p>
                                  <Badge className="bg-amber-50 text-amber-600 border-none rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest italic shadow-sm">{t('salesPresentations.card.incompleteSequence')}</Badge>
                                </div>
                              )}
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mt-2">
                                {presentation.completedAt 
                                  ? t('salesPresentations.card.completedAt', { time: formatDistanceToNow(presentation.completedAt, { addSuffix: true, locale: dateLocale }) })
                                  : t('salesPresentations.card.createdAt', { time: formatDistanceToNow(presentation.createdAt, { addSuffix: true, locale: dateLocale }) })
                                }
                              </p>
                            </div>

                            {/* Right: Operational Interface */}
                            <div className="flex flex-row lg:flex-col gap-4 shrink-0 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-slate-100 pt-8 lg:pt-0 lg:pl-12">
                              <Link href={`/sales/wizard/${presentation.customerId}`} className="flex-1">
                                <Button size="xl" variant="premium" className="w-full h-16 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic">
                                  <Eye className="h-5 w-5 mr-4" />
                                  {presentation.status === 'completed' ? t('salesPresentations.card.inspectData') : t('salesPresentations.card.syncSequence')}
                                </Button>
                              </Link>
                              <div className="flex gap-4">
                                {presentation.status === 'completed' && (
                                  <Button size="xl" variant="outline" className="flex-1 h-16 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-premium italic">
                                    <Download className="h-5 w-5 mr-4 text-blue-600" />
                                    {t('salesPresentations.card.exportSchema')}
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(presentation.customerId)}
                                  className="h-16 w-16 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 shadow-inner transition-all duration-500"
                                >
                                  <Trash2 className="h-6 w-6" />
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
