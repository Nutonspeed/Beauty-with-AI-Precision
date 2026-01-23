"use client"

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
  Target,
  Activity,
  Award,
  Star
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
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
              <Target className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            Treatment_Roadmap
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">AI-Optimized aesthetic evolution trajectory</CardDescription>
        </div>
        <Badge className="bg-blue-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-lg shadow-blue-600/30 uppercase tracking-widest animate-pulse">
          PHASE_02_ACTIVE
        </Badge>
      </CardHeader>
      <CardContent className="p-10 lg:p-16 bg-white relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
        <div className="relative space-y-12">
          {/* Timeline Line interface */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100 hidden md:block" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative flex flex-col md:flex-row gap-10 group/step cursor-pointer"
              onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
            >
              {/* Node Icon interface */}
              <div className={cn(
                "relative z-10 h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm",
                step.status === 'completed' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                step.status === 'current' ? "bg-blue-600 text-white animate-neural-pulse scale-110 shadow-glow-blue/30" : 
                "bg-white border border-slate-100 text-slate-200 group-hover/step:border-blue-500/30 group-hover/step:text-blue-600"
              )}>
                {step.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : 
                 step.status === 'current' ? <Zap className="h-6 w-6" /> : 
                 <Circle className="h-4 w-4 fill-current" />}
              </div>

              {/* Content interface */}
              <div className={cn(
                "flex-1 p-10 rounded-[3rem] border transition-all duration-700 relative overflow-hidden",
                step.status === 'current' ? "bg-slate-950 text-white border-none shadow-2xl" : 
                step.status === 'completed' ? "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-emerald-500/20 shadow-inner" : 
                "bg-white border-slate-100 hover:border-blue-500/20 hover:shadow-premium"
              )}>
                <div className={cn(
                  "absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/step:bg-blue-600 transition-all duration-700",
                  step.status === 'current' && 'hidden'
                )} />
                
                {step.status === 'current' && (
                  <div className="absolute top-0 right-0 p-10 opacity-[0.05] animate-pulse">
                    <Sparkles className="h-32 w-32 text-white" />
                  </div>
                )}
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={cn(
                        "px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest italic border-none shadow-sm",
                        step.status === 'current' ? "bg-white/10 text-white" : "bg-slate-100 text-slate-400"
                      )}>{step.type.toUpperCase()}_NODE</Badge>
                      {step.duration && (
                        <div className={cn(
                          "flex items-center gap-3 text-[9px] font-black uppercase tracking-widest italic",
                          step.status === 'current' ? "text-blue-300" : "text-slate-400"
                        )}>
                          <Clock className="h-3 w-3" /> {step.duration}
                        </div>
                      )}
                    </div>
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{step.title}</h4>
                    <p className={cn(
                      "text-lg font-medium italic leading-relaxed tracking-tight max-w-2xl",
                      step.status === 'current' ? "text-slate-400" : "text-slate-500"
                    )}>
                      "{step.description}"
                    </p>
                  </div>

                  <div className="shrink-0">
                    {step.status === 'current' ? (
                      <Button variant="premium" className="bg-white text-blue-600 border-none hover:bg-blue-50 rounded-2xl h-14 px-10 text-[10px] font-black uppercase tracking-[0.3em] italic shadow-2xl" asChild>
                        <Link href={lp('/booking')}>
                          Execute_Sync <ArrowRight className="ml-3 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : step.status === 'completed' ? (
                      <div className="flex items-center gap-4 text-emerald-600 font-black italic text-[10px] uppercase tracking-widest bg-white border border-emerald-100 px-6 py-3 rounded-2xl shadow-sm">
                        <ShieldCheck className="h-5 w-5" /> SYNCHRONIZED
                      </div>
                    ) : (
                      <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover/step:text-blue-600 transition-all italic h-14 px-8 rounded-2xl bg-slate-50/50 hover:bg-slate-50 shadow-inner">
                        Inspect_Parameters <ChevronRight className="ml-2 h-4 w-4" />
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
                      className="mt-10 pt-10 border-t border-current opacity-20"
                    >
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                          { label: 'Expected Yield', val: 'Cellular_Rebirth', icon: Award },
                          { label: 'Milestone_Delta', val: `+${step.milestone_xp} XP`, icon: Star },
                          { label: 'Network_Load', val: 'High_Fidelity', icon: Activity },
                          { label: 'Sync_State', val: step.status.toUpperCase(), icon: Zap }
                        ].map((m, i) => (
                          <div key={i} className="space-y-2 group/m">
                            <div className="flex items-center gap-3">
                              <m.icon className="h-3 w-3" />
                              <p className="text-[8px] font-black uppercase tracking-widest italic">{m.label}</p>
                            </div>
                            <p className="text-sm font-black italic uppercase tracking-tight">{m.val}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {!isPremium && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-10 rounded-[3.5rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10 shadow-inner group/unlock relative overflow-hidden transition-all duration-700 hover:bg-white hover:border-pink-500/20"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover/unlock:scale-110 group-hover/unlock:rotate-12 transition-transform duration-1000">
              <Zap className="w-40 h-40 text-blue-600" />
            </div>
            <div className="space-y-3 text-center md:text-left relative z-10">
              <h5 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover/unlock:text-blue-600 transition-colors">Advanced_Trajectory_Sync</h5>
              <p className="text-base text-slate-500 font-medium italic max-w-xl leading-relaxed">Upgrade to Premium to synchronize with long-term biological evolution mapping and visualize predictive transformation nodes.</p>
            </div>
            <Button variant="premium" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-blue-600/20 text-[11px] font-black uppercase tracking-widest italic border-none bg-slate-950 text-white hover:scale-105 transition-all shrink-0 relative z-10">
              Authorize_Full_Access
            </Button>
          </motion.div>
        )}
      </CardContent>
      <div className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-5 text-slate-400 group/status cursor-default">
          <Activity className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Trajectory_Calculation: Nominal</p>
        </div>
        <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">BIP-Roadmap-v4.8 // Multi-Phase_Active</p>
      </div>
    </Card>
  )
}
