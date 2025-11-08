'use client';

/**
 * Goal Management Component
 * UI for setting, tracking, and managing skin improvement goals
 * with milestone tracking, progress visualization, and achievement celebration
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Plus,
  Edit2,
  Trash2,
  Flag,
  Zap,
  AlertCircle,
} from 'lucide-react';
import type { SkinGoal, GoalParameter } from '@/lib/ai/goal-setting';

interface GoalManagementProps {
  readonly goals: SkinGoal[];
  readonly locale?: 'th' | 'en';
  readonly onAddGoal?: (goal: SkinGoal) => void;
  readonly onUpdateGoal?: (goal: SkinGoal) => void;
  readonly onDeleteGoal?: (goalId: string) => void;
}

const TRANSLATIONS = {
  en: {
    title: 'Skin Improvement Goals',
    description: 'Set and track your skin improvement journey',
    activeGoals: 'Active Goals',
    achievedGoals: 'Achieved Goals',
    allGoals: 'All Goals',
    noGoals: 'No goals yet. Start by creating your first goal!',
    createGoal: 'Create New Goal',
    editGoal: 'Edit Goal',
    deleteGoal: 'Delete Goal',
    goalProgress: 'Goal Progress',
    targetDate: 'Target Date',
    daysRemaining: 'Days Remaining',
    milestone: 'Milestone',
    milestonesAchieved: 'Milestones Achieved',
    baselineValue: 'Baseline',
    targetValue: 'Target',
    currentValue: 'Current',
    priority: 'Priority',
    status: 'Status',
    achieved: 'Achieved',
    active: 'Active',
    paused: 'Paused',
    abandoned: 'Abandoned',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    spots: 'Spots',
    pores: 'Pores',
    wrinkles: 'Wrinkles',
    texture: 'Texture',
    redness: 'Redness',
    overall: 'Overall Skin Quality',
    spotGoal: 'Reduce visible spots and hyperpigmentation',
    poreGoal: 'Minimize pore size and appearance',
    wrinkleGoal: 'Reduce fine lines and wrinkles',
    textureGoal: 'Improve skin texture and smoothness',
    rednessGoal: 'Calm inflammation and reduce redness',
    overallGoal: 'Improve overall skin quality',
    completionPercentage: 'Completion',
    startDate: 'Started',
    nextMilestone: 'Next Milestone',
    progressTrend: 'Progress Trend',
    estimatedCompletion: 'Estimated Completion',
    accelerating: 'Accelerating',
    steady: 'Steady',
    slowing: 'Slowing',
    declining: 'Declining',
    summary: 'Goal Summary',
    totalGoals: 'Total Goals',
    activeCount: 'Active',
    achievedCount: 'Achieved',
    motivationalMessage: 'Motivation',
    treatmentPlan: 'Recommended Treatments',
    rationale: 'Why This Goal',
    emptyTreatments: 'No specific treatments assigned yet',
    congratulations: 'Congratulations!',
    goalAchieved: 'You achieved your goal!',
    keepGoing: 'Keep going! You are making progress.',
    selectGoal: 'Select a goal to view details',
    th: {
      title: 'เป้าหมายการปรับปรุงผิว',
      description: 'ตั้งเป้าหมายและติดตามการปรับปรุงผิวของคุณ',
      activeGoals: 'เป้าหมายที่ใช้งาน',
      achievedGoals: 'เป้าหมายที่บรรลุแล้ว',
      allGoals: 'เป้าหมายทั้งหมด',
      noGoals: 'ยังไม่มีเป้าหมาย เริ่มต้นด้วยการสร้างเป้าหมายแรกของคุณ!',
      createGoal: 'สร้างเป้าหมายใหม่',
      editGoal: 'แก้ไขเป้าหมาย',
      deleteGoal: 'ลบเป้าหมาย',
      goalProgress: 'ความคืบหน้าของเป้าหมาย',
      targetDate: 'วันที่เป้าหมาย',
      daysRemaining: 'วันที่เหลือ',
      milestone: 'จุดสำคัญ',
      milestonesAchieved: 'จุดสำคัญที่บรรลุแล้ว',
      baselineValue: 'ค่าพื้นฐาน',
      targetValue: 'เป้าหมาย',
      currentValue: 'ปัจจุบัน',
      priority: 'ความสำคัญ',
      status: 'สถานะ',
      achieved: 'บรรลุแล้ว',
      active: 'ใช้งาน',
      paused: 'หยุดชั่วคราว',
      abandoned: 'หยุด',
      high: 'สูง',
      medium: 'ปานกลาง',
      low: 'ต่ำ',
      spots: 'จุดด่างดำ',
      pores: 'รูขุมขน',
      wrinkles: 'ริ้วรอย',
      texture: 'เนื้อผิว',
      redness: 'ความแดง',
      overall: 'คุณภาพผิวโดยรวม',
      spotGoal: 'ลดจุดด่างดำและการเสียสีผิว',
      poreGoal: 'ย่อขนาดรูขุมขน',
      wrinkleGoal: 'ลดริ้วรอยและเส้นบาง',
      textureGoal: 'ปรับปรุงเนื้อผิวและความเรียบ',
      rednessGoal: 'หยุดการอักเสบและลดความแดง',
      overallGoal: 'ปรับปรุงคุณภาพผิวโดยรวม',
      completionPercentage: 'ความเสร็จสมบูรณ์',
      startDate: 'เริ่มต้น',
      nextMilestone: 'จุดสำคัญถัดไป',
      progressTrend: 'แนวโน้มความคืบหน้า',
      estimatedCompletion: 'การบรรลุโดยประมาณ',
      accelerating: 'เร่งความเร็ว',
      steady: 'คงที่',
      slowing: 'ชะลอตัว',
      declining: 'ลดลง',
      summary: 'สรุปเป้าหมาย',
      totalGoals: 'เป้าหมายทั้งหมด',
      activeCount: 'ใช้งาน',
      achievedCount: 'บรรลุแล้ว',
      motivationalMessage: 'แรงจูงใจ',
      treatmentPlan: 'การรักษาแนะนำ',
      rationale: 'เหตุผลเบื้องหลัง',
      emptyTreatments: 'ยังไม่มีการรักษาที่กำหนด',
      congratulations: 'ขอแสดงความยินดี!',
      goalAchieved: 'คุณบรรลุเป้าหมายของคุณ!',
      keepGoing: 'ทำให้ดีต่อไป! คุณกำลังมีความคืบหน้า',
    },
  },
  th: {
    title: 'เป้าหมายการปรับปรุงผิว',
    description: 'ตั้งเป้าหมายและติดตามการปรับปรุงผิวของคุณ',
    activeGoals: 'เป้าหมายที่ใช้งาน',
    achievedGoals: 'เป้าหมายที่บรรลุแล้ว',
    allGoals: 'เป้าหมายทั้งหมด',
    noGoals: 'ยังไม่มีเป้าหมาย เริ่มต้นด้วยการสร้างเป้าหมายแรกของคุณ!',
    createGoal: 'สร้างเป้าหมายใหม่',
    editGoal: 'แก้ไขเป้าหมาย',
    deleteGoal: 'ลบเป้าหมาย',
    goalProgress: 'ความคืบหน้าของเป้าหมาย',
    targetDate: 'วันที่เป้าหมาย',
    daysRemaining: 'วันที่เหลือ',
    milestone: 'จุดสำคัญ',
    milestonesAchieved: 'จุดสำคัญที่บรรลุแล้ว',
    baselineValue: 'ค่าพื้นฐาน',
    targetValue: 'เป้าหมาย',
    currentValue: 'ปัจจุบัน',
    priority: 'ความสำคัญ',
    status: 'สถานะ',
    achieved: 'บรรลุแล้ว',
    active: 'ใช้งาน',
    paused: 'หยุดชั่วคราว',
    abandoned: 'หยุด',
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ',
    spots: 'จุดด่างดำ',
    pores: 'รูขุมขน',
    wrinkles: 'ริ้วรอย',
    texture: 'เนื้อผิว',
    redness: 'ความแดง',
    overall: 'คุณภาพผิวโดยรวม',
    spotGoal: 'ลดจุดด่างดำและการเสียสีผิว',
    poreGoal: 'ย่อขนาดรูขุมขน',
    wrinkleGoal: 'ลดริ้วรอยและเส้นบาง',
    textureGoal: 'ปรับปรุงเนื้อผิวและความเรียบ',
    rednessGoal: 'หยุดการอักเสบและลดความแดง',
    overallGoal: 'ปรับปรุงคุณภาพผิวโดยรวม',
    completionPercentage: 'ความเสร็จสมบูรณ์',
    startDate: 'เริ่มต้น',
    nextMilestone: 'จุดสำคัญถัดไป',
    progressTrend: 'แนวโน้มความคืบหน้า',
    estimatedCompletion: 'การบรรลุโดยประมาณ',
    accelerating: 'เร่งความเร็ว',
    steady: 'คงที่',
    slowing: 'ชะลอตัว',
    declining: 'ลดลง',
    summary: 'สรุปเป้าหมาย',
    totalGoals: 'เป้าหมายทั้งหมด',
    activeCount: 'ใช้งาน',
    achievedCount: 'บรรลุแล้ว',
    motivationalMessage: 'แรงจูงใจ',
    treatmentPlan: 'การรักษาแนะนำ',
    rationale: 'เหตุผลเบื้องหลัง',
    emptyTreatments: 'ยังไม่มีการรักษาที่กำหนด',
    congratulations: 'ขอแสดงความยินดี!',
    goalAchieved: 'คุณบรรลุเป้าหมายของคุณ!',
    keepGoing: 'ทำให้ดีต่อไป! คุณกำลังมีความคืบหน้า',
  },
};

export default function GoalManagement({
  goals,
  locale = 'en',
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}: GoalManagementProps) {
  const t = locale === 'th' ? TRANSLATIONS.th : TRANSLATIONS.en;
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
      spots: t.spots,
      pores: t.pores,
      wrinkles: t.wrinkles,
      texture: t.texture,
      redness: t.redness,
      overall: t.overall,
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'accelerating':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'steady':
        return <Flag className="h-4 w-4 text-blue-600" />;
      case 'slowing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getTrendLabel = (trend: string): string => {
    const trendMap: Record<string, string> = {
      accelerating: t.accelerating,
      steady: t.steady,
      slowing: t.slowing,
      declining: t.declining,
    };
    return trendMap[trend] || trend;
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
            <h2 className="text-2xl font-bold">{t.title}</h2>
          </div>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <Button onClick={() => {}} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.createGoal}
        </Button>
      </div>

      {goals.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t.noGoals}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="gap-2">
              {t.activeGoals}
              {activeGoals.length > 0 && <Badge variant="secondary">{activeGoals.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="achieved" className="gap-2">
              {t.achievedGoals}
              {achievedGoals.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {achievedGoals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">{t.allGoals}</TabsTrigger>
          </TabsList>

          {/* Active Goals Tab */}
          <TabsContent value="active" className="space-y-4">
            {activeGoals.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t.noGoals}</AlertDescription>
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
                    locale={locale}
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
                <AlertDescription>{t.noGoals}</AlertDescription>
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
                    locale={locale}
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
                  locale={locale}
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
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
          getTrendIcon={getTrendIcon}
          getTrendLabel={getTrendLabel}
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
  readonly locale: string;
  readonly getParameterLabel: (param: GoalParameter) => string;
  readonly getPriorityColor: (priority: string) => string;
  readonly getStatusColor: (status: string) => string;
}

function GoalCard({
  goal,
  isSelected,
  onSelect,
  onDelete,
  t,
  locale,
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
    active: t.active,
    achieved: t.achieved,
    paused: t.paused,
    abandoned: t.abandoned,
  }[goal.status];

  const priorityLabel = {
    high: t.high,
    medium: t.medium,
    low: t.low,
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
              <p className="text-muted-foreground">{t.baselineValue}</p>
              <p className="font-semibold text-lg">{goal.baselineValue}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t.currentValue}</p>
              <p className="font-semibold text-lg">{goal.currentValue}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t.targetValue}</p>
              <p className="font-semibold text-lg text-green-600">{goal.targetValue}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.completionPercentage}</span>
              <span className="text-sm font-semibold text-primary">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{t.daysRemaining}: {daysRemaining}</span>
            </div>
            {goal.milestones.length > 0 && (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span>
                  {t.milestonesAchieved}: {goal.milestones.filter((m) => m.achieved).length}/
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
              {t.editGoal}
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
              {t.deleteGoal}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface GoalDetailsPanelProps {
  readonly goal: SkinGoal;
  readonly t: any;
  readonly locale: string;
  readonly getParameterLabel: (param: GoalParameter) => string;
  readonly getPriorityColor: (priority: string) => string;
  readonly getStatusColor: (status: string) => string;
  readonly getTrendIcon: (trend: string) => React.ReactNode;
  readonly getTrendLabel: (trend: string) => string;
  readonly daysRemaining: number;
}

function GoalDetailsPanel({
  goal,
  t,
  locale,
  getParameterLabel,
  getPriorityColor,
  getStatusColor,
  getTrendIcon,
  getTrendLabel,
  daysRemaining,
}: GoalDetailsPanelProps) {
  const progress = Math.min(100, Math.max(0, goal.completionPercentage));
  const achievedMilestones = goal.milestones.filter((m) => m.achieved).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {goal.status === 'achieved' ? (
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          ) : (
            <Target className="h-6 w-6 text-primary" />
          )}
          {t.summary}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {goal.status === 'achieved' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {t.congratulations} {t.goalAchieved}
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t.completionPercentage}</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t.milestonesAchieved}</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{achievedMilestones}</span>
              <span className="text-muted-foreground">/ {goal.milestones.length}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t.startDate}</p>
            <p className="font-semibold">
              {goal.startDate.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t.targetDate}</p>
            <p className="font-semibold">
              {goal.targetDate.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t.daysRemaining}</p>
            <p className="font-semibold">{daysRemaining}</p>
          </div>
        </div>

        {/* Milestones */}
        {goal.milestones.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Flag className="h-4 w-4" />
              {t.milestone}s
            </h3>
            <div className="space-y-2">
              {goal.milestones.map((milestone, idx) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                >
                  {milestone.achieved ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{milestone.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.targetValue}: {milestone.targetValue}
                    </p>
                  </div>
                  {milestone.achieved && (
                    <span className="text-xs font-semibold text-green-600">
                      {milestone.achievedAt?.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {goal.motivationalNotes && (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>{goal.motivationalNotes}</AlertDescription>
          </Alert>
        )}

        {/* Treatment Plan */}
        {goal.treatmentPlan && goal.treatmentPlan.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">{t.treatmentPlan}</h3>
            <div className="flex flex-wrap gap-2">
              {goal.treatmentPlan.map((treatment) => (
                <Badge key={treatment} variant="outline">
                  {treatment}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
