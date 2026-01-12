import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('center_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[center/plan] Failed to load user profile', profileError)
    }

    const centerId = profile?.center_id
    if (!centerId) {
      return NextResponse.json(
        { error: 'No center associated with current user' },
        { status: 400 },
      )
    }

    const { data: center, error: centerError } = await supabase
      .from('centers')
      .select('id, max_sales_users')
      .eq('id', centerId)
      .maybeSingle()

    if (centerError || !center) {
      console.error('[center/plan] Failed to load center', centerError)
      return NextResponse.json({ error: 'Center not found' }, { status: 404 })
    }

    const maxSalesUsers = (center as any).max_sales_users ?? 1

    let planId: 'basic' | 'pro' | 'enterprise' = 'basic'
    if (maxSalesUsers >= 3 && maxSalesUsers < 10) {
      planId = 'pro'
    } else if (maxSalesUsers >= 10 || maxSalesUsers === 0) {
      // 0 or very high can be treated as enterprise/unlimited
      planId = 'enterprise'
    }

    return NextResponse.json({ planId, maxSalesUsers })
  } catch (error) {
    console.error('[center/plan] Unexpected error', error)
    return NextResponse.json({ error: 'Failed to load center plan' }, { status: 500 })
  }
}
