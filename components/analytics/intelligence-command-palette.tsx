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
  ArrowRight,
  Sparkles,
  Brain
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
}

interface IntelligenceCommandPaletteProps {
  onSelect: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

export function IntelligenceCommandPalette({ onSelect, isOpen, onClose }: IntelligenceCommandPaletteProps) {
  const t = useTranslations()
  const [query, setInput] = useState("")

  const commands: CommandItem[] = [
    { id: 'mission', label: t('commandPalette.commands.mission'), section: 'strategic', icon: Cpu, color: 'text-cyan-400' },
    { id: 'trend', label: t('commandPalette.commands.trend'), section: 'analytical', icon: TrendingUp, color: 'text-pink-400' },
    { id: 'payment', label: t('commandPalette.commands.payment'), section: 'operational', icon: Activity, color: 'text-blue-400' },
    { id: 'appointments', label: t('commandPalette.commands.appointments'), section: 'operational', icon: Activity, color: 'text-blue-400' },
    { id: 'market', label: t('commandPalette.commands.market'), section: 'analytical', icon: Globe, color: 'text-cyan-400' },
    { id: 'inventory', label: t('commandPalette.commands.inventory'), section: 'operational', icon: Package, color: 'text-amber-400' },
    { id: 'staff', label: t('commandPalette.commands.staff'), section: 'strategic', icon: Users, color: 'text-indigo-400' },
    { id: 'forecast', label: t('commandPalette.commands.forecast'), section: 'strategic', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'marketing', label: t('commandPalette.commands.marketing'), section: 'tactical', icon: Megaphone, color: 'text-rose-400' },
    { id: 'benchmarking', label: t('commandPalette.commands.benchmarking'), section: 'analytical', icon: LayoutGrid, color: 'text-purple-400' },
    { id: 'industry', label: t('commandPalette.commands.industry'), section: 'analytical', icon: Globe, color: 'text-cyan-400' },
    { id: 'audit', label: t('commandPalette.commands.audit'), section: 'tactical', icon: ShieldCheck, color: 'text-emerald-400' },
    { id: 'roi', label: t('commandPalette.commands.roi'), section: 'strategic', icon: Calculator, color: 'text-emerald-400' },
    { id: 'outcomes', label: t('commandPalette.commands.outcomes'), section: 'analytical', icon: Binary, color: 'text-pink-400' },
    { id: 'advisor', label: t('commandPalette.commands.advisor'), section: 'strategic', icon: Brain, color: 'text-amber-400' },
    { id: 'recovery', label: t('commandPalette.commands.recovery'), section: 'tactical', icon: ShieldAlert, color: 'text-rose-400' },
    { id: 'assets', label: t('commandPalette.commands.assets'), section: 'operational', icon: Gauge, color: 'text-blue-400' },
  ]

  const mockEntities = [
    { id: 'ent1', label: t('commandPalette.mockEntities.customer1'), section: 'entities', icon: User, color: 'text-pink-400' },
    { id: 'ent2', label: t('commandPalette.mockEntities.customer2'), section: 'entities', icon: User, color: 'text-cyan-400' },
    { id: 'ent3', label: t('commandPalette.mockEntities.scanHistory'), section: 'entities', icon: History, color: 'text-purple-400' },
    { id: 'ent4', label: t('commandPalette.mockEntities.protocolAuth'), section: 'entities', icon: ClipboardList, color: 'text-emerald-400' },
  ]

  const suggestedProtocols = [
    { id: 'suggest1', label: 'OPTIMIZE_REVENUE_CHURN_RECOVERY', section: 'suggested', icon: Sparkles, color: 'text-pink-500' },
    { id: 'suggest2', label: 'SYNTHESIZE_HYDRATION_VECTOR_PROTOCOL', section: 'suggested', icon: Brain, color: 'text-cyan-500' },
  ]

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    t(`commandPalette.sections.${cmd.section}`).toLowerCase().includes(query.toLowerCase())
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
          className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-[#020617] border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          
          <div className="p-8 border-b border-white/5 flex items-center gap-6 bg-white/[0.02]">
            <Search className="h-6 w-6 text-slate-500" />
            <input
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-white text-xl font-bold placeholder:text-slate-700 italic tracking-tight"
              placeholder={t('commandPalette.placeholder')}
              value={query}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[8px] font-black border-white/10 text-slate-600 uppercase tracking-widest italic px-3 py-1">{t('commandPalette.escToClose')}</Badge>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {filteredCommands.length === 0 && filteredEntities.length === 0 && filteredSuggestions.length === 0 ? (
              <div className="py-20 text-center space-y-4 opacity-40 grayscale">
                <Command className="h-16 w-16 mx-auto text-slate-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">
                  {t('commandPalette.noResults')}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredSuggestions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="px-4 text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400 italic border-l-2 border-cyan-500/20">
                      {t('commandPalette.sections.suggested')}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {filteredSuggestions.map((sug) => (
                        <motion.button
                          key={sug.id}
                          whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.03)" }}
                          onClick={() => {
                            onSelect(sug.id)
                            onClose()
                          }}
                          className="w-full p-4 rounded-2xl flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-6">
                            <div className={cn("h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:animate-synaptic-fire", sug.color)}>
                              <sug.icon className="h-5 w-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <span className="text-sm font-bold text-white transition-colors uppercase tracking-widest italic">{sug.label}</span>
                              <p className="text-[8px] font-black text-cyan-500/60 uppercase tracking-widest">{t('commandPalette.searchResult')}</p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredEntities.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="px-4 text-[9px] font-black uppercase tracking-[0.4em] text-pink-500 italic border-l-2 border-pink-500/20">
                      {t('commandPalette.sections.entities')}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {filteredEntities.map((ent) => (
                        <motion.button
                          key={ent.id}
                          whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.03)" }}
                          onClick={() => {
                            onSelect(ent.id)
                            onClose()
                          }}
                          className="w-full p-4 rounded-2xl flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-6">
                            <div className={cn("h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:animate-synaptic-fire", ent.color)}>
                              <ent.icon className="h-5 w-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors uppercase tracking-widest italic">{ent.label}</span>
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('commandPalette.searchResult')}</p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {['strategic', 'analytical', 'operational', 'tactical'].map((section) => {
                  const sectionCmds = filteredCommands.filter(c => c.section === section)
                  if (sectionCmds.length === 0) return null

                  return (
                    <div key={section} className="space-y-4">
                      <h4 className="px-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 italic border-l-2 border-cyan-500/20">
                        {t(`commandPalette.sections.${section}`)}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {sectionCmds.map((cmd) => (
                          <motion.button
                            key={cmd.id}
                            whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.03)" }}
                            onClick={() => {
                              onSelect(cmd.id)
                              onClose()
                            }}
                            className="w-full p-4 rounded-2xl flex items-center justify-between group transition-all"
                          >
                            <div className="flex items-center gap-6">
                              <div className={cn("h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:animate-synaptic-fire", cmd.color)}>
                                <cmd.icon className="h-5 w-5" />
                              </div>
                              <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors uppercase tracking-widest italic">{cmd.label}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-700">
              <Cpu className="h-3 w-3" />
              <p className="text-[8px] font-black uppercase tracking-[0.4em] italic">{t('commandPalette.footer.nodeName')}</p>
            </div>
            <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest italic">{t('commandPalette.footer.version')}</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
