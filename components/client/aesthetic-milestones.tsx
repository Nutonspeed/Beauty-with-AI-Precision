
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
  Loader2
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
      title: t('aestheticMilestones.items.builder.title'),
      description: t('aestheticMilestones.items.builder.desc'),
      progress: 2,
      target: 3,
      isCompleted: false,
      icon: Target,
      color: 'text-blue-500',
      xp: 150
    },
    {
      id: 'protocol',
      title: t('aestheticMilestones.items.protocol.title'),
      description: t('aestheticMilestones.items.protocol.desc'),
      progress: 7,
      target: 7,
      isCompleted: true,
      icon: Flame,
      color: 'text-orange-500',
      xp: 300
    },
    {
      id: 'hydration',
      title: t('aestheticMilestones.items.hydration.title'),
      description: t('aestheticMilestones.items.hydration.desc'),
      progress: 72,
      target: 80,
      isCompleted: false,
      icon: Droplets,
      color: 'text-cyan-500',
      xp: 500
    }
  ]

  return (
    <Card className="border-white bg-white/60 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative group">
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight italic flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              {t('aestheticMilestones.title')}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('aestheticMilestones.subtitle')}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('aestheticMilestones.currentXP')}</p>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-xl font-black italic text-slate-900">1,450</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 lg:p-12 space-y-8">
        <div className="grid gap-6">
          {milestones.map((m, index) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-6 rounded-[2rem] border transition-all relative overflow-hidden group/m",
                m.isCompleted 
                  ? "bg-emerald-500/[0.03] border-emerald-500/10 shadow-sm" 
                  : "bg-white border-slate-100 hover:border-blue-500/20"
              )}
            >
              <div className="flex items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover/m:scale-110",
                    m.isCompleted ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400",
                    !m.isCompleted && m.color
                  )}>
                    {m.isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <m.icon className="h-6 w-6" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-900 italic">{m.title}</h4>
                      {m.isCompleted && (
                        <Badge className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest border-none">{t('aestheticMilestones.completed')}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 italic">{m.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+{m.xp} XP</span>
                  </div>
                  {m.isCompleted && (
                    <Dialog onOpenChange={(open) => open && handleShare(m.id)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          {isSharing === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#020617] border-white/10 text-white rounded-[2.5rem] max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold italic">{t('aestheticMilestones.shareTitle')}</DialogTitle>
                          <DialogDescription className="text-slate-500 uppercase tracking-widest text-[10px] font-black">
                            {t('aestheticMilestones.shareSubtitle')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-6">
                          {isSharing === m.id ? (
                            <div className="h-64 flex flex-col items-center justify-center space-y-4">
                              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('aestheticMilestones.generatingProof')}</p>
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
                              userName={user?.full_name || 'Aesthetic Explorer'}
                              centerName="Aesthetic Intelligence Hub"
                              shareUrl={shareLinks[m.id]}
                            />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              {!m.isCompleted && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                    <span>{t('aestheticMilestones.progress')}: {Math.round((m.progress / m.target) * 100)}%</span>
                    <span>{m.progress} / {m.target}</span>
                  </div>
                  <Progress value={(m.progress / m.target) * 100} className="h-1.5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {!isPremium && (
          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-600/5 to-transparent border border-blue-500/10 flex items-center justify-between group/lock cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/lock:text-blue-600 transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900 italic">{t('aestheticMilestones.unlockPremium')}</p>
                <p className="text-[10px] text-slate-500 italic">{t('aestheticMilestones.accessExclusive')}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover/lock:translate-x-1 transition-transform" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
