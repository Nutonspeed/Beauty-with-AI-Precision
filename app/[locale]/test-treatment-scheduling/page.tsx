/**
 * Treatment Scheduling Test Page
 * 
 * Comprehensive demo page for the AI-powered treatment scheduling system
 * with mock data, timeline visualization, and interactive features.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calendar, CheckCircle, Info } from 'lucide-react';
import { TreatmentSchedulingEngine } from '@/lib/ai/treatment-scheduling';
import { TreatmentSchedulingComponent } from '@/components/analysis/treatment-scheduling';
import type { TreatmentRecommendation } from '@/lib/ai/treatment-recommendations';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import type { TreatmentHistory } from '@/lib/ai/treatment-scheduling';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_TREATMENTS: TreatmentRecommendation[] = [
  {
    id: 'laser-1',
    name: 'Fractional CO2 Laser',
    category: 'laser',
    targetConcerns: ['wrinkles', 'texture', 'spots'],
    priority: 'high',
    confidence: 0.92,
    description: 'Advanced laser resurfacing for deep wrinkles and skin texture improvement',
    expectedResults: 'Significant reduction in wrinkles and texture irregularities',
    duration: '4-6 weeks',
    frequency: 'Once monthly (3 sessions)',
    cost: { min: 15000, max: 20000, currency: 'THB' },
    suitableFor: ['dry', 'normal', 'combination', 'sensitive'],
    contraindications: ['active_infection', 'keloid_prone'],
    effectiveness: 85,
    downtime: '5-7 days',
    painLevel: 3,
    sessionDuration: '45 minutes',
    numberOfSessions: 3,
    beforeCare: [
      'Avoid sun exposure for 2 weeks',
      'Stop retinoids 3 days before',
      'Hydrate well',
    ],
    afterCare: [
      'Apply recovery serum hourly',
      'Use SPF 50+ daily',
      'Avoid makeup for 48 hours',
      'Sleep elevated',
    ],
    alternatives: ['microneedling', 'ipl'],
    benefits: ['deep_wrinkle_reduction', 'skin_tightening', 'dramatic_texture_improvement'],
    risks: ['temporary_redness', 'sensitivity', 'potential_hyperpigmentation'],
  },
  {
    id: 'microneedling-1',
    name: 'Microneedling with RF',
    category: 'microneedling',
    targetConcerns: ['wrinkles', 'texture', 'pores'],
    priority: 'high',
    confidence: 0.88,
    description: 'Radiofrequency-enhanced microneedling for collagen stimulation',
    expectedResults: 'Improved skin texture, reduced pore size, and fine line reduction',
    duration: '6-8 weeks',
    frequency: 'Every 3-4 weeks (4 sessions)',
    cost: { min: 8000, max: 12000, currency: 'THB' },
    suitableFor: ['oily', 'combination', 'normal'],
    contraindications: ['active_acne', 'keloid_prone', 'cold_sores'],
    effectiveness: 78,
    downtime: '3-4 days',
    painLevel: 2,
    sessionDuration: '30 minutes',
    numberOfSessions: 4,
    beforeCare: [
      'Avoid sun 1 week before',
      'Stop vitamin A products',
      'Cleanse skin thoroughly',
    ],
    afterCare: [
      'Use gentle cleanser',
      'Apply hydrating serum',
      'SPF 50+ for 4 weeks',
      'Avoid strenuous exercise',
    ],
    alternatives: ['laser', 'chemical_peel'],
    benefits: ['collagen_stimulation', 'pore_reduction', 'fine_line_reduction'],
    risks: ['temporary_redness', 'minor_swelling', 'rare_infection'],
  },
  {
    id: 'chemical-peel-1',
    name: 'Medium Strength Chemical Peel',
    category: 'chemical_peel',
    targetConcerns: ['spots', 'texture', 'pigmentation'],
    priority: 'high',
    confidence: 0.85,
    description: 'Glycolic acid peel for superficial to medium depth skin renewal',
    expectedResults: 'Brightened complexion, improved tone, and reduced spots',
    duration: '3-4 weeks',
    frequency: 'Every 3 weeks (4 sessions)',
    cost: { min: 5000, max: 8000, currency: 'THB' },
    suitableFor: ['oily', 'combination', 'normal'],
    contraindications: ['sensitive_skin', 'active_acne', 'recent_procedures'],
    effectiveness: 75,
    downtime: '3-5 days',
    painLevel: 2,
    sessionDuration: '20 minutes',
    numberOfSessions: 4,
    beforeCare: [
      'Avoid sun 1 week',
      'Hydrate extensively',
      'Stop acids 3 days before',
    ],
    afterCare: [
      'Use recovery mask',
      'Strict SPF routine',
      'Avoid makeup 24 hours',
    ],
    alternatives: ['laser', 'microneedling'],
    benefits: ['brightening', 'texture_improvement', 'spot_reduction'],
    risks: ['temporary_redness', 'sensitivity', 'dryness'],
  },
  {
    id: 'ipl-1',
    name: 'Intense Pulsed Light (IPL)',
    category: 'ipl',
    targetConcerns: ['spots', 'redness', 'pigmentation'],
    priority: 'medium',
    confidence: 0.82,
    description: 'Photo rejuvenation for pigmentation and vascular concerns',
    expectedResults: 'Even skin tone, reduced redness, faded spots',
    duration: '4-6 weeks',
    frequency: 'Every 3 weeks (4 sessions)',
    cost: { min: 6000, max: 10000, currency: 'THB' },
    suitableFor: ['normal', 'combination', 'dry'],
    contraindications: ['dark_skin', 'recent_sun', 'active_infection'],
    effectiveness: 80,
    downtime: '4-5 days',
    painLevel: 2,
    sessionDuration: '25 minutes',
    numberOfSessions: 4,
    beforeCare: [
      'Avoid sun 2 weeks',
      'Prescreening important',
      'Hydrate well',
    ],
    afterCare: [
      'SPF 70+ mandatory',
      'Avoid heat for 24 hours',
      'Apply soothing serum',
    ],
    alternatives: ['laser', 'chemical_peel'],
    benefits: ['vascular_improvement', 'pigmentation_reduction', 'rejuvenation'],
    risks: ['temporary_bruising', 'hypopigmentation_risk', 'paradoxical_darkening'],
  },
  {
    id: 'hydrafacial-1',
    name: 'HydraFacial Facial',
    category: 'hydrafacial',
    targetConcerns: ['pores', 'texture', 'dryness'],
    priority: 'medium',
    confidence: 0.8,
    description: 'Vortex fusion hydradermabrasion and hydration treatment',
    expectedResults: 'Refined pores, hydrated skin, improved radiance',
    duration: '2-3 weeks',
    frequency: 'Bi-weekly maintenance (6 sessions)',
    cost: { min: 2500, max: 4000, currency: 'THB' },
    suitableFor: ['all'],
    contraindications: [],
    effectiveness: 70,
    downtime: '0 days',
    painLevel: 0,
    sessionDuration: '30 minutes',
    numberOfSessions: 6,
    beforeCare: ['No special prep needed'],
    afterCare: [
      'Can resume makeup immediately',
      'Use hydrating serum',
      'SPF for outdoor activities',
    ],
    alternatives: ['chemical_peel', 'microdermabrasion'],
    benefits: ['deep_hydration', 'pore_refinement', 'immediate_glow'],
    risks: ['none_minimal'],
  },
];

const MOCK_ANALYSIS: HybridSkinAnalysis = {
  id: 'analysis-001',
  userId: 'user-001',
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  imageUrl: '',
  aiProvider: 'google-vision',
  ai: {
    skinType: 'combination',
    concerns: ['dark_spots', 'large_pores', 'wrinkles', 'texture'] as const,
    severity: {
      acne: 2,
      blackheads: 3,
      dark_spots: 6,
      dullness: 2,
      fine_lines: 6,
      hyperpigmentation: 4,
      large_pores: 5,
      pores: 5,
      redness: 3,
      spots: 6,
      texture: 6,
      wrinkles: 7,
    },
    recommendations: [
      { category: 'serum', product: 'Vitamin C Serum', reason: 'For brightening and antioxidant protection' },
      { category: 'treatment', product: 'Retinol Night Treatment', reason: 'For wrinkle and texture improvement' },
    ],
    confidence: 0.90,
  },
  cv: {
    spots: {
      count: 12,
      locations: [],
      severity: 6,
    },
    pores: {
      averageSize: 0.15,
      enlargedCount: 45,
      severity: 5,
    },
    wrinkles: {
      count: 8,
      locations: [],
      severity: 7,
    },
    texture: {
      smoothness: 6,
      roughness: 4,
      score: 6,
    },
    redness: {
      percentage: 8,
      areas: [],
      severity: 3,
    },
  },
  overallScore: {
    spots: 6,
    pores: 5,
    wrinkles: 7,
    texture: 6,
    redness: 3,
    pigmentation: 5,
  },
  percentiles: {
    wrinkles: 72,
    spots: 65,
    pores: 58,
    texture: 62,
    redness: 45,
    overall: 62,
  },
  confidence: 0.9,
  recommendations: ['Hydrate daily', 'Apply SPF 50+ each morning'],
  annotatedImages: {},
};

const MOCK_HISTORY: TreatmentHistory[] = [
  {
    treatmentId: 'hydrafacial-1',
    treatmentName: 'HydraFacial',
    completedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    effectivenessRating: 4,
    downtimeExperienced: 0,
    nextRecommendedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  {
    treatmentId: 'chemical-peel-1',
    treatmentName: 'Chemical Peel',
    completedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    effectivenessRating: 4,
    downtimeExperienced: 3,
  },
];

// ============================================================================
// Timeline Data
// ============================================================================

const TREATMENT_TIMELINE_DATA = [
  { month: 'Week 1', laser: 1, microneedling: 0, peel: 0 },
  { month: 'Week 2', laser: 0, microneedling: 1, peel: 0 },
  { month: 'Week 3', laser: 0, microneedling: 0, peel: 1 },
  { month: 'Week 4', laser: 0, microneedling: 0, peel: 0 },
  { month: 'Week 5', laser: 1, microneedling: 0, peel: 0 },
  { month: 'Week 6', laser: 0, microneedling: 1, peel: 1 },
  { month: 'Week 7', laser: 0, microneedling: 0, peel: 0 },
  { month: 'Week 8', laser: 0, microneedling: 1, peel: 0 },
];

const COST_BREAKDOWN_DATA = [
  { name: 'Laser Treatments', value: 45000, percentage: 35 },
  { name: 'Microneedling', value: 40000, percentage: 31 },
  { name: 'Chemical Peels', value: 28000, percentage: 22 },
  { name: 'Maintenance', value: 16000, percentage: 12 },
];

const DOWNTIME_CHART_DATA = [
  { treatment: 'CO2 Laser', downtime: 6 },
  { treatment: 'Microneedling', downtime: 3 },
  { treatment: 'Chemical Peel', downtime: 4 },
  { treatment: 'IPL', downtime: 4 },
  { treatment: 'HydraFacial', downtime: 0 },
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

// ============================================================================
// Component
// ============================================================================

export default function TreatmentSchedulingTestPage() {
  const [locale, setLocale] = useState<'th' | 'en'>('en');

  const translations = {
    en: {
      title: 'Treatment Scheduling Integration Test',
      description: 'AI-optimized treatment plan with intelligent scheduling and conflict detection',
      currentAnalysis: 'Current Skin Analysis',
      treatmentTimeline: 'Treatment Timeline',
      costBreakdown: 'Cost Breakdown by Treatment',
      downtimeComparison: 'Downtime Comparison',
      mockDataInfo: 'Mock Data Information',
      analysisDate: 'Analysis Date',
      skinType: 'Skin Type',
      primaryConcerns: 'Primary Concerns',
      treatmentsPlanned: 'Treatments Planned',
      features: 'Key Features',
      toggleLanguage: 'Toggle Language',
      features_list: [
        '✓ AI-optimized treatment sequencing based on priority and effectiveness',
        '✓ Automatic conflict detection between incompatible treatments',
        '✓ Recovery time calculation and scheduling',
        '✓ Budget-aware treatment planning',
        '✓ Treatment history analysis for personalized sequencing',
        '✓ Downtime minimization for optimal patient convenience',
        '✓ Recovery stage recommendations with care instructions',
        '✓ Rescheduling capabilities with conflict checking',
        '✓ Multi-week treatment plan with detailed timeline',
        '✓ Confidence scoring for each recommended treatment',
      ],
    },
    th: {
      title: 'ทดสอบการรวมตารางการรักษา',
      description: 'แผนการรักษาที่เหมาะสมที่สุดโดย AI พร้อมการจัดกำหนดการอัจฉริยะและการตรวจสอบความขัดแย้ง',
      currentAnalysis: 'การวิเคราะห์ผิวปัจจุบัน',
      treatmentTimeline: 'ไทม์ไลน์การรักษา',
      costBreakdown: 'การแบ่งต้นทุนตามการรักษา',
      downtimeComparison: 'การเปรียบเทียบระยะเวลาพักตัว',
      mockDataInfo: 'ข้อมูล Mock',
      analysisDate: 'วันที่วิเคราะห์',
      skinType: 'ประเภทผิว',
      primaryConcerns: 'ข้อกังวลหลัก',
      treatmentsPlanned: 'การรักษาที่วางแผนไว้',
      features: 'คุณสมบัติหลัก',
      toggleLanguage: 'เปลี่ยนภาษา',
      features_list: [
        '✓ การจัดลำดับการรักษาที่เหมาะสมที่สุดโดย AI บนพื้นฐานของลำดับความสำคัญและประสิทธิผล',
        '✓ การตรวจสอบความขัดแย้งโดยอัตโนมัติระหว่างการรักษาที่เข้ากันไม่ได้',
        '✓ การคำนวณระยะเวลาการฟื้นตัวและการจัดกำหนดการ',
        '✓ การวางแผนการรักษาโดยคำนึงถึงงบประมาณ',
        '✓ การวิเคราะห์ประวัติการรักษาเพื่อการจัดลำดับแบบบุคคลกำหนด',
        '✓ การลดระยะเวลาพักตัวให้เหมาะสำหรับความสะดวกของผู้ป่วย',
        '✓ คำแนะนำขั้นตอนการฟื้นตัวพร้อมคำแนะนำการดูแลรักษา',
        '✓ ความสามารถในการเปลี่ยนตารางการรักษาโดยคำนึงถึงความขัดแย้ง',
        '✓ แผนการรักษาหลายสัปดาห์พร้อมไทม์ไลน์โดยละเอียด',
        '✓ การให้คะแนนความมั่นใจสำหรับแต่ละการรักษาที่แนะนำ',
      ],
    },
  };

  const t = translations[locale];

  // Generate optimal schedule
  const schedulingRecommendation = useMemo(() => {
    return TreatmentSchedulingEngine.generateOptimalSchedule(
      MOCK_TREATMENTS,
      MOCK_ANALYSIS,
      MOCK_HISTORY,
      {
        unavailableDates: [],
        maxConcurrentTreatments: 1,
        preferredDaysOfWeek: [2, 3, 4, 5],
        minDaysBetweenSessions: 7,
        maxRecoveryTimeAcceptable: 7,
        budgetPerMonth: 30000,
        prioritizeDowntime: true,
      },
      new Date()
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{t.title}</h1>
              <p className="text-lg text-muted-foreground">{t.description}</p>
            </div>
            <Button
              onClick={() => setLocale(locale === 'en' ? 'th' : 'en')}
              variant="outline"
            >
              {t.toggleLanguage}
            </Button>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            This page demonstrates the AI Treatment Scheduling system with mock data. The system
            analyzes treatment compatibility, recovery times, and creates an optimal treatment plan.
          </AlertDescription>
        </Alert>

        {/* Analysis Summary */}
        <Card className="bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              {t.currentAnalysis}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t.analysisDate}</p>
              <p className="font-semibold">
                {MOCK_ANALYSIS.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t.skinType}</p>
              <p className="font-semibold capitalize">{MOCK_ANALYSIS.ai.skinType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t.primaryConcerns}</p>
              <div className="flex flex-wrap gap-1">
                {(MOCK_ANALYSIS.ai.concerns as string[]).slice(0, 2).map((concern) => (
                  <Badge key={concern} variant="secondary" className="capitalize">
                    {concern}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Treatment Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t.treatmentTimeline}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={TREATMENT_TIMELINE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="laser" stackId="a" fill="#8b5cf6" name="Laser" />
                  <Bar dataKey="microneedling" stackId="a" fill="#3b82f6" name="Microneedling" />
                  <Bar dataKey="peel" stackId="a" fill="#10b981" name="Chemical Peel" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t.costBreakdown}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={COST_BREAKDOWN_DATA}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const payloadPercentage = (props.payload as { percentage?: number })?.percentage;
                      const ratio = typeof props.percent === 'number'
                        ? props.percent
                        : typeof payloadPercentage === 'number'
                          ? payloadPercentage / 100
                          : 0;
                      const name = (props.payload as { name?: string })?.name || props.name || '';
                      const percentageText = (ratio * 100).toFixed(0);
                      return name ? `${name} ${percentageText}%` : `${percentageText}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COST_BREAKDOWN_DATA.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Downtime Comparison */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t.downtimeComparison}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={DOWNTIME_CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="treatment" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="downtime" fill="#f59e0b" name="Days of Downtime" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {t.features}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.features_list.map((feature, idx) => (
                <div key={feature} className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Treatment Scheduling Component */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Scheduling Recommendation</CardTitle>
            <CardDescription>AI-optimized treatment plan</CardDescription>
          </CardHeader>
          <CardContent>
            <TreatmentSchedulingComponent
              recommendations={schedulingRecommendation}
              locale={locale}
              onScheduleConfirm={(schedule) => {
                console.log('Schedule confirmed:', schedule);
                alert('Treatment schedule has been confirmed!');
              }}
              onReschedule={(treatmentId) => {
                console.log('Reschedule requested:', treatmentId);
                alert(`Reschedule requested for: ${treatmentId}`);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
