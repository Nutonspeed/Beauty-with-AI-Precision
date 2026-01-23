"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotesDrawer } from "@/components/sales/customer-notes"
import { useCustomerNotes } from "@/hooks/useCustomerNotes"
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  Video, 
  FileText,
  Sparkles,
  StickyNote,
  AlertCircle,
  Activity,
  Zap
} from "lucide-react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface HotLeadCardProps {
  lead: {
    id: string
    customer_user_id?: string
    name: string
    age: number
    photo?: string
    initials: string
    score: number
    status: string
    isOnline: boolean
    topConcern: string
    secondaryConcern?: string
    estimatedValue: number
    lastActivity: string
    lastEngagementDuration?: number
    lastEngagementType?: string
    lastScrollDepth?: number
    analysisData: {
      wrinkles?: number
      pigmentation?: number
      pores?: number
      hydration?: number
    }
  }
  onCall?: (leadId: string) => void
  onChat?: (leadId: string) => void
  onEmail?: (leadId: string) => void
  onARDemo?: (leadId: string) => void
  onProposal?: (leadId: string) => void
}

export function HotLeadCard({ lead, onCall, onChat, onEmail, onARDemo, onProposal }: HotLeadCardProps) {
  const t = useTranslations()
  const [isExpanded, setIsExpanded] = useState(false)
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false)
  
  const shouldFetchNotes = lead.customer_user_id !== undefined && lead.customer_user_id !== null
  const { notes = [] } = useCustomerNotes(shouldFetchNotes ? lead.customer_user_id : null)
  const latestNote = notes?.[0]
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdueFollowups = notes?.filter((note) => {
    if (!note.followup_date || note.reminder_sent) return false
    const followupDate = new Date(note.followup_date)
    followupDate.setHours(0, 0, 0, 0)
    return followupDate <= today
  }).length ?? 0

  const getScoreStyles = (score: number) => {
    if (score >= 80) return { text: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100", icon: "fill-pink-600" }
    if (score >= 60) return { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", icon: "fill-blue-600" }
    return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: "fill-amber-600" }
  }

  const styles = getScoreStyles(lead.score)

  return (
    <Card 
      className={cn(
        "border-slate-100 bg-white shadow-premium rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:border-pink-500/20 group relative cursor-pointer",
        isExpanded && "border-pink-500/30 ring-1 ring-pink-500/10 shadow-2xl"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="p-8 space-y-6">
        {/* Header interface */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className="relative group/avatar">
              <Avatar className="h-16 w-16 border-2 border-white shadow-premium group-hover/avatar:scale-105 transition-transform duration-700">
                <AvatarImage src={lead.photo} className="object-cover" />
                <AvatarFallback className="bg-slate-50 text-slate-400 font-black italic uppercase">
                  {lead.initials}
                </AvatarFallback>
              </Avatar>
              {lead.isOnline && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm animate-pulse" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-4 flex-wrap">
                <h3 className="font-black text-2xl text-slate-950 tracking-tighter italic uppercase group-hover:text-pink-600 transition-colors leading-none truncate">
                  {lead.name}, {lead.age}
                </h3>
                <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-sm italic leading-none", styles.bg, styles.text)}>
                  <Sparkles className={cn("h-3 w-3 mr-2", styles.icon)} />
                  SCORE: {lead.score}
                </Badge>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-3">
                <Activity className="h-3 w-3" />
                {lead.topConcern} • {lead.lastActivity}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none mb-2">Yield_Est</p>
            <p className="text-2xl font-black text-emerald-600 italic tracking-tighter uppercase leading-none">
              ฿{lead.estimatedValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Telemetry interface */}
        <AnimatePresence>
          {lead.lastEngagementDuration && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between group/telemetry"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-inner group-hover/telemetry:bg-pink-50 transition-all">
                  <Zap className="h-5 w-5 text-pink-600 animate-pulse" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Live_Sequencing</p>
                  <p className="text-xs font-bold text-slate-700 italic pt-1">
                    {lead.lastEngagementDuration}s Dwell • {lead.lastScrollDepth}% Mesh_Depth
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-pink-100 bg-white text-pink-600 text-[8px] font-black uppercase tracking-widest italic shadow-sm">
                {lead.lastEngagementType === 'report_view' ? 'Neural_Report_Active' : 'Sync_Node_Active'}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Grid interface */}
        <div className="grid grid-cols-5 gap-3" onClick={(e) => e.stopPropagation()}>
          {[
            { icon: Phone, label: 'Call', action: onCall, color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200' },
            { icon: MessageSquare, label: 'Chat', action: onChat, color: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' },
            { icon: Mail, label: 'Email', action: onEmail, color: 'hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200' },
            { icon: Video, label: 'AR', action: onARDemo, color: 'hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200' },
            { icon: FileText, label: 'Proposal', action: onProposal, color: 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200' }
          ].map((btn, i) => (
            <Button 
              key={i}
              variant="outline"
              className={cn(
                "h-16 flex flex-col gap-1.5 items-center justify-center rounded-2xl border-slate-100 bg-slate-50/30 text-slate-400 transition-all duration-500 shadow-sm group/btn",
                btn.color
              )}
              onClick={() => btn.action?.(lead.id)}
            >
              <btn.icon className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
              <span className="text-[8px] font-black uppercase tracking-widest">{btn.label}</span>
            </Button>
          ))}
        </div>

        {/* Expandable Module interface */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 pt-2 overflow-hidden"
            >
              <div className="h-px w-full bg-slate-100" />
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('hotLeadCard.detailedAnalysis' as any) || 'Neural_Diagnostics'}</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Wrinkles', val: lead.analysisData.wrinkles, color: 'text-amber-600' },
                      { label: 'Pigment', val: lead.analysisData.pigmentation, color: 'text-rose-600' },
                      { label: 'Pores', val: lead.analysisData.pores, color: 'text-purple-600' },
                      { label: 'Hydration', val: lead.analysisData.hydration, color: 'text-blue-600' }
                    ].map((item, i) => item.val !== undefined && (
                      <div key={i} className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-inner group/item">
                        <span className="text-[10px] font-black text-slate-500 group-hover/item:text-slate-950 transition-colors uppercase italic">{item.label}</span>
                        <span className={cn("text-sm font-black italic", item.color)}>{item.val}/100</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('hotLeadCard.latestNote' as any) || 'Operator_Logs'}</p>
                  {latestNote ? (
                    <div className="p-6 rounded-[2rem] bg-amber-50/50 border border-amber-100 relative group/note overflow-hidden shadow-inner h-full flex flex-col justify-between">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover/note:scale-110 transition-transform duration-700">
                        <StickyNote className="w-16 h-16 text-amber-600" />
                      </div>
                      <p className="text-[13px] text-slate-600 font-medium italic leading-relaxed line-clamp-3 relative z-10">"{latestNote.content}"</p>
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-amber-100/50 relative z-10">
                        <span className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest italic">{latestNote.created_by_name}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{new Date(latestNote.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-8 rounded-[2rem] border border-slate-100 border-dashed bg-slate-50/30 italic">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No log entries synchronized</p>
                    </div>
                  )}
                </div>
              </div>

              {overdueFollowups > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-rose-600 animate-pulse" />
                  <p className="text-xs font-black text-rose-900 italic uppercase tracking-tight">
                    {t('hotLeadCard.followupAlert', { count: overdueFollowups })}
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full h-14 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic shadow-premium hover:bg-slate-50 transition-all"
                onClick={() => setNotesDrawerOpen(true)}
              >
                <StickyNote className="mr-3 h-4 w-4 text-pink-600" />
                {t('hotLeadCard.viewAllNotes', { count: notes.length })}
                {overdueFollowups > 0 && (
                  <Badge className="ml-4 bg-rose-600 text-white border-none shadow-glow-rose/20">{overdueFollowups}</Badge>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Priority Footer interface */}
        {lead.score < 70 && !isExpanded && (
          <div className="pt-4 mt-4 border-t border-slate-50 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic flex items-center justify-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-glow-rose animate-pulse" />
              {t('hotLeadCard.highPriority' as any) || 'IMMEDIATE_ACTION_NODE'}
            </p>
          </div>
        )}
      </CardContent>

      {/* Notes Drawer interface */}
      {lead.customer_user_id && (
        <NotesDrawer
          open={notesDrawerOpen}
          onOpenChange={setNotesDrawerOpen}
          customer_id={lead.customer_user_id}
          customer_name={lead.name}
        />
      )}
    </Card>
  )
}
