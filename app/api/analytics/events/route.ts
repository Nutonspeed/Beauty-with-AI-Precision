/**
 * Usage Events API Endpoint
 * POST /api/analytics/events
 * Stores usage events in the database for analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { withPublicAccess, withAdminAuth } from '@/lib/auth/middleware'

interface UsageEvent {
  event: string
  category: 'feature' | 'engagement' | 'performance' | 'error'
  userId?: string
  tenantId?: string
  metadata?: Record<string, any>
  timestamp: string
  sessionId?: string
}

async function postHandler(request: NextRequest) {
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
async function getHandler(request: NextRequest, user: any) {
  try {
    // Create Supabase client with service role for admin access
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    )

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)
    const offset = parseInt(searchParams.get('offset') || '0')
    const eventType = searchParams.get('eventType')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (eventType) {
      query = query.eq('event_type', eventType)
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

    const { data: events, error, count } = await query

    if (error) {
      console.error('Failed to retrieve usage events:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve events' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      events: events || [],
      total: count || 0,
      limit,
      offset,
    })

  } catch (error) {
    console.error('Usage events GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withPublicAccess(postHandler);
export const GET = withAdminAuth(getHandler);
