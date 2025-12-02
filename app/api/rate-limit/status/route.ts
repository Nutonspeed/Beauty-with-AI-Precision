import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/rate-limit/middleware/rate-limit'
import { rateLimitLogger } from '@/lib/rate-limit/middleware/logger'
import { StorageFactory } from '@/lib/rate-limit/storage/storage'

// GET /api/rate-limit/status - Get rate limiting status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'general'

    // Get rate limit status
    const storage = await StorageFactory.create()
    const key = `rate_limit_status:${session.user.id}:${category}`
    
    const status = await storage.get(key)
    let rateLimitInfo = {
      limit: 60,
      remaining: 60,
      resetTime: Date.now() + 60000,
      windowMs: 60000
    }

    if (status) {
      const data = JSON.parse(status)
      rateLimitInfo = {
        limit: data.limit,
        remaining: Math.max(0, data.limit - data.count),
        resetTime: data.resetTime,
        windowMs: data.windowMs
      }
    }

    return NextResponse.json({
      success: true,
      category,
      ...rateLimitInfo
    })

  } catch (error) {
    rateLimitLogger.logError(error as Error, {
      action: 'get_rate_limit_status',
      url: request.url
    })
    
    return NextResponse.json({ 
      error: 'Failed to get rate limit status' 
    }, { status: 500 })
  }
}

// POST /api/rate-limit/config - Update rate limit configuration (admin only)
export async function POST(request: NextRequest) {
  return withRateLimit(async (req: NextRequest) => {
    try {
      const supabase = await createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.user || !['super_admin', 'admin'].includes(session.user.user_metadata?.role || '')) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }

      const { configs } = await req.json()
      
      // Validate configuration
      if (!configs || typeof configs !== 'object') {
        return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 })
      }

      // Store configuration (this would go to your config storage)
      // For now, just log it
      rateLimitLogger.logInfo('Rate limit configuration updated', {
        userId: session.user.id,
        configs
      })

      return NextResponse.json({
        success: true,
        message: 'Rate limit configuration updated successfully'
      })

    } catch (error) {
      rateLimitLogger.logError(error as Error, {
        action: 'update_rate_limit_config',
        url: req.url
      })
      
      return NextResponse.json({ 
        error: 'Failed to update rate limit configuration' 
      }, { status: 500 })
    }
  })(request)
}
