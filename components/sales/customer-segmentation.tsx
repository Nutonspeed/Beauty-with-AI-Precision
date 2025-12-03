/**
 * AI Customer Segmentation
 * Intelligent lead categorization and targeting
 * Competitive advantage: Data-driven customer insights
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Target,
  TrendingUp,
  PieChart,
  BarChart3,
  Brain,
  Zap,
  Filter
} from 'lucide-react';
import { AILeadScorer, LeadData, LeadSegmentation } from '@/lib/ai/lead-scorer';

interface SegmentationResult {
  segments: LeadSegmentation[];
  segmentDistribution: { [segmentName: string]: number };
  insights: string[];
  recommendations: string[];
  performanceMetrics: {
    segmentDiversity: number;
    targetingEfficiency: number;
    conversionLift: number;
  };
}

export function CustomerSegmentation() {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [segmentation, setSegmentation] = useState<SegmentationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [aiScorer] = useState(() => new AILeadScorer());

  // Mock lead data for demonstration
  useEffect(() => {
    const mockLeads: any[] = [
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
      {
        id: '3',
        name: 'วรรณา สวยงาม',
        source: 'Instagram',
        status: 'cold',
        budget: 'low',
        interests: ['HydraFacial'],
        concerns: ['ผิวแห้ง'],
        age: 32,
        gender: 'female',
        engagement: {
          websiteVisits: 3,
          emailOpens: 1,
          emailClicks: 0,
          chatInteractions: 1,
          socialEngagement: 4,
          contentDownloads: 0,
          appointmentBookings: 0,
        },
        lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        firstContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        totalInteractions: 9,
        responseTime: 8,
      },
      {
        id: '4',
        name: 'ประสิทธิ์ วิไล',
        source: 'Website',
        status: 'hot',
        budget: 'premium',
        interests: ['เลเซอร์', 'ฟิลเลอร์', 'โบท็อกซ์'],
        concerns: ['ริ้วรอย', 'จุดด่างดำ', 'ผิวไม่กระชับ'],
        age: 38,
        gender: 'male',
        engagement: {
          websiteVisits: 25,
          emailOpens: 18,
          emailClicks: 12,
          chatInteractions: 9,
          socialEngagement: 15,
          contentDownloads: 5,
          appointmentBookings: 3,
        },
        lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
        firstContact: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        totalInteractions: 87,
        responseTime: 1,
      },
      {
        id: '5',
        name: 'นภาพร แสงจันทร์',
        source: 'Referral',
        status: 'warm',
        budget: 'high',
        interests: ['แพ็คเกจผิวขาว', 'ดูแลหลังเลเซอร์'],
        concerns: ['ผิวหมองคล้ำ', 'จุดด่างดำ'],
        age: 29,
        gender: 'female',
        engagement: {
          websiteVisits: 12,
          emailOpens: 10,
          emailClicks: 6,
          chatInteractions: 4,
          socialEngagement: 12,
          contentDownloads: 2,
          appointmentBookings: 1,
        },
        lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
        firstContact: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        totalInteractions: 47,
        responseTime: 3,
      },
    ];

    setLeads(mockLeads);
  }, []);

  const performSegmentation = async () => {
    if (leads.length === 0) return;

    setIsAnalyzing(true);
    try {
      const fn = (aiScorer as any).segmentLeads
      const segments: any[] = typeof fn === 'function' ? await fn.call(aiScorer, leads) : [
        {
          segment: 'All Leads',
          description: 'Fallback segment',
          conversionRate: 0,
          averageValue: 0,
          characteristics: [],
          recommendedStrategy: 'General outreach',
          recommendedActions: [],
          conversionLift: 0
        }
      ]

      // Calculate distribution
      const segmentDistribution: { [key: string]: number } = {};
      segments.forEach((segment: any) => {
        segmentDistribution[segment.segment] = 0;
      });

      // Assign leads to segments (simplified logic)
      leads.forEach(lead => {
        const bestSegment = (segments as any[]).find((segment: any) => {
          if (lead.budget === 'premium' && segment.segment.includes('High-Value')) return true;
          if (lead.engagement.websiteVisits > 10 && segment.segment.includes('Engaged')) return true;
          if (lead.status === 'cold' && segment.segment.includes('Cold')) return true;
          return false;
        }) || segments[0];

        segmentDistribution[bestSegment.segment]++;
      });

      const result: SegmentationResult = {
        segments,
        segmentDistribution,
        insights: [
          'กลุ่มลูกค้าระดับพรีเมียมมีแนวโน้มการซื้อสูงที่สุด',
          'ลูกค้าที่มีส่วนร่วมทางโซเชียลตอบสนองต่อแคมเปญได้ดี',
          'กลุ่มลูกค้าใหม่ต้องการการศึกษาเรื่องการรักษามากที่สุด'
        ],
        recommendations: [
          'เพิ่มแคมเปญส่วนบุคคลสำหรับกลุ่ม High-Value',
          'สร้างเนื้อหาการศึกษาสำหรับกลุ่ม Cold Leads',
          'ใช้โซเชียลมีเดียในการเข้าถึงกลุ่ม Engaged Browsers'
        ],
        performanceMetrics: {
          segmentDiversity: 85,
          targetingEfficiency: 78,
          conversionLift: 32,
        },
      };

      setSegmentation(result);
    } catch (error) {
      console.error('Segmentation failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSegmentColor = (segmentName: string) => {
    const colors = {
      'High-Value Prospects': 'bg-purple-100 text-purple-800 border-purple-200',
      'Engaged Browsers': 'bg-blue-100 text-blue-800 border-blue-200',
      'Cold Leads': 'bg-gray-100 text-gray-800 border-gray-200',
      'Premium Seekers': 'bg-pink-100 text-pink-800 border-pink-200',
      'Referral Champions': 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[segmentName as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>AI Customer Segmentation</CardTitle>
                <p className="text-sm text-gray-600">แบ่งกลุ่มลูกค้าอัจฉริยะด้วย AI</p>
              </div>
            </div>
            <Button
              onClick={performSegmentation}
              disabled={isAnalyzing || leads.length === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังวิเคราะห์...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  เริ่มการแบ่งกลุ่ม
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      {segmentation && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">จำนวนกลุ่ม</p>
                  <p className="text-2xl font-bold">{segmentation.segments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">ความหลากหลาย</p>
                  <p className="text-2xl font-bold">{segmentation.performanceMetrics.segmentDiversity}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">ประสิทธิภาพการ targeting</p>
                  <p className="text-2xl font-bold">{segmentation.performanceMetrics.targetingEfficiency}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">Conversion Lift</p>
                  <p className="text-2xl font-bold">+{segmentation.performanceMetrics.conversionLift}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Segmentation Results */}
      {segmentation && (
        <Tabs defaultValue="segments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="segments">กลุ่มลูกค้า</TabsTrigger>
            <TabsTrigger value="insights">ข้อมูลเชิงลึก</TabsTrigger>
            <TabsTrigger value="distribution">การกระจาย</TabsTrigger>
          </TabsList>

          <TabsContent value="segments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {segmentation.segments.map((segment, index) => (
                <Card
                  key={segment.segment}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedSegment === segment.segment ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setSelectedSegment(
                    selectedSegment === segment.segment ? null : segment.segment
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{segment.segment}</CardTitle>
                      <Badge className={getSegmentColor(segment.segment)}>
                        {segmentation.segmentDistribution[segment.segment]} คน
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{segment.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Conversion Rate</span>
                        <span className="font-medium">{segment.conversionRate}%</span>
                      </div>
                      <Progress value={segment.conversionRate} className="h-2" />
                    </div>

                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-1">มูลค่าเฉลี่ย</div>
                      <div className="text-lg font-bold text-green-600">
                        ฿{segment.averageValue.toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 text-sm">ลักษณะสำคัญ</div>
                      <div className="flex flex-wrap gap-1">
                        {segment.characteristics.slice(0, 3).map((char, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {selectedSegment === segment.segment && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900 text-sm mb-2">กลยุทธ์แนะนำ</div>
                        <p className="text-sm text-gray-700">{segment.recommendedStrategy}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    ข้อมูลเชิงลึก
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {segmentation.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    คำแนะนำ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {segmentation.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>การกระจายกลุ่มลูกค้า</CardTitle>
                <p className="text-sm text-gray-600">จำนวนลูกค้าในแต่ละกลุ่ม</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(segmentation.segmentDistribution).map(([segment, count]) => {
                    const percentage = (count / leads.length) * 100;
                    return (
                      <div key={segment} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{segment}</span>
                          <span>{count} คน ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-3" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!segmentation && !isAnalyzing && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">พร้อมสำหรับการแบ่งกลุ่ม</h3>
              <p className="text-gray-600 mt-1">
                คลิก "เริ่มการแบ่งกลุ่ม" เพื่อให้ AI วิเคราะห์และแบ่งกลุ่มลูกค้าของคุณ
              </p>
            </div>
            <Button
              onClick={performSegmentation}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <Filter className="w-4 h-4 mr-2" />
              เริ่มการแบ่งกลุ่ม
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default CustomerSegmentation;
