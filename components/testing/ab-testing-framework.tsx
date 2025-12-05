/**
 * A/B Testing Framework for AI Features
 * Test and optimize AI feature variations
 * Competitive advantage: Data-driven feature optimization
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FlaskConical,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Play,
  Pause,
  CheckCircle,
  Brain
} from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  description: string;
  feature: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: TestVariant[];
  targetMetric: string;
  sampleSize: number;
  confidenceLevel: number;
  startDate?: Date;
  endDate?: Date;
  winner?: string;
  improvement?: number;
  statisticalSignificance?: boolean;
}

interface TestVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  parameters: { [key: string]: any };
  metrics: {
    impressions: number;
    conversions: number;
    conversionRate: number;
    averageTime: number;
    satisfactionScore: number;
  };
  isWinner?: boolean;
}

interface TestAnalytics {
  testId: string;
  totalParticipants: number;
  conversionRate: number;
  confidenceInterval: [number, number];
  statisticalSignificance: boolean;
  recommendedWinner: string;
  insights: string[];
  potentialImprovement: number;
}

export function ABTestingFramework() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<TestAnalytics | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Mock A/B test data
  useEffect(() => {
    const mockTests: ABTest[] = [
      {
        id: 'skin-analysis-prompts',
        name: 'Skin Analysis Prompts Optimization',
        description: 'Test different AI prompts for skin analysis accuracy',
        feature: 'AI Skin Analysis',
        status: 'completed',
        variants: [
          {
            id: 'variant_a',
            name: 'Detailed Analysis',
            description: 'Comprehensive analysis with detailed explanations',
            trafficPercentage: 50,
            parameters: { promptLength: 'detailed', includeConfidence: true },
            metrics: {
              impressions: 1250,
              conversions: 875,
              conversionRate: 70,
              averageTime: 4500,
              satisfactionScore: 4.2
            },
            isWinner: true
          },
          {
            id: 'variant_b',
            name: 'Concise Analysis',
            description: 'Brief analysis focused on key findings',
            trafficPercentage: 50,
            parameters: { promptLength: 'concise', includeConfidence: false },
            metrics: {
              impressions: 1250,
              conversions: 788,
              conversionRate: 63,
              averageTime: 3200,
              satisfactionScore: 3.8
            }
          }
        ],
        targetMetric: 'conversion_rate',
        sampleSize: 2500,
        confidenceLevel: 95,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        winner: 'variant_a',
        improvement: 11,
        statisticalSignificance: true
      },
      {
        id: 'objection-handling-scripts',
        name: 'Sales Objection Scripts',
        description: 'Test different objection handling approaches',
        feature: 'AI Sales Companion',
        status: 'running',
        variants: [
          {
            id: 'variant_a',
            name: 'Empathetic Approach',
            description: 'Focus on understanding customer concerns',
            trafficPercentage: 33,
            parameters: { tone: 'empathetic', scriptLength: 'medium' },
            metrics: {
              impressions: 450,
              conversions: 315,
              conversionRate: 70,
              averageTime: 3800,
              satisfactionScore: 4.1
            }
          },
          {
            id: 'variant_b',
            name: 'Direct Approach',
            description: 'Straightforward objection handling',
            trafficPercentage: 33,
            parameters: { tone: 'direct', scriptLength: 'short' },
            metrics: {
              impressions: 420,
              conversions: 252,
              conversionRate: 60,
              averageTime: 2900,
              satisfactionScore: 3.7
            }
          },
          {
            id: 'variant_c',
            name: 'Storytelling Approach',
            description: 'Use customer stories to overcome objections',
            trafficPercentage: 34,
            parameters: { tone: 'storytelling', scriptLength: 'long' },
            metrics: {
              impressions: 380,
              conversions: 266,
              conversionRate: 70,
              averageTime: 4200,
              satisfactionScore: 4.3
            }
          }
        ],
        targetMetric: 'conversion_rate',
        sampleSize: 1500,
        confidenceLevel: 95,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'campaign-subject-lines',
        name: 'Email Campaign Subject Lines',
        description: 'Test different subject line strategies for open rates',
        feature: 'Marketing Campaigns',
        status: 'draft',
        variants: [
          {
            id: 'variant_a',
            name: 'Question-Based',
            description: 'Subject lines that ask questions',
            trafficPercentage: 50,
            parameters: { style: 'question', urgency: 'low' },
            metrics: {
              impressions: 0,
              conversions: 0,
              conversionRate: 0,
              averageTime: 0,
              satisfactionScore: 0
            }
          },
          {
            id: 'variant_b',
            name: 'Benefit-Focused',
            description: 'Subject lines highlighting benefits',
            trafficPercentage: 50,
            parameters: { style: 'benefit', urgency: 'high' },
            metrics: {
              impressions: 0,
              conversions: 0,
              conversionRate: 0,
              averageTime: 0,
              satisfactionScore: 0
            }
          }
        ],
        targetMetric: 'open_rate',
        sampleSize: 10000,
        confidenceLevel: 95
      }
    ];

    setTests(mockTests);
  }, []);

  const startTest = (testId: string) => {
    setTests(prev => prev.map(test =>
      test.id === testId ? {
        ...test,
        status: 'running',
        startDate: new Date()
      } : test
    ));
  };

  const pauseTest = (testId: string) => {
    setTests(prev => prev.map(test =>
      test.id === testId ? {
        ...test,
        status: 'paused'
      } : test
    ));
  };

  const completeTest = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    // Simulate test completion with winner determination
    const bestVariant = test.variants.reduce((best, current) =>
      current.metrics.conversionRate > best.metrics.conversionRate ? current : best
    );

    setTests(prev => prev.map(t =>
      t.id === testId ? {
        ...t,
        status: 'completed',
        endDate: new Date(),
        winner: bestVariant.id,
        improvement: Math.round((bestVariant.metrics.conversionRate / Math.max(...t.variants.map(v => v.metrics.conversionRate))) * 100 - 100),
        statisticalSignificance: true
      } : t
    ));
  };

  const analyzeTest = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    const totalParticipants = test.variants.reduce((sum, v) => sum + v.metrics.impressions, 0);
    const weightedConversionRate = test.variants.reduce((sum, v) =>
      sum + (v.metrics.conversionRate * v.metrics.impressions), 0
    ) / totalParticipants;

    // Mock analytics
    const analysis: TestAnalytics = {
      testId,
      totalParticipants,
      conversionRate: weightedConversionRate,
      confidenceInterval: [weightedConversionRate - 2, weightedConversionRate + 2],
      statisticalSignificance: test.variants.some(v => Math.abs(v.metrics.conversionRate - weightedConversionRate) > 5),
      recommendedWinner: test.variants.reduce((best, current) =>
        current.metrics.conversionRate > best.metrics.conversionRate ? current : best
      ).id,
      insights: [
        'Variant A performs 15% better than baseline',
        'Statistical significance achieved with 95% confidence',
        'Customer satisfaction correlates with conversion rate'
      ],
      potentialImprovement: 12
    };

    setAnalytics(analysis);
    setSelectedTest(testId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWinnerBadge = (variant: TestVariant, isWinner: boolean) => {
    if (isWinner) {
      return <Badge className="bg-green-100 text-green-800">🏆 Winner</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>A/B Testing Framework</CardTitle>
                <p className="text-sm text-gray-600">ทดสอบและปรับปรุงฟีเจอร์ AI ด้วยการทดสอบ A/B</p>
              </div>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              สร้างการทดสอบใหม่
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Test Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
              <FlaskConical className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {tests.filter(t => t.status === 'running').length} กำลังทำงาน
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Completed Tests</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.status === 'completed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {Math.round((tests.filter(t => t.status === 'completed').length / tests.length) * 100)}% success rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Avg Improvement</p>
                <p className="text-2xl font-bold text-green-600">
                  +{Math.round(tests.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.improvement ?? 0), 0) / Math.max(1, tests.filter(t => t.status === 'completed').length))}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Participants</p>
                <p className="text-2xl font-bold">{tests.reduce((sum, t) => sum + t.sampleSize, 0).toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Management */}
      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">A/B Tests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <div className="space-y-4">
            {tests.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        test.status === 'running' ? 'bg-green-100' :
                        test.status === 'completed' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        <p className="text-sm text-gray-600">{test.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(test.status)}>
                        {test.status === 'draft' ? 'ร่าง' :
                         test.status === 'running' ? 'กำลังทำงาน' :
                         test.status === 'completed' ? 'เสร็จสิ้น' : 'หยุดชั่วคราว'}
                      </Badge>
                      {test.winner && (
                        <Badge className="bg-green-100 text-green-800">
                          Improvement: +{test.improvement}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Feature</p>
                      <p className="font-medium">{test.feature}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Target Metric</p>
                      <p className="font-medium">{test.targetMetric.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sample Size</p>
                      <p className="font-medium">{test.sampleSize.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Confidence</p>
                      <p className="font-medium">{test.confidenceLevel}%</p>
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Test Variants</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {test.variants.map((variant) => (
                        <div key={variant.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{variant.name}</h5>
                            {getWinnerBadge(variant, variant.id === test.winner)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{variant.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Traffic:</span>
                              <span className="font-medium ml-1">{variant.trafficPercentage}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Conversions:</span>
                              <span className="font-medium ml-1">{variant.metrics.conversions}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Rate:</span>
                              <span className="font-medium ml-1">{variant.metrics.conversionRate}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Satisfaction:</span>
                              <span className="font-medium ml-1">{variant.metrics.satisfactionScore}/5</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {test.status === 'draft' && (
                      <Button onClick={() => startTest(test.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        เริ่มการทดสอบ
                      </Button>
                    )}
                    {test.status === 'running' && (
                      <>
                        <Button onClick={() => pauseTest(test.id)} variant="outline">
                          <Pause className="w-4 h-4 mr-2" />
                          หยุดชั่วคราว
                        </Button>
                        <Button onClick={() => completeTest(test.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          เสร็จสิ้นการทดสอบ
                        </Button>
                      </>
                    )}
                    <Button onClick={() => analyzeTest(test.id)} variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      วิเคราะห์ผล
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.totalParticipants.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600">Total Participants</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-600">Conversion Rate</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence Interval</span>
                      <span>{analytics.confidenceInterval[0].toFixed(1)}% - {analytics.confidenceInterval[1].toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Statistical Significance</span>
                      <Badge className={analytics.statisticalSignificance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {analytics.statisticalSignificance ? 'Significant' : 'Not Significant'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Recommended Winner</span>
                      <span className="font-medium">{analytics.recommendedWinner}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.insights.map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Potential Improvement</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      +{analytics.potentialImprovement}%
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Expected performance increase
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Analytics Available</h3>
              <p className="text-gray-600 mt-1">
                Select a test and click "วิเคราะห์ผล" to view detailed analytics
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { feature: 'AI Skin Analysis', improvement: 23 },
                    { feature: 'Lead Scoring', improvement: 18 },
                    { feature: 'Sales Companion', improvement: 31 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm">{item.feature}</span>
                      <Badge className="bg-green-100 text-green-800">
                        +{item.improvement}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Testing Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Always test with sufficient sample size',
                    'Use statistical significance testing',
                    'Test one variable at a time',
                    'Monitor user experience metrics',
                    'Document all test results'
                  ].map((practice, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{practice}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Test Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Campaign subject line variations',
                    'AI response time optimization',
                    'Mobile app user flow testing',
                    'Pricing strategy A/B testing',
                    'Onboarding experience optimization'
                  ].map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ABTestingFramework;
