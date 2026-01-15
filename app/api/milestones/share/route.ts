
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { milestone_id } = await req.json()

    if (!milestone_id) {
      return NextResponse.json({ error: 'milestone_id is required' }, { status: 400 })
    }

    // 1. Generate unique share token
    const shareToken = uuidv4().replace(/-/g, '') // Simple unique string

    // 2. Update milestone with share info
    const { error: updateError } = await supabase
      .from('progress_milestones')
      .update({
        is_shared: true,
        share_token: shareToken,
        share_expires_at: null // Milestones don't expire for now
      })
      .eq('id', milestone_id)
      .eq('customer_id', user.id) // Security check

    if (updateError) {
      console.error('Milestone share error:', updateError)
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      share_token: shareToken,
      share_url: `${process.env.NEXT_PUBLIC_APP_URL}/share/v/${shareToken}`
    })

  } catch (error) {
    console.error('Milestone Share API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
