"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
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
  Clock,
  TrendingUp,
  Sparkles,
  StickyNote,
  AlertCircle
} from "lucide-react"

interface HotLeadCardProps {
  lead: {
    id: string
    name: string
    age: number
    photo?: string
    initials: string
    score: number
    isOnline: boolean
    topConcern: string
    secondaryConcern?: string
    estimatedValue: number
    lastActivity: string
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
  const [isExpanded, setIsExpanded] = useState(false)
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false)
  
  // Get customer notes
  const { notes } = useCustomerNotes(lead.id)
  const latestNote = notes[0]
  
  // Count overdue follow-ups
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdueFollowups = notes.filter((note) => {
    if (!note.followup_date || note.reminder_sent) return false
    const followupDate = new Date(note.followup_date)
    followupDate.setHours(0, 0, 0, 0)
    return followupDate <= today
  }).length

  // Determine priority color based on score
  const getPriorityColor = (score: number) => {
    if (score < 70) return "border-red-500"
    if (score < 80) return "border-orange-500"
    return "border-yellow-500"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score < 70) return "bg-red-100 text-red-800"
    if (score < 80) return "bg-orange-100 text-orange-800"
    return "bg-yellow-100 text-yellow-800"
  }

  return (
    <Card 
      className={`p-4 border-l-4 ${getPriorityColor(lead.score)} bg-gradient-to-r from-muted/30 to-background transition-all hover:shadow-lg cursor-pointer`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage src={lead.photo} alt={lead.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {lead.initials}
            </AvatarFallback>
          </Avatar>

          {/* Lead Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg truncate">
                {lead.name}, {lead.age}
              </h3>
              {lead.isOnline && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  ONLINE
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getScoreBadgeColor(lead.score)}>
                <Sparkles className="h-3 w-3 mr-1" />
                AI Score: {lead.score}
              </Badge>
              {lead.score < 70 && (
                <Badge className="bg-red-100 text-red-800">
                  🔥 HOT LEAD
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Estimated Value */}
        <div className="text-right shrink-0 ml-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Est. Value
          </p>
          <p className="text-xl font-bold text-green-600">฿{lead.estimatedValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Insights - 2 Column Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-background/80 rounded-lg border border-border/50">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Top Concern</p>
          <p className="font-semibold text-sm flex items-center gap-1">
            ⚠️ {lead.topConcern}
          </p>
          {lead.analysisData.wrinkles && (
            <p className="text-xs text-muted-foreground">Score: {lead.analysisData.wrinkles}/100</p>
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Last Activity</p>
          <p className="font-semibold text-sm flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lead.lastActivity}
          </p>
          {lead.secondaryConcern && (
            <p className="text-xs text-muted-foreground">+ {lead.secondaryConcern}</p>
          )}
        </div>
      </div>

      {/* Expandable Analysis Details */}
      {isExpanded && (
        <div className="mb-3 p-3 bg-muted/30 rounded-lg border border-border/50 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Detailed Analysis:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {lead.analysisData.wrinkles && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wrinkles:</span>
                <span className="font-medium">{lead.analysisData.wrinkles}/100</span>
              </div>
            )}
            {lead.analysisData.pigmentation && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pigmentation:</span>
                <span className="font-medium">{lead.analysisData.pigmentation}/100</span>
              </div>
            )}
            {lead.analysisData.pores && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pores:</span>
                <span className="font-medium">{lead.analysisData.pores}/100</span>
              </div>
            )}
            {lead.analysisData.hydration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hydration:</span>
                <span className="font-medium">{lead.analysisData.hydration}/100</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Latest Note Preview */}
      {latestNote && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1 text-xs font-medium text-amber-900">
              <StickyNote className="h-3 w-3" />
              บันทึกล่าสุด
            </div>
            <span className="text-xs text-amber-700">
              {new Date(latestNote.created_at).toLocaleDateString('th-TH', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </span>
          </div>
          <p className="text-sm text-amber-900 line-clamp-2">
            {latestNote.content}
          </p>
          <p className="text-xs text-amber-700 mt-1">
            โดย {latestNote.created_by_name}
          </p>
        </div>
      )}

      {/* Overdue Follow-ups Alert */}
      {overdueFollowups > 0 && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm font-medium text-red-900">
            ต้องติดตาม {overdueFollowups} รายการ
          </p>
        </div>
      )}

      {/* Quick Action Buttons - TABLET OPTIMIZED (60px height) */}
      <div className="grid grid-cols-5 gap-2" onClick={(e) => e.stopPropagation()}>
        <Button 
          className="h-14 flex flex-col gap-1 items-center justify-center hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all" 
          variant="outline"
          onClick={() => onCall?.(lead.id)}
        >
          <Phone className="h-5 w-5" />
          <span className="text-xs font-medium">Call</span>
        </Button>

        <Button 
          className="h-14 flex flex-col gap-1 items-center justify-center hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all" 
          variant="outline"
          onClick={() => onChat?.(lead.id)}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs font-medium">Chat</span>
        </Button>

        <Button 
          className="h-14 flex flex-col gap-1 items-center justify-center hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all" 
          variant="outline"
          onClick={() => onEmail?.(lead.id)}
        >
          <Mail className="h-5 w-5" />
          <span className="text-xs font-medium">Email</span>
        </Button>

        <Button 
          className="h-14 flex flex-col gap-1 items-center justify-center bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all" 
          variant="outline"
          onClick={() => onARDemo?.(lead.id)}
        >
          <Video className="h-5 w-5" />
          <span className="text-xs font-medium">AR Demo</span>
        </Button>

        <Button 
          className="h-14 flex flex-col gap-1 items-center justify-center hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-all" 
          variant="outline"
          onClick={() => onProposal?.(lead.id)}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs font-medium">Proposal</span>
        </Button>
      </div>

      {/* Notes Button */}
      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          className="w-full relative"
          onClick={() => setNotesDrawerOpen(true)}
        >
          <StickyNote className="mr-2 h-4 w-4" />
          ดูบันทึกทั้งหมด ({notes.length})
          {overdueFollowups > 0 && (
            <Badge className="ml-2 bg-red-500 text-white">
              {overdueFollowups}
            </Badge>
          )}
        </Button>
      </div>

      {/* Priority Indicator Footer */}
      {lead.score < 70 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-center text-muted-foreground">
            🎯 <span className="font-semibold text-red-600">High Priority</span> - Low skin score indicates strong treatment need
          </p>
        </div>
      )}

      {/* Notes Drawer */}
      <NotesDrawer
        open={notesDrawerOpen}
        onOpenChange={setNotesDrawerOpen}
        customer_id={lead.id}
        customer_name={lead.name}
      />
    </Card>
  )
}
