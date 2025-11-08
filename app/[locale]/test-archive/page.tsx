'use client';

import React, { useState, useEffect } from 'react';
import ArchiveManagement from '@/components/archive-management';
import { AnalysisArchiveEngine, type AnalysisRecord } from '@/lib/analysis-archive-engine';
import type { AIAnalysisResult, SkinConcern, SkinType } from '@/lib/types/skin-analysis';
import { Calendar, RefreshCw } from 'lucide-react';

// Mock AI analysis data
const SKIN_CONCERNS: SkinConcern[] = [
  'acne',
  'wrinkles',
  'dark_spots',
  'large_pores',
  'redness',
  'dullness',
  'fine_lines',
  'blackheads',
  'hyperpigmentation',
  'spots',
  'pores',
  'texture',
];

const createSeverity = (overrides: Partial<Record<SkinConcern, number>>): Record<SkinConcern, number> => {
  return SKIN_CONCERNS.reduce<Record<SkinConcern, number>>((acc, concern) => {
    acc[concern] = overrides[concern] ?? 0;
    return acc;
  }, {} as Record<SkinConcern, number>);
};

const createAnalysis = ({
  skinType,
  concerns,
  severity,
  recommendations,
  confidence,
  treatmentPlan,
}: {
  skinType: SkinType;
  concerns: SkinConcern[];
  severity: Partial<Record<SkinConcern, number>>;
  recommendations: Array<{ category: 'cleanser' | 'serum' | 'moisturizer' | 'treatment' | 'sunscreen'; product: string; reason: string }>;
  confidence: number;
  treatmentPlan?: string;
}): AIAnalysisResult => ({
  skinType,
  concerns,
  severity: createSeverity(severity),
  recommendations,
  treatmentPlan,
  confidence,
});

interface MockAnalysisEntry {
  id: string;
  timestamp: Date;
  overallScore: number;
  measurementCompletion: number;
  recommendations: string[];
  analysis: AIAnalysisResult;
}

const mockAnalysisData: MockAnalysisEntry[] = [
  {
    id: 'analysis-1',
    timestamp: new Date('2024-11-01'),
    overallScore: 72,
    measurementCompletion: 100,
    recommendations: ['cleanser', 'serum', 'sunscreen'],
    analysis: createAnalysis({
      skinType: 'combination',
      concerns: ['acne', 'redness', 'spots'],
      severity: {
        acne: 7,
        redness: 5,
        spots: 6,
        texture: 3,
      },
      recommendations: [
        { category: 'cleanser', product: 'Balancing Gel Cleanser', reason: 'Controls excess oil without irritation.' },
        { category: 'serum', product: 'Calming Niacinamide Serum', reason: 'Reduces redness and supports barrier health.' },
        { category: 'sunscreen', product: 'SPF 50 Mineral Shield', reason: 'Protects against UV-triggered inflammation.' },
      ],
      confidence: 0.85,
    }),
  },
  {
    id: 'analysis-2',
    timestamp: new Date('2024-09-15'),
    overallScore: 65,
    measurementCompletion: 100,
    recommendations: ['cleanser', 'treatment'],
    analysis: createAnalysis({
      skinType: 'combination',
      concerns: ['acne', 'redness', 'texture', 'pores'],
      severity: {
        acne: 8,
        redness: 6,
        texture: 5,
        pores: 4,
        spots: 5,
      },
      recommendations: [
        { category: 'cleanser', product: 'Clarifying Foam Cleanser', reason: 'Targets breakout-prone areas without over-drying.' },
        { category: 'treatment', product: 'Retinol Renewal Treatment', reason: 'Improves texture and reduces congestion.' },
      ],
      confidence: 0.82,
    }),
  },
  {
    id: 'analysis-3',
    timestamp: new Date('2024-07-10'),
    overallScore: 58,
    measurementCompletion: 100,
    recommendations: ['cleanser', 'toner', 'treatment'],
    analysis: createAnalysis({
      skinType: 'combination',
      concerns: ['acne', 'redness', 'texture', 'pores', 'spots'],
      severity: {
        acne: 9,
        redness: 8,
        texture: 7,
        pores: 6,
        spots: 7,
      },
      recommendations: [
        { category: 'cleanser', product: 'Anti-Acne Cleanser', reason: 'Deep cleanses to reduce acne-causing bacteria.' },
        { category: 'moisturizer', product: 'Barrier Repair Moisturizer', reason: 'Replenishes hydration after treatments.' },
        { category: 'treatment', product: 'Professional LED Therapy', reason: 'Targets inflammation and accelerates healing.' },
      ],
      confidence: 0.88,
      treatmentPlan: 'Combine weekly LED therapy with monthly deep cleansing facials.',
    }),
  },
  {
    id: 'analysis-4',
    timestamp: new Date('2024-05-20'),
    overallScore: 62,
    measurementCompletion: 100,
    recommendations: ['cleanser', 'toner'],
    analysis: createAnalysis({
      skinType: 'oily',
      concerns: ['large_pores', 'spots', 'acne'],
      severity: {
        large_pores: 7,
        acne: 6,
        spots: 5,
        redness: 3,
      },
      recommendations: [
        { category: 'cleanser', product: 'Oil-Control Cleanser', reason: 'Manages shine and prevents clogged pores.' },
        { category: 'treatment', product: 'Salicylic Acid Peel', reason: 'Exfoliates and refines enlarged pores.' },
      ],
      confidence: 0.8,
    }),
  },
  {
    id: 'analysis-5',
    timestamp: new Date('2024-03-05'),
    overallScore: 68,
    measurementCompletion: 100,
    recommendations: ['moisturizer', 'sunscreen'],
    analysis: createAnalysis({
      skinType: 'dry',
      concerns: ['dullness', 'texture', 'fine_lines'],
      severity: {
        dullness: 7,
        texture: 5,
        fine_lines: 6,
        redness: 2,
      },
      recommendations: [
        { category: 'moisturizer', product: 'Ceramide Rich Cream', reason: 'Restores the lipid barrier and boosts hydration.' },
        { category: 'sunscreen', product: 'Hydrating SPF 50+', reason: 'Prevents UV damage that worsens dryness and lines.' },
      ],
      confidence: 0.78,
    }),
  },
];

const formatConcerns = (concerns: SkinConcern[]): string =>
  concerns.map((concern) => concern.replace(/_/g, ' ')).join(', ');

const TestArchivePage: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [language, setLanguage] = useState<'th' | 'en'>('en');

  // Initialize archive with mock data
  const initializeArchive = () => {
    // Clear existing archive
    AnalysisArchiveEngine.clearArchive();

    // Add mock records
    const newRecords: AnalysisRecord[] = [];

    mockAnalysisData.forEach((analysis, index) => {
      const improvement = 72 - (index * 3.5); // Declining trend
      const record = AnalysisArchiveEngine.addToArchive(
        analysis.id,
        analysis.analysis,
        {
          clinicName: index % 2 === 0 ? 'Bangkok Skin Clinic' : 'Phuket Beauty Center',
          clinicianName: index % 3 === 0 ? 'Dr. Somchai' : index % 3 === 1 ? 'Dr. Niran' : 'Dr. Pornthip',
          tags: [
            index % 2 === 0 ? 'acne-treatment' : 'maintenance',
            index < 2 ? 'urgent' : 'routine',
          ],
          notes: `Patient shows ${index < 2 ? 'improvement' : 'progression'} in skin condition. ${index === 0 ? 'Good response to treatment.' : 'Needs adjustment.'}`,
          treatmentApplied: index < 3,
          improvementScore: improvement,
        }
      );

      if (record) {
        // Preserve the mock timeline so stats show a meaningful range.
        record.date = new Date(analysis.timestamp);
        record.timestamp = new Date(analysis.timestamp);
        newRecords.push(record);
      }
    });

    if (typeof window !== 'undefined') {
      try {
        const serialized = newRecords.map((record) => ({
          ...record,
          date: record.date.toISOString(),
          timestamp: record.timestamp ? record.timestamp.toISOString() : undefined,
          exportedAt: record.exportedAt?.map((date) => date.toISOString()) ?? [],
        }));
        window.localStorage.setItem('analysis_archive', JSON.stringify(serialized));
      } catch (error) {
        console.error('Failed to persist archive timeline', error);
      }
    }

    setIsInitialized(true);
  };

  useEffect(() => {
    const existingRecords = AnalysisArchiveEngine.getArchive({}, 1, 100);
    if (existingRecords.total === 0) {
      initializeArchive();
    } else {
      setIsInitialized(true);
    }
  }, []);

  const stats = isInitialized ? AnalysisArchiveEngine.getArchiveStats() : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {language === 'th' ? 'ทดสอบระบบจัดเก็บประวัติการวิเคราะห์' : 'Analysis Archive Test Page'}
              </h1>
              <p className="text-gray-600">
                {language === 'th'
                  ? 'ทดสอบระบบค้นหา ตัวกรอง และส่งออกประวัติการวิเคราะห์'
                  : 'Test search, filtering, and export of analysis history'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                {language === 'th' ? 'English' : 'Thai'}
              </button>
              <button
                onClick={initializeArchive}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {language === 'th' ? 'รีเซ็ต' : 'Reset'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow">
              <p className="text-gray-600 text-sm">
                {language === 'th' ? 'รวมทั้งหมด' : 'Total Records'}
              </p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAnalyses}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow">
              <p className="text-gray-600 text-sm">
                {language === 'th' ? 'ช่วงเวลา' : 'Time Range'}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {stats.oldestAnalysis && stats.latestAnalysis
                  ? `${Math.round((new Date(stats.latestAnalysis).getTime() - new Date(stats.oldestAnalysis).getTime()) / (1000 * 60 * 60 * 24))} ${language === 'th' ? 'วัน' : 'days'}`
                  : '-'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500 shadow">
              <p className="text-gray-600 text-sm">
                {language === 'th' ? 'แนวโน้ม' : 'Trend'}
              </p>
              <p className="text-lg font-semibold text-purple-600 capitalize">
                {language === 'th'
                  ? stats.improvementTrend === 'improving'
                    ? 'ปรับปรุง'
                    : stats.improvementTrend === 'declining'
                      ? 'ลดลง'
                      : 'เสถียร'
                  : stats.improvementTrend}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500 shadow">
              <p className="text-gray-600 text-sm">
                {language === 'th' ? 'การปฏิบัติตาม' : 'Compliance'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.complianceRate.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Mock Data Info */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">
            {language === 'th' ? 'ข้อมูลทดสอบ' : 'Test Data'}
          </h2>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              {language === 'th'
                ? '✓ 5 บันทึกการวิเคราะห์พร้อมวันที่แตกต่าง'
                : '✓ 5 analysis records with different dates'}
            </p>
            <p>
              {language === 'th'
                ? '✓ แท็กสำหรับการค้นหาและการกรอง'
                : '✓ Tags for search and filtering'}
            </p>
            <p>
              {language === 'th'
                ? '✓ ข้อมูลเกี่ยวกับคลินิกและเพศแพทย์'
                : '✓ Clinic and clinician information'}
            </p>
            <p>
              {language === 'th'
                ? '✓ คะแนนการปรับปรุงที่เปลี่ยนแปลง'
                : '✓ Varying improvement scores'}
            </p>
            <p>
              {language === 'th'
                ? '✓ สถานะการรักษา'
                : '✓ Treatment status'}
            </p>
          </div>
        </div>

        {/* Archive Management Component */}
        <div className="bg-white rounded-lg shadow">
          {isInitialized && <ArchiveManagement language={language} />}
        </div>

        {/* Sample Records List */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'th' ? 'บันทึกตัวอย่าง' : 'Sample Records'}
          </h2>
          <div className="space-y-3">
            {mockAnalysisData.map((analysis) => (
              <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{analysis.id}</p>
                    <p className="text-sm text-gray-600">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(analysis.timestamp).toLocaleDateString(
                        language === 'th' ? 'th-TH' : 'en-US'
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'th' ? 'ปัญหา' : 'Concerns'}:{' '}
                      {formatConcerns(analysis.analysis.concerns)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {language === 'th' ? 'คะแนน' : 'Score'}: {analysis.overallScore}/100
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {analysis.analysis.skinType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">
            {language === 'th' ? 'วิธีการใช้งาน' : 'How to Use'}
          </h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>
              {language === 'th'
                ? '1. ใช้ช่องค้นหาเพื่อค้นหาบันทึกตาม ID หรือคลินิก'
                : '1. Use the search box to find records by ID or clinic'}
            </li>
            <li>
              {language === 'th'
                ? '2. คลิกปุ่ม "ตัวกรอง" เพื่อใช้ตัวกรองขั้นสูง'
                : '2. Click "Filters" button to apply advanced filters'}
            </li>
            <li>
              {language === 'th'
                ? '3. เลือกบันทึกหลายรายการเพื่อดำเนินการเป็นกลุ่ม'
                : '3. Select multiple records for bulk actions'}
            </li>
            <li>
              {language === 'th'
                ? '4. ใช้ปุ่ม "ส่งออก" เพื่อส่งออกประวัติในรูปแบบต่างๆ'
                : '4. Use "Export" button to export history in different formats'}
            </li>
            <li>
              {language === 'th'
                ? '5. เพิ่มแท็กและจัดการบันทึก'
                : '5. Add tags and manage records'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestArchivePage;
