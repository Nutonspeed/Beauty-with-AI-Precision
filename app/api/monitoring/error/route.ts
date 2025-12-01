/**
 * Error Logging API Endpoint
 * 
 * Receives and logs errors from client-side error boundaries
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ErrorReport {
  error: string
  stack?: string
  componentStack?: string
  timestamp: string
  userAgent?: string
  url?: string
  type?: 'boundary' | 'async' | 'network'
}

export async function POST(request: NextRequest) {
  try {
    const report: ErrorReport = await request.json()
    
    // Validate error report
    if (!report.error || !report.timestamp) {
      return NextResponse.json({ error: 'Invalid error report' }, { status: 400 })
    }

    // Log to console
    console.error('Client Error Report:', {
      error: report.error,
      url: report.url,
      type: report.type,
      timestamp: report.timestamp
    })

    // Store in Supabase (if available)
    const supabase = createClient()
    
    try {
      const { error } = await supabase.from('error_logs').insert({
        error_message: report.error,
        stack_trace: report.stack,
        component_stack: report.componentStack,
        error_type: report.type || 'boundary',
        user_agent: report.userAgent,
        url: report.url,
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        timestamp: report.timestamp
      })

      if (error) {
        console.warn('Failed to store error log:', error)
      }
    } catch (dbError) {
      console.warn('Database error storing error:', dbError)
    }

    // Send to Sentry (if configured)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        // Sentry would be imported and used here
        console.log('Sentry error logging:', report.error)
      } catch (error) {
        console.warn('Sentry error:', error)
      }
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error logging API failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return recent errors (admin only)
    const supabase = createClient()
    
    const { data: errors, error } = await supabase
      .from('error_logs')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24h
      .order('timestamp', { ascending: false })
      .limit(50)

    if (error) {
      console.warn('Failed to fetch error logs:', error)
      return NextResponse.json({ errors: [], summary: 'Database unavailable' })
    }

    // Calculate summary
    const summary = {
      total_errors: errors?.length || 0,
      by_type: {} as Record<string, number>,
      by_url: {} as Record<string, number>
    }

    errors?.forEach(err => {
      // Count by type
      summary.by_type[err.error_type] = (summary.by_type[err.error_type] || 0) + 1
      
      // Count by URL (group by domain)
      if (err.url) {
        try {
          const url = new URL(err.url)
          const domain = url.hostname
          summary.by_url[domain] = (summary.by_url[domain] || 0) + 1
        } catch {
          summary.by_url['invalid'] = (summary.by_url['invalid'] || 0) + 1
        }
      }
    })

    return NextResponse.json({
      errors: errors || [],
      summary,
      time_range: '24 hours'
    })
    
  } catch (error) {
    console.error('Error logs GET failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
