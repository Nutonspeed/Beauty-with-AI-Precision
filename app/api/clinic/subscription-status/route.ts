import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSubscriptionStatus } from '@/lib/subscriptions/check-subscription'

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userProfile, error: userProfileErr } = await supabase
      .from('users')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single()

    if (userProfileErr) {
      console.error('[clinic/subscription-status] Failed to fetch user profile:', userProfileErr)
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }

    if (!userProfile?.clinic_id) {
      return NextResponse.json({ error: 'No clinic associated with user' }, { status: 400 })
    }

    const status = await getSubscriptionStatus(userProfile.clinic_id)

    return NextResponse.json({
      clinicId: userProfile.clinic_id,
      role: userProfile.role,
      subscription: {
        isActive: status.isActive,
        isTrial: status.isTrial,
        isTrialExpired: status.isTrialExpired,
        subscriptionStatus: status.subscriptionStatus,
        plan: status.plan,
        message: status.message,
        daysRemaining: status.daysRemaining,
        trialDaysRemaining: status.trialDaysRemaining,
        withinLimits: status.withinLimits,
      },
    })
  } catch (error) {
    console.error('[clinic/subscription-status] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
