// @ts-nocheck
/**
 * Progress Tracking Demo Page
 * Demonstrates the progress tracking system with sample data
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProgressDashboard from '@/components/progress-dashboard';
import { EnhancedMetricsResult } from '@/lib/ai/enhanced-skin-metrics';
import { useProgressTracking } from '@/hooks/useProgressTracking';

/**
 * Progress Tracking Demo Page
 */
export default function ProgressTrackingDemoPage() {
  const [demoMode, setDemoMode] = useState<'empty' | 'loading' | 'populated'>('empty');
  const { addDataPoint, isLoading } = useProgressTracking();

  // Generate sample metrics for demo
  const generateSampleMetrics = (baseScore: number, variance: number): EnhancedMetricsResult => {
    const randomize = (base: number, v: number) => {
      const value = base + (Math.random() - 0.5) * v;
      return Math.max(0, Math.min(100, value));
    };

    return {
      spots: {
        score: randomize(baseScore, variance),
        confidence: 0.85,
        count: Math.floor(Math.random() * 30) + 10,
        severity: baseScore > 70 ? 'mild' : baseScore > 50 ? 'moderate' : 'severe',
        areas: ['forehead', 'cheeks'],
      },
      pores: {
        score: randomize(baseScore, variance),
        confidence: 0.82,
        count: Math.floor(Math.random() * 200) + 100,
        severity: baseScore > 70 ? 'mild' : baseScore > 50 ? 'moderate' : 'severe',
        areas: ['nose', 'cheeks'],
      },
      wrinkles: {
        score: randomize(baseScore, variance),
        confidence: 0.88,
        count: Math.floor(Math.random() * 15) + 5,
        severity: baseScore > 70 ? 'mild' : baseScore > 50 ? 'moderate' : 'severe',
        depth: 0.3,
        areas: ['forehead', 'eyes'],
        types: ['fine', 'expression'],
      },
      texture: {
        score: randomize(baseScore, variance),
        confidence: 0.80,
        smoothness: randomize(baseScore, variance) / 100,
        roughness: randomize(100 - baseScore, variance) / 100,
      },
      redness: {
        score: randomize(baseScore, variance),
        confidence: 0.83,
        percentage: randomize(100 - baseScore, variance) / 100,
        areas: ['cheeks', 'nose'],
      },
      hydration: {
        score: randomize(baseScore, variance),
        confidence: 0.79,
        level: randomize(baseScore, variance) / 100,
      },
      skinTone: {
        score: randomize(baseScore, variance),
        confidence: 0.86,
        uniformity: randomize(baseScore, variance) / 100,
        fitzpatrickType: 3,
      },
      elasticity: {
        score: randomize(baseScore, variance),
        confidence: 0.81,
        firmness: randomize(baseScore, variance) / 100,
      },
      overallHealth: {
        score: randomize(baseScore, variance),
        grade: baseScore > 80 ? 'A' : baseScore > 70 ? 'B' : baseScore > 60 ? 'C' : 'D',
        estimatedAge: Math.floor(30 + (100 - baseScore) / 5),
      },
    };
  };

  // Populate demo data
  const populateDemoData = async () => {
    setDemoMode('loading');

    try {
      // Generate 5 data points with progressive improvement
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-15'),
        new Date('2024-02-01'),
        new Date('2024-02-15'),
        new Date('2024-03-01'),
      ];

      for (let i = 0; i < dates.length; i++) {
        const baseScore = 60 + (i * 5); // Progressive improvement
        const metrics = generateSampleMetrics(baseScore, 10);
        
        const notes = [
          'การตรวจครั้งแรก - เริ่มต้นการรักษา',
          'ครั้งที่ 2 - เห็นการปรับปรุงเล็กน้อย',
          'ครั้งที่ 3 - ผลลัพธ์ดีขึ้นชัดเจน',
          'ครั้งที่ 4 - ผิวดีขึ้นมาก มีความชุ่มชื้น',
          'ครั้งที่ 5 - ผลลัพธ์ยอดเยี่ยม บรรลุเป้าหมาย',
        ][i];

        const treatments = i > 0 ? [
          i === 1 ? 'Chemical Peel' : '',
          i === 2 ? 'HydraFacial' : '',
          i === 3 ? 'Laser Treatment' : '',
          i === 4 ? 'IPL Therapy' : '',
        ].filter(Boolean) : [];

        await addDataPoint(
          metrics,
          `demo-photo-${i}.jpg`,
          notes,
          treatments
        );

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setDemoMode('populated');
    } catch (error) {
      console.error('Error populating demo data:', error);
      setDemoMode('empty');
    }
  };

  // Reset demo data
  const resetDemoData = () => {
    setDemoMode('empty');
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          📊 Progress Tracking Demo
        </h1>
        <p className="text-gray-600 text-lg">
          ระบบติดตามความก้าวหน้าการรักษาผิว พร้อมกราฟและรายงาน PDF
        </p>
      </div>

      {/* Feature Overview */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ✨ คุณสมบัติหลัก
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Timeline Charts</h3>
              <p className="text-sm text-gray-600">
                กราฟแสดงความก้าวหน้าแบบเรียลไทม์ พร้อมเปรียบเทียบ 8 ตัวชี้วัด
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-pink-100 p-2 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Statistical Analysis</h3>
              <p className="text-sm text-gray-600">
                วิเคราะห์สถิติอัตโนมัติ ค่าเฉลี่ย ความสม่ำเสมอ และคาดการณ์
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Milestones Tracking</h3>
              <p className="text-sm text-gray-600">
                ติดตามเป้าหมายและความก้าวหน้าของแต่ละตัวชี้วัด
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <span className="text-2xl">📑</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">PDF Reports</h3>
              <p className="text-sm text-gray-600">
                สร้างรายงาน PDF แบบมืออาชีพพร้อมกราฟและสถิติ
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Demo Controls */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🎮 Demo Controls
        </h2>
        <div className="flex gap-4">
          <Button
            onClick={populateDemoData}
            disabled={demoMode === 'loading' || demoMode === 'populated'}
            size="lg"
          >
            {demoMode === 'loading' ? '⏳ กำลังโหลด...' : '🚀 โหลดข้อมูลตัวอย่าง'}
          </Button>
          
          {demoMode === 'populated' && (
            <Button
              onClick={resetDemoData}
              variant="outline"
              size="lg"
            >
              🔄 รีเซ็ต
            </Button>
          )}

          <div className="ml-auto">
            {demoMode === 'empty' && (
              <Badge variant="outline" className="text-gray-600">
                ⚪ ยังไม่มีข้อมูล
              </Badge>
            )}
            {demoMode === 'loading' && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                🔵 กำลังโหลด...
              </Badge>
            )}
            {demoMode === 'populated' && (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                ✅ พร้อมใช้งาน
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Progress Dashboard */}
      {demoMode !== 'empty' && (
        <ProgressDashboard />
      )}

      {/* Instructions */}
      {demoMode === 'empty' && (
        <Card className="p-8 text-center bg-gray-50">
          <div className="mb-6">
            <span className="text-6xl">📊</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            เริ่มต้นใช้งาน
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            คลิกปุ่ม "โหลดข้อมูลตัวอย่าง" เพื่อดูตัวอย่างการทำงานของระบบติดตามความก้าวหน้า
            ระบบจะสร้างข้อมูลตัวอย่าง 5 จุดที่แสดงการปรับปรุงผิวตลอดระยะเวลา 2 เดือน
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={populateDemoData} size="lg">
              🚀 เริ่มต้นทันที
            </Button>
          </div>
        </Card>
      )}

      {/* Technical Details */}
      <Card className="p-6 mt-8 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔧 Technical Implementation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Core Components</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code className="bg-gray-200 px-1 rounded">ProgressTracker</code> - Data management engine</li>
              <li>• <code className="bg-gray-200 px-1 rounded">PDFReportGenerator</code> - Report generation</li>
              <li>• <code className="bg-gray-200 px-1 rounded">useProgressTracking</code> - React integration</li>
              <li>• <code className="bg-gray-200 px-1 rounded">ProgressDashboard</code> - UI components</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Key Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Timeline data with 9 metrics tracking</li>
              <li>• Statistical analysis (7 key statistics)</li>
              <li>• Before/after comparison engine</li>
              <li>• Milestone generation & tracking</li>
              <li>• Improvement rate projections</li>
              <li>• PDF export with multi-page support</li>
              <li>• JSON export for data portability</li>
              <li>• Supabase integration for persistence</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Chart Libraries</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code className="bg-gray-200 px-1 rounded">Recharts</code> - LineChart for timeline</li>
              <li>• <code className="bg-gray-200 px-1 rounded">Recharts</code> - BarChart for comparisons</li>
              <li>• <code className="bg-gray-200 px-1 rounded">Recharts</code> - RadarChart for current status</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Data Storage</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supabase for persistent storage</li>
              <li>• Analysis history tracking</li>
              <li>• Treatment history integration</li>
              <li>• User profile management</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
