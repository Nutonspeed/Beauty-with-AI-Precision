import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinicId')

    // Check if user is super admin or clinic admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build query
    let query = supabase
      .from('clinic_feature_flags')
      .select('*')

    // Filter by clinic if specified
    if (clinicId) {
      // Only super admins can view other clinics
      if (userData.role !== 'super_admin' && userData.clinic_id !== clinicId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      query = query.eq('clinic_id', clinicId)
    } else if (userData.role !== 'super_admin') {
      // Non-super admins can only view their own clinic
      query = query.eq('clinic_id', userData.clinic_id)
    }

    const { data, error } = await query.order('clinic_name', { ascending: true })

    if (error) throw error

    // Group by clinic
    const groupedFlags = data?.reduce((acc: any, flag: any) => {
      if (!acc[flag.clinic_id]) {
        acc[flag.clinic_id] = {
          clinic_id: flag.clinic_id,
          clinic_name: flag.clinic_name,
          features: {}
        }
      }
      acc[flag.clinic_id].features[flag.feature_key] = {
        id: flag.id,
        is_enabled: flag.is_enabled,
        metadata: flag.metadata,
        updated_at: flag.updated_at
      }
      return acc
    }, {})

    return NextResponse.json({
      clinics: Object.values(groupedFlags || {}),
      total: data?.length || 0
    })
  } catch (error) {
    console.error('Error fetching feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { clinicId, featureKey, isEnabled, metadata } = body

    if (!clinicId || !featureKey) {
      return NextResponse.json(
        { error: 'clinicId and featureKey are required' },
        { status: 400 }
      )
    }

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
      return NextResponse.json({ error: 'Forbidden - Super admin only' }, { status: 403 })
    }

    // Update or insert feature flag
    const { data, error } = await supabase
      .from('feature_flags')
      .upsert({
        clinic_id: clinicId,
        feature_key: featureKey,
        is_enabled: isEnabled,
        metadata: metadata || {},
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'feature_flag_updated',
      resource_type: 'feature_flag',
      resource_id: data.id,
      metadata: {
        clinicId,
        featureKey,
        isEnabled,
        metadata
      },
    })

    return NextResponse.json({ featureFlag: data })
  } catch (error) {
    console.error('Error updating feature flag:', error)
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { clinicIds, featureKey, isEnabled, metadata } = body

    if (!clinicIds || !Array.isArray(clinicIds) || !featureKey) {
      return NextResponse.json(
        { error: 'clinicIds array and featureKey are required' },
        { status: 400 }
      )
    }

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
      return NextResponse.json({ error: 'Forbidden - Super admin only' }, { status: 403 })
    }

    // Bulk update feature flags
    const updates = clinicIds.map((clinicId: string) => ({
      clinic_id: clinicId,
      feature_key: featureKey,
      is_enabled: isEnabled,
      metadata: metadata || {},
      updated_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('feature_flags')
      .upsert(updates)
      .select()

    if (error) throw error

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'feature_flags_bulk_updated',
      resource_type: 'feature_flag',
      metadata: {
        clinicIds,
        featureKey,
        isEnabled,
        count: clinicIds.length
      },
    })

    return NextResponse.json({ 
      success: true,
      updatedCount: data.length,
      featureFlags: data
    })
  } catch (error) {
    console.error('Error bulk updating feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to update feature flags' },
      { status: 500 }
    )
  }
}
