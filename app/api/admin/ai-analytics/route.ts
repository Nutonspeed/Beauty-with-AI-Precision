import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await cookies();
    const supabase = await createClient();

    // Verify user is super admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get total analyses count
    const { count: totalAnalyses } = await supabase
      .from('skin_analyses')
      .select('*', { count: 'exact', head: true });

    // Get analyses this month
    const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
    const { count: analysesThisMonth } = await supabase
      .from('skin_analyses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    // Get analyses last month for comparison
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
    const endOfLastMonth = new Date(currentYear, currentMonth, 0).toISOString();
    const { count: analysesLastMonth } = await supabase
      .from('skin_analyses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth);

    // Calculate month-over-month growth
    const momGrowth = analysesLastMonth && analysesLastMonth > 0
      ? Number((((analysesThisMonth || 0) - analysesLastMonth) / analysesLastMonth * 100).toFixed(1))
      : 0;

    // Get monthly trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthStart = monthDate.toISOString();
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0, 23, 59, 59).toISOString();

      const { count } = await supabase
        .from('skin_analyses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd);

      monthlyTrend.push({
        month: monthDate.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
        count: count || 0,
      });
    }

    // Get skin type distribution
    const { data: skinTypeData } = await supabase
      .from('skin_analyses')
      .select('skin_type');

    const skinTypeDistribution: Record<string, number> = {};
    skinTypeData?.forEach((item) => {
      const type = item.skin_type || 'Unknown';
      skinTypeDistribution[type] = (skinTypeDistribution[type] || 0) + 1;
    });

    // Get average overall score
    const { data: scoreData } = await supabase
      .from('skin_analyses')
      .select('overall_score')
      .not('overall_score', 'is', null);

    const avgOverallScore = scoreData && scoreData.length > 0
      ? Number((scoreData.reduce((sum, item) => sum + (item.overall_score || 0), 0) / scoreData.length).toFixed(1))
      : 0;

    // Get score distribution
    const scoreDistribution = {
      excellent: 0, // 80-100
      good: 0,      // 60-79
      fair: 0,      // 40-59
      poor: 0,      // 0-39
    };

    scoreData?.forEach((item) => {
      const score = item.overall_score || 0;
      if (score >= 80) scoreDistribution.excellent++;
      else if (score >= 60) scoreDistribution.good++;
      else if (score >= 40) scoreDistribution.fair++;
      else scoreDistribution.poor++;
    });

    // Get top clinics by analysis count
    const { data: clinicAnalyses } = await supabase
      .from('skin_analyses')
      .select('clinic_id');

    const clinicCounts: Record<string, number> = {};
    clinicAnalyses?.forEach((item) => {
      if (item.clinic_id) {
        clinicCounts[item.clinic_id] = (clinicCounts[item.clinic_id] || 0) + 1;
      }
    });

    // Get clinic names for top clinics
    const topClinicIds = Object.entries(clinicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const { data: topClinicsData } = await supabase
      .from('clinics')
      .select('id, name')
      .in('id', topClinicIds);

    const topClinics = topClinicIds.map((id) => {
      const clinic = topClinicsData?.find((c) => c.id === id);
      return {
        id,
        name: clinic?.name || 'Unknown Clinic',
        analysisCount: clinicCounts[id],
      };
    });

    // Get daily trend (last 30 days)
    const dailyTrend = [];
    for (let i = 29; i >= 0; i--) {
      const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(dayDate.setHours(0, 0, 0, 0)).toISOString();
      const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999)).toISOString();

      const { count } = await supabase
        .from('skin_analyses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayStart)
        .lte('created_at', dayEnd);

      dailyTrend.push({
        date: dayDate.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
        count: count || 0,
      });
    }

    // Get recent analyses
    const { data: recentAnalyses } = await supabase
      .from('skin_analyses')
      .select(`
        id,
        user_id,
        clinic_id,
        skin_type,
        overall_score,
        created_at,
        clinics(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate analyses per day average (last 30 days)
    const totalLast30Days = dailyTrend.reduce((sum, day) => sum + day.count, 0);
    const avgPerDay = Number((totalLast30Days / 30).toFixed(1));

    // Get unique users who have done analyses
    const { data: uniqueUsers } = await supabase
      .from('skin_analyses')
      .select('user_id')
      .not('user_id', 'is', null);

    const uniqueUserCount = new Set(uniqueUsers?.map((u) => u.user_id)).size;

    return NextResponse.json({
      overview: {
        totalAnalyses: totalAnalyses || 0,
        analysesThisMonth: analysesThisMonth || 0,
        analysesLastMonth: analysesLastMonth || 0,
        momGrowth,
        avgPerDay,
        avgOverallScore,
        uniqueUsers: uniqueUserCount,
      },
      monthlyTrend,
      dailyTrend,
      skinTypeDistribution: Object.entries(skinTypeDistribution).map(([type, count]) => ({
        type,
        count,
        percentage: Number(((count / (totalAnalyses || 1)) * 100).toFixed(1)),
      })),
      scoreDistribution,
      topClinics,
      recentAnalyses: recentAnalyses?.map((a) => ({
        id: a.id,
        clinicName: (a.clinics as any)?.name || 'Unknown',
        skinType: a.skin_type || 'Unknown',
        overallScore: a.overall_score || 0,
        createdAt: a.created_at,
      })) || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI analytics' },
      { status: 500 }
    );
  }
}
