'use client';

import React from 'react';
import { useTreatmentRecommendations } from '@/hooks/useTreatmentRecommendations';
import { TreatmentRecommendations } from '@/components/treatment-recommendations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedMetricsResult } from '@/lib/ai/enhanced-skin-metrics';
import { TreatmentRecommendation } from '@/lib/ai/treatment-recommender';

export function AIRecommenderDemoPanel() {
  const {
    recommendations,
    summary,
    userProfile,
    isLoading,
    error,
    generateRecommendations,
    updateUserProfile,
  } = useTreatmentRecommendations();

  const [selectedTreatment, setSelectedTreatment] = React.useState<TreatmentRecommendation | null>(null);

  const handleGenerateDemoRecommendations = async () => {
    const sampleMetrics: EnhancedMetricsResult = {
      spots: {
        score: 42,
        count: 45,
        averageSize: 8,
        distribution: 'scattered',
        severity: 'medium',
        confidence: 0.85,
      },
      pores: {
        score: 48,
        count: 320,
        averageSize: 6,
        visibility: 'moderate',
        distribution: 'concentrated',
        confidence: 0.78,
      },
      wrinkles: {
        score: 38,
        count: 28,
        averageDepth: 7,
        totalLength: 450,
        types: {
          fine: 20,
          moderate: 7,
          deep: 1,
        },
        areas: ['forehead', 'eyes'],
        confidence: 0.82,
      },
      texture: {
        score: 45,
        smoothness: 0.38,
        roughness: 0.62,
        uniformity: 0.38,
        quality: 'poor',
        confidence: 0.76,
      },
      redness: {
        score: 52,
        intensity: 0.48,
        coverage: 0.22,
        pattern: 'diffuse',
        causes: ['inflammation'],
        confidence: 0.81,
      },
      hydration: {
        score: 44,
        level: 'normal',
        shininess: 0.4,
        areas: {
          tZone: 65,
          cheeks: 55,
          overall: 60,
        },
        confidence: 0.73,
      },
      skinTone: {
        score: 58,
        uniformity: 0.52,
        discoloration: 0.2,
        fitzpatrickType: 3,
        undertone: 'neutral',
        confidence: 0.79,
      },
      elasticity: {
        score: 48,
        firmness: 0.46,
        sagging: 0.54,
        areas: ['jawline'],
        confidence: 0.75,
      },
      skinAge: {
        estimated: 42,
        chronological: 35,
        difference: 7,
        confidence: 0.75,
      },
      overallHealth: {
        score: 46.4,
        grade: 'D',
        confidence: 0.79,
      },
    };

    await generateRecommendations(sampleMetrics, {
      maxCost: 30000,
    });
  };

  const handleCreateSampleProfile = async () => {
    await updateUserProfile({
      age: 35,
      skinType: 'combination',
      allergies: [],
      medications: [],
      previousTreatments: [],
      budget: { min: 5000, max: 25000 },
      downtimePreference: 'minimal',
    });
  };

  const handleSelectTreatment = (treatment: TreatmentRecommendation) => {
    setSelectedTreatment(treatment);
  };

  const handleBookConsultation = (treatment: TreatmentRecommendation) => {
    alert(`จองคิวสำหรับ ${treatment.name}\nกรุณาติดต่อคลินิกเพื่อนัดหมาย`);
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Treatment Recommender</h2>
            <p className="text-gray-600">
              ระบบแนะนำการรักษาด้วย AI ที่วิเคราะห์จากผลการตรวจผิวและประวัติการรักษา
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleCreateSampleProfile}>
            สร้างโปรไฟล์ตัวอย่าง
          </Button>
        </div>

        {userProfile ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <ProfileStat label="อายุ" value={`${userProfile.age} ปี`} />
            <ProfileStat label="ประเภทผิว" value={userProfile.skinType} />
            <ProfileStat label="การรักษาที่ผ่านมา" value={`${userProfile.previousTreatments.length} ครั้ง`} />
            <ProfileStat
              label="งบประมาณ"
              value={
                userProfile.budget
                  ? `฿${userProfile.budget.min.toLocaleString()}-${userProfile.budget.max.toLocaleString()}`
                  : 'ไม่ระบุ'
              }
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">ยังไม่มีข้อมูลโปรไฟล์</p>
            <Button onClick={handleCreateSampleProfile}>สร้างโปรไฟล์</Button>
          </div>
        )}
      </Card>

      {recommendations.length === 0 && (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">เริ่มต้นรับคำแนะนำการรักษา</h3>
            <p className="text-gray-600 mb-6">
              ระบบจะวิเคราะห์ผลการตรวจผิวของคุณและแนะนำการรักษาที่เหมาะสมที่สุด
            </p>
            <Button
              onClick={handleGenerateDemoRecommendations}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? 'กำลังวิเคราะห์...' : '🚀 สร้างคำแนะนำแบบทดสอบ'}
            </Button>
            <p className="text-xs text-gray-500 mt-4">ใช้ข้อมูลตัวอย่างสำหรับการสาธิต</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-red-800 font-semibold">เกิดข้อผิดพลาด:</p>
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {isLoading && (
        <Card className="p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
          <p className="text-gray-600 mt-6">กำลังวิเคราะห์และสร้างคำแนะนำด้วย AI...</p>
        </Card>
      )}

      {!isLoading && recommendations.length > 0 && (
        <div className="space-y-6">
          <TreatmentRecommendations
            recommendations={recommendations}
            summary={summary || undefined}
            onSelectTreatment={handleSelectTreatment}
            onBookConsultation={handleBookConsultation}
          />

          {selectedTreatment && (
            <Card className="p-6 border-purple-300 bg-purple-50">
              <h3 className="text-xl font-bold text-gray-900 mb-4">✨ การรักษาที่เลือก</h3>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold">{selectedTreatment.name}</p>
                  <p className="text-sm text-gray-600">{selectedTreatment.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                    Priority: {selectedTreatment.priority.toFixed(1)}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    Confidence: {(selectedTreatment.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          <div className="text-center">
            <Button onClick={handleGenerateDemoRecommendations} variant="outline" disabled={isLoading}>
              🔄 สร้างคำแนะนำใหม่
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="p-6 text-center">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📋 ข้อมูลระบบ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-2">
              <strong>ประเภทการรักษาที่รองรับ:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {TREATMENT_TYPES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-gray-600 mb-2">
              <strong>ปัจจัยในการพิจารณา:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {EVALUATION_FACTORS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface ProfileStatProps {
  label: string;
  value: string;
}

function ProfileStat({ label, value }: ProfileStatProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Analysis',
    description: 'วิเคราะห์ผิวด้วย AI และคำนวณคะแนน confidence ของแต่ละคำแนะนำ',
  },
  {
    icon: '🎯',
    title: 'Personalized',
    description: 'คำแนะนำที่ปรับแต่งตามผลการวิเคราะห์และประวัติการรักษาของคุณ',
  },
  {
    icon: '📊',
    title: 'Data-Driven',
    description: 'ใช้ข้อมูลจากการวิเคราะห์ 8 metrics และประวัติการรักษาเพื่อความแม่นยำ',
  },
];

const TREATMENT_TYPES = [
  'Laser Treatment (เลเซอร์)',
  'Chemical Peel (สารเคมีผลัดเซลล์)',
  'Microneedling (ไมโครนีดดลิ้ง)',
  'Botox (โบท็อกซ์)',
  'Dermal Filler (ฟิลเลอร์)',
  'HydraFacial (ไฮดราเฟเชียล)',
  'IPL (แสงพัลส์)',
  'RF Treatment (คลื่นวิทยุ)',
  'LED Therapy (แสงแอลอีดี)',
  'Medical-Grade Skincare',
];

const EVALUATION_FACTORS = [
  'คะแนนจาก 8 metrics ของผิว',
  'ระดับความรุนแรงของปัญหา',
  'ประวัติการรักษาที่ผ่านมา',
  'งบประมาณและข้อจำกัดเวลา',
  'ข้อห้ามและข้อควรระวัง',
  'ผลข้างเคียงและระยะพักฟื้น',
  'ความเจ็บปวดและความสะดวก',
  'ประสิทธิภาพและความคุ้มค่า',
];

export default AIRecommenderDemoPanel;
