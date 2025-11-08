'use client';

/**
 * Goal Setting and Achievement Tracking Test Page
 * Demonstrates goal management with realistic scenarios
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GoalManagement from '@/components/analysis/goal-management';
import { GoalSettingEngine } from '@/lib/ai/goal-setting';
import type { SkinGoal, GoalParameter } from '@/lib/ai/goal-setting';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import { CheckCircle2, Target, Info, Lightbulb } from 'lucide-react';

export default function TestGoalSettingPage() {
  const [locale, setLocale] = useState<'en' | 'th'>('en');
  const [goals, setGoals] = useState<SkinGoal[]>(() => {
    // Initialize with mock goals showing various scenarios
    const userId = 'test-user';
    const now = new Date();

    // Goal 1: Active - Spots reduction (50% complete)
    const goal1: SkinGoal = {
      id: 'goal-1',
      userId,
      parameter: 'spots',
      startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      targetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      currentValue: 62,
      targetValue: 78,
      baselineValue: 45,
      status: 'active',
      priority: 'high',
      rationale: 'Significant hyperpigmentation detected. Target is to reduce visible spots.',
      milestones: [
        {
          id: 'milestone-1-1',
          name: 'Initial Improvement',
          targetValue: 55,
          achieved: true,
          achievedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          progress: 100,
        },
        {
          id: 'milestone-1-2',
          name: 'Noticeable Clarity',
          targetValue: 65,
          achieved: true,
          achievedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          progress: 100,
        },
        {
          id: 'milestone-1-3',
          name: 'Significant Improvement',
          targetValue: 75,
          achieved: false,
          progress: 47,
        },
      ],
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      completionPercentage: 48,
      motivationalNotes:
        'Great momentum! Your spots are responding well to treatment. Keep up the consistency!',
      treatmentPlan: ['IPL Therapy', 'Vitamin C Serum', 'Weekly Facials'],
    };

    // Goal 2: Achieved - Redness reduction
    const goal2: SkinGoal = {
      id: 'goal-2',
      userId,
      parameter: 'redness',
      startDate: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
      targetDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      currentValue: 82,
      targetValue: 80,
      baselineValue: 42,
      status: 'achieved',
      priority: 'high',
      rationale: 'Significant inflammation detected. Successfully reduced with anti-inflammatory treatments.',
      milestones: [
        {
          id: 'milestone-2-1',
          name: 'Initial Calming',
          targetValue: 55,
          achieved: true,
          achievedAt: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000),
          progress: 100,
        },
        {
          id: 'milestone-2-2',
          name: 'Reduced Inflammation',
          targetValue: 68,
          achieved: true,
          achievedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
          progress: 100,
        },
        {
          id: 'milestone-2-3',
          name: 'Clear Complexion',
          targetValue: 80,
          achieved: true,
          achievedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
          progress: 100,
        },
      ],
      createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      completionPercentage: 100,
      motivationalNotes: '🎉 Congratulations! You achieved your redness goal!',
      treatmentPlan: ['Laser Therapy', 'Calming Mask', 'Niacinamide Serum'],
    };

    // Goal 3: Active - Wrinkles reduction (25% complete)
    const goal3: SkinGoal = {
      id: 'goal-3',
      userId,
      parameter: 'wrinkles',
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      targetDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      currentValue: 59,
      targetValue: 75,
      baselineValue: 54,
      status: 'active',
      priority: 'medium',
      rationale: 'Fine lines and wrinkles present. Aiming for visible improvement.',
      milestones: [
        {
          id: 'milestone-3-1',
          name: 'Fine Line Reduction',
          targetValue: 61,
          achieved: false,
          progress: 80,
        },
        {
          id: 'milestone-3-2',
          name: 'Moderate Improvement',
          targetValue: 68,
          achieved: false,
          progress: 0,
        },
        {
          id: 'milestone-3-3',
          name: 'Significant Smoothing',
          targetValue: 75,
          achieved: false,
          progress: 0,
        },
      ],
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      completionPercentage: 25,
      motivationalNotes:
        'You just started your wrinkle reduction journey. Consistency is key for visible results!',
      treatmentPlan: ['Microneedling', 'Retinol Serum', 'Hydrating Mask'],
    };

    // Goal 4: Paused - Texture improvement
    const goal4: SkinGoal = {
      id: 'goal-4',
      userId,
      parameter: 'texture',
      startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      targetDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      currentValue: 62,
      targetValue: 80,
      baselineValue: 50,
      status: 'paused',
      priority: 'low',
      rationale: 'Skin texture refinement for a polished appearance.',
      milestones: [
        {
          id: 'milestone-4-1',
          name: 'Surface Refinement',
          targetValue: 60,
          achieved: true,
          achievedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
          progress: 100,
        },
        {
          id: 'milestone-4-2',
          name: 'Visible Smoothness',
          targetValue: 70,
          achieved: false,
          progress: 24,
        },
        {
          id: 'milestone-4-3',
          name: 'Refined Texture',
          targetValue: 80,
          achieved: false,
          progress: 0,
        },
      ],
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      completionPercentage: 24,
      motivationalNotes: 'This goal is paused. Resume when ready to continue treatment.',
      treatmentPlan: ['Weekly Exfoliation', 'Peptide Serum'],
    };

    return [goal1, goal2, goal3, goal4];
  });

  const mockAnalysis: HybridSkinAnalysis = {
    id: 'analysis-latest',
    userId: 'test-user',
    createdAt: new Date(),
    timestamp: new Date(),
    imageUrl: '/placeholder-analysis.jpg',
    aiProvider: 'gemini',
    overallScore: {
      spots: 6.2,
      pores: 5.8,
      wrinkles: 6.5,
      texture: 6.2,
      redness: 3.2,
      pigmentation: 5,
    },
    confidence: 92,
    percentiles: {
      spots: 62,
      pores: 58,
      wrinkles: 65,
      texture: 62,
      redness: 82,
      overall: 66,
    },
    cv: {
      spots: { count: 98, severity: 6.2, locations: [] },
      pores: { averageSize: 2.5, enlargedCount: 42, severity: 5.8 },
      wrinkles: { count: 88, severity: 6.5, locations: [] },
      texture: { score: 6.2, smoothness: 6, roughness: 4.8 },
      redness: { percentage: 8.5, severity: 3.2, areas: [] },
    },
    ai: {
      skinType: 'combination',
      concerns: [],
      severity: {} as any,
      confidence: 92,
      recommendations: [],
    },
    recommendations: [],
    annotatedImages: {},
  };

  const goalSuggestions = GoalSettingEngine.suggestGoals(mockAnalysis);

  const handleAddGoal = (goal: SkinGoal) => {
    setGoals([...goals, goal]);
  };

  const handleUpdateGoal = (goal: SkinGoal) => {
    setGoals(goals.map((g) => (g.id === goal.id ? goal : g)));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter((g) => g.id !== goalId));
  };

  const createGoalFromSuggestion = (parameter: GoalParameter) => {
    const suggestion = goalSuggestions.find((s) => s.parameter === parameter);
    if (suggestion) {
      const newGoal = GoalSettingEngine.createGoal(
        'test-user',
        parameter,
        suggestion.suggestedTarget,
        mockAnalysis.percentiles[parameter],
        12
      );
      handleAddGoal(newGoal);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Target className="h-8 w-8" />
              Goal Setting & Achievement Tracking
            </h1>
            <p className="text-muted-foreground mt-2">
              Demonstrate AI-powered goal setting and progress tracking system
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={locale === 'en' ? 'default' : 'outline'}
              onClick={() => setLocale('en')}
            >
              English
            </Button>
            <Button
              variant={locale === 'th' ? 'default' : 'outline'}
              onClick={() => setLocale('th')}
            >
              ภาษาไทย
            </Button>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This page demonstrates the Goal Setting and Achievement Tracking system with 4 mock
            goals at various stages: 1 achieved, 2 active, and 1 paused. The system intelligently
            suggests goals based on analysis results.
          </AlertDescription>
        </Alert>
      </div>

      {/* Current Analysis Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Analysis Status</CardTitle>
          <CardDescription>Latest skin analysis percentiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-6 gap-4">
            {(['spots', 'pores', 'wrinkles', 'texture', 'redness', 'overall'] as GoalParameter[]).map(
              (param) => (
                <div key={param} className="text-center">
                  <p className="text-sm text-muted-foreground capitalize mb-1">{param}</p>
                  <p className="text-2xl font-bold text-primary">
                    {mockAnalysis.percentiles[param]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">percentile</p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Suggested Goals Based on Analysis
          </CardTitle>
          <CardDescription>
            AI-recommended goals for improvement based on current skin analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {goalSuggestions.map((suggestion) => {
              const alreadyHasGoal = goals.some((g) => g.parameter === suggestion.parameter);
              return (
                <Card key={suggestion.parameter} className="border">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold capitalize">{suggestion.parameter}</h3>
                        <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current</p>
                          <p className="font-semibold">{mockAnalysis.percentiles[suggestion.parameter]}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Suggested Target</p>
                          <p className="font-semibold text-green-600">{suggestion.suggestedTarget}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                          {suggestion.difficulty}
                        </span>
                        <span className="text-muted-foreground">{suggestion.estimatedTimeframe}</span>
                      </div>
                      <Button
                        onClick={() => createGoalFromSuggestion(suggestion.parameter as GoalParameter)}
                        disabled={alreadyHasGoal}
                        className="w-full"
                        size="sm"
                      >
                        {alreadyHasGoal ? 'Goal Exists' : 'Create Goal'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Goal Summary Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Goals</p>
              <p className="text-3xl font-bold">{goals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Active</p>
              <p className="text-3xl font-bold text-blue-600">
                {goals.filter((g) => g.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Achieved</p>
              <p className="text-3xl font-bold text-green-600">
                {goals.filter((g) => g.status === 'achieved').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Avg. Progress</p>
              <p className="text-3xl font-bold text-primary">
                {goals.length > 0
                  ? (
                      goals.reduce((sum, g) => sum + g.completionPercentage, 0) / goals.length
                    ).toFixed(0)
                  : 0}
                %
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Management Component */}
      <GoalManagement
        goals={goals}
        locale={locale}
        onAddGoal={handleAddGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
      />

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Features Overview</CardTitle>
          <CardDescription>Goal Setting and Achievement Tracking Capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: 'AI-Powered Suggestions',
                description: 'Intelligent goal recommendations based on skin analysis',
              },
              {
                title: 'Milestone Tracking',
                description: 'Break down goals into achievable milestones with progress tracking',
              },
              {
                title: 'Progress Monitoring',
                description: 'Real-time progress tracking against target metrics',
              },
              {
                title: 'Trend Analysis',
                description: 'Visual indicators for acceleration, steady progress, or slowing momentum',
              },
              {
                title: 'Timeline Management',
                description: 'Realistic goal timelines with estimated completion dates',
              },
              {
                title: 'Treatment Planning',
                description: 'Linked treatment plans for achieving specific goals',
              },
              {
                title: 'Motivational Support',
                description: 'Dynamic motivational messages based on progress',
              },
              {
                title: 'Bilingual Support',
                description: 'Full Thai/English language support throughout',
              },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
