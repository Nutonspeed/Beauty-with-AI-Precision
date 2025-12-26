import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Call health check function
    const { data, error } = await supabase.rpc('check_database_health');

    if (error) {
      console.error('Health check error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to check database health',
          details: error.message 
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No health data returned' },
        { status: 500 }
      );
    }

    // Add HTTP status based on health
    const httpStatus = data.health_status === 'healthy' ? 200 : 503;

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        health: data,
      },
      { 
        status: httpStatus,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
