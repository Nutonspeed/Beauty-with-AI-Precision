import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getB2BPlans } from '@/lib/subscriptions/pricing-service'

const updateSubscriptionSchema = z.object({
  clinicId: z.string(),
  plan: z.string(), // Will validate against available plans
  status: z.enum(['active', 'trial', 'past_due', 'suspended', 'cancelled']).optional(),
  trialEndsAt: z.string().optional(),
})

// GET: List all subscriptions
export async function GET(request: NextRequest) {
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

    // Get all clinics with their subscription info
    const { data: clinics, error } = await supabase
      .from('clinics')
      .select(
        `
        id,
        name,
        slug,
        subscription_plan,
        subscription_status,
        trial_ends_at,
        is_trial,
        created_at,
        subscription_started_at,
        subscription_ends_at
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    // Enrich with plan details
    const availablePlans = await getB2BPlans()
    const planMap = new Map(availablePlans.map(p => [p.slug, p]))
    
    const subscriptions = clinics.map((clinic) => {
      const plan = planMap.get(clinic.subscription_plan)
      return {
        ...clinic,
        planDetails: plan,
        isTrialExpired: clinic.is_trial && clinic.trial_ends_at && new Date(clinic.trial_ends_at) < new Date(),
      }
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('Error in GET /api/admin/subscriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: Update subscription
export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const validation = updateSubscriptionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request', details: validation.error }, { status: 400 })
    }

    const { clinicId, plan, status, trialEndsAt } = validation.data

    // Validate plan exists in database
    const availablePlans = await getB2BPlans()
    const planExists = availablePlans.some(p => p.slug === plan)
    
    if (!planExists) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      subscription_plan: plan,
      updated_at: new Date().toISOString(),
    }

    if (status) {
      updateData.subscription_status = status
    }

    if (trialEndsAt) {
      updateData.trial_ends_at = trialEndsAt
      updateData.is_trial = true
    }

    if (status === 'trial') {
      updateData.is_trial = true
    }

    if (status === 'active') {
      updateData.is_trial = false
      updateData.trial_ends_at = null
    }

    if (status === 'past_due' || status === 'suspended' || status === 'cancelled') {
      updateData.is_trial = false
    }

    // Update subscription status to 'active' if changing from trial
    if (plan && status === 'active') {
      updateData.subscription_started_at = new Date().toISOString()
      updateData.is_trial = false
    }

    // Update clinic
    const { data: clinic, error: updateError } = await supabase
      .from('clinics')
      .update(updateData)
      .eq('id', clinicId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'subscription_updated',
      resource_type: 'clinic',
      resource_id: clinicId,
      metadata: {
        plan,
        status,
        trialEndsAt,
      },
    })

    return NextResponse.json({ subscription: clinic })
  } catch (error) {
    console.error('Error in PATCH /api/admin/subscriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
