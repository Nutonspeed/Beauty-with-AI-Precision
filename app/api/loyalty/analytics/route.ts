import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/loyalty/analytics
 * Get loyalty program analytics for beauty clinic
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - date_from (optional): Start date
 * - date_to (optional): End date
 */
export const GET = withClinicAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    // Get tier distribution
    const { data: tierDistribution } = await supabase
      .from('customer_loyalty_accounts')
      .select('current_tier_id, loyalty_tiers(tier_name, tier_level)')
      .eq('clinic_id', clinic_id)
      .eq('is_active', true);

    const tierCounts = (tierDistribution || []).reduce((acc: Record<string, any>, account: any) => {
      const tierName = account.loyalty_tiers?.tier_name || 'No Tier';
      if (!acc[tierName]) {
        acc[tierName] = { count: 0, tier_level: account.loyalty_tiers?.tier_level || 0 };
      }
      acc[tierName].count += 1;
      return acc;
    }, {});

    // Get total active members
    const { count: totalMembers } = await supabase
      .from('customer_loyalty_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinic_id)
      .eq('is_active', true);

    // Get points transactions summary
    let pointsQuery = supabase
      .from('points_transactions')
      .select('transaction_type, points_amount, status')
      .eq('clinic_id', clinic_id);

    if (date_from) {
      pointsQuery = pointsQuery.gte('created_at', date_from);
    }

    if (date_to) {
      pointsQuery = pointsQuery.lte('created_at', date_to);
    }

    const { data: pointsTransactions } = await pointsQuery;

    const pointsEarned = (pointsTransactions || [])
      .filter((tx: any) => tx.transaction_type === 'earned' && tx.status === 'active')
      .reduce((sum: number, tx: any) => sum + (tx.points_amount || 0), 0);

    const pointsRedeemed = (pointsTransactions || [])
      .filter((tx: any) => tx.transaction_type === 'redeemed')
      .reduce((sum: number, tx: any) => sum + Math.abs(tx.points_amount || 0), 0);

    const pointsExpired = (pointsTransactions || [])
      .filter((tx: any) => tx.status === 'expired')
      .reduce((sum: number, tx: any) => sum + Math.abs(tx.points_amount || 0), 0);

    // Get redemptions summary
    let redemptionsQuery = supabase
      .from('rewards_redemptions')
      .select('status, points_used')
      .eq('clinic_id', clinic_id);

    if (date_from) {
      redemptionsQuery = redemptionsQuery.gte('redeemed_at', date_from);
    }

    if (date_to) {
      redemptionsQuery = redemptionsQuery.lte('redeemed_at', date_to);
    }

    const { data: redemptions } = await redemptionsQuery;

    const totalRedemptions = (redemptions || []).length;
    const pendingRedemptions = (redemptions || []).filter((r: any) => r.status === 'pending').length;
    const completedRedemptions = (redemptions || []).filter((r: any) => r.status === 'used').length;

    // Get top customers by points
    const { data: topCustomers } = await supabase
      .from('customer_loyalty_accounts')
      .select(`
        customer_id,
        available_points,
        lifetime_points_earned,
        users!customer_loyalty_accounts_customer_id_fkey(full_name, email),
        loyalty_tiers(tier_name, tier_level)
      `)
      .eq('clinic_id', clinic_id)
      .eq('is_active', true)
      .order('lifetime_points_earned', { ascending: false })
      .limit(10);

    // Get popular rewards
    const { data: popularRewards } = await supabase
      .from('rewards_redemptions')
      .select(`
        reward_id,
        rewards_catalog(reward_name, reward_type)
      `)
      .eq('clinic_id', clinic_id)
      .gte('redeemed_at', date_from || '2020-01-01');

    const rewardCounts = (popularRewards || []).reduce((acc: Record<string, any>, redemption: any) => {
      const rewardName = redemption.rewards_catalog?.reward_name || 'Unknown';
      if (!acc[rewardName]) {
        acc[rewardName] = {
          count: 0,
          reward_type: redemption.rewards_catalog?.reward_type,
        };
      }
      acc[rewardName].count += 1;
      return acc;
    }, {});

    const popularRewardsList = Object.entries(rewardCounts)
      .map(([name, data]: [string, any]) => ({ reward_name: name, redemption_count: data.count, reward_type: data.reward_type }))
      .sort((a, b) => b.redemption_count - a.redemption_count)
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        total_members: totalMembers || 0,
        points_earned: pointsEarned,
        points_redeemed: pointsRedeemed,
        points_expired: pointsExpired,
        total_redemptions: totalRedemptions,
        pending_redemptions: pendingRedemptions,
        completed_redemptions: completedRedemptions,
      },
      tier_distribution: tierCounts,
      top_customers: topCustomers || [],
      popular_rewards: popularRewardsList,
    });
  } catch (error) {
    console.error('Error fetching loyalty analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty analytics' },
      { status: 500 }
    );
  }
})
