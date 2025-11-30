/**
 * API Endpoint: Performance Analytics
 * Store and retrieve performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface PerformanceData {
  type?: string;
  metrics?: PerformanceMetric[];
  duration?: number;
  endpoint?: string;
  page?: string;
  loadTime?: number;
  url: string;
  userAgent?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

/**
 * POST - Log performance metrics
 */
export async function POST(request: NextRequest) {
  try {
    const data: PerformanceData = await request.json();

    // Validate required fields
    if (!data.url || !data.timestamp) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: url, timestamp',
          },
        },
        { status: 400 }
      );
    }

    // Create Supabase client with cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach((cookie) => cookieStore.set(cookie));
          },
        },
      }
    );

    // Get authenticated user (if any)
    const { data: { user } } = await supabase.auth.getUser();

    // Prepare data for database
    const perfData = {
      user_id: user?.id || null,
      metric_type: data.type || 'unknown',
      metric_name: data.metrics?.[0]?.name || null,
      metric_value: data.metrics?.[0]?.value || data.duration || data.loadTime || 0,
      metric_rating: data.metrics?.[0]?.rating || null,
      page_url: data.url,
      page_name: data.page || null,
      endpoint: data.endpoint || null,
      user_agent: data.userAgent || request.headers.get('user-agent') || null,
      context: data.context || {},
      created_at: data.timestamp,
    };

    // Store in database
    try {
      const { error: dbError } = await supabase
        .from('performance_metrics')
        .insert(perfData);

      if (dbError) {
        console.error('Failed to store performance metric:', dbError);
        // Continue even if DB insert fails
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB insert fails
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance metric:', {
        type: data.type,
        value: perfData.metric_value,
        page: data.page || data.url,
      });
    }

    // Check for performance issues and log alerts
    // Note: External monitoring (Sentry, DataDog) can be added when API keys are configured
    if (data.type === 'long-task' && data.duration && data.duration > 500) {
      console.warn('⚠️ Critical long task detected:', data.duration, 'ms');
      // Alerts are logged to console - connect to Sentry/DataDog for production alerts
    }

    if (data.type === 'slow-api' && data.duration && data.duration > 5000) {
      console.warn('⚠️ Critical slow API detected:', data.endpoint, data.duration, 'ms');
      // Alerts are logged to console - connect to Sentry/DataDog for production alerts
    }

    if (data.metrics) {
      const poorMetrics = data.metrics.filter(m => m.rating === 'poor');
      if (poorMetrics.length > 0) {
        console.warn('⚠️ Poor performance metrics detected:', poorMetrics);
        // Alerts are logged to console - connect to Sentry/DataDog for production alerts
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        logged: true,
        timestamp: data.timestamp,
      },
    });
  } catch (error) {
    console.error('Performance logging error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve performance metrics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach((cookie) => cookieStore.set(cookie));
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Check user role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['super_admin', 'clinic_admin'].includes(profile.role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const metricType = searchParams.get('type');
    const page = searchParams.get('page');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    if (page) {
      query = query.eq('page_name', page);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: metrics, error: metricsError } = await query;

    if (metricsError) {
      throw metricsError;
    }

    // Calculate statistics
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentMetrics } = await supabase
      .from('performance_metrics')
      .select('metric_type, metric_rating, metric_value')
      .gte('created_at', last24h);

    const stats = {
      total: metrics?.length || 0,
      last24h: recentMetrics?.length || 0,
      byType: {} as Record<string, number>,
      byRating: {
        good: 0,
        'needs-improvement': 0,
        poor: 0,
      },
      averageValues: {} as Record<string, number>,
    };

    if (recentMetrics) {
      recentMetrics.forEach((metric) => {
        // Count by type
        stats.byType[metric.metric_type] = (stats.byType[metric.metric_type] || 0) + 1;

        // Count by rating
        if (metric.metric_rating) {
          stats.byRating[metric.metric_rating as keyof typeof stats.byRating]++;
        }
      });

      // Calculate average values by type
      const valuesByType: Record<string, number[]> = {};
      recentMetrics.forEach((metric) => {
        if (!valuesByType[metric.metric_type]) {
          valuesByType[metric.metric_type] = [];
        }
        valuesByType[metric.metric_type].push(metric.metric_value);
      });

      Object.entries(valuesByType).forEach(([type, values]) => {
        stats.averageValues[type] = values.reduce((a, b) => a + b, 0) / values.length;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        stats,
      },
    });
  } catch (error) {
    console.error('Performance retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
