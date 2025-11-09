/**
 * Benchmark API Endpoint
 * Phase 2 Week 5 Task 5.1
 * 
 * GET /api/analytics/benchmark?customerId=xxx&ageGroup=30-39
 * 
 * Returns benchmark comparison with age group averages
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  calculateBenchmark,
  determineAgeGroup,
  calculateMetricPercentile,
} from '@/lib/analytics/benchmark-calculator';
import { AgeGroup, BenchmarkResponse, MetricType } from '@/types/analytics';

// =============================================
// GET Handler
// =============================================

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const ageGroupParam = searchParams.get('ageGroup') as AgeGroup | null;
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    // Validate customer ID
    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing required parameter: customerId' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user can only access their own data (or admin)
    if (user.id !== customerId) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Calculate benchmark
    const benchmark = await calculateBenchmark(customerId, ageGroupParam || undefined);

    if (!benchmark) {
      return NextResponse.json(
        { error: 'Insufficient data to calculate benchmark' },
        { status: 404 }
      );
    }

    // Optionally include metric-specific percentiles
    if (includeMetrics) {
      const metricPercentiles: Record<MetricType, number> = {
        overall: benchmark.percentile,
        spots: await calculateMetricPercentile(customerId, benchmark.ageGroup, 'spots'),
        wrinkles: await calculateMetricPercentile(
          customerId,
          benchmark.ageGroup,
          'wrinkles'
        ),
        texture: await calculateMetricPercentile(customerId, benchmark.ageGroup, 'texture'),
        pores: await calculateMetricPercentile(customerId, benchmark.ageGroup, 'pores'),
        hydration: await calculateMetricPercentile(
          customerId,
          benchmark.ageGroup,
          'hydration'
        ),
      };

      const extendedResponse = {
        ...benchmark,
        metricPercentiles,
      };

      return NextResponse.json(extendedResponse, {
        headers: {
          'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
        },
      });
    }

    // Return standard benchmark response
    return NextResponse.json(benchmark, {
      headers: {
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Unexpected error in benchmark API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// OPTIONS Handler (CORS)
// =============================================

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
