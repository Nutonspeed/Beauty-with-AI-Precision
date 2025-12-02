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
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { AILeadScorer, LeadData } from '@/lib/ai/lead-scorer';

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
        name: 'สมใจ รักสวย',
        source: 'Facebook Ads',
        status: 'hot',
        budget: 'high',
        interests: ['สิว', 'ผิวกระจ่าง'],
        concerns: ['สิวอักเสบ', 'จุดด่างดำ'],
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
        name: 'วิชัย ใจดี',
        source: 'Google Search',
        status: 'warm',
        budget: 'medium',
        interests: ['ริ้วรอย', 'ผิวไม่กระชับ'],
        concerns: ['ริ้วรอยใต้ตา', 'ผิวหย่อนคล้อย'],
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
              bestContactTime: ['เช้า 9:00-11:00', 'บ่าย 13:00-15:00', 'เย็น 18:00-20:00'][Math.floor(Math.random() * 3)],
              preferredChannel: ['email', 'phone', 'chat', 'social'][Math.floor(Math.random() * 4)] as any,
              priceSensitivity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
              brandLoyalty: Math.random() * 100,
              recommendationLikelihood: Math.random() * 100,
            },
            insights: [
              'ลูกค้ามีแนวโน้มการซื้อสูงในระยะสั้น',
              'การตอบสนองต่อแคมเปญอีเมลดีเยี่ยม',
              'ความเสี่ยงการหลุดออกต่ำ'
            ],
            recommendations: [
              'ติดต่อภายใน 24 ชั่วโมง',
              'เสนอแพ็คเกจพิเศษ',
              'นัดหมายปรึกษาฟรี'
            ],
            riskFactors: [
              'ยังไม่ได้นัดหมายปรึกษา',
              'การแข่งขันจากคลินิกอื่น'
            ],
            opportunities: [
              'มีโอกาสซื้อแพ็คเกจพรีเมียม',
              'น่าจะแนะนำบริการให้เพื่อน'
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
                <CardTitle>AI Predictive Analytics</CardTitle>
                <p className="text-sm text-gray-600">คาดการณ์พฤติกรรมลูกค้าและโอกาสการขาย</p>
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
                  กำลังวิเคราะห์...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  วิเคราะห์พฤติกรรม
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
                  <p className="text-sm font-medium leading-none">แนวโน้ม Conversion</p>
                  <div className="flex items-center gap-2 mt-1">
                    {analytics.overallConversionTrend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : analytics.overallConversionTrend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-500" />
                    )}
                    <p className="text-lg font-bold capitalize">
                      {analytics.overallConversionTrend === 'up' ? 'เพิ่มขึ้น' :
                       analytics.overallConversionTrend === 'down' ? 'ลดลง' : 'คงที่'}
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
                  <p className="text-sm font-medium leading-none">เวลาการแปลงเฉลี่ย</p>
                  <p className="text-2xl font-bold">{analytics.averageConversionTime} วัน</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">รายได้คาดการณ์ (เดือนหน้า)</p>
                  <p className="text-2xl font-bold">฿{analytics.revenueForecast.nextMonth.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">ความมั่นใจ {analytics.revenueForecast.confidence}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">รายได้คาดการณ์ (ไตรมาสหน้า)</p>
                  <p className="text-2xl font-bold">฿{analytics.revenueForecast.nextQuarter.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">ความมั่นใจ {analytics.revenueForecast.confidence}%</p>
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
            <TabsTrigger value="predictions">คาดการณ์ลูกค้า</TabsTrigger>
            <TabsTrigger value="insights">ข้อมูลเชิงลึก</TabsTrigger>
            <TabsTrigger value="opportunities">โอกาสและความเสี่ยง</TabsTrigger>
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
                            {lead.status === 'hot' ? 'Hot' : lead.status === 'warm' ? 'Warm' : 'Cold'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Conversion Predictions */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">โอกาสการแปลงเป็นลูกค้า</h4>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>ระยะสั้น (7 วัน)</span>
                                  <span className="font-medium">{prediction.predictions.shortTermConversion.toFixed(0)}%</span>
                                </div>
                                <Progress value={prediction.predictions.shortTermConversion} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>ระยะกลาง (30 วัน)</span>
                                  <span className="font-medium">{prediction.predictions.mediumTermConversion.toFixed(0)}%</span>
                                </div>
                                <Progress value={prediction.predictions.mediumTermConversion} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>ระยะยาว (90 วัน)</span>
                                  <span className="font-medium">{prediction.predictions.longTermConversion.toFixed(0)}%</span>
                                </div>
                                <Progress value={prediction.predictions.longTermConversion} className="h-2" />
                              </div>
                            </div>
                          </div>

                          {/* Behavior Insights */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">พฤติกรรมและความชอบ</h4>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">แนวโน้มการมีส่วนร่วม</span>
                                <div className="flex items-center gap-1">
                                  {getTrendIcon(prediction.predictions.engagementTrend)}
                                  <span className={`text-sm font-medium ${getTrendColor(prediction.predictions.engagementTrend)}`}>
                                    {prediction.predictions.engagementTrend === 'increasing' ? 'เพิ่มขึ้น' :
                                     prediction.predictions.engagementTrend === 'decreasing' ? 'ลดลง' : 'คงที่'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">ช่องทางติดต่อที่ดีที่สุด</span>
                                <Badge variant="outline" className="text-xs">
                                  {prediction.predictions.preferredChannel === 'email' ? 'อีเมล' :
                                   prediction.predictions.preferredChannel === 'phone' ? 'โทรศัพท์' :
                                   prediction.predictions.preferredChannel === 'chat' ? 'แชท' : 'โซเชียล'}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">เวลาติดต่อที่ดีที่สุด</span>
                                <span className="text-sm font-medium text-blue-600">
                                  {prediction.predictions.bestContactTime}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">ความไวต่อราคา</span>
                                <Badge
                                  className={`text-xs ${
                                    prediction.predictions.priceSensitivity === 'low' ? 'bg-green-100 text-green-800' :
                                    prediction.predictions.priceSensitivity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {prediction.predictions.priceSensitivity === 'low' ? 'ต่ำ' :
                                   prediction.predictions.priceSensitivity === 'medium' ? 'ปานกลาง' : 'สูง'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Loyalty & Risk */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">ความภักดีและความเสี่ยง</h4>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>ความภักดีต่อแบรนด์</span>
                                  <span className="font-medium">{prediction.predictions.brandLoyalty.toFixed(0)}%</span>
                                </div>
                                <Progress value={prediction.predictions.brandLoyalty} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>โอกาสแนะนำบริการ</span>
                                  <span className="font-medium">{prediction.predictions.recommendationLikelihood.toFixed(0)}%</span>
                                </div>
                                <Progress value={prediction.predictions.recommendationLikelihood} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>ความเสี่ยงการหลุดออก</span>
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
                            {selectedLead === lead.id ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียดเพิ่มเติม'}
                          </Button>

                          {selectedLead === lead.id && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h5 className="font-medium text-green-900">โอกาส</h5>
                                {prediction.opportunities.map((opp, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{opp}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-2">
                                <h5 className="font-medium text-red-900">ความเสี่ยง</h5>
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
                        <h4 className="font-medium text-gray-900 mb-2">ข้อมูลเชิงลึก</h4>
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
                        <h4 className="font-medium text-gray-900 mb-2">คำแนะนำ</h4>
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
                    <CardTitle>Top Predictors</CardTitle>
                    <p className="text-sm text-gray-600">ปัจจัยที่มีผลต่อการคาดการณ์มากที่สุด</p>
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
                    <CardTitle>Segment Performance</CardTitle>
                    <p className="text-sm text-gray-600">ประสิทธิภาพการคาดการณ์แยกตามกลุ่ม</p>
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
              <h3 className="text-lg font-medium text-gray-900">พร้อมสำหรับการคาดการณ์</h3>
              <p className="text-gray-600 mt-1">
                คลิก "วิเคราะห์พฤติกรรม" เพื่อให้ AI คาดการณ์พฤติกรรมลูกค้าและโอกาสการขาย
              </p>
            </div>
            <Button
              onClick={runPredictions}
              className="bg-gradient-to-r from-green-600 to-teal-600"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              วิเคราะห์พฤติกรรม
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default PredictiveAnalytics;
