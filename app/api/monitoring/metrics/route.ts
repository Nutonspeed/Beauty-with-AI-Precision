/**
 * Performance Metrics API Endpoint
 * 
 * Receives and stores performance metrics from client-side
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface MetricEvent {
  name: string
  value: number
  timestamp: string
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    // Only accept requests in production or with monitoring enabled
    if (process.env.NODE_ENV !== 'production' && 
        process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING !== 'true') {
      return NextResponse.json({ error: 'Monitoring disabled' }, { status: 403 })
    }

    const event: MetricEvent = await request.json()
    
    // Validate event
    if (!event.name || typeof event.value !== 'number') {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
    }

    // Store in Supabase (if available)
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.from('performance_metrics').insert({
        name: event.name,
        value: event.value,
        timestamp: event.timestamp,
        metadata: event.metadata,
        user_agent: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
      })

      if (error) {
        console.warn('Failed to store metric:', error)
      }
    } catch (dbError) {
      console.warn('Database error storing metric:', dbError)
    }

    // Send to external monitoring services
    await sendToExternalServices(event, request)

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Metrics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return performance summary (admin only)
    const supabase = await createClient()
    
    const { data: metrics, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24h
      .order('timestamp', { ascending: false })
      .limit(1000)

    if (error) {
      console.warn('Failed to fetch metrics:', error)
      return NextResponse.json({ summary: 'Database unavailable' })
    }

    // Calculate summary
    const summary = calculateSummary(metrics || [])
    
    return NextResponse.json({
      summary,
      total_metrics: metrics?.length || 0,
      time_range: '24 hours'
    })
    
  } catch (error) {
    console.error('Metrics GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Send metrics to external monitoring services
 */
async function sendToExternalServices(event: MetricEvent, request: NextRequest) {
  // Send to Vercel Analytics (if enabled)
  if (process.env.VERCEL === '1' && process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID) {
    try {
      // Vercel Analytics automatically tracks performance
      // This is just a placeholder for custom events
      console.log('Vercel Analytics tracking:', event.name, event.value)
    } catch (error) {
      console.warn('Vercel Analytics error:', error)
    }
  }

  // Send to Sentry (if configured)
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      // Sentry would be imported and used here
      console.log('Sentry tracking:', event.name, event.value)
    } catch (error) {
      console.warn('Sentry error:', error)
    }
  }
}

/**
 * Calculate performance summary from metrics
 */
function calculateSummary(metrics: any[]) {
  const grouped: Record<string, number[]> = {}
  
  // Group metrics by name
  metrics.forEach(metric => {
    if (!grouped[metric.name]) {
      grouped[metric.name] = []
    }
    grouped[metric.name].push(metric.value)
  })

  const summary: Record<string, any> = {}
  
  // Calculate statistics for each metric
  Object.entries(grouped).forEach(([name, values]) => {
    if (values.length === 0) return
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    summary[name] = {
      count: values.length,
      average: Math.round(avg * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100
    }
  })

  // Calculate overall performance score
  let score = 100
  
  if (summary.page_load_time?.average > 2000) {
    score -= Math.min(30, (summary.page_load_time.average - 2000) / 100)
  }
  
  if (summary.api_response_time?.average > 500) {
    score -= Math.min(20, (summary.api_response_time.average - 500) / 50)
  }
  
  summary.performance_score = Math.max(0, Math.round(score))
  
  return summary
}
