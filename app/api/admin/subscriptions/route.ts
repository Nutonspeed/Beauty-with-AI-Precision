import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 2900,
    maxUsers: 5,
    maxCustomersPerMonth: 100,
    maxStorageGB: 10,
    features: ['Basic AI Analysis', 'Email Support', 'Mobile App'],
  },
  professional: {
    name: 'Professional',
    price: 9900,
    maxUsers: 20,
    maxCustomersPerMonth: -1, // unlimited
    maxStorageGB: 50,
    features: [
      'Advanced AI Analysis',
      'Priority Support',
      'Custom Branding',
      'API Access',
      'Advanced Reports',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 29900,
    maxUsers: -1, // unlimited
    maxCustomersPerMonth: -1, // unlimited
    maxStorageGB: 200,
    features: [
      'All Professional Features',
      'Dedicated Support',
      'Custom Integration',
      'SLA Guarantee',
      'Multi-location',
    ],
  },
} as const

const updateSubscriptionSchema = z.object({
  clinicId: z.string(),
  plan: z.enum(['starter', 'professional', 'enterprise']),
  status: z.enum(['active', 'trial', 'suspended', 'cancelled']).optional(),
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
    const subscriptions = clinics.map((clinic) => {
      const plan = SUBSCRIPTION_PLANS[clinic.subscription_plan as keyof typeof SUBSCRIPTION_PLANS]
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
