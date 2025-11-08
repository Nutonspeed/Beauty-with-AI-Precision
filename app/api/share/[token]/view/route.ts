import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractViewMetadata } from '@/lib/utils/report-sharing'

export const runtime = 'edge'

interface RouteContext {
  params: {
    token: string
  }
}

/**
 * POST /api/share/[token]/view
 * Track a view for a shared analysis report
 * No authentication required (public endpoint)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { token } = params

    // Validate token format
    if (!/^[A-Za-z0-9_-]{32}$/.test(token)) {
      return NextResponse.json(
        { success: false, message: 'Invalid share token format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify share token exists and is valid
    const { data: analysis, error: analysisError } = await supabase
      .from('skin_analyses')
      .select('id, is_shared, share_expires_at')
      .eq('share_token', token)
      .single()

    if (analysisError || !analysis) {
      console.error('[ShareViewAPI] Share token not found:', token)
      return NextResponse.json(
        { success: false, message: 'Share token not found' },
        { status: 404 }
      )
    }

    // Check if share is active
    if (!analysis.is_shared) {
      return NextResponse.json(
        { success: false, message: 'Share link has been revoked' },
        { status: 403 }
      )
    }

    // Check if share has expired
    if (analysis.share_expires_at) {
      const expiresAt = new Date(analysis.share_expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { success: false, message: 'Share link has expired' },
          { status: 410 }
        )
      }
    }

    // Extract view metadata from request
    const metadata = extractViewMetadata(request)

    // Check if share_views table exists
    // If not, we'll silently skip tracking (backwards compatibility)
    try {
      // Insert view record
      const { error: insertError } = await supabase
        .from('share_views')
        .insert({
          share_token: token,
          viewed_at: new Date().toISOString(),
          ip_address: metadata.ip_address,
          user_agent: metadata.user_agent,
          referrer: metadata.referrer,
        })

      if (insertError) {
        // Log error but don't fail the request
        console.error('[ShareViewAPI] Error inserting view record:', insertError)
        
        // If table doesn't exist, return success anyway (backwards compatibility)
        if (insertError.code === '42P01') {
          console.warn('[ShareViewAPI] share_views table does not exist yet')
          return NextResponse.json({
            success: true,
            message: 'View tracked (table pending creation)',
            tracked: false,
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: 'View tracked successfully',
        tracked: true,
      })
    } catch (trackingError) {
      console.error('[ShareViewAPI] Error tracking view:', trackingError)
      
      // Don't fail the request if tracking fails
      return NextResponse.json({
        success: true,
        message: 'View tracking skipped',
        tracked: false,
      })
    }
  } catch (error) {
    console.error('[ShareViewAPI] Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
