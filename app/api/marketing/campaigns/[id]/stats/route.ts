import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/marketing/campaigns/[id]/stats
 * Get campaign performance statistics for beauty clinic
 * 
 * Returns:
 * - Campaign details with metrics
 * - Promo code usage statistics
 * - ROI calculations
 * - Customer conversion rates
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Get campaign data
    const { data: campaign, error: campaignError } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('id', params.id)
      .single();

    if (campaignError) throw campaignError;

    // Get promo code usage for this campaign
    const { data: promoCodes, error: promoError } = await supabase
      .from('promo_codes')
      .select(`
        id,
        code,
        current_total_uses,
        max_total_uses,
        promo_code_usage(
          id,
          discount_amount,
          final_amount,
          status
        )
      `)
      .eq('campaign_id', params.id);

    if (promoError) throw promoError;

    // Calculate statistics
    const totalUsage = promoCodes?.reduce((sum: number, code: any) => 
      sum + (code.current_total_uses || 0), 0) || 0;
    
    const totalDiscountGiven = promoCodes?.reduce((sum: number, code: any) => {
      const usages = (code as any).promo_code_usage || [];
      return sum + usages
        .filter((u: any) => u.status === 'applied')
        .reduce((s: number, u: any) => s + Number.parseFloat(u.discount_amount || 0), 0);
    }, 0) || 0;

    const totalRevenue = promoCodes?.reduce((sum: number, code: any) => {
      const usages = (code as any).promo_code_usage || [];
      return sum + usages
        .filter((u: any) => u.status === 'applied')
        .reduce((s: number, u: any) => s + Number.parseFloat(u.final_amount || 0), 0);
    }, 0) || 0;

    const conversionRate = campaign.reached_customers > 0
      ? (campaign.converted_customers / campaign.reached_customers) * 100
      : 0;

    const roi = campaign.spent_budget > 0
      ? ((totalRevenue - campaign.spent_budget) / campaign.spent_budget) * 100
      : 0;

    const stats = {
      campaign: {
        id: campaign.id,
        campaign_name: campaign.campaign_name,
        campaign_code: campaign.campaign_code,
        status: campaign.status,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
      },
      metrics: {
        target_customers: campaign.target_customers || 0,
        reached_customers: campaign.reached_customers || 0,
        converted_customers: campaign.converted_customers || 0,
        conversion_rate: Number.parseFloat(conversionRate.toFixed(2)),
      },
      financial: {
        total_budget: Number.parseFloat(campaign.total_budget || 0),
        spent_budget: Number.parseFloat(campaign.spent_budget || 0),
        total_discount_given: Number.parseFloat(totalDiscountGiven.toFixed(2)),
        total_revenue: Number.parseFloat(totalRevenue.toFixed(2)),
        roi: Number.parseFloat(roi.toFixed(2)),
      },
      promo_codes: {
        total_codes: promoCodes?.length || 0,
        total_usage: totalUsage,
        codes: promoCodes?.map((code: any) => ({
          code: code.code,
          usage: code.current_total_uses || 0,
          limit: code.max_total_uses,
          usage_percentage: code.max_total_uses 
            ? ((code.current_total_uses || 0) / code.max_total_uses * 100).toFixed(2)
            : null,
        })),
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign statistics' },
      { status: 500 }
    );
  }
}
