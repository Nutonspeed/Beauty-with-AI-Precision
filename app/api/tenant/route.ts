import { NextResponse } from 'next/server'
import { getAllTenants, createTenant } from '@/lib/tenant/tenant-manager'
import type { CreateTenantInput } from '@/lib/types/tenant'

export async function GET() {
  try {
    const tenants = await getAllTenants()
    return NextResponse.json({ tenants })
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
