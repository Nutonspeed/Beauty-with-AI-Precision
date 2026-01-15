
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  ChevronRight,
  Clock,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useLocalizePath } from '@/lib/i18n/locale-link'

interface RoadmapStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'current' | 'upcoming'
  type: 'analysis' | 'treatment' | 'evaluation'
  duration?: string
  milestone_xp: number
}

export function InteractiveTreatmentRoadmap({ isPremium }: { isPremium: boolean }) {
  const lp = useLocalizePath()
  const [activeStep, setActiveStep] = useState<string | null>(null)

  const steps: RoadmapStep[] = [
    {
      id: '1',
      title: 'Initial Bio-Baseline',
      description: 'Establishment of neural skin mapping and condition quantification.',
      status: 'completed',
      type: 'analysis',
      milestone_xp: 150
    },
    {
      id: '2',
      title: 'Ultra-Hydra Protocol',
      description: 'Active treatment phase focusing on cellular hydration nodes.',
      status: 'current',
      type: 'treatment',
      duration: '45 mins',
      milestone_xp: 300
    },
    {
      id: '3',
      title: 'Mid-Cycle Evaluation',
      description: 'Temporal delta check to measure protocol efficiency.',
      status: 'upcoming',
      type: 'evaluation',
      milestone_xp: 200
    },
    {
      id: '4',
      title: 'Dermal Refinement',
      description: 'Targeted laser synthesis for texture uniformity.',
      status: 'upcoming',
      type: 'treatment',
      duration: '30 mins',
      milestone_xp: 450
    }
  ]

  return (
    <Card className="border-white bg-white/40 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight italic flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              Treatment_Roadmap
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AI-Optimized aesthetic evolution path</CardDescription>
          </div>
          <Badge className="bg-blue-600 text-white font-black italic rounded-lg px-4 py-1">
            PHASE 2 ACTIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-10 lg:p-16">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100 hidden md:block" />
          
          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col md:flex-row gap-8 group/step cursor-pointer"
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
              >
                {/* Node Icon */}
                <div className={cn(
                  "relative z-10 h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm",
                  step.status === 'completed' ? "bg-emerald-500 text-white" : 
                  step.status === 'current' ? "bg-blue-600 text-white animate-neural-pulse scale-110 shadow-lg shadow-blue-600/20" : 
                  "bg-white border border-slate-100 text-slate-300 group-hover/step:border-blue-500/30"
                )}>
                  {step.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : 
                   step.status === 'current' ? <Zap className="h-6 w-6" /> : 
                   <Circle className="h-4 w-4" />}
                </div>

                {/* Content */}
                <div className={cn(
                  "flex-1 p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden",
                  step.status === 'current' ? "bg-blue-600 text-white border-none shadow-2xl" : 
                  step.status === 'completed' ? "bg-emerald-500/[0.03] border-emerald-500/10" : 
                  "bg-white border-slate-100 hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5"
                )}>
                  {step.status === 'current' && (
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Sparkles className="h-24 w-24 text-white" />
                    </div>
                  )}
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-[0.3em]",
                          step.status === 'current' ? "text-blue-200" : "text-slate-400"
                        )}>{step.type} node</span>
                        {step.duration && (
                          <div className={cn(
                            "flex items-center gap-1 text-[8px] font-black uppercase tracking-widest",
                            step.status === 'current' ? "text-blue-100" : "text-slate-500"
                          )}>
                            <Clock className="h-2.5 w-2.5" /> {step.duration}
                          </div>
                        )}
                      </div>
                      <h4 className="text-xl font-bold italic tracking-tight">{step.title}</h4>
                      <p className={cn(
                        "text-sm font-medium italic leading-relaxed max-w-xl",
                        step.status === 'current' ? "text-blue-50" : "text-slate-500"
                      )}>
                        "{step.description}"
                      </p>
                    </div>

                    <div className="shrink-0">
                      {step.status === 'current' ? (
                        <Button variant="outline" className="bg-white text-blue-600 border-none hover:bg-blue-50 rounded-xl h-12 px-8 text-[10px] font-black uppercase tracking-widest italic shadow-xl" asChild>
                          <Link href={lp('/booking')}>
                            Execute_Sync <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : step.status === 'completed' ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-black italic text-[10px] uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl">
                          <ShieldCheck className="h-4 w-4" /> Synchronized
                        </div>
                      ) : (
                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/step:text-blue-600 rounded-xl">
                          Details <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {activeStep === step.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-8 pt-8 border-t border-current opacity-20"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-widest">Expected Outcome</p>
                            <p className="text-xs font-bold italic">Cellular Rejuvenation</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-widest">Milestone Yield</p>
                            <p className="text-xs font-bold italic">+{step.milestone_xp} XP</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-widest">Tech Nodes</p>
                            <p className="text-xs font-bold italic">AI-Pulsed Laser</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-widest">Status</p>
                            <p className="text-xs font-bold italic uppercase">{step.status}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {!isPremium && (
          <div className="mt-12 p-8 rounded-[3rem] bg-gradient-to-br from-blue-600/5 to-transparent border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h5 className="text-lg font-bold text-slate-900 italic">Advanced_Trajectory_Unlock</h5>
              <p className="text-xs text-slate-500 italic max-w-md">Upgrade to Premium to unlock long-term biological evolution mapping and predictive outcome modeling.</p>
            </div>
            <Button variant="premium" className="h-14 px-10 rounded-2xl shadow-xl shadow-blue-600/10 text-[10px] font-black uppercase tracking-widest">
              Upgrade Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
