"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Cpu, 
  TrendingUp, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Calculator, 
  Binary, 
  ShieldAlert, 
  Gauge, 
  Package, 
  Users, 
  Megaphone,
  LayoutGrid,
  Command,
  X,
  User,
  History,
  ClipboardList,
  Sparkles,
  Brain,
  ChevronRight
} from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CommandItem {
  id: string
  label: string
  section: 'strategic' | 'analytical' | 'operational' | 'tactical'
  icon: any
  color: string
  bg: string
}

interface IntelligenceCommandPaletteProps {
  onSelect: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

export function IntelligenceCommandPalette({ onSelect, isOpen, onClose }: IntelligenceCommandPaletteProps) {
  const t = useTranslations('home.salesWizard')
  const [query, setInput] = useState("")

  const commands: CommandItem[] = [
    { id: 'mission', label: t('commandPalette.commands.mission' as any) || 'Mission_Control', section: 'strategic', icon: Cpu, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'trend', label: t('commandPalette.commands.trend' as any) || 'Yield_Trends', section: 'analytical', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'payment', label: t('commandPalette.commands.payment' as any) || 'Financial_Flux', section: 'operational', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'appointments', label: t('commandPalette.commands.appointments' as any) || 'Cycle_Registry', section: 'operational', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'market', label: t('commandPalette.commands.market' as any) || 'Market_Intel', section: 'analytical', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: 'inventory', label: t('commandPalette.commands.inventory' as any) || 'Supply_Matrix', section: 'operational', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'staff', label: t('commandPalette.commands.staff' as any) || 'Personnel_Yield', section: 'strategic', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'forecast', label: t('commandPalette.commands.forecast' as any) || 'Yield_Forecast', section: 'strategic', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'marketing', label: t('commandPalette.commands.marketing' as any) || 'Growth_Engine', section: 'tactical', icon: Megaphone, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'benchmarking', label: t('commandPalette.commands.benchmarking' as any) || 'Node_Benchmarking', section: 'analytical', icon: LayoutGrid, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'industry', label: t('commandPalette.commands.industry' as any) || 'Industry_Matrix', section: 'analytical', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: 'audit', label: t('commandPalette.commands.audit' as any) || 'Compliance_Audit', section: 'tactical', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'roi', label: t('commandPalette.commands.roi' as any) || 'ROI_Calculator', section: 'strategic', icon: Calculator, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'outcomes', label: t('commandPalette.commands.outcomes' as any) || 'Yield_Quantifier', section: 'analytical', icon: Binary, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'advisor', label: t('commandPalette.commands.advisor' as any) || 'Strategic_Advisor', section: 'strategic', icon: Brain, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'recovery', label: t('commandPalette.commands.recovery' as any) || 'Leakage_Recovery', section: 'tactical', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'assets', label: t('commandPalette.commands.assets' as any) || 'Asset_Lifecycle', section: 'operational', icon: Gauge, color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  const mockEntities = [
    { id: 'ent1', label: t('commandPalette.mockEntities.customer1' as any) || 'Sarah_Johnson_ID', section: 'entities', icon: User, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'ent2', label: t('commandPalette.mockEntities.customer2' as any) || 'Emma_Wilson_ID', section: 'entities', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'ent3', label: t('commandPalette.mockEntities.scanHistory' as any) || 'Temporal_Registry', section: 'entities', icon: History, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'ent4', label: t('commandPalette.mockEntities.protocolAuth' as any) || 'Auth_Clipboard', section: 'entities', icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  const suggestedProtocols = [
    { id: 'suggest1', label: 'OPTIMIZE_REVENUE_RECOVERY', section: 'suggested', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'suggest2', label: 'SYNTHESIZE_HYDRATION_VECTOR', section: 'suggested', icon: Brain, color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    (t(`commandPalette.sections.${cmd.section}` as any) || '').toLowerCase().includes(query.toLowerCase())
  )

  const filteredEntities = query.length > 1 ? mockEntities.filter(ent => 
    ent.label.toLowerCase().includes(query.toLowerCase())
  ) : []

  const filteredSuggestions = query.length > 0 ? suggestedProtocols.filter(sug =>
    sug.label.toLowerCase().includes(query.toLowerCase())
  ) : suggestedProtocols

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    } else {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "auto"
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/20 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white border border-slate-100 rounded-[3rem] shadow-premium relative overflow-hidden flex flex-col max-h-[80vh] selection:bg-pink-500/10"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          
          <div className="p-8 lg:p-10 border-b border-slate-50 flex items-center gap-6 bg-slate-50/30">
            <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <Search className="h-6 w-6 text-pink-600" />
            </div>
            <input
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-slate-950 text-2xl font-black placeholder:text-slate-300 italic tracking-tighter uppercase"
              placeholder={t('commandPalette.placeholder' as any) || "Initialize_Command_Sequence..."}
              value={query}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-[9px] font-black border-slate-200 bg-white text-slate-400 uppercase tracking-widest italic px-4 py-1.5 rounded-full shadow-sm">ESC_TO_ABORT</Badge>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-12 w-12 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-inner">
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar bg-white">
            {filteredCommands.length === 0 && filteredEntities.length === 0 && filteredSuggestions.length === 0 ? (
              <div className="py-32 text-center space-y-6 italic opacity-40 grayscale">
                <div className="h-24 w-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto shadow-inner">
                  <Command className="h-12 w-12 text-slate-300" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                  {t('commandPalette.noResults' as any) || 'NO_VECTORS_MATCH_QUERY'}
                </p>
              </div>
            ) : (
              <div className="space-y-12 pb-6">
                {filteredSuggestions.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 ml-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                        {t('commandPalette.sections.suggested' as any) || 'AI_SUGGESTED_PROTOCOLS'}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {filteredSuggestions.map((sug) => (
                        <motion.button
                          key={sug.id}
                          whileHover={{ x: 10 }}
                          onClick={() => {
                            onSelect(sug.id)
                            onClose()
                          }}
                          className="w-full p-6 rounded-[2rem] flex items-center justify-between group transition-all duration-500 bg-slate-50 border border-slate-100 hover:bg-white hover:border-pink-500/20 hover:shadow-premium shadow-inner"
                        >
                          <div className="flex items-center gap-6">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-3", sug.bg, sug.color)}>
                              <sug.icon className="h-7 w-7" />
                            </div>
                            <div className="text-left space-y-1">
                              <span className="text-lg font-black text-slate-950 transition-colors uppercase tracking-tight italic group-hover:text-pink-600 leading-none">{sug.label}</span>
                              <p className="text-[9px] font-black text-pink-600/60 uppercase tracking-widest italic">{t('commandPalette.searchResult' as any) || 'HEURISTIC_MATCH'}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-pink-600 transition-all" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredEntities.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 ml-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                        {t('commandPalette.sections.entities' as any) || 'IDENTITY_NODE_SYNC'}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {filteredEntities.map((ent) => (
                        <motion.button
                          key={ent.id}
                          whileHover={{ x: 10 }}
                          onClick={() => {
                            onSelect(ent.id)
                            onClose()
                          }}
                          className="w-full p-6 rounded-[2rem] flex items-center justify-between group transition-all duration-500 bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-500/20 hover:shadow-premium shadow-inner"
                        >
                          <div className="flex items-center gap-6">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-3", ent.bg, ent.color)}>
                              <ent.icon className="h-7 w-7" />
                            </div>
                            <div className="text-left space-y-1">
                              <span className="text-lg font-black text-slate-950 group-hover:text-blue-600 transition-colors uppercase tracking-tight italic leading-none">{ent.label}</span>
                              <p className="text-[9px] font-black text-blue-600/60 uppercase tracking-widest italic">{t('commandPalette.searchResult' as any) || 'REGISTRY_NODE'}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {['strategic', 'analytical', 'operational', 'tactical'].map((section) => {
                  const sectionCmds = filteredCommands.filter(c => c.section === section)
                  if (sectionCmds.length === 0) return null

                  const sectionColor = section === 'strategic' ? 'text-pink-600' : section === 'analytical' ? 'text-blue-600' : section === 'operational' ? 'text-emerald-600' : 'text-purple-600';

                  return (
                    <div key={section} className="space-y-6">
                      <div className="flex items-center gap-4 ml-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", sectionColor.replace('text', 'bg'))} />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                          {t(`commandPalette.sections.${section}` as any) || section.toUpperCase() + '_VECTOR'}
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {sectionCmds.map((cmd) => (
                          <motion.button
                            key={cmd.id}
                            whileHover={{ x: 10 }}
                            onClick={() => {
                              onSelect(cmd.id)
                              onClose()
                            }}
                            className="w-full p-6 rounded-[2rem] flex items-center justify-between group transition-all duration-500 bg-white border border-slate-100 hover:border-pink-500/20 hover:shadow-premium shadow-sm"
                          >
                            <div className="flex items-center gap-6">
                              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-slate-50 shadow-inner transition-all duration-700 group-hover:scale-110 group-hover:rotate-3", cmd.bg, cmd.color)}>
                                <cmd.icon className="h-7 w-7" />
                              </div>
                              <span className="text-lg font-black text-slate-950 group-hover:text-pink-600 transition-colors uppercase tracking-tight italic leading-none">{cmd.label}</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-200 group-hover:translate-x-1 group-hover:text-pink-600 transition-all" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-8 lg:p-10 border-t border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
            <div className="flex items-center gap-5 text-slate-400 relative z-10">
              <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <Cpu className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">{t('commandPalette.footer.nodeName' as any) || 'BIP_INTELLIGENCE_TERMINAL'}</p>
            </div>
            <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-200 bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest italic shadow-sm relative z-10">{t('commandPalette.footer.version' as any) || 'PRO_EDITION_v4.8'}</Badge>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
