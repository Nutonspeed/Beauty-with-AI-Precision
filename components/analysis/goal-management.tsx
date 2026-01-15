'use client';

/**
 * Goal Management Component
 * UI for setting, tracking, and managing skin improvement goals
 * with milestone tracking, progress visualization, and achievement celebration
 */

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  Target,
  Clock,
  Award,
  Plus,
  Edit2,
  Trash2,
  Zap,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { SkinGoal, GoalParameter } from '@/lib/ai/goal-setting';

interface GoalManagementProps {
  readonly goals: SkinGoal[];
  readonly locale?: 'th' | 'en';
  readonly onAddGoal?: (goal: SkinGoal) => void;
  readonly onUpdateGoal?: (goal: SkinGoal) => void;
  readonly onDeleteGoal?: (goalId: string) => void;
}

export default function GoalManagement({
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
      spots: t('goalManagement.spots'),
      pores: t('goalManagement.pores'),
      wrinkles: t('goalManagement.wrinkles'),
      texture: t('goalManagement.texture'),
      redness: t('goalManagement.redness'),
      overall: t('goalManagement.overall'),
    };
    return paramMap[param];
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'achieved':
        return 'bg-green-100 text-green-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const daysRemaining = selectedGoal
    ? Math.max(0, Math.floor((selectedGoal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">{t('goalManagement.title')}</h2>
          </div>
          <p className="text-muted-foreground">{t('goalManagement.description')}</p>
        </div>
        <Button onClick={() => {}} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('goalManagement.createGoal')}
        </Button>
      </div>

      {goals.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('goalManagement.noGoals')}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="gap-2">
              {t('goalManagement.activeGoals')}
              {activeGoals.length > 0 && <Badge variant="secondary">{activeGoals.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="achieved" className="gap-2">
              {t('goalManagement.achievedGoals')}
              {achievedGoals.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {achievedGoals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">{t('goalManagement.allGoals')}</TabsTrigger>
          </TabsList>

          {/* Active Goals Tab */}
          <TabsContent value="active" className="space-y-4">
            {activeGoals.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t('goalManagement.noGoals')}</AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    isSelected={selectedGoalId === goal.id}
                    onSelect={() => setSelectedGoalId(goal.id)}
                    onDelete={() => onDeleteGoal?.(goal.id)}
                    t={t}
                    getParameterLabel={getParameterLabel}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Achieved Goals Tab */}
          <TabsContent value="achieved" className="space-y-4">
            {achievedGoals.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t('goalManagement.noGoals')}</AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {achievedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    isSelected={selectedGoalId === goal.id}
                    onSelect={() => setSelectedGoalId(goal.id)}
                    onDelete={() => onDeleteGoal?.(goal.id)}
                    t={t}
                    getParameterLabel={getParameterLabel}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Goals Tab */}
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  isSelected={selectedGoalId === goal.id}
                  onSelect={() => setSelectedGoalId(goal.id)}
                  onDelete={() => onDeleteGoal?.(goal.id)}
                  t={t}
                  getParameterLabel={getParameterLabel}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Goal Details Panel */}
      {selectedGoal && (
        <GoalDetailsPanel
          goal={selectedGoal}
          t={t}
          locale={locale}
          getParameterLabel={getParameterLabel}
          daysRemaining={daysRemaining}
        />
      )}
    </div>
  );
}

interface GoalCardProps {
  readonly goal: SkinGoal;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
  readonly onDelete: () => void;
  readonly t: any;
  readonly getParameterLabel: (param: GoalParameter) => string;
  readonly getPriorityColor: (priority: string) => string;
  readonly getStatusColor: (status: string) => string;
}

interface GoalDetailsPanelProps {
  readonly goal: SkinGoal;
  readonly t: any;
  readonly _locale: string;
  readonly getParameterLabel: (param: GoalParameter) => string;
  readonly daysRemaining: number;
}

function GoalDetailsPanel({
  goal,
  t,
  _locale,
  getParameterLabel,
  daysRemaining,
}: GoalDetailsPanelProps) {
  return (
    <Card className="p-8 bg-primary/5 border-primary/10 rounded-[2rem]">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{getParameterLabel(goal.parameter)}</h3>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">{t('goalManagement.targetStrategy')}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('goalManagement.rationale')}</p>
            <p className="text-slate-400 text-sm leading-relaxed italic">"{goal.rationale}"</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">{t('goalManagement.daysLeft')}</p>
              <p className="text-2xl font-black italic">{daysRemaining}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">{t('goalManagement.milestones')}</p>
              <p className="text-2xl font-black italic">{goal.milestones.filter(m => m.achieved).length}/{goal.milestones.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 italic">{t('goalManagement.milestoneChecklist')}</h4>
          <div className="space-y-3">
            {goal.milestones.map((milestone, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                <div className={cn(
                  "h-5 w-5 rounded-md flex items-center justify-center border transition-colors",
                  milestone.achieved ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20"
                )}>
                  {milestone.achieved && <CheckCircle2 className="h-3 w-3" />}
                </div>
                <span className={cn("text-sm italic", milestone.achieved ? "text-emerald-400" : "text-slate-400")}>
                  {milestone.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function GoalCard({
  goal,
  isSelected,
  onSelect,
  onDelete,
  t,
  getParameterLabel,
  getPriorityColor,
  getStatusColor,
}: GoalCardProps) {
  const progress = Math.min(100, Math.max(0, goal.completionPercentage));
  const daysRemaining = Math.max(
    0,
    Math.floor((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const statusLabel = {
    active: t('goalManagement.active'),
    achieved: t('goalManagement.achieved'),
    paused: t('goalManagement.paused'),
    abandoned: t('goalManagement.abandoned'),
  }[goal.status];

  const priorityLabel = {
    high: t('goalManagement.high'),
    medium: t('goalManagement.medium'),
    low: t('goalManagement.low'),
  }[goal.priority];

  return (
    <Card
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{getParameterLabel(goal.parameter)}</h3>
                <p className="text-sm text-muted-foreground">{goal.rationale}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(goal.priority)}>{priorityLabel}</Badge>
              <Badge className={getStatusColor(goal.status)}>{statusLabel}</Badge>
            </div>
          </div>

          {/* Progress Metrics */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t('goalManagement.baselineValue')}</p>
              <p className="font-semibold text-lg">{goal.baselineValue}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('goalManagement.currentValue')}</p>
              <p className="font-semibold text-lg">{goal.currentValue}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('goalManagement.targetValue')}</p>
              <p className="font-semibold text-lg text-green-600">{goal.targetValue}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('goalManagement.completionPercentage')}</span>
              <span className="text-sm font-semibold text-primary">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{t('goalManagement.daysRemaining')}: {daysRemaining}</span>
            </div>
            {goal.milestones.length > 0 && (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span>
                  {t('goalManagement.milestonesAchieved')}: {goal.milestones.filter((m) => m.achieved).length}/
                  {goal.milestones.length}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={(e) => {
              e.stopPropagation();
            }}>
              <Edit2 className="h-4 w-4" />
              {t('goalManagement.editGoal')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
              {t('goalManagement.deleteGoal')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
