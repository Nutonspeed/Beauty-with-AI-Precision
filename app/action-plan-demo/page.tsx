'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActionPlanDisplay } from '@/components/action-plan/action-plan-display';
import GoalTracker from '@/components/goals/goal-tracker';
import { ActionPlanGenerator, updateActionProgress } from '@/lib/action-plan/action-plan-generator';
import { SmartGoalGenerator, addCheckIn } from '@/lib/goals/smart-goals';
import type { PersonalizedActionPlan } from '@/lib/action-plan/action-plan-generator';
import type { SmartGoal, CheckIn } from '@/lib/goals/smart-goals';
import type { InteractiveConcern } from '@/lib/concerns/concern-education';
import { Sparkles, Target, CheckCircle } from 'lucide-react';

/**
 * Demo page for Action Plans and Smart Goals
 * Showcases the full functionality with sample data
 */
export default function ActionPlanDemoPage() {
  // Sample concerns for demo
  const sampleConcerns: InteractiveConcern[] = [
    {
      type: 'dark_spots',
      locations: [{ x: 0.5, y: 0.4, confidence: 0.89, severity: 'high' }],
      count: 1,
      averageSeverity: 7,
      education: {
        type: 'dark_spots',
        icon: '🔵',
        color: '#8B4513',
        definition: {
          en: 'Hyperpigmentation areas on skin',
          th: 'จุดด่างดำบนผิวหนัง'
        },
        causes: ['Sun exposure', 'Aging'],
        prevention: ['Use sunscreen', 'Avoid direct sun'],
        treatment: {
          moderate: {
            description: 'Moderate treatment',
            options: ['Vitamin C serum', 'Niacinamide']
          }
        },
        whenToSeeDermatologist: ['If spots grow', 'If color changes'],
        myths: [],
        ingredients: { recommended: ['Vitamin C'], avoid: ['Harsh acids'] },
        relatedConcerns: [],
        dailyRoutine: { morning: ['Cleanse', 'Serum'], evening: ['Cleanse'] },
        timeline: '3-6 months',
        resources: [],
        visualExamples: []
      },
    },
    {
      type: 'large_pores',
      locations: [{ x: 0.6, y: 0.45, confidence: 0.85, severity: 'high' }],
      count: 1,
      averageSeverity: 8,
      education: {
        type: 'large_pores',
        icon: '⭕',
        color: '#A0522D',
        definition: {
          en: 'Enlarged skin pores',
          th: 'รูขุมขนขยาย'
        },
        causes: ['Genetics', 'Excess oil'],
        prevention: ['Regular cleansing', 'Exfoliation'],
        treatment: {
          severe: {
            description: 'Severe treatment',
            options: ['Niacinamide', 'Retinol']
          }
        },
        whenToSeeDermatologist: ['If inflamed', 'If infected'],
        myths: [],
        ingredients: { recommended: ['Niacinamide'], avoid: ['Heavy oils'] },
        relatedConcerns: [],
        dailyRoutine: { morning: ['Cleanse'], evening: ['Cleanse', 'Treatment'] },
        timeline: '2-4 months',
        resources: [],
        visualExamples: []
      },
    },
    {
      type: 'redness',
      locations: [{ x: 0.55, y: 0.35, confidence: 0.78, severity: 'medium' }],
      count: 1,
      averageSeverity: 6,
      education: {
        type: 'redness',
        icon: '🔴',
        color: '#DC143C',
        definition: {
          en: 'Skin redness or inflammation',
          th: 'ผิวแดงหรือการอักเสบ'
        },
        causes: ['Sensitivity', 'Irritation'],
        prevention: ['Gentle products', 'Avoid irritants'],
        treatment: {
          moderate: {
            description: 'Moderate treatment',
            options: ['Calming serum', 'Moisturizer']
          }
        },
        whenToSeeDermatologist: ['If persistent', 'If painful'],
        myths: [],
        ingredients: { recommended: ['Centella', 'Aloe'], avoid: ['Alcohol', 'Fragrance'] },
        relatedConcerns: [],
        dailyRoutine: { morning: ['Gentle cleanser', 'Soothing serum'], evening: ['Gentle cleanser'] },
        timeline: '1-3 months',
        resources: [],
        visualExamples: []
      },
    },
  ];

  // Generate demo action plan
  const [actionPlan, setActionPlan] = useState<PersonalizedActionPlan>(() => {
    const generator = new ActionPlanGenerator(sampleConcerns, {
      budget: 'medium',
      timeCommitment: 'moderate',
      professionalTreatments: true,
      naturalProducts: false,
      skinType: 'combination',
    });
    return generator.generatePlan('demo-user-id', 'demo-analysis-id', 72);
  });

  // Generate demo goals
  const [goals, setGoals] = useState<SmartGoal[]>(() => {
    const recommendations = SmartGoalGenerator.generateRecommendations(
      sampleConcerns.map(c => ({ type: c.type, severity: c.averageSeverity })),
      'demo-user-id'
    );

    return recommendations.flatMap(rec => 
      rec.suggestedGoals.map(g => ({
        ...g,
        id: g.id || `goal_${Date.now()}_${Math.random()}`,
        userId: 'demo-user-id',
        type: g.type || 'improvement',
        status: g.status || 'active',
        specific: g.specific || { title: '', description: '', concernTypes: [] },
        measurable: g.measurable || { metric: '', baseline: 0, target: 0, unit: '' },
        achievable: g.achievable || { difficulty: 'moderate', requiredActions: [] },
        relevant: g.relevant || { importance: 3, motivations: [] },
        timeBound: g.timeBound || { 
          timeFrame: '3-months', 
          startDate: new Date().toISOString(), 
          endDate: new Date().toISOString(),
          checkInFrequency: 'weekly' 
        },
        progress: g.progress || { percentage: 0, milestones: [], checkIns: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as SmartGoal))
    ).slice(0, 4); // Limit to 4 goals for demo
  });

  const handleActionUpdate = (
    actionId: string,
    status: 'not-started' | 'in-progress' | 'completed' | 'skipped',
    notes?: string
  ) => {
    const updatedPlan = updateActionProgress(actionPlan, actionId, status, notes);
    setActionPlan(updatedPlan);
  };

  const handleGoalCheckIn = (goalId: string, checkIn: Omit<CheckIn, 'id'>) => {
    setGoals(prevGoals =>
      prevGoals.map(goal => {
        if (goal.id === goalId) {
          return addCheckIn(goal, checkIn);
        }
        return goal;
      })
    );
  };

  const handleGoalUpdate = (goalId: string, updates: Partial<SmartGoal>) => {
    setGoals(prevGoals =>
      prevGoals.map(goal => {
        if (goal.id === goalId) {
          return { ...goal, ...updates, updatedAt: new Date().toISOString() };
        }
        return goal;
      })
    );
  };

  const resetDemo = () => {
    // Regenerate action plan
    const generator = new ActionPlanGenerator(sampleConcerns, {
      budget: 'medium',
      timeCommitment: 'moderate',
      professionalTreatments: true,
    });
    setActionPlan(generator.generatePlan('demo-user-id', 'demo-analysis-id', 72));

    // Regenerate goals
    const recommendations = SmartGoalGenerator.generateRecommendations(
      sampleConcerns.map(c => ({ type: c.type, severity: c.averageSeverity })),
      'demo-user-id'
    );

    setGoals(
      recommendations.flatMap(rec => 
        rec.suggestedGoals.map(g => ({
          ...g,
          id: g.id || `goal_${Date.now()}_${Math.random()}`,
          userId: 'demo-user-id',
          type: g.type || 'improvement',
          status: g.status || 'active',
          specific: g.specific || { title: '', description: '', concernTypes: [] },
          measurable: g.measurable || { metric: '', baseline: 0, target: 0, unit: '' },
          achievable: g.achievable || { difficulty: 'moderate', requiredActions: [] },
          relevant: g.relevant || { importance: 3, motivations: [] },
          timeBound: g.timeBound || { 
            timeFrame: '3-months', 
            startDate: new Date().toISOString(), 
            endDate: new Date().toISOString(),
            checkInFrequency: 'weekly' 
          },
          progress: g.progress || { percentage: 0, milestones: [], checkIns: [] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as SmartGoal))
      ).slice(0, 4)
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
          <Sparkles className="h-10 w-10 text-purple-500" />
          Action Plans & Smart Goals Demo
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the personalized action plan generator and SMART goal tracking system.
          This demo showcases how the system creates customized skincare plans based on AI analysis.
        </p>
      </div>

      {/* Demo Info Card */}
      <Card className="mb-8 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            Demo Scenario
          </CardTitle>
          <CardDescription className="text-base">
            This demo is based on a sample analysis with the following concerns:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
              <div className="font-semibold text-red-600 dark:text-red-400">Dark Spots</div>
              <div className="text-sm text-muted-foreground">Severity: 7/10</div>
              <div className="text-xs text-muted-foreground mt-1">Confidence: 89%</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
              <div className="font-semibold text-orange-600 dark:text-orange-400">Large Pores</div>
              <div className="text-sm text-muted-foreground">Severity: 8/10</div>
              <div className="text-xs text-muted-foreground mt-1">Confidence: 85%</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
              <div className="font-semibold text-pink-600 dark:text-pink-400">Redness</div>
              <div className="text-sm text-muted-foreground">Severity: 6/10</div>
              <div className="text-xs text-muted-foreground mt-1">Confidence: 78%</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <strong>Skin Health Score:</strong> 72/100 | <strong>Budget:</strong> Medium | <strong>Professional Treatments:</strong> Yes
            </div>
            <Button onClick={resetDemo} variant="outline" size="sm">
              Reset Demo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="action-plan" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="action-plan" className="text-base">
            <Target className="h-4 w-4 mr-2" />
            Action Plan
          </TabsTrigger>
          <TabsTrigger value="goals" className="text-base">
            <Sparkles className="h-4 w-4 mr-2" />
            Smart Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="action-plan" className="mt-0">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Personalized Action Plan</CardTitle>
              <CardDescription>
                A 3-tier priority system with {actionPlan.totalActions} actionable steps.
                Track your progress by marking actions as started, completed, or skipped.
              </CardDescription>
            </CardHeader>
          </Card>

          <ActionPlanDisplay
            plan={actionPlan}
            onActionUpdate={handleActionUpdate}
            editable={true}
          />

          <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-base">💡 Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Start with <strong>Immediate Actions</strong> to build a solid foundation</p>
              <p>• Click any action card to view full details and add notes</p>
              <p>• Progress is automatically calculated as you complete actions</p>
              <p>• Cost estimates help you budget for your skincare journey</p>
              <p>• Professional treatments are only suggested for moderate-severe concerns</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-0">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>SMART Goals Tracker</CardTitle>
              <CardDescription>
                Track your progress towards specific, measurable goals. Record regular check-ins
                to monitor improvement and celebrate milestones.
              </CardDescription>
            </CardHeader>
          </Card>

          <GoalTracker
            goals={goals}
            onCheckIn={handleGoalCheckIn}
            onUpdateGoal={handleGoalUpdate}
            editable={true}
          />

          <Card className="mt-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-base">🎯 SMART Goal System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• <strong>Specific:</strong> Clear, focused objectives for each concern</p>
              <p>• <strong>Measurable:</strong> Track numeric progress with baseline and target values</p>
              <p>• <strong>Achievable:</strong> Realistic goals with difficulty ratings</p>
              <p>• <strong>Relevant:</strong> Aligned with your motivations and priorities</p>
              <p>• <strong>Time-bound:</strong> Defined timeframes with regular check-in schedules</p>
              <p className="pt-2">✨ <strong>Bonus:</strong> Build streaks, unlock milestones, and track progress photos!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="mt-8 border-dashed">
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          <p>
            This is a demo page with sample data. In production, action plans and goals are
            automatically generated from your AI skin analysis and saved to your account.
          </p>
          <p className="mt-2">
            <strong>Note:</strong> Changes made in this demo are stored in local state only and
            will reset when you refresh the page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
