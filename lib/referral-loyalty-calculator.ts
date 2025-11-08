// Referral & Loyalty Program Engine
// Handles referral tracking, loyalty points, tier management, and commission calculations

export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum';
export type RewardType = 'points' | 'commission' | 'discount' | 'badge';
export type AchievementType = 'first-referral' | 'milestone-5' | 'milestone-10' | 'top-referrer' | 'loyalty-expert' | 'vip-member';

export interface ReferralCode {
  id: string;
  code: string;
  userId: string;
  createdAt: Date;
  usageCount: number;
  totalRevenue: number;
  status: 'active' | 'inactive';
  expiresAt?: Date;
}

export interface LoyaltyPoints {
  userId: string;
  balance: number;
  earned: number;
  redeemed: number;
  lastUpdated: Date;
  expiresAt?: Date;
}

export interface TierBenefit {
  level: TierLevel;
  discountPercentage: number;
  pointsMultiplier: number;
  freeConsultations: number;
  priorityBooking: boolean;
  exclusiveDeals: boolean;
  referralBonusPercentage: number;
}

export interface UserTier {
  userId: string;
  currentTier: TierLevel;
  spentAmount: number;
  referralCount: number;
  tierUpdatedAt: Date;
  nextTierThreshold?: number;
}

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  earnedAt: Date;
  badge: string;
  pointsReward: number;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  createdAt: Date;
  firstPurchaseDate?: Date;
  totalRevenue: number;
  status: 'pending' | 'completed' | 'cancelled';
  commissionEarned: number;
  pointsEarned: number;
}

export interface Commission {
  id: string;
  userId: string;
  amount: number;
  status: 'earned' | 'pending' | 'paid' | 'cancelled';
  relatedReferralId: string;
  createdAt: Date;
  paidAt?: Date;
}

export interface RewardCatalog {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  discountValue: number;
  category: 'discount' | 'service' | 'product' | 'experience';
  availableQuantity: number;
  expiresAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'expire' | 'bonus' | 'purchase';
  points: number;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Tier thresholds (spending amounts)
const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000,
};

// Tier benefits configuration
const TIER_BENEFITS: Record<TierLevel, TierBenefit> = {
  bronze: {
    level: 'bronze',
    discountPercentage: 0,
    pointsMultiplier: 1,
    freeConsultations: 0,
    priorityBooking: false,
    exclusiveDeals: false,
    referralBonusPercentage: 5,
  },
  silver: {
    level: 'silver',
    discountPercentage: 5,
    pointsMultiplier: 1.25,
    freeConsultations: 1,
    priorityBooking: false,
    exclusiveDeals: false,
    referralBonusPercentage: 10,
  },
  gold: {
    level: 'gold',
    discountPercentage: 10,
    pointsMultiplier: 1.5,
    freeConsultations: 2,
    priorityBooking: true,
    exclusiveDeals: true,
    referralBonusPercentage: 15,
  },
  platinum: {
    level: 'platinum',
    discountPercentage: 15,
    pointsMultiplier: 2,
    freeConsultations: 4,
    priorityBooking: true,
    exclusiveDeals: true,
    referralBonusPercentage: 20,
  },
};

export class ReferralLoyaltyCalculator {
  // Referral Code Management

  static generateReferralCode(userId: string): ReferralCode {
    const code = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      id: `code-${Date.now()}`,
      code,
      userId,
      createdAt: new Date(),
      usageCount: 0,
      totalRevenue: 0,
      status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };
  }

  static validateReferralCode(code: string, codes: ReferralCode[]): ReferralCode | null {
    const referralCode = codes.find((c) => c.code === code);

    if (!referralCode) return null;
    if (referralCode.status !== 'active') return null;
    if (referralCode.expiresAt && referralCode.expiresAt < new Date()) return null;

    return referralCode;
  }

  // Loyalty Points Management

  static calculatePointsEarned(purchaseAmount: number, tier: TierLevel): number {
    const basePoints = Math.floor(purchaseAmount / 10);
    const multiplier = TIER_BENEFITS[tier].pointsMultiplier;

    return Math.round(basePoints * multiplier);
  }

  static calculatePointsRedemption(pointsToUse: number, rewardCatalog: RewardCatalog[]): { reward: RewardCatalog; remainingPoints: number } | null {
    const reward = rewardCatalog.find((r) => r.pointsCost <= pointsToUse && r.availableQuantity > 0);

    if (!reward) return null;

    return {
      reward,
      remainingPoints: pointsToUse - reward.pointsCost,
    };
  }

  static updateLoyaltyPoints(current: LoyaltyPoints, pointsChange: number, type: 'earn' | 'redeem'): LoyaltyPoints {
    const newBalance = type === 'earn' ? current.balance + pointsChange : Math.max(0, current.balance - pointsChange);

    return {
      ...current,
      balance: newBalance,
      earned: type === 'earn' ? current.earned + pointsChange : current.earned,
      redeemed: type === 'redeem' ? current.redeemed + pointsChange : current.redeemed,
      lastUpdated: new Date(),
    };
  }

  // Tier Management

  static determineUserTier(spentAmount: number): TierLevel {
    if (spentAmount >= TIER_THRESHOLDS.platinum) return 'platinum';
    if (spentAmount >= TIER_THRESHOLDS.gold) return 'gold';
    if (spentAmount >= TIER_THRESHOLDS.silver) return 'silver';
    return 'bronze';
  }

  static calculateTierProgress(spentAmount: number): { currentTier: TierLevel; progress: number; nextThreshold: number } {
    const currentTier = this.determineUserTier(spentAmount);
    const currentThreshold = TIER_THRESHOLDS[currentTier];
    const tierLevels: TierLevel[] = ['bronze', 'silver', 'gold', 'platinum'];
    const tierIndex = tierLevels.indexOf(currentTier);
    const nextTier = tierIndex < tierLevels.length - 1 ? tierLevels[tierIndex + 1] : currentTier;
    const nextThreshold = TIER_THRESHOLDS[nextTier];

    const progress = nextThreshold === currentThreshold ? 100 : ((spentAmount - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

    return {
      currentTier,
      progress: Math.min(100, Math.max(0, progress)),
      nextThreshold,
    };
  }

  static getTierBenefits(tier: TierLevel): TierBenefit {
    return TIER_BENEFITS[tier];
  }

  // Referral Commission

  static calculateCommission(referralAmount: number, referrerTier: TierLevel): number {
    const baseCommissionRate = 0.1; // 10% base
    const tierBonus = (TIER_BENEFITS[referrerTier].referralBonusPercentage - 5) / 100;
    const totalRate = baseCommissionRate + tierBonus;

    return Math.round(referralAmount * totalRate * 100) / 100;
  }

  static calculateReferralBonus(referralAmount: number, isFirstReferral: boolean, referrerTier: TierLevel): { commission: number; bonus: number } {
    const commission = this.calculateCommission(referralAmount, referrerTier);
    const bonus = isFirstReferral ? commission * 0.5 : 0; // 50% bonus on first referral

    return {
      commission,
      bonus: Math.round(bonus * 100) / 100,
    };
  }

  static trackReferral(referrerId: string, referredUserId: string, code: string, purchaseAmount: number, tier: TierLevel): Referral {
    const commissionEarned = this.calculateCommission(purchaseAmount, tier);
    const pointsEarned = this.calculatePointsEarned(purchaseAmount * 0.1, tier); // 10% of purchase for referral

    return {
      id: `ref-${Date.now()}`,
      referrerId,
      referredUserId,
      referralCode: code,
      createdAt: new Date(),
      firstPurchaseDate: new Date(),
      totalRevenue: purchaseAmount,
      status: 'completed',
      commissionEarned,
      pointsEarned,
    };
  }

  // Achievement & Badges

  static checkAchievements(referralCount: number, spentAmount: number, previousAchievements: Achievement[]): Achievement[] {
    const newAchievements: Achievement[] = [];
    const now = new Date();

    // First Referral
    if (referralCount === 1 && !previousAchievements.some((a) => a.type === 'first-referral')) {
      newAchievements.push({
        id: `ach-${Date.now()}-1`,
        userId: 'temp-user',
        type: 'first-referral',
        earnedAt: now,
        badge: '🎉',
        pointsReward: 100,
      });
    }

    // Milestone 5
    if (referralCount >= 5 && !previousAchievements.some((a) => a.type === 'milestone-5')) {
      newAchievements.push({
        id: `ach-${Date.now()}-5`,
        userId: 'temp-user',
        type: 'milestone-5',
        earnedAt: now,
        badge: '⭐',
        pointsReward: 500,
      });
    }

    // Milestone 10
    if (referralCount >= 10 && !previousAchievements.some((a) => a.type === 'milestone-10')) {
      newAchievements.push({
        id: `ach-${Date.now()}-10`,
        userId: 'temp-user',
        type: 'milestone-10',
        earnedAt: now,
        badge: '🏆',
        pointsReward: 1000,
      });
    }

    // Loyalty Expert
    if (spentAmount >= 10000 && !previousAchievements.some((a) => a.type === 'loyalty-expert')) {
      newAchievements.push({
        id: `ach-${Date.now()}-expert`,
        userId: 'temp-user',
        type: 'loyalty-expert',
        earnedAt: now,
        badge: '👑',
        pointsReward: 1500,
      });
    }

    // VIP Member
    if (spentAmount >= 20000 && !previousAchievements.some((a) => a.type === 'vip-member')) {
      newAchievements.push({
        id: `ach-${Date.now()}-vip`,
        userId: 'temp-user',
        type: 'vip-member',
        earnedAt: now,
        badge: '💎',
        pointsReward: 2000,
      });
    }

    return newAchievements;
  }

  // Analytics

  static calculateReferralMetrics(referrals: Referral[]): {
    totalReferrals: number;
    completedReferrals: number;
    totalCommission: number;
    averageReferralValue: number;
    conversionRate: number;
  } {
    const completed = referrals.filter((r) => r.status === 'completed');
    const totalRevenue = referrals.reduce((sum, r) => sum + r.totalRevenue, 0);

    return {
      totalReferrals: referrals.length,
      completedReferrals: completed.length,
      totalCommission: completed.reduce((sum, r) => sum + r.commissionEarned, 0),
      averageReferralValue: referrals.length > 0 ? totalRevenue / referrals.length : 0,
      conversionRate: referrals.length > 0 ? (completed.length / referrals.length) * 100 : 0,
    };
  }

  static generateLoyaltyReport(
    loyaltyPoints: LoyaltyPoints,
    tier: UserTier,
    referrals: Referral[],
    commissions: Commission[]
  ): {
    pointsSummary: { balance: number; earned: number; redeemed: number };
    tierInfo: { current: TierLevel; progress: number; benefits: TierBenefit };
    referralSummary: { count: number; totalRevenue: number; totalEarned: number };
    commissionSummary: { total: number; pending: number; paid: number };
  } {
    const referralMetrics = this.calculateReferralMetrics(referrals);
    const tierProgress = this.calculateTierProgress(tier.spentAmount);
    const tierBenefits = this.getTierBenefits(tier.currentTier);

    const commissionTotals = commissions.reduce(
      (acc, c) => {
        if (c.status === 'pending') acc.pending += c.amount;
        else if (c.status === 'paid') acc.paid += c.amount;
        return acc;
      },
      { pending: 0, paid: 0 }
    );

    return {
      pointsSummary: {
        balance: loyaltyPoints.balance,
        earned: loyaltyPoints.earned,
        redeemed: loyaltyPoints.redeemed,
      },
      tierInfo: {
        current: tier.currentTier,
        progress: tierProgress.progress,
        benefits: tierBenefits,
      },
      referralSummary: {
        count: referralMetrics.completedReferrals,
        totalRevenue: referralMetrics.totalCommission,
        totalEarned: referralMetrics.totalCommission,
      },
      commissionSummary: {
        total: commissionTotals.pending + commissionTotals.paid,
        pending: commissionTotals.pending,
        paid: commissionTotals.paid,
      },
    };
  }

  static calculateTopReferrers(
    referrals: Referral[],
    tiers: Map<string, UserTier>,
    limit: number = 10
  ): Array<{ userId: string; referralCount: number; commission: number; tier: TierLevel }> {
    const referrerStats = new Map<
      string,
      { referralCount: number; commission: number; userId: string }
    >();

    for (const referral of referrals) {
      if (referral.status === 'completed') {
        const stats = referrerStats.get(referral.referrerId) ?? { referralCount: 0, commission: 0, userId: referral.referrerId };
        stats.referralCount += 1;
        stats.commission += referral.commissionEarned;
        referrerStats.set(referral.referrerId, stats);
      }
    }

    return Array.from(referrerStats.values())
      .map((stats) => ({
        userId: stats.userId,
        referralCount: stats.referralCount,
        commission: stats.commission,
        tier: tiers.get(stats.userId)?.currentTier ?? 'bronze',
      }))
      .sort((a, b) => b.commission - a.commission)
      .slice(0, limit);
  }
}
