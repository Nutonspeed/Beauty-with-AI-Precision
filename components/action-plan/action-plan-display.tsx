/**
 * Action Plan Display Component
 * Shows personalized skincare action plan with progress tracking
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  TrendingUp,
  Award,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  PersonalizedActionPlan,
  ActionItem,
  ActionStatus,
  ActionPriority,
} from '@/lib/action-plan/action-plan-generator';
import { formatConcernType } from '@/lib/concerns/concern-education';

interface ActionPlanDisplayProps {
  plan: PersonalizedActionPlan;
  onActionUpdate?: (actionId: string, status: ActionStatus, notes?: string) => void;
  onStartAction?: (actionId: string) => void;
  editable?: boolean;
}

export function ActionPlanDisplay({
  plan,
  onActionUpdate,
  onStartAction,
  editable = true,
}: Readonly<ActionPlanDisplayProps>) {
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleActionClick = (action: ActionItem) => {
    setSelectedAction(action);
    setActionNotes(action.notes || '');
    setIsDialogOpen(true);
  };

  const handleStatusChange = (status: ActionStatus) => {
    if (selectedAction && onActionUpdate) {
      onActionUpdate(selectedAction.id, status, actionNotes);
      setIsDialogOpen(false);
    }
  };

  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'skipped':
        return <Circle className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getPriorityColor = (priority: ActionPriority) => {
    switch (priority) {
      case 'immediate':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'short-term':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'long-term':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                <p className="text-2xl font-bold">{plan.progressPercentage}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={plan.progressPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Actions</p>
                <p className="text-2xl font-bold">{plan.totalActions}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {plan.sections.reduce((sum, s) => sum + s.actions.filter(a => a.status === 'completed').length, 0)} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Cost</p>
                <p className="text-2xl font-bold">
                  ${plan.estimatedCost.min}-{plan.estimatedCost.max}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Skin Health</p>
                <p className="text-2xl font-bold">{plan.skinHealthScore}/100</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Concerns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Primary Concerns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {plan.primaryConcerns.map((concernType) => (
              <Badge key={concernType} variant="secondary" className="text-sm">
                {formatConcernType(concernType)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan Sections */}
      <Tabs defaultValue="immediate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="immediate" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Immediate
          </TabsTrigger>
          <TabsTrigger value="short-term" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Short-Term
          </TabsTrigger>
          <TabsTrigger value="long-term" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Long-Term
          </TabsTrigger>
        </TabsList>

        {plan.sections.map((section) => (
          <TabsContent key={section.priority} value={section.priority} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription className="mt-1">{section.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(section.priority)}>
                    {section.estimatedTimeframe}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      'w-full text-left p-4 rounded-lg border transition-all',
                      'hover:shadow-md hover:border-blue-500',
                      action.status === 'completed' && 'bg-green-50 dark:bg-green-950 border-green-200',
                      action.status === 'in-progress' && 'bg-blue-50 dark:bg-blue-950 border-blue-200'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(action.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold">{action.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {action.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {action.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                          {action.frequency && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {action.frequency}
                            </span>
                          )}
                          {action.cost && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${action.cost.min}-${action.cost.max}
                            </span>
                          )}
                          <span className={cn('font-medium', getDifficultyColor(action.difficulty))}>
                            {action.difficulty}
                          </span>
                          {action.estimatedDuration && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {action.estimatedDuration}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {action.concernTypes.map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {formatConcernType(type)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedAction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedAction.status)}
                  {selectedAction.title}
                </DialogTitle>
                <DialogDescription>{selectedAction.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Action Details */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</p>
                    <Badge variant="outline" className="mt-1">{selectedAction.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority</p>
                    <Badge variant="outline" className={cn('mt-1', getPriorityColor(selectedAction.priority))}>
                      {selectedAction.priority}
                    </Badge>
                  </div>
                  {selectedAction.frequency && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Frequency</p>
                      <p className="text-sm mt-1">{selectedAction.frequency}</p>
                    </div>
                  )}
                  {selectedAction.estimatedDuration && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</p>
                      <p className="text-sm mt-1">{selectedAction.estimatedDuration}</p>
                    </div>
                  )}
                  {selectedAction.cost && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimated Cost</p>
                      <p className="text-sm mt-1">
                        ${selectedAction.cost.min} - ${selectedAction.cost.max}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Difficulty</p>
                    <p className={cn('text-sm mt-1 font-medium', getDifficultyColor(selectedAction.difficulty))}>
                      {selectedAction.difficulty}
                    </p>
                  </div>
                </div>

                {/* Targets */}
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Targets</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedAction.concernTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {formatConcernType(type)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {editable && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Notes</p>
                    <Textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Add notes about your progress or any observations..."
                      rows={3}
                    />
                  </div>
                )}

                {/* Status Actions */}
                {editable && (
                  <div className="flex gap-2">
                    {selectedAction.status === 'not-started' && (
                      <Button
                        onClick={() => handleStatusChange('in-progress')}
                        className="flex-1"
                      >
                        Start Action
                      </Button>
                    )}
                    {selectedAction.status === 'in-progress' && (
                      <Button
                        onClick={() => handleStatusChange('completed')}
                        className="flex-1"
                        variant="default"
                      >
                        Mark Complete
                      </Button>
                    )}
                    {selectedAction.status !== 'skipped' && (
                      <Button
                        onClick={() => handleStatusChange('skipped')}
                        variant="outline"
                      >
                        Skip
                      </Button>
                    )}
                    {selectedAction.status === 'skipped' && (
                      <Button
                        onClick={() => handleStatusChange('not-started')}
                        variant="outline"
                      >
                        Unskip
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
