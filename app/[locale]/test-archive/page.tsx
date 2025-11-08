'use client';

import React, { useState, useEffect } from 'react';
import ArchiveManagement from '@/components/archive-management';
import { AnalysisArchiveEngine } from '@/lib/analysis-archive-engine';
import { VISIAAnalysisResult } from '@/types';
import { Calendar, Plus, RefreshCw } from 'lucide-react';

// Mock VISIA analysis data
const mockAnalysisData: VISIAAnalysisResult[] = [
  {
    id: 'analysis-1',
    timestamp: new Date('2024-11-01'),
    skinType: 'combination',
    concerns: [
      { type: 'acne', severity: 7, location: ['cheeks', 'forehead'], confidence: 0.85 },
      { type: 'redness', severity: 5, location: ['cheeks'], confidence: 0.75 },
    ],
    overallScore: 72,
    measurementCompletion: 100,
    recommendations: ['cleanser', 'serum', 'sunscreen'],
  },
  {
    id: 'analysis-2',
    timestamp: new Date('2024-09-15'),
    skinType: 'combination',
    concerns: [
      { type: 'acne', severity: 8, location: ['cheeks', 'forehead', 'chin'], confidence: 0.90 },
      { type: 'redness', severity: 6, location: ['cheeks', 'nose'], confidence: 0.80 },
      { type: 'texture', severity: 5, location: ['forehead'], confidence: 0.70 },
    ],
    overallScore: 65,
    measurementCompletion: 100,
    recommendations: ['cleanser', 'treatment'],
  },
  {
    id: 'analysis-3',
    timestamp: new Date('2024-07-10'),
    skinType: 'combination',
    concerns: [
      { type: 'acne', severity: 9, location: ['cheeks', 'forehead', 'chin'], confidence: 0.95 },
      { type: 'redness', severity: 8, location: ['cheeks', 'nose', 'chin'], confidence: 0.85 },
      { type: 'texture', severity: 7, location: ['forehead', 'cheeks'], confidence: 0.80 },
      { type: 'pores', severity: 6, location: ['nose', 'cheeks'], confidence: 0.75 },
    ],
    overallScore: 58,
    measurementCompletion: 100,
    recommendations: ['cleanser', 'toner', 'treatment'],
  },
  {
    id: 'analysis-4',
    timestamp: new Date('2024-05-20'),
    skinType: 'oily',
    concerns: [
      { type: 'oiliness', severity: 8, location: ['T-zone'], confidence: 0.90 },
      { type: 'pores', severity: 7, location: ['nose'], confidence: 0.85 },
      { type: 'acne', severity: 6, location: ['forehead'], confidence: 0.75 },
    ],
    overallScore: 62,
    measurementCompletion: 100,
    recommendations: ['cleanser', 'toner'],
  },
  {
    id: 'analysis-5',
    timestamp: new Date('2024-03-05'),
    skinType: 'dry',
    concerns: [
      { type: 'dryness', severity: 7, location: ['cheeks', 'forehead'], confidence: 0.85 },
      { type: 'sensitivity', severity: 6, location: ['cheeks'], confidence: 0.75 },
      { type: 'texture', severity: 5, location: ['forehead'], confidence: 0.70 },
    ],
    overallScore: 68,
    measurementCompletion: 100,
    recommendations: ['moisturizer', 'sunscreen'],
  },
];

interface ArchiveRecord {
  id: string;
  date: Date;
  analysis: VISIAAnalysisResult;
  clinicName?: string;
  clinicianName?: string;
  tags: string[];
  notes: string;
  treatmentApplied: boolean;
  improvementScore?: number;
}

const TestArchivePage: React.FC = () => {
  const [records, setRecords] = useState<ArchiveRecord[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [language, setLanguage] = useState<'th' | 'en'>('en');

  // Initialize archive with mock data
  const initializeArchive = () => {
    // Clear existing archive
    AnalysisArchiveEngine.clearArchive();

    // Add mock records
    const newRecords: ArchiveRecord[] = [];

    mockAnalysisData.forEach((analysis, index) => {
      const improvement = 72 - (index * 3.5); // Declining trend
      const record = AnalysisArchiveEngine.addToArchive(
        analysis.id,
        analysis,
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

      newRecords.push(record as unknown as ArchiveRecord);
    });

    setRecords(newRecords);
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
            {mockAnalysisData.map((analysis, index) => (
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
                      {analysis.concerns.map((c) => c.type).join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {language === 'th' ? 'คะแนน' : 'Score'}: {analysis.overallScore}/100
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {analysis.skinType}
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
