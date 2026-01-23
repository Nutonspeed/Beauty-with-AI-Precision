'use client';

/**
 * Goal Management Component
 * UI for setting, tracking, and managing skin improvement goals
 * with milestone tracking, progress visualization, and achievement celebration
 */

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Target,
  Clock,
  Award,
  Plus,
  Edit2,
  Trash2,
  Zap,
  CheckCircle2,
  Activity,
  ShieldCheck,
  Layers
} from 'lucide-react';
import type { SkinGoal, GoalParameter } from '@/lib/ai/goal-setting';
import { motion, AnimatePresence } from 'framer-motion';

interface GoalManagementProps {
  readonly goals: SkinGoal[];
  readonly locale?: 'th' | 'en';
  readonly onAddGoal?: (goal: SkinGoal) => void;
  readonly onUpdateGoal?: (goal: SkinGoal) => void;
  readonly onDeleteGoal?: (goalId: string) => void;
}

export function GoalManagement({
  goals,
  locale: propLocale,
  onAddGoal: _onAddGoal,
  onUpdateGoal: _onUpdateGoal,
  onDeleteGoal,
}: GoalManagementProps) {
  const t = useTranslations();
  const currentLocale = useLocale() as 'th' | 'en';
  const _locale = propLocale ?? currentLocale;
  
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(
    goals.length > 0 ? goals[0].id : null
  );

  const activeGoals = useMemo(() => goals.filter((g) => g.status === 'active'), [goals]);
  const achievedGoals = useMemo(() => goals.filter((g) => g.status === 'achieved'), [goals]);

  const selectedGoal = useMemo(
    () => goals.find((g) => g.id === selectedGoalId),
    [goals, selectedGoalId]
  );

  const getParameterLabel = (param: GoalParameter): string => {
    const paramMap: Record<GoalParameter, string> = {
      spots: t('goalManagement.spots' as any) || 'Spots',
      pores: t('goalManagement.pores' as any) || 'Pores',
      wrinkles: t('goalManagement.wrinkles' as any) || 'Wrinkles',
      texture: t('goalManagement.texture' as any) || 'Texture',
      redness: t('goalManagement.redness' as any) || 'Redness',
      overall: t('goalManagement.overall' as any) || 'Overall',
    };
    return paramMap[param];
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-600 border-none shadow-sm';
      case 'medium':
        return 'bg-amber-50 text-amber-600 border-none shadow-sm';
      default:
        return 'bg-emerald-50 text-emerald-600 border-none shadow-sm';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-emerald-50 text-emerald-600 border-none shadow-sm';
      case 'active':
        return 'bg-blue-50 text-blue-600 border-none shadow-sm';
      case 'paused':
        return 'bg-amber-50 text-amber-600 border-none shadow-sm';
      default:
        return 'bg-slate-50 text-slate-400 border-none shadow-sm';
    }
  };

  const daysRemaining = selectedGoal
    ? Math.max(0, Math.floor((new Date(selectedGoal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header interface */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="space-y-3 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-950 tracking-tighter italic flex items-center justify-center md:justify-start gap-6 uppercase leading-none">
            <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
              <Target className="w-8 h-8 text-pink-600" />
            </div>
            {t('goalManagement.title' as any) || 'Aesthetic_Objective_Control'}
          </h2>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
            {t('goalManagement.description' as any) || 'Strategic biological milestone orchestration'}
          </p>
        </div>
        <Button variant="premium" size="xl" className="h-16 px-10 rounded-[2rem] bg-slate-950 text-white border-none shadow-2xl transition-all hover:scale-105 active:scale-95 italic font-black text-[10px] uppercase tracking-[0.3em] group/btn relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
          <Plus className="mr-3 h-5 w-5 group-hover/btn:rotate-90 transition-transform" />
          {t('goalManagement.createGoal' as any) || 'Initialize_Objective'}
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card className="border-slate-100 bg-slate-50/30 rounded-[4rem] p-32 text-center space-y-10 italic shadow-inner">
          <div className="relative h-32 w-32 mx-auto">
            <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full animate-pulse" />
            <div className="h-32 w-32 rounded-[3rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <Target className="h-16 w-16 text-slate-200" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('goalManagement.noGoals' as any) || 'OBJECTIVE_REGISTRY_CLEAR'}</h3>
            <p className="text-lg text-slate-400 font-medium italic">Synchronize your first biological target node to begin tracking evolution.</p>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="space-y-12">
          <div className="flex items-center justify-center">
            <TabsList className="bg-slate-50 border border-slate-100 p-2 rounded-[2.5rem] h-auto gap-3 shadow-inner flex-wrap justify-center">
              {[
                { value: 'active', label: t('goalManagement.activeGoals' as any) || 'Active_Nodes', icon: Zap, count: activeGoals.length },
                { value: 'achieved', label: t('goalManagement.achievedGoals' as any) || 'Success_Registry', icon: Award, count: achievedGoals.length },
                { value: 'all', label: t('goalManagement.allGoals' as any) || 'Global_Archive', icon: Layers, count: goals.length }
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="rounded-3xl px-10 py-4 data-[state=active]:bg-slate-950 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-sm italic h-full gap-4"
                >
                  <tab.icon className="mr-1 h-4 w-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge className="bg-pink-600 text-white border-none rounded-lg px-2 h-5 text-[8px] font-black">{tab.count}</Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key="goals-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <TabsContent value="active" className="mt-0 outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {activeGoals.map((goal, idx) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      index={idx}
                      isSelected={selectedGoalId === goal.id}
                      onSelect={() => setSelectedGoalId(goal.id)}
                      onDelete={() => onDeleteGoal?.(goal.id)}
                      t={t}
                      getParameterLabel={getParameterLabel}
                      getPriorityStyles={getPriorityStyles}
                      getStatusStyles={getStatusStyles}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="achieved" className="mt-0 outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {achievedGoals.map((goal, idx) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      index={idx}
                      isSelected={selectedGoalId === goal.id}
                      onSelect={() => setSelectedGoalId(goal.id)}
                      onDelete={() => onDeleteGoal?.(goal.id)}
                      t={t}
                      getParameterLabel={getParameterLabel}
                      getPriorityStyles={getPriorityStyles}
                      getStatusStyles={getStatusStyles}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-0 outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {goals.map((goal, idx) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      index={idx}
                      isSelected={selectedGoalId === goal.id}
                      onSelect={() => setSelectedGoalId(goal.id)}
                      onDelete={() => onDeleteGoal?.(goal.id)}
                      t={t}
                      getParameterLabel={getParameterLabel}
                      getPriorityStyles={getPriorityStyles}
                      getStatusStyles={getStatusStyles}
                    />
                  ))}
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      )}

      {/* Goal Details Panel interface */}
      <AnimatePresence>
        {selectedGoal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-12"
          >
            <Card className="border-slate-100 bg-slate-950 text-white shadow-2xl rounded-[4rem] overflow-hidden relative group transition-all duration-1000">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-500/10 opacity-50" />
              <CardContent className="p-12 lg:p-16 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16">
                  <div className="space-y-10">
                    <div className="flex items-center gap-8">
                      <div className="h-20 w-20 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700">
                        <Target className="h-10 w-10 text-pink-500 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{getParameterLabel(selectedGoal.parameter)}</h3>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-500/60 italic leading-none">{t('goalManagement.targetStrategy' as any) || 'EVOLUTION_STRATEGY_NODE'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-inner group/rationale hover:bg-white/10 transition-all duration-700">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic leading-none">{t('goalManagement.rationale' as any) || 'HEURISTIC_RATIONALE'}</p>
                      <p className="text-xl font-light italic leading-relaxed tracking-tight text-slate-200">"{selectedGoal.rationale}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-3 shadow-inner text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic leading-none">{t('goalManagement.daysLeft' as any) || 'TEMPORAL_WINDOW'}</p>
                        <div className="flex items-baseline justify-center gap-2 leading-none">
                          <span className="text-5xl font-black italic tracking-tighter uppercase leading-none">{daysRemaining}</span>
                          <span className="text-xs font-black text-slate-500 italic uppercase">DAYS</span>
                        </div>
                      </div>
                      <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-3 shadow-inner text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic leading-none">{t('goalManagement.milestones' as any) || 'NODE_SYNC_STATUS'}</p>
                        <div className="flex items-baseline justify-center gap-2 leading-none">
                          <span className="text-5xl font-black italic tracking-tighter uppercase leading-none">{selectedGoal.milestones.filter(m => m.achieved).length}<span className="text-2xl text-slate-700 mx-1">/</span>{selectedGoal.milestones.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="flex items-center justify-between px-4">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic flex items-center gap-4">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t('goalManagement.milestoneChecklist' as any) || 'Protocol_Milestone_Verification'}
                      </h4>
                      <Badge variant="outline" className="border-white/10 text-slate-500 text-[8px] font-black italic uppercase">Immutability_Locked</Badge>
                    </div>
                    <div className="space-y-4">
                      {selectedGoal.milestones.map((milestone, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-8 p-6 rounded-[2.5rem] bg-white/5 border border-white/10 group/ms transition-all duration-700 hover:bg-white/10 hover:border-emerald-500/20 shadow-sm relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-1 opacity-20" className={milestone.achieved ? 'bg-emerald-500' : 'bg-white/10'} />
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-700 group-hover/ms:scale-110 shadow-inner",
                            milestone.achieved ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-600"
                          )}>
                            {milestone.achieved ? <CheckCircle2 className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
                          </div>
                          <div className="space-y-1 flex-1">
                            <span className={cn("text-xl font-black italic uppercase tracking-tight leading-none transition-colors", milestone.achieved ? "text-emerald-400" : "text-slate-400")}>
                              {milestone.name}
                            </span>
                            {milestone.achieved && (
                              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest italic">Verification_Hash: NOMINAL</p>
                            )}
                          </div>
                          {milestone.achieved && (
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-12 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-6 text-slate-500 group/status cursor-default">
                  <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-white transition-colors">Strategic_Trajectory_Verified: PRO_2026</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                      <motion.div animate={{ x: [-48, 48] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="h-full w-6 bg-pink-500/40" />
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Engine: BIP-Goal-v4.8</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GoalCard({
  goal,
  index,
  isSelected,
  onSelect,
  onDelete,
  t,
  getParameterLabel,
  getPriorityStyles,
  getStatusStyles,
}: {
  goal: SkinGoal;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  t: any;
  getParameterLabel: (param: GoalParameter) => string;
  getPriorityStyles: (priority: string) => string;
  getStatusStyles: (status: string) => string;
}) {
  const progress = Math.min(100, Math.max(0, goal.completionPercentage));
  const daysRemaining = Math.max(
    0,
    Math.floor((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-700 relative overflow-hidden rounded-[3rem] border-slate-100 bg-white hover:border-pink-500/20 shadow-sm hover:shadow-premium group/card h-full flex flex-col",
          isSelected ? "border-pink-200 shadow-premium scale-[1.02] z-10" : ""
        )}
        onClick={onSelect}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/card:bg-pink-600 transition-all duration-700" className={isSelected ? 'bg-pink-500' : ''} />
        
        <CardContent className="p-10 space-y-10 flex-1 flex flex-col justify-between">
          {/* Header Row interface */}
          <div className="space-y-8">
            <div className="flex items-start justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/card:scale-110 group-hover/card:bg-pink-50 group-hover/card:border-pink-100 transition-all duration-700">
                  <Award className="h-8 w-8 text-slate-300 group-hover/card:text-pink-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover/card:text-pink-600 transition-colors">{getParameterLabel(goal.parameter)}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic line-clamp-1">"{goal.rationale}"</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 shrink-0 items-end">
                <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase italic shadow-sm leading-none", getPriorityStyles(goal.priority))}>
                  {goal.priority.toUpperCase()}_PRIORITY
                </Badge>
                <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase italic shadow-sm leading-none", getStatusStyles(goal.status))}>
                  {goal.status.toUpperCase()}_STATE
                </Badge>
              </div>
            </div>

            {/* Progress Metrics interface */}
            <div className="grid grid-cols-3 gap-8 text-center pt-8 border-t border-slate-50 relative overflow-hidden group/metrics">
              <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover/metrics:opacity-100 transition-opacity duration-700 -z-10" />
              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('goalManagement.baselineValue' as any) || 'BASELINE'}</p>
                <p className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{goal.baselineValue}</p>
              </div>
              <div className="space-y-2 border-l border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('goalManagement.currentValue' as any) || 'CURRENT'}</p>
                <p className="text-3xl font-black text-blue-600 italic tracking-tighter uppercase leading-none">{goal.currentValue}</p>
              </div>
              <div className="space-y-2 border-l border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('goalManagement.targetValue' as any) || 'TARGET'}</p>
                <p className="text-3xl font-black text-emerald-600 italic tracking-tighter uppercase leading-none">{goal.targetValue}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Progress Bar interface */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">{t('goalManagement.completionPercentage' as any) || 'SYNCHRONISATION_PROGRESS'}</span>
                <span className="text-xl font-black text-pink-600 italic leading-none tracking-tighter uppercase">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5 relative group/bar">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-blue-600 shadow-glow-pink/30 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
                </motion.div>
              </div>
            </div>

            {/* Timeline interface */}
            <div className="flex flex-col sm:flex-row items-center gap-8 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/card:bg-white group-hover/card:border-blue-100 transition-all">
                  <Clock className="h-5 w-5 text-slate-300 group-hover/card:text-blue-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-950 italic uppercase tracking-tight leading-none">{daysRemaining} DAYS REMAINING</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{t('goalManagement.daysRemaining' as any) || 'TEMPORAL_WINDOW'}</p>
                </div>
              </div>
              {goal.milestones.length > 0 && (
                <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-inner group-hover/card:bg-white transition-all">
                  <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-950 italic uppercase tracking-widest">
                    {goal.milestones.filter((m) => m.achieved).length} / {goal.milestones.length} NODES_SYNCED
                  </span>
                </div>
              )}
            </div>

            {/* Actions interface */}
            <div className="flex gap-4 pt-4 relative z-10">
              <Button variant="outline" size="sm" className="flex-1 h-12 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[9px] italic shadow-sm hover:bg-slate-50 transition-all group/edit">
                <Edit2 className="mr-2 h-3.5 w-3.5 text-blue-600 group-edit:scale-110" />
                {t('goalManagement.editGoal' as any) || 'REFINE'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
