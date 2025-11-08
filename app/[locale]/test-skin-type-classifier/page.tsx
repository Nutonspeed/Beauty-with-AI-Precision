'use client';

import React, { useState } from 'react';
import {
  SkinTypeClassifier,
  type SkinCharacteristics,
  type ClassificationResult,
} from '@/lib/skin-type-classifier';
import SkinTypeClassifierComponent from '@/components/skin-type-classifier';
import { RefreshCw } from 'lucide-react';

type Locale = 'en' | 'th';

interface TestScenario {
  name: string;
  description: string;
  characteristics: SkinCharacteristics;
}

type TrendType = 'stable' | 'improving' | 'worsening';

const testScenarios: Record<string, TestScenario> = {
  normalSkin: {
    name: 'Normal Skin',
    description: 'Balanced sebum and hydration with minimal issues',
    characteristics: {
      sebumLevel: 45,
      hydrationLevel: 65,
      sensitivityScore: 25,
      poreSize: 45,
      textureRoughness: 25,
      acneScore: 15,
      rednessLevel: 15,
      shininess: 35,
    },
  },
  oilySkin: {
    name: 'Oily Skin',
    description: 'Excess sebum production with enlarged pores',
    characteristics: {
      sebumLevel: 85,
      hydrationLevel: 55,
      sensitivityScore: 35,
      poreSize: 80,
      textureRoughness: 45,
      acneScore: 65,
      rednessLevel: 40,
      shininess: 85,
    },
  },
  drySkin: {
    name: 'Dry Skin',
    description: 'Low sebum and dehydrated with rough texture',
    characteristics: {
      sebumLevel: 20,
      hydrationLevel: 30,
      sensitivityScore: 50,
      poreSize: 25,
      textureRoughness: 70,
      acneScore: 15,
      rednessLevel: 35,
      shininess: 10,
    },
  },
  combinationSkin: {
    name: 'Combination Skin',
    description: 'Oily T-zone with dry cheeks',
    characteristics: {
      sebumLevel: 70,
      hydrationLevel: 45,
      sensitivityScore: 30,
      poreSize: 70,
      textureRoughness: 40,
      acneScore: 40,
      rednessLevel: 25,
      shininess: 70,
    },
  },
  sensitiveSkin: {
    name: 'Sensitive Skin',
    description: 'Reactive with redness and irritation',
    characteristics: {
      sebumLevel: 40,
      hydrationLevel: 50,
      sensitivityScore: 80,
      poreSize: 40,
      textureRoughness: 50,
      acneScore: 55,
      rednessLevel: 75,
      shininess: 35,
    },
  },
};

const translations = {
  en: {
    title: 'Skin Type Classification Test Page',
    testScenarios: 'Test Scenarios',
    classifyBtn: 'Classify Skin',
    resetBtn: 'Reset Values',
    history: 'Classification History',
    comparison: 'History Analysis',
    characteristics: 'Test Characteristics',
    noHistory: 'No classifications yet',
    typeChange: 'Skin Type Changed',
    typeStable: 'Skin Type Stable',
    confidence: 'Confidence',
    timestamp: 'Time',
    scenario: 'Scenario',
    languageEn: 'English',
    languageTh: 'ไทย',
    compareResults: 'Compare Classifications',
    latestChange: 'Latest Classification',
    previousChange: 'Previous Classification',
    comparisonSummary: 'Comparison Summary',
  },
  th: {
    title: 'หน้าทดสอบการจำแนกประเภทผิว',
    testScenarios: 'สถานการณ์ทดสอบ',
    classifyBtn: 'จำแนกประเภทผิว',
    resetBtn: 'รีเซ็ตค่า',
    history: 'ประวัติการจำแนก',
    comparison: 'การวิเคราะห์ประวัติ',
    characteristics: 'ลักษณะการทดสอบ',
    noHistory: 'ยังไม่มีการจำแนก',
    typeChange: 'เปลี่ยนประเภทผิว',
    typeStable: 'ประเภทผิวคงที่',
    confidence: 'ความมั่นใจ',
    timestamp: 'เวลา',
    scenario: 'สถานการณ์',
    languageEn: 'English',
    languageTh: 'ไทย',
    compareResults: 'เปรียบเทียบผลการจำแนก',
    latestChange: 'การจำแนกล่าสุด',
    previousChange: 'การจำแนกครั้งก่อน',
    comparisonSummary: 'สรุปการเปรียบเทียบ',
  },
};

export default function SkinTypeClassifierTestPage({ params }: { readonly params: { locale: Locale } }) {
  const locale = params.locale || 'en';
  const t = translations[locale] || translations.en;

  const [classificationHistory, setClassificationHistory] = useState<ClassificationResult[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const getTrendColor = (trend: TrendType): string => {
    switch (trend) {
      case 'improving':
        return 'bg-green-50';
      case 'worsening':
        return 'bg-red-50';
      default:
        return 'bg-yellow-50';
    }
  };

  const getTrendTextColor = (trend: TrendType): string => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'worsening':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getTrendBorderColor = (trend: TrendType): string => {
    switch (trend) {
      case 'improving':
        return 'border-green-200';
      case 'worsening':
        return 'border-red-200';
      default:
        return 'border-yellow-200';
    }
  };

  const getConfidenceChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleNewClassification = (result: ClassificationResult) => {
    setClassificationHistory([...classificationHistory, result]);
  };

  const handleApplyScenario = (scenarioKey: string) => {
    const scenario = testScenarios[scenarioKey];
    if (scenario) {
      const result = SkinTypeClassifier.classify(scenario.characteristics);
      setClassificationHistory([...classificationHistory, result]);
      setSelectedScenario(scenarioKey);
    }
  };

  const handleReset = () => {
    setClassificationHistory([]);
    setSelectedScenario(null);
  };

  const analysis = classificationHistory.length > 0 ? SkinTypeClassifier.analyzeHistory(classificationHistory) : null;

  const comparison =
    classificationHistory.length >= 2
      ? SkinTypeClassifier.compareClassifications(
          classificationHistory.at(-1)!,
          classificationHistory.at(-2)!
        )
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t.resetBtn}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Classifier */}
          <div className="lg:col-span-2">
            <SkinTypeClassifierComponent language={locale} onClassificationChange={handleNewClassification} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Test Scenarios */}
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">{t.testScenarios}</h2>
              <div className="space-y-2">
                {Object.entries(testScenarios).map(([key, scenario]) => (
                  <button
                    key={key}
                    onClick={() => handleApplyScenario(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedScenario === key
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-semibold">{scenario.name}</p>
                    <p className="text-xs opacity-75 mt-1">{scenario.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics */}
            {analysis && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">{t.comparison}</h2>
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Average Type</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">{analysis.averageType}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${getTrendColor(analysis.trend)} border ${getTrendBorderColor(analysis.trend)}`}>
                    <p className={`text-sm font-semibold ${getTrendTextColor(analysis.trend)} uppercase`}>Trend</p>
                    <p className={`text-lg font-bold mt-1 ${getTrendTextColor(analysis.trend)}`}>
                      {analysis.trend}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{analysis.trendDescription}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Total Classifications</p>
                    <p className="text-lg font-bold text-purple-600 mt-1">{classificationHistory.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison */}
            {comparison && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">{t.compareResults}</h2>
                <div className="space-y-3">
                  {comparison.typeChange && (
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <p className="text-sm font-semibold text-orange-900">{t.typeChange}</p>
                      <p className="text-xs text-orange-700 mt-1">{comparison.summary}</p>
                    </div>
                  )}
                  {!comparison.typeChange && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-sm font-semibold text-green-900">{t.typeStable}</p>
                      <p className="text-xs text-green-700 mt-1">{comparison.summary}</p>
                    </div>
                  )}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Confidence Change</p>
                    <p className={`text-lg font-bold mt-1 ${getConfidenceChangeColor(comparison.confidenceChange)}`}>
                      {comparison.confidenceChange > 0 ? '+' : ''}
                      {comparison.confidenceChange.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        {classificationHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">{t.history}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">{t.scenario}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Skin Type</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">{t.confidence}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">{t.timestamp}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Indicators</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {classificationHistory.map((result) => (
                    <tr key={result.timestamp.toISOString()} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">{classificationHistory.indexOf(result) + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {selectedScenario && testScenarios[selectedScenario]?.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {result.skinType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">{result.confidence}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {result.timestamp.toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-US')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {result.indicators.length > 0 ? result.indicators.slice(0, 2).join(', ') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {classificationHistory.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">{t.noHistory}</p>
          </div>
        )}
      </div>
    </div>
  );
}
