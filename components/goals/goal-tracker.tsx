'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Target,
  TrendingUp,
  Calendar,
  Award,
  CheckCircle2,
  Circle,
  Clock,
  Star,
  Flame,
  Camera,
  Plus,
  Pause,
  Play,
  XCircle,
} from 'lucide-react';
import type { SmartGoal, CheckIn } from '@/lib/goals/smart-goals';
import { formatConcernType } from '@/lib/concerns/concern-education';
import { calculateGoalProgress, getGoalStreak, getNextCheckInDate } from '@/lib/goals/smart-goals';

interface GoalTrackerProps {
  goals: SmartGoal[];
  onCheckIn?: (goalId: string, checkIn: Omit<CheckIn, 'id'>) => void;
  onUpdateGoal?: (goalId: string, updates: Partial<SmartGoal>) => void;
  onDeleteGoal?: (goalId: string) => void;
  editable?: boolean;
}

export default function GoalTracker({
  goals,
  onCheckIn,
  onUpdateGoal,
  onDeleteGoal,
  editable = true,
}: GoalTrackerProps) {
  const [selectedGoal, setSelectedGoal] = useState<SmartGoal | null>(null);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [checkInValue, setCheckInValue] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkInMood, setCheckInMood] = useState<'great' | 'good' | 'okay' | 'struggling'>('good');

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const handleCheckInClick = (goal: SmartGoal) => {
    setSelectedGoal(goal);
    setCheckInValue(goal.measurable.currentValue?.toString() || '');
    setCheckInNotes('');
    setCheckInMood('good');
    setIsCheckInDialogOpen(true);
  };

  const handleSubmitCheckIn = () => {
    if (selectedGoal && onCheckIn && checkInValue) {
      onCheckIn(selectedGoal.id, {
        date: new Date().toISOString(),
        currentValue: parseFloat(checkInValue),
        notes: checkInNotes || undefined,
        mood: checkInMood,
      });
      setIsCheckInDialogOpen(false);
    }
  };

  const handleStatusChange = (goalId: string, status: 'active' | 'paused' | 'abandoned') => {
    if (onUpdateGoal) {
      onUpdateGoal(goalId, { status });
    }
  };

  const getStatusIcon = (status: SmartGoal['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'abandoned':
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'challenging':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'improvement':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'maintenance':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'prevention':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'habit':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderGoalCard = (goal: SmartGoal) => {
    const progress = calculateGoalProgress(goal);
    const streak = getGoalStreak(goal);
    const nextCheckIn = getNextCheckInDate(goal);
    const daysUntilEnd = Math.ceil(
      (new Date(goal.timeBound.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return (
      <Card
        key={goal.id}
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setSelectedGoal(goal)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(goal.status)}
                <CardTitle className="text-lg">{goal.specific.title}</CardTitle>
              </div>
              <CardDescription>{goal.specific.description}</CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={getTypeColor(goal.type)}>{goal.type}</Badge>
              <Badge className={getDifficultyColor(goal.achievable.difficulty)}>
                {goal.achievable.difficulty}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current vs Target */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-muted p-2 rounded">
              <div className="text-muted-foreground text-xs">Baseline</div>
              <div className="font-semibold">
                {goal.measurable.baseline} {goal.measurable.unit}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <div className="text-muted-foreground text-xs">Current</div>
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                {goal.measurable.currentValue ?? goal.measurable.baseline} {goal.measurable.unit}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
              <div className="text-muted-foreground text-xs">Target</div>
              <div className="font-semibold text-green-600 dark:text-green-400">
                {goal.measurable.target} {goal.measurable.unit}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{daysUntilEnd} days left</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600 dark:text-orange-400">{streak} day streak!</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>
                {goal.progress.milestones.filter(m => m.completed).length}/
                {goal.progress.milestones.length} milestones
              </span>
            </div>
          </div>

          {/* Concerns */}
          {goal.specific.concernTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {goal.specific.concernTypes.map(concern => (
                <Badge key={concern} variant="outline" className="text-xs">
                  {formatConcernType(concern)}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          {editable && goal.status === 'active' && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={e => {
                  e.stopPropagation();
                  handleCheckInClick(goal);
                }}
                size="sm"
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-1" />
                Check In
              </Button>
              <Button
                onClick={e => {
                  e.stopPropagation();
                  handleStatusChange(goal.id, 'paused');
                }}
                size="sm"
                variant="outline"
              >
                <Pause className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{activeGoals.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{completedGoals.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">
                {activeGoals.length > 0
                  ? Math.round(
                      activeGoals.reduce((sum, g) => sum + calculateGoalProgress(g), 0) /
                        activeGoals.length
                    )
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {goals.reduce((sum, g) => sum + g.progress.milestones.filter(m => m.completed).length, 0)}
                /
                {goals.reduce((sum, g) => sum + g.progress.milestones.length, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedGoals.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({goals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active goals yet. Set your first goal to start tracking progress!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map(renderGoalCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedGoals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed goals yet. Keep working towards your goals!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedGoals.map(renderGoalCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(renderGoalCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Goal Detail Dialog */}
      {selectedGoal && (
        <Dialog open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedGoal.status)}
                <DialogTitle>{selectedGoal.specific.title}</DialogTitle>
              </div>
              <DialogDescription>{selectedGoal.specific.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* SMART Criteria */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge className={getTypeColor(selectedGoal.type)}>{selectedGoal.type}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Difficulty</Label>
                  <Badge className={getDifficultyColor(selectedGoal.achievable.difficulty)}>
                    {selectedGoal.achievable.difficulty}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Importance</Label>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedGoal.relevant.importance
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Check-in Frequency</Label>
                  <p className="text-sm font-medium capitalize">
                    {selectedGoal.timeBound.checkInFrequency}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <Label>Progress: {calculateGoalProgress(selectedGoal)}%</Label>
                <Progress value={calculateGoalProgress(selectedGoal)} className="h-2 mt-2" />
              </div>

              {/* Milestones */}
              <div>
                <Label className="mb-3 block">Milestones</Label>
                <div className="space-y-2">
                  {selectedGoal.progress.milestones.map(milestone => (
                    <div
                      key={milestone.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        milestone.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-muted'
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{milestone.title}</p>
                        <p className="text-xs text-muted-foreground">{milestone.description}</p>
                      </div>
                      {milestone.reward && (
                        <Badge variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {milestone.reward}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Check-ins */}
              {selectedGoal.progress.checkIns.length > 0 && (
                <div>
                  <Label className="mb-3 block">Recent Check-ins</Label>
                  <div className="space-y-2">
                    {selectedGoal.progress.checkIns.slice(-3).reverse().map(checkIn => (
                      <div key={checkIn.id} className="p-3 rounded-lg bg-muted">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {checkIn.currentValue} {selectedGoal.measurable.unit}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(checkIn.date).toLocaleDateString()}
                          </span>
                        </div>
                        {checkIn.notes && (
                          <p className="text-sm text-muted-foreground">{checkIn.notes}</p>
                        )}
                        {checkIn.mood && (
                          <Badge variant="outline" className="mt-2 text-xs capitalize">
                            {checkIn.mood}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivations */}
              <div>
                <Label className="mb-2 block">Motivations</Label>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {selectedGoal.relevant.motivations.map((motivation, i) => (
                    <li key={i}>{motivation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Check-in Dialog */}
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Progress</DialogTitle>
            <DialogDescription>
              How are you doing with &quot;{selectedGoal?.specific.title}&quot;?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="value">
                Current Value ({selectedGoal?.measurable.unit})
              </Label>
              <Input
                id="value"
                type="number"
                value={checkInValue}
                onChange={e => setCheckInValue(e.target.value)}
                placeholder={`Enter ${selectedGoal?.measurable.metric.toLowerCase()}`}
                step="0.1"
              />
            </div>

            <div>
              <Label htmlFor="mood">How are you feeling?</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(['great', 'good', 'okay', 'struggling'] as const).map(mood => (
                  <Button
                    key={mood}
                    type="button"
                    variant={checkInMood === mood ? 'default' : 'outline'}
                    onClick={() => setCheckInMood(mood)}
                    className="capitalize"
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={checkInNotes}
                onChange={e => setCheckInNotes(e.target.value)}
                placeholder="Any observations or thoughts..."
                rows={3}
              />
            </div>

            <Button onClick={handleSubmitCheckIn} className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Check-in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
