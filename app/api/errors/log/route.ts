/**
 * Error Logging API Endpoint
 * Receives and stores error logs from client-side
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  severity?: 'error' | 'warning' | 'info';
  context?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  // Rate limit: 20 error reports per minute per IP
  const clientIp = getClientIp(request.headers);
  const rateLimit = checkRateLimit(clientIp, {
    limit: 20,
    window: 60 * 1000, // 1 minute
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'RATE_LIMIT_EXCEEDED', 
          message: 'Too many error reports. Please try again later.' 
        } 
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
          'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const errorLog: ErrorLog = await request.json();

    // Validate required fields
    if (!errorLog.message || !errorLog.timestamp) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Get Supabase client
  const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get authenticated user (if any)
    const { data: { user } } = await supabase.auth.getUser();

    // Prepare error log data
    const logData = {
      user_id: user?.id || null,
      error_message: errorLog.message,
      error_stack: errorLog.stack || null,
      component_stack: errorLog.componentStack || null,
      url: errorLog.url,
      user_agent: errorLog.userAgent,
      severity: errorLog.severity || 'error',
      context: errorLog.context || {},
      created_at: new Date(errorLog.timestamp).toISOString(),
    };

    // Insert into database
    const { error: dbError } = await supabase
      .from('error_logs')
      .insert(logData);

    if (dbError) {
      console.error('Failed to insert error log:', dbError);
      // Don't fail the request if database insert fails
      // Just log to console and continue
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Client Error Logged:', {
        message: errorLog.message,
        url: errorLog.url,
        timestamp: errorLog.timestamp,
        userId: user?.id || 'anonymous',
      });
    }

    // Send to external monitoring service (e.g., Sentry)
    if (process.env.SENTRY_DSN) {
      // This would integrate with Sentry SDK
      // For now, just prepare the data
      const sentryData = {
        message: errorLog.message,
        level: errorLog.severity || 'error',
        extra: {
          url: errorLog.url,
          userAgent: errorLog.userAgent,
          componentStack: errorLog.componentStack,
          context: errorLog.context,
        },
        tags: {
          userId: user?.id || 'anonymous',
        },
      };

      // TODO: Send to Sentry
      console.log('Would send to Sentry:', sentryData);
    }

    return NextResponse.json({
      success: true,
      data: {
        logged: true,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error in error logging endpoint:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve error logs (admin only)
export async function GET(request: NextRequest) {
  try {
  const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['super_admin', 'clinic_admin'].includes(profile.role)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const severity = searchParams.get('severity');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    let query = supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: logs, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    // Get error statistics
    const { data: stats } = await supabase
      .from('error_logs')
      .select('severity')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const errorStats = {
      total: logs?.length || 0,
      last24h: stats?.length || 0,
      bySeverity: {
        error: stats?.filter(s => s.severity === 'error').length || 0,
        warning: stats?.filter(s => s.severity === 'warning').length || 0,
        info: stats?.filter(s => s.severity === 'info').length || 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        logs: logs || [],
        stats: errorStats,
      },
    });

  } catch (error) {
    console.error('Error fetching error logs:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      },
      { status: 500 }
    );
  }
}
