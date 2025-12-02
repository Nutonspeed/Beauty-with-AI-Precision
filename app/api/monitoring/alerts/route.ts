// Alerts API
import { NextRequest, NextResponse } from 'next/server'
import { alertManager } from '@/lib/monitoring/alerts/manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const limit = searchParams.get('limit')

    let alerts

    switch (status) {
      case 'active':
        alerts = alertManager.getActiveAlerts()
        break
      
      case 'history':
        alerts = alertManager.getAlertHistory(limit ? parseInt(limit) : undefined)
        break
      
      case 'stats':
        alerts = alertManager.getAlertStats()
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid status parameter' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      alerts
    })

  } catch (error) {
    console.error('Alerts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, severity, message, metadata } = body

    const alert = await alertManager.createAlert({
      type,
      severity,
      message,
      service: 'beauty-ai-precision',
      metadata: metadata || {}
    })

    return NextResponse.json({
      success: true,
      alert
    })

  } catch (error) {
    console.error('Alerts POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId, resolvedBy } = body

    const alert = alertManager.resolveAlert(alertId, resolvedBy)

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      alert
    })

  } catch (error) {
    console.error('Alerts PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
