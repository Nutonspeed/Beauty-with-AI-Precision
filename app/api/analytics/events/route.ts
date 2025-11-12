/**
 * Usage Events API Endpoint
 * POST /api/analytics/events
 * Stores usage events in the database for analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface UsageEvent {
  event: string
  category: 'feature' | 'engagement' | 'performance' | 'error'
  userId?: string
  tenantId?: string
  metadata?: Record<string, any>
  timestamp: string
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const events: UsageEvent[] = await request.json()

    // Validate input
    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      )
    }

    // Validate each event
    for (const event of events) {
      if (!event.event || !event.category || !event.timestamp) {
        return NextResponse.json(
          { error: 'Each event must have event, category, and timestamp' },
          { status: 400 }
        )
      }

      const validCategories = ['feature', 'engagement', 'performance', 'error']
      if (!validCategories.includes(event.category)) {
        return NextResponse.json(
          { error: `Invalid category: ${event.category}` },
          { status: 400 }
        )
      }
    }

    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach((cookie) => cookieStore.set(cookie))
          },
        },
      }
    )

    // Get authenticated user (optional for anonymous events)
    const { data: { user } } = await supabase.auth.getUser()

    // Prepare events for database insertion
    const dbEvents = events.map(event => ({
      event_type: event.event,
      user_id: event.userId || user?.id || null,
      properties: {
        category: event.category,
        tenantId: event.tenantId,
        sessionId: event.sessionId,
        metadata: event.metadata,
        timestamp: event.timestamp,
      },
      timestamp: event.timestamp,
    }))

    // Store events in database
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert(dbEvents)

    if (insertError) {
      console.error('Failed to store usage events:', insertError)
      return NextResponse.json(
        { error: 'Failed to store events' },
        { status: 500 }
      )
    }

    // Log successful storage
    if (process.env.NODE_ENV === 'development') {
      console.log(`Stored ${events.length} usage events`)
    }

    return NextResponse.json({
      success: true,
      stored: events.length,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Usage events API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET - Retrieve usage events (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach((cookie) => cookieStore.set(cookie))
          },
        },
      }
    )

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check user role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['super_admin', 'clinic_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const category = searchParams.get('category')
    const eventName = searchParams.get('event')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('properties->>category', category)
    }

    if (eventName) {
      query = query.eq('event_type', eventName)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (startDate) {
      query = query.gte('timestamp', startDate)
    }

    if (endDate) {
      query = query.lte('timestamp', endDate)
    }

    const { data: events, error: queryError } = await query

    if (queryError) {
      console.error('Failed to fetch usage events:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats = {
      total: events?.length || 0,
      byCategory: {} as Record<string, number>,
      byEvent: {} as Record<string, number>,
      uniqueUsers: new Set(events?.map(e => e.user_id).filter(Boolean)).size,
      dateRange: {
        start: events?.[events.length - 1]?.timestamp,
        end: events?.[0]?.timestamp,
      },
    }

    if (events) {
      events.forEach(event => {
        const category = event.properties?.category || 'unknown'
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
        stats.byEvent[event.event_type] = (stats.byEvent[event.event_type] || 0) + 1
      })
    }

    return NextResponse.json({
      success: true,
      events,
      stats,
    })

  } catch (error) {
    console.error('Usage events GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}