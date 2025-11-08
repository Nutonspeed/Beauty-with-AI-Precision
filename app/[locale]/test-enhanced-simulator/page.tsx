'use client';

import React, { useState } from 'react';
import EnhancedTreatmentSimulatorComponent from '@/components/enhanced-treatment-simulator';
import {
  EnhancedTreatmentSimulator,
  CombinedTreatmentPlan,
} from '@/lib/enhanced-treatment-simulator';
import { Calendar, Zap, Info, Lightbulb } from 'lucide-react';

const TestEnhancedTreatmentSimulatorPage: React.FC = () => {
  const [language, setLanguage] = useState<'th' | 'en'>('en');
  const [selectedPlan, setSelectedPlan] = useState<CombinedTreatmentPlan | null>(null);

  const translations = {
    th: {
      title: 'ทดสอบจำลองการรักษาแบบสมจริง',
      subtitle: 'ศูนย์ควบคุมการจำลองการรักษาแบบสมจริงด้วยเอฟเฟกต์ขั้นสูง',
      info: 'ข้อมูลการทดสอบ',
      features: 'ฟีเจอร์',
      selectedPlan: 'แผนการรักษาที่เลือก',
      planDetails: 'รายละเอียดแผน',
      treatments: 'การรักษา',
      treatmentLibrary: 'ห้องสมุดการรักษา',
      availableTreatments: 'การรักษาที่มี',
      noSelection: 'ไม่มีการเลือก',
      selectTreatmentFirst: 'เลือกการรักษาจากแผงด้านซ้ายเพื่อดูผลลัพธ์',
      weeks: 'สัปดาห์',
      thb: '฿',
      numberOfTreatments: 'จำนวนการรักษา',
      estimatedImprovement: 'การปรับปรุงที่คาดหวัง',
      synergies: 'การทำงานร่วมกัน',
      risks: 'ความเสี่ยง',
      instructions: 'คำแนะนำ',
      tips: 'เคล็ดลับการใช้งาน',
    },
    en: {
      title: 'Enhanced Treatment Simulator Test',
      subtitle: 'Control center for realistic treatment simulation with advanced effects',
      info: 'Test Information',
      features: 'Features',
      selectedPlan: 'Selected Treatment Plan',
      planDetails: 'Plan Details',
      treatments: 'Treatments',
      treatmentLibrary: 'Treatment Library',
      availableTreatments: 'Available Treatments',
      noSelection: 'No Selection',
      selectTreatmentFirst: 'Select treatments from the left panel to see results',
      weeks: 'weeks',
      thb: '฿',
      numberOfTreatments: 'Number of Treatments',
      estimatedImprovement: 'Estimated Improvement',
      synergies: 'Synergies',
      risks: 'Risks',
      instructions: 'Instructions',
      tips: 'Usage Tips',
    },
  };

  const t = translations[language];

  const treatmentLibrary = EnhancedTreatmentSimulator.getTreatmentLibrary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Zap className="w-8 h-8 text-blue-600" />
                {t.title}
              </h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>
            <div>
              <button
                onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
              >
                {language === 'th' ? 'English' : 'ไทย'}
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">
                  {t.numberOfTreatments}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {treatmentLibrary.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">
                  {t.synergies}
                </p>
                <p className="text-2xl font-bold text-green-600">5+</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500 shadow">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">
                  {t.features}
                </p>
                <p className="text-2xl font-bold text-purple-600">Advanced</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Simulator */}
        <div className="mb-8">
          <EnhancedTreatmentSimulatorComponent
            language={language}
            onTreatmentPlanSelect={setSelectedPlan}
          />
        </div>

        {/* Selected Plan Details */}
        {selectedPlan && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-6 h-6" />
              {t.selectedPlan}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(selectedPlan.duration / 7)} {t.weeks}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-green-600">
                  {t.thb}
                  {Math.round(selectedPlan.totalCost).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Treatments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {selectedPlan.treatments.length}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Sessions</p>
                <p className="text-2xl font-bold text-orange-600">
                  {selectedPlan.treatments.reduce((sum, t) => sum + t.numberOfSessions, 0)}
                </p>
              </div>
            </div>

            {/* Treatments in Plan */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">{t.treatments}</h3>
              <div className="space-y-2">
                {selectedPlan.treatments.map((treatment) => (
                  <div
                    key={treatment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{treatment.name}</p>
                      <p className="text-sm text-gray-600">
                        {treatment.numberOfSessions} {language === 'th' ? 'เซสชั่น' : 'sessions'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-semibold">
                      {treatment.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Improvements */}
            {Object.keys(selectedPlan.expectedImprovement).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t.estimatedImprovement}
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedPlan.expectedImprovement).map(([concern, improvement]) => (
                    <div key={concern}>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700 capitalize">
                          {concern}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {Math.round(improvement)}%
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                          style={{ width: `${improvement}%` } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Synergies */}
            {selectedPlan.synergies.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">{t.synergies}</h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedPlan.synergies.map((synergy) => (
                      <li key={synergy} className="flex items-start gap-2 text-sm text-green-900">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span>{synergy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Risks */}
            {selectedPlan.risks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t.risks}</h3>
                <div className="bg-red-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedPlan.risks.map((risk) => (
                      <li key={risk} className="flex items-start gap-2 text-sm text-red-900">
                        <span className="text-red-600 font-bold mt-0.5">⚠</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Treatment Library Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t.treatmentLibrary}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {treatmentLibrary.map((treatment) => (
              <div key={treatment.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{treatment.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{treatment.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-900">{treatment.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sessions:</span>
                    <span className="font-semibold text-gray-900">
                      {treatment.numberOfSessions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Downtime:</span>
                    <span className="font-semibold text-gray-900">
                      {treatment.downtime} {language === 'th' ? 'วัน' : 'days'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost:</span>
                    <span className="font-semibold text-gray-900">
                      {t.thb}
                      {Math.round(treatment.costRange.min / 1000)}K -
                      {Math.round(treatment.costRange.max / 1000)}K
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions and Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-blue-900 mb-4">{t.instructions}</h3>
            <ol className="space-y-3 text-sm text-blue-900">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">1.</span>
                <span>
                  {language === 'th'
                    ? 'เลือกการรักษาจากแพนหมวดหมู่ด้านซ้าย'
                    : 'Select treatments from the category panel on the left'}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">2.</span>
                <span>
                  {language === 'th'
                    ? 'คลิกปุ่ม "จำลอง" เพื่อสร้างแผน'
                    : 'Click "Simulate" button to create plan'}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">3.</span>
                <span>
                  {language === 'th'
                    ? 'ดูการจำลองเอนิเมชันในกลางหน้า'
                    : 'View the animation simulation in the middle'}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">4.</span>
                <span>
                  {language === 'th'
                    ? 'ตรวจสอบแผนและสถิติที่ด้านขวา'
                    : 'Check plan and statistics on the right'}
                </span>
              </li>
            </ol>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-xl font-bold text-green-900 mb-4">{t.tips}</h3>
            <ul className="space-y-3 text-sm text-green-900">
              <li className="flex gap-3">
                <span className="font-bold text-green-600">💡</span>
                <span>
                  {language === 'th'
                    ? 'รวมการรักษาหลายรายการเพื่อเห็นการทำงานร่วมกัน'
                    : 'Combine multiple treatments to see synergies'}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600">💡</span>
                <span>
                  {language === 'th'
                    ? 'ตรวจสอบไทม์ไลน์เพื่อวางแผนการรักษาอย่างเหมาะสม'
                    : 'Check timeline for proper treatment planning'}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600">💡</span>
                <span>
                  {language === 'th'
                    ? 'ทำให้สัดส่วนต้นทุนและเวลาสมดุล'
                    : 'Balance cost and time factors'}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-green-600">💡</span>
                <span>
                  {language === 'th'
                    ? 'พิจารณาเวลาฟื้นตัวสำหรับการวางแผนปฏิทิน'
                    : 'Consider recovery time for scheduling'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEnhancedTreatmentSimulatorPage;
