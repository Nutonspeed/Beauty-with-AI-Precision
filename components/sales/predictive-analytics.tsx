/**
 * AI Predictive Analytics
 * Forecast lead behavior and conversion patterns
 * Competitive advantage: Data-driven future predictions
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Calendar,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { AILeadScorer, LeadData } from '@/lib/ai/lead-scorer';
import { useTranslations } from 'next-intl';

interface PredictionResult {
  leadId: string;
  predictions: {
    shortTermConversion: number; // 0-100, next 7 days
    mediumTermConversion: number; // 0-100, next 30 days
    longTermConversion: number; // 0-100, next 90 days
    churnRisk: number; // 0-100
    engagementTrend: 'increasing' | 'stable' | 'decreasing';
    bestContactTime: string;
    preferredChannel: 'email' | 'phone' | 'chat' | 'social';
    priceSensitivity: 'low' | 'medium' | 'high';
    brandLoyalty: number; // 0-100
    recommendationLikelihood: number; // 0-100
  };
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
}

interface AnalyticsSummary {
  overallConversionTrend: 'up' | 'stable' | 'down';
  averageConversionTime: number; // days
  topPredictors: string[];
  segmentPerformance: { [segment: string]: number };
  revenueForecast: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
}

export function PredictiveAnalytics() {
  const t = useTranslations();
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [aiScorer] = useState(() => new AILeadScorer());

  // Mock lead data for demonstration
  useEffect(() => {
    const mockLeads: LeadData[] = [
      {
        id: '1',
        name: t('predictiveAnalytics.mock.name1'),
        source: 'Facebook Ads',
        status: 'hot',
        budget: 'high',
        interests: t.raw('campaignManager.mock.interests1') as string[],
        concerns: t.raw('campaignManager.mock.concerns1') as string[],
        age: 28,
        gender: 'female',
        engagement: {
          websiteVisits: 15,
          emailOpens: 12,
          emailClicks: 8,
          chatInteractions: 6,
          socialEngagement: 20,
          contentDownloads: 3,
          appointmentBookings: 2,
        },
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        firstContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        totalInteractions: 66,
        responseTime: 2,
      },
      {
        id: '2',
        name: t('predictiveAnalytics.mock.name2'),
        source: 'Google Search',
        status: 'warm',
        budget: 'medium',
        interests: t.raw('campaignManager.mock.interests2') as string[],
        concerns: t.raw('campaignManager.mock.concerns2') as string[],
        age: 45,
        gender: 'male',
        engagement: {
          websiteVisits: 8,
          emailOpens: 5,
          emailClicks: 2,
          chatInteractions: 3,
          socialEngagement: 8,
          contentDownloads: 1,
          appointmentBookings: 0,
        },
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
        firstContact: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        totalInteractions: 27,
        responseTime: 4,
      },
    ];

    setLeads(mockLeads);
  }, []);

  const runPredictions = async () => {
    if (leads.length === 0) return;

    setIsAnalyzing(true);
    try {
      const predictionResults: PredictionResult[] = [];

      for (const lead of leads) {
        try {
          const behaviorPrediction = await aiScorer.predictBehavior(lead, leads);

          const result: PredictionResult = {
            leadId: lead.id,
            predictions: {
              shortTermConversion: Math.random() * 100, // Mock data - in real implementation this comes from AI
              mediumTermConversion: Math.random() * 100,
              longTermConversion: Math.random() * 100,
              churnRisk: Math.random() * 100,
              engagementTrend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)] as any,
              bestContactTime: [t('dashboard.predictiveAnalytics.metrics.trends.up'), t('dashboard.predictiveAnalytics.metrics.trends.stable'), t('dashboard.predictiveAnalytics.metrics.trends.down')][Math.floor(Math.random() * 3)],
              preferredChannel: ['email', 'phone', 'chat', 'social'][Math.floor(Math.random() * 4)] as any,
              priceSensitivity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
              brandLoyalty: Math.random() * 100,
              recommendationLikelihood: Math.random() * 100,
            },
            insights: [
              t('dashboard.predictiveAnalytics.insights.title'),
              t('dashboard.predictiveAnalytics.insights.recommendations'),
              t('dashboard.predictiveAnalytics.card.opportunities')
            ],
            recommendations: [
              t('dashboard.predictiveAnalytics.insights.recommendations'),
              t('dashboard.predictiveAnalytics.card.opportunities'),
              t('dashboard.predictiveAnalytics.empty.title')
            ],
            riskFactors: [
              t('dashboard.predictiveAnalytics.card.risks'),
              t('dashboard.predictiveAnalytics.card.churnRisk')
            ],
            opportunities: [
              t('dashboard.predictiveAnalytics.card.opportunities'),
              t('dashboard.predictiveAnalytics.card.referralChance')
            ],
          };

          predictionResults.push(result);
        } catch (error) {
          console.error(`Failed to predict for lead ${lead.id}:`, error);
        }
      }

      setPredictions(predictionResults);

      // Generate analytics summary
      const summary: AnalyticsSummary = {
        overallConversionTrend: 'up',
        averageConversionTime: 21,
        topPredictors: ['engagement_score', 'budget_level', 'response_time'],
        segmentPerformance: {
          'High-Value': 85,
          'Warm Leads': 62,
          'Cold Leads': 23,
        },
        revenueForecast: {
          nextMonth: 450000,
          nextQuarter: 1800000,
          confidence: 78,
        },
      };

      setAnalytics(summary);
    } catch (error) {
      console.error('Prediction analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPredictionForLead = (leadId: string) => {
    return predictions.find(p => p.leadId === leadId);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-600 to-teal-600">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>{t('dashboard.predictiveAnalytics.title')}</CardTitle>
                <p className="text-sm text-gray-600">{t('dashboard.predictiveAnalytics.subtitle')}</p>
              </div>
            </div>
            <Button
              onClick={runPredictions}
              disabled={isAnalyzing || leads.length === 0}
              className="bg-gradient-to-r from-green-600 to-teal-600"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('dashboard.predictiveAnalytics.analyzing')}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  {t('dashboard.predictiveAnalytics.analyzeButton')}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">{t('dashboard.predictiveAnalytics.metrics.conversionTrend')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {analytics.overallConversionTrend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : analytics.overallConversionTrend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-500" />
                    )}
                    <p className="text-lg font-bold capitalize">
                      {analytics.overallConversionTrend === 'up' ? t('dashboard.predictiveAnalytics.metrics.trends.up') :
                       analytics.overallConversionTrend === 'down' ? t('dashboard.predictiveAnalytics.metrics.trends.down') : t('dashboard.predictiveAnalytics.metrics.trends.stable')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">{t('dashboard.predictiveAnalytics.metrics.avgConversionTime')}</p>
                  <p className="text-2xl font-bold">{t('dashboard.predictiveAnalytics.metrics.days', { count: analytics.averageConversionTime })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">{t('dashboard.predictiveAnalytics.metrics.revenueForecastMonth')}</p>
                  <p className="text-2xl font-bold">{t('format.currency', { amount: analytics.revenueForecast.nextMonth.toLocaleString() })}</p>
                  <p className="text-xs text-gray-500">{t('dashboard.predictiveAnalytics.metrics.confidence', { percent: analytics.revenueForecast.confidence })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">{t('dashboard.predictiveAnalytics.metrics.revenueForecastQuarter')}</p>
                  <p className="text-2xl font-bold">{t('format.currency', { amount: analytics.revenueForecast.nextQuarter.toLocaleString() })}</p>
                  <p className="text-xs text-gray-500">{t('dashboard.predictiveAnalytics.metrics.confidence', { percent: analytics.revenueForecast.confidence })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lead Predictions */}
      {predictions.length > 0 && (
        <Tabs defaultValue="predictions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="predictions">{t('dashboard.predictiveAnalytics.tabs.predictions')}</TabsTrigger>
            <TabsTrigger value="insights">{t('dashboard.predictiveAnalytics.tabs.insights')}</TabsTrigger>
            <TabsTrigger value="opportunities">{t('dashboard.predictiveAnalytics.tabs.opportunities')}</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {leads.map((lead) => {
                const prediction = getPredictionForLead(lead.id);
                if (!prediction) return null;

                return (
                  <Card key={lead.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-lg font-semibold">{lead.name}</h3>
                          <Badge variant="outline">{lead.source}</Badge>
                          <Badge
                            className={lead.status === 'hot' ? 'bg-red-100 text-red-800' :
                                     lead.status === 'warm' ? 'bg-orange-100 text-orange-800' :
                                     'bg-gray-100 text-gray-800'}
                          >
                            {lead.status === 'hot' ? t('salesLeads.status.hot') : lead.status === 'warm' ? t('salesLeads.status.warm') : t('salesLeads.status.cold')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Conversion Predictions */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">{t('dashboard.predictiveAnalytics.card.conversionChance')}</h4>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{t('dashboard.predictiveAnalytics.card.shortTerm')}</span>
                                  <span className="font-medium">{prediction.predictions.shortTermConversion.toFixed(0)}%</span>
                                </div>
                                <Progress value={prediction.predictions.shortTermConversion} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{t('dashboard.predictiveAnalytics.card.mediumTerm')}</span>
                                  <span className="font-medium">{prediction.predictions.mediumTermConversion.toFixed(0)}%</span>
                                </div>
                                <Progress value={prediction.predictions.mediumTermConversion} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{t('dashboard.predictiveAnalytics.card.longTerm')}</span>
                                  <span className="font-medium">{prediction.predictions.longTermConversion.toFixed(0)}%</span>
                                </div>
                                <Progress value={prediction.predictions.longTermConversion} className="h-2" />
                              </div>
                            </div>
                          </div>

                          {/* Behavior Insights */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">{t('dashboard.predictiveAnalytics.card.behavior')}</h4>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">{t('dashboard.predictiveAnalytics.card.engagementTrend')}</span>
                                <div className="flex items-center gap-1">
                                  {getTrendIcon(prediction.predictions.engagementTrend)}
                                  <span className={`text-sm font-medium ${getTrendColor(prediction.predictions.engagementTrend)}`}>
                                    {prediction.predictions.engagementTrend === 'increasing' ? t('dashboard.predictiveAnalytics.metrics.trends.up') :
                                     prediction.predictions.engagementTrend === 'decreasing' ? t('dashboard.predictiveAnalytics.metrics.trends.down') : t('dashboard.predictiveAnalytics.metrics.trends.stable')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">{t('dashboard.predictiveAnalytics.card.bestChannel')}</span>
                                <Badge variant="outline" className="text-xs">
                                  {prediction.predictions.preferredChannel === 'email' ? t('dashboard.predictiveAnalytics.card.channels.email') :
                                   prediction.predictions.preferredChannel === 'phone' ? t('dashboard.predictiveAnalytics.card.channels.phone') :
                                   prediction.predictions.preferredChannel === 'chat' ? t('dashboard.predictiveAnalytics.card.channels.chat') : t('dashboard.predictiveAnalytics.card.channels.social')}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">{t('dashboard.predictiveAnalytics.card.bestTime')}</span>
                                <span className="text-sm font-medium text-blue-600">
                                  {prediction.predictions.bestContactTime}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">{t('dashboard.predictiveAnalytics.card.priceSensitivity')}</span>
                                <Badge
                                  className={`text-xs ${
                                    prediction.predictions.priceSensitivity === 'low' ? 'bg-green-100 text-green-800' :
                                    prediction.predictions.priceSensitivity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {prediction.predictions.priceSensitivity === 'low' ? t('dashboard.predictiveAnalytics.card.sensitivity.low') :
                                   prediction.predictions.priceSensitivity === 'medium' ? t('dashboard.predictiveAnalytics.card.sensitivity.medium') : t('dashboard.predictiveAnalytics.card.sensitivity.high')}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Loyalty & Risk */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">{t('dashboard.predictiveAnalytics.card.loyalty')}</h4>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{t('dashboard.predictiveAnalytics.card.brandLoyalty')}</span>
                                  <span className="font-medium">{prediction.predictions.brandLoyalty.toFixed(0)}%</span>
                                </div>
                                <Progress value={prediction.predictions.brandLoyalty} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{t('dashboard.predictiveAnalytics.card.referralChance')}</span>
                                  <span className="font-medium">{prediction.predictions.recommendationLikelihood.toFixed(0)}%</span>
                                </div>
                                <Progress value={prediction.predictions.recommendationLikelihood} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{t('dashboard.predictiveAnalytics.card.churnRisk')}</span>
                                  <span className="font-medium text-red-600">{prediction.predictions.churnRisk.toFixed(0)}%</span>
                                </div>
                                <Progress value={prediction.predictions.churnRisk} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        <div className="mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
                          >
                            {selectedLead === lead.id ? t('dashboard.predictiveAnalytics.card.showLess') : t('dashboard.predictiveAnalytics.card.showMore')}
                          </Button>

                          {selectedLead === lead.id && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h5 className="font-medium text-green-900">{t('dashboard.predictiveAnalytics.card.opportunities')}</h5>
                                {prediction.opportunities.map((opp, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{opp}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-2">
                                <h5 className="font-medium text-red-900">{t('dashboard.predictiveAnalytics.card.risks')}</h5>
                                {prediction.riskFactors.map((risk, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-sm">
                                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span>{risk}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {predictions.slice(0, 2).map((prediction) => {
                const lead = leads.find(l => l.id === prediction.leadId);
                if (!lead) return null;

                return (
                  <Card key={prediction.leadId}>
                    <CardHeader>
                      <CardTitle className="text-lg">{lead.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('dashboard.predictiveAnalytics.insights.title')}</h4>
                        <div className="space-y-2">
                          {prediction.insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('dashboard.predictiveAnalytics.insights.recommendations')}</h4>
                        <div className="space-y-2">
                          {prediction.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.predictiveAnalytics.opportunitiesTab.predictors')}</CardTitle>
                    <p className="text-sm text-gray-600">{t('dashboard.predictiveAnalytics.opportunitiesTab.predictorsDesc')}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.topPredictors.map((predictor, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm">{predictor.replace('_', ' ')}</span>
                          <Badge variant="outline">{Math.floor(Math.random() * 30 + 70)}%</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.predictiveAnalytics.opportunitiesTab.segmentPerformance')}</CardTitle>
                    <p className="text-sm text-gray-600">{t('dashboard.predictiveAnalytics.opportunitiesTab.segmentPerformanceDesc')}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.segmentPerformance).map(([segment, performance]) => (
                        <div key={segment} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{segment}</span>
                            <span className="font-medium">{performance}%</span>
                          </div>
                          <Progress value={performance} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {predictions.length === 0 && !isAnalyzing && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t('dashboard.predictiveAnalytics.empty.title')}</h3>
              <p className="text-gray-600 mt-1">
                {t('dashboard.predictiveAnalytics.empty.description')}
              </p>
            </div>
            <Button
              onClick={runPredictions}
              className="bg-gradient-to-r from-green-600 to-teal-600"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('dashboard.predictiveAnalytics.analyzeButton')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default PredictiveAnalytics;
