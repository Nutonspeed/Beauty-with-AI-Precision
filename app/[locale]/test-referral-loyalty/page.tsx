'use client';

import { useState } from 'react';
import ReferralLoyaltyDisplay from '@/components/referral-loyalty-display';
import { ReferralLoyaltyCalculator, type Referral } from '@/lib/referral-loyalty-calculator';

const translations = {
  en: {
    title: 'Test Referral & Loyalty Program',
    scenarios: 'Test Scenarios',
    createScenario: 'Create Test Scenario',
    newMember: 'New Member',
    activeMember: 'Active Member',
    topPerformer: 'Top Performer',
    analysis: 'Program Analysis',
    metrics: 'Metrics',
    totalReferrals: 'Total Referrals',
    completedReferrals: 'Completed Referrals',
    conversionRate: 'Conversion Rate',
    averageValue: 'Average Referral Value',
    history: 'Scenario History',
    noAnalysis: 'No analysis performed yet',
    statistics: 'Statistics',
  },
  th: {
    title: 'ทดสอบโปรแกรมอ้างอิง & ความเที่ยงตรง',
    scenarios: 'สถานการณ์ทดสอบ',
    createScenario: 'สร้างสถานการณ์ทดสอบ',
    newMember: 'สมาชิกใหม่',
    activeMember: 'สมาชิกที่ใช้งานอยู่',
    topPerformer: 'ผู้ปฏิบัติงานชั้นสูง',
    analysis: 'การวิเคราะห์โปรแกรม',
    metrics: 'เมตริกส์',
    totalReferrals: 'การอ้างอิงทั้งหมด',
    completedReferrals: 'การอ้างอิงที่เสร็จสิ้น',
    conversionRate: 'อัตราการแปลง',
    averageValue: 'ค่าการอ้างอิงเฉลี่ย',
    history: 'ประวัติสถานการณ์',
    noAnalysis: 'ยังไม่มีการวิเคราะห์',
    statistics: 'สถิติ',
  },
};

type Locale = 'en' | 'th';

interface TestScenario {
  name: string;
  description: string;
  referrals: Array<{
    referredUserId: string;
    totalRevenue: number;
    status: 'completed' | 'pending' | 'cancelled';
  }>;
}

const scenarios: Record<string, TestScenario> = {
  newMember: {
    name: 'New Member',
    description: 'Just started with one referral',
    referrals: [
      { referredUserId: 'user-001', totalRevenue: 1500, status: 'completed' },
    ],
  },
  activeMember: {
    name: 'Active Member',
    description: 'Consistent referrer with multiple referrals',
    referrals: [
      { referredUserId: 'user-002', totalRevenue: 2000, status: 'completed' },
      { referredUserId: 'user-003', totalRevenue: 3500, status: 'completed' },
      { referredUserId: 'user-004', totalRevenue: 1800, status: 'completed' },
      { referredUserId: 'user-005', totalRevenue: 2500, status: 'pending' },
    ],
  },
  topPerformer: {
    name: 'Top Performer',
    description: 'Highly successful referrer with many referrals',
    referrals: [
      { referredUserId: 'user-010', totalRevenue: 2500, status: 'completed' },
      { referredUserId: 'user-011', totalRevenue: 3200, status: 'completed' },
      { referredUserId: 'user-012', totalRevenue: 2800, status: 'completed' },
      { referredUserId: 'user-013', totalRevenue: 4000, status: 'completed' },
      { referredUserId: 'user-014', totalRevenue: 3500, status: 'completed' },
      { referredUserId: 'user-015', totalRevenue: 2900, status: 'completed' },
      { referredUserId: 'user-016', totalRevenue: 3800, status: 'completed' },
      { referredUserId: 'user-017', totalRevenue: 3200, status: 'completed' },
      { referredUserId: 'user-018', totalRevenue: 2700, status: 'completed' },
      { referredUserId: 'user-019', totalRevenue: 3500, status: 'completed' },
    ],
  },
};

export default function TestReferralLoyalty({ params }: { readonly params: { locale: Locale } }) {
  const locale = params.locale;
  const t = translations[locale] ?? translations.en;

  const [allReferrals, setAllReferrals] = useState<Referral[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('newMember');
  const [analysisHistory, setAnalysisHistory] = useState<Array<{
    timestamp: Date;
    scenario: string;
    totalReferrals: number;
    completedReferrals: number;
    conversionRate: number;
  }>>([]);

  const handleLoadScenario = (scenarioKey: string): void => {
    setSelectedScenario(scenarioKey);

    const scenario = scenarios[scenarioKey];
    if (!scenario) return;

    const newReferrals: Referral[] = scenario.referrals.map((r, idx) => {
      const tier = 'gold' as const; // Default tier for test
      const commission = ReferralLoyaltyCalculator.calculateCommission(r.totalRevenue, tier);

      return {
        id: `ref-${Date.now()}-${idx}`,
        referrerId: 'user-123',
        referredUserId: r.referredUserId,
        referralCode: `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        createdAt: new Date(Date.now() - (scenario.referrals.length - idx) * 7 * 24 * 60 * 60 * 1000),
        firstPurchaseDate: r.status === 'completed' ? new Date() : undefined,
        totalRevenue: r.totalRevenue,
        status: r.status,
        commissionEarned: commission,
        pointsEarned: ReferralLoyaltyCalculator.calculatePointsEarned(r.totalRevenue * 0.1, tier),
      };
    });

    setAllReferrals(newReferrals);

    // Add to history
    const metrics = ReferralLoyaltyCalculator.calculateReferralMetrics(newReferrals);
    setAnalysisHistory((prev) => [
      ...prev,
      {
        timestamp: new Date(),
        scenario: scenario.name,
        totalReferrals: metrics.totalReferrals,
        completedReferrals: metrics.completedReferrals,
        conversionRate: metrics.conversionRate,
      },
    ]);
  };

  const statistics = {
    totalAnalyzed: analysisHistory.length,
    averageConversion: analysisHistory.length > 0
      ? analysisHistory.reduce((sum, h) => sum + h.conversionRate, 0) / analysisHistory.length
      : 0,
    highestConversion: analysisHistory.length > 0
      ? Math.max(...analysisHistory.map((h) => h.conversionRate))
      : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-slate-300">{t.createScenario}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Component */}
          <div className="lg:col-span-2">
            <ReferralLoyaltyDisplay language={locale} onReferralsChange={setAllReferrals} />
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
                    onClick={() => handleLoadScenario(key)}
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
            {allReferrals.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.statistics}</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">{t.totalReferrals}</p>
                    <p className="text-2xl font-bold text-slate-900">{allReferrals.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{t.completedReferrals}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {allReferrals.filter((r) => r.status === 'completed').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{t.conversionRate}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(
                        (allReferrals.filter((r) => r.status === 'completed').length / allReferrals.length) *
                        100
                      ).toFixed(0)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Summary */}
            {analysisHistory.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.analysis}</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">{t.metrics}</p>
                    <p className="text-2xl font-bold text-slate-900">{statistics.totalAnalyzed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Avg Conversion</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {statistics.averageConversion.toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Highest Conversion</p>
                    <p className="text-2xl font-bold text-green-600">
                      {statistics.highestConversion.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        {analysisHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.history}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">#</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Scenario</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Completed</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Conversion</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisHistory.map((record, idx) => (
                    <tr key={`history-${record.timestamp.getTime()}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600">{idx + 1}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-900">{record.scenario}</td>
                      <td className="py-3 px-4 text-sm text-slate-900">{record.totalReferrals}</td>
                      <td className="py-3 px-4 text-sm font-bold text-green-600">{record.completedReferrals}</td>
                      <td className="py-3 px-4 text-sm font-bold text-blue-600">{record.conversionRate.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{record.timestamp.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {allReferrals.length === 0 && (
          <div className="mt-8 bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600">{t.noAnalysis}</p>
          </div>
        )}
      </div>
    </div>
  );
}
