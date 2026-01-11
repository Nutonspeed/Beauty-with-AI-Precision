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
      .select('clinic_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[clinic/plan] Failed to load user profile', profileError)
    }

    const clinicId = profile?.clinic_id
    if (!clinicId) {
      return NextResponse.json(
        { error: 'No clinic associated with current user' },
        { status: 400 },
      )
    }

    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, max_sales_users')
      .eq('id', clinicId)
      .maybeSingle()

    if (clinicError || !clinic) {
      console.error('[clinic/plan] Failed to load clinic', clinicError)
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    const maxSalesUsers = (clinic as any).max_sales_users ?? 1

    let planId: 'basic' | 'pro' | 'enterprise' = 'basic'
    if (maxSalesUsers >= 3 && maxSalesUsers < 10) {
      planId = 'pro'
    } else if (maxSalesUsers >= 10 || maxSalesUsers === 0) {
      // 0 or very high can be treated as enterprise/unlimited
      planId = 'enterprise'
    }

    return NextResponse.json({ planId, maxSalesUsers })
  } catch (error) {
    console.error('[clinic/plan] Unexpected error', error)
    return NextResponse.json({ error: 'Failed to load clinic plan' }, { status: 500 })
  }
}
