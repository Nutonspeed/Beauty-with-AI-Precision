'use client';

import { useState, useMemo } from 'react';
import CostROIDisplay from '@/components/cost-roi-display';
import { CostROICalculator, TreatmentCost, Currency, ROIAnalysis, CostBreakdown } from '@/lib/cost-roi-calculator';

const translations = {
  en: {
    title: 'Test Cost Calculator & ROI Analyzer',
    scenarios: 'Test Scenarios',
    budgetPlanning: 'Budget Planning',
    analysis: 'Analysis & Comparison',
    selectScenario: 'Select a Test Scenario:',
    basicSkincare: 'Basic Skincare',
    advancedTreatment: 'Advanced Treatment',
    comprehensivePlan: 'Comprehensive Plan',
    luxuryProgram: 'Luxury Program',
    budgetFriendly: 'Budget-Friendly',
    monthlyBudget: 'Monthly Budget',
    plan: 'Plan',
    comparison: 'Comparison with Previous',
    history: 'Analysis History',
    noAnalysis: 'No analysis performed yet',
    statistics: 'Statistics',
    totalTreated: 'Total Analyzed',
    averageROI: 'Average ROI',
    highestROI: 'Highest ROI',
    scenario: 'Scenario',
    costBreakdown: 'Cost Breakdown',
    roi: 'ROI',
    payback: 'Payback',
    trend: 'Trend',
  },
  th: {
    title: 'ทดสอบเครื่องคำนวณต้นทุน & ตัววิเคราะห์ ROI',
    scenarios: 'สถานการณ์ทดสอบ',
    budgetPlanning: 'การวางแผนงบประมาณ',
    analysis: 'การวิเคราะห์และการเปรียบเทียบ',
    selectScenario: 'เลือกสถานการณ์ทดสอบ:',
    basicSkincare: 'การดูแลผิวพื้นฐาน',
    advancedTreatment: 'การรักษาขั้นสูง',
    comprehensivePlan: 'แผนที่ครอบคลุม',
    luxuryProgram: 'โปรแกรมหรูหรา',
    budgetFriendly: 'ราคาประหยัด',
    monthlyBudget: 'งบประมาณรายเดือน',
    plan: 'แผน',
    comparison: 'การเปรียบเทียบกับก่อนหน้า',
    history: 'ประวัติการวิเคราะห์',
    noAnalysis: 'ยังไม่มีการวิเคราะห์',
    statistics: 'สถิติ',
    totalTreated: 'รวมที่วิเคราะห์',
    averageROI: 'ROI เฉลี่ย',
    highestROI: 'ROI สูงสุด',
    scenario: 'สถานการณ์',
    costBreakdown: 'การแยกรายละเอียดต้นทุน',
    roi: 'ROI',
    payback: 'คืนทุน',
    trend: 'แนวโน้ม',
  },
};

type Locale = 'en' | 'th';

interface CostAnalysis {
  timestamp: Date;
  scenario: string;
  breakdown: CostBreakdown;
  roi: ROIAnalysis;
  treatments: TreatmentCost[];
}

interface TestScenario {
  name: string;
  description: string;
  treatments: Array<{
    name: string;
    type: 'skincare' | 'professional' | 'procedure' | 'supplement' | 'consultation';
    basePrice: number;
    quantity: number;
    discount: number;
  }>;
  monthlyBudget: number;
  currency: Currency;
}

const scenarios: Record<string, TestScenario> = {
  basic: {
    name: 'Basic Skincare',
    description: 'Simple daily skincare routine with essentials',
    treatments: [
      { name: 'Cleanser', type: 'skincare', basePrice: 15, quantity: 2, discount: 0 },
      { name: 'Moisturizer', type: 'skincare', basePrice: 20, quantity: 2, discount: 0 },
      { name: 'Sunscreen', type: 'skincare', basePrice: 18, quantity: 2, discount: 0 },
    ],
    monthlyBudget: 200,
    currency: 'USD',
  },
  advanced: {
    name: 'Advanced Treatment',
    description: 'Professional treatments with serums and masks',
    treatments: [
      { name: 'Professional Facial', type: 'professional', basePrice: 80, quantity: 1, discount: 10 },
      { name: 'Vitamin C Serum', type: 'skincare', basePrice: 45, quantity: 1, discount: 0 },
      { name: 'Hydrating Mask', type: 'skincare', basePrice: 35, quantity: 2, discount: 0 },
      { name: 'Retinol Cream', type: 'skincare', basePrice: 50, quantity: 1, discount: 0 },
      { name: 'Skin Consultation', type: 'consultation', basePrice: 60, quantity: 1, discount: 0 },
    ],
    monthlyBudget: 500,
    currency: 'USD',
  },
  comprehensive: {
    name: 'Comprehensive Plan',
    description: 'Full-service skincare with procedures and supplements',
    treatments: [
      { name: 'Monthly Facial', type: 'professional', basePrice: 100, quantity: 1, discount: 15 },
      { name: 'Microdermabrasion', type: 'procedure', basePrice: 150, quantity: 1, discount: 0 },
      { name: 'Premium Skincare Set', type: 'skincare', basePrice: 120, quantity: 1, discount: 0 },
      { name: 'Collagen Supplement', type: 'supplement', basePrice: 40, quantity: 1, discount: 0 },
      { name: 'Monthly Consultation', type: 'consultation', basePrice: 80, quantity: 1, discount: 0 },
      { name: 'LED Therapy', type: 'procedure', basePrice: 75, quantity: 2, discount: 0 },
    ],
    monthlyBudget: 800,
    currency: 'USD',
  },
  luxury: {
    name: 'Luxury Program',
    description: 'Premium treatments with exclusive procedures',
    treatments: [
      { name: 'Signature Facial', type: 'professional', basePrice: 200, quantity: 2, discount: 20 },
      { name: 'Chemical Peel', type: 'procedure', basePrice: 250, quantity: 1, discount: 0 },
      { name: 'Laser Skin Resurfacing', type: 'procedure', basePrice: 400, quantity: 1, discount: 10 },
      { name: 'Premium Serum Collection', type: 'skincare', basePrice: 200, quantity: 1, discount: 0 },
      { name: 'Luxury Supplements Bundle', type: 'supplement', basePrice: 150, quantity: 1, discount: 0 },
      { name: 'Monthly VIP Consultation', type: 'consultation', basePrice: 150, quantity: 1, discount: 0 },
    ],
    monthlyBudget: 1500,
    currency: 'USD',
  },
  budget: {
    name: 'Budget-Friendly',
    description: 'Effective skincare on a tight budget',
    treatments: [
      { name: 'Basic Cleanser', type: 'skincare', basePrice: 10, quantity: 1, discount: 0 },
      { name: 'Generic Moisturizer', type: 'skincare', basePrice: 12, quantity: 1, discount: 0 },
      { name: 'Budget Sunscreen', type: 'skincare', basePrice: 8, quantity: 2, discount: 0 },
      { name: 'Simple Mask', type: 'skincare', basePrice: 5, quantity: 4, discount: 25 },
    ],
    monthlyBudget: 100,
    currency: 'USD',
  },
};

export default function TestCostROI({ params }: { readonly params: { locale: Locale } }) {
  const locale = params.locale;
  const t = translations[locale] ?? translations.en;

  const [analysisHistory, setAnalysisHistory] = useState<CostAnalysis[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('basic');

  const handleScenarioSelect = (scenarioKey: string): void => {
    setSelectedScenario(scenarioKey);
  };

  const handleCostChange = (cost: CostBreakdown): void => {
    const scenario = scenarios[selectedScenario];
    if (!scenario) return;

    const treatments: TreatmentCost[] = scenario.treatments.map((t, idx) => ({
      id: `treatment-${idx}`,
      name: t.name,
      type: t.type,
      basePrice: t.basePrice,
      quantity: t.quantity,
      totalPrice: t.basePrice * t.quantity,
      currency: scenario.currency,
      frequency: 'month',
      startDate: new Date(),
      discount: t.discount,
    }));

    const effectivenessScores: Record<string, number> = {};
    for (const treatment of treatments) {
      effectivenessScores[treatment.id] = 60 + Math.random() * 35;
    }

    const roi = CostROICalculator.estimateROI(treatments, effectivenessScores, 1.8);

    setAnalysisHistory((prev) => [
      ...prev,
      {
        timestamp: new Date(),
        scenario: scenario.name,
        breakdown: cost,
        roi,
        treatments,
      },
    ]);
  };

  const statistics = useMemo(() => {
    if (analysisHistory.length === 0) {
      return { totalAnalyzed: 0, averageROI: 0, highestROI: 0 };
    }

    const rois = analysisHistory.map((a) => a.roi.roi);
    const averageROI = rois.reduce((sum, roi) => sum + roi, 0) / rois.length;
    const highestROI = Math.max(...rois);

    return {
      totalAnalyzed: analysisHistory.length,
      averageROI,
      highestROI,
    };
  }, [analysisHistory]);

  const getTrendColor = (trend: string): string => {
    if (trend === 'increasing') return 'text-red-600';
    if (trend === 'decreasing') return 'text-green-600';
    return 'text-yellow-600';
  };

  const getRoiColor = (roi: number): string => {
    if (roi > 50) return 'text-green-600 font-bold';
    if (roi > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  const comparisonData = useMemo(() => {
    if (analysisHistory.length < 2) return null;

    const current = analysisHistory.at(-1)!;
    const previous = analysisHistory.at(-2)!;

    return {
      scenarioChange: current.scenario !== previous.scenario,
      costChange: current.breakdown.totalCost - previous.breakdown.totalCost,
      roiChange: current.roi.roi - previous.roi.roi,
      roiImprovement: current.roi.roi > previous.roi.roi,
    };
  }, [analysisHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-slate-300">
            {t.selectScenario}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Component */}
          <div className="lg:col-span-2">
            <CostROIDisplay language={locale} onCostChange={handleCostChange} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Scenarios */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.scenarios}</h2>
              <div className="space-y-2">
                {Object.entries(scenarios).map(([key, scenario]) => (
                  <button
                    key={key}
                    onClick={() => handleScenarioSelect(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedScenario === key
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <p className="font-semibold">{scenario.name}</p>
                    <p className="text-sm opacity-75 line-clamp-1">{scenario.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics */}
            {analysisHistory.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.statistics}</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">{t.totalTreated}</p>
                    <p className="text-2xl font-bold text-slate-900">{statistics.totalAnalyzed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{t.averageROI}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {statistics.averageROI.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{t.highestROI}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {statistics.highestROI.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison */}
            {comparisonData && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.comparison}</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Cost Change</p>
                    <p className={`text-lg font-bold ${comparisonData.costChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {comparisonData.costChange >= 0 ? '+' : ''}{comparisonData.costChange.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">ROI Change</p>
                    <p className={`text-lg font-bold ${comparisonData.roiImprovement ? 'text-green-600' : 'text-red-600'}`}>
                      {comparisonData.roiImprovement ? '↑' : '↓'} {Math.abs(comparisonData.roiChange).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis History */}
        {analysisHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.history}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">#</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">{t.scenario}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">{t.costBreakdown}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">{t.roi}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">{t.payback}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">{t.trend}</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisHistory.map((analysis, idx) => (
                    <tr key={analysis.timestamp.toISOString()} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600">{idx + 1}</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">
                        {analysis.scenario}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {analysis.timestamp.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        ${analysis.breakdown.totalCost.toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 text-sm font-semibold ${getRoiColor(analysis.roi.roi)}`}>
                        {analysis.roi.roi.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {analysis.roi.paybackPeriodMonths.toFixed(1)}m
                      </td>
                      <td className={`py-3 px-4 text-sm font-semibold ${getTrendColor(analysis.roi.costTrend)}`}>
                        {analysis.roi.costTrend}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {analysisHistory.length === 0 && (
          <div className="mt-8 bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600">{t.noAnalysis}</p>
          </div>
        )}
      </div>
    </div>
  );
}
