import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get total clinics count
    const { count: totalClinics } = await supabase
      .from('clinics')
      .select('*', { count: 'exact', head: true })

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('clinics')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')

    // Get trial subscriptions
    const { count: trialSubscriptions } = await supabase
      .from('clinics')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'trial')
      .eq('is_trial', true)

    // Get expired trials
    const { count: expiredTrials } = await supabase
      .from('clinics')
      .select('*', { count: 'exact', head: true })
      .eq('is_trial', true)
      .lt('trial_ends_at', new Date().toISOString())

    // Calculate revenue
    // Get all active subscriptions with their plans
    const { data: activeClinics } = await supabase
      .from('clinics')
      .select('subscription_plan')
      .eq('subscription_status', 'active')

    // Define pricing (in a real app, this would come from a pricing table)
    const pricing = {
      starter: { monthly: 999, yearly: 9990 },
      professional: { monthly: 2999, yearly: 29990 },
      enterprise: { monthly: 9999, yearly: 99990 },
    }

    let monthlyRevenue = 0
    let annualRevenue = 0

    activeClinics?.forEach((clinic) => {
      const plan = pricing[clinic.subscription_plan as keyof typeof pricing]
      if (plan) {
        monthlyRevenue += plan.monthly
        annualRevenue += plan.yearly
      }
    })

    const stats = {
      totalClinics: totalClinics || 0,
      activeSubscriptions: activeSubscriptions || 0,
      trialSubscriptions: trialSubscriptions || 0,
      expiredTrials: expiredTrials || 0,
      monthlyRevenue,
      annualRevenue,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching subscription stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
