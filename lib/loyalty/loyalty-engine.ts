/**
 * Loyalty Engine
 * Core loyalty program management system
 * Handles points, tiers, rewards, redemptions, and promotions
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TierLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type RewardCategory = 'service' | 'product' | 'discount' | 'voucher' | 'special';
export type TransactionType = 'earn' | 'redeem' | 'expire' | 'bonus' | 'refund';
export type PromotionType = 'birthday' | 'referral' | 'seasonal' | 'welcome' | 'milestone';

export interface CustomerLoyalty {
  customerId: string;
  points: number;
  tier: TierLevel;
  lifetimePoints: number;
  joinedAt: Date;
  lastActivityAt: Date;
  tierExpiry?: Date;
  referralCode: string;
  referredBy?: string;
}

export interface TierConfig {
  level: TierLevel;
  minPoints: number;
  multiplier: number;
  benefits: string[];
  color: string;
  icon: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  pointCost: number;
  value: number;
  stock: number;
  imageUrl?: string;
  termsAndConditions?: string;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  tierRestriction?: TierLevel[];
  maxRedemptionsPerCustomer?: number;
}

export interface PointTransaction {
  id: string;
  customerId: string;
  type: TransactionType;
  points: number;
  balance: number;
  description: string;
  reference?: string;
  rewardId?: string;
  promotionId?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface Redemption {
  id: string;
  customerId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  redeemedAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  code: string;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: PromotionType;
  pointsAwarded: number;
  multiplier?: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  conditions?: Record<string, any>;
  maxUsesPerCustomer?: number;
  totalUsageLimit?: number;
  currentUsage: number;
}

export interface ReferralBonus {
  referrerId: string;
  refereeId: string;
  referrerPoints: number;
  refereePoints: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

export interface PointsEarnRule {
  action: string;
  basePoints: number;
  description: string;
  conditions?: Record<string, any>;
}

// ============================================================================
// Loyalty Engine Class
// ============================================================================

export class LoyaltyEngine {
  private static instance: LoyaltyEngine;
  
  // Tier configurations
  private tierConfigs: TierConfig[] = [
    {
      level: 'Bronze',
      minPoints: 0,
      multiplier: 1.0,
      benefits: [
        'Earn 1 point per ฿1 spent',
        'Birthday bonus: 100 points',
        'Access to basic rewards',
      ],
      color: '#CD7F32',
      icon: '🥉',
    },
    {
      level: 'Silver',
      minPoints: 1000,
      multiplier: 1.25,
      benefits: [
        'Earn 1.25 points per ฿1 spent',
        'Birthday bonus: 250 points',
        'Priority booking',
        'Access to premium rewards',
        '5% discount on services',
      ],
      color: '#C0C0C0',
      icon: '🥈',
    },
    {
      level: 'Gold',
      minPoints: 5000,
      multiplier: 1.5,
      benefits: [
        'Earn 1.5 points per ฿1 spent',
        'Birthday bonus: 500 points',
        'Priority booking + concierge',
        'Access to exclusive rewards',
        '10% discount on services',
        'Free consultation',
      ],
      color: '#FFD700',
      icon: '🥇',
    },
    {
      level: 'Platinum',
      minPoints: 10000,
      multiplier: 2.0,
      benefits: [
        'Earn 2 points per ฿1 spent',
        'Birthday bonus: 1000 points',
        'VIP booking priority',
        'Access to all rewards',
        '15% discount on services',
        'Free consultation + follow-up',
        'Complimentary product samples',
        'Annual health check',
      ],
      color: '#E5E4E2',
      icon: '💎',
    },
  ];

  // Points earn rules
  private earnRules: PointsEarnRule[] = [
    {
      action: 'purchase',
      basePoints: 1,
      description: 'Earn points for every ฿1 spent (multiplied by tier)',
    },
    {
      action: 'appointment_completed',
      basePoints: 50,
      description: 'Bonus for completing an appointment',
    },
    {
      action: 'review',
      basePoints: 100,
      description: 'Leave a review after service',
    },
    {
      action: 'social_share',
      basePoints: 25,
      description: 'Share on social media',
    },
    {
      action: 'profile_complete',
      basePoints: 200,
      description: 'Complete your profile',
    },
    {
      action: 'first_purchase',
      basePoints: 500,
      description: 'Welcome bonus for first purchase',
    },
  ];

  // In-memory storage (replace with database in production)
  private customers = new Map<string, CustomerLoyalty>();
  private transactions = new Map<string, PointTransaction[]>();
  private rewards = new Map<string, Reward>();
  private redemptions = new Map<string, Redemption>();
  private promotions = new Map<string, Promotion>();
  private referrals = new Map<string, ReferralBonus[]>();

  private constructor() {
    this.initializeSampleRewards();
    this.initializeSamplePromotions();
  }

  static getInstance(): LoyaltyEngine {
    if (!LoyaltyEngine.instance) {
      LoyaltyEngine.instance = new LoyaltyEngine();
    }
    return LoyaltyEngine.instance;
  }

  // ============================================================================
  // Customer Management
  // ============================================================================

  async enrollCustomer(customerId: string): Promise<CustomerLoyalty> {
    const referralCode = this.generateReferralCode(customerId);
    
    const customer: CustomerLoyalty = {
      customerId,
      points: 0,
      tier: 'Bronze',
      lifetimePoints: 0,
      joinedAt: new Date(),
      lastActivityAt: new Date(),
      referralCode,
    };

    this.customers.set(customerId, customer);
    this.transactions.set(customerId, []);

    // Welcome bonus
    await this.awardPoints(customerId, 'first_purchase', {
      description: 'Welcome to our loyalty program!',
    });

    return customer;
  }

  async getCustomerLoyalty(customerId: string): Promise<CustomerLoyalty | null> {
    const customer = this.customers.get(customerId);
    if (!customer) return null;

    // Check and update tier
    const newTier = this.calculateTier(customer.lifetimePoints);
    if (newTier !== customer.tier) {
      customer.tier = newTier;
      this.customers.set(customerId, customer);
    }

    return customer;
  }

  async updateCustomerActivity(customerId: string): Promise<void> {
    const customer = this.customers.get(customerId);
    if (customer) {
      customer.lastActivityAt = new Date();
      this.customers.set(customerId, customer);
    }
  }

  // ============================================================================
  // Points Management
  // ============================================================================

  async awardPoints(
    customerId: string,
    action: string,
    metadata?: {
      amount?: number;
      description?: string;
      reference?: string;
      promotionId?: string;
    }
  ): Promise<PointTransaction> {
    const customer = await this.getCustomerLoyalty(customerId);
    if (!customer) {
      throw new Error('Customer not enrolled in loyalty program');
    }

    // Calculate points based on action and tier
    const rule = this.earnRules.find((r) => r.action === action);
    if (!rule) {
      throw new Error(`Invalid action: ${action}`);
    }

    const tierConfig = this.getTierConfig(customer.tier);
    let points = rule.basePoints;

    // Apply amount-based calculation (for purchases)
    if (action === 'purchase' && metadata?.amount) {
      points = Math.floor(metadata.amount * rule.basePoints * tierConfig.multiplier);
    } else {
      points = Math.floor(points * tierConfig.multiplier);
    }

    // Apply promotion multiplier if applicable
    if (metadata?.promotionId) {
      const promotion = this.promotions.get(metadata.promotionId);
      if (promotion && promotion.isActive && promotion.multiplier) {
        points = Math.floor(points * promotion.multiplier);
      }
    }

    // Update customer points
    customer.points += points;
    customer.lifetimePoints += points;
    customer.lastActivityAt = new Date();

    // Check tier upgrade
    const newTier = this.calculateTier(customer.lifetimePoints);
    const tierUpgraded = newTier !== customer.tier;
    if (tierUpgraded) {
      customer.tier = newTier;
    }

    this.customers.set(customerId, customer);

    // Create transaction
    const transaction: PointTransaction = {
      id: this.generateId(),
      customerId,
      type: 'earn',
      points,
      balance: customer.points,
      description: metadata?.description || rule.description,
      reference: metadata?.reference,
      promotionId: metadata?.promotionId,
      expiresAt: this.calculatePointsExpiry(),
      createdAt: new Date(),
    };

    this.addTransaction(customerId, transaction);

    // Tier upgrade notification
    if (tierUpgraded) {
      await this.handleTierUpgrade(customerId, newTier);
    }

    return transaction;
  }

  async redeemPoints(
    customerId: string,
    rewardId: string
  ): Promise<Redemption> {
    const customer = await this.getCustomerLoyalty(customerId);
    if (!customer) {
      throw new Error('Customer not enrolled in loyalty program');
    }

    const reward = this.rewards.get(rewardId);
    if (!reward) {
      throw new Error('Reward not found');
    }

    // Validation
    if (!reward.isActive) {
      throw new Error('Reward is not active');
    }

    if (reward.stock <= 0) {
      throw new Error('Reward is out of stock');
    }

    if (customer.points < reward.pointCost) {
      throw new Error('Insufficient points');
    }

    if (reward.tierRestriction && !reward.tierRestriction.includes(customer.tier)) {
      throw new Error(`This reward is only available for ${reward.tierRestriction.join(', ')} members`);
    }

    // Check redemption limit
    if (reward.maxRedemptionsPerCustomer) {
      const customerRedemptions = this.getCustomerRedemptions(customerId, rewardId);
      if (customerRedemptions.length >= reward.maxRedemptionsPerCustomer) {
        throw new Error('Maximum redemptions reached for this reward');
      }
    }

    // Deduct points
    customer.points -= reward.pointCost;
    customer.lastActivityAt = new Date();
    this.customers.set(customerId, customer);

    // Update stock
    reward.stock -= 1;
    this.rewards.set(rewardId, reward);

    // Create transaction
    const transaction: PointTransaction = {
      id: this.generateId(),
      customerId,
      type: 'redeem',
      points: -reward.pointCost,
      balance: customer.points,
      description: `Redeemed: ${reward.name}`,
      rewardId,
      createdAt: new Date(),
    };

    this.addTransaction(customerId, transaction);

    // Create redemption
    const redemption: Redemption = {
      id: this.generateId(),
      customerId,
      rewardId,
      pointsSpent: reward.pointCost,
      status: 'confirmed',
      redeemedAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      code: this.generateRedemptionCode(),
    };

    this.redemptions.set(redemption.id, redemption);

    return redemption;
  }

  async expirePoints(customerId: string, points: number, reason: string): Promise<void> {
    const customer = this.customers.get(customerId);
    if (!customer) return;

    customer.points = Math.max(0, customer.points - points);
    this.customers.set(customerId, customer);

    const transaction: PointTransaction = {
      id: this.generateId(),
      customerId,
      type: 'expire',
      points: -points,
      balance: customer.points,
      description: reason,
      createdAt: new Date(),
    };

    this.addTransaction(customerId, transaction);
  }

  // ============================================================================
  // Tier Management
  // ============================================================================

  getTierConfig(tier: TierLevel): TierConfig {
    return this.tierConfigs.find((t) => t.level === tier)!;
  }

  getAllTierConfigs(): TierConfig[] {
    return this.tierConfigs;
  }

  private calculateTier(lifetimePoints: number): TierLevel {
    const sortedTiers = [...this.tierConfigs].sort((a, b) => b.minPoints - a.minPoints);
    
    for (const tier of sortedTiers) {
      if (lifetimePoints >= tier.minPoints) {
        return tier.level;
      }
    }
    
    return 'Bronze';
  }

  async handleTierUpgrade(customerId: string, newTier: TierLevel): Promise<void> {
    const tierConfig = this.getTierConfig(newTier);
    
    // Award tier upgrade bonus
    const bonusPoints = tierConfig.minPoints * 0.1; // 10% of threshold
    
    const customer = this.customers.get(customerId);
    if (customer) {
      customer.points += bonusPoints;
      this.customers.set(customerId, customer);

      const transaction: PointTransaction = {
        id: this.generateId(),
        customerId,
        type: 'bonus',
        points: bonusPoints,
        balance: customer.points,
        description: `Congratulations! Upgraded to ${newTier} tier`,
        createdAt: new Date(),
      };

      this.addTransaction(customerId, transaction);
    }
  }

  // ============================================================================
  // Rewards Management
  // ============================================================================

  async getRewards(filters?: {
    category?: RewardCategory;
    tier?: TierLevel;
    minPoints?: number;
    maxPoints?: number;
    activeOnly?: boolean;
  }): Promise<Reward[]> {
    let rewards = Array.from(this.rewards.values());

    if (filters?.category) {
      rewards = rewards.filter((r) => r.category === filters.category);
    }

    if (filters?.tier) {
      rewards = rewards.filter(
        (r) => !r.tierRestriction || r.tierRestriction.includes(filters.tier!)
      );
    }

    if (filters?.minPoints !== undefined) {
      rewards = rewards.filter((r) => r.pointCost >= filters.minPoints!);
    }

    if (filters?.maxPoints !== undefined) {
      rewards = rewards.filter((r) => r.pointCost <= filters.maxPoints!);
    }

    if (filters?.activeOnly) {
      rewards = rewards.filter((r) => r.isActive && r.stock > 0);
    }

    return rewards.sort((a, b) => a.pointCost - b.pointCost);
  }

  async getReward(rewardId: string): Promise<Reward | null> {
    return this.rewards.get(rewardId) || null;
  }

  // ============================================================================
  // Referral System
  // ============================================================================

  async processReferral(referralCode: string, refereeId: string): Promise<ReferralBonus> {
    // Find referrer by code
    let referrer: CustomerLoyalty | null = null;
    for (const customer of this.customers.values()) {
      if (customer.referralCode === referralCode) {
        referrer = customer;
        break;
      }
    }

    if (!referrer) {
      throw new Error('Invalid referral code');
    }

    if (referrer.customerId === refereeId) {
      throw new Error('Cannot refer yourself');
    }

    // Check if referee already referred
    const existingReferrals = this.referrals.get(refereeId) || [];
    if (existingReferrals.length > 0) {
      throw new Error('Customer already referred');
    }

    const referralBonus: ReferralBonus = {
      referrerId: referrer.customerId,
      refereeId,
      referrerPoints: 500,
      refereePoints: 200,
      status: 'pending',
      createdAt: new Date(),
    };

    // Store referral
    const referrerReferrals = this.referrals.get(referrer.customerId) || [];
    referrerReferrals.push(referralBonus);
    this.referrals.set(referrer.customerId, referrerReferrals);

    const refereeReferrals = this.referrals.get(refereeId) || [];
    refereeReferrals.push(referralBonus);
    this.referrals.set(refereeId, refereeReferrals);

    // Award points to referee immediately
    await this.awardPoints(refereeId, 'profile_complete', {
      description: `Referral bonus from ${referrer.customerId}`,
    });

    return referralBonus;
  }

  async completeReferral(refereeId: string): Promise<void> {
    const referrals = this.referrals.get(refereeId) || [];
    const pendingReferral = referrals.find((r) => r.status === 'pending');

    if (!pendingReferral) return;

    // Award points to referrer
    await this.awardPoints(pendingReferral.referrerId, 'profile_complete', {
      description: `Referral reward: ${refereeId} completed first purchase`,
    });

    // Update referral status
    pendingReferral.status = 'completed';
    pendingReferral.completedAt = new Date();
  }

  // ============================================================================
  // Birthday Rewards
  // ============================================================================

  async awardBirthdayBonus(customerId: string): Promise<void> {
    const customer = this.customers.get(customerId);
    if (!customer) return;

    const _tierConfig = this.getTierConfig(customer.tier);
    let bonusPoints = 100; // Bronze default

    if (customer.tier === 'Silver') bonusPoints = 250;
    else if (customer.tier === 'Gold') bonusPoints = 500;
    else if (customer.tier === 'Platinum') bonusPoints = 1000;

    await this.awardPoints(customerId, 'profile_complete', {
      description: `🎂 Happy Birthday! Enjoy ${bonusPoints} bonus points`,
    });
  }

  // ============================================================================
  // Promotions
  // ============================================================================

  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return Array.from(this.promotions.values()).filter(
      (p) => p.isActive && p.startDate <= now && p.endDate >= now
    );
  }

  async applyPromotion(customerId: string, promotionId: string): Promise<boolean> {
    const promotion = this.promotions.get(promotionId);
    if (!promotion || !promotion.isActive) return false;

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) return false;

    // Check total usage limit
    if (promotion.totalUsageLimit && promotion.currentUsage >= promotion.totalUsageLimit) {
      return false;
    }

    // Award promotion points
    await this.awardPoints(customerId, 'profile_complete', {
      description: promotion.description,
      promotionId,
    });

    // Update usage
    promotion.currentUsage += 1;
    this.promotions.set(promotionId, promotion);

    return true;
  }

  // ============================================================================
  // Transaction History
  // ============================================================================

  getTransactionHistory(customerId: string): PointTransaction[] {
    return this.transactions.get(customerId) || [];
  }

  getCustomerRedemptions(customerId: string, rewardId?: string): Redemption[] {
    const allRedemptions = Array.from(this.redemptions.values());
    let customerRedemptions = allRedemptions.filter((r) => r.customerId === customerId);

    if (rewardId) {
      customerRedemptions = customerRedemptions.filter((r) => r.rewardId === rewardId);
    }

    return customerRedemptions.sort((a, b) => b.redeemedAt.getTime() - a.redeemedAt.getTime());
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private addTransaction(customerId: string, transaction: PointTransaction): void {
    const transactions = this.transactions.get(customerId) || [];
    transactions.push(transaction);
    this.transactions.set(customerId, transactions);
  }

  private calculatePointsExpiry(): Date {
    // Points expire after 1 year
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  private generateReferralCode(customerId: string): string {
    const hash = customerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `REF${hash.toString(36).toUpperCase().substring(0, 6)}`;
  }

  private generateRedemptionCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // ============================================================================
  // Sample Data Initialization
  // ============================================================================

  private initializeSampleRewards(): void {
    const sampleRewards: Reward[] = [
      {
        id: 'reward-1',
        name: '฿100 Discount Voucher',
        description: 'Get ฿100 off your next service',
        category: 'discount',
        pointCost: 500,
        value: 100,
        stock: 100,
        imageUrl: '/rewards/voucher-100.jpg',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        id: 'reward-2',
        name: '฿500 Discount Voucher',
        description: 'Get ฿500 off your next service',
        category: 'discount',
        pointCost: 2000,
        value: 500,
        stock: 50,
        imageUrl: '/rewards/voucher-500.jpg',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
        tierRestriction: ['Silver', 'Gold', 'Platinum'],
      },
      {
        id: 'reward-3',
        name: 'Free Facial Treatment',
        description: 'Complimentary facial treatment (worth ฿1,500)',
        category: 'service',
        pointCost: 3000,
        value: 1500,
        stock: 20,
        imageUrl: '/rewards/facial.jpg',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
        tierRestriction: ['Gold', 'Platinum'],
        maxRedemptionsPerCustomer: 2,
      },
      {
        id: 'reward-4',
        name: 'Premium Skincare Set',
        description: 'Exclusive skincare product bundle',
        category: 'product',
        pointCost: 5000,
        value: 3000,
        stock: 10,
        imageUrl: '/rewards/skincare-set.jpg',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
        tierRestriction: ['Platinum'],
        maxRedemptionsPerCustomer: 1,
      },
      {
        id: 'reward-5',
        name: 'VIP Annual Membership',
        description: '1-year VIP membership with exclusive benefits',
        category: 'special',
        pointCost: 10000,
        value: 10000,
        stock: 5,
        imageUrl: '/rewards/vip-membership.jpg',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
        tierRestriction: ['Platinum'],
        maxRedemptionsPerCustomer: 1,
      },
    ];

    sampleRewards.forEach((reward) => {
      this.rewards.set(reward.id, reward);
    });
  }

  private initializeSamplePromotions(): void {
    const samplePromotions: Promotion[] = [
      {
        id: 'promo-1',
        name: 'Double Points Weekend',
        description: 'Earn 2x points on all services this weekend',
        type: 'seasonal',
        pointsAwarded: 0,
        multiplier: 2.0,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalUsageLimit: 1000,
        currentUsage: 0,
      },
      {
        id: 'promo-2',
        name: 'New Year Bonus',
        description: 'Get 500 bonus points',
        type: 'seasonal',
        pointsAwarded: 500,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxUsesPerCustomer: 1,
        totalUsageLimit: 500,
        currentUsage: 0,
      },
    ];

    samplePromotions.forEach((promo) => {
      this.promotions.set(promo.id, promo);
    });
  }
}

export default LoyaltyEngine;
