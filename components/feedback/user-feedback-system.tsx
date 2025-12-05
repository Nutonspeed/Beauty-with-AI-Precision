/**
 * User Feedback Collection System
 * Gather user insights and improve AI features
 * Competitive advantage: User-driven AI improvement
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  MessageSquare,
  ThumbsUp,
  Star,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userRole: 'customer' | 'staff' | 'admin';
  feature: string;
  rating: number; // 1-5
  category: 'ai_accuracy' | 'usability' | 'performance' | 'design' | 'functionality' | 'other';
  feedback: string;
  suggestions?: string;
  timestamp: Date;
  status: 'new' | 'reviewed' | 'implemented' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  satisfactionScore: number;
  featureRatings: { [feature: string]: number };
  categoryDistribution: { [category: string]: number };
  responseRate: number;
  improvementAreas: string[];
  positiveHighlights: string[];
}

interface NPSData {
  promoters: number;
  passives: number;
  detractors: number;
  score: number;
  trend: 'up' | 'stable' | 'down';
}

export function UserFeedbackSystem() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [npsData, setNpsData] = useState<NPSData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock feedback data
  useEffect(() => {
    const mockFeedback: FeedbackItem[] = [
      {
        id: '1',
        userId: 'user_001',
        userName: 'สมใจ รักสวย',
        userRole: 'customer',
        feature: 'AI Skin Analysis',
        rating: 5,
        category: 'ai_accuracy',
        feedback: 'วิเคราะห์ผิวได้แม่นยำมาก ชอบที่บอกสาเหตุและแนะนำการรักษาได้เหมาะสม',
        suggestions: 'เพิ่มตัวเลือกภาษาอังกฤษ',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'reviewed',
        priority: 'medium',
        tags: ['accuracy', 'usability', 'localization']
      },
      {
        id: '2',
        userId: 'user_002',
        userName: 'วิชัย ใจดี',
        userRole: 'customer',
        feature: 'Lead Scoring',
        rating: 4,
        category: 'functionality',
        feedback: 'ระบบให้คะแนน Lead ได้ดี แต่บางครั้งดูไม่ตรงกับความเป็นจริง',
        suggestions: 'ปรับปรุง algorithm ให้แม่นยำขึ้น',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'new',
        priority: 'high',
        tags: ['accuracy', 'algorithm']
      },
      {
        id: '3',
        userId: 'staff_001',
        userName: 'แพทย์สมศรี',
        userRole: 'staff',
        feature: 'AI Sales Companion',
        rating: 5,
        category: 'usability',
        feedback: 'ช่วยจัดการ objection ได้ดีมาก ลดเวลาปิดการขายลงอย่างเห็นได้ชัด',
        suggestions: 'เพิ่ม script สำหรับ objection ประเภทต่างๆ',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'implemented',
        priority: 'low',
        tags: ['efficiency', 'sales']
      },
      {
        id: '4',
        userId: 'user_003',
        userName: 'วรรณา สวยงาม',
        userRole: 'customer',
        feature: 'AR Simulator',
        rating: 3,
        category: 'performance',
        feedback: 'ภาพ 3D สวยงาม แต่โหลดช้าและบางครั้งกระตุก',
        suggestions: 'ปรับปรุง performance และเพิ่มความละเอียด',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'new',
        priority: 'critical',
        tags: ['performance', 'ux']
      },
      {
        id: '5',
        userId: 'admin_001',
        userName: 'ผู้จัดการคลินิก',
        userRole: 'admin',
        feature: 'Dashboard Analytics',
        rating: 4,
        category: 'design',
        feedback: 'ข้อมูลครบถ้วนและมีประโยชน์ แต่ layout บางส่วนดูซับซ้อน',
        suggestions: 'ปรับปรุง UX และเพิ่ม filter ในการดูข้อมูล',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: 'reviewed',
        priority: 'medium',
        tags: ['ux', 'analytics']
      }
    ];

    setFeedback(mockFeedback);

    // Calculate analytics
    const totalFeedback = mockFeedback.length;
    const averageRating = mockFeedback.reduce((sum, item) => sum + item.rating, 0) / totalFeedback;
    const satisfactionScore = (averageRating / 5) * 100;

    const featureRatings: { [key: string]: number } = {};
    const categoryDistribution: { [key: string]: number } = {};

    mockFeedback.forEach(item => {
      // Feature ratings
      if (!featureRatings[item.feature]) {
        featureRatings[item.feature] = 0;
      }
      featureRatings[item.feature] += item.rating;

      // Category distribution
      if (!categoryDistribution[item.category]) {
        categoryDistribution[item.category] = 0;
      }
      categoryDistribution[item.category]++;

      // Count feature ratings
      const featureItems = mockFeedback.filter(f => f.feature === item.feature);
      featureRatings[item.feature] = featureRatings[item.feature] / featureItems.length;
    });

    const analyticsData: FeedbackAnalytics = {
      totalFeedback,
      averageRating,
      satisfactionScore,
      featureRatings,
      categoryDistribution,
      responseRate: 85,
      improvementAreas: ['Performance optimization', 'Algorithm accuracy', 'UI/UX improvements'],
      positiveHighlights: ['AI accuracy', 'Sales assistance', 'Data completeness']
    };

    setAnalytics(analyticsData);

    // Calculate NPS (simplified)
    const promoters = mockFeedback.filter(f => f.rating >= 4).length;
    const passives = mockFeedback.filter(f => f.rating === 3).length;
    const detractors = mockFeedback.filter(f => f.rating <= 2).length;
    const npsScore = ((promoters - detractors) / totalFeedback) * 100;

    setNpsData({
      promoters,
      passives,
      detractors,
      score: npsScore,
      trend: 'up'
    });

    setIsLoading(false);
  }, []);

  const updateFeedbackStatus = (feedbackId: string, newStatus: FeedbackItem['status']) => {
    setFeedback(prev => prev.map(item =>
      item.id === feedbackId ? { ...item, status: newStatus } : item
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredFeedback = feedback.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>User Feedback System</CardTitle>
                <p className="text-sm text-gray-600">รวบรวมและวิเคราะห์ความคิดเห็นผู้ใช้</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics?.satisfactionScore.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Satisfaction Score</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {npsData?.score.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">NPS Score</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Feedback</p>
                <p className="text-2xl font-bold">{analytics?.totalFeedback}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {analytics?.responseRate}% response rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Average Rating</p>
                <p className="text-2xl font-bold">{analytics?.averageRating.toFixed(1)}/5</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <div className="flex">{getRatingStars(Math.round(analytics?.averageRating || 0))}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Net Promoter Score</p>
                <p className={`text-2xl font-bold ${npsData && npsData.score > 30 ? 'text-green-600' : npsData && npsData.score > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {npsData?.score.toFixed(0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {npsData?.promoters} promoters, {npsData?.detractors} detractors
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold">{feedback.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Feedback participants
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Management */}
      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">Feedback Items</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="ai_accuracy">AI Accuracy</SelectItem>
                      <SelectItem value="usability">Usability</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="functionality">Functionality</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="implemented">Implemented</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex">{getRatingStars(item.rating)}</div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'new' ? 'ใหม่' :
                           item.status === 'reviewed' ? 'ตรวจสอบแล้ว' :
                           item.status === 'implemented' ? 'ดำเนินการแล้ว' : 'ยกเลิก'}
                        </Badge>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority === 'critical' ? 'ด่วนมาก' :
                           item.priority === 'high' ? 'ด่วน' :
                           item.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">User</p>
                          <p className="font-medium">{item.userName}</p>
                          <p className="text-xs text-gray-500 capitalize">{item.userRole}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Feature</p>
                          <p className="font-medium">{item.feature}</p>
                          <p className="text-xs text-gray-500">{item.category.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">{item.timestamp.toLocaleDateString('th-TH')}</p>
                          <p className="text-xs text-gray-500">{item.timestamp.toLocaleTimeString('th-TH')}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Feedback</p>
                        <p className="text-sm">{item.feedback}</p>
                      </div>

                      {item.suggestions && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Suggestions</p>
                          <p className="text-sm text-blue-600">{item.suggestions}</p>
                        </div>
                      )}

                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      {item.status === 'new' && (
                        <Button
                          size="sm"
                          onClick={() => updateFeedbackStatus(item.id, 'reviewed')}
                        >
                          ตรวจสอบแล้ว
                        </Button>
                      )}
                      {item.status === 'reviewed' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateFeedbackStatus(item.id, 'implemented')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            ดำเนินการแล้ว
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateFeedbackStatus(item.id, 'dismissed')}
                          >
                            ยกเลิก
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics && Object.entries(analytics.featureRatings).map(([feature, rating]) => (
                    <div key={feature} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{feature}</span>
                        <span className="font-medium">{rating.toFixed(1)}/5</span>
                      </div>
                      <Progress value={(rating / 5) * 100} className="h-2" />
                      <div className="flex justify-center">{getRatingStars(Math.round(rating))}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics && Object.entries(analytics.categoryDistribution).map(([category, count]) => {
                    const percentage = (count / analytics.totalFeedback) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{category.replace('_', ' ')}</span>
                          <span className="font-medium">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                  Positive Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.positiveHighlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.improvementAreas.map((area, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Target className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{area}</span>
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

export default UserFeedbackSystem;
