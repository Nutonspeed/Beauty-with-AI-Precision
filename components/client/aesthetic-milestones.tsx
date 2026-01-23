'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  CheckCircle2, 
  Lock,
  ChevronRight,
  Sparkles,
  Share2,
  Loader2,
  Award
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AchievementShareCard } from '@/components/share/achievement-share-card'
import { useAuth } from '@/lib/auth/context'

interface Milestone {
  id: string
  title: string
  description: string
  progress: number
  target: number
  isCompleted: boolean
  icon: any
  color: string
  xp: number
}

export function AestheticMilestones({ isPremium }: { isPremium: boolean }) {
  const t = useTranslations()
  const { user } = useAuth()
  const [isSharing, setIsSharing] = useState<string | null>(null)
  const [shareLinks, setShareLinks] = useState<Record<string, string>>({})

  // Use Sparkles as fallback for Droplets icon
  const Droplets = Sparkles 

  const handleShare = async (milestoneId: string) => {
    if (shareLinks[milestoneId]) return
    
    setIsSharing(milestoneId)
    try {
      const response = await fetch('/api/milestones/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone_id: milestoneId })
      })
      const result = await response.json()
      if (result.success) {
        setShareLinks((prev: Record<string, string>) => ({ ...prev, [milestoneId]: result.share_url }))
      }
    } catch (error) {
      console.error('Failed to generate share link:', error)
    } finally {
      setIsSharing(null)
    }
  }

  const milestones: Milestone[] = [
    {
      id: 'builder',
      title: t('aestheticMilestones.items.builder.title' as any) || 'Network_Builder',
      description: t('aestheticMilestones.items.builder.desc' as any) || 'Successfully synchronize 3 clinical nodes.',
      progress: 2,
      target: 3,
      isCompleted: false,
      icon: Target,
      color: 'text-blue-600',
      xp: 150
    },
    {
      id: 'protocol',
      title: t('aestheticMilestones.items.protocol.title' as any) || 'Protocol_Alpha',
      description: t('aestheticMilestones.items.protocol.desc' as any) || 'Complete 7 consecutive daily protocol cycles.',
      progress: 7,
      target: 7,
      isCompleted: true,
      icon: Flame,
      color: 'text-pink-600',
      xp: 300
    },
    {
      id: 'hydration',
      title: t('aestheticMilestones.items.hydration.title' as any) || 'Hydration_Mastery',
      description: t('aestheticMilestones.items.hydration.desc' as any) || 'Reach a dermal hydration index of 80%.',
      progress: 72,
      target: 80,
      isCompleted: false,
      icon: Droplets,
      color: 'text-cyan-600',
      xp: 500
    }
  ]

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-amber-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-700">
                <Trophy className="h-8 w-8 text-amber-600 group-hover:text-white" />
              </div>
              {t('aestheticMilestones.title' as any) || 'Entity_Achievements'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('aestheticMilestones.subtitle' as any) || 'Longitudinal biological milestone synchronization'}</CardDescription>
          </div>
          <div className="text-right space-y-2 bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-inner group-hover:border-amber-100 transition-all duration-700">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('aestheticMilestones.currentXP' as any) || 'ACCUMULATED_SYNC_LEVEL'}</p>
            <div className="flex items-center gap-4 justify-end leading-none">
              <Star className="h-6 w-6 text-amber-500 fill-amber-500 animate-pulse" />
              <span className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase">1,450 <span className="text-[10px] text-slate-300 ml-1">XP</span></span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 lg:p-16 space-y-10 bg-white">
        <div className="grid gap-8">
          {milestones.map((m, index) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group/m",
                m.isCompleted 
                  ? "bg-emerald-50/20 border-emerald-100 shadow-sm" 
                  : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-500/20 shadow-inner hover:shadow-premium"
              )}
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/m:bg-blue-600 transition-all duration-700" className={m.isCompleted ? 'bg-emerald-500' : ''} />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                <div className="flex items-center gap-8">
                  <div className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover/m:scale-110 shadow-inner",
                    m.isCompleted ? "bg-white text-emerald-600 border-emerald-100 shadow-sm" : "bg-white text-slate-300 border-slate-100",
                    !m.isCompleted && m.color
                  )}>
                    {m.isCompleted ? <CheckCircle2 className="h-8 w-8" /> : <m.icon className="h-8 w-8" />}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-6">
                      <h4 className="text-2xl font-black text-slate-950 italic group-hover/m:text-blue-600 transition-colors uppercase tracking-tight leading-none">{m.title}</h4>
                      {m.isCompleted && (
                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black italic shadow-sm uppercase tracking-widest px-4 py-1 rounded-full">ACHIEVED</Badge>
                      )}
                    </div>
                    <p className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight">{m.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 shrink-0">
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">+{m.xp} SYNC_XP</span>
                  </div>
                  {m.isCompleted && (
                    <Dialog onOpenChange={(open) => open && handleShare(m.id)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-14 w-14 rounded-[1.25rem] bg-white border border-slate-100 text-slate-300 hover:text-blue-600 transition-all shadow-sm group-hover/m:border-blue-100"
                        >
                          {isSharing === m.id ? <Loader2 className="h-6 w-6 animate-spin" /> : <Share2 className="h-6 w-6" />}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border-slate-100 rounded-[3.5rem] p-12 max-w-lg shadow-premium selection:bg-pink-500/10 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                        <DialogHeader className="mb-10 text-center space-y-4">
                          <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                            <Share2 className="h-8 w-8" />
                          </div>
                          <DialogTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{t('aestheticMilestones.shareTitle' as any) || 'Protocol_Achievement_Share'}</DialogTitle>
                          <DialogDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
                            {t('aestheticMilestones.shareSubtitle' as any) || 'Synchronize your biological yield milestones with your network.'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 relative">
                          <div className="absolute inset-0 bg-blue-500/[0.02] rounded-[2rem] blur-3xl -z-10" />
                          {isSharing === m.id ? (
                            <div className="h-64 flex flex-col items-center justify-center space-y-8 italic">
                              <div className="relative h-16 w-16 mx-auto">
                                <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full animate-pulse" />
                                <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 relative" />
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('aestheticMilestones.generatingProof' as any) || 'Generating_Milestone_Vector...'}</p>
                            </div>
                          ) : (
                            <AchievementShareCard 
                              milestone={{
                                title: m.title,
                                description: m.description,
                                achievedAt: new Date().toISOString(),
                                type: m.id,
                                xp: m.xp
                              }}
                              userName={user?.full_name || 'Identity_Aesthetic'}
                              centerName="Precision_Intelligence_Hub"
                              shareUrl={shareLinks[m.id]}
                            />
                          )}
                        </div>
                        <div className="pt-8 flex justify-center">
                          <Button variant="outline" size="xl" className="h-16 px-12 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[10px] italic shadow-sm hover:bg-slate-50" onClick={() => (document.querySelector('[data-state=open]') as any)?.click()}>
                            Close Terminal
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              {!m.isCompleted && (
                <div className="mt-10 space-y-4">
                  <div className="flex justify-between items-end px-2 text-[10px] font-black uppercase tracking-widest italic group-hover/m:text-slate-950 transition-colors">
                    <span className="text-slate-400">{t('aestheticMilestones.progress' as any || 'Sequence_Status')}: {Math.round((m.progress / m.target) * 100)}%</span>
                    <span className="text-slate-900">{m.progress} <span className="text-slate-200 mx-1">/</span> {m.target} UNITS</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5 relative group/bar">
                    <motion.div 
                      initial={{ width: 0 }} 
                      whileInView={{ width: `${(m.progress / m.target) * 100}%` }} 
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-blue-500 rounded-full shadow-glow-blue/20" 
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {!isPremium && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-10 rounded-[3rem] bg-blue-50/50 border border-blue-100 flex items-center justify-between group/lock cursor-pointer relative overflow-hidden transition-all duration-700 hover:bg-white hover:border-blue-500/20 shadow-inner hover:shadow-premium"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/lock:scale-110 transition-transform duration-1000">
              <ShieldCheck className="w-32 h-32 text-blue-600" />
            </div>
            <div className="flex items-center gap-10 relative z-10">
              <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/lock:scale-110 group-hover/lock:border-blue-100 transition-all duration-700">
                <Lock className="h-8 w-8 text-slate-300 group-hover/lock:text-blue-600" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover/lock:text-blue-600 transition-colors">{t('aestheticMilestones.unlockPremium' as any) || 'Executive_Protocol_Access'}</p>
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">{t('aestheticMilestones.accessExclusive' as any) || 'Authorize exclusive biological achievements and earned yield nodes.'}</p>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/lock:translate-x-2 transition-all duration-700 shrink-0">
              <ChevronRight className="h-6 w-6 text-slate-300 group-hover/lock:text-blue-600" />
            </div>
          </motion.div>
        )}
      </CardContent>

      <div className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-5 text-slate-400 group/status cursor-default">
          <Award className="h-5 w-5 group-hover:text-amber-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Credential_Sync_Nominal: 2026_VERSION</p>
        </div>
        <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">BIP-Milestone-v4.8 // Active_Stream</p>
      </div>
    </Card>
  )
}
