import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resourceType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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

    // Build query
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        auth.users(email)
      `, count: 'exact')

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (action) {
      query = query.eq('action', action)
    }
    if (resourceType) {
      query = query.eq('resource_type', resourceType)
    }
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) throw error

    // Get unique values for filters
    const [actionsResult, resourceTypesResult, usersResult] = await Promise.all([
      supabase.from('audit_logs').select('action').not('action', 'is', null),
      supabase.from('audit_logs').select('resource_type').not('resource_type', 'is', null),
      supabase
        .from('audit_logs')
        .select('user_id, auth.users(email)')
        .not('user_id', 'is', null)
        .limit(100)
    ])

    const actions = [...new Set(actionsResult.data?.map((a: any) => a.action) || [])]
    const resourceTypes = [...new Set(resourceTypesResult.data?.map((r: any) => r.resource_type) || [])]
    const users = usersResult.data?.map((u: any) => ({
      id: u.user_id,
      email: u.auth.users?.email
    })) || []

    return NextResponse.json({
      logs: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      filters: {
        actions,
        resourceTypes,
        users
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
