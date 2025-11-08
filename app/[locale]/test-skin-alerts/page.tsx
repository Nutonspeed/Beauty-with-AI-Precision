'use client';

import React, { useState } from 'react';
import { SkinConditionAlertSystem, SkinAlert, VISIAAnalysisResult } from '@/lib/skin-condition-alert-system';
import { SkinAlertComponent } from '@/components/skin-alert';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

const translations = {
  th: {
    title: 'ทดสอบระบบการแจ้งเตือนสภาพผิว',
    testScenarios: 'สถานการณ์ทดสอบ',
    generateAlerts: 'สร้างการแจ้งเตือน',
    degradation: 'การลดลง',
    improvement: 'การปรับปรุง',
    anomaly: 'ความผิดปกติ',
    milestone: 'เหตุการณ์สำคัญ',
    clearAlerts: 'ล้างการแจ้งเตือน',
    alertStatistics: 'สถิติการแจ้งเตือน',
    totalAlerts: 'การแจ้งเตือนทั้งหมด',
    critical: 'วิกฤต',
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ',
    unread: 'ยังไม่อ่าน',
    read: 'อ่านแล้ว',
    notifications: 'ต้องแจ้งเตือน',
    customerAudience: 'ลูกค้า',
    staffAudience: 'พนักงาน',
    bothAudience: 'ทั้งคู่',
    sampleAnalysisData: 'ข้อมูลการวิเคราะห์ตัวอย่าง',
    instructions: 'คำแนะนำ',
    tip1: 'คลิกปุ่มสถานการณ์ทดสอบเพื่อสร้างการแจ้งเตือนตัวอย่าง',
    tip2: 'การแจ้งเตือนจะถูกวิเคราะห์ตามการเปลี่ยนแปลงของผิว',
    tip3: 'ระบบจะตรวจจับแนวโน้ม ความผิดปกติ และเกินเกณฑ์',
    tip4: 'การแจ้งเตือนแต่ละรายการมีการกระทำที่แนะนำสำหรับการปรับปรุง',
  },
  en: {
    title: 'Skin Condition Alert System Test',
    testScenarios: 'Test Scenarios',
    generateAlerts: 'Generate Alerts',
    degradation: 'Degradation Scenario',
    improvement: 'Improvement Scenario',
    anomaly: 'Anomaly Scenario',
    milestone: 'Milestone Achievement',
    clearAlerts: 'Clear Alerts',
    alertStatistics: 'Alert Statistics',
    totalAlerts: 'Total Alerts',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    unread: 'Unread',
    read: 'Read',
    notifications: 'Should Notify',
    customerAudience: 'Customer',
    staffAudience: 'Staff',
    bothAudience: 'Both',
    sampleAnalysisData: 'Sample Analysis Data',
    instructions: 'Instructions',
    tip1: 'Click test scenario buttons to generate sample alerts',
    tip2: 'Alerts are generated based on skin condition changes',
    tip3: 'System detects trends, anomalies, and threshold violations',
    tip4: 'Each alert includes recommended actions for improvement',
  },
};

export default function TestSkinAlertPage() {
  const [language, setLanguage] = useState<'th' | 'en'>('en');
  const t = translations[language];
  const [alerts, setAlerts] = useState<SkinAlert[]>([]);

  // Mock analysis data
  const mockCurrentAnalysis: VISIAAnalysisResult = {
    id: 'analysis_current',
    userId: 'user_123',
    timestamp: new Date(),
    overallScore: 42,
    scores: {
      acne: 35,
      wrinkles: 55,
      redness: 45,
      texture: 48,
      pores: 52,
      pigmentation: 38,
    },
    details: {
      acne: {
        score: 35,
        count: 2,
        severity: 'low',
        distribution: 'scattered',
      },
      wrinkles: {
        score: 55,
        count: 15,
        severity: 'medium',
        distribution: 'forehead',
      },
      redness: {
        score: 45,
        count: 3,
        severity: 'low',
        distribution: 'cheeks',
      },
      texture: {
        score: 48,
        count: 5,
        severity: 'low',
        distribution: 'overall',
      },
      pores: {
        score: 52,
        count: 80,
        severity: 'medium',
        distribution: 'nose',
      },
      pigmentation: {
        score: 38,
        count: 2,
        severity: 'low',
        distribution: 'spots',
      },
    },
  };

  // Previous analysis - healthy baseline
  const mockPreviousHealthy: VISIAAnalysisResult = {
    ...mockCurrentAnalysis,
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    scores: {
      acne: 25,
      wrinkles: 50,
      redness: 30,
      texture: 40,
      pores: 45,
      pigmentation: 30,
    },
  };

  // Previous analysis - degraded
  const mockPreviousDegraded: VISIAAnalysisResult = {
    ...mockCurrentAnalysis,
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    scores: {
      acne: 65,
      wrinkles: 70,
      redness: 75,
      texture: 70,
      pores: 80,
      pigmentation: 65,
    },
  };

  // Mock analysis history
  const mockHistory = [
    {
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      scores: { acne: 50, wrinkles: 65, redness: 55, texture: 58, pores: 62, pigmentation: 50 },
    },
    {
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      scores: { acne: 48, wrinkles: 63, redness: 52, texture: 56, pores: 60, pigmentation: 48 },
    },
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      scores: { acne: 42, wrinkles: 58, redness: 48, texture: 50, pores: 55, pigmentation: 42 },
    },
    {
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      scores: { acne: 38, wrinkles: 56, redness: 46, texture: 49, pores: 53, pigmentation: 39 },
    },
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      scores: { acne: 36, wrinkles: 55, redness: 45, texture: 48, pores: 52, pigmentation: 38 },
    },
  ];

  const handleDegradationScenario = () => {
    const newAlerts = SkinConditionAlertSystem.analyzeChanges(
      mockCurrentAnalysis,
      mockPreviousDegraded,
      mockHistory
    );
    setAlerts(newAlerts.map((a) => ({ ...a, isRead: false })));
  };

  const handleImprovementScenario = () => {
    const newAlerts = SkinConditionAlertSystem.analyzeChanges(
      mockCurrentAnalysis,
      mockPreviousHealthy,
      mockHistory
    );
    setAlerts(newAlerts.map((a) => ({ ...a, isRead: false })));
  };

  const handleAnomalyScenario = () => {
    // Create anomalous current analysis
    const anomalousAnalysis: VISIAAnalysisResult = {
      ...mockCurrentAnalysis,
      scores: {
        acne: 95, // Extremely high (anomaly)
        wrinkles: 55,
        redness: 45,
        texture: 48,
        pores: 52,
        pigmentation: 38,
      },
    };

    const newAlerts = SkinConditionAlertSystem.analyzeChanges(
      anomalousAnalysis,
      mockPreviousHealthy,
      mockHistory
    );
    setAlerts(newAlerts.map((a) => ({ ...a, isRead: false })));
  };

  const handleMilestoneScenario = () => {
    const goalScores = {
      acne: 30,
      wrinkles: 40,
      redness: 35,
      texture: 40,
      pores: 40,
      pigmentation: 30,
    };

    const milestoneAnalysis: VISIAAnalysisResult = {
      ...mockCurrentAnalysis,
      scores: {
        acne: 31,
        wrinkles: 41,
        redness: 36,
        texture: 41,
        pores: 41,
        pigmentation: 31,
      },
    };

    const newAlerts = SkinConditionAlertSystem.generateMilestoneAlerts(milestoneAnalysis, goalScores);
    setAlerts(newAlerts.map((a) => ({ ...a, isRead: false })));
  };

  const handleCombinedScenario = () => {
    const degradationAlerts = SkinConditionAlertSystem.analyzeChanges(
      mockCurrentAnalysis,
      mockPreviousDegraded,
      mockHistory
    );
    const goalScores = {
      acne: 30,
      wrinkles: 40,
      redness: 35,
      texture: 40,
      pores: 40,
      pigmentation: 30,
    };
    const milestoneAlerts = SkinConditionAlertSystem.generateMilestoneAlerts(
      mockCurrentAnalysis,
      goalScores
    );
    const combinedAlerts = [...degradationAlerts, ...milestoneAlerts];
    setAlerts(combinedAlerts.map((a) => ({ ...a, isRead: false })));
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
  };

  const handleDismiss = (alertId: string) => {
    setAlerts(alerts.filter((a) => a.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Calculate statistics
  const stats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    medium: alerts.filter((a) => a.severity === 'medium').length,
    low: alerts.filter((a) => a.severity === 'low').length,
    unread: alerts.filter((a) => !a.isRead).length,
    read: alerts.filter((a) => a.isRead).length,
    shouldNotify: alerts.filter((a) => a.shouldNotify).length,
    customer: alerts.filter((a) => a.targetAudience === 'customer').length,
    staff: alerts.filter((a) => a.targetAudience === 'staff').length,
    both: alerts.filter((a) => a.targetAudience === 'both').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
          <button
            onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {language === 'en' ? 'ไทย' : 'English'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Test Scenarios */}
            <div className="bg-white rounded-lg shadow p-6 space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ChevronDown className="w-5 h-5" />
                {t.testScenarios}
              </h2>
              <button
                onClick={handleDegradationScenario}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                {t.degradation}
              </button>
              <button
                onClick={handleImprovementScenario}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                {t.improvement}
              </button>
              <button
                onClick={handleAnomalyScenario}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                {t.anomaly}
              </button>
              <button
                onClick={handleMilestoneScenario}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                {t.milestone}
              </button>
              <button
                onClick={handleCombinedScenario}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Combined Test
              </button>
              <button
                onClick={clearAllAlerts}
                className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium transition text-sm"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                {t.clearAlerts}
              </button>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow p-6 space-y-3">
              <h2 className="text-lg font-bold text-gray-900">{t.alertStatistics}</h2>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-600">{t.totalAlerts}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-red-600">{t.critical}</p>
                  <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <p className="text-orange-600">{t.high}</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.high}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <p className="text-yellow-600">{t.medium}</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.medium}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-blue-600">{t.low}</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.low}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-purple-600">{t.unread}</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.unread}</p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.notifications}:</span>
                  <span className="font-bold text-gray-900">{stats.shouldNotify}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.customerAudience}:</span>
                  <span className="font-bold text-gray-900">{stats.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.staffAudience}:</span>
                  <span className="font-bold text-gray-900">{stats.staff}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.bothAudience}:</span>
                  <span className="font-bold text-gray-900">{stats.both}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 space-y-2">
              <h3 className="font-bold text-blue-900">{t.instructions}</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• {t.tip1}</li>
                <li>• {t.tip2}</li>
                <li>• {t.tip3}</li>
                <li>• {t.tip4}</li>
              </ul>
            </div>
          </div>

          {/* Right: Alerts Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <SkinAlertComponent
                alerts={alerts}
                language={language}
                onMarkAsRead={handleMarkAsRead}
                onDismiss={handleDismiss}
                maxVisibleAlerts={5}
              />
            </div>
          </div>
        </div>

        {/* Sample Analysis Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t.sampleAnalysisData}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Current Analysis</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {Object.entries(mockCurrentAnalysis.scores).map(([key, value]: [string, number]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key}:</span>
                    <span className="font-mono font-semibold">{value.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Previous (Healthy)</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {Object.entries(mockPreviousHealthy.scores).map(([key, value]: [string, number]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key}:</span>
                    <span className="font-mono font-semibold">{value.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Previous (Degraded)</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {Object.entries(mockPreviousDegraded.scores).map(([key, value]: [string, number]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key}:</span>
                    <span className="font-mono font-semibold">{value.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
