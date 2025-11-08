'use client';

/**
 * Loyalty System Hooks
 * React hooks for loyalty program integration
 */

import { useState, useEffect, useCallback } from 'react';
import {
  LoyaltyEngine,
  CustomerLoyalty,
  TierConfig,
  Reward,
  PointTransaction,
  Redemption,
  Promotion,
  ReferralBonus,
  TierLevel,
  RewardCategory,
} from '@/lib/loyalty/loyalty-engine';

const loyaltyEngine = LoyaltyEngine.getInstance();

// ============================================================================
// useLoyalty - Main loyalty hook for customer data
// ============================================================================

interface UseLoyaltyState {
  customer: CustomerLoyalty | null;
  loading: boolean;
  error: string | null;
}

export function useLoyalty(customerId?: string) {
  const [state, setState] = useState<UseLoyaltyState>({
    customer: null,
    loading: false,
    error: null,
  });

  const fetchCustomerLoyalty = useCallback(async () => {
    if (!customerId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const customer = await loyaltyEngine.getCustomerLoyalty(customerId);
      setState({ customer, loading: false, error: null });
    } catch (error) {
      setState({
        customer: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch loyalty data',
      });
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerLoyalty();
  }, [fetchCustomerLoyalty]);

  const enroll = useCallback(async (userId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const customer = await loyaltyEngine.enrollCustomer(userId);
      setState({ customer, loading: false, error: null });
      return customer;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to enroll',
      }));
      throw error;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchCustomerLoyalty();
  }, [fetchCustomerLoyalty]);

  return {
    customer: state.customer,
    loading: state.loading,
    error: state.error,
    enroll,
    refresh,
  };
}

// ============================================================================
// useTiers - Tier configuration and management
// ============================================================================

export function useTiers() {
  const [tiers, setTiers] = useState<TierConfig[]>([]);

  useEffect(() => {
    const tierConfigs = loyaltyEngine.getAllTierConfigs();
    setTiers(tierConfigs);
  }, []);

  const getTierConfig = useCallback((tier: TierLevel): TierConfig | undefined => {
    return tiers.find((t) => t.level === tier);
  }, [tiers]);

  const getNextTier = useCallback((currentTier: TierLevel): TierConfig | null => {
    const currentIndex = tiers.findIndex((t) => t.level === currentTier);
    if (currentIndex === -1 || currentIndex === tiers.length - 1) return null;
    return tiers[currentIndex + 1];
  }, [tiers]);

  const getProgressToNextTier = useCallback(
    (lifetimePoints: number, currentTier: TierLevel): number => {
      const nextTier = getNextTier(currentTier);
      if (!nextTier) return 100; // Already at max tier

      const currentTierConfig = getTierConfig(currentTier);
      if (!currentTierConfig) return 0;

      const pointsInCurrentTier = lifetimePoints - currentTierConfig.minPoints;
      const pointsNeeded = nextTier.minPoints - currentTierConfig.minPoints;
      
      return Math.min(100, (pointsInCurrentTier / pointsNeeded) * 100);
    },
    [getNextTier, getTierConfig]
  );

  return {
    tiers,
    getTierConfig,
    getNextTier,
    getProgressToNextTier,
  };
}

// ============================================================================
// useRewards - Rewards catalog and redemption
// ============================================================================

interface UseRewardsState {
  rewards: Reward[];
  loading: boolean;
  error: string | null;
}

export function useRewards(filters?: {
  category?: RewardCategory;
  tier?: TierLevel;
  minPoints?: number;
  maxPoints?: number;
  activeOnly?: boolean;
}) {
  const [state, setState] = useState<UseRewardsState>({
    rewards: [],
    loading: false,
    error: null,
  });

  const fetchRewards = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const rewards = await loyaltyEngine.getRewards(filters);
      setState({ rewards, loading: false, error: null });
    } catch (error) {
      setState({
        rewards: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch rewards',
      });
    }
  }, [filters]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const redeemReward = useCallback(async (customerId: string, rewardId: string) => {
    try {
      const redemption = await loyaltyEngine.redeemPoints(customerId, rewardId);
      await fetchRewards(); // Refresh to update stock
      return redemption;
    } catch (error) {
      throw error;
    }
  }, [fetchRewards]);

  const getReward = useCallback(async (rewardId: string) => {
    return await loyaltyEngine.getReward(rewardId);
  }, []);

  return {
    rewards: state.rewards,
    loading: state.loading,
    error: state.error,
    redeemReward,
    getReward,
    refresh: fetchRewards,
  };
}

// ============================================================================
// usePoints - Points earning and management
// ============================================================================

interface UsePointsState {
  loading: boolean;
  error: string | null;
}

export function usePoints(customerId?: string) {
  const [state, setState] = useState<UsePointsState>({
    loading: false,
    error: null,
  });

  const awardPoints = useCallback(
    async (
      action: string,
      metadata?: {
        amount?: number;
        description?: string;
        reference?: string;
        promotionId?: string;
      }
    ) => {
      if (!customerId) {
        throw new Error('Customer ID required');
      }

      setState({ loading: true, error: null });

      try {
        const transaction = await loyaltyEngine.awardPoints(customerId, action, metadata);
        setState({ loading: false, error: null });
        return transaction;
      } catch (error) {
        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to award points',
        });
        throw error;
      }
    },
    [customerId]
  );

  return {
    awardPoints,
    loading: state.loading,
    error: state.error,
  };
}

// ============================================================================
// useTransactions - Transaction history
// ============================================================================

interface UseTransactionsState {
  transactions: PointTransaction[];
  loading: boolean;
  error: string | null;
}

export function useTransactions(customerId?: string) {
  const [state, setState] = useState<UseTransactionsState>({
    transactions: [],
    loading: false,
    error: null,
  });

  const fetchTransactions = useCallback(() => {
    if (!customerId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const transactions = loyaltyEngine.getTransactionHistory(customerId);
      setState({ transactions, loading: false, error: null });
    } catch (error) {
      setState({
        transactions: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
      });
    }
  }, [customerId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    refresh: fetchTransactions,
  };
}

// ============================================================================
// useRedemptions - Redemption history
// ============================================================================

interface UseRedemptionsState {
  redemptions: Redemption[];
  loading: boolean;
  error: string | null;
}

export function useRedemptions(customerId?: string, rewardId?: string) {
  const [state, setState] = useState<UseRedemptionsState>({
    redemptions: [],
    loading: false,
    error: null,
  });

  const fetchRedemptions = useCallback(() => {
    if (!customerId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const redemptions = loyaltyEngine.getCustomerRedemptions(customerId, rewardId);
      setState({ redemptions, loading: false, error: null });
    } catch (error) {
      setState({
        redemptions: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch redemptions',
      });
    }
  }, [customerId, rewardId]);

  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);

  return {
    redemptions: state.redemptions,
    loading: state.loading,
    error: state.error,
    refresh: fetchRedemptions,
  };
}

// ============================================================================
// usePromotions - Active promotions
// ============================================================================

interface UsePromotionsState {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
}

export function usePromotions() {
  const [state, setState] = useState<UsePromotionsState>({
    promotions: [],
    loading: false,
    error: null,
  });

  const fetchPromotions = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const promotions = await loyaltyEngine.getActivePromotions();
      setState({ promotions, loading: false, error: null });
    } catch (error) {
      setState({
        promotions: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch promotions',
      });
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const applyPromotion = useCallback(
    async (customerId: string, promotionId: string) => {
      try {
        const result = await loyaltyEngine.applyPromotion(customerId, promotionId);
        await fetchPromotions(); // Refresh to update usage
        return result;
      } catch (error) {
        throw error;
      }
    },
    [fetchPromotions]
  );

  return {
    promotions: state.promotions,
    loading: state.loading,
    error: state.error,
    applyPromotion,
    refresh: fetchPromotions,
  };
}

// ============================================================================
// useReferral - Referral system
// ============================================================================

interface UseReferralState {
  loading: boolean;
  error: string | null;
}

export function useReferral() {
  const [state, setState] = useState<UseReferralState>({
    loading: false,
    error: null,
  });

  const processReferral = useCallback(
    async (referralCode: string, refereeId: string): Promise<ReferralBonus> => {
      setState({ loading: true, error: null });

      try {
        const referral = await loyaltyEngine.processReferral(referralCode, refereeId);
        setState({ loading: false, error: null });
        return referral;
      } catch (error) {
        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to process referral',
        });
        throw error;
      }
    },
    []
  );

  const completeReferral = useCallback(async (refereeId: string) => {
    setState({ loading: true, error: null });

    try {
      await loyaltyEngine.completeReferral(refereeId);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to complete referral',
      });
      throw error;
    }
  }, []);

  return {
    processReferral,
    completeReferral,
    loading: state.loading,
    error: state.error,
  };
}

// ============================================================================
// useBirthdayRewards - Birthday bonus management
// ============================================================================

export function useBirthdayRewards() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const awardBirthdayBonus = useCallback(async (customerId: string) => {
    setLoading(true);
    setError(null);

    try {
      await loyaltyEngine.awardBirthdayBonus(customerId);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to award birthday bonus');
      setLoading(false);
      throw error;
    }
  }, []);

  return {
    awardBirthdayBonus,
    loading,
    error,
  };
}
