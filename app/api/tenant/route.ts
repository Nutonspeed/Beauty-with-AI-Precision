import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { normalizeRole } from '@/lib/auth/role-normalize'
import { getAllTenants, createTenant } from '@/lib/tenant/tenant-manager'
import type { CreateTenantInput } from '@/lib/types/tenant'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userRow, error: userRowError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (userRowError) {
      return NextResponse.json({ error: 'Failed to load user role' }, { status: 500 })
    }

    const role = normalizeRole((userRow as any)?.role)
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tenants = await getAllTenants()
    return NextResponse.json({ tenants })
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userRow, error: userRowError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (userRowError) {
      return NextResponse.json({ error: 'Failed to load user role' }, { status: 500 })
    }

    const role = normalizeRole((userRow as any)?.role)
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json() as CreateTenantInput

    // Validate required fields
    if (!body.clinicName || !body.slug || !body.email || !body.phone || !body.plan || !body.ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const tenant = await createTenant(body)
    return NextResponse.json({ tenant }, { status: 201 })
  } catch (error) {
    console.error('Error creating tenant:', error)
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
