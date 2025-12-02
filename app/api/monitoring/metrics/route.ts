// Performance Metrics API
import { NextRequest, NextResponse } from 'next/server'
import { metricsCollector } from '@/lib/monitoring/metrics/collector'
import { alertManager } from '@/lib/monitoring/alerts/manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange')
    const type = searchParams.get('type') || 'performance'

    let start: number | undefined
    let end: number | undefined

    if (timeRange) {
      const [startStr, endStr] = timeRange.split(',')
      start = parseInt(startStr)
      end = parseInt(endStr)
    } else {
      // Default to last 24 hours
      end = Date.now()
      start = end - (24 * 60 * 60 * 1000)
    }

    let data

    switch (type) {
      case 'performance':
        data = {
          metrics: metricsCollector.getPerformanceMetrics({ start, end }),
          summary: metricsCollector.getPerformanceSummary({ start, end })
        }
        break
      
      case 'system':
        data = {
          metrics: metricsCollector.getSystemMetrics({ start, end }),
          summary: metricsCollector.getSystemSummary()
        }
        break
      
      case 'alerts':
        data = {
          active: alertManager.getActiveAlerts(),
          stats: alertManager.getAlertStats({ start, end })
        }
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data,
      timeRange: { start, end }
    })

  } catch (error) {
    console.error('Metrics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, metrics } = body

    if (type === 'performance') {
      metricsCollector.recordRequestMetrics(metrics)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Metrics POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
