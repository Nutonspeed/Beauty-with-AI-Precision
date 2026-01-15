'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ReferralLoyaltyCalculator,
  type ReferralCode,
  type LoyaltyPoints,
  type UserTier,
  type Achievement,
  type Referral,
  type TierLevel,
  type Commission,
} from '@/lib/referral-loyalty-calculator';

export interface ReferralLoyaltyDisplayProps {
  readonly onReferralsChange?: (referrals: Referral[]) => void;
}

import { useTranslations, useLocale } from 'next-intl';

export default function ReferralLoyaltyDisplay({ onReferralsChange: _onReferralsChange }: ReferralLoyaltyDisplayProps) {
  const t = useTranslations('referralLoyalty');
  const locale = useLocale();

  // State
  const [referralCode] = useState<ReferralCode>(
    ReferralLoyaltyCalculator.generateReferralCode('user-123')
  );
  const [loyaltyPoints] = useState<LoyaltyPoints>({
    userId: 'user-123',
    balance: 2500,
    earned: 5000,
    redeemed: 2500,
    lastUpdated: new Date(),
  });
  const [userTier] = useState<UserTier>({
    userId: 'user-123',
    currentTier: 'gold',
    spentAmount: 8500,
    referralCount: 7,
    tierUpdatedAt: new Date(),
    nextTierThreshold: 15000,
  });
  const [referrals] = useState<Referral[]>([
    {
      id: 'ref-1',
      referrerId: 'user-123',
      referredUserId: 'user-456',
      referralCode: referralCode.code,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      firstPurchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      totalRevenue: 2000,
      status: 'completed',
      commissionEarned: 250,
      pointsEarned: 200,
    },
    {
      id: 'ref-2',
      referrerId: 'user-123',
      referredUserId: 'user-789',
      referralCode: referralCode.code,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      firstPurchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      totalRevenue: 3500,
      status: 'completed',
      commissionEarned: 437,
      pointsEarned: 350,
    },
  ]);
  const [commissions] = useState<Commission[]>([
    { id: 'c-1', userId: 'user-123', amount: 250, status: 'paid', relatedReferralId: 'ref-1', createdAt: new Date(), paidAt: new Date() },
    { id: 'c-2', userId: 'user-123', amount: 437, status: 'pending', relatedReferralId: 'ref-2', createdAt: new Date() },
  ]);
  const [achievements] = useState<Achievement[]>([
    {
      id: 'ach-1',
      userId: 'user-123',
      type: 'first-referral',
      earnedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      badge: '🎉',
      pointsReward: 100,
    },
    {
      id: 'ach-2',
      userId: 'user-123',
      type: 'milestone-5',
      earnedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      badge: '⭐',
      pointsReward: 500,
    },
    {
      id: 'ach-3',
      userId: 'user-123',
      type: 'loyalty-expert',
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      badge: '👑',
      pointsReward: 1500,
    },
  ]);
  const [copied, setCopied] = useState(false);

  // Derived data
  const tierProgress = useMemo(
    () => ReferralLoyaltyCalculator.calculateTierProgress(userTier.spentAmount),
    [userTier.spentAmount]
  );

  const tierBenefits = useMemo(
    () => ReferralLoyaltyCalculator.getTierBenefits(userTier.currentTier),
    [userTier.currentTier]
  );

  const commissionSummary = useMemo(() => {
    const pending = commissions.filter((c) => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
    const paid = commissions.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);

    return { total: pending + paid, pending, paid };
  }, [commissions]);

  const chartData = useMemo(() => {
    return referrals
      .filter((r) => r.status === 'completed')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((r) => ({
        date: r.createdAt.toLocaleDateString(),
        commission: r.commissionEarned,
        cumulative: referrals
          .filter((ref) => ref.status === 'completed' && ref.createdAt <= r.createdAt)
          .reduce((sum, ref) => sum + ref.commissionEarned, 0),
      }));
  }, [referrals]);

  const handleCopyCode = (): void => {
    navigator.clipboard.writeText(referralCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTierColor = (tier: TierLevel): string => {
    const colors: Record<TierLevel, string> = {
      bronze: 'bg-orange-100 text-orange-700 border-orange-300',
      silver: 'bg-slate-100 text-slate-700 border-slate-300',
      gold: 'bg-amber-100 text-amber-700 border-amber-300',
      platinum: 'bg-purple-100 text-purple-700 border-purple-300',
    };

    return colors[tier];
  };

  const getTierBadge = (tier: TierLevel): string => {
    const badges: Record<TierLevel, string> = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '👑' };

    return badges[tier];
  };

  const getProgressBarWidth = (progress: number): string => {
    const clamped = Math.min(100, Math.max(0, progress));

    if (clamped <= 10) return 'w-[10%]';
    if (clamped <= 20) return 'w-[20%]';
    if (clamped <= 30) return 'w-[30%]';
    if (clamped <= 40) return 'w-[40%]';
    if (clamped <= 50) return 'w-[50%]';
    if (clamped <= 60) return 'w-[60%]';
    if (clamped <= 70) return 'w-[70%]';
    if (clamped <= 80) return 'w-[80%]';
    if (clamped <= 90) return 'w-[90%]';
    return 'w-full';
  };

  const getStatusColorClass = (status: 'completed' | 'pending' | 'cancelled'): string => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-8">
      {/* Referral Code Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          🔗 {t('shareCode')}
        </h2>

        <div className="bg-white rounded-lg p-6 flex items-center justify-between border-2 border-dashed border-blue-300">
          <div>
            <p className="text-sm text-slate-600 mb-2">{t('referralCode')}</p>
            <p className="text-3xl font-bold text-blue-600 font-mono">{referralCode.code}</p>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {copied ? `✓ ${t('copied')}` : t('copy')}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loyalty Points Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            ⭐ {t('loyaltyPoints')}
          </h3>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-slate-600 mb-1">{t('pointsBalance')}</p>
              <p className="text-4xl font-bold text-orange-600">{loyaltyPoints.balance}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-slate-600 mb-1">{t('pointsEarned')}</p>
                <p className="text-2xl font-bold text-green-600">{loyaltyPoints.earned}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-xs text-slate-600 mb-1">{t('pointsRedeemed')}</p>
                <p className="text-2xl font-bold text-red-600">{loyaltyPoints.redeemed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Status Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            {getTierBadge(userTier.currentTier)} {t('currentTier')}
          </h3>

          <div className={`rounded-lg p-4 mb-4 border-2 ${getTierColor(userTier.currentTier)}`}>
            <p className="text-sm font-semibold capitalize">{userTier.currentTier} Tier</p>
            <p className="text-2xl font-bold mt-1">{t('currencySymbol') || '฿'}{userTier.spentAmount.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>{t('tierProgress')}</span>
              <span>{Math.round(tierProgress.progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-blue-600 rounded-full transition-all duration-500 ${getProgressBarWidth(tierProgress.progress)}`}
              />
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {t('nextTier')}: {t('currencySymbol') || '฿'}{tierProgress.nextThreshold.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Commission Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            💰 {t('commission')}
          </h3>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-slate-600 mb-1">{t('pendingCommission')}</p>
              <p className="text-3xl font-bold text-green-600">{t('currencySymbol') || '฿'}{commissionSummary.pending.toLocaleString()}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-slate-600 mb-1">{t('paidCommission')}</p>
              <p className="text-3xl font-bold text-blue-600">{t('currencySymbol') || '฿'}{commissionSummary.paid.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('benefits')}</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">{t('discount')}</p>
            <p className="text-2xl font-bold text-slate-900">{tierBenefits.discountPercentage}%</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">{t('multiplier')}</p>
            <p className="text-2xl font-bold text-slate-900">x{tierBenefits.pointsMultiplier}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">{t('freeConsultations')}</p>
            <p className="text-2xl font-bold text-slate-900">{tierBenefits.freeConsultations}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">{t('priorityBooking')}</p>
            <p className="text-2xl font-bold text-slate-900">{tierBenefits.priorityBooking ? '✓' : '✗'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">{t('exclusiveDeals')}</p>
            <p className="text-2xl font-bold text-slate-900">{tierBenefits.exclusiveDeals ? '✓' : '✗'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">{t('referralBonus')}</p>
            <p className="text-2xl font-bold text-slate-900">{tierBenefits.referralBonusPercentage}%</p>
          </div>
        </div>
      </div>

      {/* Commission Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('commissionTrend') || 'Commission Trend'}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cumulative" stroke="#3b82f6" name={t('paidCommission')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('achievements')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                <p className="text-4xl mb-2">{achievement.badge}</p>
                <p className="font-semibold text-slate-800 capitalize">{achievement.type.replace('-', ' ')}</p>
                <p className="text-sm text-slate-600 mt-2">+{achievement.pointsReward} {t('points') || 'Points'}</p>
                <p className="text-xs text-slate-500 mt-1">{achievement.earnedAt.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referral History */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('myReferrals')}</h3>

        {referrals.length === 0 ? (
          <p className="text-center text-slate-600 py-8">{t('noReferrals')}</p>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral, _idx) => (
              <div key={referral.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-900">{referral.referredUserId}</p>
                  <p className="text-xs text-slate-600">{referral.createdAt.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{t('currencySymbol') || '฿'}{referral.totalRevenue.toLocaleString()}</p>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColorClass(referral.status)}`}
                  >
                    {t(referral.status) || referral.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
